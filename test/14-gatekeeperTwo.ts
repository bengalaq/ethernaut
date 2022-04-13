import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
let originEnUint16;
const LEVEL_ADDRESS = "0xdCeA38B2ce1768E1F409B6C65344E81F16bEc38d";
const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`GatekeeperTwo`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }
//   // Contrato prueba (Si fuera necesario)
//   const testChallengeFactory = await ethers.getContractFactory(`GatekeeperConsole`);
//   challenge = await testChallengeFactory.deploy();
//   await challenge.deployed();
//   console.log(`CONTRATO TESTER DEPLOYADO EN:`, challenge.address);

// IMPORTANTE: COMO EN ESTE CHALLENGE SE EJECUTA EL ATAQUE DESDE EL CONSTRUCTOR, ESTA SECCIÓN LA TRANSLADÉ HACIA ABAJO.

  // Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`GateTwoAttacker`);
  // attacker = await attackerFactory.deploy(challenge.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Gatekeeper Two Challenge", async()=> {
  it("Resuelve el challenge - Gatekeeper Two", async()=>{
    const attackerFactory = await ethers.getContractFactory(`GateAttackerTwo`);
  attacker = await attackerFactory.deploy(challenge.address);
  await attacker.deployed();
  console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});