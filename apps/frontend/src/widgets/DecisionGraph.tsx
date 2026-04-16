'use client';

import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  NodeChange,
  EdgeChange,
  Connection,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { ParticipantNode } from '@/components/nodes/ParticipantNode';
import { DecisionNode } from '@/components/nodes/DecisionNode';

interface DecisionGraphProps {
  nodes: any[];
  edges: any[];
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeClick: (_: React.MouseEvent, node: any) => void;
  participantCount: number;
  decisionCount: number;
}

export const DecisionGraph = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onNodeClick,
  participantCount,
  decisionCount,
}: DecisionGraphProps) => {
  const nodeTypes = useMemo(() => ({
    participant: ParticipantNode,
    decision: DecisionNode,
  }), []);

  return (
    <div className="flex-1 relative h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        fitView
        className="bg-slate-950"
        style={{ width: '100%', height: '100%' }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="#1e293b" gap={20} />
        <Controls className="bg-slate-800 border-slate-700 fill-slate-200" />
      </ReactFlow>
      
      {/* Summary badge */}
      {nodes.length > 0 && (
        <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/50 shadow-2xl flex items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}></div>
            <span className="text-slate-300">{participantCount} Participant{participantCount !== 1 ? 's' : ''}</span>
          </div>
          <div className="w-px h-3 bg-slate-700"></div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}></div>
            <span className="text-slate-300">{decisionCount} Decision{decisionCount !== 1 ? 's' : ''}</span>
          </div>
        </div>
      )}

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-md px-4 py-3 rounded-xl border border-slate-700/50 shadow-2xl text-xs space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full" style={{ background: 'linear-gradient(135deg, #0ea5e9, #6366f1)' }}></div>
            <span className="text-slate-400">Participant</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm" style={{ background: 'linear-gradient(135deg, #f59e0b, #ef4444)' }}></div>
            <span className="text-slate-400">Decision</span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-700/50">
            <div className="w-3 h-0.5 bg-sky-400"></div>
            <span className="text-slate-400">Made by</span>
          </div>
        </div>
      )}
    </div>
  );
};
