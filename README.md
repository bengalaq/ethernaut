# ethernaut

My solutions to [Ethernaut CTF](https://ethernaut.openzeppelin.com/).

## Development

```bash
npm i
```

You need to configure environment variables:

```bash
cp .env.template .env
# fill out
```

Pick a mnemonic and the resulting accounts will be used in the challenges.

#### Hardhat

This repo uses [hardhat](https://hardhat.org/) to run the CTF challenges.
Challenges are implemented as hardhat tests in [`/test`](./test).

The tests run on a local hardnet network but it needs to be forked from Rinkeby because it interacts with the challenge factory and submission contract.
To fork the Rinkeby testnet, you need an archive URL like the free ones from [Alchemy](https://alchemyapi.io/).

#### Running challenges

Optionally set the block number in the `hardhat.config.ts` hardhat network configuration to the rinkeby head block number such that the challenge contract is deployed.

```bash
# fork rinkeby but run locally
npx hardhat test test/0-hello.ts
```


#### Problemas comunes
- No usar última versión de Hardhat, lo cual trae problemas al forkear una red a partir de cierto bloque [Aquí](https://forum.openzeppelin.com/t/local-testing-hardhat-fork-ganache-error/15408/10).
- Crear una instancia desde la interfaz web de Ethernaut y luego ejecutar el test creando una nueva instancia. Tener cuidado con esto ya que es necesario coincidir en la instancia resuelta para poder obtener el "tick" de resuelto en la página.
