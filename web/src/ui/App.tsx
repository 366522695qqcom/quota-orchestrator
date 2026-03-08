import React, { useEffect, useMemo, useState } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { UsageChart } from './UsageChart';

type ProviderType = 'vercel' | 'cloudflare' | 'netlify' | 'render';

type ProviderConfig = {
  id: string;
  provider: ProviderType;
  accountId: string;
  apiToken: string;
  extra?: Record<string, any>;
  createdAt: string;
  quotaRules?: QuotaRule[];
};

type QuotaRule = {
  id: string;
  metricName: string;
  limitValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  stopThreshold: number;
};

type UsageSnapshot = {
  id: string;
  provider: ProviderType;
  accountId: string;
  periodStart: string;
  periodEnd: string;
  metrics: Record<string, number | string | boolean>;
  raw: any;
  createdAt: string;
};

type Alert = {
  id: string;
  provider: ProviderType;
  accountId: string;
  metricName: string;
  currentValue: number;
  threshold: number;
  level: 'WARNING' | 'CRITICAL' | 'STOPPED';
  message: string;
  sentAt: string;
};

type ServiceControl = {
  id: string;
  provider: ProviderType;
  accountId: string;
  action: 'STOP' | 'START' | 'RESTART';
  reason: string;
  executedAt: string;
  executedBy: string;
};

type ScheduledRecovery = {
  id: string;
  provider: ProviderType;
  accountId: string;
  scheduledFor: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  createdAt: string;
  executedAt?: string;
};

const STORAGE_KEY = 'quota-orchestrator.provider-configs.v1';

function uid() {
  return Math.random().toString(16).slice(2) + Date.now().toString(16);
}

function loadLang(): 'zh' | 'en' {
  const raw = localStorage.getItem('quota-orchestrator.lang.v1');
  return raw === 'en' ? 'en' : 'zh';
}

function saveLang(lang: 'zh' | 'en') {
  localStorage.setItem('quota-orchestrator.lang.v1', lang);
}

function loadAuth(): { token: string; expiresAt?: number } | null {
  try {
    const raw = localStorage.getItem('quota-orchestrator.auth.v1');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.token) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveAuth(token: string, expiresAt?: number) {
  localStorage.setItem('quota-orchestrator.auth.v1', JSON.stringify({ token, expiresAt }));
}

function clearAuth() {
  localStorage.removeItem('quota-orchestrator.auth.v1');
}

async function postJson<T>(url: string, body: any, token?: string): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

async function getJson<T>(url: string, token?: string): Promise<T> {
  const res = await fetch(url, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

function classNames(...xs: Array<string | false | null | undefined>) {
  return xs.filter(Boolean).join(' ');
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="text-sm font-medium text-slate-200">{label}</div>
      {hint ? <div className="text-xs text-slate-400 mt-0.5">{hint}</div> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={classNames(
        'w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100',
        'placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500',
        props.className,
      )}
    />
  );
}

function Button({
  variant = 'primary',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'danger';
}) {
  const base =
    'inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950';
  const styles =
    variant === 'primary'
      ? 'bg-indigo-500 hover:bg-indigo-400 text-white focus:ring-indigo-500'
      : variant === 'danger'
        ? 'bg-rose-600 hover:bg-rose-500 text-white focus:ring-rose-600'
        : 'bg-slate-900/50 hover:bg-slate-900 text-slate-100 border border-slate-700 focus:ring-slate-500';
  return <button {...props} className={classNames(base, styles, props.className)} />;
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-950/40 shadow-sm">
      {children}
    </div>
  );
}

function CodeBlock({ value }: { value: any }) {
  const text = useMemo(() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }, [value]);
  return (
    <pre className="text-xs overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-3 text-slate-200">
      <code>{text}</code>
    </pre>
  );
}

export function App() {
  const [lang, setLang] = useState<'zh' | 'en'>(() => loadLang());
  const [configs, setConfigs] = useState<ProviderConfig[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const [formProvider, setFormProvider] = useState<ProviderType>('vercel');
  const [formAccountId, setFormAccountId] = useState('');
  const [formApiToken, setFormApiToken] = useState('');
  const [formAccountSlug, setFormAccountSlug] = useState('');
  const [formAccountTag, setFormAccountTag] = useState('');

  const [health, setHealth] = useState<'unknown' | 'ok' | 'fail'>('unknown');
  const [healthError, setHealthError] = useState<string | null>(null);

  const [testingId, setTestingId] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<UsageSnapshot | null>(null);
  const [testError, setTestError] = useState<string | null>(null);

  const [authToken, setAuthToken] = useState<string | null>(() => loadAuth()?.token ?? null);
  const [loginUser, setLoginUser] = useState('');
  const [loginPass, setLoginPass] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const [activeTab, setActiveTab] = useState<'overview' | 'quota' | 'history' | 'alerts' | 'controls' | 'backup' | 'settings'>('overview');
  const [backups, setBackups] = useState<Array<{ filename: string; size: string; createdAt: string }>>([]);
  const [backupsLoading, setBackupsLoading] = useState(false);
  const [smtpConfig, setSmtpConfig] = useState<{ host?: string; port?: number; user?: string; password?: string; from?: string }>({});
  const [smtpTestLoading, setSmtpTestLoading] = useState(false);
  const t = useMemo(() => {
    const dict = {
      zh: {
        title: '额度编排管理后台',
        subtitle: '管理多个部署平台的免费配额，自动停止超限服务。',
        apiHealth: 'API',
        healthy: '正常',
        down: '不可用',
        unknown: '未知',
        login: '登录',
        username: '用户名',
        password: '密码',
        signIn: '登录',
        signOut: '退出登录',
        providerConfig: '新增 Provider 配置',
        saved: '已保存的配置',
        testUsage: '测试用量',
        testing: '测试中…',
        delete: '删除',
        add: '添加',
        overview: '概览',
        quota: '额度规则',
        history: '历史记录',
        alerts: '告警记录',
        controls: '服务控制',
        stopService: '停止服务',
        startService: '启动服务',
        scheduleRecovery: '定时恢复',
        cancelRecovery: '取消恢复',
        metrics: '指标',
        raw: '原始响应',
        runTest: '点击"测试用量"查看结果。',
        missingAuth: '请先登录再使用。',
        quotaRules: '额度规则',
        addRule: '添加规则',
        warningThreshold: '警告阈值 (%)',
        criticalThreshold: '严重阈值 (%)',
        stopThreshold: '停止阈值 (%)',
        limitValue: '配额限制',
        backup: '数据库备份',
        downloadBackup: '下载备份',
        createBackup: '创建备份',
        restoreBackup: '恢复备份',
        deleteBackup: '删除备份',
        testConfig: '测试配置',
        cancelConfig: '取消配置',
        settings: '设置',
        smtpConfig: 'SMTP 配置',
        smtpHost: 'SMTP 服务器',
        smtpPort: 'SMTP 端口',
        smtpUser: 'SMTP 用户名',
        smtpPassword: 'SMTP 密码',
        smtpFrom: '发件人',
        saveSmtpConfig: '保存 SMTP 配置',
        testSmtp: '发送测试邮件',
      },
      en: {
        title: 'Quota Orchestrator Admin',
        subtitle: 'Manage free quotas across deployment platforms, auto-stop when exceeded.',
        apiHealth: 'API',
        healthy: 'healthy',
        down: 'down',
        unknown: 'unknown',
        login: 'Login',
        username: 'Username',
        password: 'Password',
        signIn: 'Sign in',
        signOut: 'Sign out',
        providerConfig: 'Add provider config',
        saved: 'Saved configs',
        testUsage: 'Test usage',
        testing: 'Testing…',
        delete: 'Delete',
        add: 'Add',
        overview: 'Overview',
        quota: 'Quota Rules',
        history: 'History',
        alerts: 'Alerts',
        controls: 'Service Control',
        stopService: 'Stop Service',
        startService: 'Start Service',
        scheduleRecovery: 'Schedule Recovery',
        cancelRecovery: 'Cancel Recovery',
        metrics: 'Metrics',
        raw: 'Raw response',
        runTest: 'Run a test to see usage metrics here.',
        missingAuth: 'Please log in first.',
        quotaRules: 'Quota Rules',
        addRule: 'Add Rule',
        warningThreshold: 'Warning (%)',
        criticalThreshold: 'Critical (%)',
        stopThreshold: 'Stop (%)',
        limitValue: 'Limit',
      },
    } as const;
    return dict[lang];
  }, [lang]);

  useEffect(() => {
    loadConfigs();
  }, [authToken]);

  useEffect(() => {
    if (activeTab === 'backup' && authToken) {
      loadBackups();
    }
  }, [activeTab, authToken]);

  async function loadBackups() {
    if (!authToken) return;
    setBackupsLoading(true);
    try {
      const data = await getJson<{ ok: boolean; backups: Array<{ filename: string; size: string; createdAt: string }> }>('/api/backup', authToken);
      setBackups(data.backups);
    } catch (error) {
      console.error('Failed to load backups:', error);
    } finally {
      setBackupsLoading(false);
    }
  }

  async function createBackup() {
    if (!authToken) return;
    try {
      await postJson('/api/backup', {}, authToken);
      await loadBackups();
    } catch (error) {
      alert(error?.message ?? 'Failed to create backup');
    }
  }

  async function deleteBackup(filename: string) {
    if (!confirm('Are you sure you want to delete this backup?')) return;
    try {
      await fetch(`/api/backup/${filename}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await loadBackups();
    } catch (error) {
      alert(error?.message ?? 'Failed to delete backup');
    }
  }

  async function restoreBackup(filename: string) {
    if (!confirm('Are you sure you want to restore from this backup?')) return;
    try {
      await postJson(`/api/backup/restore/${filename}`, {}, authToken);
      alert('Backup restored successfully');
    } catch (error) {
      alert(error?.message ?? 'Failed to restore backup');
    }
  }

  async function downloadBackup(filename: string) {
    try {
      const res = await fetch(`/api/backup/download/${filename}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert(error?.message ?? 'Failed to download backup');
    }
  }

  async function testProviderConfig(id: string) {
    if (!authToken) return;
    try {
      const data = await postJson<{ ok: boolean; snapshot: UsageSnapshot }>(`/api/provider-configs/${id}/test`, {}, authToken);
      setSnapshot(data.snapshot);
      setTestError(null);
    } catch (error) {
      setSnapshot(null);
      setTestError(error?.message ?? 'Failed to test config');
    }
  }

  async function cancelProviderConfig(id: string) {
    if (!confirm('Are you sure you want to cancel this config?')) return;
    try {
      await fetch(`/api/provider-configs/${id}/cancel`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await loadConfigs();
      if (selectedId === id) setSelectedId(null);
    } catch (error) {
      alert(error?.message ?? 'Failed to cancel config');
    }
  }

  async function loadSmtpConfig() {
    if (!authToken) return;
    try {
      const data = await getJson<{ ok: boolean; config: any }>('/api/smtp-config', authToken);
      setSmtpConfig(data.config || {});
    } catch (error) {
      console.error('Failed to load SMTP config:', error);
    }
  }

  async function saveSmtpConfig() {
    if (!authToken) return;
    try {
      await postJson('/api/smtp-config', smtpConfig, authToken);
      alert('SMTP 配置保存成功！');
    } catch (error) {
      alert(error?.message ?? 'Failed to save SMTP config');
    }
  }

  async function testSmtpConfig() {
    if (!authToken) return;
    setSmtpTestLoading(true);
    try {
      await postJson('/api/smtp-config/test', {}, authToken);
      alert('测试邮件发送成功！请检查邮箱。');
    } catch (error) {
      alert(error?.message ?? 'Failed to send test email');
    } finally {
      setSmtpTestLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (cancelled) return;
        setHealth('ok');
        setHealthError(null);
      } catch (e: any) {
        if (cancelled) return;
        setHealth('fail');
        setHealthError(e?.message ?? String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    saveLang(lang);
  }, [lang]);

  useEffect(() => {
    loadSmtpConfig();
  }, [authToken]);

  async function loadConfigs() {
    if (!authToken) return;
    try {
      const data = await getJson<ProviderConfig[]>('/api/provider-configs', authToken);
      setConfigs(data);
      if (data.length > 0 && !selectedId) {
        setSelectedId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load configs:', error);
    }
  }

  async function doLogin() {
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await postJson<{ ok: boolean; token: string; expiresAt: number }>(
        '/api/auth/login',
        { username: loginUser, password: loginPass },
      );
      if (!res.ok || !res.token) throw new Error('Login failed');
      saveAuth(res.token, res.expiresAt);
      setAuthToken(res.token);
      setLoginPass('');
      await loadConfigs();
    } catch (e: any) {
      setLoginError(e?.message ?? String(e));
    } finally {
      setLoggingIn(false);
    }
  }

  async function doLogout() {
    const token = authToken;
    clearAuth();
    setAuthToken(null);
    setConfigs([]);
    setSelectedId(null);
    setSnapshot(null);
    setTestError(null);
    if (token) {
      try {
        await postJson('/api/auth/logout', {}, token);
      } catch {
        // ignore
      }
    }
  }

  function resetForm() {
    setFormProvider('vercel');
    setFormAccountId('');
    setFormApiToken('');
    setFormAccountSlug('');
    setFormAccountTag('');
  }

  async function addConfig() {
    const extra: Record<string, any> = {};
    if (formProvider === 'netlify') extra.accountSlug = formAccountSlug.trim();
    if (formProvider === 'cloudflare') extra.accountTag = formAccountTag.trim();

    try {
      await postJson('/api/provider-configs', {
        provider: formProvider,
        accountId: formAccountId.trim() || 'default',
        apiToken: formApiToken.trim(),
        extra: Object.keys(extra).length ? extra : undefined,
      }, authToken);
      await loadConfigs();
      setShowForm(false);
      resetForm();
    } catch (e: any) {
      alert(e?.message ?? 'Failed to add config');
    }
  }

  async function removeConfig(id: string) {
    if (!confirm('Are you sure you want to delete this config?')) return;
    try {
      await fetch(`/api/provider-configs/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      await loadConfigs();
      if (selectedId === id) setSelectedId(null);
    } catch (e: any) {
      alert(e?.message ?? 'Failed to delete config');
    }
  }

  const selected = configs.find((c) => c.id === selectedId) ?? null;

  async function testUsage() {
    if (!selected) return;
    setTestingId(selected.id);
    setSnapshot(null);
    setTestError(null);
    try {
      const snap = await postJson<UsageSnapshot>('/api/usage/test', {
        accountId: selected.id,
      }, authToken);
      setSnapshot(snap);
    } catch (e: any) {
      setTestError(e?.message ?? String(e));
    } finally {
      setTestingId(null);
    }
  }

  async function executeServiceControl(action: 'STOP' | 'START' | 'RESTART') {
    if (!selected) return;
    try {
      await postJson('/api/service-control/execute', {
        configId: selected.id,
        action,
        reason: `Manual ${action} by user`,
      }, authToken);
      alert(`Service ${action.toLowerCase()}ed successfully`);
    } catch (e: any) {
      alert(e?.message ?? `Failed to ${action.toLowerCase()} service`);
    }
  }

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-2xl font-semibold tracking-tight">{t.title}</div>
            <div className="mt-2 text-sm text-slate-400">{t.subtitle}</div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <button
                className={classNames(
                  'rounded-lg px-2 py-1 text-xs border',
                  lang === 'zh'
                    ? 'border-indigo-600/60 bg-indigo-500/10 text-indigo-200'
                    : 'border-slate-700 bg-slate-900/40 text-slate-200',
                )}
                onClick={() => setLang('zh')}
              >
                中文
              </button>
              <button
                className={classNames(
                  'rounded-lg px-2 py-1 text-xs border',
                  lang === 'en'
                    ? 'border-indigo-600/60 bg-indigo-500/10 text-indigo-200'
                    : 'border-slate-700 bg-slate-900/40 text-slate-200',
                )}
                onClick={() => setLang('en')}
              >
                EN
              </button>
            </div>
            <div
              className={classNames(
                'rounded-full px-3 py-1 text-xs font-medium border',
                health === 'ok'
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-700/40'
                  : health === 'fail'
                    ? 'bg-rose-500/10 text-rose-300 border-rose-700/40'
                    : 'bg-slate-900/40 text-slate-300 border-slate-700/60',
              )}
            >
              {t.apiHealth}:{' '}
              {health === 'ok' ? t.healthy : health === 'fail' ? t.down : t.unknown}
            </div>

            {authToken ? (
              <Button variant="ghost" type="button" onClick={doLogout}>
                {t.signOut}
              </Button>
            ) : null}
          </div>
        </div>

        {health === 'fail' && healthError ? (
          <div className="mt-4 rounded-xl border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200">
            {healthError}
          </div>
        ) : null}

        {!authToken ? (
          <div className="mt-8 max-w-md">
            <Card>
              <div className="p-5 border-b border-slate-800">
                <div className="text-sm font-semibold">{t.login}</div>
              </div>
              <div className="p-5 space-y-4">
                <Field label={t.username}>
                  <TextInput
                    value={loginUser}
                    onChange={(e) => setLoginUser(e.target.value)}
                    placeholder={lang === 'zh' ? '输入用户名' : 'Enter username'}
                    autoComplete="username"
                  />
                </Field>
                <Field label={t.password}>
                  <TextInput
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder={lang === 'zh' ? '输入密码' : 'Enter password'}
                    type="password"
                    autoComplete="current-password"
                  />
                </Field>
                {loginError ? (
                  <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200 whitespace-pre-wrap">
                    {loginError}
                  </div>
                ) : null}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={doLogin}
                    disabled={!loginUser.trim() || !loginPass || loggingIn}
                  >
                    {loggingIn ? (lang === 'zh' ? '登录中…' : 'Signing in…') : t.signIn}
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Card>
                <div className="p-5 border-b border-slate-800 flex items-center justify-between">
                  <div className="text-sm font-semibold">{t.saved}</div>
                  <Button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    variant="ghost"
                  >
                    {showForm ? '×' : t.add}
                  </Button>
                </div>

                {showForm && (
                  <div className="p-5 space-y-4 border-b border-slate-800">
                    <Field label="Provider">
                      <select
                        value={formProvider}
                        onChange={(e) => setFormProvider(e.target.value as ProviderType)}
                        className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="vercel">Vercel</option>
                        <option value="cloudflare">Cloudflare</option>
                        <option value="netlify">Netlify</option>
                        <option value="render">Render</option>
                      </select>
                    </Field>

                    <Field label="Account ID">
                      <TextInput
                        value={formAccountId}
                        onChange={(e) => setFormAccountId(e.target.value)}
                        placeholder="e.g. personal"
                      />
                    </Field>

                    <Field label="API Token">
                      <TextInput
                        value={formApiToken}
                        onChange={(e) => setFormApiToken(e.target.value)}
                        placeholder="paste token here"
                        type="password"
                      />
                    </Field>

                    {formProvider === 'netlify' && (
                      <Field label="Netlify accountSlug">
                        <TextInput
                          value={formAccountSlug}
                          onChange={(e) => setFormAccountSlug(e.target.value)}
                          placeholder="my-account"
                        />
                      </Field>
                    )}

                    {formProvider === 'cloudflare' && (
                      <Field label="Cloudflare accountTag">
                        <TextInput
                          value={formAccountTag}
                          onChange={(e) => setFormAccountTag(e.target.value)}
                          placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        />
                      </Field>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <Button variant="ghost" type="button" onClick={() => { setShowForm(false); resetForm(); }}>
                        Cancel
                      </Button>
                      <Button type="button" onClick={addConfig}>
                        {t.add}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="p-3">
                  {configs.length === 0 ? (
                    <div className="p-4 text-sm text-slate-400">No configs yet.</div>
                  ) : (
                    <div className="space-y-2">
                      {configs.map((c) => (
                        <div key={c.id} className="rounded-xl border border-slate-800 bg-slate-950/20 p-4">
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex-1">
                              <div className="text-sm font-semibold">
                                {c.provider} / {c.accountId}
                              </div>
                              <div className="text-xs text-slate-400">
                                {new Date(c.createdAt).toLocaleString()}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                onClick={() => testProviderConfig(c.id)}
                                disabled={testingId === c.id}
                              >
                                {testingId === c.id ? t.testing : t.testConfig}
                              </Button>
                              <Button
                                type="button"
                                variant="danger"
                                onClick={() => cancelProviderConfig(c.id)}
                              >
                                {t.cancelConfig}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            <div className="lg:col-span-8">
              <Card>
                <div className="p-5 border-b border-slate-800">
                  <div className="flex gap-2">
                    {(['overview', 'quota', 'history', 'alerts', 'controls', 'backup'] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={classNames(
                          'px-3 py-1.5 text-sm font-medium rounded-lg transition',
                          activeTab === tab
                            ? 'bg-indigo-500 text-white'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50',
                        )}
                      >
                        {t[tab as keyof typeof t]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-5">
                  {!selected ? (
                    <div className="text-sm text-slate-400">Select a config on the left.</div>
                  ) : (
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-4">
                          <div className="text-xs text-slate-400">Provider</div>
                          <div className="mt-1 text-sm font-semibold">{selected.provider}</div>
                        </div>
                        <div className="rounded-xl border border-slate-800 bg-slate-950/20 p-4">
                          <div className="text-xs text-slate-400">Account ID</div>
                          <div className="mt-1 text-sm font-semibold">{selected.accountId}</div>
                        </div>
                      </div>

                      {activeTab === 'overview' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="text-sm font-semibold mb-2">{t.testUsage}</div>
                            </div>
                            <Button
                              type="button"
                              onClick={testUsage}
                              disabled={testingId === selected.id}
                            >
                              {testingId === selected.id ? t.testing : t.testUsage}
                            </Button>
                          </div>

                          {testError ? (
                            <div className="rounded-xl border border-rose-800/60 bg-rose-950/40 px-4 py-3 text-sm text-rose-200 whitespace-pre-wrap">
                              {testError}
                            </div>
                          ) : null}

                          {snapshot ? (
                            <div className="space-y-4">
                              <div>
                                <div className="text-sm font-semibold mb-2">{t.metrics}</div>
                                <CodeBlock value={snapshot.metrics} />
                              </div>
                              <details className="rounded-xl border border-slate-800 bg-slate-950/20 p-4">
                                <summary className="cursor-pointer text-sm font-semibold text-slate-200">
                                  {t.raw}
                                </summary>
                                <div className="mt-3">
                                  <CodeBlock value={snapshot.raw} />
                                </div>
                              </details>
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400">{t.runTest}</div>
                          )}
                        </div>
                      )}

                      {activeTab === 'controls' && (
                        <div className="space-y-4">
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              onClick={() => executeServiceControl('STOP')}
                              variant="danger"
                            >
                              {t.stopService}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => executeServiceControl('START')}
                            >
                              {t.startService}
                            </Button>
                            <Button
                              type="button"
                              onClick={() => executeServiceControl('RESTART')}
                              variant="ghost"
                            >
                              Restart
                            </Button>
                          </div>
                        </div>
                      )}

                      {activeTab === 'quota' && (
                        <div className="space-y-4">
                          <div className="text-sm font-semibold mb-2">{t.quotaRules}</div>
                          {selected.quotaRules && selected.quotaRules.length > 0 ? (
                            <div className="space-y-2">
                              {selected.quotaRules.map((rule) => (
                                <div key={rule.id} className="rounded-xl border border-slate-800 bg-slate-950/20 p-4">
                                  <div className="text-sm font-semibold">{rule.metricName}</div>
                                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                                    <div>
                                      <span className="text-slate-400">Limit:</span> {rule.limitValue}
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Warning:</span> {rule.warningThreshold}%
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Critical:</span> {rule.criticalThreshold}%
                                    </div>
                                    <div>
                                      <span className="text-slate-400">Stop:</span> {rule.stopThreshold}%
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-sm text-slate-400">No quota rules configured yet.</div>
                          )}
                        </div>
                      )}

                      {activeTab === 'history' && (
                        <div className="space-y-4">
                          <div className="text-sm font-semibold mb-2">Usage History</div>
                          <div className="text-sm text-slate-400">Loading history...</div>
                        </div>
                      )}

                      {activeTab === 'backup' && (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="text-sm font-semibold">{t.backup}</div>
                            <Button
                              type="button"
                              onClick={createBackup}
                              disabled={backupsLoading}
                            >
                              {t.createBackup}
                            </Button>
                          </div>

                          {backupsLoading ? (
                            <div className="text-sm text-slate-400">Loading backups...</div>
                          ) : backups.length === 0 ? (
                            <div className="text-sm text-slate-400">No backups yet.</div>
                          ) : (
                            <div className="space-y-2">
                              {backups.map((backup) => (
                                <div key={backup.filename} className="rounded-xl border border-slate-800 bg-slate-950/20 p-4">
                                  <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1">
                                      <div className="text-sm font-semibold">{backup.filename}</div>
                                      <div className="mt-1 text-xs text-slate-400">
                                        Size: {backup.size} | Created: {backup.createdAt}
                                      </div>
                                    </div>
                                    <div className="flex gap-2">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => downloadBackup(backup.filename)}
                                      >
                                        {t.downloadBackup}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => restoreBackup(backup.filename)}
                                      >
                                        {t.restoreBackup}
                                      </Button>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => deleteBackup(backup.filename)}
                                      >
                                        {t.delete}
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {activeTab === 'settings' && (
                        <div className="space-y-4">
                          <div className="text-sm font-semibold mb-2">{t.settings}</div>
                          <div className="space-y-4">
                            <Field label={t.smtpHost}>
                              <TextInput
                                value={smtpConfig.host || ''}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                                placeholder="smtp.gmail.com"
                              />
                            </Field>
                            <Field label={t.smtpPort}>
                              <TextInput
                                type="number"
                                value={smtpConfig.port || 587}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, port: parseInt(e.target.value) })}
                                placeholder="587"
                              />
                            </Field>
                            <Field label={t.smtpUser}>
                              <TextInput
                                value={smtpConfig.user || ''}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                                placeholder="your-email@gmail.com"
                              />
                            </Field>
                            <Field label={t.smtpPassword}>
                              <TextInput
                                type="password"
                                value={smtpConfig.password || ''}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, password: e.target.value })}
                                placeholder="your-app-password"
                              />
                            </Field>
                            <Field label={t.smtpFrom}>
                              <TextInput
                                value={smtpConfig.from || ''}
                                onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                                placeholder="Quota Orchestrator <noreply@example.com>"
                              />
                            </Field>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                onClick={saveSmtpConfig}
                                disabled={smtpTestLoading}
                              >
                                {t.saveSmtpConfig}
                              </Button>
                              <Button
                                type="button"
                                onClick={testSmtpConfig}
                                disabled={smtpTestLoading}
                                variant="ghost"
                              >
                                {t.testSmtp}
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        )}
      </div>
      <SpeedInsights />
    </div>
  );
}
