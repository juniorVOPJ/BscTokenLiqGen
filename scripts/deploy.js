const hre = require("hardhat");
const { parseUnits } = require("ethers");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function verifyContract(address, constructorArgs, attempts = 5) {
    for (let i = 0; i < attempts; i++) {
        try {
            console.log(`\nTentativa ${i + 1} de verificação...`);
            await hre.run("verify:verify", {
                address: address,
                constructorArguments: constructorArgs,
            });
            console.log("\nContrato verificado com sucesso!");
            return true;
        } catch (e) {
            if (i < attempts - 1) {
                console.log("Aguardando 30 segundos antes da próxima tentativa...");
                await sleep(30000); // Espera 30 segundos
            } else {
                console.log("\nErro na verificação após todas as tentativas:", e.message);
            }
        }
    }
    return false;
}

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);

    // Coleta informações do token
    const name = await question("Digite o nome do token: ");
    const symbol = await question("Digite o símbolo do token: ");
    let supply = await question("Digite o supply inicial (sem decimais): ");
    const decimals = 18;

    supply = parseUnits(supply, decimals);

    // Deploy do contrato
    console.log("\nDeployando token...");
    const Token = await hre.ethers.getContractFactory("StreamerUSD");
    const token = await Token.deploy(name, symbol, supply);
    await token.waitForDeployment();

    const tokenAddress = await token.getAddress();
    console.log(`\nToken deployado em: ${tokenAddress}`);

    // Aguarda alguns blocos para garantir que o contrato está indexado
    console.log("\nAguardando 5 blocos para confirmação...");
    const deployTx = await token.deploymentTransaction();
    await deployTx.wait(5); // Aguarda 5 blocos

    // Verificação do contrato com múltiplas tentativas
    await verifyContract(tokenAddress, [name, symbol, supply]);

    console.log(`\nPróximos passos:
    1. Use o script de mint para criar tokens adicionais
    2. Use o script de liquidez para adicionar liquidez
    3. Use o menu do script de mint para gerenciar o token

    Endereço do contrato: ${tokenAddress}
    `);

    rl.close();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });