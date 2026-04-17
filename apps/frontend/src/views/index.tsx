'use client';

import React, { useCallback, useState } from 'react';
import { 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Connection,
  Edge,
  MarkerType,
  ReactFlowProvider,
} from 'reactflow';
import { Sidebar } from '@/layout/Sidebar';
import { Navbar } from '@/components/Navbar';
import { DecisionGraph } from '@/widgets/DecisionGraph';
import { api, type AnalysisResult } from '@/shared/api';

export const HomePage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [decisionCount, setDecisionCount] = useState(0);

  const arrangeParticipantsInRow = (count: number, index: number) => {
    const spacing = 180;
    const totalWidth = (count - 1) * spacing;
    const startX = 600 - totalWidth / 2; // Center based on common view
    return {
      x: startX + index * spacing,
      y: 50,
    };
  };

  const buildGraph = useCallback((data: AnalysisResult) => {
    const newNodes: any[] = [];
    const newEdges: any[] = [];

    // 1. Create Participant Nodes in a top row
    if (data.participants) {
      const count = data.participants.length;
      data.participants.forEach((name, index) => {
        const pos = arrangeParticipantsInRow(count, index);
        newNodes.push({
          id: `person-${name}`,
          type: 'participant',
          data: { label: name },
          position: pos,
        });
      });
    }

    // 2. Create Decision Nodes at the bottom
    if (data.decisions) {
      const count = data.decisions.length;
      const spacing = 340;
      const totalWidth = Math.min(3, count) * spacing;
      const startX = 400 - totalWidth / 2;

      data.decisions.forEach((dec, index) => {
        const id = `decision-${index}`;
        newNodes.push({
          id,
          type: 'decision',
          data: {
            label: dec.content,
            rationale: dec.rationale,
            participants: dec.participants || [],
          },
          position: {
            x: startX + (index % 3) * spacing,
            y: 500 + Math.floor(index / 3) * 250,
          },
        });

        // 3. Create edges from participants to decisions
        if (dec.participants) {
          dec.participants.forEach((pName) => {
            const sourceId = `person-${pName}`;
            if (data.participants.includes(pName)) {
              newEdges.push({
                id: `edge-${id}-${sourceId}`,
                source: sourceId,
                target: id,
                animated: true,
                style: { stroke: '#38bdf8', strokeWidth: 2 },
                markerEnd: { type: MarkerType.ArrowClosed, color: '#38bdf8' },
              });
            }
          });
        }
      });
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setDecisionCount(data.decisions?.length || 0);
  }, [setNodes, setEdges]);

  const handleAnalyze = async (transcriptText: string) => {
    setStatus('analyzing');
    setSelectedNode(null);

    try {
      const result = await api.analyzeTranscript(transcriptText);

      setParticipants(result.participants || []);
      setTranscript(result.transcript || []);
      buildGraph(result);
      setStatus('done');
    } catch (error) {
      setStatus('idle');
      alert(error instanceof Error ? error.message : 'Failed to analyze transcript. Is the backend running?');
    }
  };

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setParticipants([]);
    setTranscript([]);
    setDecisionCount(0);
    setStatus('idle');
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar
        selectedNode={selectedNode}
        nodesLength={nodes.length}
        participants={participants}
        transcript={transcript}
        status={status}
        onAnalyze={handleAnalyze}
        onReset={handleReset}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <ReactFlowProvider>
          <DecisionGraph
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onNodeClick={onNodeClick}
            participantCount={participants.length}
            decisionCount={decisionCount}
          />
        </ReactFlowProvider>
      </div>
    </div>
  );
};
