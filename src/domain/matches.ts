export type Team = { id: string; name: string; city: string };

export type Match = {
  id: string;
  startsAt: string | null;
  status: string;
  minute?: number;
  home: Team;
  away: Team;
  score: { home: number; away: number } | null;
};

export type MatchesResponse = { round: number; matches: Match[] };
export type MatchFilter = 'all' | 'upcoming' | 'finished';

export const FILTERS: { value: MatchFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'upcoming', label: 'Предстоящие' },
  { value: 'finished', label: 'Завершённые' },
];

export function filterMatches(matches: Match[], filter: MatchFilter): Match[] {
  return matches.filter((match) => {
    if (filter === 'upcoming') {
      return match.status === 'scheduled' || match.status === 'postponed';
    }
    return filter === 'all' || match.status === 'finished';
  });
}

export function statusLabel(match: Match): string {
  switch (match.status) {
    case 'scheduled': return 'Запланирован';
    case 'finished': return 'Завершён';
    case 'postponed': return 'Перенесён';
    case 'live': return match.minute == null ? 'Идёт матч' : `Идёт матч · ${match.minute}′`;
    default: return 'Статус уточняется';
  }
}

export function formatStart(startsAt: string | null): string {
  if (startsAt === null) return 'Дата уточняется';
  const date = new Date(startsAt);
  if (Number.isNaN(date.getTime())) return 'Дата уточняется';
  // Без timeZone: Intl использует часовой пояс устройства.
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  }).format(date);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isTeam(value: unknown): value is Team {
  return isRecord(value) && typeof value.id === 'string'
    && typeof value.name === 'string' && typeof value.city === 'string';
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0;
}

function isMatch(value: unknown): value is Match {
  return isRecord(value) && typeof value.id === 'string' && value.id.length > 0
    && (value.startsAt === null || typeof value.startsAt === 'string')
    && typeof value.status === 'string'
    && (value.minute === undefined || isNonNegativeInteger(value.minute))
    && isTeam(value.home) && isTeam(value.away)
    && (value.score === null || (isRecord(value.score)
      && isNonNegativeInteger(value.score.home) && isNonNegativeInteger(value.score.away)));
}

export function parseMatchesResponse(value: unknown): MatchesResponse {
  if (!isRecord(value) || !isNonNegativeInteger(value.round)
    || !Array.isArray(value.matches) || !value.matches.every(isMatch)
    || new Set(value.matches.map((match) => match.id)).size !== value.matches.length) {
    throw new Error('Сервер вернул некорректные данные матчей.');
  }
  return { round: value.round, matches: value.matches };
}
