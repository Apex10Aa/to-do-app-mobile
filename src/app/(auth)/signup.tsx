import { useToast } from '@/components/toast';
import { Brand, Fonts, Radius, Spacing } from '@/constants/theme';
import { supabase } from '@/lib/supabase';
import { Link, useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ---------------------------------------------------------------------------
// AuthInput — plain field (no toggle)
// ---------------------------------------------------------------------------
function AuthInput({
  label, value, onChangeText, placeholder,
  secureTextEntry, keyboardType, autoCapitalize, error,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; secureTextEntry?: boolean;
  keyboardType?: React.ComponentProps<typeof TextInput>['keyboardType'];
  autoCapitalize?: React.ComponentProps<typeof TextInput>['autoCapitalize'];
  error?: string;
}) {
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, !!error && styles.inputError]}
        value={value} onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor="rgba(200,190,250,0.4)" secureTextEntry={secureTextEntry}
        keyboardType={keyboardType} autoCapitalize={autoCapitalize ?? 'none'}
        autoCorrect={false} accessibilityLabel={label}
      />
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// PasswordInput — with show/hide eye toggle + optional children (strength bar)
// ---------------------------------------------------------------------------
function PasswordInput({
  label, value, onChangeText, placeholder, error, children,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; error?: string; children?: React.ReactNode;
}) {
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.fieldWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputRow, !!error && styles.inputRowError]}>
        <TextInput
          style={styles.inputInner}
          value={value} onChangeText={onChangeText}
          placeholder={placeholder} placeholderTextColor="rgba(200,190,250,0.4)"
          secureTextEntry={!visible} autoCapitalize="none" autoCorrect={false}
          accessibilityLabel={label}
        />
        <Pressable
          onPress={() => setVisible(v => !v)}
          style={styles.eyeBtn}
          accessibilityRole="button"
          accessibilityLabel={visible ? 'Hide password' : 'Show password'}>
          <Text style={styles.eyeText}>{visible ? '○' : '●'}</Text>
        </Pressable>
      </View>
      {children}
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Password strength indicator
// ---------------------------------------------------------------------------
function PasswordStrength({ password }: { password: string }) {
  const checks = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)];
  const score  = checks.filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#2d2856', '#f07070', '#f0b770', '#9b86e8', '#5fbf8a'];
  if (!password) return null;
  return (
    <View style={strengthStyles.wrapper}>
      <View style={strengthStyles.bars}>
        {[0, 1, 2, 3].map(i => (
          <View key={i} style={[strengthStyles.bar, { backgroundColor: i < score ? colors[score] : '#2d2856' }]} />
        ))}
      </View>
      <Text style={[strengthStyles.label, { color: colors[score] }]}>{labels[score]}</Text>
    </View>
  );
}
const strengthStyles = StyleSheet.create({
  wrapper: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  bars:    { flexDirection: 'row', gap: 4, flex: 1 },
  bar:     { flex: 1, height: 3, borderRadius: 2 },
  label:   { fontFamily: Fonts.semibold, fontSize: 11, minWidth: 40 },
});

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function SignupScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string; email?: string; password?: string; confirm?: string;
  }>({});

  function clearField(key: keyof typeof fieldErrors) {
    setFieldErrors(p => ({ ...p, [key]: undefined }));
  }

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!fullName.trim()) next.fullName = 'Full name is required.';
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (!password) next.password = 'Password is required.';
    else if (password.length < 8) next.password = 'Must be at least 8 characters.';
    if (!confirm) next.confirm = 'Please confirm your password.';
    else if (confirm !== password) next.confirm = 'Passwords do not match.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSignup() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });

      if (error) {
        showToast(error.message, 'error');
        return;
      }

      if (data.session) {
        showToast('Account created! Welcome 🎉', 'success');
        router.replace('/(app)');
      } else {
        showToast('Check your email to confirm your account.', 'info');
      }
    } catch (e: any) {
      showToast(e?.message ?? 'Something went wrong.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>

          <View style={styles.header}>
            <View style={styles.logoMark} />
            <Text style={styles.title}>Create account</Text>
            <Text style={styles.subtitle}>Free forever. No credit card needed.</Text>
          </View>

          <View style={styles.card}>
            <AuthInput
              label="Full Name" value={fullName}
              onChangeText={v => { setFullName(v); clearField('fullName'); }}
              placeholder="Jane Doe" autoCapitalize="words"
              error={fieldErrors.fullName}
            />
            <AuthInput
              label="Email" value={email}
              onChangeText={v => { setEmail(v); clearField('email'); }}
              placeholder="you@example.com" keyboardType="email-address"
              error={fieldErrors.email}
            />
            <PasswordInput
              label="Password" value={password}
              onChangeText={v => { setPassword(v); clearField('password'); }}
              placeholder="Min. 8 characters"
              error={fieldErrors.password}>
              <PasswordStrength password={password} />
            </PasswordInput>
            <PasswordInput
              label="Confirm Password" value={confirm}
              onChangeText={v => { setConfirm(v); clearField('confirm'); }}
              placeholder="Repeat password"
              error={fieldErrors.confirm}
            />

            <Text style={styles.terms}>
              By signing up you agree to our{' '}
              <Text style={styles.termsLink}>Terms of Service</Text>
              {' '}and{' '}
              <Text style={styles.termsLink}>Privacy Policy</Text>.
            </Text>

            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleSignup} disabled={loading}
              accessibilityRole="button" accessibilityLabel="Create account">
              {loading
                ? <ActivityIndicator color={Brand.championBlue} />
                : <Text style={styles.submitText}>Create Account</Text>}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable accessibilityRole="link">
                <Text style={styles.footerLink}>Log in</Text>
              </Pressable>
            </Link>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------
const styles = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: Brand.championBlue },
  flex:   { flex: 1 },
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.five, paddingBottom: Spacing.five },

  header:   { alignItems: 'center', marginBottom: Spacing.four },
  logoMark: { width: 56, height: 56, borderRadius: Radius.md, backgroundColor: Brand.lavenderTonic, marginBottom: Spacing.three, opacity: 0.9 },
  title:    { fontFamily: Fonts.bold,    fontSize: 28, color: Brand.lavenderTonic, letterSpacing: 0.3 },
  subtitle: { fontFamily: Fonts.regular, marginTop: Spacing.one, fontSize: 15, color: 'rgba(200,190,250,0.6)' },

  card: { backgroundColor: '#1e1a3a', borderRadius: Radius.lg, padding: Spacing.four, gap: Spacing.three, borderWidth: 1, borderColor: '#2d2856' },

  fieldWrapper: { gap: Spacing.one },
  label:        { fontFamily: Fonts.semibold, fontSize: 13, color: Brand.lavenderTonic, letterSpacing: 0.3 },

  input:       { fontFamily: Fonts.regular, height: 48, borderRadius: Radius.sm, borderWidth: 1, borderColor: '#2d2856', backgroundColor: '#151130', paddingHorizontal: Spacing.three, color: '#e4d9fd', fontSize: 15 },
  inputError:  { borderColor: '#f07070' },

  inputRow:      { flexDirection: 'row', alignItems: 'center', height: 48, borderRadius: Radius.sm, borderWidth: 1, borderColor: '#2d2856', backgroundColor: '#151130', paddingLeft: Spacing.three, paddingRight: Spacing.two },
  inputRowError: { borderColor: '#f07070' },
  inputInner:    { flex: 1, fontFamily: Fonts.regular, color: '#e4d9fd', fontSize: 15, height: '100%' },
  eyeBtn:        { padding: Spacing.two, justifyContent: 'center', alignItems: 'center' },
  eyeText:       { fontSize: 20, color: 'rgba(200,190,250,0.5)', lineHeight: 22 },

  errorText: { fontFamily: Fonts.regular, fontSize: 12, color: '#f07070', lineHeight: 16 },

  terms:     { fontFamily: Fonts.regular, fontSize: 12, color: 'rgba(200,190,250,0.5)', lineHeight: 18, textAlign: 'center' },
  termsLink: { fontFamily: Fonts.semibold, color: Brand.lavenderTonic },

  submitBtn:         { height: 52, borderRadius: Radius.md, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.one },
  submitBtnDisabled: { opacity: 0.6 },
  submitText:        { fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 16, letterSpacing: 0.3 },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.four },
  footerText: { fontFamily: Fonts.regular, color: 'rgba(200,190,250,0.55)', fontSize: 14 },
  footerLink: { fontFamily: Fonts.semibold, color: Brand.lavenderTonic, fontSize: 14 },
});
