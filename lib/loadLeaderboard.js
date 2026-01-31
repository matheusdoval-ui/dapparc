/**
 * @file loadLeaderboard.js
 * @description Carrega dados do leaderboard a partir das APIs /api/leaderboard e /api/leaderboard-users
 * Unifica dados de storage (transações) com usuários do contrato on-chain.
 */

/**
 * @param {Object} opts
 * @param {string} [opts.baseUrl=''] - URL base para fetch (vazio = relativo, ex: '' ou 'https://arctx.xyz')
 * @param {number} [opts.limit=100] - Limite de entradas
 * @returns {Promise<{ leaderboard: Array, contractUsers: Array, error?: string }>}
 */
async function loadLeaderboard({ baseUrl = '', limit = 100 } = {}) {
  const prefix = baseUrl.replace(/\/$/, '')

  try {
    const [leaderboardRes, contractRes] = await Promise.allSettled([
      fetch(`${prefix}/api/leaderboard?limit=${limit}`),
      fetch(`${prefix}/api/leaderboard-users`),
    ])

    let raw = []
    if (leaderboardRes.status === 'fulfilled' && leaderboardRes.value.ok) {
      const data = await leaderboardRes.value.json()
      raw = Array.isArray(data.leaderboard) ? data.leaderboard : []
    }

    let contractUsersData = []
    if (contractRes.status === 'fulfilled' && contractRes.value.ok) {
      const contractData = await contractRes.value.json()
      contractUsersData = Array.isArray(contractData.users) ? contractData.users : []
    }

    const contractMap = new Map(
      contractUsersData.map((u) => [u.address.toLowerCase(), u])
    )

    const enhanced = raw.map((entry) => {
      const cu = contractMap.get(entry.address?.toLowerCase?.() || '')
      return {
        ...entry,
        contractRegistered: !!cu,
        contractTimestamp: cu?.timestamp ?? null,
        contractIndex: cu?.index ?? null,
      }
    })

    for (const cu of contractUsersData) {
      const addr = cu.address?.toLowerCase?.() || ''
      const exists = enhanced.some((e) => (e.address || '').toLowerCase() === addr)
      if (!exists) {
        enhanced.push({
          address: cu.address,
          transactions: 0,
          firstTransactionTimestamp: cu.timestamp ?? null,
          rank: 0,
          contractRegistered: true,
          contractTimestamp: cu.timestamp ?? null,
          contractIndex: cu.index ?? null,
        })
      }
    }

    const sorted = [...enhanced].sort(
      (a, b) => (Number(b?.transactions) || 0) - (Number(a?.transactions) || 0)
    )
    const leaderboard = sorted.map((e, i) => ({ ...e, rank: i + 1 }))

    return { leaderboard, contractUsers: contractUsersData }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to load leaderboard'
    console.error('[loadLeaderboard]', message, err)
    return {
      leaderboard: [],
      contractUsers: [],
      error: message,
    }
  }
}

/**
 * Busca o leaderboard diretamente do contrato ArcLeaderboard (getUsersCount, getUserAt, getScore).
 * Usa JsonRpcProvider — nunca BrowserProvider. Retorna [{ address, score, rank }].
 */
async function fetchLeaderboard() {
  const { loadLeaderboard } = await import('./leaderboard')
  return loadLeaderboard()
}

module.exports = { loadLeaderboard, fetchLeaderboard }
