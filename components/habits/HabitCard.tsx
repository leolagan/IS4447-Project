//This imports all the components and contexts needed for the habit card
import { AppColours } from '@/constants/theme';
import { useTheme } from '@/context/ThemeContext';
import { formatUnit } from '@/utils/formatters';
import { Feather } from '@expo/vector-icons';
import { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type Props = {
  name: string;
  unit: string;
  metricType: string;
  categoryColor: string;
  categoryName: string;
  streak?: number;
  isCompleted: boolean;
  onPress: () => void;
  onLongPress: () => void;
  onComplete: () => void;
};

//This generates a stylesheet from the current theme colours
function makeStyles(c: typeof AppColours) {
  return StyleSheet.create({
    card: {
      backgroundColor: c.card,
      borderRadius: 16,
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 3,
    },
    circle:       { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center', marginLeft: 14 },
    circleEmpty:  { borderWidth: 1.5, borderColor: c.border },
    circleFilled: { backgroundColor: c.primary },
    check:        { color: '#fff', fontSize: 18, fontWeight: '700', lineHeight: 22 },
    categoryBar:  { width: 5, alignSelf: 'stretch', marginLeft: 12 },
    cardBody:     { flex: 1, padding: 18 },
    name:         { fontSize: 16, fontWeight: '600', fontFamily: 'Sora_600SemiBold', color: c.text, lineHeight: 22 },
    tagRow:       { flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 8, flexWrap: 'wrap' },
    tag:          { borderRadius: 10, paddingHorizontal: 10, paddingVertical: 3 },
    tagText:      { fontSize: 12, fontWeight: '600', fontFamily: 'Sora_400Regular' },
    unit:         { fontSize: 12, color: c.subtext, fontFamily: 'Sora_400Regular' },
    streakPill:   { backgroundColor: c.primaryLight, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 },
    streakText:   { fontSize: 12, fontWeight: '700', color: c.primary },
    actions:      { flexDirection: 'row', alignItems: 'center', paddingRight: 4 },
  });
}

export default function HabitCard({
  name, unit, metricType, categoryColor, categoryName,
  streak, isCompleted, onPress, onLongPress, onComplete,
}: Props) {
  const { colours } = useTheme();
  const styles = useMemo(() => makeStyles(colours), [colours]);

  return (
    <View style={styles.card}>
      {/*This is the circular completion checkbox on the left of the card*/}
      <TouchableOpacity
        style={[styles.circle, isCompleted ? styles.circleFilled : styles.circleEmpty]}
        onPress={onComplete}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isCompleted ? `${name} completed` : `Mark ${name} as complete`}
        accessibilityState={{ checked: isCompleted }}
      >
        {isCompleted && <Text style={styles.check}>✓</Text>}
      </TouchableOpacity>

      {/*This is the coloured category bar on the left edge of the card body*/}
      <View style={[styles.categoryBar, { backgroundColor: categoryColor }]} />

      {/*This shows the habit name, category tag, unit and streak pill*/}
      <View style={styles.cardBody}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.tagRow}>
          <View style={[styles.tag, { backgroundColor: categoryColor + '25' }]}>
            <Text style={[styles.tagText, { color: categoryColor }]}>{categoryName}</Text>
          </View>
          <Text style={styles.unit}>{formatUnit(unit, metricType)}</Text>
          {streak != null && streak > 0 && (
            <View style={styles.streakPill}>
              <Text style={styles.streakText}>{streak} day streak</Text>
            </View>
          )}
        </View>
      </View>

      {/*This shows the edit and delete action buttons on the right*/}
      <View style={styles.actions}>
        <TouchableOpacity
          onPress={onPress}
          accessibilityRole="button"
          accessibilityLabel={`Edit ${name}`}
          hitSlop={{ top: 8, bottom: 8 }}
        >
          <Feather name="edit-2" size={15} color={colours.subtext} style={{ paddingHorizontal: 8 }} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onLongPress}
          accessibilityRole="button"
          accessibilityLabel={`Delete ${name}`}
          hitSlop={{ top: 8, bottom: 8 }}
        >
          <Feather name="trash-2" size={15} color={colours.danger} style={{ paddingHorizontal: 8 }} />
        </TouchableOpacity>
      </View>
    </View>
  );
}