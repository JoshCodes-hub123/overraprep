create table public.school_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null,
  school_name text not null,
  state text,
  created_at timestamp with time zone not null default now()
);
alter table public.school_requests enable row level security;
create policy "Users can request a school" on public.school_requests for insert with check (auth.uid() = requested_by);
create policy "Users can view their own requests" on public.school_requests for select using (auth.uid() = requested_by);
create policy "Admins can view all school requests" on public.school_requests for select using (has_role(auth.uid(), 'admin'::app_role));