import type { PublicClient } from 'viem'

const STEP = 9000n // menor que 10k por segurança

export async function getAllGameLogs(
  publicClient: PublicClient,
  contractAddress: `0x${string}`,
  event: Parameters<PublicClient['getLogs']>[0]['event'],
) {
  const latest = await publicClient.getBlockNumber()
  const logs: Awaited<ReturnType<PublicClient['getLogs']>> = []

  let from = latest - STEP

  while (from > 0n) {
    const to = from + STEP

    const chunk = await publicClient.getLogs({
      address: contractAddress,
      event,
      fromBlock: from,
      toBlock: to,
    })

    logs.push(...chunk)

    from -= STEP
  }

  return logs
}
