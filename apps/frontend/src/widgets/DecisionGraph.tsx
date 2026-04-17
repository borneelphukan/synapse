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
import { toPng } from 'html-to-image';
import { 
  getRectOfNodes, 
  getTransformForBounds,
  useReactFlow,
} from 'reactflow';
import { Icon } from '@synapse/ui';

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
  const { getNodes } = useReactFlow();
  
  const nodeTypes = useMemo(() => ({
    participant: ParticipantNode,
    decision: DecisionNode,
  }), []);

  const onDownloadClick = () => {
    // We target the viewport of the react flow instance
    const nodes = getNodes();
    const nodesRect = getRectOfNodes(nodes);
    const width = nodesRect.width + 100;
    const height = nodesRect.height + 100;
    const transform = getTransformForBounds(nodesRect, width, height, 0.5, 2);

    const viewport = document.querySelector('.react-flow__viewport') as HTMLElement;
    if (viewport) {
      toPng(viewport, {
        backgroundColor: '#020617',
        width: width,
        height: height,
        style: {
          width: `${width}`,
          height: `${height}`,
          transform: `translate(${transform[0]}px, ${transform[1]}px) scale(${transform[2]})`,
        },
      }).then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `decision-graph-${new Date().getTime()}.png`;
        link.href = dataUrl;
        link.click();
      }).catch((err) => {
        console.error('Failed to generate image:', err);
        alert('Could not generate PNG. This might be due to browser security restrictions on external fonts.');
      });
    }
  };

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
      
      {/* Controls & Export area */}
      {nodes.length > 0 && (
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <button
            onClick={onDownloadClick}
            className="bg-slate-900/80 backdrop-blur-md px-3 py-2 rounded-xl border border-slate-700/50 shadow-2xl flex items-center gap-2 text-xs text-sky-400 hover:bg-slate-800 transition-all hover:border-sky-500/50"
            title="Save as PNG"
          >
            <Icon type="download" className="!text-[18px]" />
            <span className="font-semibold">Save PNG</span>
          </button>
          
          <div className="bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-700/50 shadow-2xl flex items-center gap-4 text-xs">
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
        </div>
      )}

      {/* Legend */}
      {nodes.length > 0 && (
        <div className="absolute bottom-4 right-4 bg-slate-800 backdrop-blur-md px-4 py-3 rounded-xl shadow-2xl text-xs space-y-2">
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
