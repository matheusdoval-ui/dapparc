/**
 * POST /api/faucet — Secure backend faucet with IP/wallet rate limiting.
 * Server-side only. Never expose private key.
 * Arc Testnet (chainId 5042002).
 */

import { NextResponse } from "next/server"
import { ethers } from "ethers"
import { addFaucetClaim } from "@/lib/faucet-history"

const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function decimals() view returns (uint8)",
  "function balanceOf(address account) view returns (uint256)",
]

const WALLET_COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24h
const IP_MAX_CLAIMS_PER_24H = 5
const IP_WINDOW_MS = 24 * 60 * 60 * 1000 // 24h

// In-memory rate limits (per serverless instance)
const walletClaims = new Map<string, number>()
const ipClaims = new Map<string, number[]>() // IP -> timestamps of claims

function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim()
    if (first) return first
  }
  const realIp = req.headers.get("x-real-ip")
  if (realIp) return realIp.trim()
  return "unknown"
}

function getTokenContractAddress(token: string): string | null {
  const t = (token || "").trim().toUpperCase()
  if (t === "USDC") return process.env.USDC_TOKEN || null
  if (t === "EUR" || t === "EURC") return process.env.EUR_TOKEN || null
  if (typeof token === "string" && ethers.isAddress(token)) return token
  return null
}

function pruneIpTimestamps(timestamps: number[]): number[] {
  const cutoff = Date.now() - IP_WINDOW_MS
  return timestamps.filter((t) => t > cutoff)
}

export async function POST(req: Request) {
  try {
    const privateKey = process.env.FAUCET_PRIVATE_KEY
    if (!privateKey || !privateKey.startsWith("0x")) {
      console.warn("Faucet: FAUCET_PRIVATE_KEY is not set.")
      return NextResponse.json(
        { success: false, error: "Faucet not configured" },
        { status: 503 }
      )
    }

    const rpc = process.env.NEXT_PUBLIC_ARC_RPC
    if (!rpc) {
      console.warn("Faucet: NEXT_PUBLIC_ARC_RPC is not set.")
      return NextResponse.json(
        { success: false, error: "Faucet not configured" },
        { status: 503 }
      )
    }

    const ip = getClientIp(req)
    const body = await req.json().catch(() => ({}))
    const addressRaw = body?.address ?? body?.userAddress
    const tokenParam = body?.token ?? "USDC"

    if (!addressRaw || typeof addressRaw !== "string") {
      return NextResponse.json(
        { success: false, error: "address required" },
        { status: 400 }
      )
    }

    const to = addressRaw.trim()
    if (!ethers.isAddress(to)) {
      return NextResponse.json(
        { success: false, error: "Invalid address" },
        { status: 400 }
      )
    }
    const toLower = to.toLowerCase()

    // Wallet rate limit: 1 claim per 24h
    const lastWallet = walletClaims.get(toLower)
    if (lastWallet != null && Date.now() - lastWallet < WALLET_COOLDOWN_MS) {
      return NextResponse.json(
        {
          success: false,
          error: "This wallet can only claim once every 24 hours. Try again later.",
        },
        { status: 429 }
      )
    }

    // IP rate limit: max 5 claims per 24h
    const ipTimestamps = pruneIpTimestamps(ipClaims.get(ip) ?? [])
    if (ipTimestamps.length >= IP_MAX_CLAIMS_PER_24H) {
      return NextResponse.json(
        {
          success: false,
          error: "This IP has reached the maximum of 5 claims per 24 hours. Try again later.",
        },
        { status: 429 }
      )
    }

    const tokenAddress = getTokenContractAddress(tokenParam)
    if (!tokenAddress) {
      return NextResponse.json(
        { success: false, error: "Token not configured. Set USDC_TOKEN and EUR_TOKEN in env." },
        { status: 400 }
      )
    }

    const provider = new ethers.JsonRpcProvider(rpc, {
      name: "arc",
      chainId: 5042002,
      ensAddress: null,
    })

    const wallet = new ethers.Wallet(privateKey, provider)
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, wallet)

    const decimals = await tokenContract.decimals()
    const amountHuman = process.env.FAUCET_AMOUNT ? String(process.env.FAUCET_AMOUNT).trim() : "1"
    const amount = ethers.parseUnits(amountHuman || "1", decimals)

    const balance = await tokenContract.balanceOf(wallet.address)
    if (balance < amount) {
      console.warn("Faucet: insufficient balance", { balance: balance.toString(), amount: amount.toString() })
      return NextResponse.json(
        {
          success: false,
          error: "Faucet wallet has insufficient token balance. Fund the faucet wallet with testnet tokens (e.g. from faucet.circle.com or easyfaucetarc.xyz).",
        },
        { status: 402 }
      )
    }

    const tx = await tokenContract.transfer(toLower, amount)
    await tx.wait()

    // Update rate limits only after successful transfer
    walletClaims.set(toLower, Date.now())
    ipTimestamps.push(Date.now())
    ipClaims.set(ip, ipTimestamps)

    const tokenLabel = (tokenParam || "USDC").toString().toUpperCase().replace("EURC", "EUR")
    addFaucetClaim({
      address: toLower,
      token: tokenLabel,
      amount: amountHuman || "1",
      txHash: tx.hash as string,
      timestamp: Date.now(),
    })

    return NextResponse.json({ success: true, hash: tx.hash })
  } catch (err) {
    console.error("Faucet error (full):", err)
    const message = err instanceof Error ? err.message : String(err)
    const isInsufficientBalance =
      message.includes("transfer amount exceeds balance") ||
      message.includes("exceeds balance") ||
      message.includes("insufficient")
    const userError = isInsufficientBalance
      ? "Faucet wallet has insufficient token balance. Fund the faucet wallet with testnet tokens."
      : message
    return NextResponse.json(
      { success: false, error: userError },
      { status: isInsufficientBalance ? 402 : 500 }
    )
  }
}
