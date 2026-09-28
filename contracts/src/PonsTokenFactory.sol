// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { RepoToken } from "./RepoToken.sol";

/// @title PonsTokenFactory
/// @notice Launches GitHub-repo-backed ERC-20 tokens on Robinhood Chain and
///         registers them in a PONS-compatible on-chain registry.
/// @dev One launch per repo slug is enforced to prevent duplicate/impersonated
///      repo tokens. A flat launch fee (in native token) is collected per launch.
contract PonsTokenFactory {
    struct TokenInfo {
        address token;
        address creator;
        string githubRepo;
        string name;
        string symbol;
        uint256 initialSupply;
        uint256 launchedAt;
    }

    address public owner;
    address public feeRecipient;
    /// @notice Flat launch fee in wei. Mirrors PONS launch-fee convention.
    uint256 public launchFee;

    /// @notice All launched tokens, in launch order.
    address[] public allTokens;
    /// @notice token address => registry entry.
    mapping(address => TokenInfo) public tokenInfo;
    /// @notice keccak256(repo slug) => token address (0 if unclaimed).
    mapping(bytes32 => address) public tokenByRepo;
    /// @notice creator => their launched tokens.
    mapping(address => address[]) public tokensByCreator;

    event TokenLaunched(
        address indexed token,
        address indexed creator,
        string githubRepo,
        string name,
        string symbol,
        string metadataURI,
        uint256 initialSupply
    );
    event LaunchFeeUpdated(uint256 oldFee, uint256 newFee);
    event FeeRecipientUpdated(address indexed oldRecipient, address indexed newRecipient);
    event OwnershipTransferred(address indexed oldOwner, address indexed newOwner);

    error NotOwner();
    error RepoAlreadyLaunched(address existing);
    error EmptyField();
    error ZeroSupply();
    error InsufficientFee(uint256 required, uint256 sent);
    error FeeTransferFailed();
    error ZeroAddress();

    modifier onlyOwner() {
        if (msg.sender != owner) revert NotOwner();
        _;
    }

    constructor(address _feeRecipient, uint256 _launchFee) {
        if (_feeRecipient == address(0)) revert ZeroAddress();
        owner = msg.sender;
        feeRecipient = _feeRecipient;
        launchFee = _launchFee;
        emit OwnershipTransferred(address(0), msg.sender);
    }

    /// @notice Launch a token for a GitHub repo.
    /// @param name Token name (from repo.name).
    /// @param symbol Token symbol.
    /// @param githubRepo Repo slug "owner/repo".
    /// @param metadataURI ipfs:// URI of metadata JSON.
    /// @param initialSupply Full supply, minted to caller.
    /// @return token Address of the deployed RepoToken.
    function launchToken(
        string calldata name,
        string calldata symbol,
        string calldata githubRepo,
        string calldata metadataURI,
        uint256 initialSupply
    ) external payable returns (address token) {
        if (bytes(name).length == 0 || bytes(symbol).length == 0) revert EmptyField();
        if (bytes(githubRepo).length == 0) revert EmptyField();
        if (initialSupply == 0) revert ZeroSupply();
        if (msg.value < launchFee) revert InsufficientFee(launchFee, msg.value);

        bytes32 repoKey = keccak256(bytes(githubRepo));
        address existing = tokenByRepo[repoKey];
        if (existing != address(0)) revert RepoAlreadyLaunched(existing);

        // Deterministic address per repo via CREATE2.
        token = address(
            new RepoToken{ salt: repoKey }(
                name, symbol, githubRepo, metadataURI, initialSupply, msg.sender
            )
        );

        tokenInfo[token] = TokenInfo({
            token: token,
            creator: msg.sender,
            githubRepo: githubRepo,
            name: name,
            symbol: symbol,
            initialSupply: initialSupply,
            launchedAt: block.timestamp
        });
        tokenByRepo[repoKey] = token;
        allTokens.push(token);
        tokensByCreator[msg.sender].push(token);

        if (launchFee > 0) {
            (bool ok, ) = feeRecipient.call{ value: launchFee }("");
            if (!ok) revert FeeTransferFailed();
        }
        // Refund any overpayment.
        uint256 refund = msg.value - launchFee;
        if (refund > 0) {
            (bool ok, ) = msg.sender.call{ value: refund }("");
            if (!ok) revert FeeTransferFailed();
        }

        emit TokenLaunched(token, msg.sender, githubRepo, name, symbol, metadataURI, initialSupply);
    }

    /// @notice Predict the token address for a repo before launch (CREATE2).
    function predictTokenAddress(
        string calldata name,
        string calldata symbol,
        string calldata githubRepo,
        string calldata metadataURI,
        uint256 initialSupply,
        address creator
    ) external view returns (address) {
        bytes32 repoKey = keccak256(bytes(githubRepo));
        bytes memory bytecode = abi.encodePacked(
            type(RepoToken).creationCode,
            abi.encode(name, symbol, githubRepo, metadataURI, initialSupply, creator)
        );
        bytes32 hash = keccak256(
            abi.encodePacked(bytes1(0xff), address(this), repoKey, keccak256(bytecode))
        );
        return address(uint160(uint256(hash)));
    }

    function totalTokens() external view returns (uint256) {
        return allTokens.length;
    }

    function getTokensByCreator(address creator) external view returns (address[] memory) {
        return tokensByCreator[creator];
    }

    /// @notice Paginated view of launched tokens (newest indexing left to caller).
    function getTokens(uint256 offset, uint256 limit)
        external
        view
        returns (TokenInfo[] memory page)
    {
        uint256 len = allTokens.length;
        if (offset >= len) return new TokenInfo[](0);
        uint256 end = offset + limit;
        if (end > len) end = len;
        page = new TokenInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            page[i - offset] = tokenInfo[allTokens[i]];
        }
    }

    // --- admin ---------------------------------------------------------------

    function setLaunchFee(uint256 newFee) external onlyOwner {
        emit LaunchFeeUpdated(launchFee, newFee);
        launchFee = newFee;
    }

    function setFeeRecipient(address newRecipient) external onlyOwner {
        if (newRecipient == address(0)) revert ZeroAddress();
        emit FeeRecipientUpdated(feeRecipient, newRecipient);
        feeRecipient = newRecipient;
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert ZeroAddress();
        emit OwnershipTransferred(owner, newOwner);
        owner = newOwner;
    }
}
