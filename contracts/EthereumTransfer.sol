// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EthereumTransfer {
    mapping(address => uint) public accountBalances;

    // Event to log the withdrawal actions
    event Withdrawal(address indexed receiver, uint amount);

    // Function to receive Ether and update the sender's balance
    receive() external payable {
        accountBalances[msg.sender] += msg.value;
    }

    // Function to get the balance of a specific account
    function getAccountBalances(address accountAddress) external view returns (uint256) {
        return accountBalances[accountAddress];
    }

    // Function to withdraw Ether from the contract
    function withdraw(uint amount) public {
        require(accountBalances[msg.sender] >= amount, "Insufficient balance");

        // Deducting the amount from the sender's balance
        accountBalances[msg.sender] -= amount;

        // Transferring Ether back to the sender
        payable(msg.sender).transfer(amount);

        // Emitting the Withdrawal event
        emit Withdrawal(msg.sender, amount);
    }

    // Function to safely handle Ether transfers
    function safeTransferETH(address to, uint value) private {
        (bool success, ) = to.call{value: value}(new bytes(0));
        require(success, "Transfer failed");
    }

    // Function to withdraw Ether and send it to a specific address
    function withdrawTo(address payable recipient, uint amount) public {
        require(accountBalances[msg.sender] >= amount, "Insufficient balance");
        accountBalances[msg.sender] -= amount;
        recipient.transfer(amount);
    }
}
