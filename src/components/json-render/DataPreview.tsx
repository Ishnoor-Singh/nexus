"use client";

import React, { useMemo } from 'react';
import { componentRegistry } from './registry';

interface DataPreviewProps {
  content: string;
}

// Parse message content for JSON UI blocks
// Format: ```ui:json { ... } ``` or :::ui { ... } :::
const parseUIBlocks = (content: string): { text: string; blocks: unknown[] }[] => {
  const parts: { text: string; blocks: unknown[] }[] = [];
  
  // Match ```ui or ```ui:json code blocks
  const uiBlockRegex = /```(?:ui|ui:json)\s*([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  
  while ((match = uiBlockRegex.exec(content)) !== null) {
    // Add text before this block
    if (match.index > lastIndex) {
      parts.push({ text: content.slice(lastIndex, match.index).trim(), blocks: [] });
    }
    
    // Try to parse the JSON
    try {
      const json = JSON.parse(match[1].trim());
      const blocks = Array.isArray(json) ? json : [json];
      parts.push({ text: '', blocks });
    } catch {
      // If parse fails, treat as regular code block
      parts.push({ text: match[0], blocks: [] });
    }
    
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < content.length) {
    parts.push({ text: content.slice(lastIndex).trim(), blocks: [] });
  }
  
  return parts.filter(p => p.text || p.blocks.length > 0);
};

// Render a single UI element
const RenderElement: React.FC<{ element: Record<string, unknown> }> = ({ element }) => {
  const { type, props, children } = element as { 
    type: string; 
    props?: Record<string, unknown>; 
    children?: unknown[] 
  };
  
  const Component = componentRegistry[type as keyof typeof componentRegistry];
  
  if (!Component) {
    return (
      <div className="text-sm text-[--muted-foreground] italic">
        Unknown component: {type}
      </div>
    );
  }
  
  // Render children if present
  const renderedChildren = children?.map((child, i) => {
    if (typeof child === 'object' && child !== null) {
      return <RenderElement key={i} element={child as Record<string, unknown>} />;
    }
    return <React.Fragment key={i}>{String(child)}</React.Fragment>;
  });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return <Component {...(props as any)}>{renderedChildren}</Component>;
};

export const DataPreview: React.FC<DataPreviewProps> = ({ content }) => {
  const parts = useMemo(() => parseUIBlocks(content), [content]);
  
  // If no UI blocks, return null (let regular text rendering handle it)
  const hasUIBlocks = parts.some(p => p.blocks.length > 0);
  if (!hasUIBlocks) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part.text && (
            <p className="whitespace-pre-wrap leading-relaxed">{part.text}</p>
          )}
          {part.blocks.map((block, j) => (
            <div key={j} className="my-2">
              <RenderElement element={block as Record<string, unknown>} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

// Simple component to detect and render data previews in a message
export const MessageWithPreviews: React.FC<{ content: string }> = ({ content }) => {
  const parts = useMemo(() => parseUIBlocks(content), [content]);
  const hasUIBlocks = parts.some(p => p.blocks.length > 0);
  
  if (!hasUIBlocks) {
    // No UI blocks, just render text normally
    return <p className="whitespace-pre-wrap leading-relaxed">{content}</p>;
  }
  
  return (
    <div className="space-y-3">
      {parts.map((part, i) => (
        <React.Fragment key={i}>
          {part.text && (
            <p className="whitespace-pre-wrap leading-relaxed">{part.text}</p>
          )}
          {part.blocks.map((block, j) => (
            <div key={j} className="my-2">
              <RenderElement element={block as Record<string, unknown>} />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

export default DataPreview;
