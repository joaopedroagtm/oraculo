// Catálogo de Exercícios Especializados para Iniciantes   
// Dados biomecânicos precisos com imagens reais de alta definição (Início & Contração, duas imagens que me mexem, tipo um .gif),
// links diretos para MuscleWiki e tutoriais em vídeo no YouTube também.

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
  },
  {
    id: 'supino-inclinado-halteres',
    name: 'Supino Inclinado com Halteres',
    enName: 'Incline Dumbbell Press',
    muscle: 'peito',
    muscleLabel: 'Peitoral Superior',
    equipment: 'Banco Inclinado (30° a 45°) + Halteres',
    difficulty: 'Iniciante',
    targetGroup: 'Peitoral Superior (Porção Clavicular), Deltoide Anterior e Tríceps',
    frames: [
      `${BASE_IMG}/Incline_Dumbbell_Press/0.jpg`,
      `${BASE_IMG}/Incline_Dumbbell_Press/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/incline-dumbbell-bench-press',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+supino+inclinado+halteres+correto',
    steps: [
      'Ajuste o banco em uma inclinação suave de 30° a 45°.',
      'Sente-se com as costas e a cabeça apoiadas, pés plantados no chão.',
      'Empurre os halteres para cima partindo da altura do peito superior até a extensão quase completa.',
      'Desça de maneira controlada sentindo o peitoral superior esticar sem jogar os cotovelos para trás.'
    ],
    mistakes: [
      'Inclinar o banco alto demais (mais de 45° sobrecarrega os ombros e desativa o peito).',
      'Despencar o peso rápido na descida.'
    ],
    goldTip: 'Mantenha os cotovelos a cerca de 60° em relação ao tronco para foco absoluto no feixe superior.'
  },
  {
    id: 'crossover-polia',
    name: 'Crucifixo / Crossover na Polia',
    enName: 'Cable Crossover',
    muscle: 'peito',
    muscleLabel: 'Peitoral & Linha Medial',
    equipment: 'Polia Dupla (Crossover)',
    difficulty: 'Iniciante',
    targetGroup: 'Peitoral Maior (Tensão Contínua)',
    frames: [
      `${BASE_IMG}/Cable_Crossover/0.jpg`,
      `${BASE_IMG}/Cable_Crossover/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/cable-crossover',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+crossover+polia+peito',
    steps: [
      'Posicione as polias na altura dos ombros ou um pouco acima.',
      'Dê um passo à frente com uma perna para criar base sólida e incline ligeiramente o tronco.',
      'Com os braços quase retos (cotovelos destravados), puxe os cabos em um abraço até as mãos se aproximarem.',
      'Retorne devagar sentindo o peito abrir e alongar sob a tensão dos cabos.'
    ],
    mistakes: [
      'Dobrar demais os cotovelos transformando o movimento em um supino feio.',
      'Dar tranco com a lombar para puxar o peso.'
    ],
    goldTip: 'Imagine que você está abraçando um barril gigante na sua frente e segure 1 segundo no pico de contração.'
  },
  {
    id: 'remada-curvada-halteres',
    name: 'Remada Curvada com Halteres',
    enName: 'Bent-Over Dumbbell Row',
    muscle: 'costas',
    muscleLabel: 'Densidade Dorsal & Romboides',
    equipment: 'Par de Halteres',
    difficulty: 'Iniciante',
    targetGroup: 'Grande Dorsal, Redondo Maior, Romboides e Eretor da Espinha',
    frames: [
      `${BASE_IMG}/Bent_Over_Two-Dumbbell_Row/0.jpg`,
      `${BASE_IMG}/Bent_Over_Two-Dumbbell_Row/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-row',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+remada+curvada+com+halteres',
    steps: [
      'Fique em pé, pés na largura dos ombros, incline o tronco à frente a ~45° com a coluna perfeitamente neutra.',
      'Segure os halteres com os braços soltos para baixo e peito aberto.',
      'Puxe os halteres em direção aos quadris guiando o movimento pelos cotovelos.',
      'Aperte as escápulas no topo e desça esticando as costas com total controle.'
    ],
    mistakes: [
      'Curvar as costas como se fosse um gato assustado (arredondar a lombar).',
      'Puxar com a força dos bíceps em vez das costas.'
    ],
    goldTip: 'Pense em colocar os cotovelos nos bolsos traseiros da sua bermuda.'
  },
  {
    id: 'remada-unilateral-serrote',
    name: 'Remada Unilateral com Haltere (Serrote)',
    enName: 'One-Arm Dumbbell Row',
    muscle: 'costas',
    muscleLabel: 'Dorsais Unilateral',
    equipment: 'Haltere + Banco Reto',
    difficulty: 'Iniciante',
    targetGroup: 'Grande Dorsal, Trapézio Médio e Romboides',
    frames: [
      `${BASE_IMG}/One-Arm_Dumbbell_Row/0.jpg`,
      `${BASE_IMG}/One-Arm_Dumbbell_Row/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-row',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+remada+unilateral+serrote+correto',
    steps: [
      'Apoie o joelho e a mão do mesmo lado sobre um banco reto.',
      'A outra perna fica firme no chão com o pé bem apoiado e o tronco paralelo ao solo.',
      'Segure o haltere com a mão livre e puxe o peso em direção ao quadril sem girar a coluna.',
      'Desça o peso alongando a asa das costas.'
    ],
    mistakes: [
      'Torcer a coluna e jogar o ombro para cima no topo.',
      'Puxar o peso reto para o peito em vez de puxar para o quadril.'
    ],
    goldTip: 'A coluna fica fixa e imóvel; apenas a escápula e o cotovelo trabalham na tração.'
  },
  {
    id: 'agachamento-goblet',
    name: 'Agachamento Goblet com Haltere',
    enName: 'Goblet Squat',
    muscle: 'pernas',
    muscleLabel: 'Quadríceps & Glúteos',
    equipment: 'Haltere ou Kettlebell',
    difficulty: 'Iniciante',
    targetGroup: 'Quadríceps, Glúteo Máximo e Core',
    frames: [
      `${BASE_IMG}/Goblet_Squat/0.jpg`,
      `${BASE_IMG}/Goblet_Squat/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-goblet-squat',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+agachamento+goblet+com+haltere',
    steps: [
      'Fique em pé com os pés um pouco mais largos que os ombros, pontas dos pés levemente voltadas para fora.',
      'Segure um haltere na vertical colado ao peito pelas duas mãos.',
      'Desça agachando jogando o quadril para trás e joelhos apontados para fora.',
      'Desça até as coxas ficarem paralelas ao chão mantendo o peito erguido, e suba empurrando os calcanhares.'
    ],
    mistakes: [
      'Tirar os calcanhares do chão ao descer.',
      'Deixar os joelhos caírem para dentro (valgo dinâmico).',
      'Curvar o peito para frente.'
    ],
    goldTip: 'O haltere no peito funciona como contrapeso que ajuda naturalmente a manter a coluna ereta.'
  },
  {
    id: 'mesa-flexora-deitada',
    name: 'Mesa Flexora Deitada',
    enName: 'Lying Leg Curls',
    muscle: 'pernas',
    muscleLabel: 'Posteriores de Coxa',
    equipment: 'Máquina Mesa Flexora',
    difficulty: 'Iniciante',
    targetGroup: 'Isquiotibiais (Bíceps Femoral, Semitendíneo e Semimembranáceo)',
    frames: [
      `${BASE_IMG}/Lying_Leg_Curls/0.jpg`,
      `${BASE_IMG}/Lying_Leg_Curls/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/machine-leg-curl',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+mesa+flexora+deitada',
    steps: [
      'Deite-se de bruços na máquina com o rolo de apoio posicionado logo atrás dos seus calcanhares/tendão de Aquiles.',
      'Segure firme nas manoplas da máquina para não deixar o quadril subir do banco.',
      'Flexione os joelhos puxando os calcanhares em direção aos glúteos de forma fluida.',
      'Segure 1 segundo no topo e retorne descendo suavemente sem deixar os pesos baterem.'
    ],
    mistakes: [
      'Levantar o bumbum do banco ao fazer força (arqueando a lombar).',
      'Descer o peso de uma vez sem controle excêntrico.'
    ],
    goldTip: 'Cole o osso do quadril no banco e puxe apenas flexionando a parte de trás das coxas.'
  },
  {
    id: 'elevacao-pelvica-quadril',
    name: 'Elevação Pélvica / Hip Thrust',
    enName: 'Barbell Hip Thrust',
    muscle: 'pernas',
    muscleLabel: 'Glúteos & Cadeia Posterior',
    equipment: 'Banco + Barra ou Haltere no Quadril',
    difficulty: 'Iniciante',
    targetGroup: 'Glúteo Máximo, Isquiotibiais e Core',
    frames: [
      `${BASE_IMG}/Barbell_Hip_Thrust/0.jpg`,
      `${BASE_IMG}/Barbell_Hip_Thrust/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/barbell-hip-thrust',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+elevacao+pelvica+hip+thrust',
    steps: [
      'Apoie a parte superior das costas (logo abaixo das escápulas) na borda de um banco estável.',
      'Posicione os pés na largura dos ombros, firmes no chão, com os joelhos a 90° no ponto mais alto.',
      'Apoie o haltere ou barra protegida sobre os ossos do quadril.',
      'Empurre o chão com os calcanhares e erga o quadril até alinhar coxa e tronco, contraindo os glúteos no máximo.'
    ],
    mistakes: [
      'Hiperextender a coluna lombar no topo em vez de contrair os glúteos.',
      'Olhar para o teto (mantenha o queixo levemente apontado para o peito).'
    ],
    goldTip: 'Aperte os glúteos com força no topo por 2 segundos como se estivesse segurando uma moeda entre eles.'
  },
  {
    id: 'elevacao-panturrilha-pe',
    name: 'Elevação de Panturrilha em Pé',
    enName: 'Standing Calf Raise',
    muscle: 'pernas',
    muscleLabel: 'Panturrilhas',
    equipment: 'Step / Degrau + Halteres ou Peso Corporal',
    difficulty: 'Iniciante',
    targetGroup: 'Gastrocnêmio e Sóleo',
    frames: [
      `${BASE_IMG}/Standing_Dumbbell_Calf_Raise/0.jpg`,
      `${BASE_IMG}/Standing_Dumbbell_Calf_Raise/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-calf-raise',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+panturrilha+em+pe+correto',
    steps: [
      'Apoie as pontas dos pés na borda de um degrau ou step, deixando os calcanhares livres para descer.',
      'Segure um haltere na mão ou apoie-se em uma parede para equilíbrio.',
      'Desça os calcanhares o máximo que conseguir sentindo a panturrilha esticar completamente.',
      'Suba na ponta dos pés com explosão máxima e segure 1 segundo na contração máxima.'
    ],
    mistakes: [
      'Ficar quicando rapidamente feito mola sem amplitude real.',
      'Dobrar os joelhos durante a subida.'
    ],
    goldTip: 'O segredo da panturrilha é a amplitude: desça até o fundo e suba até a ponta máxima do dedão.'
  },
  {
    id: 'desenvolvimento-arnold',
    name: 'Desenvolvimento Arnold com Halteres',
    enName: 'Arnold Dumbbell Press',
    muscle: 'ombros',
    muscleLabel: 'Deltoides Completo com Rotação',
    equipment: 'Par de Halteres + Banco com Encosto',
    difficulty: 'Iniciante',
    targetGroup: 'Deltoide Anterior, Lateral e Posterior',
    frames: [
      `${BASE_IMG}/Arnold_Dumbbell_Press/0.jpg`,
      `${BASE_IMG}/Arnold_Dumbbell_Press/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-arnold-press',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+desenvolvimento+arnold+press',
    steps: [
      'Sente-se no banco com halteres na altura do peito, palmas das mãos voltadas para você (como na rosca bíceps).',
      'Inicie a subida girando os pulsos para fora enquanto empurra os halteres para cima.',
      'No topo, as palmas terminam voltadas para a frente.',
      'Desça invertendo a rotação de forma contínua até a posição inicial.'
    ],
    mistakes: [
      'Girar de forma brusca e descoordenada.',
      'Usar peso excessivo e perder a estabilidade do punho.'
    ],
    goldTip: 'A rotação suave ativa todas as três cabeças do deltoide de forma fluida e anatômica.'
  },
  {
    id: 'face-pull-polia',
    name: 'Face Pull na Polia com Corda',
    enName: 'Face Pull',
    muscle: 'ombros',
    muscleLabel: 'Deltoide Posterior & Manguito',
    equipment: 'Polia Alta + Acessório Corda',
    difficulty: 'Iniciante',
    targetGroup: 'Deltoide Posterior, Trapézio Médio e Romboides (Saúde dos Ombros)',
    frames: [
      `${BASE_IMG}/Face_Pull/0.jpg`,
      `${BASE_IMG}/Face_Pull/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/cable-face-pull',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+face+pull+na+polia',
    steps: [
      'Ajuste a polia na altura dos olhos ou do peito e encaixe a corda.',
      'Dê um passo atrás, estique os braços com pegada pronada ou neutra na ponta da corda.',
      'Puxe a corda em direção ao seu rosto (altura do nariz/testa), separando as pontas da corda.',
      'Os cotovelos devem terminar altos e apontados para trás, em rotação externa.'
    ],
    mistakes: [
      'Puxar para a barriga em vez do rosto.',
      'Deixar os cotovelos caírem para baixo.'
    ],
    goldTip: 'Excelente para postura e prevenção de dores no ombro causadas pelo supino.'
  },
  {
    id: 'rosca-martelo-halteres',
    name: 'Rosca Martelo com Halteres',
    enName: 'Dumbbell Hammer Curl',
    muscle: 'biceps',
    muscleLabel: 'Braquial & Antebraço',
    equipment: 'Par de Halteres',
    difficulty: 'Iniciante',
    targetGroup: 'Braquial, Bíceps Braquial e Braquiorradial (Grossura do Braço)',
    frames: [
      `${BASE_IMG}/Hammer_Curls/0.jpg`,
      `${BASE_IMG}/Hammer_Curls/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/dumbbell-hammer-curl',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+rosca+martelo+com+halteres',
    steps: [
      'Fique em pé com os pés na largura dos ombros, segurando os halteres com as palmas voltadas uma para a outra (pegada neutra).',
      'Mantenha os cotovelos travados na lateral do corpo.',
      'Erga os halteres sem girar os punhos até a contração total dos braços.',
      'Desça devagar resistindo à gravidade.'
    ],
    mistakes: [
      'Jogar os cotovelos para frente para facilitar a subida.',
      'Balançar o corpo para levantar o peso.'
    ],
    goldTip: 'A pegada neutra desenvolve o músculo braquial, que "empurra" o bíceps para fora fazendo o braço parecer mais grosso.'
  },
  {
    id: 'triceps-corda-frances',
    name: 'Tríceps Francês na Polia com Corda',
    enName: 'Cable Rope Overhead Triceps Extension',
    muscle: 'triceps',
    muscleLabel: 'Tríceps Cabeça Longa',
    equipment: 'Polia Baixa ou Média + Corda',
    difficulty: 'Iniciante',
    targetGroup: 'Tríceps Braquial (Cabeça Longa em Alongamento Máximo)',
    frames: [
      `${BASE_IMG}/Cable_Rope_Overhead_Triceps_Extension/0.jpg`,
      `${BASE_IMG}/Cable_Rope_Overhead_Triceps_Extension/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/cable-overhead-triceps-extension',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+triceps+frances+na+polia',
    steps: [
      'Posicione a polia baixa ou na altura da cintura, segure a corda e fique de costas para o aparelho.',
      'Dê um passo à frente para criar base estável e erga os braços acima da cabeça com os cotovelos apontados para o teto.',
      'Estenda os cotovelos levando as mãos para frente e para cima.',
      'Flexione os cotovelos descendo a corda atrás da cabeça até sentir o tríceps alongar intensamente.'
    ],
    mistakes: [
      'Abrir os cotovelos excessivamente para as laterais.',
      'Arquear a lombar com carga muito pesada.'
    ],
    goldTip: 'Manter os braços erguidos acima da cabeça ativa a cabeça longa do tríceps como nenhum outro movimento.'
  },
  {
    id: 'elevacao-pernas-solo',
    name: 'Elevação de Pernas no Solo / Infra',
    enName: 'Lying Leg Raise',
    muscle: 'abdomen',
    muscleLabel: 'Abdômen Infra',
    equipment: 'Colchonete',
    difficulty: 'Iniciante',
    targetGroup: 'Reto Abdominal (Porção Inferior) e Flexores de Quadril',
    frames: [
      `${BASE_IMG}/Flat_Bench_Lying_Leg_Raise/0.jpg`,
      `${BASE_IMG}/Flat_Bench_Lying_Leg_Raise/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/lying-leg-raise',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+elevacao+de+pernas+abdominal+infra',
    steps: [
      'Deite-se de costas no colchonete com os braços ao lado do corpo ou mãos sob os glúteos para suporte lombar.',
      'Mantenha as pernas juntas e estendidas (ou joelhos levemente destravados).',
      'Erga as pernas até formar 90° com o chão soltando o ar e contraindo o abdômen.',
      'Desça as pernas devagar sem tocar os calcanhares no chão e sem deixar a lombar arquear.'
    ],
    mistakes: [
      'Tirar a lombar do chão ao descer as pernas.',
      'Jogar as pernas com impulso sem controle abdominal.'
    ],
    goldTip: 'Pressione as costas firmemente contra o colchonete durante todo o trajeto de descida.'
  },
  {
    id: 'abdominal-infra-crunch',
    name: 'Abdominal Crunch na Polia Alta',
    enName: 'Cable Crunch',
    muscle: 'abdomen',
    muscleLabel: 'Reto Abdominal com Sobrecarga',
    equipment: 'Polia Alta + Corda',
    difficulty: 'Iniciante',
    targetGroup: 'Reto Abdominal Superior e Médio',
    frames: [
      `${BASE_IMG}/Cable_Crunch/0.jpg`,
      `${BASE_IMG}/Cable_Crunch/1.jpg`
    ],
    muscleWikiUrl: 'https://musclewiki.com/pt-br/exercise/cable-crunch',
    youtubeUrl: 'https://www.youtube.com/results?search_query=como+fazer+abdominal+crunch+na+polia',
    steps: [
      'Ajoelhe-se em frente à polia alta segurando a corda com as mãos ao lado da cabeça/orelhas.',
      'Fixe os quadris e incline o tronco ligeiramente à frente.',
      'Enrole a coluna trazendo os cotovelos em direção aos joelhos soltando todo o ar.',
      'Retorne esticando o abdômen sem mexer os quadris.'
    ],
    mistakes: [
      'Sentar nos calcanhares ao descer (movendo o quadril em vez de enrolar a barriga).',
      'Puxar com a força dos braços.'
    ],
    goldTip: 'Pense em aproximar as suas costelas dos ossos da sua bacia; o movimento vem puramente da flexão da coluna.'
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
