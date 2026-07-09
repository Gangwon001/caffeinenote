alter table blog_posts
  add column category text check (
    category in ('카페인', '수면', '건강', '라이프스타일', '리뷰', '가이드')
  ),
  add column view_count integer not null default 0;

-- Narrowly-scoped RPC so anonymous readers can bump view_count without
-- broader write access to blog_posts (writes stay admin-only via RLS).
create function public.increment_blog_view(post_slug text)
returns void
language sql
security definer
set search_path = public
as $$
  update blog_posts
  set view_count = view_count + 1
  where slug = post_slug and status = 'published';
$$;

grant execute on function public.increment_blog_view(text) to anon, authenticated;
