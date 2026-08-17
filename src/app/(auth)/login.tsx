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
// AuthInput — plain field
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
// PasswordInput — with show/hide toggle
// ---------------------------------------------------------------------------
function PasswordInput({
  label, value, onChangeText, placeholder, error,
}: {
  label: string; value: string; onChangeText: (v: string) => void;
  placeholder?: string; error?: string;
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
      {!!error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Screen
// ---------------------------------------------------------------------------
export default function LoginScreen() {
  const router = useRouter();
  const { showToast } = useToast();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const next: typeof fieldErrors = {};
    if (!email.trim()) next.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = 'Enter a valid email.';
    if (!password) next.password = 'Password is required.';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleLogin() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        showToast(error.message, 'error');
      } else {
        showToast('Logged in successfully!', 'success');
        router.replace('/(app)');
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
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Log in to your account</Text>
          </View>

          <View style={styles.card}>
            <AuthInput
              label="Email" value={email}
              onChangeText={v => { setEmail(v); setFieldErrors(p => ({ ...p, email: undefined })); }}
              placeholder="you@example.com" keyboardType="email-address"
              error={fieldErrors.email}
            />
            <PasswordInput
              label="Password" value={password}
              onChangeText={v => { setPassword(v); setFieldErrors(p => ({ ...p, password: undefined })); }}
              placeholder="••••••••"
              error={fieldErrors.password}
            />

            <Link href="/(auth)/forgot-password" asChild>
              <Pressable style={styles.forgotBtn} accessibilityRole="link">
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>
            </Link>

            <Pressable
              style={[styles.submitBtn, loading && styles.submitBtnDisabled]}
              onPress={handleLogin} disabled={loading}
              accessibilityRole="button" accessibilityLabel="Log in">
              {loading
                ? <ActivityIndicator color={Brand.championBlue} />
                : <Text style={styles.submitText}>Log In</Text>}
            </Pressable>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable accessibilityRole="link">
                <Text style={styles.footerLink}>Sign up</Text>
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
  scroll: { flexGrow: 1, paddingHorizontal: Spacing.three, paddingTop: Spacing.six, paddingBottom: Spacing.five },

  header:   { alignItems: 'center', marginBottom: Spacing.five },
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

  forgotBtn:  { alignSelf: 'flex-end', marginTop: -Spacing.two },
  forgotText: { fontFamily: Fonts.medium, fontSize: 13, color: Brand.lavenderTonic },

  submitBtn:         { height: 52, borderRadius: Radius.md, backgroundColor: Brand.lavenderTonic, alignItems: 'center', justifyContent: 'center', marginTop: Spacing.one },
  submitBtnDisabled: { opacity: 0.6 },
  submitText:        { fontFamily: Fonts.bold, color: Brand.championBlue, fontSize: 16, letterSpacing: 0.3 },

  footer:     { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: Spacing.four },
  footerText: { fontFamily: Fonts.regular, color: 'rgba(200,190,250,0.55)', fontSize: 14 },
  footerLink: { fontFamily: Fonts.semibold, color: Brand.lavenderTonic, fontSize: 14 },
});
