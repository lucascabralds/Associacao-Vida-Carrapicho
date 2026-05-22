# 🌻 Associação Vida Carrapicho — Sistema Completo

> Sistema web completo para gestão de ONG, incluindo **site institucional** e **painel administrativo**.

<p align="center">
  <img src="https://img.shields.io/badge/status-finalizado-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/node.js-v18+-green?style=for-the-badge&logo=node.js" />
  <img src="https://img.shields.io/badge/postgresql-v14+-blue?style=for-the-badge&logo=postgresql" />
  <img src="https://img.shields.io/badge/license-educacional-orange?style=for-the-badge" />
</p>

---

# 📋 Visão Geral

Este repositório contém o sistema desenvolvido para a **Associação Vida Carrapicho**, uma ONG dedicada a transformar vidas de crianças e famílias em situação de vulnerabilidade social.

O projeto possui:

* 🌐 Site institucional responsivo
* 🔐 Painel administrativo completo
* 💰 Sistema de doações via PIX
* 📊 Transparência financeira
* 📅 Gestão de eventos
* 👥 Controle de voluntários
* 📄 Geração de relatórios PDF

---

# ✅ Status do Projeto

## ✔ Projeto Finalizado e Funcional

---

# 🚀 Tecnologias Utilizadas

## 🔧 Backend

| Tecnologia            | Finalidade                |
| --------------------- | ------------------------- |
| **Node.js + Express** | API RESTful               |
| **PostgreSQL**        | Banco de dados relacional |
| **JWT**               | Autenticação segura       |
| **bcryptjs**          | Criptografia de senhas    |
| **Multer**            | Upload de imagens         |
| **QRCode**            | Geração de PIX dinâmico   |

---

## 🎨 Frontend

| Tecnologia               | Finalidade            |
| ------------------------ | --------------------- |
| **HTML5 / CSS3**         | Interface responsiva  |
| **JavaScript (Vanilla)** | Interatividade        |
| **Chart.js**             | Gráficos estatísticos |
| **jQuery**               | Manipulação DOM       |
| **HTML2PDF**             | Geração de relatórios |

---

# 📁 Estrutura do Projeto

```bash
Associacao-Vida-Carrapicho/
└── Projeto-carrapicho/
    ├── server.js                     # Servidor principal
    ├── backend/
    │   ├── config/
    │   │   └── database.js           # Conexão PostgreSQL
    │   ├── controllers/              # Lógica de negócio
    │   ├── routes/                   # Rotas da API
    │   └── middlewares/              # Autenticação
    │
    ├── frontend/
    │   ├── home.html                 # Landing page
    │   ├── evento.html               # Página de eventos
    │   ├── admin/
    │   │   └── index.html            # Painel administrativo
    │   │
    │   ├── src/
    │   │   ├── styles/               # CSS completo
    │   │   └── javascript/           # JavaScript modular
    │   │
    │   └── uploads/                  # Imagens dos eventos
    │
    ├── .env                          # Variáveis de ambiente
    └── package.json                  # Dependências
```

---

# 🎯 Funcionalidades Implementadas

# 🌐 Site Institucional (Público)

| Funcionalidade           | Descrição                                   | Status |
| ------------------------ | ------------------------------------------- | :----: |
| Landing Page             | Design responsivo com seções informativas   |    ✅   |
| Modal de Doação PIX      | QR Code dinâmico com valor personalizado    |    ✅   |
| Sistema de Transparência | Gráfico doughnut com distribuição de gastos |    ✅   |
| Listagem de Eventos      | Cards dinâmicos com próximos eventos        |    ✅   |
| Página de Detalhes       | Visualização completa dos eventos           |    ✅   |
| Formulário de Contato    | Envio de mensagens integrado                |    ✅   |
| Cadastro de Voluntários  | Inscrição via formulário                    |    ✅   |
| Créditos da Equipe       | Modal com informações dos desenvolvedores   |    ✅   |
| Animações e Efeitos      | Scroll reveal, contadores e typing effect   |    ✅   |

---

# 🔐 Painel Administrativo (Restrito)

| Funcionalidade        | Descrição                                | Status |
| --------------------- | ---------------------------------------- | :----: |
| Login Seguro          | Autenticação JWT com níveis de acesso    |    ✅   |
| Dashboard Financeiro  | Cards financeiros + gráficos             |    ✅   |
| Gestão de Eventos     | CRUD completo com upload de imagens      |    ✅   |
| Gestão Financeira     | Receitas e despesas por categoria        |    ✅   |
| Gestão de Usuários    | Controle de permissões                   |    ✅   |
| Gestão de Voluntários | Atualização de status das inscrições     |    ✅   |
| Relatórios PDF        | Financeiro, eventos e relatório completo |    ✅   |
| Proteção de Rotas     | Middleware administrativo                |    ✅   |

---

# 🗄️ Banco de Dados (PostgreSQL)

## 📌 Tabelas do Sistema

```sql
-- Usuários do sistema
users (
  id,
  name,
  email,
  password,
  role,
  active,
  created_at
)

-- Eventos e galeria
events (
  id,
  title,
  description,
  event_date,
  location,
  status,
  created_by,
  created_at
)

event_images (
  id,
  event_id,
  image_url,
  is_cover
)

-- Transparência financeira
transparency (
  id,
  type,
  category,
  description,
  amount,
  transaction_date,
  document_url
)

-- Doações PIX
donations (
  id,
  donor_name,
  donor_email,
  amount,
  pix_key,
  pix_txid,
  pix_payload,
  qr_code,
  status
)

-- Contatos e voluntários
contacts (
  id,
  name,
  email,
  phone,
  message,
  created_at
)

voluntarios (
  id,
  nome,
  email,
  telefone,
  disponibilidade,
  interesse,
  status,
  created_at
)
```

---

# 🔧 Como Executar o Projeto

## ✅ Pré-requisitos

* Node.js (v18+)
* PostgreSQL (v14+)
* Git

---

## 🚀 Passo a Passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/Associacao-Vida-Carrapicho.git

# 2. Entre na pasta do projeto
cd Associacao-Vida-Carrapicho/Projeto-carrapicho

# 3. Instale as dependências
npm install

# 4. Configure o banco PostgreSQL
# Crie um banco chamado:
ong_carrapicho

# 5. Configure o arquivo .env
cp .env.example .env

# 6. Inicie o servidor
npm start

# 7. Acesse no navegador
# Site:
http://localhost:3000

# Painel Admin:
http://localhost:3000/admin
```

---

# ⚙️ Configuração do `.env`

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/ong_carrapicho

JWT_SECRET=seu_segredo_super_secreto

PIX_KEY=07895526000126
PIX_MERCHANT_NAME="ASSOCIACAO VIDA CARRAPICHO"
PIX_MERCHANT_CITY="SAO PAULO"

NODE_ENV=development
```

---

# 🔑 Credenciais Padrão

| Email                                 | Senha    | Perfil        |
| ------------------------------------- | -------- | ------------- |
| [admin@ong.com](mailto:admin@ong.com) | admin123 | Administrador |

> ⚠️ Importante: o usuário de ID `1` é protegido e não pode ser deletado.

---

# 📊 Funcionalidades Detalhadas

# 🎨 Site Institucional

## 💰 Modal de Doação PIX

* Valores predefinidos:

  * R$20
  * R$50
  * R$100
  * R$200
  * R$500

* Valor personalizado

* QR Code automático

* PIX copia e cola

* Instruções de segurança

---

## 📈 Módulo de Transparência

* Distribuição de gastos por categoria
* Cards financeiros
* Atualização em tempo real via API

---

## 📅 Seção de Eventos

* Cards dinâmicos
* Página de detalhes
* Galeria com lightbox

---

# 🔧 Painel Administrativo

## 📊 Dashboard

* Totais financeiros
* Gráfico doughnut
* Comparativo receitas/despesas
* Percentuais por categoria

---

## 🖼 Gestão de Eventos

* Upload de até 5 imagens
* Compressão automática
* Preview das imagens
* Edição completa
* Exclusão com remoção física

---

## 💵 Gestão Financeira

* Cadastro de receitas/despesas
* Categorias pré-definidas
* Filtros por tipo e data

---

## 👥 Gestão de Voluntários

* Lista de inscritos
* Atualização de status:

  * Pendente
  * Contatado
  * Aprovado
  * Recusado

---

## 🔐 Gestão de Usuários

* Admin e Editor
* Controle de permissões
* Exclusão segura
* Proteção do admin principal

---

## 📄 Relatórios PDF

* Relatório Financeiro
* Relatório de Eventos
* Relatório Completo

---

# 🎯 Fluxos do Sistema

# 💰 Fluxo de Doação

```text
Usuário clica em "Doar"
        ↓
Seleciona um valor
        ↓
Sistema gera QR Code PIX
        ↓
Usuário realiza o pagamento
        ↓
Pagamento processado
```

---

# 👥 Fluxo de Voluntário

```text
Usuário acessa formulário
        ↓
Seleciona "Quero ser voluntário"
        ↓
Preenche os dados
        ↓
Informações salvas no banco
        ↓
Admin atualiza o status
```

---

# 📅 Fluxo de Evento

```text
Admin cria evento
        ↓
Evento aparece no site
        ↓
Usuário acessa detalhes
        ↓
Galeria é exibida
```

---

# 📱 Responsividade

| Dispositivo    | Resolução      |
| -------------- | -------------- |
| 📱 Smartphones | 320px - 480px  |
| 📟 Tablets     | 481px - 768px  |
| 💻 Notebooks   | 769px - 1024px |
| 🖥️ Desktops   | 1025px+        |

---

# 👥 Equipe de Desenvolvimento

| Nome                           | Função            |
| ------------------------------ | ----------------- |
| Bruno Silva de Freitas         | Scrum Master      |
| Gabriel Francisco Siqueira     | Product Owner     |
| Eduardo José Bernardo da Silva | Dev Front-End     |
| Kevin Alves Silva              | Dev Front-End     |
| Davi Marcos Vergueiro Lima     | Dev Front-End     |
| Lucas Cabral dos Santos        | Dev Full-Stack    |
| Caio dos Santos Gomes          | Dev Back-End      |
| João Victor da Silva Coutinho  | Quality Assurance |

### 👨‍🏫 Gestor do Projeto

**João Roberto Ursino Da Cruz**

---

# 📄 Licença

Este projeto foi desenvolvido para fins educacionais e para a Associação Vida Carrapicho.

---

# 📞 Contato

| Contato     | Informação                                                                |
| ----------- | ------------------------------------------------------------------------- |
| 📧 Email    | [comunicacaocarrapicho@gmail.com](mailto:comunicacaocarrapicho@gmail.com) |
| 📞 Telefone | (11) 94059-5320                                                           |
| 📍 Endereço | R. Iraí de Minas, 202 — Jardim Itapolis — São Paulo/SP                    |

---

# 🎓 Instituição de Ensino

Projeto desenvolvido como Trabalho de Conclusão de Curso na **Universidade Cruzeiro do Sul**.

---

<div align="center">

### 🌻 Associação Vida Carrapicho

© 2026 — Todos os direitos reservados.

</div>
