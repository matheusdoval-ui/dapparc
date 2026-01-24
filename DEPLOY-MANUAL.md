# 🚀 Guia de Deploy Manual

## Status Atual
- ✅ Repositório local sincronizado com `origin/main`
- ✅ Último commit: `e66846b` - "feat: leaderboard apenas para carteiras conectadas que pagaram 1 USDC"
- ✅ Não há mudanças pendentes para commitar

## Opções de Deploy Manual

### Opção 1: Deploy Automático na Vercel (Recomendado)
Se o projeto está conectado à Vercel, o deploy acontece automaticamente após cada push.

1. **Verificar se há mudanças locais:**
   ```cmd
   git status
   ```

2. **Se houver mudanças, fazer commit e push:**
   ```cmd
   git add .
   git commit -m "sua mensagem de commit"
   git push origin main
   ```

3. **Aguardar deploy automático na Vercel**
   - Acesse: https://vercel.com/dashboard
   - Verifique o status do deploy

### Opção 2: Forçar Novo Deploy na Vercel
Se quiser forçar um novo deploy sem mudanças:

1. **Criar um commit vazio:**
   ```cmd
   git commit --allow-empty -m "chore: trigger redeploy"
   git push origin main
   ```

2. **Ou usar a interface da Vercel:**
   - Acesse o dashboard da Vercel
   - Clique em "Redeploy" no projeto

### Opção 3: Deploy via CLI da Vercel
Se tiver a CLI instalada:

```cmd
npm i -g vercel
vercel --prod
```

## Comandos Úteis

### Verificar Status do Git
```cmd
git status
git log --oneline -5
```

### Verificar Diferenças com Remoto
```cmd
git fetch origin
git status
```

### Fazer Push Forçado (NÃO RECOMENDADO)
```cmd
git push origin main --force
```

## Verificação Pós-Deploy

1. **Acessar o site:**
   - https://arctx.xyz/

2. **Testar funcionalidades:**
   - Conectar carteira
   - Verificar leaderboard
   - Testar consulta manual (não deve aparecer no leaderboard)
   - Verificar pagamento de taxa

## Troubleshooting

### Se o deploy não acontecer automaticamente:
1. Verifique se o projeto está conectado ao GitHub na Vercel
2. Verifique se a branch `main` está configurada para deploy automático
3. Verifique os logs de deploy na Vercel

### Se houver erros no build:
1. Verifique os logs na Vercel
2. Teste localmente: `npm run build`
3. Corrija os erros e faça novo commit

## Status Atual do Projeto

- ✅ Sistema de pagamento implementado
- ✅ Verificação de carteira conectada
- ✅ Leaderboard apenas para carteiras conectadas que pagaram
- ✅ Consultas manuais não aparecem no leaderboard
