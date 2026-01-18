# 📝 Próximos Passos com Git

## ✅ Repositório Inicializado

O repositório Git foi criado com sucesso! Agora você pode:

---

## 1️⃣ Adicionar Arquivos ao Stage

Quando você instalar o Git ou usar um terminal com Git disponível, execute:

```bash
git add .
```

Isso adiciona todos os arquivos ao stage (área de preparação).

**Nota:** O arquivo `.gitignore` já está presente, então arquivos como `node_modules/`, `.next/`, etc. serão ignorados automaticamente.

---

## 2️⃣ Fazer o Primeiro Commit

```bash
git commit -m "Initial commit: ARC Network dApp"
```

Ou com uma mensagem mais descritiva:

```bash
git commit -m "Initial commit: ARC Network dApp

- Next.js 16 com App Router
- API routes para wallet stats e register query
- Integração com ARC Testnet
- Componentes UI completos
- Documentação de deploy e solução de erros"
```

---

## 3️⃣ Configurar Usuário (Primeira Vez)

Se for a primeira vez usando Git neste computador:

```bash
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

**Exemplo:**
```bash
git config --global user.name "Matheus"
git config --global user.email "matheus@example.com"
```

---

## 4️⃣ Conectar com GitHub/GitLab (Opcional)

### Criar Repositório no GitHub

1. Acesse https://github.com
2. Clique em "New repository"
3. Nome: `arc-network-dapp` (ou outro nome)
4. **Não marque** "Add a README file"
5. Clique em "Create repository"

### Adicionar Remote e Fazer Push

```bash
# Adicione o repositório remoto (substitua USERNAME)
git remote add origin https://github.com/USERNAME/arc-network-dapp.git

# Renomeie branch para main (se necessário)
git branch -M main

# Envie os arquivos
git push -u origin main
```

---

## 5️⃣ Conectar com Vercel

Depois de fazer push para o GitHub:

1. Acesse https://vercel.com
2. Clique em "Add New Project"
3. Importe o repositório do GitHub
4. Configure:
   - **Framework Preset:** Next.js ⚠️ **IMPORTANTE!**
   - **Root Directory:** (deixe vazio)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Adicione variáveis de ambiente (se necessário):
   - `ARC_RPC_URL` (opcional, já tem default)
   - `NEXT_PUBLIC_CONTRACT_ADDRESS` (se quiser usar contrato)
6. Clique em "Deploy"

**⚠️ Lembre-se:** Verifique o **Framework Preset** está como **Next.js** para evitar o erro NOT_FOUND!

---

## 📋 Comandos Git Úteis

### Status e Visualização
```bash
git status                 # Ver status dos arquivos
git log                    # Ver histórico
git log --oneline          # Ver histórico resumido
```

### Adicionar e Commitar
```bash
git add .                  # Adiciona todos os arquivos
git add arquivo.ts         # Adiciona arquivo específico
git commit -m "Mensagem"   # Faz commit
git commit -a -m "Msg"     # Adiciona e commita em um passo
```

### Branches
```bash
git branch                 # Lista branches
git branch nova-feature    # Cria nova branch
git checkout nova-feature  # Muda para branch
git checkout -b nova-feat  # Cria e muda
```

### Remoto
```bash
git remote -v              # Lista remotos
git push                   # Envia commits
git pull                   # Baixa mudanças
git fetch                  # Baixa sem mesclar
```

---

## 🔍 Verificar se Está Funcionando

Execute para verificar o status:

```bash
git status
```

Você deve ver algo como:
```
On branch main

No commits yet

Untracked files:
  (use "git add <file>..." to include in what will be committed)
        app/
        components/
        lib/
        ...
```

---

## ⚠️ Importante

- **Instale o Git** para poder usar os comandos acima
- Baixe em: https://git-scm.com/download/win
- Ou use **GitHub Desktop**: https://desktop.github.com/

Depois de instalar o Git, **reinicie o terminal** e os comandos funcionarão normalmente!

---

**Status Atual:** ✅ Repositório Git criado e pronto para uso!
