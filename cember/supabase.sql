-- FLIX Çember: Supabase setup. Paste all of it into Dashboard > SQL Editor > New query and press Run.
-- Safe to run again (it only creates what is missing and replaces functions, policies and the view).
--
-- What it makes:
--   profiles     one row per player (id = auth.uid() of the anonymous sign-in): name 2-16 chars, look (jsonb)
--   scores       one row per player and mode, keeps only the best: best (longest rally) and score only ever go up
--   leaderboard  view: scores joined with the player's name and look, for "top N per mode"
--   submit_score rpc the game calls after every run; raises the row, never lowers it
-- Security: Row Level Security on both tables. Everybody (anon and signed in) may read; a signed-in player may
-- insert/update only their own rows; nobody may delete. Online rooms use Realtime broadcast + presence on public
-- channels named 'flix-room-<CODE>'; they need no table.

-- ---------- tables ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null,
  look jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  constraint profiles_name_check check (char_length(btrim(name)) between 2 and 16 and name !~ '[<>\x01-\x1f\x7f]'),
  constraint profiles_look_check check (jsonb_typeof(look) = 'object' and pg_column_size(look) <= 512)
);

create table if not exists public.scores (
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null,
  best integer not null default 0,
  score integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (user_id, mode),
  constraint scores_mode_check check (mode in ('free', 'target', 'solo', 'online')),
  constraint scores_best_check check (best between 0 and 100000),
  constraint scores_score_check check (score between 0 and 100000000)
);

-- top N per mode: best first, then score
create index if not exists scores_mode_best_idx on public.scores (mode, best desc, score desc);

-- ---------- keep records monotonic, stamp updated_at ----------
create or replace function public.scores_keep_best() returns trigger
language plpgsql set search_path = '' as $$
begin
  if tg_op = 'UPDATE' then
    new.user_id := old.user_id;            -- the key never moves
    new.mode := old.mode;
    new.best := greatest(old.best, new.best);
    new.score := greatest(old.score, new.score);
  end if;
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists scores_keep_best on public.scores;
create trigger scores_keep_best before insert or update on public.scores
  for each row execute function public.scores_keep_best();

create or replace function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists profiles_touch on public.profiles;
create trigger profiles_touch before insert or update on public.profiles
  for each row execute function public.touch_updated_at();

-- ---------- row level security ----------
alter table public.profiles enable row level security;
alter table public.scores enable row level security;

drop policy if exists "profiles: anyone reads" on public.profiles;
drop policy if exists "profiles: own insert" on public.profiles;
drop policy if exists "profiles: own update" on public.profiles;
create policy "profiles: anyone reads" on public.profiles for select to anon, authenticated using (true);
create policy "profiles: own insert" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);
create policy "profiles: own update" on public.profiles for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

drop policy if exists "scores: anyone reads" on public.scores;
drop policy if exists "scores: own insert" on public.scores;
drop policy if exists "scores: own update" on public.scores;
create policy "scores: anyone reads" on public.scores for select to anon, authenticated using (true);
create policy "scores: own insert" on public.scores for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "scores: own update" on public.scores for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

-- no delete policy = no deletes; also take the privileges away (truncate is not covered by RLS)
revoke delete, truncate on public.profiles, public.scores from anon, authenticated;
grant select on public.profiles, public.scores to anon, authenticated;
grant insert, update on public.profiles, public.scores to authenticated;

-- ---------- leaderboard view (runs with the caller's rights, so the RLS above applies) ----------
create or replace view public.leaderboard with (security_invoker = true) as
  select s.user_id as id, p.name, p.look, s.mode, s.best, s.score, s.updated_at as at
  from public.scores s
  join public.profiles p on p.id = s.user_id
  where s.best > 0 or s.score > 0;
grant select on public.leaderboard to anon, authenticated;
-- top 10 of a mode: select * from leaderboard where mode = 'solo' order by best desc, score desc limit 10;

-- ---------- submit_score: one call after every run ----------
-- security definer so it works the same whatever the table grants are; it only ever touches the caller's own row.
create or replace function public.submit_score(p_mode text, p_best integer, p_score integer)
returns public.scores
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := auth.uid();
  r public.scores;
begin
  if uid is null then raise exception 'not signed in' using errcode = '42501'; end if;
  if p_mode not in ('free', 'target', 'solo', 'online') then raise exception 'bad mode %', p_mode using errcode = '22023'; end if;
  insert into public.scores as s (user_id, mode, best, score)
  values (uid, p_mode, least(greatest(coalesce(p_best, 0), 0), 100000), least(greatest(coalesce(p_score, 0), 0), 100000000))
  on conflict (user_id, mode) do update
    set best = greatest(s.best, excluded.best), score = greatest(s.score, excluded.score)
    where excluded.best > s.best or excluded.score > s.score
  returning * into r;
  if r.user_id is null then select * into r from public.scores where user_id = uid and mode = p_mode; end if;
  return r;
end $$;
revoke all on function public.submit_score(text, integer, integer) from public, anon;
grant execute on function public.submit_score(text, integer, integer) to authenticated;

-- ---------- realtime: live leaderboard updates ----------
-- (rooms use broadcast + presence and need nothing here)
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'scores') then
    alter publication supabase_realtime add table public.scores;
  end if;
end $$;
