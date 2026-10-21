import { useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { MatchCard } from '../components/MatchCard';
import { UpdatedAgo } from '../components/UpdatedAgo';
import { FILTERS, MatchFilter, filterMatches } from '../domain/matches';
import { useFavorites } from '../hooks/useFavorites';
import { useMatches } from '../hooks/useMatches';

export function MatchesScreen() {
  const { data, loading, error, updatedAt, reload } = useMatches();
  const { favorites, isFavorite, toggle } = useFavorites();
  const [filter, setFilter] = useState<MatchFilter>('all');
  const matches = filterMatches(data?.matches ?? [], filter);

  return (
    <View style={styles.container}>
      <View style={styles.heading}>
        <Text style={styles.eyebrow}>ФУТБОЛ / {data ? `ТУР ${data.round}` : 'ОБЗОР ТУРА'}</Text>
        <Text style={styles.title}>Матчи тура</Text>
        <Text style={styles.subtitle}>Расписание и результаты · время вашего устройства</Text>
      </View>

      <View style={styles.filters} accessibilityRole="tablist">
        {FILTERS.map(({ value, label }) => (
          <Pressable key={value} accessibilityRole="tab"
            accessibilityState={{ selected: filter === value }}
            onPress={() => setFilter(value)}
            style={[styles.filter, filter === value && styles.selectedFilter]}>
            <Text style={[styles.filterText, filter === value && styles.selectedText]}>{label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.toolbar}>
        <View style={styles.updateInfo}>
          {updatedAt ? <UpdatedAgo since={updatedAt} /> : <Text style={styles.muted}>Данные с сервера</Text>}
          {data && <Text style={styles.muted}>Матчей: {matches.length} из {data.matches.length}</Text>}
        </View>
        <Pressable accessibilityRole="button" disabled={loading}
          accessibilityState={{ disabled: loading, busy: loading }}
          onPress={() => void reload()} style={[styles.refresh, loading && styles.disabled]}>
          <Text style={styles.refreshText}>{loading ? 'Загрузка…' : 'Обновить'}</Text>
        </Pressable>
      </View>

      {error && (
        <View style={styles.error} accessibilityRole="alert">
          <Text style={styles.errorTitle}>{data ? 'Не удалось обновить матчи' : 'Не удалось загрузить матчи'}</Text>
          <Text style={styles.errorText}>{error}</Text>
          {data && <Text style={styles.errorText}>Показаны данные последней успешной загрузки.</Text>}
          <Pressable accessibilityRole="button" onPress={() => void reload()} style={styles.retry}>
            <Text style={styles.retryText}>Повторить</Text>
          </Pressable>
        </View>
      )}

      {loading && !data ? (
        <View style={styles.empty}>
          <ActivityIndicator size="large" color="#176443" accessibilityLabel="Загрузка матчей" />
          <Text style={styles.muted}>Загружаем матчи…</Text>
        </View>
      ) : data ? (
        <FlatList data={matches} keyExtractor={(match) => match.id} extraData={favorites}
          style={styles.list} contentContainerStyle={styles.listContent}
          renderItem={({ item }) => <MatchCard match={item} favorite={isFavorite(item.id)}
            onToggleFavorite={() => toggle(item.id)} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>{data.matches.length === 0 ? 'В этом туре пока нет матчей' : 'В этой категории нет матчей'}</Text>
              <Text style={styles.emptyText}>{data.matches.length === 0
                ? 'Попробуйте обновить список позже.' : 'Выберите другой фильтр, чтобы посмотреть остальные матчи.'}</Text>
            </View>
          } />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%', maxWidth: 760, alignSelf: 'center', paddingHorizontal: 16 },
  heading: { gap: 8, paddingTop: 12, paddingBottom: 24 },
  eyebrow: { fontSize: 11, fontWeight: '700', letterSpacing: 1.8, color: '#176443' },
  title: { fontSize: 32, fontWeight: '700', color: '#172b3a' },
  subtitle: { fontSize: 13, color: '#64748b', lineHeight: 19 },
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingBottom: 14 },
  filter: { minHeight: 44, paddingHorizontal: 14, justifyContent: 'center', borderRadius: 9, backgroundColor: '#e8edf0' },
  selectedFilter: { backgroundColor: '#193e31' },
  filterText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  selectedText: { color: '#fff' },
  toolbar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingBottom: 18 },
  updateInfo: { gap: 4, flex: 1 },
  muted: { fontSize: 12, color: '#64748b' },
  refresh: { minHeight: 44, justifyContent: 'center', paddingHorizontal: 14, borderWidth: 1, borderColor: '#cbd5e1', borderRadius: 9, backgroundColor: '#fff' },
  refreshText: { color: '#193e31', fontSize: 13, fontWeight: '600' },
  disabled: { opacity: 0.55 },
  list: { flex: 1 },
  listContent: { paddingBottom: 24, flexGrow: 1 },
  separator: { height: 12 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 28 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: '#172b3a', textAlign: 'center' },
  emptyText: { fontSize: 14, color: '#64748b', lineHeight: 22, textAlign: 'center' },
  error: { padding: 16, gap: 8, backgroundColor: '#fff1f0', borderRadius: 12, marginBottom: 16 },
  errorTitle: { color: '#992d23', fontSize: 16, fontWeight: '600' },
  errorText: { color: '#992d23', fontSize: 13, lineHeight: 19 },
  retry: { alignSelf: 'flex-start', minHeight: 44, justifyContent: 'center', paddingHorizontal: 12, backgroundColor: '#fff', borderRadius: 8 },
  retryText: { color: '#992d23', fontWeight: '600' },
});
