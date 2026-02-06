// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

/*//////////////////////////////////////////////////////////////
                            OpenZeppelin
//////////////////////////////////////////////////////////////*/

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/*//////////////////////////////////////////////////////////////
                            Escrow
//////////////////////////////////////////////////////////////*/

contract Escrow is
    Initializable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable,
    EIP712Upgradeable
{
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    /*//////////////////////////////////////////////////////////////
                                Enums
    //////////////////////////////////////////////////////////////*/

    enum OrderState {
        None,
        Registered,
        Released,
        Disputed,
        Refunded
    }

    enum ContractState {
        Active,
        Deprecated
    }

    /*//////////////////////////////////////////////////////////////
                                Structs
    //////////////////////////////////////////////////////////////*/

    struct Order {
        address buyer;
        address seller;
        address token; // address(0) = native
        uint256 sellerPayment;
        uint256 platformFee;
        uint256 taxes;
        uint256 createdAt;
        OrderState state;
    }
    struct ReleasePayment{
        string message;
        string orderId;
        string signatureDateTime;
    }

    struct OrderPayload {
        bytes32 orderId;
        address buyer;
        address seller;
        address token;
        uint256 total;
        uint256 taxes;
        uint256 platformFee;
        uint256 deadline;
    }

    /*//////////////////////////////////////////////////////////////
                                Storage
    //////////////////////////////////////////////////////////////*/

    mapping(bytes32 => Order) public orders;
    mapping(bytes32 => bool) public orderNonceUsed;
    mapping(bytes32 => mapping(uint256 => bool)) public releaseNonceUsed;


    uint256 public ordersCount;
    address public serverSigner;
    address public platformTaxTreasury;
    address public platformFeeTreasury;
    uint24  public releaseDelay;
    ContractState public contractState;

    uint256[50] private __gap;

    /*//////////////////////////////////////////////////////////////
                                Events
    //////////////////////////////////////////////////////////////*/

    event EscrowRegistered(
        bytes32 indexed orderId,
        address indexed buyer,
        OrderState indexed state,
        address seller
    );

    event OrderReleased(bytes32 indexed orderId, address indexed seller, uint256 sellerAmount);
    event OrderDisputed(bytes32 indexed orderId);
    event OrderRefunded(bytes32 indexed orderId, address indexed buyer, uint256 amount);
    event ContractStateChanged(ContractState newState);

    /*//////////////////////////////////////////////////////////////
                            Constructor / Init
    //////////////////////////////////////////////////////////////*/

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _serverSigner,
        address _platformTaxTreasury,
        address _platformFeeTreasury,
        uint24 _releaseDelay
    ) external virtual initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __EIP712_init("MYAPP_ESCROW_ORDERS", "1");

        require(_serverSigner != address(0), "Invalid signer");
        require(_platformTaxTreasury != address(0), "Invalid tax treasury");
        require(_platformFeeTreasury != address(0), "Invalid fee treasury");

        serverSigner = _serverSigner;
        platformTaxTreasury = _platformTaxTreasury;
        platformFeeTreasury = _platformFeeTreasury;
        releaseDelay = _releaseDelay;
        contractState = ContractState.Active;
    }

    /*//////////////////////////////////////////////////////////////
                                Modifiers
    //////////////////////////////////////////////////////////////*/

    modifier onlyActive() {
        require(contractState == ContractState.Active, "Contract deprecated");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                            Owner Controls
    //////////////////////////////////////////////////////////////*/

    function setContractState(ContractState newState)
        external
        virtual
        onlyOwner
    {
        contractState = newState;
        emit ContractStateChanged(newState);
    }

    /*//////////////////////////////////////////////////////////////
                        EIP712 / Signature
    //////////////////////////////////////////////////////////////*/
    // EIP-712 typehash
    bytes32 private constant RELEASE_TYPEHASH = keccak256(
        "ReleasePayment(string message, string orderId,string signatureDateTime)"
    );
    bytes32 private constant ORDER_PAYLOAD_TYPEHASH = keccak256(
        "OrderPayload(bytes32 orderId,address buyer,address seller,address token,uint256 total,uint256 taxes,uint256 platformFee,uint256 deadline)"
    );

    function _hashEscrowOrderPayload(OrderPayload calldata payload)
        internal
        pure
        virtual
        returns (bytes32)
    {
        return keccak256(
            abi.encode(
                ORDER_PAYLOAD_TYPEHASH,
                payload.orderId,
                payload.buyer,
                payload.seller,
                payload.token,
                payload.total,
                payload.taxes,
                payload.platformFee,
                payload.deadline
            )
        );
    }

    function _verifyServerSignature(
        OrderPayload calldata payload,
        bytes calldata signature
    ) internal view virtual returns (bool) {
        bytes32 digest = _hashTypedDataV4(_hashEscrowOrderPayload(payload));
        return digest.recover(signature) == serverSigner;
    }

    /*//////////////////////////////////////////////////////////////
                            Core Logic
    //////////////////////////////////////////////////////////////*/

    function registerEscrow(
        OrderPayload calldata payload,
        bytes calldata signature
    )
        external
        payable
        virtual
        nonReentrant
        onlyActive
    {
        require(_verifyServerSignature(payload, signature), "Invalid signature");
        require(block.timestamp <= payload.deadline, "Order expired");
        require(!orderNonceUsed[payload.orderId], "Order already used");

        // Payment handling
        if (payload.token == address(0)) {
            require(msg.value == payload.total, "Incorrect ETH amount");
        } else {
            require(msg.value == 0, "ETH not accepted");
            IERC20(payload.token).safeTransferFrom(
                msg.sender,
                address(this),
                payload.total
            );
        }
        /*
        orders[payload.orderId] = Order({
            buyer: payload.buyer,
            seller: payload.seller,
            token: payload.token,
            total: payload.total,
            taxes: payload.taxes,
            platformFee: payload.platformFee,
            createdAt: block.timestamp,
            state: OrderState.Registered
        });*/

        orderNonceUsed[payload.orderId] = true;
        ordersCount += 1;

        emit EscrowRegistered(
            payload.orderId,
            msg.sender,
            OrderState.Registered,
            payload.seller
        );
    }

    function confirmDelivery(bytes32 orderId)
        external
        virtual
        nonReentrant
        onlyActive
    {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Not buyer");
        require(o.state == OrderState.Registered, "Invalid state");

        _release(orderId);
    }

    function releaseFunds(
            string calldata message,
            string calldata orderId,
            string calldata signatureDateTime,
            bytes calldata signature
    ) 
    external virtual nonReentrant onlyActive
    {
        bytes32 key = _uuidToBytes32Safe(orderId);

        Order storage o = orders[key];

        require(o.state != OrderState.Released, "Order already released!");

        // Case 1: release with buyer signature
        if (signature.length > 0) {

            // Compute EIP-712 struct hash
            bytes32 structHash = keccak256(
                abi.encode(
                    RELEASE_TYPEHASH,
                    keccak256(bytes(message)),
                    keccak256(bytes(orderId)),
                    keccak256(bytes(signatureDateTime))
                )
            );

            // Compute EIP-712 digest
            bytes32 digest = _hashTypedDataV4(structHash);

            // Recover signer
            address signer = ECDSA.recover(digest, signature);

            // Verify signer is the buyer
            require(signer == o.buyer, "Invalid buyer signature");

            _executePayment(o);
            return;
        }

        // Case 2: automatic release after 3 days
        require(block.timestamp >= o.createdAt + 3 days, "Release not allowed yet");
        _executePayment(o);
    }
    // -----------------------------
    // Helper: string (32-char UUID) → bytes32
    // -----------------------------
    function _uuidToBytes32Safe(string memory uuid) internal pure returns (bytes32 result) {
        bytes memory b = bytes(uuid);

        require(b.length == 36, "Order id must be 36 chars");

        bytes memory tmp = new bytes(32);
        uint j = 0;
        for (uint i = 0; i < 36; i++) {
            if (b[i] != "-") {
                tmp[j++] = b[i];
            }
        }

        assembly {
            result := mload(add(tmp, 32))
        }
    }


    // Internal function
    function _executePayment(Order storage o) 
    internal 
    {
        o.state = OrderState.Released;

        bool success;

        if (o.sellerPayment != 0) {
            success = IERC20(o.token).trySafeTransfer(o.seller, o.sellerPayment);
            require(success, "Payment to seller failed");
        }
        
        if (o.platformFee != 0) {
            success = IERC20(o.token).trySafeTransfer(platformFeeTreasury, o.platformFee);
            require(success, "Payment to platform fee treasury failed");
        }

        if (o.taxes != 0) {
            success = IERC20(o.token).trySafeTransfer(platformTaxTreasury, o.taxes);
            require(success, "Payment to platform taxes treasury failed");
        }

    }

    function _calculateTotal(Order memory o) internal pure returns (uint256) {
        return o.sellerPayment + o.platformFee + o.taxes;
    }


    

    function releaseAfterTimeout(bytes32 orderId)
        external
        virtual
        nonReentrant
    {
        Order storage o = orders[orderId];
        require(o.state == OrderState.Registered, "Invalid state");
        require(block.timestamp >= o.createdAt + releaseDelay, "Too early");

        _release(orderId);
    }

    function openDispute(bytes32 orderId)
        external
        virtual
        onlyActive
    {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Not buyer");
        require(o.state == OrderState.Registered, "Invalid state");

        o.state = OrderState.Disputed;
        emit OrderDisputed(orderId);
    }

    function resolveDispute(bytes32 orderId, bool refundBuyer)
        external
        virtual
        onlyOwner
        nonReentrant
    {
        Order storage o = orders[orderId];
        require(o.state == OrderState.Disputed, "No dispute");

        if (refundBuyer) {
            o.state = OrderState.Refunded;
            _refund(o);
            emit OrderRefunded(orderId, o.buyer, _calculateTotal(o));
        } else {
            _release(orderId);
        }
    }

    /*//////////////////////////////////////////////////////////////
                            Internals
    //////////////////////////////////////////////////////////////*/

    function _refund(Order storage o)
        internal
        virtual
    {
        if (o.token == address(0)) {
            payable(o.buyer).transfer(_calculateTotal(o));
        } else {
            IERC20(o.token).safeTransfer(o.buyer, _calculateTotal(o));
        }
    }

    function _release(bytes32 orderId)
        internal
        virtual
    {
        Order storage o = orders[orderId];
        require(
            o.state == OrderState.Registered || o.state == OrderState.Disputed,
            "Cannot release"
        );

        o.state = OrderState.Released;

        uint256 netAmount = _calculateTotal(o) - o.taxes - o.platformFee;

        if (o.token == address(0)) {
            payable(platformTaxTreasury).transfer(o.taxes);
            payable(platformFeeTreasury).transfer(o.platformFee);
            payable(o.seller).transfer(netAmount);
        } else {
            IERC20 token = IERC20(o.token);
            token.safeTransfer(platformTaxTreasury, o.taxes);
            token.safeTransfer(platformFeeTreasury, o.platformFee);
            token.safeTransfer(o.seller, netAmount);
        }

        emit OrderReleased(orderId, o.seller, netAmount);
    }
}
