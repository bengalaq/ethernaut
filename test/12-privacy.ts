import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";
import { boolean } from "hardhat/internal/core/params/argumentTypes";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x11343d543778213221516D004ED82C45C3c8788B";
const INSTANCIA_DEL_NIVEL: string = "0x1Eda41D770CfA9B852b442206d05e56C4A6eF810";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Privacy`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`CONTRATO CHALLENGE UTILIZADO DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  //Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`Attacker`);
  // attacker = await attackerFactory.deploy(challenge.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Privacy Challenge", async()=> {
  it("Resuelve el challenge - Privacy", async()=>{
    let locked:boolean = (Boolean)(await ethers.provider.getStorageAt(challenge.address,0));
    console.log(`EL VALOR DE LOCKED ES: ${locked}`);
    let id:BigNumber = BigNumber.from(await ethers.provider.getStorageAt(challenge.address,1));
    console.log(`EL VALOR DE ID ES: ${id}`);
    let flattening:BigNumber = BigNumber.from(await ethers.provider.getStorageAt(challenge.address,2));
    console.log(`EL VALOR DE FLATTENING ES: ${flattening}`);

    
  });
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});