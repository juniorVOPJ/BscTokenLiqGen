const hre = require("hardhat");
const { parseUnits } = require("ethers");
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// Endereços na BSC
const PANCAKE_ROUTER = "0x10ED43C718714eb63d5aA57B78B54704E256024E";
const USDT = "0x55d398326f99059fF775485246999027B3197955";

// ABIs
const ROUTER_ABI = [
    "function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired, uint amountAMin, uint amountBMin, address to, uint deadline) external returns (uint amountA, uint amountB, uint liquidity)",
];

const TOKEN_ABI = [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
];

async function question(query) {
    return new Promise(resolve => {
        rl.question(query, resolve);
    });
}

async function main() {
    const [signer] = await hre.ethers.getSigners();
    console.log("Adicionando liquidez com a conta:", signer.address);

    // Solicitar informações
    const tokenAddress = await question("Digite o endereço do seu token: ");
    const tokenAmountStr = await question("Digite a quantidade do seu token para liquidez: ");
    const usdtAmountStr = await question("Digite a quantidade de USDT para liquidez: ");

    // Conectar aos contratos
    const yourToken = new hre.ethers.Contract(tokenAddress, TOKEN_ABI, signer);
    const usdt = new hre.ethers.Contract(USDT, TOKEN_ABI, signer);
    const router = new hre.ethers.Contract(PANCAKE_ROUTER, ROUTER_ABI, signer);

    // Obter decimais
    const tokenDecimals = await yourToken.decimals();
    const usdtDecimals = await usdt.decimals(); // USDT tem 18 decimais na BSC

    // Converter valores
    const tokenAmount = parseUnits(tokenAmountStr, tokenDecimals);
    const usdtAmount = parseUnits(usdtAmountStr, usdtDecimals);

    // Verificar balances
    const tokenBalance = await yourToken.balanceOf(signer.address);
    const usdtBalance = await usdt.balanceOf(signer.address);

    if (tokenBalance < tokenAmount) {
        throw new Error(`Balance do token insuficiente. Você tem ${tokenBalance} tokens, mas tentou adicionar ${tokenAmount}`);
    }

    if (usdtBalance < usdtAmount) {
        throw new Error(`Balance de USDT insuficiente. Você tem ${usdtBalance} USDT, mas tentou adicionar ${usdtAmount}`);
    }

    // Aprovar tokens
    console.log(`Aprovando ${tokenAmountStr} tokens para o router...`);
    const approveTokenTx = await yourToken.approve(PANCAKE_ROUTER, tokenAmount);
    await approveTokenTx.wait();
    console.log("Aprovação do seu token concluída!");

    console.log(`Aprovando ${usdtAmountStr} USDT para o router...`);
    const approveUsdtTx = await usdt.approve(PANCAKE_ROUTER, usdtAmount);
    await approveUsdtTx.wait();
    console.log("Aprovação do USDT concluída!");

    // Deadline: 10 minutos
    const deadline = Math.floor(Date.now() / 1000) + 60 * 10;

    console.log(`Adicionando liquidez...
    Seu Token: ${tokenAmountStr}
    USDT: ${usdtAmountStr}`);

    try {
        const addLiquidityTx = await router.addLiquidity(
            tokenAddress,
            USDT,
            tokenAmount,
            usdtAmount,
            0, // slippage 100%
            0, // slippage 100%
            signer.address,
            deadline
        );

        console.log("Aguardando confirmação...");
        const receipt = await addLiquidityTx.wait();
        console.log(`Liquidez adicionada com sucesso!
        Hash da transação: ${receipt.hash}
        Bloco: ${receipt.blockNumber}
        
        Você pode verificar o par no PancakeSwap:
        https://pancakeswap.finance/info/pairs/${tokenAddress}_${USDT}`);
    } catch (error) {
        console.error("Erro ao adicionar liquidez:", error.message);
    }

    rl.close();
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });