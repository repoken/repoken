// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import { Test } from "forge-std/Test.sol";
import { SplitterFactory } from "../src/SplitterFactory.sol";
import { FeeSplitter } from "../src/FeeSplitter.sol";

/// @dev Minimal ERC-20 for token-split tests.
contract MockERC20 {
    mapping(address => uint256) public balanceOf;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

contract SplitterFactoryTest is Test {
    SplitterFactory factory;
    address treasury = address(0x7EEA);
    address creator = address(0xC0FFEE);

    function setUp() public {
        factory = new SplitterFactory(treasury);
    }

    function test_PredictMatchesDeploy() public {
        address predicted = factory.predict(creator);
        assertFalse(factory.isDeployed(creator));
        address deployed = factory.ensureSplitter(creator);
        assertEq(deployed, predicted, "predicted != deployed");
        assertTrue(factory.isDeployed(creator));
    }

    function test_EnsureIsIdempotent() public {
        address a = factory.ensureSplitter(creator);
        address b = factory.ensureSplitter(creator);
        assertEq(a, b, "second ensure changed address");
    }

    function test_SplitterHasCorrectPayees() public {
        FeeSplitter s = FeeSplitter(payable(factory.ensureSplitter(creator)));
        assertEq(s.treasury(), treasury);
        assertEq(s.creator(), creator);
    }

    function test_DistinctCreatorsDistinctSplitters() public {
        address s1 = factory.ensureSplitter(address(0xA11CE));
        address s2 = factory.ensureSplitter(address(0xB0B));
        assertTrue(s1 != s2);
    }

    function test_ReleaseSplitsEthFiftyFifty() public {
        FeeSplitter s = FeeSplitter(payable(factory.ensureSplitter(creator)));
        vm.deal(address(s), 1 ether);

        uint256 t0 = treasury.balance;
        uint256 c0 = creator.balance;
        s.release();

        assertEq(treasury.balance - t0, 0.5 ether, "treasury half");
        assertEq(creator.balance - c0, 0.5 ether, "creator half");
        assertEq(address(s).balance, 0, "splitter drained");
    }

    function test_ReleaseOddWeiGoesToCreator() public {
        FeeSplitter s = FeeSplitter(payable(factory.ensureSplitter(creator)));
        vm.deal(address(s), 3 wei);

        uint256 t0 = treasury.balance;
        uint256 c0 = creator.balance;
        s.release();

        assertEq(treasury.balance - t0, 1 wei, "treasury floor half");
        assertEq(creator.balance - c0, 2 wei, "creator gets remainder");
    }

    function test_ReleaseRevertsWhenEmpty() public {
        FeeSplitter s = FeeSplitter(payable(factory.ensureSplitter(creator)));
        vm.expectRevert(FeeSplitter.NothingToRelease.selector);
        s.release();
    }

    function test_ReleaseTokenSplitsFiftyFifty() public {
        FeeSplitter s = FeeSplitter(payable(factory.ensureSplitter(creator)));
        MockERC20 token = new MockERC20();
        token.mint(address(s), 1000);

        s.releaseToken(address(token));

        assertEq(token.balanceOf(treasury), 500, "treasury token half");
        assertEq(token.balanceOf(creator), 500, "creator token half");
        assertEq(token.balanceOf(address(s)), 0, "splitter token drained");
    }

    function test_ConstructorRejectsZeroTreasury() public {
        vm.expectRevert(SplitterFactory.ZeroAddress.selector);
        new SplitterFactory(address(0));
    }

    function test_SplitterConstructorRejectsZero() public {
        vm.expectRevert(FeeSplitter.ZeroAddress.selector);
        new FeeSplitter(address(0), creator);
        vm.expectRevert(FeeSplitter.ZeroAddress.selector);
        new FeeSplitter(treasury, address(0));
    }
}
