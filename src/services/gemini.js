// Serviço de Inteligência Artificial do Gemini no Oráculo 

import { EXERCISES } from '../data/exercises.js';

const GEMINI_MODELS = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-lite-latest'];

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

  // Pílula de Motivação & Biomecânica do Oráculo (Mais de 30 frases para a aba "Templo")
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

  // Chat com o Oráculo com Memória e Injeção de Contexto (Gemini Flash + Motor Offline Inteligente)
  async askOracleChat({ userMessage, chatHistory = [], userProfile, workoutHistory = [], activeSession = null, stats = null, routines = [], apiKey = '' }) {
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
      : 'O usuário não está em treino ativo no momento.';

    // Formata as rotinas atuais do usuário
    const routinesSummaryText = (routines && routines.length > 0)
      ? routines.map(r => {
        const exList = (r.exercises || []).map(e => {
          const found = EXERCISES.find(ex => ex.id === e.exerciseId);
          return found ? `${found.name} (id: ${found.id})` : e.exerciseId;
        }).join(', ');
        return `• ${r.title} [id: ${r.id}]: ${exList}`;
      }).join('\n')
      : 'Rotinas padrão Alpha, Beta e Gamma ativas.';

    // Catálogo resumido de exercícios disponíveis
    const catalogSummaryText = EXERCISES.map(e => `${e.name} [id: ${e.id}, músculo: ${e.muscle}]`).join(' | ');

    // 1. Chamada à API Gemini se a chave estiver configurada
    if (effectiveKey && effectiveKey.length > 10) {
      try {
        const systemPrompt = `Você é o Oráculo, assistente técnico de treinos e personal trainer do app AGiTe-Me!.
Sua missão é dar respostas técnicas, precisas, funcionais e embasadas em biomecânica e fisiologia do exercício.

[DIRETRIZES DE RESPOSTA OBRIGATÓRIAS]:
1. EXTREMAMENTE DIRETO E FUNCIONAL: Vá direto ao ponto sem enrolação, sem introduções vazias e sem saudações longas. Entregue apenas o texto estritamente necessário para sanar a dúvida do usuário.
2. ZERO JARGÃO TEMÁTICO NO CORPO: É estritamente proibido usar palavras como "cósmico", "astral", "sagrado", "templo", "guerreiro", "deuses do Olimpo", "portais místicos", etc., durante a explicação técnica ou no meio da resposta. A explicação de treinos, exercícios, séries e nutrição deve ser puramente prática, profissional e biomecânica.
3. NÃO FIQUE CHAMANDO PELO NOME: Não inicie com saudações repetitivas como "Olá João Pedro", "Saudações guerreiro", etc. Comece direto no assunto da resposta.
4. FRASE DE FECHAMENTO (APENAS UMA ÚNICA FRASE NO FINAL): Na última linha da resposta, adicione apenas uma única frase curta e elegante que lembre sutilmente o foco ou o app (exemplos: "Bons treinos e foco na constância.", "Foco na boa execução e bom treino no templo.", "Mantenha a regularidade e bom treino.").
5. FORMATAÇÃO: Use negrito para termos principais e bullet points curtos quando for listar exercícios ou diretrizes. Perfeito para leitura rápida no celular.
6. AÇÃO DE SUBSTITUIÇÃO/MUTAÇÃO DE TREINO:
Se o usuário solicitar a troca, substituição ou adaptação de um exercício em qualquer rotina (ex: "troque a prancha por abdominal infra no portal beta", "meu ombro dói, troque o desenvolvimento", "quero trocar o supino reto por inclinado"):
- Explique o motivo e a biomecânica da alternativa.
- Na última linha da resposta (após o texto e antes de terminar), adicione a tag de ação exatamente no formato:
[ACTION:SWAP_EXERCISE routineId="<id-da-rotina>" oldExerciseId="<id-antigo>" newExerciseId="<id-novo>"]
Exemplo:
[ACTION:SWAP_EXERCISE routineId="portal-b" oldExerciseId="prancha-abdominal" newExerciseId="abdominal-infra-crunch"]

[DADOS ATUALIZADOS DO ALUNO]:
- Nome: ${userProfile?.name ? userProfile.name : 'Aluno(a)'}
- Peso: ${userProfile?.weight ? `${userProfile.weight} kg` : 'Não informado'} | Altura: ${userProfile?.height ? `${userProfile.height} cm` : 'Não informada'} | IMC: ${imc}
- Objetivo Principal: ${userProfile?.goal || 'hipertrofia'}
- Frequência Semanal: ${userProfile?.frequency || 4}x por semana
- Sequência atual (Streak): ${stats?.currentStreak || 0} dias consecutivos
- Total de treinos realizados: ${stats?.totalWorkouts || 0}

[ROTINAS ATIVAS DO USUÁRIO]:
${routinesSummaryText}

[CATÁLOGO DISPONÍVEL DE EXERCÍCIOS]:
${catalogSummaryText}

[HISTÓRICO RECENTE]:
${recentHistoryText}

[SITUAÇÃO ATUAL]:
${activeSessionText}`;

        // Monta o histórico de mensagens formatado para o Gemini API
        const contents = [];

        // Exemplo few-shot para guiar firmemente o tom conciso e direto
        contents.push({
          role: 'user',
          parts: [{ text: 'qual o meu treino de hoje mesmo?' }]
        });
        contents.push({
          role: 'model',
          parts: [{ text: `Seu treino recomendado para hoje é **Peito, Ombros e Tríceps (Portal Alpha)**.

Foco da sessão:
• **Peitoral:** Supino reto e inclinado com amplitude completa.
• **Ombros:** Desenvolvimento e elevação lateral com descida controlada.
• **Tríceps:** Tríceps na polia ou tríceps testa.

Bons treinos e foco na constância no templo.` }]
        });

        // Adiciona as mensagens anteriores do histórico (últimas 6 trocas)
        const recentChat = (chatHistory || []).slice(-6);
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

        // Chama os modelos ativos do Gemini com fallback automático
        const result = await callGeminiApi(effectiveKey, {
          system_instruction: {
            parts: [{ text: systemPrompt }]
          },
          contents,
          generationConfig: {
            temperature: 0.35,
            maxOutputTokens: 500
          }
        });

        if (result?.text) {
          return {
            text: result.text,
            source: 'gemini'
          };
        }
      } catch (err) {
        console.warn('Erro ao consultar Gemini API, recorrendo ao motor local do oráculo:', err);
      }
    }

    // 2. Motor Local Autônomo com Respostas Diretas e funcionais
    const lower = (userMessage || '').toLowerCase();
    const lastSession = (workoutHistory && workoutHistory.length > 0) ? workoutHistory[0] : null;
    const streak = stats?.currentStreak || 0;
    const weight = userProfile?.weight || null;
    const goal = userProfile?.goal || 'hipertrofia';
    // Intenção: Mudar / Substituir / Adaptar Exercício ou Rotina com Ação Automática
    const isSwapIntent = lower.includes('troc') || lower.includes('substitu') || lower.includes('mud') || lower.includes('alter') || lower.includes('adapt');
    if (isSwapIntent) {
      // Procura qual exercício atual o usuário quer substituir
      let targetOldEx = null;
      let targetRoutineId = 'portal-a';

      // 1. Tenta encontrar pelo nome do exercício mencionado
      for (const ex of EXERCISES) {
        const simpleName = ex.name.toLowerCase().replace(/[^a-z0-9]/g, ' ');
        const keywords = simpleName.split(' ').filter(w => w.length > 3);
        const matches = keywords.some(k => lower.includes(k));
        if (matches) {
          targetOldEx = ex;
          break;
        }
      }

      // Se não encontrou pelo nome exato, verifica se o usuário mencionou grupos musculares
      if (!targetOldEx) {
        if (lower.includes('peito') || lower.includes('supino')) targetOldEx = EXERCISES.find(e => e.id === 'supino-reto-halteres');
        else if (lower.includes('costas') || lower.includes('puxad')) targetOldEx = EXERCISES.find(e => e.id === 'puxada-alta-polia');
        else if (lower.includes('perna') || lower.includes('agach') || lower.includes('leg')) targetOldEx = EXERCISES.find(e => e.id === 'leg-press-45');
        else if (lower.includes('ombro') || lower.includes('desenvolv')) targetOldEx = EXERCISES.find(e => e.id === 'desenvolvimento-halteres');
        else if (lower.includes('biceps') || lower.includes('rosca')) targetOldEx = EXERCISES.find(e => e.id === 'rosca-biceps-alternada');
        else if (lower.includes('triceps')) targetOldEx = EXERCISES.find(e => e.id === 'triceps-polia-corda');
        else if (lower.includes('abdom') || lower.includes('prancha') || lower.includes('core')) targetOldEx = EXERCISES.find(e => e.id === 'prancha-abdominal');
      }

      if (targetOldEx) {
        // Encontra em qual rotina esse exercício se encontra
        const userRoutines = (routines && routines.length > 0) ? routines : [];
        const foundRoutine = userRoutines.find(r => (r.exercises || []).some(e => e.exerciseId === targetOldEx.id));
        if (foundRoutine) {
          targetRoutineId = foundRoutine.id;
        } else if (activeSession && activeSession.routineId) {
          targetRoutineId = activeSession.routineId;
        } else {
          // Atribui de acordo com o músculo
          if (targetOldEx.muscle === 'peito' || targetOldEx.muscle === 'ombros' || targetOldEx.muscle === 'triceps') targetRoutineId = 'portal-a';
          else if (targetOldEx.muscle === 'costas' || targetOldEx.muscle === 'biceps') targetRoutineId = 'portal-b';
          else if (targetOldEx.muscle === 'pernas') targetRoutineId = 'portal-c';
          else targetRoutineId = 'portal-b';
        }

        // Procura se o usuário mencionou especificamente o exercício de destino
        let targetNewEx = null;
        for (const ex of EXERCISES) {
          if (ex.id === targetOldEx.id) continue;
          const simpleName = ex.name.toLowerCase();
          const words = simpleName.split(' ').filter(w => w.length > 4);
          if (words.some(w => lower.includes(w))) {
            targetNewEx = ex;
            break;
          }
        }

        // Se não mencionou o novo exercício, seleciona a melhor alternativa do mesmo grupamento
        if (!targetNewEx) {
          const alternatives = EXERCISES.filter(e => e.muscle === targetOldEx.muscle && e.id !== targetOldEx.id);
          targetNewEx = alternatives.length > 0
            ? alternatives[Math.floor(Math.random() * alternatives.length)]
            : EXERCISES.find(e => e.id !== targetOldEx.id);
        }

        const routineTitleName = targetRoutineId === 'portal-a' ? 'Portal Alpha' : targetRoutineId === 'portal-b' ? 'Portal Beta' : 'Portal Gamma';

        return {
          text: `Substituição realizada para **${targetOldEx.name}**:\n\n• **Exercício Substituto:** **${targetNewEx.name}**\n• **Aparelho / Equipamento:** ${targetNewEx.equipment}\n• **Músculo Alvo:** ${targetNewEx.muscleLabel}\n• **Por que essa troca funciona:** Trabalha a mesma cadeia neuromuscular mantendo o estímulo hipertrófico ideal com excelente controle articular.\n• **Dica de ouro:** ${targetNewEx.goldTip || 'Controle a descida e mantenha a postura estável.'}\n\nSeu treino do **${routineTitleName}** foi atualizado e salvo automaticamente.\n\nFoco na execução correta e bom treino no templo.\n[ACTION:SWAP_EXERCISE routineId="${targetRoutineId}" oldExerciseId="${targetOldEx.id}" newExerciseId="${targetNewEx.id}"]`,
          source: 'local'
        };
      }
    }

    // Intenção: Saudações / Identidade
    if (lower.includes('olá') || lower.includes('ola') || lower.includes('bom dia') || lower.includes('boa tarde') || lower.includes('boa noite') || lower.includes('quem é você') || lower.includes('quem e vc') || lower.includes('o que você faz')) {
      const nameGreeting = userName ? `Olá, **${userName}**! ` : '';
      const weightInfo = weight ? `registrado com **${weight}kg**, ` : '';
      return {
        text: `${nameGreeting}Sou o **Oráculo**, seu assistente de treinos e biomecânica do AGiTe-Me!.\n\nSeu perfil está ${weightInfo}foco em **${goal}** e **${streak} dias de constância**.\n\nPosso te orientar sobre:\n• Divisão de treinos e o que treinar hoje\n• Postura e biomecânica de movimentos (supino, agachamento, puxadas)\n• Nutrição, hidratação e suplementos (creatina, whey)\n• Cargas, recuperação e dores musculares\n\nQual a sua dúvida de hoje?\n\nBons treinos e foco no templo.`,
        source: 'local'
      };
    }

    // Intenção: O que treinar hoje / rotina sugerida
    if (lower.includes('treinar') || lower.includes('qual treino') || lower.includes('rotina') || lower.includes('hoje') || lower.includes('fazer hoje')) {
      let routineName = 'Portal Alpha • Peito, Ombros & Tríceps';
      let reason = 'Como você está iniciando o ciclo ou vindo de descanso, comece pelo grupamento de empurrar.';

      if (lastSession) {
        const lastTitle = (lastSession.routineTitle || '').toLowerCase();
        if (lastTitle.includes('alpha') || lastTitle.includes('peito')) {
          routineName = 'Portal Beta • Costas & Bíceps';
          reason = `Sua última sessão foi peito e tríceps em ${lastSession.date}. Hoje o ideal é trabalhar a musculatura de puxar.`;
        } else if (lastTitle.includes('beta') || lastTitle.includes('costas')) {
          routineName = 'Portal Gamma • Pernas & Abdômen';
          reason = `Sua última sessão foi costas e bíceps em ${lastSession.date}. O foco recomendado para hoje são membros inferiores e core.`;
        } else {
          routineName = 'Portal Alpha • Peito, Ombros & Tríceps';
          reason = `Sua última sessão foi de pernas em ${lastSession.date}. O ciclo recomeça com empurrar (peitoral, ombros e tríceps).`;
        }
      }

      return {
        text: `Seu treino sugerido para hoje é **${routineName}**.\n\n${reason}\n\n• Sequência atual: **${streak} dias**\n• Aquecimento recomendado: 5 a 10 minutos de mobilidade antes das séries de trabalho.\n\nBom treino e foco na execução no templo.`,
        source: 'local'
      };
    }

    // Intenção: Suplementos (Creatina, Whey, Cafeína, Pré-treino)
    if (lower.includes('creatina') || lower.includes('whey') || lower.includes('suplement') || lower.includes('cafeína') || lower.includes('pre treino') || lower.includes('pré-treino') || lower.includes('bcaa')) {
      return {
        text: `Guia prático de suplementação:\n\n• **Creatina:** 3g a 5g diariamente, inclusive em dias sem treino. Aumenta a força e recuperação celular. Não requer fase de saturação.\n• **Whey Protein:** Fonte prática de proteína para auxiliar a atingir a meta diária (1.6g a 2.0g/kg). Use conforme conveniência alimentar.\n• **Cafeína / Pré-treino:** 150mg a 200mg cerca de 30 a 45 minutos antes da sessão. Evite consumir até 6 horas antes de dormir.\n• **BCAA:** Dispensável caso o consumo de proteínas na dieta já esteja adequado.\n\nConsistência na rotina e bons treinos.`,
        source: 'local'
      };
    }

    // Intenção: Exercícios Específicos (Supino, Agachamento, Terra, etc.)
    if (lower.includes('supino') || lower.includes('agachamento') || lower.includes('terra') || lower.includes('remada') || lower.includes('puxada') || lower.includes('biceps') || lower.includes('triceps') || lower.includes('ombro') || lower.includes('lateral')) {
      return {
        text: `Orientações biomecânicas principais:\n\n• **Supino:** Pés firmes no solo, escápulas aduzidas e cotovelos em ~45° em relação ao tronco. Toque a barra no esterno com descida controlada.\n• **Agachamento:** Pés na largura dos ombros, pontas levemente voltadas para fora (~15° a 30°). Desça flexionando quadril e joelhos juntos, peito aberto e coluna neutra.\n• **Puxadas e Remadas:** Inicie o movimento puxando pelos cotovelos e aproximando as escápulas no final. Evite puxar apenas com os braços.\n• **Elevação Lateral:** Cotovelos levemente flexionados, incline o tronco 5° para frente e erga até a altura dos ombros sem impulsos da lombar.\n\nAnimações detalhadas estão disponíveis na aba **Movimentos**.\n\nTécnica correta antes da carga e bom treino no templo.`,
        source: 'local'
      };
    }

    // Intenção: Sono, Descanso, Overtraining e Recuperação
    if (lower.includes('sono') || lower.includes('dormir') || lower.includes('descanso') || lower.includes('recupera') || lower.includes('overtraining') || lower.includes('cansado') || lower.includes('fadiga')) {
      return {
        text: `Recuperação muscular e descanso:\n\n• **Meta de sono:** 7 a 9 horas por noite. A síntese proteica e reparação de tecidos ocorrem predominantemente no sono profundo.\n• **Higiene do sono:** Ambiente escuro e fresco, sem telas 30 minutos antes de deitar e sem cafeína após o meio da tarde.\n• **Sinais de overtraining:** Queda persistente de força, insônia, dores articulares e fadiga contínua. Havendo esses sinais, adote um dia de descanso ativo.\n\nBoa recuperação para o próximo treino no templo.`,
        source: 'local'
      };
    }

    // Intenção: Emagrecimento, Definição, Queima de Gordura, Cutting
    if (lower.includes('emagrecer') || lower.includes('secar') || lower.includes('gordura') || lower.includes('queimar') || lower.includes('cutting') || lower.includes('definir') || lower.includes('cardio')) {
      return {
        text: `Diretrizes para queima de gordura e definição:\n\n1. **Déficit calórico moderado:** Redução de 300 a 500 kcal/dia em relação ao seu gasto total para preservar a massa magra.\n2. **Musculação pesada:** Mantenha a intensidade e as cargas para sinalizar a preservação do tecido muscular.\n3. **Proteína alta:** Mantenha 1.8g a 2.2g de proteína por kg de peso corporal ao dia para saciedade e proteção muscular.\n4. **Cardio complementar:** 20 a 30 minutos de cardio em intensidade moderada após o treino ou em horário separado.\n\nFoco na constância da dieta e bom treino.`,
        source: 'local'
      };
    }

    // Intenção: Ganho de Massa, Hipertrofia, Bulking
    if (lower.includes('massa') || lower.includes('crescer') || lower.includes('hipertrofia') || lower.includes('bulking') || lower.includes('ganhar peso') || lower.includes('ficar grande')) {
      return {
        text: `Pilares para ganho de massa muscular (Hipertrofia):\n\n1. **Sobrecarga progressiva:** Anote suas cargas e busque evoluir repetições ou peso gradativamente a cada 1 a 2 semanas.\n2. **Superávit calórico limpo:** Consuma de 200 a 400 kcal acima do gasto diário com alimentos nutritivos (arroz, batata, aveia, ovos, carnes).\n3. **Proximidade da falha:** Trabalhe suas séries deixando de 1 a 2 repetições na reserva (RIR 1-2).\n4. **Descanso adequado:** 90 a 120 segundos de pausa entre séries pesadas para restaurar energia muscular.\n\nEvolução contínua e bom treino no templo.`,
        source: 'local'
      };
    }

    // Intenção: Carga, peso e progressão
    if (lower.includes('carga') || lower.includes('peso') || lower.includes('aumentar') || lower.includes('progress') || lower.includes('subir')) {
      return {
        text: `Critérios para progressão de carga:\n\n• **Regra do limite de repetições:** Se a sua série pede 8 a 12 repetições e você atingiu 12 com técnica perfeita em todas as séries, aumente de 1kg a 2kg no próximo treino.\n• **Cadência excêntrica:** Controle a descida do peso em 2 a 3 segundos antes de cogitar aumentar o peso.\n• **Progressão por repetição:** Fazer 1 repetição a mais com o mesmo peso da semana anterior já é sobrecarga progressiva válida.\n\nPriorize a execução perfeita e bom treino no templo.`,
        source: 'local'
      };
    }

    // Intenção: Proteína, dieta, nutrição e água
    if (lower.includes('proteína') || lower.includes('proteina') || lower.includes('comer') || lower.includes('dieta') || lower.includes('nutri') || lower.includes('aliment') || lower.includes('água') || lower.includes('agua')) {
      if (weight) {
        const minProt = Math.round(weight * 1.6);
        const maxProt = Math.round(weight * 2.2);
        const waterLiters = (weight * 0.035).toFixed(1);

        return {
          text: `Recomendações nutricionais personalizadas para seus **${weight}kg** (Foco: **${goal}**):\n\n• **Proteína diária:** ${minProt}g a ${maxProt}g por dia (1.6g a 2.2g/kg), divididos em 3 a 5 refeições.\n• **Hidratação:** No mínimo ${waterLiters} litros de água ao longo do dia (35ml/kg).\n• **Alimentação pré-treino:** Carboidratos de fácil absorção 40 a 60 minutos antes da sessão para garantir glicogênio muscular.\n\nDisciplina na alimentação e bom treino no templo.`,
          source: 'local'
        };
      } else {
        return {
          text: `Recomendações nutricionais (Foco: **${goal}**):\n\n• **Proteína diária:** Consuma entre 1.6g e 2.2g de proteína por kg de peso corporal ao dia. (Dica: registre seu peso em **Editar Perfil** para ver o cálculo exato em gramas!).\n• **Hidratação:** Calcule 35ml de água por kg de peso corporal ao longo do dia.\n• **Alimentação pré-treino:** Carboidratos de fácil digestão 40 a 60 minutos antes da sessão.\n\nDisciplina na alimentação e bom treino no templo.`,
          source: 'local'
        };
      }
    }

    // Intenção: Dor muscular tardia vs Lesão
    if (lower.includes('dor') || lower.includes('les') || lower.includes('machuc') || lower.includes('doendo') || lower.includes('articul')) {
      return {
        text: `Diferença entre dor muscular e lesão:\n\n• **Dor Muscular Tardia (DOMS - Normal):** Começa 24h a 48h após o treino, sensação difusa no ventre muscular, alivia com movimento e aquecimento leve.\n• **Lesão ou Sobrecarga Articular (Atenção):** Dor aguda em pontada, localizada em articulação (ombro, joelho, cotovelo) ou tendão, piora ao carregar peso. Interrompa o exercício e procure avaliação médica se persistir.\n\nPreserve sua saúde articular e bom treino.`,
        source: 'local'
      };
    }

    // Intenção: Histórico e Streaks
    if (lower.includes('streak') || lower.includes('históric') || lower.includes('dias') || lower.includes('evolu')) {
      return {
        text: `Resumo do seu progresso:\n\n• Sequência atual: **${streak} dias**\n• Recorde pessoal: **${stats?.bestStreak || streak} dias**\n• Treinos registrados: **${stats?.totalWorkouts || 0} sessões**\n• Volume total acumulado: **${(stats?.totalVolumeKg || 0).toLocaleString('pt-BR')} kg**\n\nMantenha a constância e bom treino no templo.`,
        source: 'local'
      };
    }

    // Se estiver em treino ativo no momento
    if (activeSession && (lower.includes('agora') || lower.includes('atual'))) {
      return {
        text: `Você possui um treino em andamento: **${activeSession.routineTitle}** (iniciado há ${Math.round((activeSession.elapsedSeconds || 0) / 60)} min).\n\nMantenha a atenção nas séries restantes e registre repetições e cargas ao finalizar.\n\nBom treino e foco na execução no templo.`,
        source: 'local'
      };
    }

    // Resposta padrão funcional e direta
    return {
      text: `Para seu peso de **${weight}kg** e objetivo de **${goal}**, posso esclarecer diretamente:\n\n• Treino sugerido para hoje e divisão da semana\n• Cálculo de ingestão diária de proteínas e água\n• Uso de suplementos (creatina, whey protein, cafeína)\n• Postura e biomecânica (supino, agachamento, puxadas)\n• Recuperação, descanso e aumento progressivo de carga\n\nEnvie sua pergunta específica para receber a orientação prática.\n\nBons treinos e foco no templo.`,
      source: 'local'
    };
  }
};

