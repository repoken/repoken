// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

/// @title RepoToken
/// @notice Minimal, self-contained ERC-20 minted in full to its creator at launch.
/// @dev Fixed supply, no owner/mint after deploy. Metadata (github repo + IPFS URI)
///      is stored immutably for on-chain provenance.
contract RepoToken {
    string public name;
    string public symbol;
    uint8 public constant decimals = 18;

    uint256 public totalSupply;

    /// @notice GitHub repo slug this token represents, e.g. "owner/repo".
    string public githubRepo;
    /// @notice IPFS URI (ipfs://<cid>) of the token metadata JSON.
    string public metadataURI;
    /// @notice The factory that deployed this token.
    address public immutable factory;
    /// @notice The launcher / creator wallet.
    address public immutable creator;

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    error InsufficientBalance();
    error InsufficientAllowance();
    error ZeroAddress();

    constructor(
        string memory _name,
        string memory _symbol,
        string memory _githubRepo,
        string memory _metadataURI,
        uint256 _initialSupply,
        address _creator
    ) {
        if (_creator == address(0)) revert ZeroAddress();
        name = _name;
        symbol = _symbol;
        githubRepo = _githubRepo;
        metadataURI = _metadataURI;
        factory = msg.sender;
        creator = _creator;

        totalSupply = _initialSupply;
        balanceOf[_creator] = _initialSupply;
        emit Transfer(address(0), _creator, _initialSupply);
    }

    function transfer(address to, uint256 value) external returns (bool) {
        _transfer(msg.sender, to, value);
        return true;
    }

    function approve(address spender, uint256 value) external returns (bool) {
        allowance[msg.sender][spender] = value;
        emit Approval(msg.sender, spender, value);
        return true;
    }

    function transferFrom(address from, address to, uint256 value) external returns (bool) {
        uint256 allowed = allowance[from][msg.sender];
        if (allowed != type(uint256).max) {
            if (allowed < value) revert InsufficientAllowance();
            allowance[from][msg.sender] = allowed - value;
        }
        _transfer(from, to, value);
        return true;
    }

    function _transfer(address from, address to, uint256 value) internal {
        if (to == address(0)) revert ZeroAddress();
        uint256 bal = balanceOf[from];
        if (bal < value) revert InsufficientBalance();
        unchecked {
            balanceOf[from] = bal - value;
            balanceOf[to] += value;
        }
        emit Transfer(from, to, value);
    }
}
