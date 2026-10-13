// Serviço de Inteligência Artificial Gemini & Oráculo Fitness • AGiTe-Me!

import { EXERCISES } from '../data/exercises.js';

const GEMINI_MODELS = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-1.5-flash'];

async function callGeminiApi(effectiveKey, payload) {
  for (const model of GEMINI_MODELS) {
    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${effectiveKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text && text.trim().length > 0) {
          return { data, text: text.trim() };
        }
      }
    } catch (e) {
      console.warn(`Tentativa com modelo ${model} falhou:`, e);
    }
  }
  return null;
}

export const GeminiService = {
  // Substituir um exercício (ex: máquina ocupada ou dor articular)
  async substituteExercise(exercise, userProfile, apiKey = '') {
    const effectiveKey = (apiKey && apiKey.trim().length > 10)
      ? apiKey.trim()
      : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.trim() : '');

    // Se houver API key do Gemini configurada, chama a API
    if (effectiveKey) {
      try {
        const prompt = `Você é o Oráculo Personal Trainer do app AGiTe-Me! (estética etérea anos 90 e templo de ferro).
O aluno iniciante precisa substituir o exercício: "${exercise.name}" (foco: ${exercise.muscleLabel}, equipamento: ${exercise.equipment}).
Perfil do aluno: ${userProfile.age} anos, ${userProfile.weight}kg, foco: ${userProfile.goal}.
Sugira UM exercício alternativo que trabalhe o mesmo músculo, explique a execução em 2 frases e dê uma breve palavra de incentivo cósmico.
Responda em formato JSON com os campos: alternativeName, equipment, reason, instructions, oracleQuote.`;

        const result = await callGeminiApi(effectiveKey, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        });

        if (result?.text) {
          return JSON.parse(result.text);
        }
      } catch (err) {
        console.warn('Fallback para motor local do oráculo:', err);
      }
    }

    // Motor Local Autônomo (Offline / Sem Chave)
    const sameMuscleAlternatives = EXERCISES.filter(e => e.muscle === exercise.muscle && e.id !== exercise.id);
    const chosen = sameMuscleAlternatives.length > 0 
      ? sameMuscleAlternatives[Math.floor(Math.random() * sameMuscleAlternatives.length)]
      : { name: 'Flexão de Braços / Prancha com Toque', equipment: 'Peso Corporal', steps: ['Apoie as mãos no chão e faça o movimento com cadência.'], goldTip: 'Controle a respiração.' };

    return {
      alternativeName: chosen.name,
      equipment: chosen.equipment,
      reason: `Trabalha exatamente a mesma cadeia biomecânica de ${exercise.muscleLabel} com carga ajustável.`,
      instructions: chosen.steps ? chosen.steps[0] : 'Mantenha a postura alinhada e controle o movimento.',
      oracleQuote: '“O templo não depende do aparelho, e sim da conexão da sua mente com a fibra muscular.”'
    };
  },

  // Gerar Treino Personalizado do Dia
  async generateDailyRoutine(userProfile, apiKey = '') {
    const effectiveKey = (apiKey && apiKey.trim().length > 10)
      ? apiKey.trim()
      : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.trim() : '');

    if (effectiveKey) {
      try {
        const prompt = `Você é o Personal Trainer IA do app AGiTe-Me!.
Gere um treino de musculação completo e seguro para iniciante:
Idade: ${userProfile.age}, Peso: ${userProfile.weight}kg, Foco: ${userProfile.goal}, Dias/semana: ${userProfile.frequency}.
Retorne um JSON com:
- title (ex: "Portal Alpha: Templo dos Deltoides")
- subtitle (ex: "Consagração Superior")
- focus (músculos foco)
- exercises: array de 4 a 5 exercícios com { name, sets, reps, restSec, tip }
- oracleBlessing: frase motivacional etérea dos anos 90`;

        const result = await callGeminiApi(effectiveKey, {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' }
        });

        if (result?.text) {
          return JSON.parse(result.text);
        }
      } catch (err) {
        console.warn('Erro ao chamar Gemini, usando geração local:', err);
      }
    }

    // Motor Local
    const themes = [
      { title: 'Portal Alpha • Arquitetura de Ferro', subtitle: 'Peitoral & Tríceps', focus: 'Membros Superiores' },
      { title: 'Portal Beta • Asas Celestiais', subtitle: 'Dorsais & Bíceps', focus: 'Membros Superiores' },
      { title: 'Portal Gamma • Pilares da Gravidade', subtitle: 'Pernas & Core', focus: 'Membros Inferiores' }
    ];
    const picked = themes[Math.floor(Math.random() * themes.length)];

    return {
      title: picked.title,
      subtitle: picked.subtitle,
      focus: picked.focus,
      oracleBlessing: '“A consistência sob a lua molda o corpo como os antigos esculpiam o mármore.”'
    };
  },

  // Pílula de Motivação & Biomecânica do Oráculo (Mais de 30 ensinamentos cósmicos)
  getOracleDailyWisdom(seedIndex = null) {
    const quotes = [
      '“A carga é vaidade, a boa execução é eternidade.”',
      '“Iniciantes que controlam a fase excêntrica (descida do peso por 2 a 3 segundos) constroem o dobro de força muscular.”',
      '“Não conte as repetições antes de começar a queimar. A evolução verdadeira reside nas últimas duas.”',
      '“Mantenha suas escápulas coladas e a respiração ritmada. Você é o arquiteto vivo do seu corpo.”',
      '“Cada gota de suor neste templo de concreto te aproxima do seu melhor estado físico.”',
      '“O mármore resiste à força bruta, mas cede com perfeição à paciência do cinzel constante.”',
      '“A conexão mente-músculo não é misticismo: sinta cada fibra tensionar antes de mover o peso.”',
      '“O descanso sob a lua é onde a armadura se reconstrói. Sem sono reparador, o ferro não produz aço.”',
      '“Amplitude completa supera carga pesada reduzida pela metade. Conquiste todo o arco de movimento.”',
      '“Os antigos erguiam colunas uma pedra por dia. Faça o mesmo com o seu treino: um dia por vez.”',
      '“A respiração é o combustível da gravidade: expire no esforço da subida, inspire no controle da descida.”',
      '“Mesmo nos dias em que a gravidade parecer mais pesada, o simples ato de comparecer consagra a vitória.”',
      '“Cotovelos alinhados e punhos neutros preservam as articulações para décadas de evolução.”',
      '“A dor do esforço consciente dura minutos; o orgulho da disciplina acompanha seus passos pela vida toda.”',
      '“Não busque o esgotamento precoce: busque a técnica impecável e a progressão gradual de volume.”',
      '“O iniciante inteligente aprende a amar o básico bem feito: supino, remada e agachamento são templos atemporais.”',
      '“A musculação é a arte de ensinar a sua mente que os limites de ontem já não existem hoje.”',
      '“Colunas gregas não temem o tempo porque foram edificadas com alicerce firme. Respeite sua fase de adaptação.”',
      '“Contraia o abdômen em todos os exercícios. O core rígido é o pedestal de onde brota toda a força.”',
      '“A tempestade da motivação passageira passa rápido; a colunata da disciplina permanece inabalável sob as estrelas.”',
      '“Beba água como a terra absorve o orvalho da noite. Músculo desidratado perde até 15% da sua potência.”',
      '“Se a máquina estiver ocupada, a mente do guerreiro não se frustra: adapta-se e cria um novo caminho.”',
      '“A persistência silenciosa é mais poderosa do que o entusiasmo barulhento.”',
      '“O ferro é honesto: ele nunca mente para você sobre o seu esforço.”',
      '“Sua postura ao caminhar na vida reflete a força que você constrói na coluna e nos dorsais.”',
      '“Não busque pressa: templos gregos duram milênios porque cada pedra foi assentada com propósito.”',
      '“A mente sempre quer desistir antes do músculo. Respire fundo, reconecte-se e complete a série.”',
      '“Cada repetição controlada é uma escultura que você talha em si mesmo.”'
    ];

    if (seedIndex !== null && seedIndex >= 0) {
      return quotes[seedIndex % quotes.length];
    }

    // Seleciona uma mensagem baseada no dia do mês para dar constância diária ao amanhecer
    const dayOfMonth = new Date().getDate();
    return quotes[dayOfMonth % quotes.length];
  },

  getRandomOracleWisdom(currentText = '') {
    const quotes = [
      '“A carga é vaidade, a boa execução é eternidade.”',
      '“Iniciantes que controlam a fase excêntrica (descida do peso por 2 a 3 segundos) constroem o dobro de força muscular.”',
      '“Não conte as repetições antes de começar a queimar. A evolução verdadeira reside nas últimas duas.”',
      '“Mantenha suas escápulas coladas e a respiração ritmada. Você é o arquiteto vivo do seu corpo.”',
      '“Cada gota de suor neste templo de concreto te aproxima do seu melhor estado físico.”',
      '“O mármore resiste à força bruta, mas cede com perfeição à paciência do cinzel constante.”',
      '“A conexão mente-músculo não é misticismo: sinta cada fibra tensionar antes de mover o peso.”',
      '“O descanso sob a lua é onde a armadura se reconstrói. Sem sono reparador, o ferro não produz aço.”',
      '“Amplitude completa supera carga pesada reduzida pela metade. Conquiste todo o arco de movimento.”',
      '“Os antigos erguiam colunas uma pedra por dia. Faça o mesmo com o seu treino: um dia por vez.”',
      '“A respiração é o combustível da gravidade: expire no esforço da subida, inspire no controle da descida.”',
      '“Mesmo nos dias em que a gravidade parecer mais pesada, o simples ato de comparecer consagra a vitória.”',
      '“Cotovelos alinhados e punhos neutros preservam as articulações para décadas de evolução.”',
      '“A dor do esforço consciente dura minutos; o orgulho da disciplina acompanha seus passos pela vida toda.”',
      '“Não busque o esgotamento precoce: busque a técnica impecável e a progressão gradual de volume.”',
      '“O iniciante inteligente aprende a amar o básico bem feito: supino, remada e agachamento são templos atemporais.”',
      '“A musculação é a arte de ensinar a sua mente que os limites de ontem já não existem hoje.”',
      '“Colunas gregas não temem o tempo porque foram edificadas com alicerce firme. Respeite sua fase de adaptação.”',
      '“Contraia o abdômen em todos os exercícios. O core rígido é o pedestal de onde brota toda a força.”',
      '“A tempestade da motivação passageira passa rápido; a colunata da disciplina permanece inabalável sob as estrelas.”',
      '“Beba água como a terra absorve o orvalho da noite. Músculo desidratado perde até 15% da sua potência.”',
      '“Se a máquina estiver ocupada, a mente do guerreiro não se frustra: adapta-se e cria um novo caminho.”',
      '“A persistência silenciosa é mais poderosa do que o entusiasmo barulhento.”',
      '“O ferro é honesto: ele nunca mente para você sobre o seu esforço.”',
      '“Sua postura ao caminhar na vida reflete a força que você constrói na coluna e nos dorsais.”',
      '“Não busque pressa: templos gregos duram milênios porque cada pedra foi assentada com propósito.”',
      '“A mente sempre quer desistir antes do músculo. Respire fundo, reconecte-se e complete a série.”',
      '“Cada repetição controlada é uma escultura que você talha em si mesmo.”'
    ];

    const pool = quotes.filter(q => q.trim() !== currentText.trim());
    return pool[Math.floor(Math.random() * pool.length)] || quotes[0];
  },

  // Chat com o Oráculo com Memória e Injeção de Contexto (Gemini 1.5 Flash + Motor Offline Inteligente)
  async askOracleChat({ userMessage, chatHistory = [], userProfile, workoutHistory = [], activeSession = null, stats = null, apiKey = '' }) {
    const effectiveKey = (apiKey && apiKey.trim().length > 10)
      ? apiKey.trim()
      : ((userProfile?.geminiApiKey && userProfile.geminiApiKey.trim().length > 10)
        ? userProfile.geminiApiKey.trim()
        : (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY ? import.meta.env.VITE_GEMINI_API_KEY.trim() : ''));

    const imc = userProfile?.weight && userProfile?.height 
      ? (userProfile.weight / ((userProfile.height / 100) * (userProfile.height / 100))).toFixed(1)
      : '22.0';

    // Formata o histórico recente de treinos
    const recentSessions = (workoutHistory || []).slice(0, 6);
    const recentHistoryText = recentSessions.length > 0
      ? recentSessions.map((s, i) => {
          const date = s.date || 'Data não informada';
          const title = s.routineTitle || 'Treino';
          const vol = s.totalWeightVolume ? `${s.totalWeightVolume}kg levantados` : '';
          const dur = s.durationSeconds ? `${Math.round(s.durationSeconds / 60)} min` : '';
          return `Sessão ${i + 1}: ${date} - ${title} (${dur}${vol ? ', ' + vol : ''})`;
        }).join('\n')
      : 'Nenhuma sessão de treino concluída anteriormente.';

    // Formata a sessão ativa em andamento, se houver
    const activeSessionText = activeSession
      ? `TREINO EM ANDAMENTO AGORA: "${activeSession.routineTitle || 'Treino'}" iniciado há ${Math.round((activeSession.elapsedSeconds || 0) / 60)} minutos. Exercícios: ${(activeSession.exercises || []).map(e => e.exerciseName).join(', ')}.`
      : 'O guerreiro não está em treino ativo no momento.';

    // 1. Chamada à API Gemini se a chave estiver configurada
    if (effectiveKey && effectiveKey.length > 10) {
      try {
        const systemPrompt = `Você é o Oráculo Personal Trainer do app AGiTe-Me! - Templo de Treino Cósmico.
Sua persona une a sabedoria e estética etérea grega/anos 90 com o rigor científico moderno de biomecânica, hipertrofia e longevidade.
Você conversa diretamente com o guerreiro e tem acesso a toda a sua jornada:

[DADOS BIOMÉTRICOS DO GUERREIRO]
- Nome: ${userProfile.name || 'Guerreiro'}
- Idade: ${userProfile.age || 25} anos
- Peso: ${userProfile.weight || 75} kg | Altura: ${userProfile.height || 175} cm | IMC: ${imc}
- Objetivo Primário: ${userProfile.goal || 'hipertrofia'}
- Frequência Semanal Alvo: ${userProfile.frequency || 4}x por semana
- Sequência Atual (Streak): ${stats?.currentStreak || 0} dias consecutivos (Melhor: ${stats?.bestStreak || 0} dias)
- Total de Sessões no Templo: ${stats?.totalWorkouts || 0} treinos
- Volume Total Acumulado: ${(stats?.totalVolumeKg || 0).toLocaleString('pt-BR')} kg

[ÚLTIMAS SESSÕES NO HISTÓRICO]
${recentHistoryText}

[STATUS DO MOMENTO]
${activeSessionText}

DIRETRIZES DE RESPOSTA:
1. Responda em Português do Brasil com tom encorajador, místico e cientificamente preciso.
2. Seja prático e direto. Use parágrafos concisos e bullet points quando for explicar técnicas ou listas.
3. Use os dados acima para personalizar sua resposta! Se ele perguntar o que treinar, olhe as últimas sessões para não repetir grupos musculares consecutivos.
4. Mantenha as respostas amigáveis para leitura rápida em tela de celular.`;

        // Monta o histórico de mensagens formatado para o Gemini API
        const contents = [];
        
        contents.push({
          role: 'user',
          parts: [{ text: `[CONTEXTO DO SISTEMA E DO ALUNO]\n${systemPrompt}\n\nPor favor, atue como o Oráculo e esteja pronto para me orientar.` }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: `Saudações, guerreiro ${userProfile.name || ''}! Os portais do templo estão abertos e vejo com clareza seus ${stats?.currentStreak || 0} dias de fogo sagrado. Como posso guiar sua evolução cósmica agora?` }]
        });

        // Adiciona as mensagens anteriores do histórico (últimas 8 trocas)
        const recentChat = (chatHistory || []).slice(-8);
        for (const msg of recentChat) {
          contents.push({
            role: msg.sender === 'user' ? 'user' : 'model',
            parts: [{ text: msg.text }]
          });
        }

        // Adiciona a mensagem atual do usuário
        contents.push({
          role: 'user',
          parts: [{ text: userMessage }]
        });

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${effectiveKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 600
            }
          })
        });

        if (res.ok) {
          const data = await res.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim().length > 0) {
            return {
              text: reply.trim(),
              source: 'gemini'
            };
          }
        }
      } catch (err) {
        console.warn('Erro ao consultar Gemini API, recorrendo ao motor local do oráculo:', err);
      }
    }

    // 2. Motor Local Autônomo com Reconhecimento de Intenção Amplo e Memória
    const lower = (userMessage || '').toLowerCase();
    const lastSession = (workoutHistory && workoutHistory.length > 0) ? workoutHistory[0] : null;
    const streak = stats?.currentStreak || 0;
    const weight = userProfile?.weight || 75;
    const goal = userProfile?.goal || 'hipertrofia';

    // Intenção: Saudações / Identidade
    if (lower.includes('olá') || lower.includes('ola') || lower.includes('bom dia') || lower.includes('boa tarde') || lower.includes('boa noite') || lower.includes('quem é você') || lower.includes('quem e vc') || lower.includes('o que você faz')) {
      return {
        text: `✨ **Saudações, guerreiro(a) ${userProfile?.name || 'do Templo'}!**\n\nEu sou o **Oráculo**, a consciência biomecânica e cósmica do AGiTe-Me! Conheço seu peso (**${weight}kg**), seu objetivo de **${goal.toUpperCase()}** e seus **${streak} dias de constância**.\n\nVocê pode me perguntar livremente sobre:\n- **O que treinar hoje** e como dividir sua semana\n- **Execução e postura** (supino, agachamento, costas)\n- **Nutrição e suplementos** (proteína, creatina, água)\n- **Progressão de cargas e dores musculares**\n\nComo posso fortalecer seu templo hoje?`,
        source: 'local'
      };
    }

    // Intenção: O que treinar hoje / rotina sugerida
    if (lower.includes('treinar') || lower.includes('qual treino') || lower.includes('rotina') || lower.includes('hoje') || lower.includes('fazer hoje')) {
      let suggestion = '';
      if (lastSession) {
        const lastTitle = (lastSession.routineTitle || '').toLowerCase();
        if (lastTitle.includes('alpha') || lastTitle.includes('peito')) {
          suggestion = `Seu último registro no templo foi o **Portal Alpha** (Peitoral & Tríceps) em ${lastSession.date}. Para respeitar o tempo de recuperação fibrilar de 48h, sua missão de hoje é atravessar o **Portal Beta (Costas & Bíceps)** ou o **Portal Gamma (Membros Inferiores & Core)**.`;
        } else if (lastTitle.includes('beta') || lastTitle.includes('costas')) {
          suggestion = `Na sua última consagração você trabalhou puxadas no **Portal Beta** (${lastSession.date}). Hoje a recomendação ideal é ativar a base da sua coluna com o **Portal Gamma (Pernas & Abdômen)**.`;
        } else {
          suggestion = `Com suas pernas e core trabalhados recentemente no **Portal Gamma**, o cosmos te chama de volta para o **Portal Alpha (Peitoral, Ombros & Tríceps)**.`;
        }
      } else {
        suggestion = `Como você está iniciando sua jornada cósmica, comece pelo alicerce: o **Portal Alpha (Peitoral & Tríceps)** na aba Templo!`;
      }

      return {
        text: `⚡ **Direcionamento do Oráculo para Hoje:**\n\n${suggestion}\n\nVocê já acumula **${streak} dias de sequência ativa**. Mantenha o aquecimento articular e foque na cadência de descida controlada em cada repetição!`,
        source: 'local'
      };
    }

    // Intenção: Suplementos (Creatina, Whey, Cafeína, Pré-treino)
    if (lower.includes('creatina') || lower.includes('whey') || lower.includes('suplement') || lower.includes('cafeína') || lower.includes('pre treino') || lower.includes('pré-treino') || lower.includes('bcaa')) {
      return {
        text: `🧪 **Guia Cósmico de Suplementação Científica:**\n\n- **Creatina (O Santo Graal):** 3g a 5g todos os dias (inclusive nos dias em que não treinar). Ela satura seus estoques intramusculares de fosfocreatina, aumentando sua força explosiva e volume celular. Não precisa fazer fase de saturação.\n- **Whey Protein:** É apenas proteína prática do soro do leite. Útil se você não conseguir bater sua meta de proteína diária com comida sólida.\n- **Cafeína / Pré-treino:** Excelente para foco e reduzir a percepção de esforço. Tome 30 a 45 minutos antes do treino. Evite usar menos de 6 horas antes de dormir para não sabotar seu sono de recuperação.\n- **BCAA:** Se você já consome carne, ovos ou whey suficientes, suplementar BCAA isolado é desnecessário.`,
        source: 'local'
      };
    }

    // Intenção: Exercícios Específicos (Supino, Agachamento, Terra, etc.)
    if (lower.includes('supino') || lower.includes('agachamento') || lower.includes('terra') || lower.includes('remada') || lower.includes('puxada') || lower.includes('biceps') || lower.includes('triceps') || lower.includes('ombro') || lower.includes('lateral')) {
      return {
        text: `🏛️ **Orientações de Biomecânica dos Grandes Movimentos:**\n\n- **Supino (Peito):** Pés firmes no chão, escápulas aduzidas ("fechadas" atrás) e cotovelos a ~45° do tronco (nunca a 90° para salvar os ombros). Toque suavemente o esterno e empurre com aceleração controlada.\n- **Agachamento (Pernas):** Base na largura dos ombros, pontas dos pés levemente para fora (~15° a 30°). Desça empurrando os joelhos para a direção dos dedos, mantendo o peito erguido.\n- **Puxadas e Remadas (Costas):** Inicie o movimento puxando os cotovelos para trás, não as mãos. Imagine esmagar uma laranja entre as escápulas no pico da contração.\n- **Elevação Lateral (Deltoides):** Cotovelos levemente flexionados, incline o tronco 5° para frente e erga até a linha do ombro. Sem balançar a lombar!\n\nVocê também pode consultar animações passo a passo na aba **Movimentos**!`,
        source: 'local'
      };
    }

    // Intenção: Sono, Descanso, Overtraining e Recuperação
    if (lower.includes('sono') || lower.includes('dormir') || lower.includes('descanso') || lower.includes('recupera') || lower.includes('overtraining') || lower.includes('cansado') || lower.includes('fadiga')) {
      return {
        text: `🌙 **O Altar do Sono e da Recuperação:**\n\nO treino apenas sinaliza a destruição controlada de fibras musculares. A verdadeira construção do templo acontece **durante o sono REM e sono profundo**.\n\n- **Meta de Sono:** Tente dormir entre 7 a 9 horas de qualidade.\n- **Higiene do Sono:** Quarto escuro e fresco, corte telas luminosas 30 minutos antes de deitar e evite cafeína após as 16h.\n- **Sinais de Overtraining:** Irritabilidade, insônia, queda repentina de força e frequência cardíaca elevada ao acordar. Se sentir isso, faça um dia de descanso ativo (caminhada suave ou alongamento).`,
        source: 'local'
      };
    }

    // Intenção: Emagrecimento, Definição, Queima de Gordura, Cutting
    if (lower.includes('emagrecer') || lower.includes('secar') || lower.includes('gordura') || lower.includes('queimar') || lower.includes('cutting') || lower.includes('definir') || lower.includes('cardio')) {
      return {
        text: `🔥 **Protocolo Cósmico de Queima de Gordura & Definição:**\n\n1. **Déficit Calórico Moderado:** Gaste mais calorias do que ingere, mas sem dietas malucas. Um corte de 300 a 500 kcal por dia preserva sua massa magra.\n2. **Musculação Pesada é Primária:** Mesmo em déficit, continue treinando pesado. É isso que diz ao seu corpo: *"não queime músculos, use a gordura como combustível!"*.\n3. **Cardio Estratégico:** 20 a 30 minutos de cardio moderado (caminhada inclinada ou bike) pós-treino ou em horário separado aceleram o gasto calórico sem prejudicar sua força muscular.\n4. **Mantenha a Proteína Alta:** Pelo menos 1.8g a 2.0g de proteína por kg para manter a saciedade.`,
        source: 'local'
      };
    }

    // Intenção: Ganho de Massa, Hipertrofia, Bulking
    if (lower.includes('massa') || lower.includes('crescer') || lower.includes('hipertrofia') || lower.includes('bulking') || lower.includes('ganhar peso') || lower.includes('ficar grande')) {
      return {
        text: `⚡ **A Tríade Sagrada da Hipertrofia Muscular:**\n\n1. **Sobrecarga Progressiva:** Anote suas cargas e repetições. A cada 1 a 2 semanas, busque fazer 1 repetição a mais ou colocar mais 1kg na barra.\n2. **Superávit Calórico Limpo:** Para seu peso atual (${weight}kg), consuma cerca de 250 a 400 kcal acima do seu gasto de manutenção com alimentos limpos (arroz, batata, aveia, carnes e ovos).\n3. **Proximidade da Falha:** Treine deixando de 1 a 2 repetições "no tanque" (RIR 1-2). Séries leves demais não estimulam a sinalização da via mTOR responsável pela síntese proteica.`,
        source: 'local'
      };
    }

    // Intenção: Carga, peso e progressão
    if (lower.includes('carga') || lower.includes('peso') || lower.includes('aumentar') || lower.includes('progress') || lower.includes('subir')) {
      return {
        text: `🏋️ **A Lei Sagrada da Progressão Cósmica:**\n\n1. **A regra das 2 repetições:** Se você foi prescrito para 10 a 12 repetições e completou 12 com postura impecável e sem roubar em todas as séries, você ganhou o direito de subir **1kg a 2kg** na próxima sessão.\n2. **Fase Excêntrica:** Segure a descida do peso por 2 a 3 segundos. Carga pesada sem controle só alimenta a vaidade, mas cadência esculpe fibras densas.\n3. **Mantenha o registro:** Se hoje fez 10 reps com 20kg, sua vitória na semana que vem será fazer 11 reps com os mesmos 20kg. Isso já é sobrecarga progressiva!`,
        source: 'local'
      };
    }

    // Intenção: Proteína, dieta, nutrição e água
    if (lower.includes('proteína') || lower.includes('proteina') || lower.includes('comer') || lower.includes('dieta') || lower.includes('nutri') || lower.includes('aliment') || lower.includes('água') || lower.includes('agua')) {
      const minProt = Math.round(weight * 1.6);
      const maxProt = Math.round(weight * 2.2);
      const waterLiters = (weight * 0.035).toFixed(1);

      return {
        text: `🥩 **Alquimia Nutricional para seu Peso (${weight}kg):**\n\n- **Proteína Diária:** Como seu objetivo é ${goal}, mire em **${minProt}g a ${maxProt}g de proteína** por dia (distribuídos em 3 a 4 refeições com ovos, frango, peixe, carne, whey ou leguminosas).\n- **Hidratação Cósmica:** Beba ao menos **${waterLiters} litros de água** ao longo do dia. Fibras musculares desidratadas perdem até 15% de contração máxima.\n- **Pré & Pós-treino:** Não treine em jejum prolongado sem hábito prévio. Uma fonte de carboidrato complexo (como banana e aveia) 40 minutos antes fornecerá o glicogênio necessário para vencer a gravidade.`,
        source: 'local'
      };
    }

    // Intenção: Dor muscular tardia vs Lesão
    if (lower.includes('dor') || lower.includes('les') || lower.includes('machuc') || lower.includes('doendo') || lower.includes('articul')) {
      return {
        text: `🩹 **Discernimento do Templo: Dor Muscular vs Lesão:**\n\n- **Dor Muscular Tardia (DOMS - Normal):** Surge 24 a 48 horas após o treino. É uma sensação difusa no "meio" da carne do músculo, sem inchaço articular, e costuma melhorar quando você se movimenta e aquece.\n- **Sinal de Alerta / Lesão (Cuidado!):** Dor aguda em pontada, que acontece perto de tendões, ligamentos ou dentro da articulação (joelho, ombro, punho). Se houver pontada repentina ou perda de mobilidade, pare imediatamente o exercício e consulte um profissional de saúde.\n\n*“A honra está em respeitar os limites anatômicos do seu templo para poder treinar por toda a vida.”*`,
        source: 'local'
      };
    }

    // Intenção: Histórico e Streaks
    if (lower.includes('streak') || lower.includes('históric') || lower.includes('dias') || lower.includes('evolu')) {
      return {
        text: `📊 **Seu Memorial no Templo:**\n\n- Sequência Sagrada Atual: **${streak} dias ininterruptos**\n- Melhor Marca Histórica: **${stats?.bestStreak || streak} dias**\n- Treinos Registrados: **${stats?.totalWorkouts || 0} sessões**\n- Carga Total Movida: **${(stats?.totalVolumeKg || 0).toLocaleString('pt-BR')} kg**\n\nCada sessão registrada fica gravada para sempre no seu templo. A constância sob a lua é o único caminho para a imortalidade física!`,
        source: 'local'
      };
    }

    // Se estiver em treino ativo no momento
    if (activeSession && (lower.includes('agora') || lower.includes('atual'))) {
      return {
        text: `⚔️ **Atenção ao Treino Presente!**\n\nVocê está atualmente conectado ao **${activeSession.routineTitle}**, em andamento há ${Math.round((activeSession.elapsedSeconds || 0) / 60)} minutos. Conecte sua respiração a cada série e finalize o protocolo com o botão Check-out no final!`,
        source: 'local'
      };
    }

    // Resposta padrão inteligente com guia claro
    const randomWisdom = this.getRandomOracleWisdom();
    return {
      text: `Guerreiro(a) **${userProfile?.name || 'do Cosmos'}**, compreendo sua busca por evolução.\n\nCom **${weight}kg** e foco em **${goal.toUpperCase()}**, cada detalhe conta. ${randomWisdom}\n\n💡 **Dica do Templo:** Como estou operando no motor autônomo local, você pode me perguntar sobre: *o que treinar hoje, cálculo de proteínas e água, suplementos (creatina/whey), execução do supino e agachamento, sono ou dores musculares*!\n\n*(Para que eu responda perguntas 100% livres de qualquer tema com raciocínio de IA ilimitado, você pode conectar sua chave gratuita do Gemini no seu perfil!)*`,
      source: 'local'
    };
  }
};
