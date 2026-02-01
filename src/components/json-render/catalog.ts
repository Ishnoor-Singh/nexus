// Component catalog schema for AI reference
// This file documents the available components for the AI to use

export const availableComponents = {
  DataTable: {
    description: "Table for displaying tabular data",
    props: {
      title: "string (optional)",
      columns: "Array<{key: string, label: string, format?: 'text'|'number'|'date'|'currency'|'boolean'}>",
      data: "Array<Record<string, unknown>>",
      maxRows: "number (optional, default 10)",
    },
  },
  List: {
    description: "Simple list view",
    props: {
      title: "string (optional)",
      items: "Array<{primary: string, secondary?: string, icon?: string}>",
      ordered: "boolean (optional)",
    },
  },
  Metric: {
    description: "Single metric/stat display",
    props: {
      label: "string",
      value: "string | number",
      change: "number (optional, percent change)",
      format: "'number' | 'currency' | 'percent' (optional)",
      icon: "string emoji (optional)",
    },
  },
  MetricGrid: {
    description: "Grid of multiple metrics",
    props: {
      metrics: "Array of Metric props",
    },
  },
  Progress: {
    description: "Progress bar",
    props: {
      label: "string",
      value: "number",
      max: "number (optional, default 100)",
      showPercent: "boolean (optional, default true)",
    },
  },
  Checklist: {
    description: "Checklist with checkboxes",
    props: {
      title: "string (optional)",
      items: "Array<{text: string, checked: boolean, id?: string}>",
    },
  },
  Timeline: {
    description: "Timeline/log view",
    props: {
      title: "string (optional)",
      events: "Array<{date: string, title: string, description?: string, icon?: string}>",
    },
  },
  Summary: {
    description: "Summary/alert box",
    props: {
      text: "string",
      variant: "'info' | 'success' | 'warning' | 'error' (optional, default 'info')",
    },
  },
};

// JSON Schema string for AI context (if needed)
export const catalogSchemaString = JSON.stringify(availableComponents, null, 2);
