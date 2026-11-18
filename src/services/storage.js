import { DEFAULT_ROUTINES, TRAINING_SPLITS, getSplitById } from '../data/routines.js';

const STORAGE_KEYS = {
  PROFILE: 'agtm_profile',
  HISTORY: 'agtm_history',
  ACTIVE_SESSION: 'agtm_active_session',
  SETTINGS: 'agtm_settings',
  CHAT_HISTORY: 'agtm_oracle_chat',
  ROUTINES: 'agtm_routines'
};

// Perfil Padrão Inicial (Novo Visitante / Pré-Onboarding)
const DEFAULT_PROFILE = {
  userId: '',
  email: '',
  name: '',
  age: 24,
  weight: 75,
  height: 178,
  goal: 'hipertrofia',
  frequency: 4,
  auraColor: '#38bdf8',
  avatarUrl: '',
  geminiApiKey: '',
  isOnboarded: false,
  hasConfiguredBio: false,
  createdAt: new Date().toISOString()
};

export const StorageService = {
  getCurrentUserSlug() {
    return localStorage.getItem('agtm_active_slug') || 'joao';
  },

  switchUser(slug) {
    const validSlug = slug === 'marco' ? 'marco' : 'joao';
    localStorage.setItem('agtm_active_slug', validSlug);
  },

  getProfile() {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_profile_${slug}`;
    try {
      const data = localStorage.getItem(key) || (slug === 'joao' ? localStorage.getItem(STORAGE_KEYS.PROFILE) : null);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}

    if (slug === 'marco') {
      return {
        userId: '',
        email: '',
        name: 'Marco',
        age: 24,
        weight: 74,
        height: 176,
        goal: 'hipertrofia',
        frequency: 4,
        auraColor: '#f472b6',
        avatarUrl: '',
        geminiApiKey: '',
        isOnboarded: true,
        createdAt: new Date().toISOString()
      };
    }
    return DEFAULT_PROFILE;
  },

  saveProfile(profile) {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_profile_${slug}`;
    localStorage.setItem(key, JSON.stringify(profile));
    if (slug === 'joao') {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    }
  },

  getHistory() {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_history_${slug}`;
    try {
      const data = localStorage.getItem(key) || (slug === 'joao' ? localStorage.getItem(STORAGE_KEYS.HISTORY) : null);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveHistory(history) {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_history_${slug}`;
    try {
      localStorage.setItem(key, JSON.stringify(history));
      if (slug === 'joao') {
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
      }
    } catch (e) {
      console.warn('Erro ao salvar histórico no localStorage:', e);
    }
  },

  addWorkoutToHistory(workout) {
    const history = this.getHistory();
    history.unshift(workout);
    this.saveHistory(history);
    return history;
  },

  updateWorkoutInHistory(workoutId, patch) {
    const history = this.getHistory();
    const idx = history.findIndex(w => w.id === workoutId);
    if (idx === -1) return null;
    history[idx] = { ...history[idx], ...patch };
    this.saveHistory(history);
    return history[idx];
  },

  getActiveSession() {
    const slug = this.getCurrentUserSlug();
    const key = `${STORAGE_KEYS.ACTIVE_SESSION}_${slug}`;
    try {
      const data = localStorage.getItem(key) || (slug === 'joao' ? localStorage.getItem(STORAGE_KEYS.ACTIVE_SESSION) : null);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  },

  saveActiveSession(session) {
    const slug = this.getCurrentUserSlug();
    const key = `${STORAGE_KEYS.ACTIVE_SESSION}_${slug}`;
    if (!session) {
      localStorage.removeItem(key);
      if (slug === 'joao') localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
    } else {
      localStorage.setItem(key, JSON.stringify(session));
      if (slug === 'joao') localStorage.setItem(STORAGE_KEYS.ACTIVE_SESSION, JSON.stringify(session));
    }
  },

  clearActiveSession() {
    const slug = this.getCurrentUserSlug();
    const key = `${STORAGE_KEYS.ACTIVE_SESSION}_${slug}`;
    localStorage.removeItem(key);
    if (slug === 'joao') localStorage.removeItem(STORAGE_KEYS.ACTIVE_SESSION);
  },

  // Gerenciamento de Divisões & Portais Dinâmicos
  getActiveSplitId() {
    const slug = this.getCurrentUserSlug();
    return localStorage.getItem(`agtm_split_${slug}`) || 'abc_rotativo';
  },

  setActiveSplitId(splitId) {
    const slug = this.getCurrentUserSlug();
    const valid = getSplitById(splitId).id;
    localStorage.setItem(`agtm_split_${slug}`, valid);
    return valid;
  },

  getRoutines(splitId = this.getActiveSplitId()) {
    const slug = this.getCurrentUserSlug();
    const splitKey = `${STORAGE_KEYS.ROUTINES}_${slug}_${splitId}`;
    try {
      const data = localStorage.getItem(splitKey);
      if (data) {
        return JSON.parse(data);
      }
      if (splitId === 'abc_classico') {
        const legacy = localStorage.getItem(`${STORAGE_KEYS.ROUTINES}_${slug}`);
        if (legacy) return JSON.parse(legacy);
      }
    } catch {}
    const split = getSplitById(splitId);
    return JSON.parse(JSON.stringify(split.routines || DEFAULT_ROUTINES));
  },

  saveRoutines(routines, splitId = this.getActiveSplitId()) {
    const slug = this.getCurrentUserSlug();
    const splitKey = `${STORAGE_KEYS.ROUTINES}_${slug}_${splitId}`;
    try {
      localStorage.setItem(splitKey, JSON.stringify(routines));
      if (splitId === 'abc_classico') {
        localStorage.setItem(`${STORAGE_KEYS.ROUTINES}_${slug}`, JSON.stringify(routines));
      }
    } catch {}
  },

  addCustomRoutine(newRoutine) {
    const routines = this.getRoutines();
    routines.push(newRoutine);
    this.saveRoutines(routines);
    return routines;
  },

  removeRoutine(routineId) {
    const routines = this.getRoutines().filter(r => r.id !== routineId);
    this.saveRoutines(routines);
    return routines;
  },

  swapExerciseInRoutine(routineId, oldExId, newExId) {
    const routines = this.getRoutines();
    const routine = routines.find(r => r.id === routineId);
    if (!routine) return null;

    const targetIndex = routine.exercises.findIndex(e => e.exerciseId === oldExId);
    if (targetIndex === -1) {
      const flexIdx = routine.exercises.findIndex(e => e.exerciseId?.toLowerCase().includes(oldExId.toLowerCase()) || oldExId.toLowerCase().includes(e.exerciseId?.toLowerCase()));
      if (flexIdx !== -1) {
        routine.exercises[flexIdx].exerciseId = newExId;
        this.saveRoutines(routines);
        return routine;
      }
      return null;
    }

    routine.exercises[targetIndex].exerciseId = newExId;
    this.saveRoutines(routines);
    return routine;
  },

  resetRoutines(splitId = this.getActiveSplitId()) {
    const slug = this.getCurrentUserSlug();
    const splitKey = `${STORAGE_KEYS.ROUTINES}_${slug}_${splitId}`;
    localStorage.removeItem(splitKey);
    if (splitId === 'abc_classico') {
      localStorage.removeItem(`${STORAGE_KEYS.ROUTINES}_${slug}`);
    }
    const split = getSplitById(splitId);
    return JSON.parse(JSON.stringify(split.routines || DEFAULT_ROUTINES));
  },

  // Busca a última carga e repetições reais executadas em qualquer sessão anterior
  getLastExercisePerformance(exerciseId) {
    const history = this.getHistory();
    if (!history || history.length === 0) return null;

    for (const workout of history) {
      if (!Array.isArray(workout.exercises)) continue;
      const ex = workout.exercises.find(e => e.exerciseId === exerciseId);
      if (!ex || !Array.isArray(ex.setsData) || ex.setsData.length === 0) continue;

      const completedSets = ex.setsData.filter(s => s.completed);
      const refSets = completedSets.length > 0 ? completedSets : ex.setsData;
      const lastSet = refSets[refSets.length - 1];
      if (!lastSet) continue;

      return {
        date: workout.date,
        sets: refSets,
        summaryWeight: lastSet.weight,
        summaryReps: lastSet.reps
      };
    }
    return null;
  },

  getChatHistory() {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_oracle_chat_${slug}`;
    try {
      const data = localStorage.getItem(key) || (slug === 'joao' ? localStorage.getItem(STORAGE_KEYS.CHAT_HISTORY) : null);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveChatHistory(messages) {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_oracle_chat_${slug}`;
    try {
      localStorage.setItem(key, JSON.stringify(messages));
      if (slug === 'joao') localStorage.setItem(STORAGE_KEYS.CHAT_HISTORY, JSON.stringify(messages));
    } catch {}
  },

  clearChatHistory() {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_oracle_chat_${slug}`;
    localStorage.removeItem(key);
    if (slug === 'joao') localStorage.removeItem(STORAGE_KEYS.CHAT_HISTORY);
  },

  // Sessões Arquivadas do Oráculo (Histórico de Chats)
  getChatSessions() {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_oracle_sessions_${slug}`;
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveChatSessions(sessions) {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_oracle_sessions_${slug}`;
    try {
      localStorage.setItem(key, JSON.stringify(sessions));
    } catch {}
  },

  archiveCurrentChat(messages) {
    if (!messages || messages.length <= 1) return null;
    const firstUserMsg = messages.find(m => m.sender === 'user');
    let title = firstUserMsg ? firstUserMsg.text.replace(/^[^\wÀ-ÿ]+/, '').trim() : 'Consulta com o Oráculo';
    if (title.length > 45) title = title.substring(0, 45) + '...';

    const sessions = this.getChatSessions();
    const newSession = {
      id: `chat-${Date.now()}`,
      title: title || 'Consulta Cósmica',
      createdAt: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' }) + ' às ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      messages: messages,
      messagesCount: messages.length
    };

    sessions.unshift(newSession);
    this.saveChatSessions(sessions);
    return newSession;
  },

  deleteChatSession(sessionId) {
    const sessions = this.getChatSessions().filter(s => s.id !== sessionId);
    this.saveChatSessions(sessions);
    return sessions;
  },

  clearAllChatSessions() {
    const slug = this.getCurrentUserSlug();
    const key = `agtm_oracle_sessions_${slug}`;
    localStorage.removeItem(key);
  },

  // Cálculo de Streaks e Estatísticas (Estilo GymRats)
  getStats() {
    const history = this.getHistory();
    const totalWorkouts = history.length;
    let totalMinutes = 0;
    let totalVolumeKg = 0;

    // Conjunto de datas únicas no formato YYYY-MM-DD
    const workoutDates = new Set();

    history.forEach(session => {
      totalMinutes += Math.round((session.durationSeconds || 0) / 60);
      totalVolumeKg += session.totalWeightVolume || 0;
      if (session.date) {
        workoutDates.add(session.date);
      }
    });

    // Cálculo de Streak Atual
    const sortedDates = Array.from(workoutDates).sort((a, b) => new Date(b) - new Date(a));
    let currentStreak = 0;
    let bestStreak = 0;

    const toLocalKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const todayStr = toLocalKey(new Date());
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalKey(yesterday);

    // Se treinou hoje ou ontem, o streak está vivo
    if (sortedDates.includes(todayStr) || sortedDates.includes(yesterdayStr)) {
      let checkDate = new Date();
      if (!sortedDates.includes(todayStr)) {
        checkDate = yesterday;
      }

      while (true) {
        const dStr = toLocalKey(checkDate);
        if (sortedDates.includes(dStr)) {
          currentStreak++;
          checkDate.setDate(checkDate.getDate() - 1);
        } else {
          break;
        }
      }
    }

    // Melhor Streak Histórico
    let tempStreak = 0;
    const allAscending = Array.from(workoutDates).sort((a, b) => new Date(a) - new Date(b));
    for (let i = 0; i < allAscending.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prev = new Date(allAscending[i - 1]);
        const curr = new Date(allAscending[i]);
        const diffDays = Math.round((curr - prev) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      }
      if (tempStreak > bestStreak) bestStreak = tempStreak;
    }
    if (currentStreak > bestStreak) bestStreak = currentStreak;

    return {
      totalWorkouts,
      totalMinutes,
      totalVolumeKg,
      currentStreak,
      bestStreak: bestStreak || currentStreak,
      activeDaysSet: workoutDates
    };
  },

  // Carregar Dados Demo apresentação de Portfólio
  loadDemoData() {
    const today = new Date();
    const demoDates = [];
    
    // Gera 12 treinos nos últimos 20 dias para demonstrar o heatmap
    for (let i = 0; i < 20; i++) {
      if (i % 2 === 0 || i === 0 || i === 1) {
        const d = new Date();
        d.setDate(today.getDate() - i);
        demoDates.push(d.toISOString().split('T')[0]);
      }
    }

    const demoHistory = demoDates.map((dateStr, idx) => ({
      id: `demo-${idx}`,
      routineId: idx % 3 === 0 ? 'portal-a' : idx % 3 === 1 ? 'portal-b' : 'portal-c',
      routineTitle: idx % 3 === 0 ? 'Portal Alpha' : idx % 3 === 1 ? 'Portal Beta' : 'Portal Gamma',
      date: dateStr,
      startTime: new Date(dateStr + 'T18:00:00').getTime(),
      endTime: new Date(dateStr + 'T18:50:00').getTime(),
      durationSeconds: 3000,
      totalWeightVolume: 3200 + (idx * 150),
      completedExercisesCount: 4,
      isDemo: true
    }));

    const demoProfile = {
      name: 'João Pedro',
      age: 23,
      weight: 78,
      height: 179,
      goal: 'hipertrofia',
      frequency: 4,
      geminiApiKey: '',
      isOnboarded: true,
      createdAt: new Date().toISOString()
    };

    this.saveProfile(demoProfile);
    this.saveHistory(demoHistory);
  },

  // Backup JSON
  exportData() {
    const data = {
      profile: this.getProfile(),
      history: this.getHistory(),
      exportedAt: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agite-me-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  },

  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) this.saveProfile(data.profile);
      if (data.history) this.saveHistory(data.history);
      return true;
    } catch {
      return false;
    }
  }
};
