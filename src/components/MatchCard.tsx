import { StyleSheet, Text, View } from 'react-native';
import { Match, formatStart, statusLabel } from '../domain/matches';
import { FavoriteButton } from './FavoriteButton';

type Props = { match: Match; favorite: boolean; onToggleFavorite: () => void };

export function MatchCard({ match, favorite, onToggleFavorite }: Props) {
  const live = match.status === 'live';
  return (
    <View style={[styles.card, live && styles.liveCard]}>
      <View style={styles.header}>
        <View style={[styles.badge, live && styles.liveBadge]}>
          <Text style={[styles.status, live && styles.liveStatus]}>{statusLabel(match)}</Text>
        </View>
        <FavoriteButton active={favorite} onPress={onToggleFavorite}
          matchLabel={`${match.home.name} — ${match.away.name}`} />
      </View>
      <View style={styles.teams}>
        <View style={styles.team}>
          <Text style={styles.role}>ХОЗЯЕВА</Text>
          <Text style={styles.name}>{match.home.name}</Text>
          <Text style={styles.city}>{match.home.city}</Text>
        </View>
        <Text style={styles.score} accessibilityLabel={match.score === null
          ? 'Счёта пока нет' : `Счёт ${match.score.home} : ${match.score.away}`}>
          {match.score === null ? '—' : `${match.score.home} : ${match.score.away}`}
        </Text>
        <View style={[styles.team, styles.away]}>
          <Text style={styles.role}>ГОСТИ</Text>
          <Text style={[styles.name, styles.right]}>{match.away.name}</Text>
          <Text style={[styles.city, styles.right]}>{match.away.city}</Text>
        </View>
      </View>
      <Text style={styles.date}>{formatStart(match.startsAt)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#e2e8f0', padding: 18, gap: 14 },
  liveCard: { borderColor: '#86bda6' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badge: { borderRadius: 6, backgroundColor: '#f1f5f9', paddingVertical: 5, paddingHorizontal: 9 },
  liveBadge: { backgroundColor: '#e4f4eb' },
  status: { color: '#475569', fontSize: 12, fontWeight: '600' },
  liveStatus: { color: '#176443' },
  teams: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  team: { flex: 1, gap: 5, minWidth: 0 },
  away: { alignItems: 'flex-end' },
  role: { color: '#64748b', fontSize: 10, letterSpacing: 1 },
  name: { color: '#172b3a', fontSize: 17, fontWeight: '700' },
  city: { color: '#64748b', fontSize: 12 },
  right: { textAlign: 'right' },
  score: { color: '#172b3a', fontSize: 25, fontWeight: '700', minWidth: 65, textAlign: 'center', fontVariant: ['tabular-nums'] },
  date: { color: '#64748b', fontSize: 12, borderTopWidth: 1, borderColor: '#f1f5f9', paddingTop: 14 },
});
