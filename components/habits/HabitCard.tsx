import { AppColours } from '@/constants/theme';
import { formatUnit } from '@/utils/formatters';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  name: string;
  unit: string;
  metricType: string;
  categoryColor: string;
  categoryName: string;
  onPress: () => void;
  onLongPress: () => void;
};

export default function HabitCard({ name, unit, metricType, categoryColor, categoryName, onPress, onLongPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.75}
      accessibilityRole="button"
      accessibilityLabel={`${name}, ${categoryName}`}
    >
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />
      <View style={styles.cardBody}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: categoryColor + '25' }]}>
            <Text style={[styles.tagText, { color: categoryColor }]}>{categoryName}</Text>
          </View>
          <Text style={styles.unit}>{formatUnit(unit, metricType)}</Text>
        </View>
      </View>
      <Text style={styles.arrow}>›</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: AppColours.card,
    borderRadius: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  categoryBar: { width: 5, alignSelf: 'stretch' },
  cardBody:    { flex: 1, padding: 16 },
  name:        { fontSize: 16, fontWeight: '600', color: AppColours.text },
  tagRow:      { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8 },
  tag:         { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
  tagText:     { fontSize: 12, fontWeight: '600' },
  unit:        { fontSize: 12, color: AppColours.subtext },
  arrow:       { fontSize: 22, color: AppColours.border, paddingRight: 14 },
});
