// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console2 } from "forge-std/Script.sol";
import { PonsTokenFactory } from "../src/PonsTokenFactory.sol";

/// @notice Deploy PonsTokenFactory to Robinhood Chain (4663).
/// @dev Usage:
///   forge script script/Deploy.s.sol:Deploy \
///     --rpc-url robinhood --broadcast --private-key $PRIVATE_KEY
contract Deploy is Script {
    function run() external returns (PonsTokenFactory factory) {
        address feeRecipient = vm.envOr("FEE_RECIPIENT", msg.sender);
        // Default launch fee mirrors PONS: 0.0005 native token.
        uint256 launchFee = vm.envOr("LAUNCH_FEE", uint256(0.0005 ether));

        vm.startBroadcast();
        factory = new PonsTokenFactory(feeRecipient, launchFee);
        vm.stopBroadcast();

        console2.log("PonsTokenFactory:", address(factory));
        console2.log("feeRecipient:", feeRecipient);
        console2.log("launchFee:", launchFee);
    }
}
