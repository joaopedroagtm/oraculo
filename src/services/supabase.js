// Cliente Oficial & Sincronização Supabase 
// Suporte a multi-usuários e autenticação em nuvem.

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL)
  ? import.meta.env.VITE_SUPABASE_URL.trim()
  : 'https://dkuvxvrwcjbfgxwgujim.supabase.co';

const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY)
  ? import.meta.env.VITE_SUPABASE_ANON_KEY.trim()
  : 'sb_publishable_YspjFgiBA4oBq7YkXl0kkA_XV6jKRN8';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
});

export const SupabaseService = {
  client: supabase,

  // Comprimir foto do celular para avatar super leve (~50kb) em Base64
  async compressImageFile(file, maxDimension = 512, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          // Tenta webp primeiro (melhor compressão), fallback para jpeg
          let dataUrl = canvas.toDataURL('image/webp', quality);
          if (!dataUrl.startsWith('data:image/webp')) {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
          resolve(dataUrl);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },

  // Cadastro de Novo User
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name || 'Guerreiro',
            aura_color: metadata.auraColor || '#cbd5e1'
          }
        }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Erro ao cadastrar.' };
    }
  },

  // Login 
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      return { success: false, error: err.message || 'Credenciais inválidas.' };
    }
  },

  // Encerrar Sessão
  async signOut() {
    try {
      await supabase.auth.signOut();
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Sessão Atual
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) return null;
      return session;
    } catch {
      return null;
    }
  },

  // Buscar Perfil no Banco
  async getProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.warn('Erro ao carregar perfil do Supabase:', err);
      return null;
    }
  },

  // Salvar / Atualizar Perfil (Nome, Peso, Altura, Foto, Aura)
  async saveProfile(userId, profileData) {
    try {
      const payload = {
        id: userId,
        name: profileData.name,
        age: profileData.age,
        weight: profileData.weight,
        height: profileData.height,
        goal: profileData.goal,
        frequency: profileData.frequency,
        aura_color: profileData.auraColor || '#cbd5e1',
        avatar_url: profileData.avatarUrl || null,
        gemini_api_key: profileData.geminiApiKey || '',
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao salvar perfil no Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Buscar Histórico de Treinos do Usuário
  async getWorkouts(userId) {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false });

      if (error) throw error;
      return data.map(item => ({
        id: item.id,
        routineId: item.routine_id,
        routineTitle: item.routine_title,
        date: item.date,
        startTime: item.start_time,
        endTime: item.end_time,
        durationSeconds: item.duration_seconds,
        totalWeightVolume: item.total_weight_volume,
        completedExercisesCount: item.completed_exercises_count
      }));
    } catch (err) {
      console.warn('Erro ao buscar treinos do Supabase:', err);
      return [];
    }
  },

  // Salvar Sessão Concluída no Banco
  async addWorkout(userId, workout) {
    try {
      const payload = {
        id: workout.id,
        user_id: userId,
        routine_id: workout.routineId,
        routine_title: workout.routineTitle,
        date: workout.date,
        start_time: workout.startTime,
        end_time: workout.endTime,
        duration_seconds: workout.durationSeconds,
        total_weight_volume: workout.totalWeightVolume,
        completed_exercises_count: workout.completedExercisesCount
      };

      const { data, error } = await supabase
        .from('workouts')
        .insert(payload)
        .select()
        .single();

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.error('Erro ao salvar treino no Supabase:', err);
      return { success: false, error: err.message };
    }
  },

  // Buscar Conversas do Oráculo
  async getChatHistory(userId) {
    try {
      const { data, error } = await supabase
        .from('oracle_chat')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return (data || []).map(msg => ({
        id: msg.id,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp,
        source: msg.source
      }));
    } catch (err) {
      console.warn('Erro ao carregar chat do Supabase:', err);
      return [];
    }
  },

  // Salvar Mensagem do Oráculo no Banco
  async addChatMessage(userId, msg) {
    try {
      const payload = {
        id: msg.id || 'msg-' + Date.now(),
        user_id: userId,
        sender: msg.sender,
        text: msg.text,
        timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: msg.source || 'local'
      };

      const { data, error } = await supabase
        .from('oracle_chat')
        .insert(payload);

      if (error) throw error;
      return { success: true, data };
    } catch (err) {
      console.warn('Erro ao salvar mensagem no Supabase:', err);
      return { success: false };
    }
  },

  // Limpar Conversas do Oráculo
  async clearChatHistory(userId) {
    try {
      const { error } = await supabase
        .from('oracle_chat')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
