import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0xaB4F3F2644060b2D960b0d88F0a42d1D27484687";
const INSTANCIA_DEL_NIVEL: string = "0x983f1a56A3aba08050a4847a3020D2c34B45cC3b";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Elevator`);
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
  const attackerFactory = await ethers.getContractFactory(`Attacker`);
  attacker = await attackerFactory.deploy(challenge.address);
  await attacker.deployed();
  console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Elevator Challenge", async () => {
  it("Resuelve el challenge - Elevator", async () => {
    let tx = await attacker.usarElevador({ gasLimit: 1e7 });
    await tx.wait();
  })
})

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

/*Problemas:
  Intentando que funciona el test, me encontré con un error que decía "Se está llamando a una función desde una cuenta que no es un contrato". Específicamente la función era "usarElevador", la cual era la encargada de ejecutar el ataque al challenge. Finalmente, tras leer comentarios en stackexchange.com (ver imagen 11-stackexchange) entendí que el fork local de hardhat estaba usando una dirección para ejecutar la función que no era un contrato, tal y como me habia dicho. Con esto sabido, simplemente reinicié la red local de hardhat, corrí el test nuevamente y funcionó de perlas.
*/