import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
    ActivityIndicator,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { PaystackModal } from '@/components/paystack-modal';
import { useToast } from '@/components/toast';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { useSharedProfile } from '@/contexts/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { supabase } from '@/lib/supabase';

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------
function SectionHeader({ title }: { title: string }) {
  const theme = useTheme();
  return <Text style={[sh.text, { color: theme.textSecondary }]}>{title.toUpperCase()}</Text>;
}
const sh = StyleSheet.create({ text: { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 1.2, marginBottom: Spacing.two } });

function Row({ label, value, onPress, destructive, loading }: {
  label: string; value?: string; onPress?: () => void; destructive?: boolean; loading?: boolean;
}) {
  const theme = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[rw.row, { backgroundColor: theme.backgroundElement, borderColor: theme.border }, loading && { opacity: 0.6 }]}
      disabled={loading}
      accessibilityRole={onPress ? 'button' : 'text'}>
      {loading && <ActivityIndicator size="small" color={theme.error} style={{ marginRight: Spacing.two }} />}
      <Text style={[rw.label, { color: destructive ? theme.error : theme.text }]}>{label}</Text>
      {!!value   && <Text style={[rw.value,   { color: theme.textSecondary }]}>{value}</Text>}
      {!!onPress && !loading && <Text style={[rw.chevron, { color: theme.textSecondary }]}>›</Text>}
    </Pressable>
  );
}
const rw = StyleSheet.create({
  row:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: Spacing.three, paddingVertical: 14, borderRadius: Radius.md, borderWidth: 1, marginBottom: Spacing.two },
  label:   { fontFamily: Fonts.medium,  flex: 1, fontSize: 15 },
  value:   { fontFamily: Fonts.regular, fontSize: 14, marginRight: Spacing.one },
  chevron: { fontFamily: Fonts.regular, fontSize: 20, lineHeight: 22 },
});

function PlanBadge({ plan }: { plan: 'free' | 'pro' }) {
  const isPro = plan === 'pro';
  return (
    <View style={[pb.badge, isPro ? pb.pro : pb.free]}>
      <Text style={[pb.text, isPro ? pb.proText : pb.freeText]}>{isPro ? 'PRO' : 'FREE'}</Text>
    </View>
  );
}
const pb = StyleSheet.create({
  badge:    { paddingHorizontal: 10, paddingVertical: 3, borderRadius: Radius.full },
  free:     { backgroundColor: 'rgba(200,190,250,0.12)', borderWidth: 1, borderColor: '#2d2856' },
  pro:      { backgroundColor: Brand.lavenderTonic },
  text:     { fontFamily: Fonts.bold, fontSize: 11, letterSpacing: 0.8 },
  freeText: { color: Brand.lavenderTonic },
  proText:  { color: Brand.championBlue },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function ProfileScreen() {
  const router              = useRouter();
  const theme               = useTheme();
  const { showToast }       = useToast();
  const { profile, loading, refresh, refreshTransactions } = useSharedProfile();

  const [showPaystack,  setShowPaystack]  = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  const initials = profile?.full_name
    ? profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : profile?.email?.[0]?.toUpperCase() ?? '?';

  async function handleLogout() {
    setLogoutLoading(true);
    const { error } = await supabase.auth.signOut();
    setLogoutLoading(false);
    if (error) showToast(error.message, 'error');
    else router.replace('/(auth)/login');
  }

  function handleUpgradeSuccess() {
    setShowPaystack(false);
    refresh();
    refreshTransactions();
    showToast('Welcome to Pro! 🎉', 'success');
  }

  if (loading) {
    return (
      <View style={[styles.screen, styles.center, { backgroundColor: theme.background }]}>
        <ActivityIndicator color={Brand.lavenderTonic} size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Avatar */}
          <View style={styles.avatarBlock}>
            <View style={[styles.avatar, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <Text style={[styles.initials, { color: Brand.lavenderTonic }]}>{initials}</Text>
            </View>
            <Text style={[styles.name,  { color: theme.text }]}>{profile?.full_name ?? 'User'}</Text>
            <Text style={[styles.email, { color: theme.textSecondary }]}>{profile?.email ?? ''}</Text>
            <PlanBadge plan={profile?.plan ?? 'free'} />
          </View>

          {/* Plan card */}
          <SectionHeader title="Plan" />
          <View style={[styles.planCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <View style={styles.planInfo}>
              <Text style={[styles.planTitle, { color: theme.text }]}>
                {profile?.plan === 'pro' ? '✦ Pro Plan' : 'Free Plan'}
              </Text>
              <Text style={[styles.planDesc, { color: theme.textSecondary }]}>
                {profile?.plan === 'pro'
                  ? 'Unlimited todos, priority levels, transaction history.'
                  : 'Up to 5 todos, Medium priority only.'}
              </Text>
            </View>
            {profile?.plan !== 'pro' && (
              <Pressable style={styles.upgradeBtn} onPress={() => setShowPaystack(true)} accessibilityRole="button">
                <Text style={styles.upgradeBtnText}>Upgrade →</Text>
              </Pressable>
            )}
          </View>

          {/* Account */}
          <View style={styles.section}>
            <SectionHeader title="Account" />
            <Row label="Email"           value={profile?.email ?? ''} />
            <Row label="Change Password" onPress={() => router.push('/(auth)/forgot-password')} />
            <Row label="Transactions"    onPress={() => router.push('/(app)/transactions')} />
          </View>

          {/* Session */}
          <View style={styles.section}>
            <SectionHeader title="Session" />
            <Row label="Log Out" destructive loading={logoutLoading} onPress={handleLogout} />
          </View>

        </ScrollView>
      </SafeAreaView>

      {/* Paystack upgrade modal */}
      {profile && (
        <PaystackModal
          visible={showPaystack}
          userId={profile.id}
          email={profile.email ?? ''}
          onSuccess={handleUpgradeSuccess}
          onDismiss={() => setShowPaystack(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen:  { flex: 1 },
  safe:    { flex: 1 },
  center:  { alignItems: 'center', justifyContent: 'center' },
  scroll:  { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.six },

  avatarBlock: { alignItems: 'center', marginBottom: Spacing.five, gap: 4 },
  avatar:      { width: 80, height: 80, borderRadius: Radius.full, borderWidth: 2, alignItems: 'center', justifyContent: 'center', marginBottom: Spacing.one },
  initials:    { fontFamily: Fonts.bold, fontSize: 28 },
  name:        { fontFamily: Fonts.bold,    fontSize: 20 },
  email:       { fontFamily: Fonts.regular, fontSize: 13 },

  planCard:       { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, flexDirection: 'row', alignItems: 'center', gap: Spacing.three, marginBottom: Spacing.four },
  planInfo:       { flex: 1, gap: 4 },
  planTitle:      { fontFamily: Fonts.semibold, fontSize: 15 },
  planDesc:       { fontFamily: Fonts.regular,  fontSize: 13, lineHeight: 18 },
  upgradeBtn:     { paddingHorizontal: Spacing.three, paddingVertical: Spacing.two, borderRadius: Radius.sm, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center' },
  upgradeBtnText: { fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 13 },

  section: { marginBottom: Spacing.four },
});
