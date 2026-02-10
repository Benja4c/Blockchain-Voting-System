// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/VotingSystem.sol";

contract VotingSystemTest is Test {
    BlockchainVotingSystem votingSystem;

    address admin = address(1);
    address commissioner = address(2);
    address voter1 = address(3);
    address voter2 = address(4);
    address voter3 = address(5);
    address attacker = address(6);

    uint256 electionId;

    function setUp() public {
        vm.prank(admin);
        votingSystem = new BlockchainVotingSystem();

        // Add commissioner
        vm.prank(admin);
        votingSystem.addCommissioner(commissioner);
    }

    // ============ Election Creation Tests ============

    function testCreateElection() public {
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = block.timestamp + 2 days;

        vm.prank(commissioner);
        uint256 id = votingSystem.createElection("Presidential Election 2024", startTime, endTime);

        BlockchainVotingSystem.Election memory election = votingSystem.getElection(id);
        assertEq(election.electionName, "Presidential Election 2024");
        assertEq(election.startTime, startTime);
        assertEq(election.endTime, endTime);
        assertEq(election.creator, commissioner);
        assertTrue(election.isActive);
        assertFalse(election.isFinalized);
    }

    function testCreateElectionFailsWithEmptyName() public {
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = block.timestamp + 2 days;

        vm.prank(commissioner);
        vm.expectRevert("Election name cannot be empty");
        votingSystem.createElection("", startTime, endTime);
    }

    function testCreateElectionFailsWithInvalidTimeRange() public {
        uint256 startTime = block.timestamp + 2 days;
        uint256 endTime = block.timestamp + 1 days;

        vm.prank(commissioner);
        vm.expectRevert("Invalid time range");
        votingSystem.createElection("Election", startTime, endTime);
    }

    function testCreateElectionFailsWithPastStartTime() public {
        uint256 startTime = block.timestamp - 1 days;
        uint256 endTime = block.timestamp + 1 days;

        vm.prank(commissioner);
        vm.expectRevert("Start time must be in future");
        votingSystem.createElection("Election", startTime, endTime);
    }

    function testOnlyCommissionerCanCreateElection() public {
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = block.timestamp + 2 days;

        vm.prank(attacker);
        vm.expectRevert("Only election commissioners can perform this action");
        votingSystem.createElection("Election", startTime, endTime);
    }

    // ============ Candidate Registration Tests ============

    function testRegisterCandidate() public {
        _setupElection();

        vm.prank(commissioner);
        uint256 candidateId = votingSystem.registerCandidate(electionId, "Alice");

        BlockchainVotingSystem.Candidate memory candidate = votingSystem.getCandidate(electionId, candidateId);
        assertEq(candidate.name, "Alice");
        assertEq(candidate.voteCount, 0);
        assertTrue(candidate.isActive);
    }

    function testRegisterMultipleCandidates() public {
        _setupElection();

        vm.prank(commissioner);
        votingSystem.registerCandidate(electionId, "Alice");
        votingSystem.registerCandidate(electionId, "Bob");
        votingSystem.registerCandidate(electionId, "Charlie");

        uint256 count = votingSystem.getCandidatesCount(electionId);
        assertEq(count, 3);
    }

    function testRegisterCandidateFailsWithEmptyName() public {
        _setupElection();

        vm.prank(commissioner);
        vm.expectRevert("Candidate name cannot be empty");
        votingSystem.registerCandidate(electionId, "");
    }

    // ============ Voter Registration Tests ============

    function testRegisterVoter() public {
        _setupElection();

        vm.prank(commissioner);
        votingSystem.registerVoter(electionId, voter1);

        BlockchainVotingSystem.Voter memory voter = votingSystem.getVoter(electionId, voter1);
        assertTrue(voter.isRegistered);
        assertFalse(voter.hasVoted);
    }

    function testBatchRegisterVoters() public {
        _setupElection();

        address[] memory voters = new address[](3);
        voters[0] = voter1;
        voters[1] = voter2;
        voters[2] = voter3;

        vm.prank(commissioner);
        votingSystem.batchRegisterVoters(electionId, voters);

        uint256 count = votingSystem.getRegisteredVotersCount(electionId);
        assertEq(count, 3);
    }

    function testCannotRegisterVoterTwice() public {
        _setupElection();

        vm.prank(commissioner);
        votingSystem.registerVoter(electionId, voter1);
        votingSystem.registerVoter(electionId, voter1);

        // Should only be registered once
        uint256 count = votingSystem.getRegisteredVotersCount(electionId);
        assertEq(count, 1);
    }

    // ============ Voting Tests ============

    function testVote() public {
        _setupElectionWithCandidatesAndVoters();

        // Move to voting period
        vm.warp(block.timestamp + 1.5 days);

        // Voter 1 votes for candidate 0
        vm.prank(voter1);
        votingSystem.vote(electionId, 0);

        BlockchainVotingSystem.Voter memory voter = votingSystem.getVoter(electionId, voter1);
        assertTrue(voter.hasVoted);
        assertEq(voter.votedFor, 0);

        BlockchainVotingSystem.Candidate memory candidate = votingSystem.getCandidate(electionId, 0);
        assertEq(candidate.voteCount, 1);
    }

    function testMultipleVotes() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 1.5 days);

        vm.prank(voter1);
        votingSystem.vote(electionId, 0);

        vm.prank(voter2);
        votingSystem.vote(electionId, 0);

        vm.prank(voter3);
        votingSystem.vote(electionId, 1);

        BlockchainVotingSystem.Candidate memory candidate0 = votingSystem.getCandidate(electionId, 0);
        BlockchainVotingSystem.Candidate memory candidate1 = votingSystem.getCandidate(electionId, 1);

        assertEq(candidate0.voteCount, 2);
        assertEq(candidate1.voteCount, 1);
    }

    function testVoteFailsIfNotRegisteredVoter() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 1.5 days);

        vm.prank(attacker);
        vm.expectRevert("Voter is not registered");
        votingSystem.vote(electionId, 0);
    }

    function testVoteFailsIfAlreadyVoted() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 1.5 days);

        vm.prank(voter1);
        votingSystem.vote(electionId, 0);

        vm.expectRevert("Voter has already voted");
        votingSystem.vote(electionId, 1);
    }

    function testVoteFailsBeforeVotingPeriod() public {
        _setupElectionWithCandidatesAndVoters();

        vm.prank(voter1);
        vm.expectRevert("Election is not in voting period");
        votingSystem.vote(electionId, 0);
    }

    function testVoteFailsAfterVotingPeriod() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 2.5 days);

        vm.prank(voter1);
        vm.expectRevert("Election is not in voting period");
        votingSystem.vote(electionId, 0);
    }

    function testVoteFailsForInvalidCandidate() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 1.5 days);

        vm.prank(voter1);
        vm.expectRevert("Invalid candidate ID");
        votingSystem.vote(electionId, 999);
    }

    // ============ Results and Finalization Tests ============

    function testGetResults() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 1.5 days);

        vm.prank(voter1);
        votingSystem.vote(electionId, 0);

        vm.prank(voter2);
        votingSystem.vote(electionId, 0);

        BlockchainVotingSystem.Candidate[] memory results = votingSystem.getResults(electionId);
        assertEq(results.length, 2);
        assertEq(results[0].voteCount, 2);
    }

    function testFinalizeElection() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 2.5 days);

        vm.prank(commissioner);
        votingSystem.finalizeElection(electionId);

        BlockchainVotingSystem.Election memory election = votingSystem.getElection(electionId);
        assertTrue(election.isFinalized);
        assertFalse(election.isActive);
    }

    function testGetWinner() public {
        _setupElectionWithCandidatesAndVoters();

        vm.warp(block.timestamp + 1.5 days);

        vm.prank(voter1);
        votingSystem.vote(electionId, 0);

        vm.prank(voter2);
        votingSystem.vote(electionId, 0);

        vm.prank(voter3);
        votingSystem.vote(electionId, 1);

        vm.warp(block.timestamp + 2.5 days);

        vm.prank(commissioner);
        votingSystem.finalizeElection(electionId);

        BlockchainVotingSystem.Candidate memory winner = votingSystem.getWinner(electionId);
        assertEq(winner.name, "Alice");
        assertEq(winner.voteCount, 2);
    }

    // ============ Admin Tests ============

    function testAddCommissioner() public {
        vm.prank(admin);
        votingSystem.addCommissioner(voter1);

        assertTrue(votingSystem.isElectionCommissioner(voter1));
    }

    function testRemoveCommissioner() public {
        vm.prank(admin);
        votingSystem.addCommissioner(voter1);
        votingSystem.removeCommissioner(voter1);

        assertFalse(votingSystem.isElectionCommissioner(voter1));
    }

    function testTransferAdmin() public {
        vm.prank(admin);
        votingSystem.transferAdmin(voter1);

        assertEq(votingSystem.administrator(), voter1);
        assertTrue(votingSystem.isElectionCommissioner(voter1));
    }

    // ============ Helper Functions ============

    function _setupElection() internal {
        uint256 startTime = block.timestamp + 1 days;
        uint256 endTime = block.timestamp + 2 days;

        vm.prank(commissioner);
        electionId = votingSystem.createElection("Test Election", startTime, endTime);
    }

    function _setupElectionWithCandidatesAndVoters() internal {
        _setupElection();

        // Register candidates
        vm.prank(commissioner);
        votingSystem.registerCandidate(electionId, "Alice");
        votingSystem.registerCandidate(electionId, "Bob");

        // Register voters
        vm.prank(commissioner);
        address[] memory voters = new address[](3);
        voters[0] = voter1;
        voters[1] = voter2;
        voters[2] = voter3;
        votingSystem.batchRegisterVoters(electionId, voters);
    }
}
