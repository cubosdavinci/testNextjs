// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract EscrowV1 is Initializable, OwnableUpgradeable, ReentrancyGuardUpgradeable {

    /*//////////////////////////////////////////////////////////////
                               Enums
    //////////////////////////////////////////////////////////////*/
    enum OrderState {
        None,
        Created,
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
        uint256 amount;   // total ETH paid by buyer (price + tax)
        uint16  taxBps;   // tax rate (e.g. 100 = 1%)
        uint256 createdAt;
        OrderState state;
    }

    /*//////////////////////////////////////////////////////////////
                               Storage
    //////////////////////////////////////////////////////////////*/
    mapping(bytes16 => Order) public orders;
    address public serverSigner;
    address public platformTreasury;
    uint16  public platformFeeBps;
    uint24  public releaseDelay;

    ContractState public contractState;

    /*//////////////////////////////////////////////////////////////
                               Events
    //////////////////////////////////////////////////////////////*/
    event EscrowCreated(
        bytes16 indexed orderId,
        address indexed buyer,
        address indexed seller,
        uint256 amount,
        uint16 taxBps
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
        address _platformTreasury,
        uint16 _feeBps,
        uint24 _releaseDelay
    ) external initializer {
        __Ownable_init(msg.sender);
        __ReentrancyGuard_init();

        require(_feeBps <= 1000, "Fee too high");
        require(_releaseDelay >= 1 hours, "Delay too short");
        require(_releaseDelay <= 7 days, "Delay too long");

        platformTreasury = _platformTreasury;
        platformFeeBps = _feeBps;
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
                               Owner
    //////////////////////////////////////////////////////////////*/
    function setContractState(ContractState newState) external onlyOwner {
        contractState = newState;
        emit ContractStateChanged(newState);
    }

    /*//////////////////////////////////////////////////////////////
                               Core
    //////////////////////////////////////////////////////////////*/
    function createEscrow(
        bytes16 orderId,
        address seller,
        uint16 taxBps
    ) external payable nonReentrant onlyActive {
        require(msg.value > 0, "Invalid amount");
        require(orders[orderId].state == OrderState.None, "Order exists");

        orders[orderId] = Order({
            buyer: msg.sender,
            seller: seller,
            amount: msg.value,
            taxBps: taxBps,
            createdAt: block.timestamp,
            state: OrderState.Created
        });

        emit EscrowCreated(orderId, msg.sender, seller, msg.value, taxBps);
    }

    function confirmDelivery(bytes16 orderId) external nonReentrant onlyActive {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Not buyer");
        require(o.state == OrderState.Created, "Cannot release");

        _release(orderId);
    }

    function releaseAfterTimeout(bytes16 orderId) external nonReentrant {
        Order storage o = orders[orderId];
        require(o.state == OrderState.Created, "Cannot release");
        require(block.timestamp >= o.createdAt + releaseDelay, "Too early");

        _release(orderId);
    }

    function openDispute(bytes16 orderId) external onlyActive {
        Order storage o = orders[orderId];
        require(msg.sender == o.buyer, "Not buyer");
        require(o.state == OrderState.Created, "Cannot dispute");

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
            payable(o.buyer).transfer(o.amount);
            emit OrderRefunded(orderId, o.buyer, o.amount);
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
            o.state == OrderState.Created || o.state == OrderState.Disputed,
            "Cannot release"
        );

        o.state = OrderState.Released;

        (
            ,
            uint256 platformFee,
            uint256 sellerAmount
        ) = _splitAmount(o.amount, o.taxBps);

        payable(platformTreasury).transfer(platformFee);
        payable(o.seller).transfer(sellerAmount);

        emit OrderReleased(orderId, o.seller, sellerAmount);
    }

    function _splitAmount(
        uint256 amount,
        uint16 taxBps
    )
        internal
        view
        returns (
            uint256 taxAmount,
            uint256 platformFee,
            uint256 sellerAmount
        )
    {
        taxAmount = (amount * taxBps) / (10_000 + taxBps);
        uint256 price = amount - taxAmount;

        platformFee = (price * platformFeeBps) / 10_000;
        sellerAmount = price - platformFee + taxAmount;
    }
}
