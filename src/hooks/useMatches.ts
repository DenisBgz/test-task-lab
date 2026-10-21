import { useCallback, useEffect, useRef, useState } from 'react';
import { MATCHES_URL } from '../config';
import { MatchesResponse, parseMatchesResponse } from '../domain/matches';

export function useMatches() {
  const [data, setData] = useState<MatchesResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const request = useRef<AbortController | null>(null);

  const reload = useCallback(async () => {
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setLoading(true);
    setError(null);
    let timedOut = false;
    const timeout = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, 15000);

    try {
      const response = await fetch(MATCHES_URL, { signal: controller.signal, cache: 'no-store' });
      if (!response.ok) throw new Error(`Сервер недоступен (HTTP ${response.status}).`);
      const result = parseMatchesResponse(await response.json());
      if (request.current !== controller) return;
      setData(result);
      setUpdatedAt(new Date());
    } catch (cause) {
      if (request.current !== controller || (controller.signal.aborted && !timedOut)) return;
      setError(timedOut
        ? 'Сервер не ответил за 15 секунд. Попробуйте ещё раз.'
        : cause instanceof Error ? cause.message : 'Не удалось связаться с сервером.');
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void reload();
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [reload]);

  return { data, loading, error, updatedAt, reload };
}
