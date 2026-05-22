Aqui está o **README.md atualizado** com todas as funcionalidades completas do sistema:

```markdown
# 🌻 Associação Vida Carrapicho - Sistema Completo

> Sistema web completo para gestão de ONG, incluindo site institucional e painel administrativo.

## 📋 Visão Geral do Projeto

Este repositório contém o sistema completo desenvolvido para a **Associação Vida Carrapicho**, uma ONG dedicada a transformar vidas de crianças e famílias em situação de vulnerabilidade.

### ✅ Status: PROJETO FINALIZADO E FUNCIONAL

---

## 🚀 Tecnologias Utilizadas

### Backend
- **Node.js** + **Express** - API RESTful
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação segura
- **bcryptjs** - Criptografia de senhas
- **Multer** - Upload de imagens
- **QRCode** - Geração de PIX dinâmico

### Frontend
- **HTML5 / CSS3** - Interface responsiva
- **JavaScript (Vanilla)** - Interatividade
- **Chart.js** - Gráficos estatísticos
- **jQuery** - Manipulação DOM
- **HTML2PDF** - Geração de relatórios

---

## 📁 Estrutura do Projeto

```
Associacao-Vida-Carrapicho/
├── Projeto-carrapicho/           # Sistema completo
│   ├── server.js                 # Servidor principal
│   ├── backend/
│   │   ├── config/
│   │   │   └── database.js       # Conexão PostgreSQL
│   │   ├── controllers/          # Lógica de negócio
│   │   ├── routes/               # Rotas da API
│   │   └── middlewares/          # Autenticação
│   ├── frontend/
│   │   ├── home.html             # Landing page
│   │   ├── evento.html           # Página de eventos
│   │   ├── admin/
│   │   │   └── index.html        # Painel administrativo
│   │   ├── src/
│   │   │   ├── styles/           # CSS completo
│   │   │   └── javascript/       # JS modular
│   │   └── uploads/              # Imagens dos eventos
│   ├── .env                      # Configurações
│   └── package.json              # Dependências
```

---

## 🎯 Funcionalidades Implementadas

### 🌐 Site Institucional (Público)

| Funcionalidade | Descrição | Status |
|----------------|-----------|--------|
| Landing Page | Design responsivo com seções informativas | ✅ Completo |
| Modal de Doação PIX | Geração de QR Code dinâmico com valor personalizado | ✅ Completo |
| Sistema de Transparência | Gráfico doughnut mostrando distribuição de gastos | ✅ Completo |
| Listagem de Eventos | Cards com próximos eventos dinâmicos | ✅ Completo |
| Página de Detalhes | Visualização completa de cada evento | ✅ Completo |
| Formulário de Contato | Envio de mensagens com seleção de interesse | ✅ Completo |
| Inscrição de Voluntários | Cadastro via formulário integrado | ✅ Completo |
| Créditos da Equipe | Modal com informações dos desenvolvedores | ✅ Completo |
| Animações e Efeitos | Scroll reveals, contadores, digitação automática | ✅ Completo |

### 🔐 Painel Administrativo (Restrito)

| Funcionalidade | Descrição | Status |
|----------------|-----------|--------|
| Login Seguro | Autenticação JWT com níveis de acesso | ✅ Completo |
| Dashboard Financeiro | Cards com receitas/despesas/saldo + gráficos | ✅ Completo |
| Gestão de Eventos | CRUD completo com upload de imagens (máx 5) | ✅ Completo |
| Gestão Financeira | Registro de receitas/despesas por categoria | ✅ Completo |
| Gestão de Usuários | Controle de permissões (Admin/Editor) | ✅ Completo |
| Gestão de Voluntários | Visualização de inscrições e atualização de status | ✅ Completo |
| Relatórios PDF | Geração de relatórios financeiro, eventos e completo | ✅ Completo |
| Proteção de Rotas | Middleware para acesso administrativo | ✅ Completo |

---

## 🗄️ Banco de Dados (PostgreSQL)

### Tabelas do Sistema

```sql
-- Usuários do sistema
users (id, name, email, password, role, active, created_at)

-- Eventos e galeria
events (id, title, description, event_date, location, status, created_by, created_at)
event_images (id, event_id, image_url, is_cover)

-- Transparência financeira
transparency (id, type, category, description, amount, transaction_date, document_url)

-- Doações PIX
donations (id, donor_name, donor_email, amount, pix_key, pix_txid, pix_payload, qr_code, status)

-- Contatos e voluntários
contacts (id, name, email, phone, message, created_at)
voluntarios (id, nome, email, telefone, disponibilidade, interesse, status, created_at)
```

---

## 🔧 Como Executar o Projeto

### Pré-requisitos

- Node.js (v18+)
- PostgreSQL (v14+)
- Git

### Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/Associacao-Vida-Carrapicho.git

# 2. Entre na pasta do projeto
cd Associacao-Vida-Carrapicho/Projeto-carrapicho

# 3. Instale as dependências
npm install

# 4. Configure o banco de dados no PostgreSQL
# - Crie um banco chamado 'ong_carrapicho'
# - Execute os scripts SQL de criação das tabelas

# 5. Configure o arquivo .env (veja modelo abaixo)
cp .env.example .env

# 6. Inicie o servidor
npm start

# 7. Acesse no navegador
# Site: http://localhost:3000
# Admin: http://localhost:3000/admin
```

### Configuração do `.env`

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/ong_carrapicho
JWT_SECRET=seu_segredo_super_secreto
PIX_KEY=07895526000126
PIX_MERCHANT_NAME="ASSOCIACAO VIDA CARRAPICHO"
PIX_MERCHANT_CITY="SAO PAULO"
NODE_ENV=development
```

### Credenciais Padrão (Primeiro Acesso)

| Email | Senha | Perfil |
|-------|-------|--------|
| admin@ong.com | admin123 | Administrador |

> ⚠️ **Importante:** O usuário ID 1 é protegido e não pode ser deletado!

---

## 📊 Funcionalidades Detalhadas

### 🎨 Site Institucional

#### Modal de Doação PIX
- Seleção de valores predefinidos (R$20, R$50, R$100, R$200, R$500)
- Opção de valor personalizado
- Geração automática de QR Code
- Código PIX para copiar e colar
- Instruções de segurança

#### Módulo de Transparência
- Gráfico de distribuição de gastos por categoria
- Cards com total arrecadado, gastos e saldo
- Atualização em tempo real via API

#### Seção de Eventos
- Cards dinâmicos com capa, título e data
- Redirecionamento para página de detalhes
- Galeria de imagens com lightbox

### 🔧 Painel Administrativo

#### Dashboard
- Cards com totais financeiros atualizados
- Gráfico doughnut de distribuição de gastos
- Gráfico de barras comparativo receitas/despesas
- Lista de despesas por categoria com percentuais

#### Gestão de Eventos
- Upload de até 5 imagens por evento
- Compressão automática de imagens
- Preview das imagens com opção de remoção
- Edição completa (título, descrição, data, local, status)
- Exclusão com remoção física das imagens

#### Gestão Financeira
- Registro de receitas e despesas
- Categorias pré-definidas
- Filtro por tipo e data
- Exclusão de lançamentos

#### Gestão de Voluntários
- Lista de inscrições do site
- Visualização da mensagem/interesse
- Atualização de status (Pendente/Contatado/Aprovado/Recusado)
- Exclusão de registros

#### Gestão de Usuários
- Criação de usuários (Admin/Editor)
- Edição de permissões
- Exclusão segura (protege admin principal)
- Controle de acesso por nível

#### Relatórios PDF
- Relatório Financeiro (detalhado com gráficos)
- Relatório de Eventos (lista completa)
- Relatório Completo (resumo geral)

---

## 🎯 Fluxos do Sistema

### Fluxo de Doação
1. Usuário clica em "Doar" no site
2. Escolhe ou digita um valor
3. Sistema gera QR Code PIX dinâmico
4. Usuário escaneia ou copia o código
5. Pagamento é processado diretamente no banco

### Fluxo de Voluntário
1. Usuário acessa modal de contato
2. Seleciona "Quero ser voluntário"
3. Preenche nome, email e mensagem
4. Dados são salvos na tabela `voluntarios`
5. Admin visualiza e atualiza status

### Fluxo de Evento
1. Admin cria evento com título, data e imagens
2. Evento aparece no site público
3. Usuários clicam para ver detalhes
4. Galeria de imagens em lightbox

---

## 📱 Responsividade

O sistema é totalmente responsivo, funcionando em:
- 📱 Smartphones (320px - 480px)
- 📟 Tablets (481px - 768px)
- 💻 Notebooks (769px - 1024px)
- 🖥️ Desktops (1025px+)

---

## 👥 Equipe de Desenvolvimento

| Nome | Função |
|------|--------|
| Bruno Silva de Freitas | Scrum Master |
| Gabriel Francisco Siqueira | Product Owner |
| Eduardo José Bernardo da Silva | Dev Front-End |
| Kevin Alves Silva | Dev Front-End |
| Davi Marcos Vergueiro Lima | Dev Front-End |
| Lucas Cabral dos Santos | Dev Full-Stack |
| Caio dos Santos Gomes | Dev Back-End |
| João Victor da Silva Coutinho | Quality Assurance |

**Gestor do Projeto:** João Roberto Ursino Da Cruz

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e para a **Associação Vida Carrapicho**.

---

## 📞 Contato

- **Email:** comunicacaocarrapicho@gmail.com
- **Telefone:** (11) 94059-5320
- **Endereço:** R. Iraí de Minas, 202 - Jardim Itapolis - São Paulo, SP

---

## 🎓 Instituição de Ensino

Projeto desenvolvido como Trabalho de Conclusão de Curso na **Universidade Cruzeiro do Sul**.

---

**© 2026 Associação Vida Carrapicho - Todos os direitos reservados**
```

Este README agora:
1. ✅ Mostra que o projeto está **COMPLETO E FUNCIONAL**
2. ✅ Lista **TODAS** as funcionalidades com status
3. ✅ Inclui estrutura completa do banco de dados
4. ✅ Tem guia passo a passo de instalação
5. ✅ Documenta fluxos do sistema
6. ✅ Mantém os créditos da equipe
7. ✅ Está bem organizado e profissional
