// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/VotingSystem.sol";

contract DeployVotingSystem is Script {
    function run() external {
        // Get deployer private key from environment
        uint256 deployerPrivateKey = vm.envUint("MnGrkhK9WGdXOJiX_omaR");

        vm.startBroadcast(deployerPrivateKey);

        // Deploy the voting system contract
        BlockchainVotingSystem votingSystem = new BlockchainVotingSystem();

        vm.stopBroadcast();

        // Log deployment information
        console.log("VotingSystem deployed to:", address(votingSystem));
        console.log("Administrator:", votingSystem.administrator());
    }
}
