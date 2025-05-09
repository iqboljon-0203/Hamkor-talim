import React from 'react';
import { View, Text, StyleSheet, Image, StyleProp, ViewStyle, TextStyle } from 'react-native';
import { COLORS, FONTS, FONT_SIZES, BORDER_RADIUS } from '@/constants/Theme';

interface AvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  source?: { uri: string } | null;
  name?: string;
  backgroundColor?: string;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const Avatar: React.FC<AvatarProps> = ({
  size = 'md',
  source,
  name,
  backgroundColor,
  style,
  textStyle,
}) => {
  // Calculate size in pixels
  const getSizeInPixels = () => {
    switch (size) {
      case 'xs':
        return 24;
      case 'sm':
        return 32;
      case 'md':
        return 40;
      case 'lg':
        return 56;
      case 'xl':
        return 80;
      default:
        return 40;
    }
  };

  // Get font size based on avatar size
  const getFontSize = () => {
    switch (size) {
      case 'xs':
        return FONT_SIZES.xs;
      case 'sm':
        return FONT_SIZES.sm;
      case 'md':
        return FONT_SIZES.md;
      case 'lg':
        return FONT_SIZES.lg;
      case 'xl':
        return FONT_SIZES.xl;
      default:
        return FONT_SIZES.md;
    }
  };

  // Get initials from name
  const getInitials = () => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  // Generate a consistent color from name
  const getBackgroundColor = () => {
    if (backgroundColor) return backgroundColor;
    
    if (!name) return COLORS.gray[500];
    
    const colors = [
      COLORS.primary[500],
      COLORS.secondary[500],
      COLORS.accent[500],
      COLORS.success[500],
      COLORS.warning[500],
    ];
    
    // Simple hash function to pick a color based on the name
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
  };

  return (
    <View style={[styles.container, containerStyle, style]}>
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
  );
};

const styles = StyleSheet.create({
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
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

export default Avatar;