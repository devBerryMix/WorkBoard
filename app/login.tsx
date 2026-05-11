import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useState } from 'react';
import { login } from '@/src/services/authService';
import { useAuth } from '@/src/contexts/AuthContext';

export default function LoginScreen() {
  const { setUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim()) {
      setError('아이디를 입력해주세요.');
      return;
    }
    if (!password) {
      setError('비밀번호를 입력해주세요.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      setUser(user);
    } catch {
      setError('아이디 또는 비밀번호가 올바르지 않습니다.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.inner}>
        {/* App name */}
        <View style={styles.logoArea}>
          <Text style={styles.appName}>WorkBoard</Text>
          <Text style={styles.appSub}>근태관리 시스템</Text>
        </View>

        {/* Login card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>로그인</Text>

          <Text style={styles.label}>아이디 (이메일)</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={(t) => { setEmail(t); setError(''); }}
            placeholder="이메일 주소를 입력하세요"
            placeholderTextColor="#B0A090"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={[styles.label, { marginTop: 14 }]}>비밀번호</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={(t) => { setPassword(t); setError(''); }}
            placeholder="비밀번호를 입력하세요"
            placeholderTextColor="#B0A090"
            secureTextEntry
            editable={!loading}
          />

          {error !== '' && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <TouchableOpacity
            style={[styles.loginBtn, loading && styles.loginBtnDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#1C150C" />
            ) : (
              <Text style={styles.loginBtnText}>로그인</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C150C',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 36,
  },
  appName: {
    fontSize: 36,
    fontWeight: '800',
    color: '#F5EDD8',
    letterSpacing: -0.5,
  },
  appSub: {
    fontSize: 14,
    color: '#A08040',
    marginTop: 6,
    fontWeight: '500',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    shadowColor: '#1C150C',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1508',
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4A3C2E',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E4D8C8',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: '#1C1508',
    backgroundColor: '#F2EDE5',
  },
  errorText: {
    marginTop: 12,
    fontSize: 13,
    color: '#B83030',
    textAlign: 'center',
  },
  loginBtn: {
    backgroundColor: '#C8A84E',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 24,
  },
  loginBtnDisabled: {
    backgroundColor: '#D4C4A0',
  },
  loginBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1C1508',
  },
});
