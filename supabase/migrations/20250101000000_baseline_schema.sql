-- =====================================================================
-- ReelMates baseline schema.
-- Reconstructed from the application's types/migrations and hardened for:
--   * public-room discovery with protected private rooms
--   * automatic room_settings + owner membership creation
--   * backend-only notification creation
-- This migration is intended for a new/empty Supabase project.
-- =====================================================================

-- ---------- Helper: updated_at trigger ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,                                   -- GUESS: unique
  avatar_url text,
  onboarding_completed boolean default false,
  two_factor_enabled boolean default false,
  profile_visibility text default 'public'
    check (profile_visibility in ('public', 'friends', 'private')),
  movie_list_visibility text default 'public'
    check (movie_list_visibility in ('public', 'friends', 'private')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Create a profile row whenever a user signs up  (GUESS: username from metadata)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- user_followers ----------
create table public.user_followers (
  id uuid primary key default gen_random_uuid(),
  follower_id uuid not null references auth.users(id) on delete cascade,
  following_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (follower_id, following_id),
  check (follower_id <> following_id)
);
create index on public.user_followers (following_id);

-- ---------- user_movies ----------
create table public.user_movies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  movie_id integer not null,
  media_type text default 'movie',
  status text not null,
  rating numeric,                                         -- GUESS: numeric vs int
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index on public.user_movies (user_id);
-- GUESS: if the app upserts on (user_id, movie_id), add a unique constraint:
-- alter table public.user_movies add unique (user_id, movie_id);

create trigger user_movies_updated_at before update on public.user_movies
  for each row execute function public.set_updated_at();

-- ---------- notifications ----------
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  message text not null,
  entity_id text,                                         -- GUESS: text (types.ts says string)
  read boolean default false,
  created_at timestamptz not null default now()
);
create index on public.notifications (user_id, created_at desc);

-- ---------- rooms ----------
create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  code text not null unique,
  created_by uuid not null references auth.users(id) on delete cascade,
  profile_icon text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger rooms_updated_at before update on public.rooms
  for each row execute function public.set_updated_at();

-- ---------- room_members ----------
create table public.room_members (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member'
    check (role in ('owner', 'admin', 'member')),
  joined_at timestamptz default now(),
  unique (room_id, user_id)
);
create index on public.room_members (user_id);

-- ---------- room_settings ----------
create table public.room_settings (
  room_id uuid primary key references public.rooms(id) on delete cascade,
  private boolean default false,
  allow_member_movie_add boolean default true,
  require_movie_approval boolean default false,
  theme text default 'default',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger room_settings_updated_at before update on public.room_settings
  for each row execute function public.set_updated_at();

-- Room creation is completed transactionally by this trigger:
-- every room gets settings and an owner membership automatically.
create or replace function public.handle_new_room()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.room_settings (room_id)
  values (new.id)
  on conflict (room_id) do nothing;

  insert into public.room_members (room_id, user_id, role)
  values (new.id, new.created_by, 'owner')
  on conflict (room_id, user_id) do update
    set role = 'owner';

  return new;
end;
$$;

create trigger on_room_created
  after insert on public.rooms
  for each row execute function public.handle_new_room();

-- ---------- room_join_requests ----------
create table public.room_join_requests (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  message text,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);
create index on public.room_join_requests (room_id);

-- ---------- room_media ----------
create table public.room_media (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  media_id integer not null,
  media_type text not null default 'movie',
  title text,
  poster_path text,
  category text,
  notes text,
  status text not null default 'approved'
    check (status in ('pending', 'approved', 'rejected')),
  added_by uuid not null references auth.users(id) on delete cascade,
  tagged_member_id uuid references auth.users(id) on delete set null,
  votes integer default 0,
  reactions jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index on public.room_media (room_id);

-- ---------- messages ----------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamptz default now()
);
create index on public.messages (room_id, created_at);

-- =====================================================================
-- RLS helper functions (security definer so policies don't recurse)
-- =====================================================================
create or replace function public.is_following(_follower uuid, _following uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.user_followers
    where follower_id = _follower and following_id = _following
  );
$$;

create or replace function public.can_view_profile(_owner uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() = _owner
    or exists (
      select 1 from public.profiles p
      where p.id = _owner
        and (
          p.profile_visibility = 'public'
          or (p.profile_visibility = 'friends'
              and public.is_following(auth.uid(), _owner))
        )
    );
$$;

create or replace function public.can_view_movie_list(_owner uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select auth.uid() = _owner
    or exists (
      select 1 from public.profiles p
      where p.id = _owner
        and (
          p.movie_list_visibility = 'public'
          or (p.movie_list_visibility = 'friends'
              and public.is_following(auth.uid(), _owner))
        )
    );
$$;

create or replace function public.is_room_member(_room uuid, _user uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.room_members where room_id = _room and user_id = _user)
      or exists (select 1 from public.rooms where id = _room and created_by = _user);
$$;

create or replace function public.is_room_admin(_room uuid, _user uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
           select 1 from public.room_members
           where room_id = _room and user_id = _user and role in ('owner', 'admin')
         )
      or exists (select 1 from public.rooms where id = _room and created_by = _user);
$$;

create or replace function public.is_public_room(_room uuid)
returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select not private from public.room_settings where room_id = _room),
    false
  );
$$;

-- Exact-code lookup is intentionally separate from ordinary room discovery.
-- Public rooms are enumerable through SELECT. Private rooms are not.
-- A private room can still be resolved when a user knows its exact join code,
-- which gives the application enough information to submit a join request.
create or replace function public.get_room_by_code(_code text)
returns setof public.rooms
language sql stable security definer set search_path = public as $$
  select r.*
  from public.rooms r
  where auth.uid() is not null
    and r.code = _code;
$$;

revoke all on function public.get_room_by_code(text) from public, anon;
grant execute on function public.get_room_by_code(text) to authenticated;

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles            enable row level security;
alter table public.user_followers      enable row level security;
alter table public.user_movies         enable row level security;
alter table public.notifications       enable row level security;
alter table public.rooms               enable row level security;
alter table public.room_members        enable row level security;
alter table public.room_settings       enable row level security;
alter table public.room_join_requests  enable row level security;
alter table public.room_media          enable row level security;
alter table public.messages            enable row level security;

-- profiles
create policy "Profiles viewable per visibility" on public.profiles
  for select using (public.can_view_profile(id));
create policy "Users insert own profile" on public.profiles
  for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles
  for update using (auth.uid() = id);

-- user_followers
create policy "Authenticated can view follows" on public.user_followers
  for select to authenticated using (true);
create policy "Users follow as themselves" on public.user_followers
  for insert to authenticated with check (auth.uid() = follower_id);
create policy "Users unfollow as themselves" on public.user_followers
  for delete to authenticated using (auth.uid() = follower_id);

-- user_movies
create policy "Users manage own movie lists" on public.user_movies
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "View movie lists per visibility" on public.user_movies
  for select using (public.can_view_movie_list(user_id));

-- notifications
create policy "Users view own notifications" on public.notifications
  for select using (auth.uid() = user_id);
-- Clients cannot insert arbitrary notifications. Trusted backend code should
-- call create_notification() using the service_role database role.
create policy "Users update own notifications" on public.notifications
  for update using (auth.uid() = user_id);
create policy "Users delete own notifications" on public.notifications
  for delete using (auth.uid() = user_id);

create or replace function public.create_notification(
  _user_id uuid,
  _type text,
  _title text,
  _message text,
  _entity_id text default null
)
returns public.notifications
language plpgsql
security definer
set search_path = public
as $$
declare
  created_notification public.notifications;
begin
  insert into public.notifications (user_id, type, title, message, entity_id)
  values (_user_id, _type, _title, _message, _entity_id)
  returning * into created_notification;

  return created_notification;
end;
$$;

revoke all on function public.create_notification(uuid, text, text, text, text)
  from public, anon, authenticated;
grant execute on function public.create_notification(uuid, text, text, text, text)
  to service_role;

-- rooms
-- Public rooms are discoverable. Private rooms are visible only to their
-- creator or current members. Private rooms can still be resolved by their
-- exact code through get_room_by_code().
create policy "Users can discover public rooms or their private rooms" on public.rooms
  for select to authenticated using (
    public.is_public_room(id)
    or created_by = auth.uid()
    or public.is_room_member(id, auth.uid())
  );
create policy "Users create rooms as themselves" on public.rooms
  for insert to authenticated with check (auth.uid() = created_by);
create policy "Room admins update rooms" on public.rooms
  for update using (public.is_room_admin(id, auth.uid()));
create policy "Room creator deletes room" on public.rooms
  for delete using (auth.uid() = created_by);

-- room_members
create policy "Members view room members" on public.room_members
  for select using (public.is_room_member(room_id, auth.uid()));
create policy "Join room or admin adds member" on public.room_members
  for insert to authenticated with check (
    public.is_room_admin(room_id, auth.uid())
    or (
      auth.uid() = user_id
      and (
        exists (select 1 from public.rooms r where r.id = room_id and r.created_by = auth.uid())
        or not coalesce((select s.private from public.room_settings s where s.room_id = room_members.room_id), false)
      )
    )
  );
create policy "Admins update members" on public.room_members
  for update using (public.is_room_admin(room_id, auth.uid()));
create policy "Leave room or admin removes" on public.room_members
  for delete using (auth.uid() = user_id or public.is_room_admin(room_id, auth.uid()));

-- room_settings
create policy "Members view room settings" on public.room_settings
  for select to authenticated using (
    public.is_public_room(room_id)
    or public.is_room_member(room_id, auth.uid())
    or exists (
      select 1 from public.rooms r
      where r.id = room_id and r.created_by = auth.uid()
    )
  );
-- Creation is handled by handle_new_room(); clients do not insert settings.
create policy "Admins update room settings" on public.room_settings
  for update to authenticated using (public.is_room_admin(room_id, auth.uid()))
  with check (public.is_room_admin(room_id, auth.uid()));

-- room_join_requests
create policy "View own or managed join requests" on public.room_join_requests
  for select using (auth.uid() = user_id or public.is_room_admin(room_id, auth.uid()));
create policy "Users request to join" on public.room_join_requests
  for insert to authenticated with check (auth.uid() = user_id);
create policy "Admins review join requests" on public.room_join_requests
  for update using (public.is_room_admin(room_id, auth.uid()));
create policy "Cancel own or admin removes request" on public.room_join_requests
  for delete using (auth.uid() = user_id or public.is_room_admin(room_id, auth.uid()));

-- room_media
create policy "Members view room media" on public.room_media
  for select using (public.is_room_member(room_id, auth.uid()));
create policy "Members add room media" on public.room_media
  for insert to authenticated with check (
    auth.uid() = added_by and public.is_room_member(room_id, auth.uid())
  );
create policy "Members update room media" on public.room_media   -- votes / reactions
  for update using (public.is_room_member(room_id, auth.uid()));
create policy "Adder or admin deletes room media" on public.room_media
  for delete using (auth.uid() = added_by or public.is_room_admin(room_id, auth.uid()));

-- messages
create policy "Members view messages" on public.messages
  for select using (public.is_room_member(room_id, auth.uid()));
create policy "Members send messages" on public.messages
  for insert to authenticated with check (
    auth.uid() = user_id and public.is_room_member(room_id, auth.uid())
  );
create policy "Users delete own messages" on public.messages
  for delete using (auth.uid() = user_id);

-- =====================================================================
-- Storage buckets + policies
-- (RLS is already enabled on storage.objects by Supabase)
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true),
       ('room-profile-pics', 'room-profile-pics', true)
on conflict (id) do nothing;

create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "Users can upload their own avatar" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "Users can update their own avatar" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
create policy "Users can delete their own avatar" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Room profile pics are publicly accessible" on storage.objects
  for select using (bucket_id = 'room-profile-pics');
create policy "Authenticated users can upload room profile pics" on storage.objects
  for insert to authenticated with check (bucket_id = 'room-profile-pics');
create policy "Uploaders can update room profile pics" on storage.objects
  for update to authenticated using (
    bucket_id = 'room-profile-pics' and owner_id = auth.uid()::text
  );
create policy "Uploaders can delete room profile pics" on storage.objects
  for delete to authenticated using (
    bucket_id = 'room-profile-pics' and owner_id = auth.uid()::text
  );

-- =====================================================================
-- Realtime (GUESS: chat, notifications, and room activity are live)
-- =====================================================================
alter publication supabase_realtime add table
  public.messages,
  public.notifications,
  public.room_media,
  public.room_members,
  public.room_join_requests;
