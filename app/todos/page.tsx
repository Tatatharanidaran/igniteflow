'use client';

import { useMemo, useState } from 'react';
import { Card } from '@/components/Card';
import { ClientReady } from '@/components/ClientReady';
import { useMomentumStore } from '@/hooks/useMomentumStore';
import { TodoScope } from '@/types';

const scopes: Array<{ scope: TodoScope; title: string; subtitle: string }> = [
  { scope: 'daily', title: 'Daily', subtitle: 'Tasks you want done today.' },
  { scope: 'weekly', title: 'Weekly', subtitle: 'Tasks you want done this week.' },
  { scope: 'monthly', title: 'Monthly', subtitle: 'Tasks you want done this month.' }
];

export default function TodosPage() {
  const { data, addTodo, toggleTodo, removeTodo } = useMomentumStore();
  const [text, setText] = useState<Record<TodoScope, string>>({
    daily: '',
    weekly: '',
    monthly: ''
  });
  const [message, setMessage] = useState('');

  const totals = useMemo(() => {
    const result: Record<TodoScope, { total: number; done: number }> = {
      daily: { total: 0, done: 0 },
      weekly: { total: 0, done: 0 },
      monthly: { total: 0, done: 0 }
    };

    for (const scope of Object.keys(result) as TodoScope[]) {
      const items = data.todos?.[scope] ?? [];
      result[scope] = {
        total: items.length,
        done: items.filter((item) => item.done).length
      };
    }

    return result;
  }, [data.todos]);

  function onAdd(scope: TodoScope) {
    const result = addTodo(scope, text[scope]);
    setMessage(result.message);
    if (result.ok) {
      setText((prev) => ({ ...prev, [scope]: '' }));
    }
  }

  return (
    <ClientReady>
      <Card>
        <h2 className="text-lg font-semibold">Todos</h2>
        <p className="text-sm text-muted">Keep separate task lists for daily, weekly, and monthly focus.</p>
        {message ? <p className="mt-2 text-xs text-muted">{message}</p> : null}
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        {scopes.map(({ scope, title, subtitle }) => {
          const items = data.todos?.[scope] ?? [];
          const meta = totals[scope];

          return (
            <Card key={scope} className="space-y-3">
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-medium">{title}</p>
                  <p className="text-xs text-muted">
                    {meta.done}/{meta.total}
                  </p>
                </div>
                <p className="text-xs text-muted">{subtitle}</p>
              </div>

              <div className="flex flex-col gap-2">
                <input
                  value={text[scope]}
                  onChange={(event) => setText((prev) => ({ ...prev, [scope]: event.target.value }))}
                  placeholder={`Add a ${title.toLowerCase()} todo...`}
                  className="w-full rounded-lg border border-border bg-panelSoft px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  onClick={() => onAdd(scope)}
                  className="rounded-lg bg-accent2/20 px-3 py-2 text-sm text-accent2"
                >
                  Add
                </button>
              </div>

              <div className="space-y-2">
                {items.length === 0 ? (
                  <p className="text-xs text-muted">No todos yet.</p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 rounded-lg border border-border bg-panelSoft px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => toggleTodo(scope, item.id)}
                        className={`flex-1 text-left text-sm ${item.done ? 'text-muted line-through' : 'text-text'}`}
                        title="Toggle done"
                      >
                        {item.text}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTodo(scope, item.id)}
                        className="rounded bg-warning/20 px-2 py-1 text-xs text-warning"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </ClientReady>
  );
}
