# 📦 Leaderboard Storage - Persistência de Dados

## 🎯 Funcionalidade

O sistema de armazenamento do leaderboard agora persiste dados entre reinicializações do servidor usando arquivos JSON.

## 📁 Localização dos Dados

Os dados são salvos em:
```
.data/leaderboard.json
```

Este diretório é criado automaticamente na raiz do projeto.

## 🔄 Como Funciona

1. **Carregamento Inicial**: Ao iniciar o servidor, os dados são carregados do arquivo JSON (se existir)
2. **Armazenamento em Memória**: Os dados ficam em memória para acesso rápido
3. **Persistência Automática**: Após cada atualização, os dados são salvos no arquivo (com debounce de 1 segundo)
4. **Hot Reload**: Em desenvolvimento, usa `globalThis` para manter dados durante hot reloads

## 💾 Estrutura dos Dados

```json
{
  "0x1234...": {
    "address": "0x1234...",
    "transactions": 100,
    "firstConsultedAt": 1234567890,
    "lastConsultedAt": 1234567890,
    "consultCount": 5,
    "arcAge": null
  }
}
```

## 🚀 Uso

### Gravar Consulta de Carteira
```typescript
import { recordWalletConsultation } from '@/lib/leaderboard-storage'

await recordWalletConsultation(address, txCount, arcAge)
```

### Obter Leaderboard
```typescript
import { getLeaderboard } from '@/lib/leaderboard-storage'

const leaderboard = await getLeaderboard(100) // Top 100
```

### Obter Rank de uma Carteira
```typescript
import { getWalletRank } from '@/lib/leaderboard-storage'

const rank = await getWalletRank(address)
```

## ⚙️ Configuração

### Git Ignore

O diretório `.data/` está no `.gitignore` para não commitar dados locais.

### Produção

Em produção (Vercel, etc.), considere:
- Usar um banco de dados (PostgreSQL, MongoDB)
- Usar Vercel KV ou similar para persistência
- O sistema atual funciona, mas dados são perdidos se o servidor reiniciar (em ambientes serverless)

## 🔧 Troubleshooting

### Dados não persistem
- Verifique se o diretório `.data/` tem permissões de escrita
- Verifique os logs do servidor para erros de escrita

### Arquivo corrompido
- Delete `.data/leaderboard.json` para começar do zero
- O sistema detecta arquivos inválidos e recomeça automaticamente

## 📝 Notas

- O debounce de 1 segundo evita muitas escritas em disco
- Os dados são salvos atomicamente (arquivo temporário + rename)
- Em desenvolvimento, os dados persistem durante hot reloads via `globalThis`
