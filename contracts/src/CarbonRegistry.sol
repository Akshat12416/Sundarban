// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {AccessControl} from "@openzeppelin/contracts/access/AccessControl.sol";
import {Pausable} from "@openzeppelin/contracts/utils/Pausable.sol";

/// @notice Carbon credits for approved afforestation projects. Only hashes and amounts are stored.
contract CarbonRegistry is ERC20, ERC20Burnable, AccessControl, Pausable {
    bytes32 public constant ISSUER_ROLE = keccak256("ISSUER_ROLE");

    struct Project {
        address owner;
        bytes32 dataHash;
        bytes32 evidenceRoot;
        bytes32 parcelHash;
        bytes32 reportHash;
        uint256 credits;
        uint256 timestamp;
    }

    uint256 private _nextId = 1;
    mapping(uint256 => Project) private _projects;
    mapping(bytes32 => uint256) public projectIdByDataHash;
    mapping(bytes32 => bool) private _parcelUsed;

    event ProjectRegistered(
        uint256 indexed projectId,
        address indexed owner,
        bytes32 dataHash,
        bytes32 evidenceRoot,
        bytes32 parcelHash,
        bytes32 reportHash,
        uint256 credits,
        uint256 timestamp
    );

    event CreditsRetired(address indexed account, uint256 amount, string reason);

    constructor(address admin) ERC20("Carbon Credit", "CC") {
        if (admin == address(0)) revert ZeroAddress();
        _grantRole(DEFAULT_ADMIN_ROLE, admin);
    }

    error ZeroAddress();
    error ZeroCredits();
    error DataHashUsed();
    error ParcelHashUsed();

    function registerProject(
        address owner,
        bytes32 dataHash,
        bytes32 evidenceRoot,
        bytes32 parcelHash,
        bytes32 reportHash,
        uint256 credits
    ) external onlyRole(ISSUER_ROLE) whenNotPaused returns (uint256 projectId) {
        if (owner == address(0)) revert ZeroAddress();
        if (credits == 0) revert ZeroCredits();
        if (projectIdByDataHash[dataHash] != 0) revert DataHashUsed();
        if (_parcelUsed[parcelHash]) revert ParcelHashUsed();

        projectId = _nextId++;
        projectIdByDataHash[dataHash] = projectId;
        _parcelUsed[parcelHash] = true;
        _projects[projectId] = Project({
            owner: owner,
            dataHash: dataHash,
            evidenceRoot: evidenceRoot,
            parcelHash: parcelHash,
            reportHash: reportHash,
            credits: credits,
            timestamp: block.timestamp
        });
        _mint(owner, credits);
        emit ProjectRegistered(
            projectId,
            owner,
            dataHash,
            evidenceRoot,
            parcelHash,
            reportHash,
            credits,
            block.timestamp
        );
    }

    function retire(uint256 amount, string calldata reason) external whenNotPaused {
        _burn(msg.sender, amount);
        emit CreditsRetired(msg.sender, amount, reason);
    }

    function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
        _unpause();
    }

    function getProject(uint256 projectId) external view returns (Project memory) {
        return _projects[projectId];
    }

    function _update(address from, address to, uint256 value) internal override whenNotPaused {
        super._update(from, to, value);
    }
}
