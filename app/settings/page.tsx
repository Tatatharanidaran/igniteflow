'use client';

import { ChangeEvent, useRef, useState } from 'react';
import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { WEEKDAY_LABELS } from '@/lib/constants';

export default function SettingsPage() {
  const { data, setSettings, exportData, importData, clearAll } = useMomentumStore();
  const [jsonText, setJsonText] = useState('');
  const [message, setMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  function runDownloadExport() {
    const serialized = exportData();
    const blob = new Blob([serialized], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStamp = new Date().toISOString().slice(0, 10);
    link.href = url;
    link.download = `igniteflow-backup-${dateStamp}.json`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    setJsonText(serialized);
    setMessage('Backup JSON downloaded. Import this file on your other machine to sync.');
  }

  function openImportPicker() {
    fileInputRef.current?.click();
  }

  function handleImportFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === 'string' ? reader.result : '';
      setJsonText(text);
      const result = importData(text);
      setMessage(result.ok ? `Imported from ${file.name}.` : result.message);
    };
    reader.onerror = () => {
      setMessage('Could not read that file.');
    };
    reader.readAsText(file);
    event.target.value = '';
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
        <p className="font-medium">Where your data lives</p>
        <p className="text-sm text-muted">
          IgniteFlow stores everything in this browser on this device using local browser storage.
          That means Linux and Windows each keep separate data unless you export from one machine and
          import into the other.
        </p>
        <p className="text-sm text-muted">
          Current storage key: <span className="font-mono text-text">igniteflow.v1</span>
        </p>
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
            Copy JSON
          </button>
          <button
            type="button"
            onClick={runDownloadExport}
            className="rounded-lg bg-accent2/20 px-3 py-2 text-sm text-accent2"
          >
            Download Backup
          </button>
          <button
            type="button"
            onClick={runImport}
            className="rounded-lg bg-accent/20 px-3 py-2 text-sm text-accent"
          >
            Import From Text
          </button>
          <button
            type="button"
            onClick={openImportPicker}
            className="rounded-lg bg-accent/20 px-3 py-2 text-sm text-accent"
          >
            Import Backup File
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

        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleImportFile}
          className="hidden"
        />

        {message ? <p className="text-sm text-muted">{message}</p> : null}
      </Card>
    </ClientReady>
  );
}
