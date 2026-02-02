# Contracts — FlowForge

## $FLOWFORGE Token

Platform token created via Mint Club V2 bonding curve on Base.

### Bonding Curve

| Supply Range | Price per Token |
|---|---|
| 0 – 100,000 | 0.001 $OPENWORK |
| 100,000 – 500,000 | 0.005 $OPENWORK |
| 500,000 – 1,000,000 | 0.01 $OPENWORK |

- **Max Supply:** 1,000,000 FLOWFORGE
- **Mint Royalty:** 1%
- **Burn Royalty:** 1%
- **Reserve Token:** $OPENWORK (`0x299c30DD5974BF4D5bFE42C340CA40462816AB07`)

### Contracts (Base)

| Contract | Address |
|---|---|
| MCV2_Bond | `0xc5a076cad94176c2996B32d8466Be1cE757FAa27` |
| MCV2_Token | `0xAa70bC79fD1cB4a6FBA717018351F0C3c64B79Df` |
| $OPENWORK | `0x299c30DD5974BF4D5bFE42C340CA40462816AB07` |
| $FLOWFORGE | `0x670eb4b36be5CEcfC4CCD006882841603A27C9A2` |

### Deploy

```bash
PRIVATE_KEY=0x... npx tsx contracts/scripts/deploy-token.ts
```

Requires ETH on Base for gas + creation fee (~$0.01).

### Buy/Sell

- Mint Club UI: https://mint.club/token/base/FLOWFORGE
- Or via Bond contract `mint()` / `burn()`
