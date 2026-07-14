-- ═══════════════════════════════════════════════════════════════
-- 빌리랩 기질검사 — Supabase 스키마 v1
-- 실행: Supabase Dashboard → SQL Editor → 전체 붙여넣기 → Run
-- 전제: anon key는 공개됨. RLS가 유일한 방어선이므로 이 파일의
--       정책을 수정할 때는 반드시 익명 접근 테스트를 다시 할 것.
-- ═══════════════════════════════════════════════════════════════

-- 1) profiles — auth.users 1:1, 가입 시 트리거로 자동 생성
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,                        -- 숫자만 정규화 저장: '01012345678'
  is_admin boolean not null default false,
  is_member boolean not null default false, -- check_membership() 결과 캐시
  member_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into profiles(id) values (new.id);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2) babies — 로컬 SPA의 아기 id('b...')를 client_id로 보존
create table babies (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  client_id text not null,
  name text not null default '',
  birth text not null default '',           -- 'YYYY-MM'(레거시) 또는 'YYYY-MM-DD'
  gender text not null default 'unknown',   -- unknown | boy | girl
  updated_at timestamptz not null default now(),
  unique (user_id, client_id)
);

-- 3) results — 아이/양육/스트레스 결과 통합 (payload = 로컬 객체 원본)
create table results (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null check (kind in ('child','parent','stress')),
  who text not null check (who in ('mom','dad')),
  baby_client_id text,                      -- kind='child'일 때만
  taken_at text not null,
  payload jsonb not null,
  client_key text not null,                 -- kind:who:babyId:takenAt — 멱등 업서트 키
  created_at timestamptz not null default now(),
  unique (user_id, client_key)
);

-- 4) memberships — 보험 가입자 전화번호 명단 (클라이언트 직접 접근 전면 차단)
create table memberships (
  phone text primary key,
  uploaded_at timestamptz not null default now()
);

-- ═══ RLS ═══
alter table profiles enable row level security;
alter table babies enable row level security;
alter table results enable row level security;
alter table memberships enable row level security;  -- 정책 없음 = 전면 차단(RPC 전용)

create policy "own profile read" on profiles
  for select using (id = auth.uid());
create policy "own profile update" on profiles
  for update using (id = auth.uid());
-- is_admin/is_member 위조 방지: 컬럼 단위로 phone만 수정 허용
revoke update on profiles from authenticated;
grant update (phone) on profiles to authenticated;

create policy "own babies" on babies
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "own results" on results
  for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- ═══ RPC ═══

-- 멤버십 대조: 명단을 노출하지 않고 본인 번호 일치 여부만 반환
create function check_membership() returns boolean
language plpgsql security definer set search_path = public as $$
declare p text; ok boolean;
begin
  select phone into p from profiles where id = auth.uid();
  if p is null then return false; end if;
  select exists(select 1 from memberships m where m.phone = p) into ok;
  update profiles set is_member = ok, member_checked_at = now() where id = auth.uid();
  return ok;
end $$;
revoke all on function check_membership() from public, anon;
grant execute on function check_membership() to authenticated;

-- 명단 업로드 (관리자 전용): 숫자만 정규화, 10~11자리만 수용, 중복 무시
create function upload_memberships(phones text[]) returns int
language plpgsql security definer set search_path = public as $$
declare cnt int;
begin
  if not exists(select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'forbidden';
  end if;
  insert into memberships(phone)
    select distinct regexp_replace(p, '[^0-9]', '', 'g')
    from unnest(phones) p
    where length(regexp_replace(p, '[^0-9]', '', 'g')) between 10 and 11
  on conflict do nothing;
  get diagnostics cnt = row_count;
  return cnt;
end $$;
revoke all on function upload_memberships(text[]) from public, anon;
grant execute on function upload_memberships(text[]) to authenticated;

-- 관리자 통계
create function admin_stats() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'forbidden';
  end if;
  return json_build_object(
    'users',        (select count(*) from profiles),
    'members',      (select count(*) from profiles where is_member),
    'roster',       (select count(*) from memberships),
    'babies',       (select count(*) from babies),
    'tests_child',  (select count(*) from results where kind='child'),
    'tests_parent', (select count(*) from results where kind='parent'),
    'tests_stress', (select count(*) from results where kind='stress'));
end $$;
revoke all on function admin_stats() from public, anon;
grant execute on function admin_stats() to authenticated;

-- ═══ 실행 후 수동 1회 ═══
-- 관리자 지정 (본인 카카오 로그인 후 Authentication → Users에서 uid 확인):
--   update profiles set is_admin = true where id = '<본인-uid>';
