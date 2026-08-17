import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { useSharedProfile } from '@/contexts/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { FREE_TODO_LIMIT } from '@/hooks/use-todos';

// ---------------------------------------------------------------------------
// Shared label above each section
// ---------------------------------------------------------------------------
function SectionLabel({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <Text style={[sl.text, { color: theme.textSecondary }]}>
      {children.toUpperCase()}
    </Text>
  );
}
const sl = StyleSheet.create({
  text: { fontFamily: Fonts.bold, fontSize: 10, letterSpacing: 1.4, marginBottom: Spacing.two },
});

// ---------------------------------------------------------------------------
// Numbered how-it-works row
// ---------------------------------------------------------------------------
function Step({ n, title, body }: { n: number; title: string; body: string }) {
  const theme = useTheme();
  return (
    <View style={[step.wrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Text style={step.num}>{n}</Text>
      <View style={step.right}>
        <Text style={[step.title, { color: theme.text }]}>{title}</Text>
        <Text style={[step.body, { color: theme.textSecondary }]}>{body}</Text>
      </View>
    </View>
  );
}
const step = StyleSheet.create({
  wrap:  { flexDirection: 'row', gap: Spacing.three, borderRadius: Radius.md, borderWidth: 1, padding: Spacing.three, marginBottom: Spacing.two },
  num:   { fontFamily: Fonts.bold, fontSize: 22, color: Brand.lavenderTonic, width: 28, lineHeight: 28 },
  right: { flex: 1, gap: 3 },
  title: { fontFamily: Fonts.semibold, fontSize: 14 },
  body:  { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
});

// ---------------------------------------------------------------------------
// Plain feature row — no icon box, just a small label + description
// ---------------------------------------------------------------------------
function Feature({ label, description }: { label: string; description: string }) {
  const theme = useTheme();
  return (
    <View style={[frow.wrap, { borderColor: theme.border }]}>
      <View style={frow.dot} />
      <View style={frow.text}>
        <Text style={[frow.label, { color: theme.text }]}>{label}</Text>
        <Text style={[frow.desc, { color: theme.textSecondary }]}>{description}</Text>
      </View>
    </View>
  );
}
const frow = StyleSheet.create({
  wrap:  { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.two, paddingVertical: Spacing.two, borderBottomWidth: StyleSheet.hairlineWidth },
  dot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: Brand.lavenderTonic, marginTop: 8, flexShrink: 0 },
  text:  { flex: 1, gap: 2 },
  label: { fontFamily: Fonts.semibold, fontSize: 14 },
  desc:  { fontFamily: Fonts.regular, fontSize: 13, lineHeight: 19 },
});

// ---------------------------------------------------------------------------
// Plan comparison cards
// ---------------------------------------------------------------------------
function PlanCard({ name, price, items, isPro }: {
  name: string; price: string; items: string[]; isPro: boolean;
}) {
  const theme = useTheme();
  return (
    <View style={[pc.card, { backgroundColor: theme.backgroundElement, borderColor: isPro ? Brand.lavenderTonic : theme.border }, isPro && pc.proCard]}>
      <View style={pc.header}>
        <Text style={[pc.name, { color: theme.text }]}>{name}</Text>
        <View style={[pc.badge, isPro ? pc.badgePro : pc.badgeFree]}>
          <Text style={[pc.badgeText, { color: isPro ? Brand.championBlue : Brand.lavenderTonic }]}>
            {isPro ? 'PRO' : 'FREE'}
          </Text>
        </View>
      </View>
      <Text style={[pc.price, { color: theme.textSecondary }]}>{price}</Text>
      <View style={pc.divider} />
      {items.map(item => (
        <View key={item} style={pc.row}>
          <Text style={[pc.bullet, { color: isPro ? Brand.lavenderTonic : theme.textSecondary }]}>—</Text>
          <Text style={[pc.item, { color: isPro ? theme.text : theme.textSecondary }]}>{item}</Text>
        </View>
      ))}
    </View>
  );
}
const pc = StyleSheet.create({
  card:      { flex: 1, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.three, gap: Spacing.one },
  proCard:   { borderWidth: 2 },
  header:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 },
  name:      { fontFamily: Fonts.bold, fontSize: 16 },
  badge:     { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full },
  badgePro:  { backgroundColor: Brand.lavenderTonic },
  badgeFree: { backgroundColor: 'rgba(200,190,250,0.12)', borderWidth: 1, borderColor: '#2d2856' },
  badgeText: { fontFamily: Fonts.bold, fontSize: 9, letterSpacing: 0.8 },
  price:     { fontFamily: Fonts.regular, fontSize: 12, marginBottom: Spacing.one },
  divider:   { height: StyleSheet.hairlineWidth, backgroundColor: '#2d2856', marginVertical: Spacing.two },
  row:       { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  bullet:    { fontFamily: Fonts.medium, fontSize: 12, lineHeight: 20, width: 12 },
  item:      { fontFamily: Fonts.regular, fontSize: 12, lineHeight: 20, flex: 1 },
});

// ---------------------------------------------------------------------------
// Tech stack pill row
// ---------------------------------------------------------------------------
function StackRow({ name, detail }: { name: string; detail: string }) {
  const theme = useTheme();
  return (
    <View style={[sk.wrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      <Text style={[sk.name, { color: theme.text }]}>{name}</Text>
      <Text style={[sk.detail, { color: theme.textSecondary }]}>{detail}</Text>
    </View>
  );
}
const sk = StyleSheet.create({
  wrap:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: Radius.md, borderWidth: 1, paddingHorizontal: Spacing.three, paddingVertical: 12, marginBottom: Spacing.two },
  name:   { fontFamily: Fonts.semibold, fontSize: 14 },
  detail: { fontFamily: Fonts.regular,  fontSize: 12 },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function AboutScreen() {
  const theme = useTheme();
  const { profile } = useSharedProfile();
  const isPro = profile?.plan === 'pro';

  return (
    <View style={[s.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={s.safe}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>

          {/* Hero */}
          <View style={s.hero}>
            <Text style={[s.heroTitle, { color: theme.text }]}>Todo App</Text>
            <Text style={[s.heroSub, { color: theme.textSecondary }]}>
              A focused task manager built with Expo and Supabase. Keeps you productive without the noise.
            </Text>
            <View style={[s.planChip, isPro ? s.chipPro : s.chipFree]}>
              <Text style={[s.chipText, { color: isPro ? Brand.championBlue : Brand.lavenderTonic }]}>
                {isPro ? 'Pro plan' : 'Free plan'}
              </Text>
            </View>
          </View>

          {/* How it works */}
          <View style={s.section}>
            <SectionLabel>How it works</SectionLabel>
            <Step n={1} title="Create an account" body="Sign up with your name, email, and password. Your account is created instantly — no email confirmation required." />
            <Step n={2} title="Add your tasks" body="Type a task, pick a priority, and hit +. Everything syncs to the cloud in real time." />
            <Step n={3} title="Stay on top of things" body="Filter by All, Active, or Done. Tap a checkbox to complete, or tap the edit button to change text and priority." />
            <Step n={4} title="Upgrade when you need more" body={`The free plan gives you ${FREE_TODO_LIMIT} tasks to start. Upgrade to Pro for unlimited tasks and all priority levels — one payment, no subscription.`} />
          </View>

          {/* Features */}
          <View style={s.section}>
            <SectionLabel>Features</SectionLabel>
            <Feature label="Task management" description="Add, edit, complete, and delete tasks with optimistic updates so the UI never waits on the network." />
            <Feature label="Priority levels" description="Three levels — Low, Medium, High. Each gets a colour badge so your list is readable at a glance." />
            <Feature label="Filter views" description="All, Active, and Done tabs with live counts. Quickly focus on what still needs doing." />
            <Feature label="Dark and light mode" description="Follows your device appearance automatically." />
            <Feature label="Biometric lock" description="Face ID or fingerprint re-authentication when the app comes back from the background." />
            <Feature label="Cloud sync" description="Your tasks live in Supabase and follow your account — sign in on any device and everything is there." />
            <Feature label="Transaction history" description="Pro users get a full record of their payment inside the app." />
          </View>

          {/* Free vs Pro */}
          <View style={s.section}>
            <SectionLabel>Free vs Pro</SectionLabel>
            <View style={s.planRow}>
              <PlanCard
                name="Free"
                price="Always free"
                isPro={false}
                items={[
                  `${FREE_TODO_LIMIT} todos`,
                  'Medium priority',
                  'Filter views',
                  'Dark & light mode',
                  'Biometric lock',
                  'Cloud sync',
                ]}
              />
              <PlanCard
                name="Pro"
                price="₦2,000 · one-time"
                isPro={true}
                items={[
                  'Unlimited todos',
                  'Low, Medium & High priority',
                  'Filter views',
                  'Dark & light mode',
                  'Biometric lock',
                  'Cloud sync',
                  'Transaction history',
                ]}
              />
            </View>
          </View>

          {/* Built with */}
          <View style={s.section}>
            <SectionLabel>Built with</SectionLabel>
            <StackRow name="Expo & React Native" detail="Cross-platform mobile" />
            <StackRow name="Supabase"            detail="Auth & database" />
            <StackRow name="Paystack"            detail="Payment processing" />
            <StackRow name="NativeWind"          detail="Styling" />
            <StackRow name="ClashGrotesk"        detail="Typography" />
          </View>

          {/* Footer */}
          <Text style={[s.footer, { color: theme.textSecondary }]}>Version 1.0.0</Text>

        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  safe:   { flex: 1 },
  scroll: { paddingHorizontal: Spacing.three, paddingTop: Spacing.four, paddingBottom: Spacing.six },

  hero:      { marginBottom: Spacing.five },
  heroTitle: { fontFamily: Fonts.bold, fontSize: 30, letterSpacing: -0.5, marginBottom: Spacing.two },
  heroSub:   { fontFamily: Fonts.regular, fontSize: 14, lineHeight: 22, marginBottom: Spacing.three },
  planChip:  { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: Radius.full },
  chipPro:   { backgroundColor: Brand.lavenderTonic },
  chipFree:  { backgroundColor: 'rgba(200,190,250,0.12)', borderWidth: 1, borderColor: '#2d2856' },
  chipText:  { fontFamily: Fonts.semibold, fontSize: 12 },

  section: { marginBottom: Spacing.five },
  planRow: { flexDirection: 'row', gap: Spacing.two },

  footer: { fontFamily: Fonts.regular, fontSize: 12, textAlign: 'center', paddingTop: Spacing.two },
});
