import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
let tx: any;
const LEVEL_ADDRESS = "0x0b6F6CE4BCfB70525A31454292017F640C10c768";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Telephone`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS
  );
  challenge = await challengeFactory.attach(challengeAddress);

  //Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`TelephoneAttacker`);
  attacker = await attackerFactory.deploy(challenge.address);
});

describe("Telephone Challenge", async () => {
  it("Resuelve el challenge - Telephone", async () => {
    console.log("Mensaje enviado al contrato atacante/comunicador");
    let txAtaque = await attacker.jugarTelefonoDescompuesto();
    await txAtaque.wait();
    console.log("El contrato atacante ya comunicó el mensaje!");
  });
})

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});
