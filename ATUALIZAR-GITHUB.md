# 🚀 Atualizar GitHub com as Mudanças

## 📝 Mudanças Realizadas

As seguintes alterações foram feitas no código:

1. ✅ Link "Docs" no cabeçalho atualizado para: https://docs.arc.network/arc/references/contract-addresses
2. ✅ Link "Explorer" no cabeçalho atualizado para: https://www.arc.network/

---

## 🔄 Comandos para Atualizar o GitHub

Execute estes comandos no terminal (PowerShell, Git Bash ou CMD) **após instalar o Git**:

### 1️⃣ Navegue até o diretório do projeto

```bash
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
```

### 2️⃣ Verifique o status das mudanças

```bash
git status
```

Você deve ver o arquivo `app/page.tsx` como modificado.

### 3️⃣ Adicione as mudanças ao stage

```bash
git add app/page.tsx
```

Ou para adicionar todos os arquivos modificados:

```bash
git add .
```

### 4️⃣ Faça o commit das mudanças

```bash
git commit -m "Atualizar links do cabeçalho: Docs e Explorer

- Link Docs aponta para contract-addresses da documentação ARC
- Link Explorer aponta para arc.network"
```

### 5️⃣ Envie para o GitHub

```bash
git push
```

Se for a primeira vez fazendo push:

```bash
git push -u origin main
```

---

## ⚡ Comandos Rápidos (Copy & Paste)

Execute todos de uma vez:

```bash
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app
git add app/page.tsx
git commit -m "Atualizar links do cabeçalho: Docs e Explorer"
git push
```

---

## ✅ Verificação

Após o push, verifique no GitHub:
- Acesse: https://github.com/matheusdoval-ui/dapparc
- Confirme que o commit aparece no histórico
- Confirme que o arquivo `app/page.tsx` está atualizado

---

## 🆘 Se Encontrar Problemas

### Erro: "Git não é reconhecido"
- Instale o Git: https://git-scm.com/download/win
- Reinicie o terminal após instalar

### Erro: "Please tell me who you are"
Configure seu usuário:
```bash
git config --global user.name "matheusdoval-ui"
git config --global user.email "seu-email@example.com"
```

### Erro: "Permission denied"
- Use Personal Access Token ao invés de senha
- Ou configure SSH key

---

**Arquivo modificado:** `app/page.tsx`  
**Status:** ✅ Pronto para commit e push!
