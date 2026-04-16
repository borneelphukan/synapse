'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from 'reactflow';

interface DecisionNodeData {
  label: string;
  rationale?: string;
  participants?: string[];
  timestamp?: string;
}

export const DecisionNode = memo(({ data, selected }: NodeProps<DecisionNodeData>) => {
  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #1e293b, #0f172a)',
        borderRadius: '16px',
        padding: '16px',
        border: selected ? '2px solid #38bdf8' : '1px solid rgba(51, 65, 85, 0.6)',
        width: '260px',
        boxShadow: selected
          ? '0 0 30px rgba(56, 189, 248, 0.2), 0 20px 40px rgba(0,0,0,0.4)'
          : '0 10px 30px rgba(0,0,0,0.3)',
        transition: 'all 0.3s ease',
        cursor: 'pointer',
      }}
    >
      {/* Header badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginBottom: '10px',
        }}
      >
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '2px',
            background: 'linear-gradient(135deg, #f59e0b, #ef4444)',
            flexShrink: 0,
          }}
        />
        <span
          style={{
            fontSize: '9px',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px',
            color: '#94a3b8',
          }}
        >
          Decision
        </span>
        {data.timestamp && (
          <span
            style={{
              fontSize: '8px',
              color: '#64748b',
              marginLeft: 'auto',
            }}
          >
            {data.timestamp}
          </span>
        )}
      </div>

      {/* Content */}
      <p
        style={{
          color: '#f1f5f9',
          fontSize: '12px',
          fontWeight: 500,
          lineHeight: '1.5',
          margin: 0,
        }}
      >
        {data.label}
      </p>

      {/* Rationale */}
      {data.rationale && (
        <p
          style={{
            color: '#64748b',
            fontSize: '10px',
            fontStyle: 'italic',
            marginTop: '8px',
            lineHeight: '1.4',
            borderTop: '1px solid rgba(51, 65, 85, 0.4)',
            paddingTop: '8px',
          }}
        >
          {data.rationale.length > 100
            ? data.rationale.substring(0, 100) + '...'
            : data.rationale}
        </p>
      )}

      {/* Participant chips */}
      {data.participants && data.participants.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
            marginTop: '10px',
          }}
        >
          {data.participants.map((name: string, i: number) => (
            <span
              key={i}
              style={{
                fontSize: '9px',
                padding: '2px 8px',
                borderRadius: '10px',
                background: 'rgba(14, 165, 233, 0.15)',
                color: '#38bdf8',
                fontWeight: 600,
                border: '1px solid rgba(14, 165, 233, 0.2)',
              }}
            >
              {name}
            </span>
          ))}
        </div>
      )}

      <Handle
        type="target"
        position={Position.Top}
        style={{
          background: '#f59e0b',
          border: '2px solid #f59e0b',
          width: '8px',
          height: '8px',
          top: '-4px',
        }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        style={{
          background: '#f59e0b',
          border: '2px solid #f59e0b',
          width: '8px',
          height: '8px',
          bottom: '-4px',
        }}
      />
    </div>
  );
});

DecisionNode.displayName = 'DecisionNode';
