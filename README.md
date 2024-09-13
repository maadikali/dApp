# Introduction
The Write-To-Earn decentralized application (dApp) is designed to revolutionize how authors, bloggers, and content creators monetize their talents in the digital content realm. This platform introduces 
a Write-To-Earn ecosystem, enabling users to earn Bitcoin for their valuable contributions. 
Compensation is based on the qualityand engagement of their work, including articles, blog posts, stories, and other written content.

# Problem/Need
This dApp addresses key issues in:


1. Content Monetization: Improving how creators earn from their work.
2. Cryptocurrency Access: Providing easier access to cryptocurrencies for rewards.
3. Decentralization: Enhancing transparency and security in content management.

# Main Features
1. Content Submission: Effortlessly upload and showcase written work, such as articles, blog posts, or stories.
2. Cryptocurrency Rewards: Receive Bitcoin as compensation for contributions, with a fair and transparent payment system based on content quality and engagement metrics.
3. Decentralized File Storage: Secure storage of content in a decentralized system, ensuring data integrity, censorship resistance, and a tamper-proof repository.
4. User-Friendly Interface: An intuitive interface designed to make content submission easy for both experienced and new authors.

# How It Works
The Write-To-Earn initiative thrives within the blockchain ecosystem through:

1. Tokenization of Content: Transforming content into valuable assets.
2. Peer-to-Peer Partnerships: Connecting contributors directly with their audience. This approach enhances security, transparency, and fosters a vibrant community where creators are rewarded and recognized.

# Target Audience
The platform is tailored for:

1. Writers
2. Bloggers
3. Content Enthusiasts
By focusing on these groups, the goal is to build a dynamic community that supports and elevates content creators, making content production a sustainable and rewarding pursuit.

# Getting Started
To get started with Write-To-Earn, follow these steps:

1. Sign Up: Create an account on the platform.
2. Submit Content: Upload work and showcase skills.
3. Earn Bitcoin: Get rewarded based on the quality and engagement of submissions.

# The screenshots and explanation: 

# Frontend
Welcome Page:

![image](https://github.com/user-attachments/assets/b5481666-5c1e-4d2d-9218-58bdbf0a8b34)

The component acts as the dApp's landing page. It gives a quick description of the platform's capabilities, invites visitors to explore content, and links to the login and registration pages.

The component acts as the dApp's landing page. It gives a quick description of the platform's
capabilities, invites visitors to explore content, and links to the login and registration pages.

Users may safely log in to their accounts using the Login component. To authenticate users within the blockchain environment, it checks user credentials and connects with the backend.

Login Page:

![image](https://github.com/user-attachments/assets/c1c804d0-fa14-461a-b9b3-0acfa2a3c6eb)


The Register component aids in the onboarding of new users. It gathers relevant data, validates user information, and registers users on the blockchain, creating a safe and decentralized user management system.

Registration:

![image](https://github.com/user-attachments/assets/84ae9801-d206-49b0-b7a6-78f72df4b07f)


The Dashboard component is in charge of displaying the user's dashboard, which contains information about the articles they have submitted. This information may contain the article title, category, status, and any other information pertinent to the entry.

Dashboard page:

![image](https://github.com/user-attachments/assets/bb54e7c5-6b07-453e-855a-819f740b9e1f)

The article_detail page is intended to display information about active articles that are available for authoring. This page allows users to examine information about individual articles, such as the title, category, and any other facts pertinent to the writing work.

Details of article:

![image](https://github.com/user-attachments/assets/95069969-6fe3-45f7-8227-7473b12e4908)

The Fill_out component is in charge of displaying the form that users fill out to contribute information about the article they want created. This form collects information such as the title of the article, the category, and any special instructions for the writers.

Fill_out:

![image](https://github.com/user-attachments/assets/40955dee-2651-4255-b67c-3c4f428e7899)

The Profile component is in charge of displaying the user's profile information. This contains information such as the user's name, email address, and any other pertinent information.

Profile:

![image](https://github.com/user-attachments/assets/1fb90f11-9553-4220-8ef9-2ec902bd629a)

Creation of a page for several user circumstances such as Forbidden Access, Page Not Found, and Network Issues.

Error Page:

![image](https://github.com/user-attachments/assets/0eacb9d1-3fb7-464e-a222-303823fd56e2)



# Backend

The smart contract is an essential component of the backend system, and it is in charge of managing user registrations, content uploads, and incentive payouts on the platform.

Features:

1. Writer Registration: Writers can register with the contract and have their balance credited with a set quantity of tokens.

2. Token receiving: Writers can earn tokens by imitating the writing process and receiving prizes via the earn feature.

3. Withdrawal: Authors can remove a certain number of tokens from their balance.

4. Subscription Management: Authors can subscribe by paying a certain amount of ether, as well as renew or cancel their subscriptions.

5. Commission: The contract owner gets paid a commission on each earning transaction

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


Metamask Integration:
MetaMask is a browser plugin that allows users to manage their Ethereum wallets and engage with decentralized apps (DApps) from within their browser. MetaMask integration in the Write-to-Earn backend allows users to make Ethereum transactions and interact with the smart contract.
1. Authentication of Users:
Ascertain that the backend handles user authentication via Ethereum addresses. Users of MetaMask sign transactions with their private keys, therefore tying actions to specific Ethereum addresses ensures safe interactions.
2. Signing a transaction:
When users engage with smart contract (for example, registering as a writer or submitting an article), the backend must allow the user's MetaMask to sign
transactions.
3. Web3.js and ethers.js integration:
To interface with the Ethereum blockchain, use Web3.js or ethers.js in the backend. These libraries provide easy interfaces for interfacing with Ethereum and MetaMask.
5. Handle Ethereum Transaction:
Check that the backend processes Ethereum transactions correctly, including errorhandling, gas estimate, and transaction confirmation.

Deployment:
Migrating your smart contract to the Ethereum blockchain is what deployment entails. The Remix technology utilized to simplify this process for the Write-to-Earn backend.

![image](https://github.com/user-attachments/assets/22e95405-10be-4fca-abf1-c71b62cba730)

Access to DApp:
Navigate to http://localhost:3000 in the browser.

Handling API Keys:
Variables of the environment: Keep sensitive information, such as API keys, in a separate.env file. Used a library ‘dotenv’ to access this environment variables securely. To prevent the.env file from being committed to version control, add it in project's.gitignore file.

Contract Address:
Can be changed depending on the Metamask connection and contract deployment address.

Account Details:
Can be changed depending on the deployment of the contract. Same for the private key of the user.

Project-Specific Details:

User role:
1. Writer

Can sign up for the platform.
Tokens may be earned for content submissions.
Tokens can be withdrawn from their balance.

2. Customer

Can sign up for the platform.
Leave a request for an article to be written.

3. Owner

Manages the smart contract WriteToEarn.
Each earning transaction results in a commission.
Can specify starting amounts and commission rates.

Owner Actions:

1. Establish Initial Balances:
Upon registration, the owner can choose the initial token balance for authors.

2. Determine the Commission Rate:
The owner has the ability to select the commission rate for each earning transaction.

3. Commission to be Withdrawn:
Earned commissions can be withdrawn by the owner.

4. Subscription Management:
The owner has control over all aspects of user subscriptions, including subscription
quantities.


The backend includes the integration of a database to hold user information, article submissions, and other data. The Write-to-Earn project uses PostgreSQL, a reliable open source relational database management system. PostgreSQL was chosen for its stability, scalability, and ACID compliance, making it well-suited to handling complex data interactions and ensuring data integrity.

![image](https://github.com/user-attachments/assets/2efa57e5-218c-4565-bf88-bab9dcd5fbc3)

![image](https://github.com/user-attachments/assets/82df3512-dbe3-49c7-95e7-29e47585f05c)


Interaction of smart contract functions with the frontend:

![image](https://github.com/user-attachments/assets/05bba0ea-768c-49d1-9514-db4dd0d1e1dd)

![image](https://github.com/user-attachments/assets/86b340e7-5d7d-41c2-9d48-2548f6b0881b)

![image](https://github.com/user-attachments/assets/9aaaa874-5299-4550-ad89-091ef48cce4a)




