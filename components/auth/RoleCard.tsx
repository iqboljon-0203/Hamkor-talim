import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '@/constants/Theme';
import { UserRole } from '@/lib/supabase';

interface RoleCardProps {
  role: UserRole;
  selectedRole: UserRole;
  onSelect: (role: UserRole) => void;
  title: string;
  description: string;
  icon: React.ReactNode;
}

function RoleCardComponent({
  role,
  selectedRole,
  onSelect,
  title,
  description,
  icon,
}: RoleCardProps) {
  const isSelected = role === selectedRole;

  return (
    <TouchableOpacity
      style={[styles.roleCard, isSelected && styles.roleCardActive]}
      onPress={() => onSelect(role)}
      activeOpacity={0.7}
    >
      <View style={[styles.roleIconWrap, isSelected && styles.roleIconWrapActive]}>
        {icon}
      </View>
      <Text style={[styles.roleCardTitle, isSelected && styles.roleCardTitleActive]}>
        {title}
      </Text>
      <Text style={[styles.roleCardDesc, isSelected && styles.roleCardDescActive]}>
        {description}
      </Text>
    </TouchableOpacity>
  );
}

export const RoleCard = React.memo(RoleCardComponent);

const styles = StyleSheet.create({
  roleCard: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    paddingHorizontal: SPACING.sm,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 2,
    borderColor: COLORS.gray[200],
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  roleCardActive: {
    borderColor: COLORS.primary[500],
    backgroundColor: COLORS.primary[50],
  },
  roleIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary[50],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  roleIconWrapActive: {
    backgroundColor: COLORS.primary[500],
  },
  roleCardTitle: {
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
    color: COLORS.gray[700],
    marginBottom: 1,
  },
  roleCardTitleActive: {
    color: COLORS.primary[700],
  },
  roleCardDesc: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZES.xs,
    color: COLORS.gray[400],
    textAlign: 'center',
  },
  roleCardDescActive: {
    color: COLORS.primary[400],
  },
});
