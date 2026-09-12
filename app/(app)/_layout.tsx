import { Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import { LayoutGrid, Users, Calendar, BarChart3, User } from 'lucide-react-native';
import Theme from '@/constants/Theme';
import { ActivityIndicator, View, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { COLORS, FONTS, FONT_SIZES, SHADOWS } = Theme;

interface TabIconProps {
  color: string;
  size: number;
  focused: boolean;
}

export default function AppLayout() {
  const { user, loading, isTeacher } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  if (shouldRedirect) {
    return <Redirect href="/(auth)" />;
  }

  const tabs = [
    {
      name: 'index',
      label: 'Asosiy',
      icon: ({ color, size }: TabIconProps) => (
        <LayoutGrid size={size} color={color} />
      ),
    },
    {
      name: 'groups/index',
      label: 'Guruhlar',
      icon: ({ color, size }: TabIconProps) => (
        <Users size={size} color={color} />
      ),
    },
    {
      name: 'calendar/index',
      label: 'Taqvim',
      icon: ({ color, size }: TabIconProps) => (
        <Calendar size={size} color={color} />
      ),
    },
    {
      name: 'results',
      label: 'Natijalar',
      icon: ({ color, size }: TabIconProps) => (
        <BarChart3 size={size} color={color} />
      ),
    },
    {
      name: 'profile/index',
      label: 'Profil',
      icon: ({ color, size }: TabIconProps) => (
        <User size={size} color={color} />
      ),
    },
  ];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          backgroundColor: COLORS.white,
          borderTopWidth: 0,
          height: 64 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          ...SHADOWS.sm,
          shadowOffset: { width: 0, height: -2 },
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: 10,
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginBottom: -2,
        },
        headerShown: false,
      }}
    >
      {tabs.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: tab.label,
            tabBarIcon: tab.icon,
          }}
        />
      ))}
    </Tabs>
  );
}
