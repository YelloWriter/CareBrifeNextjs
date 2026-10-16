-- FAQ content only. Do not store health information, reports, or personal data.

create schema if not exists private;

create or replace function private.set_faqs_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function private.set_faqs_updated_at() from public, anon, authenticated;
grant execute on function private.set_faqs_updated_at() to service_role;

create table public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null,
  is_published boolean not null default true,
  attachment_path text,
  attachment_name text,
  attachment_mime_type text,
  attachment_size integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint faqs_question_not_empty check (char_length(btrim(question)) > 0),
  constraint faqs_answer_not_empty check (char_length(btrim(answer)) > 0),
  constraint faqs_sort_order_non_negative check (sort_order >= 0),
  constraint faqs_attachment_size_non_negative check (
    attachment_size is null or attachment_size >= 0
  )
);

create index faqs_published_order_idx
  on public.faqs (sort_order asc, created_at asc);

create index faqs_updated_at_idx
  on public.faqs (updated_at desc);

create trigger faqs_set_updated_at
  before update on public.faqs
  for each row
  execute function private.set_faqs_updated_at();

alter table public.faqs enable row level security;

revoke all on table public.faqs from anon, authenticated;
grant select on table public.faqs to anon, authenticated;

create policy faqs_public_read_published
  on public.faqs
  for select
  to anon, authenticated
  using (is_published = true);

insert into public.faqs (
  question,
  answer,
  sort_order,
  is_published,
  created_at,
  updated_at
)
values
  (
    $$진료한장은 병을 진단해주는 서비스인가요?$$,
    $$아니요, 진료한장은 진단이나 처방을 해주는 곳은 아니에요. 부모님이 병원에서 전해야 할 증상과 복용약, 궁금한 내용을 미리 쉽게 정리하도록 돕는 서비스랍니다.$$,
    1,
    true,
    timestamptz '2026-10-16 00:00:01+00',
    timestamptz '2026-10-16 00:00:01+00'
  ),
  (
    $$부모님이 직접 사용해야 하나요?$$,
    $$부모님이 직접 말씀하실 수도 있고, 자녀가 대신 입력하거나 함께 내용을 확인할 수도 있어요. 편하신 방법을 선택하시면 된답니다.$$,
    2,
    true,
    timestamptz '2026-10-16 00:00:02+00',
    timestamptz '2026-10-16 00:00:02+00'
  ),
  (
    $$부모님의 건강정보를 입력해도 괜찮을까요?$$,
    $$현재 체험판에서는 입력한 내용이 서버에 저장되지 않아요. 리포트와 AI 정리는 사용 중인 브라우저 안에서 처리되며, 화면을 새로고침하면 입력 내용이 사라져요. 실제 출시 서비스의 저장과 공유 방식은 개인정보와 건강정보를 안전하게 관리할 수 있도록 법률 검토와 테스트 결과를 반영해 설계할 예정이에요.$$,
    3,
    true,
    timestamptz '2026-10-16 00:00:03+00',
    timestamptz '2026-10-16 00:00:03+00'
  ),
  (
    $$서비스는 언제 사용할 수 있나요?$$,
    $$지금 이 페이지에서 체험판을 사용해볼 수 있어요. 정식 서비스는 부모님 진료를 챙기시는 자녀분들의 진짜 불편함과 생생한 경험을 듣고, 베타테스터분들의 의견을 충분히 반영해 꼭 필요한 기능과 출시 시기를 결정할 예정이에요.$$,
    4,
    true,
    timestamptz '2026-10-16 00:00:04+00',
    timestamptz '2026-10-16 00:00:04+00'
  ),
  (
    $$부모님의 병명이나 자세한 건강정보를 입력해야 하나요?$$,
    $$베타테스터 신청 단계에서는 구체적인 병명이나 진료기록을 입력하지 않으셔도 돼요. 부모님의 병원 방문 빈도와 평소 진료를 어떻게 챙기고 계신지 정도만 간단히 여쭤보고 있어요.$$,
    5,
    true,
    timestamptz '2026-10-16 00:00:05+00',
    timestamptz '2026-10-16 00:00:05+00'
  ),
  (
    $$신청하면 꼭 베타테스트에 참여해야 하나요?$$,
    $$아니요, 부담 갖지 않으셔도 괜찮아요. 신청해주시면 일정과 참여 방법을 먼저 안내해 드릴 테니, 내용을 천천히 확인하시고 편하게 결정해 주세요.$$,
    6,
    true,
    timestamptz '2026-10-16 00:00:06+00',
    timestamptz '2026-10-16 00:00:06+00'
  ),
  (
    $$서비스 이용료가 있나요?$$,
    $$지금은 서비스가 정말 필요한지, 어떻게 쓰면 편할지 확인하는 베타테스트 단계라서 정식 서비스의 요금이나 결제 방식은 아직 정해지지 않았어요. 현재 체험판과 베타테스터 신청은 무료이며 결제가 진행되지 않아요.$$,
    7,
    true,
    timestamptz '2026-10-16 00:00:07+00',
    timestamptz '2026-10-16 00:00:07+00'
  ),
  (
    $$부모님과 함께 살지 않아도 사용할 수 있나요?$$,
    $$네, 맞아요. 부모님과 따로 살면서 전화나 카카오톡으로 마음 졸이며 진료를 챙기고 계신 자녀분들을 가장 먼저 생각하며 만들고 있답니다.$$,
    8,
    true,
    timestamptz '2026-10-16 00:00:08+00',
    timestamptz '2026-10-16 00:00:08+00'
  );

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'faq-attachments',
  'faq-attachments',
  false,
  2097152,
  array['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update
set
  public = false,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;
