// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/**
 * @title FeeSplitter
 * @notice Immutable 50/50 fee splitter used as the PONS `feeWallet` for a
 *         single creator. PONS routes the launch tax (2%) here; this contract
 *         forwards half to the Repoken treasury (for $REPOKEN buyback + burn)
 *         and half to the creator that launched the token.
 *
 * @dev Holds no state beyond the two immutable payees. Anyone can call
 *      `release()` / `releaseToken()` to push accumulated funds out — the
 *      contract never keeps custody beyond a pending balance.
 */
contract FeeSplitter {
    /// @notice Repoken treasury: receives 50% (buyback + burn).
    address public immutable treasury;
    /// @notice Token creator: receives 50%.
    address public immutable creator;

    event NativeReleased(uint256 toTreasury, uint256 toCreator);
    event TokenReleased(address indexed token, uint256 toTreasury, uint256 toCreator);

    error ZeroAddress();
    error NothingToRelease();
    error TransferFailed();

    constructor(address _treasury, address _creator) {
        if (_treasury == address(0) || _creator == address(0)) revert ZeroAddress();
        treasury = _treasury;
        creator = _creator;
    }

    /// @notice Accept ETH tax from PONS.
    receive() external payable {}

    /// @notice Split the contract's ETH balance 50/50. Callable by anyone.
    function release() external {
        uint256 bal = address(this).balance;
        if (bal == 0) revert NothingToRelease();
        uint256 half = bal / 2;
        uint256 rest = bal - half; // creator gets the odd wei
        _send(treasury, half);
        _send(creator, rest);
        emit NativeReleased(half, rest);
    }

    /// @notice Split an ERC-20 balance (e.g. token tax) 50/50. Callable by anyone.
    function releaseToken(address token) external {
        uint256 bal = _erc20BalanceOf(token, address(this));
        if (bal == 0) revert NothingToRelease();
        uint256 half = bal / 2;
        uint256 rest = bal - half;
        _erc20Transfer(token, treasury, half);
        _erc20Transfer(token, creator, rest);
        emit TokenReleased(token, half, rest);
    }

    function _send(address to, uint256 amount) private {
        (bool ok, ) = payable(to).call{value: amount}("");
        if (!ok) revert TransferFailed();
    }

    function _erc20BalanceOf(address token, address who) private view returns (uint256) {
        (bool ok, bytes memory data) = token.staticcall(
            abi.encodeWithSelector(0x70a08231, who) // balanceOf(address)
        );
        if (!ok || data.length < 32) revert TransferFailed();
        return abi.decode(data, (uint256));
    }

    function _erc20Transfer(address token, address to, uint256 amount) private {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(0xa9059cbb, to, amount) // transfer(address,uint256)
        );
        if (!ok || (data.length != 0 && !abi.decode(data, (bool)))) revert TransferFailed();
    }
}
