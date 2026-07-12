// Supabase/PostgREST caps unbounded selects at 1000 rows by default. The
// drinks catalog crossed that threshold, which was silently truncating
// results (missing items, incomplete size/brand lists) with no error. This
// pages through `.range()` until every row is retrieved.
export async function fetchAllRows<T>(
  queryBuilder: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>,
): Promise<T[]> {
  const PAGE_SIZE = 1000;
  const all: T[] = [];
  let from = 0;

  while (true) {
    const { data, error } = await queryBuilder(from, from + PAGE_SIZE - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    all.push(...data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  return all;
}
