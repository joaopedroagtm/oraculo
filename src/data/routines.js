// Fichas de Treino Inteligentes para Iniciantes (eu, rs)
// Estrutura de Portais: Rotação automática e progressão constante.

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
    exercises: [
      { exerciseId: 'puxada-alta-polia', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 30 },
      { exerciseId: 'remada-baixa-triangulo', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 25 },
      { exerciseId: 'rosca-biceps-alternada', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 8 },
      { exerciseId: 'prancha-abdominal', sets: 3, reps: '30 a 45 seg', restSec: 45, defaultWeight: 0 }
    ]
  },
  {
    id: 'portal-c',
    code: 'PORTAL_C',
    title: 'Portal Gamma • Pernas & Pilares de Concreto',
    focus: 'Membros Inferiores (Legs & Glúteos)',
    durationMin: 50,
    subtitle: 'Base Sólida & Potência Muscular',
    description: 'Fortalecimento de quadríceps, posteriores e estabilização de joelhos.',
    color: '#38bdf8',
    exercises: [
      { exerciseId: 'leg-press-45', sets: 4, reps: '10 a 12', restSec: 90, defaultWeight: 80 },
      { exerciseId: 'cadeira-extensora', sets: 3, reps: '12 a 15', restSec: 60, defaultWeight: 25 },
      { exerciseId: 'mesa-flexora-deitada', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 25 },
      { exerciseId: 'elevacao-pelvica-quadril', sets: 3, reps: '10 a 12', restSec: 60, defaultWeight: 20 },
      { exerciseId: 'elevacao-panturrilha-pe', sets: 3, reps: '15', restSec: 45, defaultWeight: 10 },
      { exerciseId: 'prancha-abdominal', sets: 3, reps: '40 seg', restSec: 45, defaultWeight: 0 }
    ]
  }
];

// Helper para selecionar o próximo treino com base no histórico
export function getNextRoutine(completedRoutinesHistory) {
  if (!completedRoutinesHistory || completedRoutinesHistory.length === 0) {
    return DEFAULT_ROUTINES[0]; 
  }

  const lastRoutineId = completedRoutinesHistory[completedRoutinesHistory.length - 1].routineId;
  const currentIndex = DEFAULT_ROUTINES.findIndex(r => r.id === lastRoutineId);
  
  if (currentIndex === -1 || currentIndex === DEFAULT_ROUTINES.length - 1) {
    return DEFAULT_ROUTINES[0];
  }
  return DEFAULT_ROUTINES[currentIndex + 1];
}
