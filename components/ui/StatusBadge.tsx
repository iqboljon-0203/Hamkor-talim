import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, STATUS_COLORS } from '@/constants/Theme';

type StatusType = 'active' | 'pending' | 'overdue' | 'submitted' | 'excellent' | 'average' | 'info';

interface StatusBadgeProps {
  status: StatusType;
  label?: string;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const STATUS_LABELS: Record<StatusType, string> = {
  active: 'Faol',
  pending: 'Kutilmoqda',
  overdue: "Muddati o'tgan",
  submitted: 'Topshirildi',
  excellent: "A'lo",
  average: "O'rtacha",
  info: "Ma'lumot",
};

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  label,
  size = 'sm',
  dot = false,
}) => {
  const colors = STATUS_COLORS[status];
  const displayLabel = label || STATUS_LABELS[status];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: colors.bg },
        size === 'md' && styles.badgeMd,
      ]}
    >
      {dot && (
        <View style={[styles.dot, { backgroundColor: colors.text }]} />
      )}
      <Text
        style={[
          styles.text,
          { color: colors.text },
          size === 'md' && styles.textMd,
        ]}
      >
        {displayLabel}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: 'flex-start',
  },
  badgeMd: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: SPACING.xs,
  },
  text: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.xs,
  },
  textMd: {
    fontSize: FONT_SIZES.sm,
  },
});

export default StatusBadge;
