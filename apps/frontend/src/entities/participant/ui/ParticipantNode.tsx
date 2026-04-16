'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface ParticipantNodeData {
  label: string;
}

export const ParticipantNode = memo(({ data, selected }: NodeProps<ParticipantNodeData>) => {
  const initials = data.label
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const colors = [
    { bg: 'linear-gradient(135deg, #0ea5e9, #6366f1)', ring: '#38bdf8', glow: 'rgba(14,165,233,0.4)' },
    { bg: 'linear-gradient(135deg, #8b5cf6, #ec4899)', ring: '#a78bfa', glow: 'rgba(139,92,246,0.4)' },
    { bg: 'linear-gradient(135deg, #10b981, #06b6d4)', ring: '#34d399', glow: 'rgba(16,185,129,0.4)' },
    { bg: 'linear-gradient(135deg, #f59e0b, #ef4444)', ring: '#fbbf24', glow: 'rgba(245,158,11,0.4)' },
    { bg: 'linear-gradient(135deg, #ec4899, #f43f5e)', ring: '#f472b6', glow: 'rgba(236,72,153,0.4)' },
    { bg: 'linear-gradient(135deg, #06b6d4, #3b82f6)', ring: '#22d3ee', glow: 'rgba(6,182,212,0.4)' },
  ];

  const colorIndex = data.label.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0) % colors.length;
  const color = colors[colorIndex];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px',
        padding: '8px',
        cursor: 'grab',
      }}
    >
      <div
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: color.bg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: '18px',
          fontWeight: 700,
          letterSpacing: '0.5px',
          border: selected ? `3px solid #fff` : `3px solid ${color.ring}`,
          boxShadow: selected
            ? `0 0 24px ${color.glow}, 0 0 48px ${color.glow}`
            : `0 0 16px ${color.glow}`,
          transition: 'box-shadow 0.3s ease, border 0.3s ease',
        }}
      >
        {initials}
      </div>

      <div
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          backdropFilter: 'blur(8px)',
          padding: '4px 12px',
          borderRadius: '20px',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          maxWidth: '140px',
        }}
      >
        <span
          style={{
            color: '#e2e8f0',
            fontSize: '11px',
            fontWeight: 600,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}
        >
          {data.label}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: color.ring,
          border: `2px solid ${color.ring}`,
          width: '8px',
          height: '8px',
          bottom: '-4px',
        }}
      />
      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: color.ring,
          border: `2px solid ${color.ring}`,
          width: '8px',
          height: '8px',
          top: '-4px',
        }}
      />
    </div>
  );
});

ParticipantNode.displayName = 'ParticipantNode';
