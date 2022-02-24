// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import './IUniswapV2Router02.sol';
import './IUniswapV2Factory.sol';

contract PinkToken is ERC20, Ownable {

    event Received(address, uint);
    event Fallback(address, uint);

    address private STABLE_COIN                         = 0x0f4C9ca5c722Cd93D8FA1db2B632b31Aa8f30353;
    address private TREASURY_WALLET                     = 0x0f4C9ca5c722Cd93D8FA1db2B632b31Aa8f30353;
    address private DEV_WALLET                          = 0x0f4C9ca5c722Cd93D8FA1db2B632b31Aa8f30353;
    IUniswapV2Factory private factory;
    IUniswapV2Router02 private router;

    uint256 private TOTAL_SUPPLY                        = 1000000000;
    uint256 private WHITELIST_TOTAL_SUPPLY              = 100000000;
    uint256 private WHITELIST_PRICE                     = 1000000;
    uint256 private WHITELIST_LIMIT_PER_USER            = 2000000;
    uint256 private SELLING_FEE                         = 10; //100percent
    uint256 private total_amount_presaled;

    struct WHITELIST_INFO{
        bool enable;
        uint256 amount;
    }

    mapping( address => WHITELIST_INFO ) whitelist;

    constructor(address owner) ERC20("PINK", "PINK") {
        super._mint(owner, TOTAL_SUPPLY * 10**18);
        factory = IUniswapV2Factory(0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f);
        router = IUniswapV2Router02(0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D);
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable { 
        emit Fallback(msg.sender, msg.value);
    }

    function setFactory(address _factory) external{
        factory = IUniswapV2Factory(_factory);
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public virtual override returns (bool) {
        
        uint256 userAmount = amount;
        uint256 treasuryAmount = 0;
        uint256 devAmount = 0;               

        if( to == factory.getPair(address(this), router.WETH()) )
        {
            userAmount = amount * (100 - SELLING_FEE) / 100;
            treasuryAmount = (amount - userAmount) * 7 / 10;
            devAmount = amount - userAmount - treasuryAmount;
            super.transferFrom(from, TREASURY_WALLET, treasuryAmount);
            super.transferFrom(from, DEV_WALLET, devAmount);
        }
        
        super.transferFrom(from, to, userAmount);
        return true;
    }

}