// Small hand-rolled data-fetching hooks — the codebase has no query library,
// so these provide the loading/error/data/refetch shape every Connect page needs.

import { useCallback, useEffect, useRef, useState } from 'react';

// fetcher: () => Promise<data>. Re-runs whenever `deps` changes.
export function useApiQuery(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const refetch = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    fetcher()
      .then((result) => {
        if (id !== requestId.current) return;
        setData(result);
        setLoading(false);
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(err);
        setLoading(false);
      });
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}

const DEFAULT_PAGE = { items: [], total: 0, page: 1, limit: 20, totalPages: 1 };

// macropage-connect's paginated endpoints aren't consistent about the field
// name for the list (items/results/docs/logs/data) or return a bare array
// with no pagination metadata at all — normalize whatever comes back into
// the shape every page expects instead of trusting one field name.
function normalizePage(result, params) {
  if (Array.isArray(result)) {
    return { items: result, total: result.length, page: 1, limit: result.length || 1, totalPages: 1 };
  }
  if (!result || typeof result !== 'object') return DEFAULT_PAGE;

  const items = result.items ?? result.results ?? result.docs ?? result.logs ?? result.data ?? [];
  const total = result.total ?? result.totalCount ?? result.count ?? items.length;
  const page = result.page ?? params?.page ?? 1;
  const limit = result.limit ?? params?.limit ?? items.length ?? DEFAULT_PAGE.limit;
  const totalPages = result.totalPages ?? (limit ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    items: Array.isArray(items) ? items : [],
    total,
    page,
    limit,
    totalPages,
  };
}

// fetcher: (params) => Promise<{ items, total, page, limit, totalPages }>
export function usePaginatedQuery(fetcher, params) {
  const [data, setData] = useState(DEFAULT_PAGE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0);
  const paramsKey = JSON.stringify(params);

  const refetch = useCallback(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);
    fetcher(params)
      .then((result) => {
        if (id !== requestId.current) return;
        setData(normalizePage(result, params));
        setLoading(false);
      })
      .catch((err) => {
        if (id !== requestId.current) return;
        setError(err);
        setLoading(false);
      });
  }, [paramsKey]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...data, loading, error, refetch };
}

// fn: (...args) => Promise<result>
export function useApiMutation(fn) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const mutate = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fn(...args);
        setLoading(false);
        return result;
      } catch (err) {
        setError(err);
        setLoading(false);
        throw err;
      }
    },
    [fn]
  );

  return { mutate, loading, error };
}
