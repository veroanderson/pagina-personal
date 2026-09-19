-- Reset only the failed-attempt bucket after a successful login.
-- This keeps the rate limiter persistent without storing raw client addresses.
create or replace function public.reset_rate_limit(
  p_scope text,
  p_subject_hash text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_scope is null or p_scope = ''
     or p_subject_hash is null or p_subject_hash = '' then
    raise exception 'Invalid rate-limit parameters';
  end if;

  update public.rate_limit_buckets
  set window_started_at = now(),
      request_count = 0
  where scope = p_scope
    and subject_hash = p_subject_hash;
end;
$$;

revoke all on function public.reset_rate_limit(text, text) from public, anon, authenticated;
grant execute on function public.reset_rate_limit(text, text) to service_role;
