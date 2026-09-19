-- =========================================================
-- BADGES MULTIPLES PAR EXPERT (v2, sûr à rejouer) — Supabase SQL Editor
-- Ce script fonctionne quel que soit l'état actuel de votre base :
-- il crée ce qui manque sans rien casser si une partie existe déjà.
-- =========================================================

-- 1. Crée la table si elle n'existe pas encore
create table if not exists expert_badges (
  id uuid primary key default gen_random_uuid(),
  expert_id uuid references experts(id) on delete cascade not null,
  titre text not null,
  badge_url text not null,
  ordre integer default 0,
  date_creation timestamp with time zone default now()
);

alter table expert_badges enable row level security;

-- 2. Policies (ignorées si elles existent déjà)
do $$
begin
  if not exists (select 1 from pg_policies where tablename = 'expert_badges' and policyname = 'Badges visibles par tous') then
    create policy "Badges visibles par tous" on expert_badges for select using (true);
  end if;

  if not exists (select 1 from pg_policies where tablename = 'expert_badges' and policyname = 'Admins créent des badges') then
    create policy "Admins créent des badges" on expert_badges for insert
      with check (exists (select 1 from admins where user_id = auth.uid()));
  end if;

  if not exists (select 1 from pg_policies where tablename = 'expert_badges' and policyname = 'Admins suppriment des badges') then
    create policy "Admins suppriment des badges" on expert_badges for delete
      using (exists (select 1 from admins where user_id = auth.uid()));
  end if;
end $$;

-- 3. Récupère l'ancien badge unique s'il existe encore (ne fait rien sinon)
do $$
begin
  if exists (select 1 from information_schema.columns where table_name = 'experts' and column_name = 'badge_url') then
    insert into expert_badges (expert_id, titre, badge_url)
      select id, 'Certification', badge_url from experts where badge_url is not null;

    alter table experts drop column badge_url;
  end if;
end $$;
