// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { PonsTokenFactory } from "../src/PonsTokenFactory.sol";
import { RepoToken } from "../src/RepoToken.sol";

contract PonsTokenFactoryTest is Test {
    PonsTokenFactory factory;
    address feeRecipient = address(0xFEE);
    address creator = address(0xC0FFEE);
    uint256 constant FEE = 0.0005 ether;
    uint256 constant SUPPLY = 1_000_000_000 ether;

    function setUp() public {
        factory = new PonsTokenFactory(feeRecipient, FEE);
        vm.deal(creator, 10 ether);
    }

    function _launch(address who, string memory repo) internal returns (address token) {
        vm.prank(who);
        token = factory.launchToken{ value: FEE }(
            "My Repo", "REPO", repo, "ipfs://bafyexamplecid", SUPPLY
        );
    }

    function test_LaunchMintsFullSupplyToCreator() public {
        address token = _launch(creator, "octocat/hello-world");
        RepoToken t = RepoToken(token);
        assertEq(t.totalSupply(), SUPPLY);
        assertEq(t.balanceOf(creator), SUPPLY);
        assertEq(t.creator(), creator);
        assertEq(t.factory(), address(factory));
        assertEq(t.githubRepo(), "octocat/hello-world");
        assertEq(t.metadataURI(), "ipfs://bafyexamplecid");
    }

    function test_RegistryPopulated() public {
        address token = _launch(creator, "octocat/hello-world");
        assertEq(factory.totalTokens(), 1);
        assertEq(factory.allTokens(0), token);
        assertEq(factory.tokenByRepo(keccak256(bytes("octocat/hello-world"))), token);
        address[] memory mine = factory.getTokensByCreator(creator);
        assertEq(mine.length, 1);
        assertEq(mine[0], token);
    }

    function test_EmitsTokenLaunched() public {
        vm.expectEmit(false, true, false, false);
        emit PonsTokenFactory.TokenLaunched(
            address(0), creator, "octocat/hello-world", "My Repo", "REPO", "ipfs://bafyexamplecid", SUPPLY
        );
        _launch(creator, "octocat/hello-world");
    }

    function test_FeeForwardedToRecipient() public {
        uint256 before = feeRecipient.balance;
        _launch(creator, "octocat/hello-world");
        assertEq(feeRecipient.balance, before + FEE);
    }

    function test_OverpaymentRefunded() public {
        uint256 before = creator.balance;
        vm.prank(creator);
        factory.launchToken{ value: FEE + 1 ether }(
            "My Repo", "REPO", "octocat/hello-world", "ipfs://x", SUPPLY
        );
        // Creator paid only FEE; the extra 1 ether refunded.
        assertEq(creator.balance, before - FEE);
    }

    function test_RevertOnDuplicateRepo() public {
        address token = _launch(creator, "octocat/hello-world");
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(PonsTokenFactory.RepoAlreadyLaunched.selector, token)
        );
        factory.launchToken{ value: FEE }(
            "My Repo", "REPO", "octocat/hello-world", "ipfs://x", SUPPLY
        );
    }

    function test_RevertOnInsufficientFee() public {
        vm.prank(creator);
        vm.expectRevert(
            abi.encodeWithSelector(PonsTokenFactory.InsufficientFee.selector, FEE, 0)
        );
        factory.launchToken{ value: 0 }(
            "My Repo", "REPO", "octocat/hello-world", "ipfs://x", SUPPLY
        );
    }

    function test_RevertOnEmptyFields() public {
        vm.prank(creator);
        vm.expectRevert(PonsTokenFactory.EmptyField.selector);
        factory.launchToken{ value: FEE }("", "REPO", "octocat/hello", "ipfs://x", SUPPLY);

        vm.prank(creator);
        vm.expectRevert(PonsTokenFactory.ZeroSupply.selector);
        factory.launchToken{ value: FEE }("Name", "REPO", "octocat/hello", "ipfs://x", 0);
    }

    function test_PredictMatchesDeployed() public {
        address predicted = factory.predictTokenAddress(
            "My Repo", "REPO", "octocat/hello-world", "ipfs://bafyexamplecid", SUPPLY, creator
        );
        address token = _launch(creator, "octocat/hello-world");
        assertEq(predicted, token);
    }

    function test_TokenTransfers() public {
        address token = _launch(creator, "octocat/hello-world");
        RepoToken t = RepoToken(token);
        vm.prank(creator);
        t.transfer(address(0xBEEF), 100 ether);
        assertEq(t.balanceOf(address(0xBEEF)), 100 ether);
        assertEq(t.balanceOf(creator), SUPPLY - 100 ether);
    }

    function test_Pagination() public {
        vm.deal(address(0xA11CE), 1 ether);
        _launch(address(0xA11CE), "a/one");
        vm.prank(address(0xA11CE));
        factory.launchToken{ value: FEE }("Two", "TWO", "a/two", "ipfs://2", SUPPLY);

        PonsTokenFactory.TokenInfo[] memory page = factory.getTokens(0, 10);
        assertEq(page.length, 2);
        assertEq(page[0].githubRepo, "a/one");
        assertEq(page[1].githubRepo, "a/two");

        PonsTokenFactory.TokenInfo[] memory empty = factory.getTokens(5, 10);
        assertEq(empty.length, 0);
    }

    function test_AdminSetFee() public {
        factory.setLaunchFee(1 ether);
        assertEq(factory.launchFee(), 1 ether);
    }

    function test_RevertNonOwnerAdmin() public {
        vm.prank(creator);
        vm.expectRevert(PonsTokenFactory.NotOwner.selector);
        factory.setLaunchFee(1 ether);
    }
}
