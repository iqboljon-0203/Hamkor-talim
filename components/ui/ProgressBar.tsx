import React from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, GRADIENTS, BORDER_RADIUS } from '@/constants/Theme';

interface ProgressBarProps {
  value: number;
  maxValue?: number;
  height?: number;
  gradient?: readonly [string, string];
  backgroundColor?: string;
  borderRadius?: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  maxValue = 100,
  height = 6,
  gradient = GRADIENTS.primary,
  backgroundColor = COLORS.gray[200],
  borderRadius = BORDER_RADIUS.full,
}) => {
  const percentage = Math.min(Math.max((value / maxValue) * 100, 0), 100);

  return (
    <View style={[styles.track, { height, borderRadius, backgroundColor }]}>
      <LinearGradient
        colors={[gradient[0], gradient[1]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[
          styles.fill,
          {
            width: `${percentage}%`,
            height,
            borderRadius,
          },
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    width: '100%',
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});

export default ProgressBar;
