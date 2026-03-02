import React, { useState } from 'react';

type ProviderType = 'vercel' | 'cloudflare' | 'netlify' | 'render';

interface ProviderConfigFormProps {
  onSubmit: (data: any) => void;
  onCancel: () => void;
  initialData?: any;
}

export function ProviderConfigForm({ onSubmit, onCancel, initialData }: ProviderConfigFormProps) {
  const [provider, setProvider] = useState<ProviderType>(initialData?.provider || 'vercel');
  const [accountId, setAccountId] = useState(initialData?.accountId || '');
  const [apiToken, setApiToken] = useState('');
  const [accountSlug, setAccountSlug] = useState(initialData?.extra?.accountSlug || '');
  const [accountTag, setAccountTag] = useState(initialData?.extra?.accountTag || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const extra: any = {};
    if (provider === 'netlify') extra.accountSlug = accountSlug.trim();
    if (provider === 'cloudflare') extra.accountTag = accountTag.trim();

    onSubmit({
      provider,
      accountId: accountId.trim() || 'default',
      apiToken: apiToken.trim(),
      extra: Object.keys(extra).length ? extra : undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">Provider</label>
        <select
          value={provider}
          onChange={(e) => setProvider(e.target.value as ProviderType)}
          className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="vercel">Vercel</option>
          <option value="cloudflare">Cloudflare</option>
          <option value="netlify">Netlify</option>
          <option value="render">Render</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">Account ID</label>
        <input
          type="text"
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          placeholder="e.g. personal"
          className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-200 mb-2">API Token</label>
        <input
          type="password"
          value={apiToken}
          onChange={(e) => setApiToken(e.target.value)}
          placeholder="paste token here"
          className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {provider === 'netlify' && (
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Netlify accountSlug</label>
          <input
            type="text"
            value={accountSlug}
            onChange={(e) => setAccountSlug(e.target.value)}
            placeholder="my-account"
            className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}

      {provider === 'cloudflare' && (
        <div>
          <label className="block text-sm font-medium text-slate-200 mb-2">Cloudflare accountTag</label>
          <input
            type="text"
            value={accountTag}
            onChange={(e) => setAccountTag(e.target.value)}
            placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
            className="w-full rounded-lg bg-slate-900/70 border border-slate-700 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 text-slate-100 border border-slate-700 text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-slate-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {initialData ? 'Update' : 'Add'}
        </button>
      </div>
    </form>
  );
}