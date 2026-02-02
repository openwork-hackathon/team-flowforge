/**
 * Deploy $FLOWFORGE token via Mint Club V2 Bond contract on Base
 *
 * Usage:
 *   npx tsx contracts/scripts/deploy-token.ts
 *
 * Requires:
 *   PRIVATE_KEY env var (deployer wallet)
 */

import {
  createPublicClient,
  createWalletClient,
  http,
  parseEther,
  type Address,
} from "viem";
import { base } from "viem/chains";
import { privateKeyToAccount } from "viem/accounts";
import BondABI from "../abi/MCV2_Bond.json";

// --- Config ---
const BOND_ADDRESS: Address = "0xc5a076cad94176c2996B32d8466Be1cE757FAa27";
const OPENWORK_TOKEN: Address = "0x299c30DD5974BF4D5bFE42C340CA40462816AB07";

const TOKEN_NAME = "FlowForge Token";
const TOKEN_SYMBOL = "FLOWFORGE";

const BONDING_CURVE = {
  mintRoyalty: 100, // 1%
  burnRoyalty: 100, // 1%
  maxSupply: parseEther("1000000"),
  stepRanges: [
    parseEther("100000"),
    parseEther("500000"),
    parseEther("1000000"),
  ],
  stepPrices: [
    parseEther("0.001"),
    parseEther("0.005"),
    parseEther("0.01"),
  ],
};

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("PRIVATE_KEY env var required");
  }

  const account = privateKeyToAccount(privateKey as `0x${string}`);
  console.log(`Deployer: ${account.address}`);

  const publicClient = createPublicClient({
    chain: base,
    transport: http(),
  });

  const walletClient = createWalletClient({
    account,
    chain: base,
    transport: http(),
  });

  // Check creation fee
  const creationFee = await publicClient.readContract({
    address: BOND_ADDRESS,
    abi: BondABI,
    functionName: "creationFee",
  });
  console.log(`Creation fee: ${creationFee} wei`);

  // Check ETH balance
  const ethBalance = await publicClient.getBalance({
    address: account.address,
  });
  console.log(`ETH balance: ${ethBalance} wei`);

  if (ethBalance < (creationFee as bigint) + parseEther("0.0001")) {
    throw new Error(
      `Insufficient ETH for gas + creation fee. Have ${ethBalance}, need ~${creationFee} + gas`
    );
  }

  // Deploy token
  console.log(`\nCreating ${TOKEN_SYMBOL} token...`);

  const tokenParams = {
    name: TOKEN_NAME,
    symbol: TOKEN_SYMBOL,
  };

  const bondParams = {
    mintRoyalty: BONDING_CURVE.mintRoyalty,
    burnRoyalty: BONDING_CURVE.burnRoyalty,
    reserveToken: OPENWORK_TOKEN,
    maxSupply: BONDING_CURVE.maxSupply,
    stepRanges: BONDING_CURVE.stepRanges,
    stepPrices: BONDING_CURVE.stepPrices,
  };

  const hash = await walletClient.writeContract({
    address: BOND_ADDRESS,
    abi: BondABI,
    functionName: "createToken",
    args: [tokenParams, bondParams],
    value: creationFee as bigint,
  });

  console.log(`Tx hash: ${hash}`);
  console.log("Waiting for confirmation...");

  const receipt = await publicClient.waitForTransactionReceipt({ hash });
  console.log(`Status: ${receipt.status}`);
  console.log(`Block: ${receipt.blockNumber}`);

  // Parse TokenCreated event to get the token address
  let tokenAddress: string | null = null;
  for (const log of receipt.logs) {
    try {
      if (log.address.toLowerCase() === BOND_ADDRESS.toLowerCase()) {
        // TokenCreated event topic
        const { parseAbiItem, decodeEventLog } = await import("viem");
        const event = parseAbiItem(
          "event TokenCreated(address indexed token, string name, string symbol, address reserveToken)"
        );
        const decoded = decodeEventLog({
          abi: [event],
          data: log.data,
          topics: log.topics,
        });
        tokenAddress = decoded.args.token as string;
        break;
      }
    } catch {
      // Not the event we're looking for
    }
  }

  console.log(`\n✅ Token created!`);
  if (tokenAddress) {
    console.log(`Token address: ${tokenAddress}`);
    console.log(`BaseScan: https://basescan.org/address/${tokenAddress}`);
  }
  console.log(`Tx: https://basescan.org/tx/${hash}`);
  console.log(`Mint Club: https://mint.club/token/base/${TOKEN_SYMBOL}`);

  // Output JSON for automation
  const result = {
    tokenAddress,
    txHash: hash,
    blockNumber: Number(receipt.blockNumber),
    mintClubUrl: `https://mint.club/token/base/${TOKEN_SYMBOL}`,
    basescanUrl: tokenAddress
      ? `https://basescan.org/address/${tokenAddress}`
      : null,
  };
  console.log(`\n--- DEPLOYMENT RESULT ---`);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(console.error);
