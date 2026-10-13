-- =================================================================
-- AGiTe-Me! • Esquema de Banco de Dados do Templo Cósmico (Supabase)
-- Execute este script no SQL Editor do Supabase (supabase.com)
-- =================================================================

-- 1. Habilita extensões úteis
create extension if not exists "uuid-ossp";

-- 2. Tabela de Perfis dos Guerreiros (João Pedro & Marco)
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  name text default 'Viajante Cósmico',
  age integer default 24,
  weight numeric default 75,
  height numeric default 178,
  goal text default 'hipertrofia',
  frequency integer default 4,
  aura_color text default '#38bdf8',
  avatar_url text, -- Foto de perfil real do celular (Base64 ou URL)
  gemini_api_key text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Histórico de Treinos
create table if not exists public.workouts (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  routine_id text not null,
  routine_title text not null,
  date text not null,
  start_time bigint,
  end_time bigint,
  duration_seconds integer default 0,
  total_weight_volume numeric default 0,
  completed_exercises_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Conversas com o Oráculo (IA)
create table if not exists public.oracle_chat (
  id text primary key,
  user_id uuid references auth.users on delete cascade not null,
  sender text not null check (sender in ('user', 'oracle')),
  text text not null,
  timestamp text,
  source text default 'local',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Habilita Row Level Security (RLS) para proteger os dados de cada um
alter table public.profiles enable row level security;
alter table public.workouts enable row level security;
alter table public.oracle_chat enable row level security;

-- Políticas de segurança: Cada usuário só enxerga e edita seus próprios dados
drop policy if exists "Perfis são visíveis pelo próprio usuário" on public.profiles;
create policy "Perfis são visíveis pelo próprio usuário"
  on public.profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Treinos são gerenciados pelo próprio usuário" on public.workouts;
create policy "Treinos são gerenciados pelo próprio usuário"
  on public.workouts for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Mensagens do oráculo são gerenciadas pelo próprio usuário" on public.oracle_chat;
create policy "Mensagens do oráculo são gerenciadas pelo próprio usuário"
  on public.oracle_chat for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Trigger automático para criar perfil ao cadastrar usuário
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, name, aura_color)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', 'Guerreiro Cósmico'),
    coalesce(new.raw_user_meta_data->>'aura_color', '#38bdf8')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
