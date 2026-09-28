// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {FeeSplitter} from "./FeeSplitter.sol";

/**
 * @title SplitterFactory
 * @notice Deterministically deploys one {FeeSplitter} per creator via CREATE2.
 *         The Repoken treasury is baked in at construction. The frontend
 *         predicts the splitter address for a creator, ensures it exists
 *         (deploying it if needed), then launches on PONS with
 *         `feeWallet = splitter` and `taxBps = 200` (2%).
 *
 * @dev The salt is the creator address, so every creator gets exactly one
 *      canonical splitter. Deployment is permissionless and idempotent.
 */
contract SplitterFactory {
    /// @notice Repoken treasury baked into every splitter (buyback + burn).
    address public immutable treasury;

    event SplitterCreated(address indexed creator, address splitter);

    error ZeroAddress();

    constructor(address _treasury) {
        if (_treasury == address(0)) revert ZeroAddress();
        treasury = _treasury;
    }

    /// @notice Deploy (or return the existing) splitter for `creator`.
    function ensureSplitter(address creator) external returns (address splitter) {
        if (creator == address(0)) revert ZeroAddress();
        splitter = predict(creator);
        if (splitter.code.length == 0) {
            FeeSplitter deployed = new FeeSplitter{salt: _salt(creator)}(treasury, creator);
            splitter = address(deployed);
            emit SplitterCreated(creator, splitter);
        }
    }

    /// @notice Predict the CREATE2 splitter address for `creator`.
    function predict(address creator) public view returns (address) {
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                _salt(creator),
                keccak256(
                    abi.encodePacked(type(FeeSplitter).creationCode, abi.encode(treasury, creator))
                )
            )
        );
        return address(uint160(uint256(hash)));
    }

    /// @notice True if the splitter for `creator` has already been deployed.
    function isDeployed(address creator) external view returns (bool) {
        return predict(creator).code.length != 0;
    }

    function _salt(address creator) private pure returns (bytes32) {
        return bytes32(uint256(uint160(creator)));
    }
}
