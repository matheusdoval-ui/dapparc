# 🚀 Comandos para Conectar com GitHub

## ✅ Remote Configurado

O repositório remoto já foi adicionado:
- **URL:** https://github.com/matheusdoval-ui/dapparc.git
- **Branch padrão:** `main`

---

## 📋 Próximos Passos

Depois de instalar o Git e abrir um terminal com Git disponível, execute os seguintes comandos na ordem:

### 1️⃣ Configure seu usuário Git (apenas primeira vez)

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

**Exemplo:**
```bash
git config --global user.name "matheusdoval-ui"
git config --global user.email "seu-email@example.com"
```

---

### 2️⃣ Verifique o status do repositório

```bash
git status
```

Você deve ver todos os arquivos como "Untracked files".

---

### 3️⃣ Adicione todos os arquivos ao stage

```bash
git add .
```

Isso adiciona todos os arquivos ao stage (área de preparação).

**Nota:** O `.gitignore` já está presente, então `node_modules/`, `.next/`, etc. serão ignorados automaticamente.

---

### 4️⃣ Faça o primeiro commit

```bash
git commit -m "Initial commit: ARC Network dApp

- Next.js 16 com App Router
- API routes para wallet stats e register query
- Integração com ARC Testnet
- Componentes UI completos
- Documentação de deploy e solução de erros"
```

Ou uma mensagem mais simples:

```bash
git commit -m "Initial commit: ARC Network dApp"
```

---

### 5️⃣ Envie os arquivos para o GitHub

```bash
# Renomeie branch para main (se necessário)
git branch -M main

# Envie os arquivos para o GitHub
git push -u origin main
```

**Se for a primeira vez fazendo push:**
- O GitHub pode pedir suas credenciais
- Use seu **Personal Access Token** (não sua senha)
- Ou configure SSH key para autenticação

---

## 🔐 Autenticação no GitHub

### Opção 1: Personal Access Token (Mais Simples)

1. Acesse: https://github.com/settings/tokens
2. Clique em "Generate new token (classic)"
3. Dê um nome (ex: "dapparc-local")
4. Selecione escopo: **`repo`** (acesso completo aos repositórios)
5. Clique em "Generate token"
6. **Copie o token** (você só verá uma vez!)
7. Ao fazer `git push`, use o token como senha

**Exemplo:**
```
Username: matheusdoval-ui
Password: [cole seu token aqui]
```

### Opção 2: SSH Key (Recomendado para Uso Contínuo)

```bash
# Gere uma chave SSH
ssh-keygen -t ed25519 -C "seu-email@example.com"

# Copie a chave pública
cat ~/.ssh/id_ed25519.pub
```

Depois:
1. Acesse: https://github.com/settings/keys
2. Clique em "New SSH key"
3. Cole a chave pública
4. Salve

E altere o remote para usar SSH:

```bash
git remote set-url origin git@github.com:matheusdoval-ui/dapparc.git
```

---

## ✅ Verificar Conexão

Depois de fazer push, verifique:

```bash
# Ver remotos configurados
git remote -v

# Verificar status
git status
```

Você deve ver:
```
On branch main
Your branch is up to date with 'origin/main'.

nothing to commit, working tree clean
```

---

## 📤 Enviar Atualizações Futuras

Sempre que fizer mudanças no código:

```bash
# 1. Ver o que mudou
git status

# 2. Adicionar arquivos modificados
git add .

# 3. Fazer commit
git commit -m "Descrição das mudanças"

# 4. Enviar para o GitHub
git push
```

---

## 🔄 Baixar Atualizações do GitHub

Se fizer mudanças diretamente no GitHub ou em outro computador:

```bash
# Baixar mudanças
git pull
```

---

## 📚 Comandos Úteis

```bash
# Ver histórico de commits
git log --oneline

# Ver diferenças antes de commitar
git diff

# Ver arquivos no stage
git status

# Desfazer arquivos do stage (sem perder mudanças)
git reset

# Ver configurações do repositório
git remote -v
```

---

## 🆘 Problemas Comuns

### Erro: "fatal: could not read Username"

**Solução:** Configure o remote com credenciais:
```bash
git remote set-url origin https://USERNAME:TOKEN@github.com/matheusdoval-ui/dapparc.git
```

### Erro: "Permission denied (publickey)"

**Solução:** Configure SSH key ou use HTTPS com token.

### Erro: "The requested URL returned error: 403"

**Solução:** Seu token pode estar expirado ou sem permissões. Gere um novo token.

---

## ✅ Checklist Final

- [ ] Git instalado
- [ ] Usuário configurado (`git config --global user.name` e `user.email`)
- [ ] Arquivos adicionados (`git add .`)
- [ ] Primeiro commit feito (`git commit`)
- [ ] Push para GitHub bem-sucedido (`git push`)
- [ ] Repositório visível em: https://github.com/matheusdoval-ui/dapparc

---

**Repositório:** https://github.com/matheusdoval-ui/dapparc.git  
**Status:** ✅ Remote configurado, pronto para push!
