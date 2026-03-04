'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'Dashboard' },
  { href: '/planner', label: 'Planner' },
  { href: '/tracker', label: 'Tracker' },
  { href: '/todos', label: 'Todos' },
  { href: '/goals', label: 'Goals' },
  { href: '/analytics', label: 'Analytics' },
  { href: '/settings', label: 'Settings' }
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-bg text-text">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 pb-10 pt-6 md:px-6">
        <header className="rounded-2xl border border-border bg-panel px-5 py-4">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">IgniteFlow</h1>
              <p className="text-sm text-muted">Focused execution for your weekly rhythm</p>
            </div>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-1.5 text-sm transition ${
                      active
                        ? 'bg-accent2/20 text-accent2'
                        : 'bg-panelSoft text-muted hover:bg-border hover:text-text'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        <main className="grid gap-4">{children}</main>
      </div>
    </div>
  );
}
