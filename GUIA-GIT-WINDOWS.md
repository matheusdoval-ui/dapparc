# 🪟 Guia: Instalar Git e Inicializar Repositório no Windows

## 📥 Instalação do Git no Windows

### Método 1: Git for Windows (Recomendado)

1. **Baixe o Git:**
   - Acesse: https://git-scm.com/download/win
   - O download começa automaticamente

2. **Instale o Git:**
   - Execute o instalador baixado (`Git-*.exe`)
   - Clique em "Next" nas telas de instalação
   - **Importante:** Durante a instalação, certifique-se de marcar:
     - ✅ "Git from the command line and also from 3rd-party software"
     - ✅ "Use bundled OpenSSH"
   - Clique em "Install" e aguarde

3. **Verifique a instalação:**
   - Abra um **novo** PowerShell ou Prompt de Comando
   - Execute:
     ```powershell
     git --version
     ```
   - Se mostrar a versão (ex: `git version 2.x.x`), está instalado!

---

### Método 2: GitHub Desktop (Alternativa Simples)

1. **Baixe o GitHub Desktop:**
   - Acesse: https://desktop.github.com/
   - Baixe e instale

2. **GitHub Desktop inclui Git:**
   - Ao instalar o GitHub Desktop, o Git é instalado automaticamente
   - Depois da instalação, você pode usar Git pelo terminal

---

## 🚀 Inicializar Repositório Git

Depois de instalar o Git, execute no PowerShell:

```powershell
# Navegue até o diretório do projeto
cd C:\Users\mathe\Desktop\dapp\arc-network-d-app

# Inicialize o repositório Git
git init

# Adicione todos os arquivos
git add .

# Faça o primeiro commit
git commit -m "Initial commit: ARC Network dApp"
```

---

## ⚙️ Configuração Inicial do Git (Primeira Vez)

Se for a primeira vez usando Git, configure seu nome e email:

```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

**Exemplo:**
```powershell
git config --global user.name "Matheus"
git config --global user.email "matheus@example.com"
```

---

## 📋 Comandos Git Úteis

### Status e Visualização
```powershell
git status                    # Ver status dos arquivos
git log                       # Ver histórico de commits
git log --oneline            # Ver histórico resumido
```

### Adicionar e Commitar
```powershell
git add .                     # Adiciona todos os arquivos modificados
git add arquivo.ts           # Adiciona arquivo específico
git commit -m "Mensagem"      # Faz commit com mensagem
```

### Branches
```powershell
git branch                    # Lista branches
git branch nome-branch       # Cria nova branch
git checkout nome-branch     # Muda para branch
git checkout -b nova-branch  # Cria e muda para nova branch
```

### Remoto (GitHub/GitLab)
```powershell
git remote add origin URL    # Adiciona repositório remoto
git push -u origin main      # Envia commits para remoto
git pull                     # Baixa mudanças do remoto
```

---

## 🔗 Conectar com GitHub/Vercel

### 1. Criar Repositório no GitHub

1. Acesse https://github.com
2. Clique em "New repository"
3. Dê um nome (ex: `arc-network-dapp`)
4. **Não inicialize** com README, .gitignore ou license
5. Clique em "Create repository"

### 2. Conectar Repositório Local ao GitHub

```powershell
# Adicione o remoto (substitua USERNAME pelo seu usuário)
git remote add origin https://github.com/USERNAME/arc-network-dapp.git

# Renomeie branch para main (se necessário)
git branch -M main

# Envie os arquivos
git push -u origin main
```

### 3. Conectar com Vercel

1. Acesse https://vercel.com
2. Vá em "Add New Project"
3. Importe o repositório do GitHub
4. Configure:
   - **Framework Preset:** Next.js
   - **Root Directory:** (deixe vazio se projeto na raiz)
   - **Build Command:** `npm run build`
   - **Output Directory:** `.next`
5. Clique em "Deploy"

---

## 🆘 Troubleshooting

### Git não é reconhecido após instalação

1. **Feche e reabra o terminal** (PowerShell ou CMD)
2. Se ainda não funcionar, reinicie o computador
3. Verifique o PATH:
   ```powershell
   $env:PATH -split ';' | Select-String "Git"
   ```

### Erro: "fatal: not a git repository"

Execute `git init` primeiro no diretório do projeto.

### Erro ao fazer commit: "Please tell me who you are"

Configure nome e email:
```powershell
git config --global user.name "Seu Nome"
git config --global user.email "seu.email@example.com"
```

---

## ✅ Checklist Rápido

- [ ] Git instalado (`git --version` funciona)
- [ ] Nome e email configurados
- [ ] `git init` executado no projeto
- [ ] Arquivos adicionados (`git add .`)
- [ ] Primeiro commit feito
- [ ] (Opcional) Repositório criado no GitHub
- [ ] (Opcional) Repositório conectado ao GitHub
- [ ] (Opcional) Projeto conectado ao Vercel

---

**Dica:** Após instalar o Git, sempre abra um **novo terminal** para que as mudanças no PATH sejam reconhecidas!
