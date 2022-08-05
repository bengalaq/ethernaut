# Ethernaut

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
Also set your Infura/Alchemy API key to help hardhat reaching the chosen testnet (Rinkeby when writing this).

#### Hardhat

This repo uses [hardhat](https://hardhat.org/) to run the CTF challenges.
Challenges are implemented as hardhat tests in [`/test`](./test).

The tests run on a local hardhat network but it needs to be forked from Rinkeby because it interacts with the challenge factory and submission contract.
To fork the Rinkeby testnet, you need an archive URL like the free ones from [Alchemy](https://alchemyapi.io/).

#### Running challenges

Optionally set the block number in the `hardhat.config.ts` hardhat network configuration to the rinkeby head block number such that the challenge contract is deployed.

```bash
# fork rinkeby but run locally
npx hardhat test test/0-hello.ts --network localhost
```


#### Common Issues
- At the moment I'm writting this, it is better not to use Hardhat's latest version. It has a problem when forking from a specific block [Here](https://forum.openzeppelin.com/t/local-testing-hardhat-fork-ganache-error/15408/10).
- Be extremely carefull when creating a new instance from Ethernaut's interface and make sure your test is not creating a new one too. They could clash and give you a little headache.
