// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Script, console2 } from "forge-std/Script.sol";
import { SplitterFactory } from "../src/SplitterFactory.sol";

/// @notice Deploy SplitterFactory to Robinhood Chain (4663).
/// @dev The treasury receives 50% of every launch's PONS tax (for $REPOKEN
///      buyback + burn); the launching creator receives the other 50%.
///
/// Usage:
///   TREASURY=0x... forge script script/DeploySplitter.s.sol:DeploySplitter \
///     --rpc-url robinhood --broadcast --private-key $PRIVATE_KEY
contract DeploySplitter is Script {
    function run() external returns (SplitterFactory factory) {
        address treasury = vm.envAddress("TREASURY");

        vm.startBroadcast();
        factory = new SplitterFactory(treasury);
        vm.stopBroadcast();

        console2.log("SplitterFactory:", address(factory));
        console2.log("treasury:", treasury);
    }
}
