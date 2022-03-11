// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

import "./ERC1155Tradable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/token/ERC1155/utils/ERC1155Receiver.sol";

contract PinkBananaFactory is Ownable,ERC1155Receiver {
    using Counters for Counters.Counter;
    
    uint8 constant IS_USER = 0;
    uint8 constant IS_RESELLER = 1;
    uint8 constant IS_CREATOR = 2;

    struct SaleInfo {
        uint256 tokenId;
        string tokenHash;
        address creator;
        address currentOwner;
        uint256 startPrice;
        address maxBidder;
        uint256 maxBid;
        uint256 startTime;
        uint256 interval;
        uint8 kindOfCoin;
        bool _isOnSale;
    }

    struct RoyaltyInfo {
        uint256 totalAmount;
        uint256 sellerAmount;
        uint256 artistAmount;
        uint256 pinkTokenAmount;
        address pinkTokenAddress;
        uint256 pccTeamAmount;
        address pccTeamAddress;
        uint256 pinkTeamAmount;
        address pinkTeamAddress;
        uint256 devTeamAmount;
        address devTeamAddress;
    }

    struct BidInfo{
        address sender;
        address seller;
        address maxBidder;
        uint256 maxBidPrice;
        string tokenHash;
        uint256 tokenId;
    }
    
    enum AuctionState { 
        OPEN,
        CANCELLED,
        ENDED,
        DIRECT_BUY
    }

    bool _status;
    bool _isMinting;
    mapping(uint => RoyaltyInfo) _allRoyaltyInfo;
    uint256 _royaltyIdCounter;
    mapping(address => uint256) _mintingFees;

    address mkNFTaddress;
    ERC1155Tradable mkNFT;

    uint256 _saleId;
    uint256 _maxTokenId;
    
    mapping(uint => SaleInfo) public _allSaleInfo;
    mapping(string => uint) public _getSaleId;
    mapping(string => bool) public _tokenHashExists;
    mapping(address => uint8) public _isCreator;

    mapping(string => uint256) public _getNFTId;
    mapping(uint256 => string) public _uriFromId;

    modifier onlyAdmin() {
        require(_isCreator[msg.sender] == IS_CREATOR || owner() == msg.sender, "Not NFT creater...");
        _;
    }

    modifier onlyReseller() {
        require(_isCreator[msg.sender] == IS_RESELLER || _isCreator[msg.sender] == IS_CREATOR || owner() == msg.sender, "Not NFT reseller...");
        _;
    }
    modifier onlyCreator() {
        require(_isCreator[msg.sender] == IS_CREATOR || owner() == msg.sender, "Not NFT creator...");
        _;
    }

    modifier notOnlyNFTOwner(string memory _tokenHash) {
        require(_allSaleInfo[_getSaleId[_tokenHash]].currentOwner != msg.sender, "NFT Owner cannot bid...");
        _;
    }

    modifier onlyNFTOwner(string memory _tokenHash) {
        require(_allSaleInfo[_getSaleId[_tokenHash]].currentOwner == msg.sender || owner() == msg.sender, "NFT Owner cannot bid...");
        _;
    }

    modifier nonReentrant() {
        require(_status != true, "ReentrancyGuard: reentrant call");
        _status = true;
        _;
        _status = false;
    }

    constructor(address _nftAddress) {
        mkNFTaddress = _nftAddress;
        mkNFT = ERC1155Tradable(_nftAddress);
        _saleId = 0;
        _status = false;
        _isMinting = false;
        _maxTokenId = 1;

        RoyaltyInfo memory info;
        info.sellerAmount = 8750;
        info.artistAmount = 700;
        info.pinkTokenAmount = 22;
        info.pinkTokenAddress = 0x4a7798fC47F729A39b61Fc8373573dBb0c62e264;
        info.pccTeamAmount = 165;
        info.pccTeamAddress = 0x7c8597Ed7035711e4566C389d19B81a1Cf06E823;
        info.pinkTeamAmount = 352;
        info.pinkTeamAddress = 0x2722CDD58c0D77A1103fd6feE50226901F26dA64;
        info.devTeamAmount = 11;
        info.devTeamAddress = 0x697A32dB1BDEF9152F445b06d6A9Fd6E90c02E3e;

        setRoyalty(info);
        // for test
        setAuthentication(0x697A32dB1BDEF9152F445b06d6A9Fd6E90c02E3e, 2);
        setAuthentication(0x2722CDD58c0D77A1103fd6feE50226901F26dA64, 2);
        setAuthentication(0x7c8597Ed7035711e4566C389d19B81a1Cf06E823, 2);
    }

    function _createOrMint(
        address nftAddress,
        address _to,
        uint256 _id,
        uint256 _amount,
        bytes memory _data
    ) internal onlyCreator{
        ERC1155Tradable tradable = ERC1155Tradable(nftAddress);

        require(!tradable.exists(_id), "Already exist id");
        tradable.create(address(this), _id, _amount, "", _data);

        uint256[] memory ids = new uint256[](1);
        ids[0] = _id;
        tradable.setCreator(_to, ids);

        emit CreateToken(_to, _id, _amount, nftAddress);
    }

    function mintSingleNFT(string memory _tokenHash) internal onlyAdmin{
        require(!_tokenHashExists[_tokenHash], "Existing NFT hash value....");
        _createOrMint(mkNFTaddress, msg.sender, _maxTokenId, 1, "");
        _getNFTId[_tokenHash] = _maxTokenId;
        _setTokenUri(_maxTokenId, _tokenHash);
        _maxTokenId++;
        _tokenHashExists[_tokenHash] = true;
        _isMinting = true;
        emit MintSingleNFT(_tokenHash, _getNFTId[_tokenHash]);
    }

    function mintMultipleNFT(string[] memory _tokenHashs) internal {
        for (uint256 i = 0; i < _tokenHashs.length; i++) {
            require(!_tokenHashExists[_tokenHashs[i]], "Existing NFT hash value....");
            mintSingleNFT(_tokenHashs[i]);
        }
        _isMinting = true;
    }

    function createSale(string memory _tokenHash, uint _interval, uint _price, uint8 _kind) public nonReentrant returns (bool) {
        require(_interval >= 0, "Invalid auction interval....");
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");

        SaleInfo memory saleInfo;
        if (!_isMinting) {
            mkNFT.safeTransferFrom(msg.sender, address(this), _getNFTId[_tokenHash], 1, "");
            saleInfo = SaleInfo(_saleId, _tokenHash, _allSaleInfo[_getSaleId[_tokenHash]].creator, msg.sender, _price, address(0), 0, block.timestamp, _interval, _kind, true);
        } else {
            saleInfo = SaleInfo(_saleId, _tokenHash, msg.sender, msg.sender, _price, address(0), 0, block.timestamp, _interval, _kind, true);
        }
              
        _allSaleInfo[_saleId] = saleInfo;
        _getSaleId[_tokenHash] = _saleId;
        _saleId++;
        emit CreateSale(msg.sender, _tokenHash, _getNFTId[_tokenHash], _interval, _price, _kind);

        return true;
    }

    function createBatchSale(string[] memory _tokenHashs, uint _interval, uint _price, uint8 _kind) public {
        for (uint256 i = 0; i < _tokenHashs.length; i++) {
            createSale(_tokenHashs[i], _interval, _price, _kind);
        }
    }

    function singleMintOnSale(string memory _tokenHash, uint _interval, uint _price, uint8 _kind) external payable {
        require(msg.value >= _mintingFees[msg.sender], "insufficient minting fee");
        if(mkNFT.balanceOf(msg.sender, _getNFTId[_tokenHash]) == 0) {
            mintSingleNFT(_tokenHash);
        }
        createSale(_tokenHash, _interval, _price, _kind);
        _isMinting = false;
    }

    function batchMintOnSale(string[] memory _tokenHash, uint _interval, uint _price, uint8 _kind) external payable {
        mintMultipleNFT(_tokenHash);
        createBatchSale(_tokenHash, _interval, _price, _kind);
        _isMinting = false;
    }

    function destroySale(string memory _tokenHash) external onlyReseller nonReentrant returns (bool) {
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");
        require(getAuctionState(_tokenHash) != AuctionState.CANCELLED, "Auction state is already cancelled...");

        if (_allSaleInfo[_getSaleId[_tokenHash]].maxBid != 0) {
            customizedTransfer(payable(_allSaleInfo[_getSaleId[_tokenHash]].maxBidder), _allSaleInfo[_getSaleId[_tokenHash]].maxBid, _allSaleInfo[_getSaleId[_tokenHash]].kindOfCoin);
        }

        mkNFT.safeTransferFrom(address(this), _allSaleInfo[_getSaleId[_tokenHash]].currentOwner, _getNFTId[_tokenHash], 1, "");
        _allSaleInfo[_getSaleId[_tokenHash]]._isOnSale = false;
        emit DestroySale(_allSaleInfo[_getSaleId[_tokenHash]].currentOwner, _tokenHash, _getNFTId[_tokenHash]);
    
        return true;
    }

    function placeBidReal(string memory _tokenHash) internal notOnlyNFTOwner(_tokenHash) returns(address bidder, uint256 price, string memory tokenHash, uint256 tokenId){
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");

        if (_allSaleInfo[_getSaleId[_tokenHash]].kindOfCoin > 0) {
            //_payToken.transferFrom(msg.sender, address(this), msg.value);
        }

        address lastHightestBidder = _allSaleInfo[_getSaleId[_tokenHash]].maxBidder;
        uint256 lastHighestBid = _allSaleInfo[_getSaleId[_tokenHash]].maxBid;
        _allSaleInfo[_getSaleId[_tokenHash]].maxBid = msg.value;
        _allSaleInfo[_getSaleId[_tokenHash]].maxBidder = msg.sender;

        if (lastHighestBid != 0) {
            customizedTransfer(payable(lastHightestBidder), lastHighestBid, _allSaleInfo[_getSaleId[_tokenHash]].kindOfCoin);
        }
        return (msg.sender, msg.value, _tokenHash, _getNFTId[_tokenHash]);
    }

    function placeBid(string memory _tokenHash) payable external nonReentrant notOnlyNFTOwner(_tokenHash) returns (bool) {
        address bidder;
        uint256 price;
        string memory tokenHash;
        uint256 tokenId;
        require(getAuctionState(_tokenHash) == AuctionState.OPEN, "Auction state is not open.");
        require(msg.value > _allSaleInfo[_getSaleId[_tokenHash]].startPrice, "less than max bid price");
        
        (bidder, price, tokenHash, tokenId) = placeBidReal(_tokenHash);
        emit PlaceBid(bidder, price, tokenHash, tokenId);
        return true;
    }

    function buyNow(string memory _tokenHash) payable external nonReentrant{
        RoyaltyInfo memory royaltyInfo;
        require(getAuctionState(_tokenHash) == AuctionState.DIRECT_BUY, "Auction state is not buy now");
        require(msg.value >= _allSaleInfo[_getSaleId[_tokenHash]].startPrice, "less than purchase price");
        placeBidReal(_tokenHash);
        BidInfo memory bidInfo;
        (bidInfo, royaltyInfo) = performBidReal(_tokenHash);
        emit BuyNow(bidInfo.sender, bidInfo.seller, bidInfo.maxBidder, bidInfo.maxBidPrice, bidInfo.tokenHash, bidInfo.tokenId, royaltyInfo);
    }

    function performBidReal(string memory _tokenHash) internal returns(BidInfo memory bidInfos, RoyaltyInfo memory royaltyInfos){
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");
        require(getAuctionState(_tokenHash) == AuctionState.OPEN || getAuctionState(_tokenHash) == AuctionState.ENDED || getAuctionState(_tokenHash) == AuctionState.DIRECT_BUY, "Auction state is not correct...");
        SaleInfo memory saleInfo = _allSaleInfo[_getSaleId[_tokenHash]];
        RoyaltyInfo memory royaltyInfo = _allRoyaltyInfo[_royaltyIdCounter];
        royaltyInfo.artistAmount = saleInfo.maxBid * royaltyInfo.artistAmount / royaltyInfo.totalAmount;
        royaltyInfo.pinkTokenAmount = saleInfo.maxBid * royaltyInfo.pinkTokenAmount / royaltyInfo.totalAmount;
        royaltyInfo.pccTeamAmount = saleInfo.maxBid * royaltyInfo.pccTeamAmount / royaltyInfo.totalAmount;
        royaltyInfo.pinkTeamAmount = saleInfo.maxBid * royaltyInfo.pinkTeamAmount / royaltyInfo.totalAmount;
        royaltyInfo.devTeamAmount = saleInfo.maxBid * royaltyInfo.devTeamAmount / royaltyInfo.totalAmount;
        royaltyInfo.sellerAmount = saleInfo.maxBid - royaltyInfo.artistAmount - royaltyInfo.pinkTokenAmount - royaltyInfo.pccTeamAmount - royaltyInfo.pinkTeamAmount - royaltyInfo.devTeamAmount;

        mkNFT.safeTransferFrom(address(this), saleInfo.maxBidder, _getNFTId[_tokenHash], 1, "");

        if(royaltyInfo.artistAmount > 0) {
            customizedTransfer(payable(saleInfo.creator), royaltyInfo.artistAmount, saleInfo.kindOfCoin);
        }
        if(royaltyInfo.pinkTokenAmount > 0) {
            customizedTransfer(payable(royaltyInfo.pinkTokenAddress), royaltyInfo.pinkTokenAmount, saleInfo.kindOfCoin);
        }
        if(royaltyInfo.pccTeamAmount > 0) {
            customizedTransfer(payable(royaltyInfo.pccTeamAddress), royaltyInfo.pccTeamAmount, saleInfo.kindOfCoin);
        }
        if(royaltyInfo.pinkTeamAmount > 0) {
            customizedTransfer(payable(royaltyInfo.pinkTeamAddress), royaltyInfo.pinkTeamAmount, saleInfo.kindOfCoin);
        }
        if(royaltyInfo.devTeamAmount > 0) {
            customizedTransfer(payable(royaltyInfo.devTeamAddress), royaltyInfo.devTeamAmount, saleInfo.kindOfCoin);
        }
        if(royaltyInfo.sellerAmount > 0) {
            customizedTransfer(payable(saleInfo.currentOwner), royaltyInfo.sellerAmount, saleInfo.kindOfCoin);
        }

        address seller = saleInfo.currentOwner;
        saleInfo.currentOwner = saleInfo.maxBidder;
        saleInfo.startPrice = saleInfo.maxBid;
        saleInfo._isOnSale = true;

        _allSaleInfo[_getSaleId[_tokenHash]] = saleInfo;
        BidInfo memory bidInfo;
        bidInfo = BidInfo(msg.sender, seller, saleInfo.maxBidder, saleInfo.maxBid, _tokenHash, _getNFTId[_tokenHash]);
        return (bidInfo, royaltyInfo);
    }

    function performBid(string memory _tokenHash) external nonReentrant returns (bool) {
        RoyaltyInfo memory royaltyInfo;
        BidInfo memory bidInfo;
        if(bidInfo.sender == bidInfo.seller) {
            require(getAuctionState(_tokenHash) == AuctionState.OPEN, "Auction state is not open.");
        } else {
            require(getAuctionState(_tokenHash) == AuctionState.ENDED, "Auction state is not ended.");
        }
        (bidInfo, royaltyInfo) = performBidReal(_tokenHash);
        if(bidInfo.sender == bidInfo.seller) {
            emit AcceptBid(bidInfo.sender, bidInfo.seller, bidInfo.maxBidder, bidInfo.maxBidPrice, bidInfo.tokenHash, bidInfo.tokenId, royaltyInfo);
        } else {
            emit EndBid(bidInfo.sender, bidInfo.seller, bidInfo.maxBidder, bidInfo.maxBidPrice, bidInfo.tokenHash, bidInfo.tokenId, royaltyInfo);
        }
        return true;
    }

    function getAuthentication(address _addr) external view returns (uint8) {
        require(_addr != address(0), "Invalid input address...");
        return _isCreator[_addr];
    }

    function getAuctionState(string memory _tokenHash) public view returns (AuctionState) {
        if (!_allSaleInfo[_getSaleId[_tokenHash]]._isOnSale) return AuctionState.CANCELLED;
        if (_allSaleInfo[_getSaleId[_tokenHash]].interval == 0) return AuctionState.DIRECT_BUY;
        if (block.timestamp >= _allSaleInfo[_getSaleId[_tokenHash]].startTime + _allSaleInfo[_getSaleId[_tokenHash]].interval) return AuctionState.ENDED;
        return AuctionState.OPEN;
    } 

    function getSaleInfo(string memory _tokenHash) public view returns (SaleInfo memory) {
        require(_tokenHashExists[_tokenHash], "Non-Existing NFT hash value....");

        return _allSaleInfo[_getSaleId[_tokenHash]];
    }

    function getWithdrawBalance(uint8 _kind) public view returns (uint256) {
        require(_kind >= 0, "Invalid cryptocurrency...");
        return address(this).balance;
    }

    function setAuthentication(address _addr, uint8 _flag) public onlyOwner {
        require(_addr != address(0), "Invalid input address...");
        _isCreator[_addr] = _flag;
        emit SetAuthentication(msg.sender, _addr, _flag);
    }

    function setMintingFee(address _creator, uint256 _amount) external onlyOwner {
        require(_creator != address(0), "Invalid input address...");
        require(_amount >= 0, "Too small amount");
        _mintingFees[_creator] = _amount;
        emit SetMintingFee(msg.sender, _creator, _amount);
    }

    function getRoyalty() external view returns(RoyaltyInfo memory){
        return _allRoyaltyInfo[_royaltyIdCounter];
    }

    function setRoyalty(RoyaltyInfo memory info) public onlyOwner {
        require(info.pinkTeamAddress != address(0), "invalid pinkTeam address");
        require(info.pccTeamAddress != address(0), "invalid pccTeam address");
        require(info.pinkTokenAddress != address(0), "invalid pinkToken address");
        require(info.devTeamAddress != address(0), "invalid developer address");
        info.totalAmount = info.sellerAmount + info.artistAmount + info.pinkTokenAmount + info.pccTeamAmount + info.pinkTeamAmount + info.devTeamAmount;
        require(info.totalAmount > 0, "invalid parameter");
        _royaltyIdCounter++;
        _allRoyaltyInfo[_royaltyIdCounter] = info;
        emit SetRoyalty(msg.sender, info);
    }

    function customizedTransfer(address payable _to, uint256 _amount, uint8 _kind) internal {
        require(_to != address(0), "Invalid address...");
        if(_amount > 0) {
            if (_kind == 0) {
            _to.transfer(_amount);
            }
            emit CustomizedTransfer(msg.sender, _to, _amount, _kind);
        }
    }

    function withDraw(uint256 _amount, uint8 _kind) external onlyOwner {
        require(_amount > 0, "Invalid withdraw amount...");
        require(_kind >= 0, "Invalid cryptocurrency...");
        require(getWithdrawBalance(_kind) > _amount, "None left to withdraw...");

        customizedTransfer(payable(msg.sender), _amount, _kind);
    }

    function withDrawAll(uint8 _kind) external onlyOwner {
        require(_kind >= 0, "Invalid cryptocurrency...");
        uint256 remaining = getWithdrawBalance(_kind);
        require(remaining > 0, "None left to withdraw...");

        customizedTransfer(payable(msg.sender), remaining, _kind);
    }

    function _setTokenUri(uint256 _tokenId, string memory _uri) internal {
        _uriFromId[_tokenId] = _uri;
        emit SetTokenUri(_tokenId, _uri);
    }

    function transferNFTOwner(address to) external onlyOwner {
        mkNFT.transferOwnership(to);
        emit TransferNFTOwner(msg.sender, to);
    }

    function transferNFT(address to, string memory tokenHash) external onlyNFTOwner(tokenHash){
        mkNFT.safeTransferFrom(msg.sender, to, _getNFTId[tokenHash], 1, "");
        emit TransferNFT(msg.sender, to, tokenHash, _getNFTId[tokenHash]);
    }

    function transferNFTFrom(address from, address to, uint256 tokenId) external onlyOwner{
        mkNFT.safeTransferFrom(from, to, tokenId, 1, "");
    }

    function changePrice(string memory tokenHash, uint256 newPrice) external onlyNFTOwner(tokenHash){
        uint256 saleId = _getSaleId[tokenHash];
        uint256 oldPrice = _allSaleInfo[saleId].startPrice;
        _allSaleInfo[saleId].startPrice = newPrice;
        emit ChangePrice(msg.sender, tokenHash, oldPrice, newPrice);
    }

    function burnNFT(string memory tokenHash) external onlyNFTOwner(tokenHash) {
        mkNFT.safeTransferFrom(msg.sender, address(0), _getNFTId[tokenHash], 1, "");
        emit BurnNFT(msg.sender, tokenHash, _getNFTId[tokenHash]);
    }

    function getNFTAddress() external view returns(address nftAddress) {
        return mkNFTaddress;
    }

    function setNFTAddress(address nftAddress) external onlyOwner {
        mkNFTaddress = nftAddress;
        mkNFT = ERC1155Tradable(nftAddress);
        emit SetNFTAddress(msg.sender, nftAddress);
    }

    function getSaleId() external view returns(uint256){
        return _saleId;
    }

    function setSaleId(uint256 saleId) external onlyOwner{
        _saleId = saleId;
    }

    function getMaxTokenId() external view returns(uint256) {
        return _maxTokenId;
    }

    function setMaxTokenId(uint256 maxTokenId) external onlyOwner {
        _maxTokenId = maxTokenId;
    }

    receive() payable external {

    }

    fallback() payable external {

    }
    
    function onERC1155Received(address, address, uint256, uint256, bytes memory) public pure virtual returns (bytes4) {
        return this.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(address, address, uint256[] memory, uint256[] memory, bytes memory) public virtual returns (bytes4) {
        return this.onERC1155BatchReceived.selector;
    }

    event SetTokenUri(uint256 tokenId, string uri);
    event CreateToken(address to, uint256 tokenId, uint256 amount, address nftAddress);
    event MintSingleNFT(string tokenHash, uint256 tokenId);
    event CreateSale(address seller, string tokenHash, uint256 tokenId, uint256 interval, uint256 price, uint8 kind);
    event DestroySale(address seller, string tokenHash, uint256 tokenId);
    event PlaceBid(address bidder, uint256 price, string tokenHash, uint256 tokenId);
    event AcceptBid(address caller, address seller, address buyer, uint256 price, string tokenHash, uint256 tokenId, RoyaltyInfo royaltyInfo);
    event EndBid(address caller, address seller, address buyer, uint256 price, string tokenHash, uint256 tokenId, RoyaltyInfo royaltyInfo);
    event BuyNow(address caller, address seller, address buyer, uint256 price, string tokenHash, uint256 tokenId, RoyaltyInfo royaltyInfo);
    event SetAuthentication(address sender, address addr, uint256 flag);
    event SetMintingFee(address sender, address creator, uint256 amount);
    event SetRoyalty(address sender, RoyaltyInfo info);
    event CustomizedTransfer(address sender, address to, uint256 amount, uint8 kind);
    event TransferNFTOwner(address sender, address to);
    event ChangePrice(address sender,string tokenHash, uint256 oldPrice, uint256 newPrice);
    event TransferNFT(address sender, address receiver, string tokenHash, uint256 tokenId);
    event BurnNFT(address sender, string tokenHash, uint256 tokenId);
    event SetNFTAddress(address sender, address nftAddress);
}