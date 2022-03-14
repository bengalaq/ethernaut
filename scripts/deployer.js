const hre = require("hardhat");
const challengeAddress = "0x8A8927a1Da3104bd2c9134272DCD1AF5dd8EA99E" //Completar en caso de necesitar address del challenge

  async function main() {
    // Tomamos el contrato a deployar
    const factoryContract = await hre.ethers.getContractFactory("AttackerCoinflip");
    const deployedContract = await factoryContract.deploy(challengeAddress); //Agregar parámetros para deploy según corresponda.

    await deployedContract.deployed();

    console.log("CONTRATO DEPLOYADO EN:", deployedContract.address);
  }

// Este patrón es recomendable para usar async/await en cualquier lugar y manejar errores apropiadamente.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
