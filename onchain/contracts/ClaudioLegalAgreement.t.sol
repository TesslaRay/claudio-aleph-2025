// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.19;

import {ClaudioLegalAgreement} from "./ClaudioLegalAgreement.sol";
import {Test} from "forge-std/Test.sol";

contract ClaudioLegalAgreementTest is Test {
    ClaudioLegalAgreement agreement;
    
    address claudioAddress = address(0x999);
    address employer = address(0x1);
    address coworker = address(0x2);
    address unauthorized = address(0x3);
    
    string caseId = "CASE-001";
    bytes32 caseIdHash = keccak256(abi.encodePacked(caseId));
    
    function setUp() public {
        agreement = new ClaudioLegalAgreement(claudioAddress);
    }
    
    // Test initial state
    function test_InitialState() public view {
        require(agreement.totalAgreements() == 0, "Initial total agreements should be 0");
        require(agreement.claudioAddress() == claudioAddress, "Claudio address should be set correctly");
    }
    
    // Test agreement creation
    function test_CreateAgreement() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        require(agreement.totalAgreements() == 1, "Total agreements should be 1");
        
        ClaudioLegalAgreement.Agreement memory agr = agreement.getAgreement(caseId);
        require(agr.employer == employer, "Employer should match");
        require(agr.coworker == coworker, "Coworker should match");
        require(!agr.employerSigned, "Employer should not be signed initially");
        require(!agr.coworkerSigned, "Coworker should not be signed initially");
        require(agr.exists, "Agreement should exist");
        require(agr.createdAt > 0, "CreatedAt should be set");
    }
    
    // Test agreement creation with hash
    function test_CreateAgreementWithHash() public {
        vm.prank(claudioAddress);
        agreement.createAgreementWithHash(caseIdHash, employer, coworker);
        
        ClaudioLegalAgreement.Agreement memory agr = agreement.getAgreementWithHash(caseIdHash);
        require(agr.employer == employer, "Employer should match");
        require(agr.coworker == coworker, "Coworker should match");
        require(agr.exists, "Agreement should exist");
    }
    
    // Test duplicate agreement creation fails
    function test_CreateDuplicateAgreementFails() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.prank(claudioAddress);
        vm.expectRevert(abi.encodeWithSelector(ClaudioLegalAgreement.AgreementAlreadyExists.selector, caseIdHash));
        agreement.createAgreement(caseId, employer, coworker);
    }
    
    // Test unauthorized creation fails
    function test_UnauthorizedCreationFails() public {
        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSelector(ClaudioLegalAgreement.NotAuthorizedCreator.selector, unauthorized));
        agreement.createAgreement(caseId, employer, coworker);
    }
    
    // Test invalid addresses
    function test_CreateAgreementInvalidEmployer() public {
        vm.prank(claudioAddress);
        vm.expectRevert(ClaudioLegalAgreement.InvalidAddress.selector);
        agreement.createAgreement(caseId, address(0), coworker);
    }
    
    function test_CreateAgreementInvalidCoworker() public {
        vm.prank(claudioAddress);
        vm.expectRevert(ClaudioLegalAgreement.InvalidAddress.selector);
        agreement.createAgreement(caseId, employer, address(0));
    }
    
    // Test same address validation
    function test_CreateAgreementSameAddress() public {
        vm.prank(claudioAddress);
        vm.expectRevert(ClaudioLegalAgreement.SameAddress.selector);
        agreement.createAgreement(caseId, employer, employer);
    }
    
    // Test employer signing
    function test_EmployerSign() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.prank(employer);
        agreement.signAgreement(caseId);
        
        require(agreement.hasSigned(caseId, employer), "Employer should have signed");
        require(!agreement.hasSigned(caseId, coworker), "Coworker should not have signed");
        require(!agreement.isCompleted(caseId), "Agreement should not be completed");
        
        ClaudioLegalAgreement.Agreement memory agr = agreement.getAgreement(caseId);
        require(agr.employerSigned, "Employer signed flag should be true");
        require(!agr.coworkerSigned, "Coworker signed flag should be false");
    }
    
    // Test coworker signing
    function test_CoworkerSign() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.prank(coworker);
        agreement.signAgreement(caseId);
        
        require(!agreement.hasSigned(caseId, employer), "Employer should not have signed");
        require(agreement.hasSigned(caseId, coworker), "Coworker should have signed");
        require(!agreement.isCompleted(caseId), "Agreement should not be completed");
    }
    
    // Test both parties signing completes agreement
    function test_BothPartiesSignCompletes() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.prank(employer);
        agreement.signAgreement(caseId);
        
        vm.prank(coworker);
        agreement.signAgreement(caseId);
        
        require(agreement.hasSigned(caseId, employer), "Employer should have signed");
        require(agreement.hasSigned(caseId, coworker), "Coworker should have signed");
        require(agreement.isCompleted(caseId), "Agreement should be completed");
    }
    
    // Test signing with hash functions
    function test_SignWithHash() public {
        vm.prank(claudioAddress);
        agreement.createAgreementWithHash(caseIdHash, employer, coworker);
        
        vm.prank(employer);
        agreement.signAgreementWithHash(caseIdHash);
        
        require(agreement.hasSignedWithHash(caseIdHash, employer), "Employer should have signed");
        require(agreement.isCompletedWithHash(caseIdHash) == false, "Agreement should not be completed");
        
        vm.prank(coworker);
        agreement.signAgreementWithHash(caseIdHash);
        
        require(agreement.isCompletedWithHash(caseIdHash), "Agreement should be completed");
    }
    
    // Test unauthorized signing fails
    function test_UnauthorizedSigningFails() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.prank(unauthorized);
        vm.expectRevert(abi.encodeWithSelector(ClaudioLegalAgreement.NotAuthorizedSigner.selector, caseIdHash, unauthorized));
        agreement.signAgreement(caseId);
    }
    
    // Test double signing fails
    function test_DoubleSigningFails() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.prank(employer);
        agreement.signAgreement(caseId);
        
        vm.prank(employer);
        vm.expectRevert(abi.encodeWithSelector(ClaudioLegalAgreement.AlreadySigned.selector, caseIdHash, employer));
        agreement.signAgreement(caseId);
    }
    
    // Test signing non-existent agreement fails
    function test_SignNonExistentAgreementFails() public {
        vm.prank(employer);
        vm.expectRevert(abi.encodeWithSelector(ClaudioLegalAgreement.AgreementNotFound.selector, caseIdHash));
        agreement.signAgreement(caseId);
    }
    
    // Test computeCaseIdHash utility
    function test_ComputeCaseIdHash() public view {
        bytes32 computed = agreement.computeCaseIdHash(caseId);
        require(computed == caseIdHash, "Computed hash should match expected hash");
    }
    
    // Test events are emitted correctly
    function test_AgreementCreatedEvent() public {
        vm.expectEmit(true, true, true, false);
        emit ClaudioLegalAgreement.AgreementCreated(caseIdHash, employer, coworker);
        
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
    }
    
    function test_AgreementSignedEvent() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.expectEmit(true, true, false, false);
        emit ClaudioLegalAgreement.AgreementSigned(caseIdHash, employer);
        
        vm.prank(employer);
        agreement.signAgreement(caseId);
    }
    
    function test_AgreementCompletedEvent() public {
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId, employer, coworker);
        
        vm.prank(employer);
        agreement.signAgreement(caseId);
        
        vm.expectEmit(true, false, false, false);
        emit ClaudioLegalAgreement.AgreementCompleted(caseIdHash);
        
        vm.prank(coworker);
        agreement.signAgreement(caseId);
    }
    
    // Fuzz test for different case IDs
    function testFuzz_DifferentCaseIds(string calldata randomCaseId) public {
        // Skip empty strings to avoid edge cases
        vm.assume(bytes(randomCaseId).length > 0);
        vm.assume(bytes(randomCaseId).length < 100); // Reasonable limit
        
        vm.prank(claudioAddress);
        agreement.createAgreement(randomCaseId, employer, coworker);
        
        vm.prank(employer);
        agreement.signAgreement(randomCaseId);
        
        vm.prank(coworker);
        agreement.signAgreement(randomCaseId);
        
        require(agreement.isCompleted(randomCaseId), "Agreement should be completed");
    }
    
    // Test multiple agreements
    function test_MultipleAgreements() public {
        string memory caseId1 = "CASE-001";
        string memory caseId2 = "CASE-002";
        address employer2 = address(0x4);
        address coworker2 = address(0x5);
        
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId1, employer, coworker);
        
        vm.prank(claudioAddress);
        agreement.createAgreement(caseId2, employer2, coworker2);
        
        require(agreement.totalAgreements() == 2, "Should have 2 agreements");
        
        vm.prank(employer);
        agreement.signAgreement(caseId1);
        
        vm.prank(employer2);
        agreement.signAgreement(caseId2);
        
        require(agreement.hasSigned(caseId1, employer), "Employer should have signed case 1");
        require(agreement.hasSigned(caseId2, employer2), "Employer2 should have signed case 2");
        require(!agreement.hasSigned(caseId1, coworker), "Coworker should not have signed case 1");
        require(!agreement.hasSigned(caseId2, coworker2), "Coworker2 should not have signed case 2");
    }
}