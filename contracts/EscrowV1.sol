// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
//import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
//import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

import "@openzeppelin/contracts-upgradeable/utils/cryptography/signers/SignerECDSAUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/cryptography/EIP712Upgradeable.sol";

contract EscrowV1 is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable, 
EIP712Upgradeable {

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
        address paymentToken;
        uint256 total;
        uint256 taxes;
        uint256 platformFee;
        uint256 createdAt;
        OrderState state;
    } 

    struct OrderPayload {
    bytes16 orderId;        // uint128
    address buyer;          // buyer address
    address seller;         // seller address
    address paymentToken;   // ERC20 or address(0)
    uint256 total;          // total amount paid
    uint256 taxes;          // absolute tax amount
    uint256 platformFee;    // absolute platform fee
    uint256 deadline;       // expiry
}

    /*//////////////////////////////////////////////////////////////
                               Storage
    //////////////////////////////////////////////////////////////*/
    mapping(bytes16 => Order) public orders;
    mapping(bytes16 => bool) public usedOrderIds;
    uint256 public ordersCount;
    address public serverSigner;
    address public platformTaxTreasury;
    address public platformFeeTreasury;
    uint24  public releaseDelay;
    ContractState public contractState;
    // Storage gap for future upgrades
    uint256[50] private __gap;
    

    /*//////////////////////////////////////////////////////////////
                               Events
    //////////////////////////////////////////////////////////////*/
    event EscrowRegistered(
        bytes16 indexed orderId,
        address indexed buyer,
        OrderState indexed state,
        address seller
    );

    event OrderReleased(bytes16 indexed orderId, address indexed seller, uint256 sellerAmount);
    event OrderDisputed(bytes16 indexed orderId);
    event OrderRefunded(bytes16 indexed orderId, address indexed buyer, uint256 amount);
    event ContractStateChanged(ContractState newState);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(
        address _serverSigner,
        address _platformTaxTreasury,
        address _platformFeeTreasury,        
        uint24 _releaseDelay
    ) external initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();
        __EIP712_init("MYAPP_AMOY_ESCROW_ORDERS", "1");

        require(_serverSigner != address(0), "Invalid server signer");
        require(_platformTaxTreasury != address(0), "Invalid taxes address");
        require(_platformFeeTreasury != address(0), "Invalid fees address");

        serverSigner = _serverSigner;
        platformTaxTreasury = _platformTaxTreasury;
        platformFeeTreasury = _platformFeeTreasury;
        releaseDelay = _releaseDelay;
        contractState = ContractState.Active;
    }

    


    // Internal helper to verify signature
    using ECDSA for bytes32;
    function _verifyServerSignature(bytes32 _digest, bytes calldata _signature) internal view returns (bool) {                
        return _digest.recover(_signature) == serverSigner;
    }

    /*//////////////////////////////////////////////////////////////
                               Modifiers
    //////////////////////////////////////////////////////////////*/
    modifier onlyActive() {
        require(contractState == ContractState.Active, "Contract deprecated");
        _;
    }

    /*//////////////////////////////////////////////////////////////
                               Owner
    //////////////////////////////////////////////////////////////*/
    function setContractState(ContractState newState) external onlyOwner {
        contractState = newState;
        emit ContractStateChanged(newState);
    }

    /*//////////////////////////////////////////////////////////////
                               Core
    //////////////////////////////////////////////////////////////*/



    bytes32 constant ORDER_PAYLOAD_TYPE_HASH = keccak256(
        "OrderPayload(bytes128 orderId,address buyer,address seller,address paymentToken,uint256 total,uint256 taxes,uint256 platformFee,uint256 deadline)"
    );

    // Internal helper to hash payload
    function _hashEscrowOrderPayload(OrderPayload calldata orderPayload) internal pure returns (bytes32) {
        return keccak256(
            abi.encode(
                ORDER_PAYLOAD_TYPE_HASH,
                orderPayload.orderId,
                orderPayload.buyer,
                orderPayload.seller,
                orderPayload.paymentToken,
                orderPayload.total,
                orderPayload.taxes,
                orderPayload.platformFee,
                orderPayload.deadline
            )
        );
    }


    function registerEscrow(
      OrderPayload calldata orderPayload, 
      bytes calldata signature
    ) external payable nonReentrant onlyActive {
        require(msg.value > 0, "Invalid amount");
        //require(orders[orderId].state == OrderState.None, "Order exists");

        // 1️⃣ Check signature
        bytes32 digest = _hashTypedDataV4(_hashEscrowOrderPayload(orderPayload));
        address signer = digest.recover(signature);
        require(signer == serverSigner, "Invalid signature");

        // 2️⃣ Check deadline
        require(block.timestamp <= orderPayload.deadline, "Order expired");
        
        // 3️⃣ Prevent order replay
        require(!usedOrderIds[orderPayload.orderId], "Order already registered");
        usedOrderIds[orderPayload.orderId] = true; // ✅ stored in contract storage

        // 4️⃣ Check value
        require(msg.value == orderPayload.total, "Pay Value is wrong");

        // 5️⃣ Store the order
        orders[orderPayload.orderId] = Order({
            buyer: orderPayload.buyer,
            seller: orderPayload.seller,
            paymentToken: orderPayload.paymentToken,
            total: orderPayload.total,
            taxes: orderPayload.taxes,
            platformFee: orderPayload.platformFee,
            createdAt: block.timestamp,
            state: OrderState.Registered
        });

        // 6️⃣ Increment counter
        ordersCount += 1;

        // 7️⃣ Outputevent
        emit EscrowRegistered(orderPayload.orderId, msg.sender, OrderState.Registered, orderPayload.seller);
    }

    function confirmDelivery(bytes16 orderId) external nonReentrant onlyActive {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Not buyer");
        require(o.state == OrderState.Registered, "Cannot release");

        _release(orderId);
    }

    function releaseAfterTimeout(bytes16 orderId) external nonReentrant {
        Order storage o = orders[orderId];
        require(o.state == OrderState.Registered, "Cannot release");
        require(block.timestamp >= o.createdAt + releaseDelay, "Too early");

        _release(orderId);
    }

    function openDispute(bytes16 orderId) external onlyActive {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Not buyer");
        require(o.state == OrderState.Registered, "Cannot dispute");

        o.state = OrderState.Disputed;
        emit OrderDisputed(orderId);
    }

    function resolveDispute(bytes16 orderId, bool refundBuyer)
        external
        onlyOwner
        nonReentrant
    {
        Order storage o = orders[orderId];
        require(o.state == OrderState.Disputed, "No dispute");

        if (refundBuyer) {
            o.state = OrderState.Refunded;
            payable(o.buyer).transfer(o.total);
            emit OrderRefunded(orderId, o.buyer, o.total);
        } else {
            _release(orderId);
        }
    }

    /*//////////////////////////////////////////////////////////////
                               Internals
    //////////////////////////////////////////////////////////////*/
    function _release(bytes16 orderId) internal {
        Order storage o = orders[orderId];
        require(
            o.state == OrderState.Registered || o.state == OrderState.Disputed,
            "Cannot release"
        );

        o.state = OrderState.Released;

        uint256 netAmount = o.total - o.taxes - o.platformFee;

        if (o.paymentToken == address(0)) {
            // Native coin
            payable(platformTaxTreasury).transfer(o.taxes);
            payable(platformFeeTreasury).transfer(o.platformFee);
            payable(o.seller).transfer(netAmount);
        } else {
            // ERC20 token
            IERC20(o.paymentToken).transfer(platformTaxTreasury, o.taxes);
            IERC20(o.paymentToken).transfer(platformFeeTreasury, o.platformFee);
            IERC20(o.paymentToken).transfer(o.seller, netAmount);
        }


        // Emit event
        emit OrderReleased(orderId, o.seller, netAmount);

    }

}
