// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Vote_demo
 * @dev Demo contract showing how to interact with the BlockchainVotingSystem
 */

interface IBlockchainVotingSystem {
    function createElection(
        string memory electionName,
        uint256 startTime,
        uint256 endTime,
        string[] memory candidateNames
    ) external returns (uint256);

    function registerVoter(uint256 electionId, address voter) external;

    function vote(uint256 electionId, uint256 candidateId) external;

    function getElection(uint256 electionId)
        external
        view
        returns (
            string memory electionName,
            uint256 startTime,
            uint256 endTime,
            bool isActive,
            bool isFinalized,
            address creator,
            uint256 totalVotes,
            uint256 candidateCount
        );

    function getCandidates(uint256 electionId)
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            uint256[] memory voteCounts,
            bool[] memory isActive
        );

    function getVoterInfo(uint256 electionId, address voter)
        external
        view
        returns (
            address voterAddress,
            bool hasVoted,
            uint256 votedFor,
            uint256 votingTime,
            bool isRegistered
        );
}

contract VotingSystemDemo {
    IBlockchainVotingSystem public votingSystem;
    address public admin;

    event ElectionCreated(uint256 indexed electionId, string electionName);
    event VoterRegistered(uint256 indexed electionId, address voter);
    event VoteCasted(uint256 indexed electionId, address indexed voter, uint256 candidateId);

    constructor(address _votingSystemAddress) {
        votingSystem = IBlockchainVotingSystem(_votingSystemAddress);
        admin = msg.sender;
    }

    /**
     * @dev Create a sample election with candidates
     */
    function createSampleElection(
        string memory electionName,
        uint256 durationInDays,
        string[] memory candidateNames
    ) external returns (uint256) {
        require(msg.sender == admin, "Only admin can create elections");
        require(candidateNames.length > 0, "At least one candidate required");

        uint256 startTime = block.timestamp;
        uint256 endTime = block.timestamp + (durationInDays * 1 days);

        uint256 electionId = votingSystem.createElection(
            electionName,
            startTime,
            endTime,
            candidateNames
        );

        emit ElectionCreated(electionId, electionName);
        return electionId;
    }

    /**
     * @dev Register a voter for an election
     */
    function registerVoterForElection(uint256 electionId, address voter) external {
        require(msg.sender == admin, "Only admin can register voters");
        votingSystem.registerVoter(electionId, voter);
        emit VoterRegistered(electionId, voter);
    }

    /**
     * @dev Cast a vote for a candidate
     */
    function castVote(uint256 electionId, uint256 candidateId) external {
        votingSystem.vote(electionId, candidateId);
        emit VoteCasted(electionId, msg.sender, candidateId);
    }

    /**
     * @dev Get election details
     */
    function getElectionDetails(uint256 electionId)
        external
        view
        returns (
            string memory electionName,
            bool isActive,
            uint256 totalVotes,
            uint256 candidateCount
        )
    {
        (
            string memory name,
            ,
            ,
            bool active,
            ,
            ,
            uint256 votes,
            uint256 count
        ) = votingSystem.getElection(electionId);

        return (name, active, votes, count);
    }

    /**
     * @dev Get all candidates for an election
     */
    function getCandidatesForElection(uint256 electionId)
        external
        view
        returns (
            uint256[] memory ids,
            string[] memory names,
            uint256[] memory voteCounts,
            bool[] memory isActive
        )
    {
        return votingSystem.getCandidates(electionId);
    }

    /**
     * @dev Get voter's voting status
     */
    function getVoterStatus(uint256 electionId, address voter)
        external
        view
        returns (
            bool isRegistered,
            bool hasVoted,
            uint256 votedFor
        )
    {
        (
            ,
            bool voted,
            uint256 candidateId,
            ,
            bool registered
        ) = votingSystem.getVoterInfo(electionId, voter);

        return (registered, voted, candidateId);
    }

    /**
     * @dev Check if voting is active for an election
     */
    function isVotingActive(uint256 electionId) external view returns (bool) {
        (, , , bool isActive, , , , ) = votingSystem.getElection(electionId);
        return isActive;
    }

    /**
     * @dev Get the winning candidate (highest vote count)
     */
    function getWinner(uint256 electionId) external view returns (string memory, uint256) {
        (, , uint256[] memory voteCounts, ) = votingSystem.getCandidates(electionId);

        require(voteCounts.length > 0, "No candidates in election");

        uint256 maxVotes = 0;
        uint256 winnerIndex = 0;

        for (uint256 i = 0; i < voteCounts.length; i++) {
            if (voteCounts[i] > maxVotes) {
                maxVotes = voteCounts[i];
                winnerIndex = i;
            }
        }

        (, string[] memory names, , ) = votingSystem.getCandidates(electionId);
        return (names[winnerIndex], maxVotes);
    }
}
