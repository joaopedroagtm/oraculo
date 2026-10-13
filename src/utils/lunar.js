// Utilitário Astronômico: Cálculo Real da Fase Lunar e Iluminação • AGiTe-Me!
// Baseado no ciclo sinódico lunar médio (29.53058770576 dias).

export function getAstronomicalMoonPhase(date = new Date()) {
  // Referência conhecida de Lua Nova astronômica: 6 de Janeiro de 2000 às 18:14 UTC
  const refNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const synodicMonth = 29.53058770576; // duração média em dias

  // Diferença em dias a partir da data de referência
  const diffDays = (date.getTime() - refNewMoon.getTime()) / (1000 * 60 * 60 * 24);

  // Idade atual da lua no ciclo (0 a ~29.53 dias)
  const age = ((diffDays % synodicMonth) + synodicMonth) % synodicMonth;
  const phaseFraction = age / synodicMonth; // 0.0 a 1.0

  // Fração de iluminação (0% na Lua Nova, 100% na Lua Cheia)
  const illuminationFraction = (1 - Math.cos(phaseFraction * 2 * Math.PI)) / 2;
  const illuminationPercent = Math.round(illuminationFraction * 100);

  // Determinação precisa da fase em português
  let phaseName = 'Lua Nova';
  let phaseCategory = 'nova'; // nova, crescente, cheia, minguante
  let phaseIcon = '🌑';

  if (age < 1.84) {
    phaseName = 'Lua Nova';
    phaseCategory = 'nova';
    phaseIcon = '🌑';
  } else if (age < 5.53) {
    phaseName = 'Lua Crescente Inicial';
    phaseCategory = 'crescente';
    phaseIcon = '🌒';
  } else if (age < 9.22) {
    phaseName = 'Quarto Crescente';
    phaseCategory = 'crescente';
    phaseIcon = '🌓';
  } else if (age < 12.91) {
    phaseName = 'Lua Gibosa Crescente';
    phaseCategory = 'crescente';
    phaseIcon = '🌔';
  } else if (age < 16.61) {
    phaseName = 'Lua Cheia';
    phaseCategory = 'cheia';
    phaseIcon = '🌕';
  } else if (age < 20.30) {
    phaseName = 'Lua Gibosa Minguante';
    phaseCategory = 'minguante';
    phaseIcon = '🌖';
  } else if (age < 23.99) {
    phaseName = 'Quarto Minguante';
    phaseCategory = 'minguante';
    phaseIcon = '🌗';
  } else if (age < 27.68) {
    phaseName = 'Lua Minguante Côncava';
    phaseCategory = 'minguante';
    phaseIcon = '🌘';
  } else {
    phaseName = 'Lua Nova';
    phaseCategory = 'nova';
    phaseIcon = '🌑';
  }

  // Descrição mística contextualizada para o treino
  let cosmicBlessing = 'O início do ciclo lunar convida à renovação e ao foco primordial na técnica.';
  if (phaseCategory === 'crescente') {
    cosmicBlessing = 'Energia cósmica em expansão: período perfeito para progressão gradual de cargas.';
  } else if (phaseCategory === 'cheia') {
    cosmicBlessing = 'Pico de força e intensidade: consagre sua maior energia nas séries do templo.';
  } else if (phaseCategory === 'minguante') {
    cosmicBlessing = 'Fase de consolidação muscular, apuro da execução e recuperação dos tecidos.';
  }

  return {
    date,
    age: Math.round(age * 10) / 10, // ex: 0.3 dias
    phaseFraction,
    illuminationPercent, // ex: 0%, 15%, 85%, 100%
    phaseName,
    phaseCategory,
    phaseIcon,
    cosmicBlessing
  };
}
