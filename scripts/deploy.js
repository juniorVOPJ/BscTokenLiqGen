const hre = require("hardhat");
const { parseUnits } = require("ethers");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";

async function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Coleta informações do token
    const name = await question("Digite o nome do token: ");
    const symbol = await question("Digite o símbolo do token: ");
    let supply = await question("Digite o supply inicial (sem decimais): ");
    const decimals = 18;

    // Usando parseUnits do ethers
    supply = parseUnits(supply, decimals);

    // Deploy do contrato
    console.log("Deployando token...");
    const Token = await hre.ethers.getContractFactory("StreamerUSD");
    const token = await Token.deploy(name, symbol, supply);
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log(`Token deployado em: ${tokenAddress}`);

    // Verificação do contrato
    console.log("Verificando contrato...");
    try {
        await hre.run("verify:verify", {
            address: tokenAddress,
            constructorArguments: [name, symbol, supply],
        });
    } catch (e) {
        console.log("Erro na verificação:", e);
    }

    rl.close();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });