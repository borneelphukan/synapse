'use client';

import React, { useCallback, useState } from 'react';
import { 
  addEdge, 
  useNodesState, 
  useEdgesState,
  Connection,
  Edge,
  MarkerType,
} from 'reactflow';
import { Sidebar } from '@/widgets/sidebar/ui/Sidebar';
import { DecisionGraph } from '@/widgets/decision-graph/ui/DecisionGraph';
import { api, type AnalysisResult } from '@/shared/api';

export const HomePage = () => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [decisionCount, setDecisionCount] = useState(0);

  const arrangeParticipantsCircularly = (count: number, index: number) => {
    const centerX = 400;
    const centerY = 200;
    const radius = 180 + Math.max(0, count - 4) * 30;
    const angle = (2 * Math.PI * index) / count - Math.PI / 2;
    return {
      x: centerX + radius * Math.cos(angle),
      y: centerY + radius * Math.sin(angle),
    };
  };

  const buildGraph = useCallback((data: AnalysisResult) => {
    const newNodes: any[] = [];
    const newEdges: any[] = [];

    // 1. Create Participant Nodes in a circular layout
    if (data.participants) {
      const count = data.participants.length;
      data.participants.forEach((name, index) => {
        const pos = arrangeParticipantsCircularly(count, index);
        newNodes.push({
          id: `person-${name}`,
          type: 'participant',
          data: { label: name },
          position: pos,
        });
      });
    }

    // 2. Create Decision Nodes in a grid below participants
    if (data.decisions) {
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
            x: 200 + (index % 3) * 320,
            y: 450 + Math.floor(index / 3) * 220,
          },
        });

        // 3. Create edges from participants to decisions
        if (dec.participants) {
          dec.participants.forEach((pName) => {
            const sourceId = `person-${pName}`;
            // Only create edge if participant node exists
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
    <main className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar
        selectedNode={selectedNode}
        nodesLength={nodes.length}
        participants={participants}
        transcript={transcript}
        status={status}
        onAnalyze={handleAnalyze}
        onReset={handleReset}
      />
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
    </main>
  );
};
