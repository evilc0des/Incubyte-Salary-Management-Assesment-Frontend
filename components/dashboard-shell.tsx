import type { ReactNode } from "react";

const navigationItems = [
  { href: "/", label: "Overview" },
  { href: "/employees", label: "Employees" }
];

type DashboardShellProps = {
  currentPath: string;
  children: ReactNode;
};

export function DashboardShell({ currentPath, children }: DashboardShellProps) {
  return (
    <div className="dashboard-shell">
      <header aria-label="Salary dashboard" className="dashboard-sidebar">
        <div className="dashboard-brand">
          <span className="dashboard-kicker">Salary Management</span>
          <strong>Dashboard</strong>
        </div>

        <nav aria-label="Primary">
          <ul className="dashboard-nav">
            {navigationItems.map((item) => {
              const isActive = item.href === currentPath;

              return (
                <li key={item.href}>
                  <a
                    aria-current={isActive ? "page" : undefined}
                    className="dashboard-link"
                    href={item.href}
                  >
                    {item.label}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <main className="dashboard-content">{children}</main>
    </div>
  );
}