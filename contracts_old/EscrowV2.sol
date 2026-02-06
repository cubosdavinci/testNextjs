// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;
import "./EscrowV1.sol";
import { IERC20 } from "@openzeppelin/contracts/interfaces/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";



contract EscrowV2 is EscrowV1 {
    /*//////////////////////////////////////////////////////////////
                               Libraries
    //////////////////////////////////////////////////////////////*/
    using SafeERC20 for IERC20; // Internal helper to make safe ERC20 token operations
    using ECDSA for bytes32;    // Internal helper to verify signature

    
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    /*//////////////////////////////////////////////////////////////
                               Core
    //////////////////////////////////////////////////////////////*/

    function registerEscrowOrder(
      OrderPayload calldata orderPayload, 
      bytes calldata signature
    ) external payable nonReentrant onlyActive {
        // Get signer and verify is authority server
        bytes32 digest = _hashTypedDataV4(_hashEscrowOrderPayload(orderPayload));
        address signer = digest.recover(signature);
        require(signer == serverSigner, "Invalid signature");
        
        // Validate deadline                
        require(block.timestamp <= orderPayload.deadline, "Order expired");
        
        // Prevent order replay
        require(!usedOrderIds[orderPayload.orderId], "Order already registered");   
        

        // Execute escrow payment (native and erc20 token compatible)
        IERC20 token = IERC20(orderPayload.paymentToken);        
        if (orderPayload.paymentToken == address(0)) {
            require(msg.value == orderPayload.total, "Incorrect ETH sent");
        } else {
            require(msg.value == 0, "Do not send ETH for ERC20 payment");
            token.safeTransferFrom(msg.sender, address(this), orderPayload.total);
        }
        
        // Save order data
        orders[orderPayload.orderId] = Order({
            buyer: orderPayload.buyer,
            seller: orderPayload.seller,
            paymentToken: address(token),
            total: orderPayload.total,
            taxes: orderPayload.taxes,
            platformFee: orderPayload.platformFee,
            createdAt: block.timestamp,
            state: OrderState.Registered
        });

        // Prevent Order Replay
        usedOrderIds[orderPayload.orderId] = true;

        // Update Orders Count
        ordersCount += 1;

        // Emit Event
        emit EscrowRegistered(orderPayload.orderId, msg.sender, OrderState.Registered, orderPayload.seller);
    }
}
