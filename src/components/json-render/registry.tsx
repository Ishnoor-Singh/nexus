"use client";

import React from 'react';

// Types for our components
interface DataTableProps {
  title?: string;
  columns: Array<{ key: string; label: string; format?: string }>;
  data: Array<Record<string, unknown>>;
  maxRows?: number;
}

interface ListProps {
  title?: string;
  items: Array<{ primary: string; secondary?: string; icon?: string }>;
  ordered?: boolean;
}

interface MetricProps {
  label: string;
  value: string | number;
  change?: number;
  format?: 'number' | 'currency' | 'percent';
  icon?: string;
}

interface MetricGridProps {
  metrics: MetricProps[];
}

interface ProgressProps {
  label: string;
  value: number;
  max?: number;
  showPercent?: boolean;
}

interface CardProps {
  title?: string;
  subtitle?: string;
  icon?: string;
  children?: React.ReactNode;
}

interface ChecklistProps {
  title?: string;
  items: Array<{ text: string; checked: boolean; id?: string }>;
}

interface TimelineProps {
  title?: string;
  events: Array<{ date: string; title: string; description?: string; icon?: string }>;
}

interface SummaryProps {
  text: string;
  variant?: 'info' | 'success' | 'warning' | 'error';
}

// Format helpers
const formatValue = (value: unknown, format?: string): string => {
  if (value === null || value === undefined) return '—';
  
  switch (format) {
    case 'currency':
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(Number(value));
    case 'percent':
      return `${(Number(value) * 100).toFixed(1)}%`;
    case 'number':
      return new Intl.NumberFormat('en-US').format(Number(value));
    case 'date':
      return new Date(String(value)).toLocaleDateString();
    case 'boolean':
      return value ? '✓' : '✗';
    default:
      return String(value);
  }
};

// Components
export const DataTable: React.FC<DataTableProps> = ({ title, columns, data, maxRows = 10 }) => {
  const displayData = data.slice(0, maxRows);
  
  return (
    <div className="rounded-xl overflow-hidden border border-[--border] bg-[--card]/50">
      {title && (
        <div className="px-4 py-2 border-b border-[--border] bg-[--muted]/30">
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[--border]">
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-2 text-left font-medium text-[--muted-foreground]">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayData.map((row, i) => (
              <tr key={i} className="border-b border-[--border] last:border-0 hover:bg-[--muted]/20">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2">
                    {formatValue(row[col.key], col.format)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length > maxRows && (
        <div className="px-4 py-2 text-xs text-[--muted-foreground] border-t border-[--border]">
          Showing {maxRows} of {data.length} entries
        </div>
      )}
    </div>
  );
};

export const List: React.FC<ListProps> = ({ title, items, ordered }) => {
  const ListTag = ordered ? 'ol' : 'ul';
  
  return (
    <div className="rounded-xl border border-[--border] bg-[--card]/50 overflow-hidden">
      {title && (
        <div className="px-4 py-2 border-b border-[--border] bg-[--muted]/30">
          <h4 className="font-medium text-sm">{title}</h4>
        </div>
      )}
      <ListTag className={`p-4 space-y-2 ${ordered ? 'list-decimal list-inside' : ''}`}>
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2">
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <div>
              <div className="font-medium">{item.primary}</div>
              {item.secondary && (
                <div className="text-sm text-[--muted-foreground]">{item.secondary}</div>
              )}
            </div>
          </li>
        ))}
      </ListTag>
    </div>
  );
};

export const Metric: React.FC<MetricProps> = ({ label, value, change, format, icon }) => {
  const formattedValue = formatValue(value, format);
  const changeColor = change !== undefined 
    ? change > 0 ? 'text-green-500' : change < 0 ? 'text-red-500' : 'text-[--muted-foreground]'
    : '';
  
  return (
    <div className="rounded-xl border border-[--border] bg-[--card]/50 p-4">
      <div className="flex items-center gap-2 text-[--muted-foreground] text-sm mb-1">
        {icon && <span>{icon}</span>}
        <span>{label}</span>
      </div>
      <div className="text-2xl font-semibold">{formattedValue}</div>
      {change !== undefined && (
        <div className={`text-sm ${changeColor}`}>
          {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change)}%
        </div>
      )}
    </div>
  );
};

export const MetricGrid: React.FC<MetricGridProps> = ({ metrics }) => (
  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
    {metrics.map((metric, i) => (
      <Metric key={i} {...metric} />
    ))}
  </div>
);

export const Progress: React.FC<ProgressProps> = ({ label, value, max = 100, showPercent = true }) => {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="rounded-xl border border-[--border] bg-[--card]/50 p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium">{label}</span>
        {showPercent && <span className="text-sm text-[--muted-foreground]">{percent.toFixed(0)}%</span>}
      </div>
      <div className="h-2 bg-[--muted] rounded-full overflow-hidden">
        <div 
          className="h-full bg-[--primary] rounded-full transition-all duration-500"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};

export const Card: React.FC<CardProps> = ({ title, subtitle, icon, children }) => (
  <div className="rounded-xl border border-[--border] bg-[--card]/50 overflow-hidden">
    {(title || subtitle) && (
      <div className="px-4 py-3 border-b border-[--border]">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <div>
            {title && <h4 className="font-medium">{title}</h4>}
            {subtitle && <p className="text-sm text-[--muted-foreground]">{subtitle}</p>}
          </div>
        </div>
      </div>
    )}
    {children && <div className="p-4">{children}</div>}
  </div>
);

export const Checklist: React.FC<ChecklistProps> = ({ title, items }) => (
  <div className="rounded-xl border border-[--border] bg-[--card]/50 overflow-hidden">
    {title && (
      <div className="px-4 py-2 border-b border-[--border] bg-[--muted]/30">
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
    )}
    <div className="p-4 space-y-2">
      {items.map((item, i) => (
        <div key={item.id || i} className="flex items-center gap-3">
          <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center
            ${item.checked 
              ? 'bg-[--primary] border-[--primary] text-white' 
              : 'border-[--border]'}`}
          >
            {item.checked && <span className="text-xs">✓</span>}
          </div>
          <span className={item.checked ? 'line-through text-[--muted-foreground]' : ''}>
            {item.text}
          </span>
        </div>
      ))}
    </div>
  </div>
);

export const Timeline: React.FC<TimelineProps> = ({ title, events }) => (
  <div className="rounded-xl border border-[--border] bg-[--card]/50 overflow-hidden">
    {title && (
      <div className="px-4 py-2 border-b border-[--border] bg-[--muted]/30">
        <h4 className="font-medium text-sm">{title}</h4>
      </div>
    )}
    <div className="p-4">
      <div className="relative">
        {events.map((event, i) => (
          <div key={i} className="flex gap-4 pb-4 last:pb-0">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-[--muted] flex items-center justify-center text-sm">
                {event.icon || '•'}
              </div>
              {i < events.length - 1 && (
                <div className="w-0.5 flex-1 bg-[--border] mt-2" />
              )}
            </div>
            <div className="flex-1 pt-1">
              <div className="text-xs text-[--muted-foreground] mb-1">{event.date}</div>
              <div className="font-medium">{event.title}</div>
              {event.description && (
                <div className="text-sm text-[--muted-foreground] mt-1">{event.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const Summary: React.FC<SummaryProps> = ({ text, variant = 'info' }) => {
  const variantStyles = {
    info: 'bg-blue-500/10 border-blue-500/30 text-blue-500',
    success: 'bg-green-500/10 border-green-500/30 text-green-500',
    warning: 'bg-yellow-500/10 border-yellow-500/30 text-yellow-500',
    error: 'bg-red-500/10 border-red-500/30 text-red-500',
  };
  
  return (
    <div className={`rounded-xl border p-4 ${variantStyles[variant]}`}>
      <p className="text-sm">{text}</p>
    </div>
  );
};

// Registry for json-render
export const componentRegistry = {
  DataTable,
  List,
  Metric,
  MetricGrid,
  Progress,
  Card,
  Checklist,
  Timeline,
  Summary,
};
