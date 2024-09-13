    // SPDX-License-Identifier: MIT 
    pragma solidity ^0.8.0; 
    
    contract WriteToEarn { 
        address public owner; 
    uint256 public totalWriters; 
    
    mapping(address => uint256) public writerBalances; 
    mapping(address => bool) public isSubscriber; 
    
    uint256 public commissionRate; // Commission rate in percentage (e.g., 5 for 5%) 
    
    event WriterRegistered(address indexed writer, uint256 initialBalance); 
    event WriterEarned(address indexed writer, uint256 earnedAmount); 
    event CommissionReceived(address indexed writer, uint256 commissionAmount); 
    event SubscriptionRenewed(address indexed writer); 
    
    constructor(uint256 _commissionRate) { 
        owner = msg.sender; 
        commissionRate = _commissionRate; 
    } 

    modifier notRegisteredWriter() { 
        require(writerBalances[msg.sender] == 0, "You are already registered as a writer."); 
        _; 
    }

    function registerWriter() external notRegisteredWriter {
        writerBalances[msg.sender] = 1; // Начальный баланс (например, 1 токен)
        totalWriters++;
        emit WriterRegistered(msg.sender, 1);
    }

    function earn() external payable {
        uint256 earnedAmount = 100; // Пример: заработать 100 токенов за написание
        uint256 commission = (earnedAmount * commissionRate) / 100;

        // Распределить заработанную сумму и комиссию
        writerBalances[msg.sender] += earnedAmount - commission;
        writerBalances[owner] += commission;

        emit WriterEarned(msg.sender, earnedAmount);
        emit CommissionReceived(msg.sender, commission);
    } 
    
    function withdrawBalance(uint256 amount) external { 
            require(writerBalances[msg.sender] >= amount, "Insufficient balance."); 
            writerBalances[msg.sender] -= amount; 
            // Transfer the earned tokens to the writer's address 
            // You would need to implement a token transfer function here 
        } 
    
        function subscribe() external payable {
            require(!isSubscriber[msg.sender], "You are already a subscriber.");
            require(msg.value == 0.002 ether, "Invalid subscription amount. Please pay 0.002 ether.");

            isSubscriber[msg.sender] = true;
            emit SubscriptionRenewed(msg.sender);
        }

        function unsubscribe() external {
            require(isSubscriber[msg.sender], "You are not a subscriber.");

            isSubscriber[msg.sender] = false;
        }

        function getIsSubscriber(address subscriberAddress) external view returns (bool) {
            return isSubscriber[subscriberAddress];
        }
    }
