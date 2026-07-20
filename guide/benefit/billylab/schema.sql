-- ═══════════════════════════════════════════════════════════════
-- 빌리랩 기질검사 — Supabase 스키마 v2 (가족 모델)
-- 실행: Supabase Dashboard → SQL Editor → 전체 붙여넣기 → Run
-- v2 변경: families(초대 코드) 도입, babies/results를 가족 소유로,
--          멤버십을 가족 단위 판정으로, 관리자 CS 조회 RPC 추가.
-- 전제: anon key는 공개됨. RLS가 유일한 방어선.
-- ═══════════════════════════════════════════════════════════════

-- 0) 초대 코드 생성 (혼동 문자 I/O/0/1 제외 6자리)
create function public.gen_invite_code() returns text
language sql volatile as $$
  select string_agg(substr('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', (floor(random()*32)+1)::int, 1), '')
  from generate_series(1,6);
$$;

-- 1) families — 부부(가족) 단위. 아이·결과·멤버십의 소유 주체
create table families (
  id uuid primary key default gen_random_uuid(),
  invite_code text unique not null default public.gen_invite_code(),
  created_at timestamptz not null default now()
);

-- 2) profiles — auth.users 1:1, 가입 시 트리거로 가족과 함께 자동 생성
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  family_id uuid not null references families(id),
  role text not null default 'mom' check (role in ('mom','dad','other')),
  phone text unique,                        -- 숫자만 정규화: '01012345678'
  is_admin boolean not null default false,
  is_member boolean not null default false, -- check_membership() 캐시 (가족 단위)
  member_checked_at timestamptz,
  created_at timestamptz not null default now()
);

create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare fid uuid;
begin
  insert into families default values returning id into fid;
  insert into profiles(id, family_id) values (new.id, fid);
  return new;
end $$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 현재 사용자의 family_id (RLS에서 반복 사용)
create function public.my_family() returns uuid
language sql stable security definer set search_path = public as $$
  select family_id from profiles where id = auth.uid();
$$;

-- 3) babies — 가족 소유. 로컬 SPA의 아기 id('b...')를 client_id로 보존
create table babies (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  client_id text not null,
  name text not null default '',
  birth text not null default '',           -- 'YYYY-MM'(레거시) 또는 'YYYY-MM-DD'
  gender text not null default 'unknown',   -- unknown | boy | girl
  updated_at timestamptz not null default now(),
  unique (family_id, client_id)
);

-- 4) results — 가족 소유. 아이/양육/스트레스/회복탄력성 통합
create table results (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  user_id uuid references profiles(id),     -- 응답을 올린 계정 (참고용)
  kind text not null check (kind in ('child','parent','stress','resil')),
  who text not null check (who in ('mom','dad')),
  baby_client_id text,                      -- kind='child'일 때만
  taken_at text not null,
  payload jsonb not null,
  client_key text not null,                 -- kind:who:babyId:takenAt — 멱등 업서트 키
  created_at timestamptz not null default now(),
  unique (family_id, client_key)
);

-- 5) memberships — 보험 가입자 전화번호 명단 (직접 접근 전면 차단, RPC 전용)
create table memberships (
  phone text primary key,
  uploaded_at timestamptz not null default now()
);

-- ═══ RLS ═══
alter table families enable row level security;
alter table profiles enable row level security;
alter table babies enable row level security;
alter table results enable row level security;
alter table memberships enable row level security;  -- 정책 없음 = 전면 차단

create policy "own family read" on families
  for select using (id = public.my_family());

create policy "family members read" on profiles
  for select using (family_id = public.my_family());
create policy "own profile update" on profiles
  for update using (id = auth.uid());
-- is_admin/is_member/family_id 위조 방지: phone·role만 직접 수정 허용
revoke update on profiles from authenticated;
grant update (phone, role) on profiles to authenticated;

create policy "family babies" on babies
  for all using (family_id = public.my_family())
  with check (family_id = public.my_family());
create policy "family results" on results
  for all using (family_id = public.my_family())
  with check (family_id = public.my_family());

-- ═══ RPC ═══

-- 가족 합류: 초대 코드로 기존 가족에 합류 (기존 가족이 비어 있으면 정리)
create function join_family(code text) returns boolean
language plpgsql security definer set search_path = public as $$
declare target uuid; old uuid;
begin
  select id into target from families where invite_code = upper(trim(code));
  if target is null then return false; end if;
  select family_id into old from profiles where id = auth.uid();
  if old = target then return true; end if;
  update profiles set family_id = target where id = auth.uid();
  -- 이전 가족에 구성원·아기가 남지 않았으면 삭제
  if not exists(select 1 from profiles where family_id = old)
     and not exists(select 1 from babies where family_id = old) then
    delete from families where id = old;
  end if;
  return true;
end $$;
revoke all on function join_family(text) from public, anon;
grant execute on function join_family(text) to authenticated;

-- 멤버십 대조 (가족 단위): 가족 구성원 중 1명이라도 명단에 있으면 전원 적용
create function check_membership() returns boolean
language plpgsql security definer set search_path = public as $$
declare fid uuid; ok boolean;
begin
  select family_id into fid from profiles where id = auth.uid();
  if fid is null then return false; end if;
  select exists(
    select 1 from profiles pr
    join memberships m on m.phone = pr.phone
    where pr.family_id = fid and pr.phone is not null
  ) into ok;
  update profiles set is_member = ok, member_checked_at = now() where family_id = fid;
  return ok;
end $$;
revoke all on function check_membership() from public, anon;
grant execute on function check_membership() to authenticated;

-- 명단 업로드 (관리자 전용)
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

-- 관리자 CS 조회: 전화번호(뒤 4자리 이상) 또는 초대 코드로 가족 검색
create function admin_lookup(q text) returns json
language plpgsql security definer set search_path = public as $$
declare fid uuid; qn text;
begin
  if not exists(select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'forbidden';
  end if;
  qn := regexp_replace(q, '[^0-9]', '', 'g');
  if length(qn) >= 4 then
    select family_id into fid from profiles where phone like '%'||qn limit 1;
  end if;
  if fid is null then
    select id into fid from families where invite_code = upper(trim(q));
  end if;
  if fid is null then return json_build_object('found', false); end if;
  return json_build_object(
    'found', true,
    'family_id', fid,
    'invite_code', (select invite_code from families where id = fid),
    'members', (select json_agg(json_build_object(
        'role', pr.role,
        'phone_masked', case when pr.phone is null then null
          else substr(pr.phone,1,3)||'****'||substr(pr.phone, length(pr.phone)-3) end,
        'is_member', pr.is_member,
        'joined', to_char(pr.created_at,'YYYY-MM-DD')
      )) from profiles pr where pr.family_id = fid),
    'babies', (select count(*) from babies b where b.family_id = fid),
    'results', (select count(*) from results r where r.family_id = fid));
end $$;
revoke all on function admin_lookup(text) from public, anon;
grant execute on function admin_lookup(text) to authenticated;

-- 관리자: 초대 코드 재발급 (코드 유출·오입력 CS 대응)
create function admin_reset_invite(fid uuid) returns text
language plpgsql security definer set search_path = public as $$
declare nc text;
begin
  if not exists(select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'forbidden';
  end if;
  nc := public.gen_invite_code();
  update families set invite_code = nc where id = fid;
  return nc;
end $$;
revoke all on function admin_reset_invite(uuid) from public, anon;
grant execute on function admin_reset_invite(uuid) to authenticated;

-- 관리자 통계
create function admin_stats() returns json
language plpgsql security definer set search_path = public as $$
begin
  if not exists(select 1 from profiles where id = auth.uid() and is_admin) then
    raise exception 'forbidden';
  end if;
  return json_build_object(
    'users',         (select count(*) from profiles),
    'families',      (select count(*) from families),
    'members',       (select count(*) from profiles where is_member),
    'roster',        (select count(*) from memberships),
    'babies',        (select count(*) from babies),
    'tests_child',   (select count(*) from results where kind='child'),
    'tests_parent',  (select count(*) from results where kind='parent'),
    'tests_stress',  (select count(*) from results where kind='stress'),
    'tests_resil',   (select count(*) from results where kind='resil'));
end $$;
revoke all on function admin_stats() from public, anon;
grant execute on function admin_stats() to authenticated;

-- ═══ 실행 후 수동 1회 ═══
-- 관리자 지정 (본인 카카오 로그인 후 Authentication → Users에서 uid 확인):
--   update profiles set is_admin = true where id = '<본인-uid>';
