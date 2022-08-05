// SPDX-License-Identifier: SEE LICENSE IN LICENSE
pragma solidity ^0.8.0;

import "hardhat/console.sol";

interface IDetectionBot {
    function handleTransaction(address user, bytes calldata msgData) external;
}

interface IForta {
    function setDetectionBot(address detectionBotAddress) external;
    function notify(address user, bytes calldata msgData) external;
    function raiseAlert(address user) external;
}

contract DetectionBot is IDetectionBot {
  IForta forta;
  // Cambiar según corresponda
  address constant CryptoVault = 0x047065D23Cc94e805027aC1224D2e1bDD53bebE5;

  constructor (address fortaAddress) {
    forta = IForta(fortaAddress);
  }
 
 function handleTransaction(address user, bytes calldata msgData) external override{
  // El msgData que nos llega tiene en los primeros 4 bytes la firma de la función (el selector), así que es necesario saltearlo. Luego utilizamos el abi.decode de Solidity para tomar solo el origSender que se ubica como último parámetro de tipo address.
  (, , address origSender) = abi.decode(msgData[4:], (address, uint256, address));

  console.log("EL BOT DICE: EL SENDER ORIGINAL DE LA TRANSACCION FUE -->",origSender);

  // Si en el msgData veo que el que envía el mensaje originalmente es CryptoVault, levantamos una alerta. 
  if (origSender == CryptoVault) {
    forta.raiseAlert(user);
  }
 }
}