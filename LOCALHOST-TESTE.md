# Teste localhost

## 1. Abra o PowerShell **fora do Cursor** (menu Iniciar → PowerShell)

## 2. Execute:

```powershell
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
```

## 3. Pare processos antigos (se houver):

```powershell
taskkill /F /IM node.exe 2>$null
```

## 4. Inicie o servidor:

```powershell
npm run dev
```

## 5. Aguarde ver: `✓ Ready in ...`

## 6. No navegador, abra **exatamente**:

```
http://localhost:3000/test
```

Se aparecer "OK - Servidor funcionando", o servidor está ok. Depois tente:

```
http://localhost:3000
```

---

**Se ainda não funcionar:**
- Use outro navegador (Chrome, Edge)
- Desative VPN/proxy temporariamente
- Digite a URL manualmente (não use busca)
