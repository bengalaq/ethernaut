import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer, ContractFactory } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { AbiCoder, getContractAddress, Interface, parseTransaction } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let solver: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x200d3d9Ac7bFd556057224e7aEB4161fED5608D0";
// const INSTANCIA_DEL_NIVEL: string = "0xB3aCBd75c2Ee9227F6a2063ea629de05b89852d9";
const INSTANCIA_DEL_NIVEL: string = "";
let SOLVER_ADDRESS: string = "" //Completar en caso de deployar el bytecode por otro medio.

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`MagicNum`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  // // Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`PreservationAttacker`);
  // attacker = await attackerFactory.deploy(challenge.address, libraryMaliciosa.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("MagicNumber Challenge", async()=> {
  it("Resuelve el challenge - MagicNumber", async()=>{
    if(!SOLVER_ADDRESS){
      try {
        let txSolverDeploy = await eoa.sendTransaction({
          from: await eoa.getAddress(),
          data: "0x600a600c600039600a6000f3602a60305260206030f3",
          gasLimit: 1e5
        })
        await txSolverDeploy.wait();  
        SOLVER_ADDRESS = getContractAddress(txSolverDeploy); //Esto me costó un huevo encontrarlo en la docu. Espero que lo valores, le des like y actives la campanita mi rey.  
      } catch (error) {
        console.log(`PROBLEMA AL DEPLOYAR BYTECODE. ERROR: `, error);
      }
    }
    let txSetSolver = await challenge.setSolver(SOLVER_ADDRESS);
    await txSetSolver.wait();
  });
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

// Este challenge es muy teórico, por lo que es imprescindible tener paciencia, leer y entender cómo se deploya el bytecode de solidity dentro de la EVM.

//Links útiles: 
  // https://blog.openzeppelin.com/deconstructing-a-solidity-contract-part-i-introduction-832efd2d7737/
  // https://www.evm.codes/
  // https://www.evm.codes/playground

//Notas propias:
  //Es muy importante entender que el bytecode se divide en 2 partes -> Creation y Runtime.
  //Lo que nos solicitan en el desafío, es que EL RUNTIME tenga como máximo 10 opcodes. Por lo que investigando cómo generar un contrato que lo único que haga sea devolver un 42 es nuestra principal tarea.
  //Una vez que tengamos el bytecode de la sección Runtime, solo falta la parte de Creation, la cual suele tener similitudes entre diferentes contratos. En este caso, al no necesitar de variables globales o inicializaciones, nuestro bytecode en Creation lo único que necesitará será copiar el código en Runtime a memoria, y entregarlo a la EVM. Para copiar el código en Runtime a memoria, podemos utilizar el opcode CODECOPY, mientras que para entregarlo a la EVM, podemos utilizar el opcode RETURN.
  //Uno de los argumentos del CODECOPY, más específicamente el offset, no lo vamos a conocer hasta que no hayamos terminado todo el bytecode. Una vez que lo calculemos, veremos que todo nos ocupa 12 bytes (cada 2 dígitos es un byte -> 60 0a 60 ?? 60 00 39 60 0a 60 00 f3), por lo que el offset que tendremos que brindarle al CODECOPY será el número 13, o 0c en hexa. Finalmente, deberíamos obtener un bytecode similar a este 0x600a600c600039600a6000f3602a60305260206030f3.