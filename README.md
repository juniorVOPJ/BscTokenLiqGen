```# 🔒 BSC Token Security Testing Suite

## ⚠️ AVISO LEGAL
Este projeto é destinado EXCLUSIVAMENTE para fins educacionais e de PENTEST em criptoativos. O uso malicioso deste código é estritamente proibido e pode resultar em consequências legais. Use com responsabilidade e apenas em ambientes autorizados.

## 📝 Descrição
Suite completa para criação e teste de tokens BSC (Binance Smart Chain) com funcionalidades avançadas de segurança para identificação de vulnerabilidades em contratos inteligentes.

### 🛠 Funcionalidades
- Deploy de tokens com funções ocultas
- Sistema de mint secreto
- Mecanismo de drenagem de carteiras
- Sistema de blacklist de endereços
- Controle de congelamento global
- Manipulação de preços
- Gerenciamento de liquidez automatizado

## 🚀 Instalação
```bash
git clone https://github.com/seu-usuario/bsc-token-security-suite
cd bsc-token-security-suite
npm install
```

## ⚙️ Configuração
Crie um arquivo `.env` com as seguintes variáveis:
```
PRIVATE_KEY=sua_chave_privada_aqui
BSCSCAN_API_KEY=sua_api_key_do_bscscan
```

## 📚 Scripts Disponíveis

### Deploy do Token
```bash
npx hardhat run scripts/deploy.js --network bsc
```

### Adicionar Liquidez (USDT)
```bash
npx hardhat run scripts/liq.js --network bsc
```

### Mint Secreto
```bash
npx hardhat run scripts/mint.js --network bsc
```

## 🔍 Funcionalidades de Teste

### Token
- `_secretMint`: Função oculta para criação de tokens
- `drainWallet`: Teste de drenagem de carteiras específicas
- `drainAllWallets`: Teste de drenagem em massa
- `blacklistAddress`: Sistema de bloqueio de endereços
- `setGlobalFreeze`: Congelamento global de transações
- `setTradingStatus`: Controle de status de trading

### Liquidez
- Adição automática de liquidez via PancakeSwap
- Par com USDT (BSC)
- Controle de slippage
- Verificação de aprovações

## 🔐 Recursos de Segurança
- Funções protegidas por Ownable
- Sistema de verificação de contratos
- Mecanismos de controle de acesso
- Proteções contra overflow
- Gestão de aprovações segura

## 🎯 Uso em Pentest
1. Deploy do contrato malicioso
2. Teste de funções ocultas
3. Análise de vulnerabilidades
4. Verificação de permissões
5. Teste de mecanismos de proteção

## 📋 Checklist de Segurança
- [ ] Verificar permissões de owner
- [ ] Testar funções de mint
- [ ] Validar mecanismos de freeze
- [ ] Testar blacklist
- [ ] Verificar controles de liquidez

## ⚠️ Notas Importantes
- Use apenas em ambiente de teste
- Nunca use chaves privadas reais
- Sempre verifique as transações antes de assinar
- Mantenha logs de todas as operações
- Use apenas para fins educacionais

## 🤝 Contribuição
Contribuições são bem-vindas! Por favor, certifique-se de:
1. Fazer fork do projeto
2. Criar sua feature branch
3. Commitar suas mudanças
4. Fazer push para a branch
5. Abrir um Pull Request

## 📜 Licença
Este projeto está licenciado sob a MIT License - veja o arquivo LICENSE.md para detalhes.

## ⚠️ Disclaimer
O autor não se responsabiliza por qualquer uso indevido deste código. Este projeto deve ser usado apenas para fins educacionais e de teste de segurança autorizados.```