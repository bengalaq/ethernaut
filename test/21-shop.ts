import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x3aCd4766f1769940cA010a907b3C8dEbCe0bd4aB";
const INSTANCIA_DEL_NIVEL: string = "";
// const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Shop`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  // Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`ShopAttacker`);
  attacker = await attackerFactory.deploy(challenge.address);
  await attacker.deployed();
  console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Shop challenge", async()=> {
  it("Resuelve el challenge - Shop", async()=>{
    
    let txAtaque = await attacker.atacar();
    await txAtaque.wait();

    //Revisamos que el price ahora sea muuuy menor al valor inicial.
    let priceActual = await challenge.price();
    
    expect(priceActual, "PRICE DISTINTO DE CERO").to.eq(0);
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});   