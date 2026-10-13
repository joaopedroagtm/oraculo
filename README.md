# 🏛️ Oráculo: agite-me! • Templo Fitness

<div align="center">

![Vite](https://img.shields.io/badge/Vite-6.4-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES2023-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Gemini AI](https://img.shields.io/badge/Google%20Gemini-1.5%20Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Offline--First-5A0FC8?style=for-the-badge&logo=pwa&logoColor=white)
![Deploy](https://img.shields.io/badge/Vercel-Continuous%20Deployment-000000?style=for-the-badge&logo=vercel&logoColor=white)

<p align="center">
  <strong>Aplicativo PWA de musculação e constância fitness com estética cósmica/grega, inteligência artificial integrada, cronômetro de segundo plano, banco em nuvem e gamificação.</strong>
</p>


</div>

---

## Visão Geral

O **Oráculo** é um aplicativo mobile-first desenvolvido para transformar a jornada de treinos e musculação em uma experiência imersiva e ritualística. Ele combina o acompanhamento técnico de cargas e descanso com um ecossistema gamificado e um assistente de inteligência artificial dedicado a tirar dúvidas e sugerir variações de exercícios em tempo real.

O app opera tanto em **modo offline (Local-First via localStorage)** quanto online (fazendo um cadastro com banco de dados salvos no Supabase), garantindo que seus treinos nunca sejam perdidos mesmo sem sinal de internet na academia.

---

## Funcionalidades Principais

### 1. Santuário dos Pilares Semanais & Ciclo Lunar
* **Estágio 3D das Colunas Gregas:** Visualização interativa dos 7 dias da semana com colunatas em perspectiva tridimensional. Cada pilar é erguido com chamas cósmicas (`🌕`) ao concluir um treino.
* **Ciclo Lunar Mensal:** O mês é dividido em 4 fases lunares dinâmicas (Semana I: *Fundação*, Semana II: *Sobrecarga Progressiva*, Semana III: *Pico de Intensidade*, Semana IV: *Consolidação*) com acompanhamento de metas semanais e orientações de coaching.
* **Inspeção do Pilar Diário:** Status dinâmico em tempo real do treino de hoje vs. dias de descanso e repouso muscular.

### 2. Treino Ativo & Descanso Inteligente
* **Divisão de Treinos (Portais):**
  * **Portal Alpha:** Peito, Ombros & Tríceps
  * **Portal Beta:** Costas & Bíceps
  * **Portal Gamma:** Pernas & Pilares de Concreto
* **Registro Série por Série:** Acompanhamento preciso de peso levantado (kg), repetições e marcação de conclusão (`✓`).
* **Timer de Descanso Automático:** Disparo de contagem regressiva (60s / 90s) ao marcar cada série, com bipes sonoros via **Web Audio API** e vibração física (`navigator.vibrate`).
* **Substituição de Aparelhos por IA:** Quando uma máquina ou banco estiver ocupado na academia, o botão de IA aciona o **Google Gemini** para sugerir variações equivalentes imediatas.

### 3. Oráculo IA & Histórico de Chats
* Assistente fitness conversacional integrado à API do Google Gemini.
* **Sub-abas & Arquivamento:** Alterne entre a **Conversa Atual** e o **Histórico de Chats Arquivados**.
* Botão `+ Novo Chat` com arquivamento inteligente para consultar orientações anteriores sempre que quiser.

### 4. Histórico de Sessões & Raio-X do Treino
* Métricas acumuladas: **Recorde de Streak**, **Minutos Totais** e **Volume de Peso Levantado**.
* Cards de sessões com lista de exercícios realizados.
* **Modal de Detalhes:** Clique em qualquer sessão para inspecionar todas as séries, cargas e repetições executadas.

### 5. Customização de Aura Cósmica & Identidade
* **17 Tonalidades Curadas:** Cores com estética cósmica e glow em neon.
* **Personalizador Touch Mobile:** Slider touch contínuo de matiz (hue 0-360°) e luminosidade que atualiza a aura do avatar em tempo real sem popups invasivos.
* **Foto de Perfil com Crop:** Upload e compressão de foto de perfil salva localmente e na nuvem.

### 6. Sincronização em Nuvem (Supabase) + Offline PWA
* Autenticação via E-mail e Senha (com modo visitante local sem login).
* Sincronização automática de perfil, métricas e treinos na nuvem via Supabase.
* **PWA Instalável:** Adicione à tela de início do iOS ou Android para usar como aplicativo nativo.

---

## Tecnologias Utilizadas

| Camada | Tecnologia | Descrição |
|---|---|---|
| **Frontend Core** | HTML5 Semântico, CSS3 Moderno, JavaScript ES2023 | Arquitetura modular sem frameworks pesados, garantindo carregamento ultrarrápido |
| **Build & Tooling** | [Vite 6](https://vitejs.dev/) | Bundler moderno com Hot Module Replacement (HMR) instantâneo |
| **Backend & Banco** | [Supabase](https://supabase.com/) | Autenticação, banco de dados relacional PostgreSQL e armazenamento de perfil |
| **Inteligência Artificial** | [Google Gemini 3.1](https://ai.google.dev/) | Geração de orientações táticas e substituições de exercícios |
| **Áudio Sintetizado** | Web Audio API | Sintetizador de ondas para feedback tátil sonoro de bipes e fanfarra |
| **Hospedagem & Deploy** | [Vercel](https://vercel.com/) | Integração contínua (CI/CD) conectada ao GitHub com SSL automático |

---

## Estrutura de Diretórios

```
agtm/
├── dist/                      # Bundle de produção otimizado para deploy
├── public/                    # Assets estáticos, ícones e manifesto PWA
│   ├── manifest.json
│   └── assets/
├── src/
│   ├── components/            # Componentes visuais modulares
│   │   ├── anatomy.js         # Holograma e guia anatômico de músculos
│   │   ├── heatmap.js         # Santuário dos Pilares 3D & Ciclo Lunar
│   │   ├── moon.js            # Visualizador de fase lunar astronômica
│   │   └── timer.js           # Cronômetro de treino e timer de descanso
│   ├── data/                  # Catálogo de exercícios e rotinas
│   │   ├── exercises.js
│   │   └── routines.js
│   ├── services/              # Integrações externas e armazenamento
│   │   ├── audio.js           # Efeitos sonoros via Web Audio API
│   │   ├── gemini.js          # Conexão com a IA Google Gemini
│   │   ├── storage.js         # Gerenciamento de LocalStorage e Streaks
│   │   └── supabase.js        # Cliente de autenticação e sincronização
│   ├── styles/                # Folhas de estilo modularizadas
│   │   ├── app.css
│   │   └── theme.css
│   └── main.js                # Orquestrador central e controle de estado
├── .env.example               # Modelo de variáveis de ambiente
├── .gitignore                 # Arquivos ignorados no repositório
├── index.html                 # Ponto de entrada da aplicação
├── package.json               # Dependências do projeto
└── supabase_schema.sql        # Script SQL das tabelas do Supabase
```

---


---

## Como Instalar como Aplicativo (PWA)

* **No iPhone (Safari):** Abra o endereço no Safari, toque no botão de **Compartilhar** (quadrado com seta para cima) e escolha **"Adicionar à Tela de Início"**.
* **No Android (Chrome):** Abra o site no Chrome, toque no menu de 3 pontos verticais e selecione **"Instalar Aplicativo"** ou **"Adicionar à tela inicial"**.

---

## Autor

Desenvolvido com carinho e disciplina por **João Pedro**.

* Portfólio: [joaopedroagtm.com](https://joaopedroagtm.com)
* GitHub: [@joaopedro](https://github.com)

---

<div align="center">
  <sub>"Constância no ferro, clareza no espírito." • Oráculo: agite-me!</sub>
</div>
