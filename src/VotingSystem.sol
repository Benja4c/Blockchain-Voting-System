// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract BlockchainVotingSystem {
    // State Variables

    struct Candidate {
        uint256 id;
        string name;
        uint256 voteCount;
        bool isActive;
        uint256 registrationTime;
    }

    struct Voter {
        address voterAddress;
        bool hasVoted;
        uint256 votedFor;
        uint256 votingTime;
        bool isRegistered;
    }

    struct Election {
        uint256 electionId;
        string electionName;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        bool isFinalized;
        address creator;
        uint256 totalVotes;
    }

    // Election management
    uint256 public electionCounter = 0;
    mapping(uint256 => Election) public elections;
    mapping(uint256 => mapping(uint256 => Candidate)) public candidates; // electionId => candidateId => Candidate
    mapping(uint256 => mapping(address => Voter)) public voters; // electionId => voterAddress => Voter
    mapping(uint256 => uint256[]) public candidateIds; // electionId => candidateIds array
    mapping(uint256 => address[]) public registeredVoters; // electionId => voterAddresses array

    // Access control
    address public administrator;
    mapping(address => bool) public isElectionCommissioner;
    mapping(uint256 => mapping(address => bool)) public canCreateCandidates; // electionId => address => bool

    // Audit trail for transparency
    event VoteRecorded(
        uint256 indexed electionId, address indexed voter, uint256 indexed candidateId, uint256 timestamp
    );

    event ElectionCreated(
        uint256 indexed electionId, string electionName, uint256 startTime, uint256 endTime, address creator
    );

    event CandidateRegistered(uint256 indexed electionId, uint256 indexed candidateId, string candidateName);

    event VoterRegistered(uint256 indexed electionId, address indexed voterAddress);

    event ElectionFinalized(uint256 indexed electionId, uint256 timestamp);

    event ElectionStatusChanged(uint256 indexed electionId, bool isActive, uint256 timestamp);

    // ============ Modifiers ============

    modifier onlyAdmin() {
        require(msg.sender == administrator, "Only administrator can perform this action");
        _;
    }

    modifier onlyCommissioner() {
        require(isElectionCommissioner[msg.sender], "Only election commissioners can perform this action");
        _;
    }

    modifier electionExists(uint256 _electionId) {
        require(_electionId < electionCounter, "Election does not exist");
        _;
    }

    modifier electionActive(uint256 _electionId) {
        require(elections[_electionId].isActive, "Election is not active");
        require(
            block.timestamp >= elections[_electionId].startTime && block.timestamp < elections[_electionId].endTime,
            "Election is not in voting period"
        );
        _;
    }

    modifier voterNotVoted(uint256 _electionId, address _voter) {
        require(!voters[_electionId][_voter].hasVoted, "Voter has already voted");
        require(voters[_electionId][_voter].isRegistered, "Voter is not registered");
        _;
    }

    // ============ Constructor ============

    constructor() {
        administrator = msg.sender;
        isElectionCommissioner[msg.sender] = true;
    }

    // ============ Admin Functions ============

    /**
     * @dev Add a new election commissioner
     * @param _commissioner Address of the new commissioner
     */
    function addCommissioner(address _commissioner) external onlyAdmin {
        require(_commissioner != address(0), "Invalid commissioner address");
        isElectionCommissioner[_commissioner] = true;
    }

    /**
     * @dev Remove an election commissioner
     * @param _commissioner Address of the commissioner to remove
     */
    function removeCommissioner(address _commissioner) external onlyAdmin {
        require(_commissioner != administrator, "Cannot remove administrator");
        isElectionCommissioner[_commissioner] = false;
    }

    /**
     * @dev Transfer administrator role
     * @param _newAdmin Address of new administrator
     */
    function transferAdmin(address _newAdmin) external onlyAdmin {
        require(_newAdmin != address(0), "Invalid address");
        administrator = _newAdmin;
        isElectionCommissioner[_newAdmin] = true;
    }

    // ============ Election Management Functions ============

    /**
     * @dev Create a new election
     * @param _electionName Name of the election
     * @param _startTime Start time of voting period
     * @param _endTime End time of voting period
     */
    function createElection(string memory _electionName, uint256 _startTime, uint256 _endTime)
        external
        onlyCommissioner
        returns (uint256)
    {
        require(bytes(_electionName).length > 0, "Election name cannot be empty");
        require(_startTime < _endTime, "Invalid time range");
        require(_startTime >= block.timestamp, "Start time must be in future");

        uint256 electionId = electionCounter++;

        elections[electionId] = Election({
            electionId: electionId,
            electionName: _electionName,
            startTime: _startTime,
            endTime: _endTime,
            isActive: true,
            isFinalized: false,
            creator: msg.sender,
            totalVotes: 0
        });

        emit ElectionCreated(electionId, _electionName, _startTime, _endTime, msg.sender);

        return electionId;
    }

    /**
     * @dev Register a candidate for an election
     * @param _electionId ID of the election
     * @param _candidateName Name of the candidate
     */
    function registerCandidate(uint256 _electionId, string memory _candidateName)
        external
        electionExists(_electionId)
        returns (uint256)
    {
        require(bytes(_candidateName).length > 0, "Candidate name cannot be empty");
        require(
            isElectionCommissioner[msg.sender] || msg.sender == elections[_electionId].creator,
            "Only commissioners can register candidates"
        );
        require(!elections[_electionId].isFinalized, "Election is finalized");

        // Find next candidate ID
        uint256 candidateId = candidateIds[_electionId].length;

        candidates[_electionId][candidateId] = Candidate({
            id: candidateId, name: _candidateName, voteCount: 0, isActive: true, registrationTime: block.timestamp
        });

        candidateIds[_electionId].push(candidateId);

        emit CandidateRegistered(_electionId, candidateId, _candidateName);

        return candidateId;
    }

    /**
     * @dev Register a voter for an election
     * @param _electionId ID of the election
     * @param _voterAddress Address of the voter
     */
    function registerVoter(uint256 _electionId, address _voterAddress) external electionExists(_electionId) {
        require(_voterAddress != address(0), "Invalid voter address");
        require(
            isElectionCommissioner[msg.sender] || msg.sender == elections[_electionId].creator,
            "Only commissioners can register voters"
        );
        require(!voters[_electionId][_voterAddress].isRegistered, "Voter already registered");

        voters[_electionId][_voterAddress] =
            Voter({voterAddress: _voterAddress, hasVoted: false, votedFor: 0, votingTime: 0, isRegistered: true});

        registeredVoters[_electionId].push(_voterAddress);

        emit VoterRegistered(_electionId, _voterAddress);
    }

    /**
     * @dev Register multiple voters at once
     * @param _electionId ID of the election
     * @param _voterAddresses Array of voter addresses
     */
    function batchRegisterVoters(uint256 _electionId, address[] calldata _voterAddresses)
        external
        electionExists(_electionId)
    {
        require(
            isElectionCommissioner[msg.sender] || msg.sender == elections[_electionId].creator,
            "Only commissioners can register voters"
        );

        for (uint256 i = 0; i < _voterAddresses.length; i++) {
            address voter = _voterAddresses[i];
            if (!voters[_electionId][voter].isRegistered) {
                voters[_electionId][voter] =
                    Voter({voterAddress: voter, hasVoted: false, votedFor: 0, votingTime: 0, isRegistered: true});
                registeredVoters[_electionId].push(voter);
                emit VoterRegistered(_electionId, voter);
            }
        }
    }

    // ============ Voting Functions ============

    /**
     * @dev Cast a vote for a candidate
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate
     */
    function vote(uint256 _electionId, uint256 _candidateId)
        external
        electionExists(_electionId)
        electionActive(_electionId)
        voterNotVoted(_electionId, msg.sender)
    {
        require(_candidateId < candidateIds[_electionId].length, "Invalid candidate ID");
        require(candidates[_electionId][_candidateId].isActive, "Candidate is not active");

        // Record the vote
        voters[_electionId][msg.sender].hasVoted = true;
        voters[_electionId][msg.sender].votedFor = _candidateId;
        voters[_electionId][msg.sender].votingTime = block.timestamp;

        // Update candidate vote count
        candidates[_electionId][_candidateId].voteCount++;

        // Update election total votes
        elections[_electionId].totalVotes++;

        // Emit event for audit trail (transparency)
        emit VoteRecorded(_electionId, msg.sender, _candidateId, block.timestamp);
    }

    // ============ Query Functions ============

    /**
     * @dev Get election details
     * @param _electionId ID of the election
     */
    function getElection(uint256 _electionId) external view electionExists(_electionId) returns (Election memory) {
        return elections[_electionId];
    }

    /**
     * @dev Get candidate details
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate
     */
    function getCandidate(uint256 _electionId, uint256 _candidateId)
        external
        view
        electionExists(_electionId)
        returns (Candidate memory)
    {
        require(_candidateId < candidateIds[_electionId].length, "Invalid candidate ID");
        return candidates[_electionId][_candidateId];
    }

    /**
     * @dev Get all candidates for an election
     * @param _electionId ID of the election
     */
    function getAllCandidates(uint256 _electionId)
        external
        view
        electionExists(_electionId)
        returns (Candidate[] memory)
    {
        uint256[] memory ids = candidateIds[_electionId];
        Candidate[] memory result = new Candidate[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = candidates[_electionId][ids[i]];
        }

        return result;
    }

    /**
     * @dev Get voter details
     * @param _electionId ID of the election
     * @param _voterAddress Address of the voter
     */
    function getVoter(uint256 _electionId, address _voterAddress)
        external
        view
        electionExists(_electionId)
        returns (Voter memory)
    {
        return voters[_electionId][_voterAddress];
    }

    /**
     * @dev Get candidate with highest votes
     * @param _electionId ID of the election
     */
    function getWinner(uint256 _electionId) external view electionExists(_electionId) returns (Candidate memory) {
        require(elections[_electionId].isFinalized, "Election is not finalized");

        uint256[] memory ids = candidateIds[_electionId];
        require(ids.length > 0, "No candidates in this election");

        uint256 winnerIndex = 0;
        for (uint256 i = 1; i < ids.length; i++) {
            if (candidates[_electionId][ids[i]].voteCount > candidates[_electionId][ids[winnerIndex]].voteCount) {
                winnerIndex = i;
            }
        }

        return candidates[_electionId][ids[winnerIndex]];
    }

    /**
     * @dev Get election results
     * @param _electionId ID of the election
     */
    function getResults(uint256 _electionId) external view electionExists(_electionId) returns (Candidate[] memory) {
        uint256[] memory ids = candidateIds[_electionId];
        Candidate[] memory result = new Candidate[](ids.length);

        for (uint256 i = 0; i < ids.length; i++) {
            result[i] = candidates[_electionId][ids[i]];
        }

        return result;
    }

    /**
     * @dev Get registered voters count
     * @param _electionId ID of the election
     */
    function getRegisteredVotersCount(uint256 _electionId) external view electionExists(_electionId) returns (uint256) {
        return registeredVoters[_electionId].length;
    }

    /**
     * @dev Get candidates count
     * @param _electionId ID of the election
     */
    function getCandidatesCount(uint256 _electionId) external view electionExists(_electionId) returns (uint256) {
        return candidateIds[_electionId].length;
    }

    // ============ Election Control Functions ============

    /**
     * @dev Finalize election and lock results
     * @param _electionId ID of the election
     */
    function finalizeElection(uint256 _electionId) external electionExists(_electionId) {
        require(
            isElectionCommissioner[msg.sender] || msg.sender == elections[_electionId].creator,
            "Only commissioners can finalize elections"
        );
        require(block.timestamp >= elections[_electionId].endTime, "Voting period not ended");
        require(!elections[_electionId].isFinalized, "Election already finalized");

        elections[_electionId].isFinalized = true;
        elections[_electionId].isActive = false;

        emit ElectionFinalized(_electionId, block.timestamp);
    }

    /**
     * @dev End voting period early
     * @param _electionId ID of the election
     */
    function endVotingEarly(uint256 _electionId) external electionExists(_electionId) {
        require(
            isElectionCommissioner[msg.sender] || msg.sender == elections[_electionId].creator,
            "Only commissioners can end voting"
        );
        require(elections[_electionId].isActive, "Election is not active");

        elections[_electionId].isActive = false;
        emit ElectionStatusChanged(_electionId, false, block.timestamp);
    }

    /**
     * @dev Deactivate a candidate
     * @param _electionId ID of the election
     * @param _candidateId ID of the candidate
     */
    function deactivateCandidate(uint256 _electionId, uint256 _candidateId) external electionExists(_electionId) {
        require(
            isElectionCommissioner[msg.sender] || msg.sender == elections[_electionId].creator,
            "Only commissioners can deactivate candidates"
        );
        require(_candidateId < candidateIds[_electionId].length, "Invalid candidate ID");
        require(!elections[_electionId].isFinalized, "Election is finalized");

        candidates[_electionId][_candidateId].isActive = false;
    }
}
