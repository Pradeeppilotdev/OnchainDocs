// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Base64.sol";

contract DocumentSBT is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // Mapping from token ID to IPFS hash
    mapping(uint256 => string) public tokenToIPFS;
    
    // Mapping from IPFS hash to token ID
    mapping(string => uint256) public ipfsToTokenId;
    
    // Mapping from user address to their token IDs
    mapping(address => uint256[]) public userTokens;

    event DocumentMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string ipfsHash
    );

    constructor() ERC721("GovChain Document SBT", "GCDSBT") Ownable(msg.sender) {}

    // Override transfer functions to make token non-transferable
    function _beforeTokenTransfer(
        address from,
        address to
    ) internal virtual {
        require(from == address(0) || to == address(0), "SBT: Token is non-transferable");
    }

    function mintDocument(
        address owner,
        string memory ipfsHash
    ) public onlyOwner returns (uint256) {
        // Check if document with this IPFS hash already exists
        require(ipfsToTokenId[ipfsHash] == 0, "Document already minted");

        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();

        // Store IPFS hash
        tokenToIPFS[newTokenId] = ipfsHash;
        ipfsToTokenId[ipfsHash] = newTokenId;
        userTokens[owner].push(newTokenId);

        // Mint the token
        _mint(owner, newTokenId);

        emit DocumentMinted(owner, newTokenId, ipfsHash);

        return newTokenId;
    }

    function getIPFSHash(uint256 tokenId) public view returns (string memory) {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "Token does not exist");
        return tokenToIPFS[tokenId];
    }

    function getUserTokens(address user) public view returns (uint256[] memory) {
        return userTokens[user];
    }

    function getTokenIdByIPFS(string memory ipfsHash) public view returns (uint256) {
        return ipfsToTokenId[ipfsHash];
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        require(tokenId > 0 && tokenId <= _tokenIds.current(), "Token does not exist");
        
        string memory ipfsHash = tokenToIPFS[tokenId];
        
        // Construct the metadata JSON
        string memory metadata = string(abi.encodePacked(
            '{"name": "GovChain Document SBT #', 
            Strings.toString(tokenId),
            '", "description": "A Soulbound Token representing a verified government document", ',
            '"image": "ipfs://', 
            ipfsHash,
            '", "attributes": [{"trait_type": "Document Type", "value": "Government Document"}, ',
            '{"trait_type": "IPFS Hash", "value": "', 
            ipfsHash,
            '"}]}'
        ));
        
        // Return the metadata as a base64 encoded data URI
        return string(abi.encodePacked(
            "data:application/json;base64,",
            Base64.encode(bytes(metadata))
        ));
    }
} 