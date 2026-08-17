import { Tabs } from 'expo-router';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Brand, Fonts } from '@/constants/theme';
import { ProfileContext } from '@/contexts/profile-context';
import { useProfile } from '@/hooks/use-profile';
import { useTheme } from '@/hooks/use-theme';
import { useTransactions } from '@/hooks/use-transactions';

// ---------------------------------------------------------------------------
// Tab icon — glyph inside an optional active-state pill
// ---------------------------------------------------------------------------
function TabIcon({ glyph, focused, color }: { glyph: string; focused: boolean; color: string }) {
  return (
    <View style={[tw.wrap, focused && tw.wrapActive]}>
      <Text style={[tw.glyph, { color, opacity: focused ? 1 : 0.55 }]}>{glyph}</Text>
    </View>
  );
}

const tw = StyleSheet.create({
  wrap:       { width: 36, height: 32, alignItems: 'center', justifyContent: 'center', borderRadius: 10 },
  wrapActive: { backgroundColor: 'rgba(200,190,250,0.13)' },
  glyph:      { fontSize: 17, fontFamily: Fonts.regular },
});

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------
export default function AppLayout() {
  const theme      = useTheme();
  const insets     = useSafeAreaInsets();
  const profileCtx = useProfile();

  // Transactions are fetched here so they can be refreshed from any tab
  // (e.g. immediately after a successful payment on the Profile tab).
  const {
    transactions,
    loading: transactionsLoading,
    refresh: refreshTransactions,
  } = useTransactions(profileCtx.profile?.id);

  const TAB_PADDING_TOP    = 8;
  const TAB_PADDING_BOTTOM = insets.bottom + 4;
  const TAB_HEIGHT         = 48 + TAB_PADDING_TOP + TAB_PADDING_BOTTOM;

  const ctxValue = {
    ...profileCtx,
    transactions,
    transactionsLoading,
    refreshTransactions,
  };

  return (
    <ProfileContext.Provider value={ctxValue}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: theme.backgroundElement,
            borderTopColor:  theme.border,
            borderTopWidth:  StyleSheet.hairlineWidth,
            height:          TAB_HEIGHT,
            paddingTop:      TAB_PADDING_TOP,
            paddingBottom:   TAB_PADDING_BOTTOM,
            ...(Platform.OS === 'android' && { elevation: 8 }),
          },
          tabBarActiveTintColor:   Brand.lavenderTonic,
          tabBarInactiveTintColor: theme.textSecondary,
          tabBarLabelStyle: {
            fontFamily:    Fonts.semibold,
            fontSize:      10,
            letterSpacing: 0.2,
            marginBottom:  2,
          },
        }}>

        <Tabs.Screen
          name="index"
          options={{
            title: 'Tasks',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon glyph="☑" focused={focused} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="transactions"
          options={{
            title: 'Billing',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon glyph="▤" focused={focused} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon glyph="◉" focused={focused} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="about"
          options={{
            title: 'About',
            tabBarIcon: ({ focused, color }) => (
              <TabIcon glyph="◎" focused={focused} color={color} />
            ),
          }}
        />

      </Tabs>
    </ProfileContext.Provider>
  );
}
