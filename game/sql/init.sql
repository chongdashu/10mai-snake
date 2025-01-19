-- Enable the required extensions
create extension if not exists "uuid-ossp";

-- Drop existing objects to avoid conflicts
drop materialized view if exists public.top_scores;
drop view if exists public.leaderboard;
drop table if exists public.scores;
drop table if exists public.players;

-- Create tables
create table if not exists public.players (
    id uuid primary key default uuid_generate_v4(),
    display_name text not null,
    auth_type text not null check (auth_type in ('guest', 'google')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_seen_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table if not exists public.scores (
    id uuid primary key default uuid_generate_v4(),
    player_id uuid references public.players(id) not null,
    score integer not null check (score >= 0),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create view for leaderboard
create or replace view public.leaderboard as
select distinct on (p.id)
    p.display_name,
    p.auth_type,
    s.score,
    s.created_at
from public.players p
join public.scores s on s.player_id = p.id
order by p.id, s.score desc;

-- Create view for top 10 scores
create materialized view public.top_scores as
select
    p.display_name,
    p.auth_type,
    max(s.score) as high_score,
    max(s.created_at) as last_achieved_at
from public.players p
join public.scores s on s.player_id = p.id
group by p.id, p.display_name, p.auth_type
order by max(s.score) desc
limit 10;

-- Create unique index for concurrent refresh
create unique index top_scores_unique_idx on public.top_scores (display_name);

-- Create function to refresh materialized view
create or replace function refresh_materialized_view(view_name text)
returns void as $$
begin
  execute format('refresh materialized view concurrently %I', view_name);
end;
$$ language plpgsql security definer;

-- Enable RLS
alter table public.players enable row level security;
alter table public.scores enable row level security;

-- Drop existing policies
drop policy if exists "Allow guests to create players" on public.players;
drop policy if exists "Allow guests to read players" on public.players;
drop policy if exists "Allow guests to update their own player" on public.players;
drop policy if exists "Allow guests to insert scores" on public.scores;
drop policy if exists "Allow guests to read all scores" on public.scores;

-- Create policies for guest access
create policy "Allow guests to create players"
    on public.players for insert
    to anon, authenticated
    with check (auth_type = 'guest');

create policy "Allow guests to read players"
    on public.players for select
    to anon, authenticated
    using (true);

create policy "Allow guests to update their own player"
    on public.players for update
    to anon, authenticated
    using (auth_type = 'guest');

create policy "Allow guests to insert scores"
    on public.scores for insert
    to anon, authenticated
    with check (exists (
        select 1 from public.players
        where id = player_id
        and auth_type = 'guest'
    ));

create policy "Allow guests to read all scores"
    on public.scores for select
    to anon, authenticated
    using (true);

-- Grant necessary permissions
grant usage on schema public to anon, authenticated;
grant select on public.leaderboard to anon, authenticated;
grant select on public.top_scores to anon, authenticated;
grant all on public.players to anon, authenticated;
grant all on public.scores to anon, authenticated;
grant execute on function refresh_materialized_view to anon, authenticated;

-- Set up Row Level Security (RLS)

-- Set up policies

-- Grant access to the public role

-- Grant permissions

-- Grant sequence permissions if any

-- Enable realtime subscriptions

-- Functions

-- Triggers
