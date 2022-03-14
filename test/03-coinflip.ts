import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
let tx: any;
const LEVEL_ADDRESS = "0x4dF32584890A0026e56f7535d0f2C6486753624f";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`CoinFlip`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS
  );
  challenge = await challengeFactory.attach(challengeAddress);

  //Contrato atacante
  const attackerFactory = await ethers.getContractFactory(`CoinFlipAttacker`);
  attacker = await attackerFactory.deploy(challenge.address);
});

describe("CoinFlip challenge", async () => {
  it("Resuelve el challenge - CoinFlip", async () => {
    
    while (await challenge.consecutiveWins() < 10) {
      console.log(`TODAVIA NO HAY 10 WINS CONSECUTIVOS`);
      let txUsarHabilidades = await attacker.usarHabilidadesPsiquicas({
        gasLimit: 1e5,
      });
      await txUsarHabilidades.wait();
    }
    console.log("TERMINE DE USAR MIS PODERES");
    
  })
})

after(async () => {
  expect(await submitLevel(challenge.address), "level not solved").to.be.true;
});