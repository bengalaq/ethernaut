// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

contract TokenNueveReinas is ERC20, Ownable {
    constructor() public ERC20("TokenNueveReinas", "TNR") {
        _mint(msg.sender, 100); // Tener cuidado con esto, que el wizard usa como potencia los decimales y puede llegar a funcionar mal. Preferí mantenerlo simple
        console.log(msg.sender);
    }

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}

// Para generar este contrato se utilizó el wizard de Openzeppelin.
