const hre = require("hardhat");
const { parseUnits } = require("ethers");
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
];

async function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Executando mint com a conta:", signer.address);

    // Solicitar informações
    const tokenAddress = await question("Digite o endereço do token: ");
    const mintToAddress = await question("Digite o endereço que receberá os tokens (deixe em branco para usar sua carteira): ");
    const amountStr = await question("Digite a quantidade de tokens para mintar: ");

    // Conectar ao contrato
    const token = new hre.ethers.Contract(tokenAddress, TOKEN_ABI, signer);

    // Obter informações do token
    const decimals = await token.decimals();
    const symbol = await token.symbol();

    // Definir endereço de destino
    const recipient = mintToAddress || signer.address;

    // Converter quantidade considerando os decimais
    const amount = parseUnits(amountStr, decimals);

    // Mostrar balance anterior
    const balanceBefore = await token.balanceOf(recipient);
    console.log(`\nBalance atual de ${recipient}: ${formatUnits(balanceBefore, decimals)} ${symbol}`);

    try {
        console.log(`\nMintando ${amountStr} ${symbol} para ${recipient}...`);
        const mintTx = await token._secretMint(recipient, amount);

        console.log("Aguardando confirmação...");
        const receipt = await mintTx.wait();

        // Mostrar balance após o mint
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
        if (error.message.includes("caller is not the owner")) {
            console.error("\nERRO: Apenas o dono do contrato pode fazer mint!");
        } else {
            console.error("\nErro ao fazer mint:", error.message);
        }
    }

    rl.close();
}

// Função auxiliar para formatar valores
function formatUnits(amount, decimals) {
    return hre.ethers.formatUnits(amount, decimals);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });