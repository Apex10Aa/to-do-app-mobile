import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { useSharedProfile } from '@/contexts/profile-context';
import { useTheme } from '@/hooks/use-theme';
import { type Transaction } from '@/hooks/use-transactions';

// ---------------------------------------------------------------------------
// Status chip
// ---------------------------------------------------------------------------
function StatusChip({ status }: { status: Transaction['status'] }) {
  const cfg = {
    success: { bg: 'rgba(95,191,138,0.12)',  border: 'rgba(95,191,138,0.35)',  text: '#5fbf8a',  label: 'Success' },
    pending: { bg: 'rgba(240,183,112,0.12)', border: 'rgba(240,183,112,0.35)', text: '#f0b770',  label: 'Pending' },
    failed:  { bg: 'rgba(240,112,112,0.12)', border: 'rgba(240,112,112,0.35)', text: '#f07070',  label: 'Failed'  },
  }[status];

  return (
    <View style={[chip.wrap, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
      <Text style={[chip.label, { color: cfg.text }]}>{cfg.label}</Text>
    </View>
  );
}
const chip = StyleSheet.create({
  wrap:  { paddingHorizontal: 8, paddingVertical: 2, borderRadius: Radius.full, borderWidth: 1 },
  label: { fontFamily: Fonts.semibold, fontSize: 11 },
});

// ---------------------------------------------------------------------------
// Transaction row
// ---------------------------------------------------------------------------
function TxRow({ tx }: { tx: Transaction }) {
  const theme = useTheme();
  const date  = new Date(tx.created_at).toLocaleDateString('en-NG', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
  const amountNGN = (tx.amount / 100).toLocaleString('en-NG', {
    style: 'currency', currency: tx.currency, minimumFractionDigits: 2,
  });

  return (
    <View style={[row.wrap, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
      {/* Left — icon */}
      <View style={[row.iconWrap, { backgroundColor: 'rgba(200,190,250,0.08)' }]}>
        <Text style={row.icon}>₦</Text>
      </View>

      {/* Middle — ref + date */}
      <View style={row.middle}>
        <Text style={[row.ref, { color: theme.text }]} numberOfLines={1}>
          {tx.reference}
        </Text>
        <Text style={[row.date, { color: theme.textSecondary }]}>{date}</Text>
      </View>

      {/* Right — amount + status */}
      <View style={row.right}>
        <Text style={[row.amount, { color: theme.text }]}>{amountNGN}</Text>
        <StatusChip status={tx.status} />
      </View>
    </View>
  );
}
const row = StyleSheet.create({
  wrap:     { flexDirection: 'row', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, padding: Spacing.three, gap: Spacing.two },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  icon:     { fontFamily: Fonts.bold, fontSize: 18, color: Brand.lavenderTonic },
  middle:   { flex: 1, gap: 2 },
  ref:      { fontFamily: Fonts.medium, fontSize: 13 },
  date:     { fontFamily: Fonts.regular, fontSize: 12 },
  right:    { alignItems: 'flex-end', gap: 4 },
  amount:   { fontFamily: Fonts.semibold, fontSize: 14 },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function TransactionsScreen() {
  const theme                                          = useTheme();
  const { transactions, transactionsLoading: loading } = useSharedProfile();

  return (
    <View style={[styles.screen, { backgroundColor: theme.background }]}>
      <SafeAreaView style={styles.safe}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>Transactions</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your payment history
          </Text>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator color={Brand.lavenderTonic} />
          </View>
        ) : (
          <FlatList
            data={transactions}
            keyExtractor={t => t.id}
            contentContainerStyle={styles.list}
            ItemSeparatorComponent={() => <View style={{ height: Spacing.two }} />}
            renderItem={({ item }) => <TxRow tx={item} />}
            ListEmptyComponent={
              <View style={styles.center}>
                <Text style={[styles.empty, { color: theme.textSecondary }]}>
                  No transactions yet.{'\n'}Upgrade to Pro to get started.
                </Text>
              </View>
            }
          />
        )}

      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen:   { flex: 1 },
  safe:     { flex: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.four },
  header:   { marginBottom: Spacing.four, gap: 2 },
  title:    { fontFamily: Fonts.bold,    fontSize: 28, letterSpacing: -0.3 },
  subtitle: { fontFamily: Fonts.regular, fontSize: 13 },
  list:     { paddingBottom: Spacing.six },
  center:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: Spacing.six },
  empty:    { fontFamily: Fonts.regular, fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
