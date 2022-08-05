import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let accounts: Signer[];
let eoa: Signer;
let doubleEntryPoint: Contract;
let forta: Contract;
let cryptoVault: Contract;
let detectionBot: Contract;
// const LEVEL_ADDRESS = "";
const INSTANCIA_DEL_NIVEL: string = "0x58C049f6FCbc341faBBF5bdAdE3e82AC2eC46dfA";
const FORTA_ADDRESS: string = "0x65331249eA6A1b22fA25c863Ee61E1C244ecd5b5"
const CRYPTOVAULT_ADDRESS: string = "0x047065D23Cc94e805027aC1224D2e1bDD53bebE5"

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const doubleEntryPointFactory = await ethers.getContractFactory(`DoubleEntryPoint`);
  const fortaFactory = await ethers.getContractFactory(`Forta`);
  const cryptoVaultFactory = await ethers.getContractFactory(`CryptoVault`);

  if (INSTANCIA_DEL_NIVEL.length > 1 && FORTA_ADDRESS.length > 1 && CRYPTOVAULT_ADDRESS.length > 1) {
    doubleEntryPoint = doubleEntryPointFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA DOUBLE ENTRY POINT UTILIZADA DESDE:`, doubleEntryPoint.address);
    
    forta = fortaFactory.attach(FORTA_ADDRESS);
    console.log(`INSTANCIA FORTA UTILIZADA DESDE:`, forta.address);

    cryptoVault = cryptoVaultFactory.attach(CRYPTOVAULT_ADDRESS);
    console.log(`INSTANCIA CRYPTOVAULT UTILIZADA DESDE:`, cryptoVault.address);
    
  }else{
    console.log("Dale click a Nueva Instancia, y revisá haber puesto las address en las constantes. No seas vagoneta!");
  }
  
  // Contrato atacante en caso de ser necesario
  const detectionBotFactory = await ethers.getContractFactory(`DetectionBot`);
  detectionBot = await detectionBotFactory.deploy(forta.address);
  await detectionBot.deployed();
  console.log(`CONTRATO BOT DEPLOYADO EN:`, detectionBot.address);

  // Contrato atacante en caso de ser necesario
  // const voltorbFactory = await ethers.getContractFactory(`Voltorb`);
  // voltorb = await voltorbFactory.deploy();
  // await voltorb.deployed();
  // console.log(`CONTRATO VOLTORB DEPLOYADO EN:`, voltorb.address);
});

describe("DoubleEntryPoint challenge", async()=> {
  it("Resuelve el challenge - DoubleEntryPoint", async()=>{  
    let txSetDetectionBot = await forta.setDetectionBot(detectionBot.address, {gasLimit: 1e5});
    await txSetDetectionBot.wait();
  })
});

after(async () => {
  expect(await submitLevel(doubleEntryPoint.address), "DESAFÍO INCOMPLETO").to.be.true;
});   


/*
  PARA EXPLICACIÓN:
  Misión --> Crear un bot de Forta para prevenir el drenaje de fondos desde el contrato CryptoVault
*/