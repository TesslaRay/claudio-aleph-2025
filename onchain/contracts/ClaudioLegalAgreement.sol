// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ClaudioLegalAgreement
 * @dev Smart contract for registering and tracking legal agreements between two parties
 * @notice This contract allows employers and coworkers to create and sign legal agreements on-chain
 */
contract ClaudioLegalAgreement {
    
    struct Agreement {
        address employer;
        address coworker;
        bool employerSigned;
        bool coworkerSigned;
        uint256 createdAt;
        bool exists;
    }
    
    mapping(bytes32 => Agreement) public agreements;
    
    mapping(bytes32 => mapping(address => bool)) public hasSignedMapping;
    
    uint256 public totalAgreements;
    
    address public immutable claudioAddress;
    
    event AgreementCreated(bytes32 indexed caseId, address indexed employer, address indexed coworker);
    event AgreementSigned(bytes32 indexed caseId, address indexed signer);
    event AgreementCompleted(bytes32 indexed caseId);
    
    error AgreementAlreadyExists(bytes32 caseId);
    error AgreementNotFound(bytes32 caseId);
    error NotAuthorizedSigner(bytes32 caseId, address signer);
    error AlreadySigned(bytes32 caseId, address signer);
    error InvalidAddress();
    error SameAddress();
    error NotAuthorizedCreator(address sender);
    
    modifier agreementExists(bytes32 caseId) {
        if (!agreements[caseId].exists) {
            revert AgreementNotFound(caseId);
        }
        _;
    }
    
    modifier validAddress(address addr) {
        if (addr == address(0)) {
            revert InvalidAddress();
        }
        _;
    }
    
    modifier authorizedSigner(bytes32 caseId) {
        Agreement storage agreement = agreements[caseId];
        if (msg.sender != agreement.employer && msg.sender != agreement.coworker) {
            revert NotAuthorizedSigner(caseId, msg.sender);
        }
        _;
    }
    
    modifier onlyClaudio() {
        if (msg.sender != claudioAddress) {
            revert NotAuthorizedCreator(msg.sender);
        }
        _;
    }
    
    constructor(address _claudioAddress) validAddress(_claudioAddress) {
        claudioAddress = _claudioAddress;
    }
    
    /**
     * @dev Creates a new legal agreement between employer and coworker
     * @param caseId Unique identifier for the agreement (converted to bytes32)
     * @param employer Address of the employer party
     * @param coworker Address of the coworker party
     */
    function createAgreement(
        string calldata caseId,
        address employer,
        address coworker
    ) external onlyClaudio validAddress(employer) validAddress(coworker) {
        if (employer == coworker) {
            revert SameAddress();
        }
        
        bytes32 caseIdHash = keccak256(abi.encodePacked(caseId));
        
        if (agreements[caseIdHash].exists) {
            revert AgreementAlreadyExists(caseIdHash);
        }
        
        agreements[caseIdHash] = Agreement({
            employer: employer,
            coworker: coworker,
            employerSigned: false,
            coworkerSigned: false,
            createdAt: block.timestamp,
            exists: true
        });
        
        totalAgreements++;
        
        emit AgreementCreated(caseIdHash, employer, coworker);
    }
    
    /**
     * @dev Alternative function using bytes32 directly for gas efficiency
     * @param caseIdHash Pre-hashed case ID
     * @param employer Address of the employer party
     * @param coworker Address of the coworker party
     */
    function createAgreementWithHash(
        bytes32 caseIdHash,
        address employer,
        address coworker
    ) external onlyClaudio validAddress(employer) validAddress(coworker) {
        if (employer == coworker) {
            revert SameAddress();
        }
        
        if (agreements[caseIdHash].exists) {
            revert AgreementAlreadyExists(caseIdHash);
        }
        
        agreements[caseIdHash] = Agreement({
            employer: employer,
            coworker: coworker,
            employerSigned: false,
            coworkerSigned: false,
            createdAt: block.timestamp,
            exists: true
        });
        
        totalAgreements++;
        
        emit AgreementCreated(caseIdHash, employer, coworker);
    }
    
    /**
     * @dev Sign an agreement using string caseId
     * @param caseId String identifier of the agreement to sign
     */
    function signAgreement(string calldata caseId) 
        external 
    {
        bytes32 caseIdHash = keccak256(abi.encodePacked(caseId));
        _signAgreement(caseIdHash);
    }
    
    /**
     * @dev Sign an agreement using bytes32 caseId for gas efficiency
     * @param caseIdHash Hash of the case ID to sign
     */
    function signAgreementWithHash(bytes32 caseIdHash) 
        external 
    {
        _signAgreement(caseIdHash);
    }
    
    /**
     * @dev Internal function to handle agreement signing logic
     * @param caseIdHash Hash of the case ID to sign
     */
    function _signAgreement(bytes32 caseIdHash) 
        internal 
        agreementExists(caseIdHash) 
        authorizedSigner(caseIdHash) 
    {
        Agreement storage agreement = agreements[caseIdHash];
        
        if (hasSignedMapping[caseIdHash][msg.sender]) {
            revert AlreadySigned(caseIdHash, msg.sender);
        }
        
        if (msg.sender == agreement.employer) {
            agreement.employerSigned = true;
        } else {
            agreement.coworkerSigned = true;
        }
        
        hasSignedMapping[caseIdHash][msg.sender] = true;
        
        emit AgreementSigned(caseIdHash, msg.sender);
        
        if (agreement.employerSigned && agreement.coworkerSigned) {
            emit AgreementCompleted(caseIdHash);
        }
    }
    
    /**
     * @dev Check if a specific address has signed an agreement
     * @param caseId String identifier of the agreement
     * @param signer Address to check
     * @return bool indicating if the address has signed
     */
    function hasSigned(string calldata caseId, address signer) 
        external 
        view 
        returns (bool) 
    {
        bytes32 caseIdHash = keccak256(abi.encodePacked(caseId));
        return hasSignedMapping[caseIdHash][signer];
    }
    
    /**
     * @dev Check if a specific address has signed an agreement (bytes32 version)
     * @param caseIdHash Hash of the case ID
     * @param signer Address to check
     * @return bool indicating if the address has signed
     */
    function hasSignedWithHash(bytes32 caseIdHash, address signer) 
        external 
        view 
        returns (bool) 
    {
        return hasSignedMapping[caseIdHash][signer];
    }
    
    /**
     * @dev Check if an agreement is completed (both parties signed)
     * @param caseId String identifier of the agreement
     * @return bool indicating if the agreement is completed
     */
    function isCompleted(string calldata caseId) 
        external 
        view 
        returns (bool) 
    {
        bytes32 caseIdHash = keccak256(abi.encodePacked(caseId));
        Agreement storage agreement = agreements[caseIdHash];
        return agreement.exists && agreement.employerSigned && agreement.coworkerSigned;
    }
    
    /**
     * @dev Check if an agreement is completed (bytes32 version)
     * @param caseIdHash Hash of the case ID
     * @return bool indicating if the agreement is completed
     */
    function isCompletedWithHash(bytes32 caseIdHash) 
        external 
        view 
        returns (bool) 
    {
        Agreement storage agreement = agreements[caseIdHash];
        return agreement.exists && agreement.employerSigned && agreement.coworkerSigned;
    }
    
    /**
     * @dev Get agreement details
     * @param caseId String identifier of the agreement
     * @return Agreement struct with all details
     */
    function getAgreement(string calldata caseId) 
        external 
        view 
        returns (Agreement memory) 
    {
        bytes32 caseIdHash = keccak256(abi.encodePacked(caseId));
        return agreements[caseIdHash];
    }
    
    /**
     * @dev Get agreement details (bytes32 version)
     * @param caseIdHash Hash of the case ID
     * @return Agreement struct with all details
     */
    function getAgreementWithHash(bytes32 caseIdHash) 
        external 
        view 
        returns (Agreement memory) 
    {
        return agreements[caseIdHash];
    }
    
    /**
     * @dev Utility function to compute caseId hash off-chain validation
     * @param caseId String to hash
     * @return bytes32 hash of the caseId
     */
    function computeCaseIdHash(string calldata caseId) 
        external 
        pure 
        returns (bytes32) 
    {
        return keccak256(abi.encodePacked(caseId));
    }
}