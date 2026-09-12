import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, BORDER_RADIUS } from '@/constants/Theme';

interface AvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  source?: { uri: string } | null;
  name?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  showOnline?: boolean;
  borderColor?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  source,
  name,
  backgroundColor,
  style,
  textStyle,
  showOnline = false,
  borderColor,
}) => {
  const getSizeInPixels = () => {
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 34;
      case 'md':
        return 42;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      case '2xl':
        return 100;
      default:
        return 42;
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return 10;
      case 'sm':
        return FONT_SIZES.xs;
      case 'md':
        return FONT_SIZES.sm;
      case 'lg':
        return FONT_SIZES.lg;
      case 'xl':
        return FONT_SIZES['2xl'];
      case '2xl':
        return FONT_SIZES['3xl'];
      default:
        return FONT_SIZES.sm;
    }
  };

  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    if (!name) return COLORS.gray[400];

    const colors = [
      COLORS.primary[500],
      COLORS.accent[500],
      COLORS.secondary[500],
      COLORS.success[500],
      COLORS.warning[500],
      '#8B5CF6',
      '#06B6D4',
      '#F43F5E',
    ];

    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const sizeInPixels = getSizeInPixels();
  const fontSize = getFontSize();
  const bgColor = getBackgroundColor();

  const containerStyle = {
    width: sizeInPixels,
    height: sizeInPixels,
    borderRadius: sizeInPixels / 2,
    backgroundColor: bgColor,
    ...(borderColor
      ? { borderWidth: 2.5, borderColor }
      : {}),
  };

  const onlineDotSize = Math.max(sizeInPixels * 0.22, 8);

  return (
    <View style={[styles.wrapper, style]}>
      <View style={[styles.container, containerStyle]}>
        {source ? (
          <Image
            source={source}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <Text style={[styles.text, { fontSize }, textStyle]}>
            {getInitials()}
          </Text>
        )}
      </View>
      {showOnline && (
        <View
          style={[
            styles.onlineDot,
            {
              width: onlineDotSize,
              height: onlineDotSize,
              borderRadius: onlineDotSize / 2,
              right: 0,
              bottom: 0,
            },
          ]}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    position: 'relative',
  },
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  text: {
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  onlineDot: {
    position: 'absolute',
    backgroundColor: COLORS.success[500],
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});

export default Avatar;