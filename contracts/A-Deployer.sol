pragma solidity 0.8.0; //Utilizar versión distinta de la 0.4.21 que usábamos antes, ya que tiene problemas con la instrucción "create2" (no es soportada por la versión de la VM del compilador).

contract Deployer {
  //DATO: Tuve mil problemas para que este contrato funcione. Resultó que todo se redujo a que si no uso hex"606060..." en lugar de "0x6060..." la variable queda con cualquier cosa (no respeta el bytecode).
  bytes contractBytecode = hex"600a600c600039600a6000f3602a60305260206030f3";
  address public addressDondeDeployo;
  function deployContrato () public{ //Retocamos solo los parámetros de la función tomada del Deployer de CTE.
   bytes memory bytecode = contractBytecode;
   address create2Address;
   bytes32 salt = 0;

  //parámetros de create2: wei a mandar al nuevo contrato + la ubicación del bytecode EN MEMORIA (inicio,fin) + salt
   assembly {
     create2Address := create2(0, add(bytecode,0x20), mload(bytecode),salt)
   }
   addressDondeDeployo = create2Address;
  }
}