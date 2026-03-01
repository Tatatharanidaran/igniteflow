'use client';

import { useState } from 'react';
import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { WEEKDAY_LABELS } from '@/lib/constants';

export default function SettingsPage() {
  const { data, setSettings, exportData, importData, clearAll } = useMomentumStore();
  const [jsonText, setJsonText] = useState('');
  const [message, setMessage] = useState('');

  function updateSettings<K extends keyof typeof data.settings>(key: K, value: (typeof data.settings)[K]) {
    setSettings({ ...data.settings, [key]: value });
  }

  function toggleDeepWorkDay(day: number) {
    const has = data.settings.deepWorkDays.includes(day);
    const next = has
      ? data.settings.deepWorkDays.filter((d) => d !== day)
      : [...data.settings.deepWorkDays, day].sort((a, b) => a - b);
    updateSettings('deepWorkDays', next);
  }

  function runExport() {
    const serialized = exportData();
    setJsonText(serialized);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(serialized).catch(() => undefined);
    }
    setMessage('Data exported to text area and copied to clipboard when available.');
  }

  function runImport() {
    const result = importData(jsonText);
    setMessage(result.message);
  }

  function runReset() {
    clearAll();
    setMessage('All data reset.');
  }

  return (
    <ClientReady>
      <Card>
        <h2 className="text-lg font-semibold">Settings</h2>
        <p className="text-sm text-muted">Customize goals and data controls.</p>
      </Card>

      <Card className="space-y-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted">Daily trading target (hours)</span>
          <input
            type="number"
            min={0}
            step="0.5"
            value={data.settings.dailyTradingTargetHours}
            onChange={(event) => updateSettings('dailyTradingTargetHours', Number(event.target.value))}
            className="rounded-lg border border-border bg-panelSoft px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm">
          <span className="text-muted">Daily build target (hours)</span>
          <input
            type="number"
            min={0}
            step="0.5"
            value={data.settings.dailyBuildTargetHours}
            onChange={(event) => updateSettings('dailyBuildTargetHours', Number(event.target.value))}
            className="rounded-lg border border-border bg-panelSoft px-3 py-2"
          />
        </label>

        <div>
          <p className="mb-2 text-sm text-muted">Deep work days</p>
          <div className="flex flex-wrap gap-2">
            {WEEKDAY_LABELS.map((label, dayIdx) => {
              const active = data.settings.deepWorkDays.includes(dayIdx);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleDeepWorkDay(dayIdx)}
                  className={`rounded-lg px-3 py-1.5 text-sm ${
                    active ? 'bg-accent2/20 text-accent2' : 'bg-panelSoft text-muted'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <p className="font-medium">Data Controls</p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={runExport}
            className="rounded-lg bg-accent2/20 px-3 py-2 text-sm text-accent2"
          >
            Export JSON
          </button>
          <button
            type="button"
            onClick={runImport}
            className="rounded-lg bg-accent/20 px-3 py-2 text-sm text-accent"
          >
            Import JSON
          </button>
          <button
            type="button"
            onClick={runReset}
            className="rounded-lg bg-warning/20 px-3 py-2 text-sm text-warning"
          >
            Reset All Data
          </button>
        </div>

        <textarea
          value={jsonText}
          onChange={(event) => setJsonText(event.target.value)}
          rows={12}
          className="w-full rounded-lg border border-border bg-panelSoft p-3 font-mono text-xs"
          placeholder="Paste exported JSON here to import..."
        />

        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </Card>
    </ClientReady>
  );
}
