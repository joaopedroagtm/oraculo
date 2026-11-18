// Fichas de Treino Inteligentes para Iniciantes
// Estrutura de Portais: Múltiplas divisões, rotação automática e progressão constante.

export const DEFAULT_ROUTINES = [
  {
    id: 'portal-a',
    code: 'PORTAL_A',
    title: 'Portal Alpha • Peito, Ombros & Tríceps',
    focus: 'Membros Superiores (Empurrar / Push)',
    durationMin: 45,
    subtitle: 'Construção da Armadura Superior',
    description: 'Foco no peitoral, deltoides e tríceps com estabilidade máxima para iniciantes.',
    color: '#60a5fa',
    muscles: ['Peitoral', 'Deltoides', 'Tríceps'],
    exercises: [
      { exerciseId: 'supino-reto-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 10 },
      { exerciseId: 'crucifixo-maquina-peckdeck', sets: 3, reps: '12 a 15', restSec: 60, defaultWeight: 25 },
      { exerciseId: 'desenvolvimento-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 8 },
      { exerciseId: 'elevacao-lateral-halteres', sets: 3, reps: '12 a 15', restSec: 45, defaultWeight: 5 },
      { exerciseId: 'triceps-polia-corda', sets: 3, reps: '12 a 15', restSec: 45, defaultWeight: 15 }
    ]
  },
  {
    id: 'portal-b',
    code: 'PORTAL_B',
    title: 'Portal Beta • Costas, Bíceps & Core',
    focus: 'Membros Superiores (Puxar / Pull)',
    durationMin: 45,
    subtitle: 'Expansão Dorsal & Força Central',
    description: 'Postura, costas largas e bíceps definidos com pegada anatômica controlada.',
    color: '#f472b6',
    muscles: ['Costas', 'Bíceps', 'Postura'],
    exercises: [
      { exerciseId: 'puxada-alta-polia', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 30 },
      { exerciseId: 'remada-baixa-triangulo', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 25 },
      { exerciseId: 'face-pull-polia', sets: 3, reps: '12 a 15', restSec: 45, defaultWeight: 12 },
      { exerciseId: 'rosca-biceps-alternada', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 8 },
      { exerciseId: 'prancha-abdominal', sets: 3, reps: '35 seg', restSec: 45, defaultWeight: 0 }
    ]
  },
  {
    id: 'portal-c',
    code: 'PORTAL_C',
    title: 'Portal Gamma • Pernas & Base Sólida',
    focus: 'Membros Inferiores (Legs & Glúteos)',
    durationMin: 45,
    subtitle: 'Base Sólida & Potência Muscular',
    description: 'Volume equilibrado para quadríceps, posteriores e estabilização de joelhos sem exaustão excessiva.',
    color: '#fbbf24',
    muscles: ['Quadríceps', 'Posteriores', 'Glúteos'],
    exercises: [
      { exerciseId: 'leg-press-45', sets: 3, reps: '10 a 12', restSec: 90, defaultWeight: 80 },
      { exerciseId: 'cadeira-extensora', sets: 3, reps: '12 a 15', restSec: 60, defaultWeight: 25 },
      { exerciseId: 'mesa-flexora-deitada', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 25 },
      { exerciseId: 'elevacao-pelvica-quadril', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 20 },
      { exerciseId: 'elevacao-panturrilha-pe', sets: 3, reps: '15', restSec: 45, defaultWeight: 10 }
    ]
  }
];

export const TRAINING_SPLITS = [
  {
    id: 'abc_rotativo',
    name: 'ABC Rotativo (I & II)',
    shortName: 'ABC Rotativo',
    badge: 'RECOMENDADO',
    description: 'Mantém a divisão segura por partes (Push/Pull/Legs), alternando entre os estímulos I e II para nunca cair na monotonia.',
    routines: [
      DEFAULT_ROUTINES[0],
      DEFAULT_ROUTINES[1],
      DEFAULT_ROUTINES[2],
      {
        id: 'portal-a2',
        code: 'PORTAL_A2',
        title: 'Portal Alpha II • Peito Superior & Tríceps',
        focus: 'Empurrar • Ângulos Alternativos',
        durationMin: 45,
        subtitle: 'Variação Inclinada & Braços',
        description: 'Foco em peitoral superior, deltoides com rotação e alongamento máximo do tríceps.',
        color: '#38bdf8',
        muscles: ['Peito Sup.', 'Ombros', 'Tríceps'],
        exercises: [
          { exerciseId: 'supino-inclinado-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 10 },
          { exerciseId: 'crossover-polia', sets: 3, reps: '12 a 15', restSec: 50, defaultWeight: 10 },
          { exerciseId: 'supino-maquina', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 25 },
          { exerciseId: 'desenvolvimento-arnold', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 8 },
          { exerciseId: 'triceps-corda-frances', sets: 3, reps: '12 a 15', restSec: 45, defaultWeight: 12 }
        ]
      },
      {
        id: 'portal-b2',
        code: 'PORTAL_B2',
        title: 'Portal Beta II • Dorsais, Bíceps & Polia',
        focus: 'Puxar • Densidade & Braquial',
        durationMin: 45,
        subtitle: 'Remadas Livres & Antebraço',
        description: 'Variação com remada unilateral serrote, barra W/martelo e abdômen com sobrecarga.',
        color: '#ec4899',
        muscles: ['Dorsais', 'Bíceps', 'Abdômen'],
        exercises: [
          { exerciseId: 'remada-unilateral-serrote', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 12 },
          { exerciseId: 'puxada-alta-polia', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 30 },
          { exerciseId: 'remada-curvada-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 10 },
          { exerciseId: 'rosca-martelo-halteres', sets: 3, reps: '10 a 12', restSec: 50, defaultWeight: 8 },
          { exerciseId: 'abdominal-infra-crunch', sets: 3, reps: '12 a 15', restSec: 45, defaultWeight: 15 }
        ]
      },
      {
        id: 'portal-c2',
        code: 'PORTAL_C2',
        title: 'Portal Gamma II • Agachamento & Posterior',
        focus: 'Pernas • Cadeia Posterior & Glúteos',
        durationMin: 45,
        subtitle: 'Hack, Stiff & Estabilidade',
        description: 'Variação de inferiores com Agachamento Hack, Stiff e Cadeira Abdutora.',
        color: '#fbbf24',
        muscles: ['Quadríceps', 'Posterior', 'Glúteos'],
        exercises: [
          { exerciseId: 'agachamento-hack', sets: 3, reps: '10 a 12', restSec: 75, defaultWeight: 40 },
          { exerciseId: 'stiff-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 10 },
          { exerciseId: 'cadeira-extensora', sets: 3, reps: '12 a 15', restSec: 50, defaultWeight: 25 },
          { exerciseId: 'cadeira-abdutora', sets: 3, reps: '15', restSec: 45, defaultWeight: 25 },
          { exerciseId: 'elevacao-pernas-solo', sets: 3, reps: '12', restSec: 45, defaultWeight: 0 }
        ]
      }
    ]
  },
  {
    id: 'abc_classico',
    name: 'ABC Clássico',
    shortName: 'ABC Clássico',
    badge: '3 PORTAIS',
    description: 'Os 3 portais essenciais (Empurrar, Puxar, Pernas) com volume equilibrado para consolidar a base.',
    routines: DEFAULT_ROUTINES
  },
  {
    id: 'upper_lower',
    name: 'Upper / Lower (4x)',
    shortName: 'Upper / Lower',
    badge: '3-4X/SEM',
    description: 'Ideal para quem treina 3 a 4 dias na semana: alterna dias de Membros Superiores completos e Inferiores.',
    routines: [
      {
        id: 'ul-upper-a',
        code: 'UPPER_A',
        title: 'Upper Alpha • Força Superior',
        focus: 'Superiores Completo (Peito, Costas & Braços)',
        durationMin: 50,
        subtitle: 'Armadura Completa',
        description: 'Trabalha peito, costas, ombros e braços na mesma sessão com ritmo dinâmico.',
        color: '#38bdf8',
        muscles: ['Peito', 'Costas', 'Ombros', 'Braços'],
        exercises: [
          { exerciseId: 'supino-reto-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 10 },
          { exerciseId: 'puxada-alta-polia', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 30 },
          { exerciseId: 'desenvolvimento-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 8 },
          { exerciseId: 'remada-baixa-triangulo', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 25 },
          { exerciseId: 'triceps-polia-barra', sets: 3, reps: '12', restSec: 45, defaultWeight: 15 },
          { exerciseId: 'rosca-barra-w', sets: 3, reps: '10 a 12', restSec: 45, defaultWeight: 10 }
        ]
      },
      {
        id: 'ul-lower-a',
        code: 'LOWER_A',
        title: 'Lower Alpha • Pernas & Core',
        focus: 'Inferiores Completo & Estabilidade',
        durationMin: 45,
        subtitle: 'Pilares & Abdômen',
        description: 'Quadríceps, posteriores, glúteos e core com descansos controlados.',
        color: '#fbbf24',
        muscles: ['Quadríceps', 'Posteriores', 'Core'],
        exercises: [
          { exerciseId: 'leg-press-45', sets: 3, reps: '10 a 12', restSec: 75, defaultWeight: 80 },
          { exerciseId: 'mesa-flexora-deitada', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 25 },
          { exerciseId: 'cadeira-extensora', sets: 3, reps: '12 a 15', restSec: 50, defaultWeight: 25 },
          { exerciseId: 'cadeira-abdutora', sets: 3, reps: '15', restSec: 45, defaultWeight: 25 },
          { exerciseId: 'prancha-abdominal', sets: 3, reps: '35 seg', restSec: 45, defaultWeight: 0 }
        ]
      },
      {
        id: 'ul-upper-b',
        code: 'UPPER_B',
        title: 'Upper Beta • Variação Superior',
        focus: 'Superiores Completo (Ângulos & Postura)',
        durationMin: 50,
        subtitle: 'Inclinado, Serrote & Postura',
        description: 'Varia todos os ângulos de superiores para estimular novas fibras musculares.',
        color: '#ec4899',
        muscles: ['Peito Sup.', 'Dorsais', 'Ombros', 'Bíceps'],
        exercises: [
          { exerciseId: 'supino-inclinado-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 10 },
          { exerciseId: 'remada-unilateral-serrote', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 12 },
          { exerciseId: 'crucifixo-maquina-peckdeck', sets: 3, reps: '12 a 15', restSec: 50, defaultWeight: 25 },
          { exerciseId: 'elevacao-lateral-halteres', sets: 3, reps: '12 a 15', restSec: 45, defaultWeight: 5 },
          { exerciseId: 'face-pull-polia', sets: 3, reps: '15', restSec: 45, defaultWeight: 12 },
          { exerciseId: 'rosca-martelo-halteres', sets: 3, reps: '10 a 12', restSec: 45, defaultWeight: 8 }
        ]
      },
      {
        id: 'ul-lower-b',
        code: 'LOWER_B',
        title: 'Lower Beta • Posterior & Glúteo',
        focus: 'Agachamento, Stiff & Panturrilha',
        durationMin: 45,
        subtitle: 'Base Posterior',
        description: 'Ênfase em cadeia posterior, agachamento guiado e definição abdominal.',
        color: '#fbbf24',
        muscles: ['Agachamento', 'Posterior', 'Glúteos'],
        exercises: [
          { exerciseId: 'agachamento-hack', sets: 3, reps: '10 a 12', restSec: 75, defaultWeight: 40 },
          { exerciseId: 'stiff-halteres', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 10 },
          { exerciseId: 'elevacao-pelvica-quadril', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 20 },
          { exerciseId: 'elevacao-panturrilha-pe', sets: 3, reps: '15', restSec: 45, defaultWeight: 10 },
          { exerciseId: 'abdominal-infra-crunch', sets: 3, reps: '12 a 15', restSec: 45, defaultWeight: 15 }
        ]
      }
    ]
  },
  {
    id: 'express',
    name: 'Express ~25 min',
    shortName: 'Express 25m',
    badge: 'DIA CANSADO',
    description: 'Treinos enxutos e inteligentes para dias sem tempo ou energia — mantém seu Streak vivo sem exaustão.',
    routines: [
      {
        id: 'exp-upper',
        code: 'EXPRESS_A',
        title: 'Express Superior • Essencial 25m',
        focus: 'Superiores Rápido (4 Compostos)',
        durationMin: 25,
        subtitle: 'Máximo Resultado, Menos Tempo',
        description: '4 movimentos estratégicos para ativar peito, costas, ombros e braços em 25 minutos.',
        color: '#38bdf8',
        muscles: ['Peito', 'Costas', 'Ombros', 'Braços'],
        exercises: [
          { exerciseId: 'supino-maquina', sets: 3, reps: '10 a 12', restSec: 50, defaultWeight: 25 },
          { exerciseId: 'puxada-alta-polia', sets: 3, reps: '10 a 12', restSec: 50, defaultWeight: 30 },
          { exerciseId: 'desenvolvimento-halteres', sets: 3, reps: '10 a 12', restSec: 50, defaultWeight: 8 },
          { exerciseId: 'rosca-biceps-alternada', sets: 3, reps: '10 a 12', restSec: 45, defaultWeight: 8 }
        ]
      },
      {
        id: 'exp-lower',
        code: 'EXPRESS_B',
        title: 'Express Inferior • Base 25m',
        focus: 'Pernas & Core Rápido',
        durationMin: 25,
        subtitle: 'Pernas Sem Desgaste',
        description: '4 exercícios essenciais para pernas, glúteos e abdômen em 25 minutos.',
        color: '#fbbf24',
        muscles: ['Pernas', 'Posterior', 'Core'],
        exercises: [
          { exerciseId: 'agachamento-goblet', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 12 },
          { exerciseId: 'mesa-flexora-deitada', sets: 3, reps: '10 a 12', restSec: 50, defaultWeight: 25 },
          { exerciseId: 'elevacao-pelvica-quadril', sets: 3, reps: '12', restSec: 50, defaultWeight: 20 },
          { exerciseId: 'prancha-abdominal', sets: 3, reps: '35 seg', restSec: 45, defaultWeight: 0 }
        ]
      }
    ]
  }
];

export function getSplitById(splitId) {
  return TRAINING_SPLITS.find(s => s.id === splitId) || TRAINING_SPLITS[0];
}

// Helper para selecionar o próximo treino com base no histórico mais recente (history[0])
export function getNextRoutine(completedRoutinesHistory, availableRoutines = DEFAULT_ROUTINES) {
  const list = (availableRoutines && availableRoutines.length > 0) ? availableRoutines : DEFAULT_ROUTINES;
  if (!completedRoutinesHistory || completedRoutinesHistory.length === 0) {
    return list[0];
  }

  // O histórico é salvo via unshift, então o índice 0 é o treino mais recente
  const lastRoutineId = completedRoutinesHistory[0].routineId;
  const currentIndex = list.findIndex(r => r.id === lastRoutineId);

  if (currentIndex === -1) {
    // Se mudou de divisão recentemente, mapeia por padrão similar ou inicia no primeiro da nova divisão
    return list[0];
  }
  if (currentIndex === list.length - 1) {
    return list[0];
  }
  return list[currentIndex + 1];
}
