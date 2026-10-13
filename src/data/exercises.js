// Catálogo de Exercícios Especializados para Iniciantes • AGiTe-Me!
// Dados biomecânicos precisos com imagens reais de alta definição (Início & Contração),
// links diretos para MuscleWiki e tutoriais em vídeo no YouTube.

const BASE_IMG = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises';

export const EXERCISES = [
  {
    id: 'supino-reto-halteres',
    name: 'Supino Reto com Halteres',
    enName: 'Dumbbell Bench Press',
    muscle: 'peito',
    muscleLabel: 'Peitoral Maior',
    equipment: 'Halteres + Banco Reto',
    difficulty: 'Iniciante',
    targetGroup: 'Peitoral Maior, Deltoide Anterior e Tríceps',
    frames: [
      `${BASE_IMG}/Dumbbell_Bench_Press/0.jpg`,
      `${BASE_IMG}/Dumbbell_Bench_Press/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-bench-press',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+supino+reto+com+halteres+execucao+correta',
    steps: [
      'Deite-se no banco reto com a coluna neutra e os pés firmes no chão.',
      'Segure os halteres alinhados com o meio do peito, cotovelos a ~75° do tronco (não abra em 90° para proteger os ombros).',
      'Empurre os halteres para cima de forma controlada soltando o ar, quase tocando-os no topo sem bater.',
      'Desça lentamente sentindo o peitoral alongar por 2 a 3 segundos.'
    ],
    mistakes: [
      'Bater os halteres com força no topo.',
      'Tirar a lombar e os pés do chão descontroladamente.',
      'Abrir demais os cotovelos alinhados com as orelhas.'
    ],
    goldTip: 'Aperte o peito conscientemente no topo como se estivesse esmagando uma maçã entre os peitorais.'
  },
  {
    id: 'crucifixo-maquina-peckdeck',
    name: 'Voador / Peck Deck (Máquina)',
    enName: 'Machine Chest Fly / Pec Deck',
    muscle: 'peito',
    muscleLabel: 'Peitoral & Isolamento',
    equipment: 'Máquina Peck Deck / Voador',
    difficulty: 'Iniciante',
    targetGroup: 'Peitoral Maior (Isolador Seguro)',
    frames: [
      `${BASE_IMG}/Butterfly/0.jpg`,
      `${BASE_IMG}/Butterfly/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/pec-fly',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+voador+peck+deck+correto',
    steps: [
      'Ajuste o banco para que as manoplas fiquem na altura do meio do seu peito.',
      'Mantenha as escápulas coladas no encosto e o peito estufado.',
      'Feche os braços com os cotovelos levemente flexionados até as mãos quase se tocarem à frente.',
      'Retorne devagar segurando a resistência da máquina sem deixar o peso bater.'
    ],
    mistakes: [
      'Projetar os ombros para a frente na hora de fechar.',
      'Esticar os cotovelos 100% travados.'
    ],
    goldTip: 'Pense em encostar os bíceps na lateral do peitoral, e não apenas em juntar as mãos.'
  },
  {
    id: 'puxada-alta-polia',
    name: 'Puxada Frontal na Polia',
    enName: 'Wide-Grip Lat Pulldown',
    muscle: 'costas',
    muscleLabel: 'Grande Dorsal (Costas Largas)',
    equipment: 'Polia Alta + Barra Larga',
    difficulty: 'Iniciante',
    targetGroup: 'Grande Dorsal, Redondo Maior e Bíceps',
    frames: [
      `${BASE_IMG}/Wide-Grip_Lat_Pulldown/0.jpg`,
      `${BASE_IMG}/Wide-Grip_Lat_Pulldown/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/machine-pulldown',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+puxada+alta+pulley+frontal',
    steps: [
      'Ajuste a almofada das coxas para prender bem as suas pernas no banco.',
      'Segure a barra com uma pegada um pouco mais aberta que a largura dos ombros.',
      'Puxe a barra em direção à parte superior do peito, inclinando o tronco de leve para trás (~15°).',
      'Concentre a força em puxar com os cotovelos para baixo e para trás, sentindo as costas apertarem.'
    ],
    mistakes: [
      'Puxar a barra por trás do pescoço (alto risco para a cervical).',
      'Dar tranco com o corpo todo jogando o tronco muito para trás.'
    ],
    goldTip: 'Finja que suas mãos são ganchos e você está puxando o teto usando a ponta dos cotovelos.'
  },
  {
    id: 'remada-baixa-triangulo',
    name: 'Remada Baixa Sentada com Triângulo',
    enName: 'Seated Cable Row',
    muscle: 'costas',
    muscleLabel: 'Miolo das Costas & Romboides',
    equipment: 'Polia Baixa + Pegador Triângulo',
    difficulty: 'Iniciante',
    targetGroup: 'Dorsais, Romboides, Trapézio Médio e Bíceps',
    frames: [
      `${BASE_IMG}/Seated_Cable_Rows/0.jpg`,
      `${BASE_IMG}/Seated_Cable_Rows/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/machine-seated-cable-row',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+remada+baixa+com+triangulo',
    steps: [
      'Sente-se com os pés apoiados nas plataformas e joelhos ligeiramente destravados.',
      'Mantenha a coluna ereta e peito erguido.',
      'Puxe o triângulo em direção ao seu umbigo, comprimindo as escápulas atrás.',
      'Alongue os braços à frente sem curvar as costas excessivamente.'
    ],
    mistakes: [
      'Balançar o tronco para frente e para trás para ganhar impulso.',
      'Arredondar a coluna lombar na volta do peso.'
    ],
    goldTip: 'No final do movimento, junte as duas asas das suas costas por 1 segundo inteiro antes de soltar.'
  },
  {
    id: 'leg-press-45',
    name: 'Leg Press 45°',
    enName: '45° Leg Press Machine',
    muscle: 'pernas',
    muscleLabel: 'Quadríceps & Glúteos',
    equipment: 'Aparelho Leg Press 45',
    difficulty: 'Iniciante',
    targetGroup: 'Quadríceps, Glúteos e Posterior de Coxa',
    frames: [
      `${BASE_IMG}/Leg_Press/0.jpg`,
      `${BASE_IMG}/Leg_Press/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/machine-leg-press',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+leg+press+45+graus+correto',
    steps: [
      'Apoie as costas e o quadril totalmente no encosto sem deixar a lombar flutuar.',
      'Posicione os pés na plataforma na largura dos ombros, pontas levemente voltadas para fora.',
      'Destrave a máquina e desça o peso flexionando os joelhos em 90° de forma suave.',
      'Empurre a plataforma com a força dos calcanhares sem travar os joelhos 100% esticados no topo.'
    ],
    mistakes: [
      'Hiperextender e travar os joelhos no topo (perigo severo de lesão).',
      'Tirar a bunda do assento ao descer o peso.',
      'Juntar os joelhos para dentro durante a subida.'
    ],
    goldTip: 'Mantenha os joelhos sempre apontando na mesma direção dos dedos dos seus pés.'
  },
  {
    id: 'cadeira-extensora',
    name: 'Cadeira Extensora',
    enName: 'Leg Extension Machine',
    muscle: 'pernas',
    muscleLabel: 'Isolamento de Quadríceps',
    equipment: 'Máquina Cadeira Extensora',
    difficulty: 'Iniciante',
    targetGroup: 'Quadríceps (Frente da coxa isolada)',
    frames: [
      `${BASE_IMG}/Leg_Extensions/0.jpg`,
      `${BASE_IMG}/Leg_Extensions/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/leg-extension',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+cadeira+extensora+correto',
    steps: [
      'Ajuste o encosto de modo que o eixo de rotação da máquina fique alinhado com o seu joelho.',
      'O rolo de apoio deve ficar apoiado logo acima dos seus pés/tornozelos.',
      'Segure firme nas manoplas laterais para manter o quadril fixo no assento.',
      'Estenda os joelhos até a contração máxima da coxa, segure 1 segundo e desça com controle.'
    ],
    mistakes: [
      'Dar trancos acelerados jogando o corpo para trás.',
      'Ajustar o rolo no meio da canela ou na ponta dos dedos.'
    ],
    goldTip: 'Suba com explosão controlada, segure 1 segundo no pico e desça em 3 segundos.'
  },
  {
    id: 'desenvolvimento-halteres',
    name: 'Desenvolvimento com Halteres',
    enName: 'Dumbbell Shoulder Press',
    muscle: 'ombros',
    muscleLabel: 'Deltoides (Ombro Completo)',
    equipment: 'Halteres + Banco com Encosto',
    difficulty: 'Iniciante',
    targetGroup: 'Deltoide Anterior, Deltoide Lateral e Tríceps',
    frames: [
      `${BASE_IMG}/Dumbbell_Shoulder_Press/0.jpg`,
      `${BASE_IMG}/Dumbbell_Shoulder_Press/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-overhead-press',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+desenvolvimento+com+halteres',
    steps: [
      'Sente-se no banco com encosto em ~80° a 85° (quase reto, mas com leve inclinação).',
      'Erga os halteres até a altura dos ombros com as palmas voltadas para a frente.',
      'Empurre os halteres para cima acima da cabeça em um arco suave.',
      'Desça até a linha das orelhas sem despencar o peso.'
    ],
    mistakes: [
      'Arquear excessivamente a lombar jogando a barriga para frente.',
      'Bater os halteres em cima.'
    ],
    goldTip: 'Mantenha os cotovelos levemente apontados para a frente em um ângulo de 30° em relação ao tronco.'
  },
  {
    id: 'elevacao-lateral-halteres',
    name: 'Elevação Lateral com Halteres',
    enName: 'Dumbbell Lateral Raise',
    muscle: 'ombros',
    muscleLabel: 'Deltoide Lateral (Ombros Largos)',
    equipment: 'Halteres Leves',
    difficulty: 'Iniciante',
    targetGroup: 'Deltoide Lateral (Cabeça média)',
    frames: [
      `${BASE_IMG}/Side_Lateral_Raise/0.jpg`,
      `${BASE_IMG}/Side_Lateral_Raise/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-lateral-raise',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+elevacao+lateral+com+halteres',
    steps: [
      'Fique em pé com os pés na largura dos quadris, joelhos levemente flexíveis.',
      'Segure os halteres ao lado do corpo, cotovelos levemente dobrados.',
      'Eleve os braços lateralmente até a altura dos ombros, como se estivesse derramando água de uma jarra.',
      'Desça devagar controlando a gravidade.'
    ],
    mistakes: [
      'Usar peso pesado demais e balançar o corpo com impulso.',
      'Subir as mãos mais alto que os cotovelos.'
    ],
    goldTip: 'Priorize a postura! 4kg bem executados constroem mais ombros que 10kg balançando.'
  },
  {
    id: 'triceps-polia-corda',
    name: 'Tríceps na Polia com Corda',
    enName: 'Triceps Rope Pushdown',
    muscle: 'triceps',
    muscleLabel: 'Tríceps (Braço Definido)',
    equipment: 'Polia Alta + Acessório Corda',
    difficulty: 'Iniciante',
    targetGroup: 'Tríceps Braquial (Cabeça Lateral e Longa)',
    frames: [
      `${BASE_IMG}/Triceps_Pushdown_-_Rope_Attachment/0.jpg`,
      `${BASE_IMG}/Triceps_Pushdown_-_Rope_Attachment/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/cable-rope-pushdown',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+triceps+corda+polia',
    steps: [
      'Fique de frente para a polia, incline o tronco ligeiramente à frente com a coluna alinhada.',
      'Cole os cotovelos nas laterais das costelas e não os mova.',
      'Empurre a corda para baixo estendendo os antebraços e abrindo as pontas da corda na parte mais baixa.',
      'Suba os antebraços até 90° mantendo os cotovelos fixos no mesmo lugar.'
    ],
    mistakes: [
      'Ficar mexendo os cotovelos para frente e para trás feito remador.',
      'Usar o peso do corpo para empurrar a carga.'
    ],
    goldTip: 'Abra a ponta da corda no final como se quisesse colocar cada mão em um bolso diferente.'
  },
  {
    id: 'rosca-biceps-alternada',
    name: 'Rosca Bíceps Alternada com Halteres',
    enName: 'Alternating Dumbbell Bicep Curl',
    muscle: 'biceps',
    muscleLabel: 'Bíceps Braquial',
    equipment: 'Halteres',
    difficulty: 'Iniciante',
    targetGroup: 'Bíceps Braquial e Braquiorradial',
    frames: [
      `${BASE_IMG}/Dumbbell_Alternate_Bicep_Curl/0.jpg`,
      `${BASE_IMG}/Dumbbell_Alternate_Bicep_Curl/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-curl',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+rosca+biceps+alternada+com+halteres',
    steps: [
      'Em pé ou sentado, segure um haltere em cada mão ao lado das pernas.',
      'Erga um braço girando o punho para cima (supinação) até o haltere chegar próximo ao ombro.',
      'Aperte o bíceps no topo por 1 segundo e desça suavemente.',
      'Repita com o outro braço de forma alternada.'
    ],
    mistakes: [
      'Jogar a lombar para trás no momento da subida.',
      'Tirar os cotovelos da linha do corpo jogando-os para frente.'
    ],
    goldTip: 'Gire o dedo mindinho para cima no ponto mais alto para uma contração máxima do pico do bíceps.'
  },
  {
    id: 'prancha-abdominal',
    name: 'Prancha Isométrica no Solo',
    enName: 'Forearm Core Plank',
    muscle: 'abdomen',
    muscleLabel: 'Core & Abdômen Profundo',
    equipment: 'Colchonete',
    difficulty: 'Iniciante',
    targetGroup: 'Transverso do Abdômen, Reto Abdominal e Lombar',
    frames: [
      `${BASE_IMG}/Plank/0.jpg`,
      `${BASE_IMG}/Plank/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/hand-plank',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+prancha+abdominal+correto',
    steps: [
      'Apoie os antebraços e as pontas dos pés no colchonete.',
      'Cotovelos alinhados diretamente sob os ombros.',
      'Mantenha o corpo em linha reta da cabeça aos calcanhares.',
      'Contraia o abdômen e os glúteos com força máxima, respirando ritmadamente.'
    ],
    mistakes: [
      'Deixar o quadril cair em direção ao chão (sobrecarregando a lombar).',
      'Empinar a bunda muito alta no ar.',
      'Prender a respiração durante o exercício.'
    ],
    goldTip: 'Puxe o seu umbigo em direção às costas como se fosse levar um soco na barriga.'
  }
];

export const MUSCLE_GROUPS = [
  { id: 'todos', label: 'Todos os Músculos', icon: 'sparkles' },
  { id: 'peito', label: 'Peitoral', icon: 'shield' },
  { id: 'costas', label: 'Costas', icon: 'anchor' },
  { id: 'pernas', label: 'Pernas & Glúteos', icon: 'zap' },
  { id: 'ombros', label: 'Ombros', icon: 'crosshair' },
  { id: 'biceps', label: 'Bíceps', icon: 'activity' },
  { id: 'triceps', label: 'Tríceps', icon: 'target' },
  { id: 'abdomen', label: 'Abdômen & Core', icon: 'flame' }
];
