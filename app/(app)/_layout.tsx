import { Tabs } from 'expo-router';
import { useAuth } from '@/hooks/useAuth';
import {
  Home,
  Users,
  BookOpen,
  MessageSquare,
  FileText,
  User2,
  Calendar,
  Star,
} from 'lucide-react-native';
import Theme from '@/constants/Theme';
import { ActivityIndicator, View } from 'react-native';
import { useEffect, useState } from 'react';
import { Redirect } from 'expo-router';

const { COLORS, FONTS, FONT_SIZES } = Theme;

interface TabIconProps {
  color: string;
  size: number;
}

export default function AppLayout() {
  const { user, loading, isTeacher } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState(false);

 
  useEffect(() => {
    // If user is null and not loading, need to redirect to auth
    if (!loading && !user) {
      setShouldRedirect(true);
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary[500]} />
      </View>
    );
  }

  if (shouldRedirect) {
    return <Redirect href="/(auth)" />;
  }

  const teacherTabs = [
    {
      name: 'index',
      label: 'Bosh sahifa',
      icon: ({ color, size }: TabIconProps) => (
        <Home size={size} color={color} />
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
      name: 'results',
      label: 'Javoblar',
      icon: ({ color, size }: TabIconProps) => (
        <FileText size={size} color={color} />
      ),
    },
    {
      name: 'calendar/index',
      label: 'Kalendar',
      icon: ({ color, size }: TabIconProps) => (
        <Calendar size={size} color={color} />
      ),
    },
    {
      name: 'profile/index',
      label: 'Profil',
      icon: ({ color, size }: TabIconProps) => (
        <User2 size={size} color={color} />
      ),
    },
  ];

  const studentTabs = [
    {
      name: 'index',
      label: 'Bosh sahifa',
      icon: ({ color, size }: TabIconProps) => (
        <Home size={size} color={color} />
      ),
    },
    {
      name: 'groups/index',
      label: 'Darslar',
      icon: ({ color, size }: TabIconProps) => (
        <Users size={size} color={color} />
      ),
    },
    {
      name: 'results',
      label: 'Baholar',
      icon: ({ color, size }: TabIconProps) => (
        <Star size={size} color={color} />
      ),
    },
    {
      name: 'calendar/index',
      label: 'Kalendar',
      icon: ({ color, size }: TabIconProps) => (
        <Calendar size={size} color={color} />
      ),
    },
    {
      name: 'profile/index',
      label: 'Profil',
      icon: ({ color, size }: TabIconProps) => (
        <User2 size={size} color={color} />
      ),
    },
  ];

  // Tablar massivini tuzamiz
  const tabScreens = isTeacher ? teacherTabs : studentTabs;

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary[500],
        tabBarInactiveTintColor: COLORS.gray[400],
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: COLORS.gray[200],
          height: 60,
          paddingBottom: 5,
          paddingTop: 5,
        },
        tabBarLabelStyle: {
          fontFamily: FONTS.medium,
          fontSize: FONT_SIZES.xs,
        },
        headerShown: false,
      }}
    >
      {tabScreens.map((tab) => {
        if (tab.name === 'submissions' && !isTeacher) return null;
        if (tab.name === 'grades' && isTeacher) return null;
        return (
          <Tabs.Screen
            key={tab.name}
            name={tab.name}
            options={{
              title: tab.label,
              tabBarIcon: tab.icon,
            }}
          />
        );
      })}
    </Tabs>
  );
}
