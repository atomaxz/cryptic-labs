// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

contract SmartContract {
    // Struct to represent a transaction
    struct TransferStruct {
        address sender;         // Address of the sender
        address receiver;       // Address of the receiver
        uint256 amount;         // Amount of the transaction
        string documentHash;    // DocumentHash of the sender
        string doi;             // DOI of the sender
        string message;         // Optional message associated with the transaction
        uint256 timestamp;      // Timestamp of the transaction
    }

    uint256 transactionCount;   // Counter for the total number of transactions
    TransferStruct[] transactions;  // Array to store all the transactions
    event Transfer(address indexed from, address indexed receiver, uint256 amount, string documentHash, string doi, string message, uint256 timestamp);

    // Function to add a transaction
    function addTransaction(uint256[3] memory percentages, uint256[4] memory limits, address payable[] memory receivers, uint256[] memory percentages_authors, address payable[] memory receivers_authors, string memory documentHash, string memory doi, string memory message) public payable {
        // Perform various checks and validations before proceeding with the transaction
        require(limits.length == 4, "Invalid limits array length");
        require(percentages.length == 3, "Invalid percentages array length");
        require(receivers.length > 0, "No receivers specified");
        require(percentages_authors.length > 0, "No percentage authors specified");
        require(receivers_authors.length > 0, "No receivers authors specified");
        require(msg.sender.balance > 0, "Insufficient balance");
        require(msg.value > 0, "Value not provided");

        // Calculate the amount to be split among the receivers => publishers
        uint256 amount = msg.value * percentages[0] / 100;

        for (uint256 i = limits[0]; i < limits[1]; i++) {
            _addTransaction(msg.sender, receivers[i], amount, documentHash, doi, message);
            _transferEther(receivers[i], amount);
        }

        // Repeat the same process for the next set of limits => reviewers
        amount = msg.value * percentages[1] / 100;
        uint256 diffLimits = limits[3] - limits[2];
        uint256 splitAmount = amount / diffLimits;

        for (uint256 i = limits[2]; i < limits[3]; i++) {
            _addTransaction(msg.sender, receivers[i], splitAmount, documentHash, doi, message);
            _transferEther(receivers[i], splitAmount);
        }

        // Repeat the same process for the final set of limits => editors
        amount = msg.value * percentages[2] / 100;
        uint256 allTotalAuthors = 0;

        for (uint256 i = 0; i < receivers_authors.length; i++) {
            uint256 amountAuthor = amount * percentages_authors[i] / 100;
            allTotalAuthors += amountAuthor;
            _addTransaction(msg.sender, receivers_authors[i], amountAuthor, documentHash, doi, message);
            _transferEther(receivers_authors[i], amountAuthor);
        }

        // Send remaining ether to main author
        uint256 totalRemaining = amount - allTotalAuthors;
        if (totalRemaining != 0) {
            _addTransaction(msg.sender, receivers_authors[0], totalRemaining, documentHash, doi, message);
            _transferEther(receivers_authors[0], totalRemaining);
        }
    }

    // Internal function to add a transaction to the array and emit an event
    function _addTransaction(address sender, address receiver, uint256 amount, string memory documentHash, string memory doi, string memory message) internal {
        transactionCount += 1;
        transactions.push(TransferStruct(sender, receiver, amount, documentHash, doi, message, block.timestamp));
        emit Transfer(sender, receiver, amount, documentHash, doi, message, block.timestamp);
    }

    // Internal function to transfer ether to a receiver
    function _transferEther(address payable receiver, uint256 amount) internal {
        (bool sent, ) = receiver.call{value: amount}("");
        require(sent, "Failed to send Ether");
    }

    // Function to get all the transactions
    function getAllTransaction() public view returns (TransferStruct[] memory) {
        return transactions;
    }

    // Function to get the total number of transactions
    function getTransactionCount() public view returns (uint256) {
        return transactionCount;
    }
}