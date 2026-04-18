import React, { useCallback, useState, useEffect } from 'react';
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
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter,
  DialogClose,
  Icon
} from '@synapse/ui';
import { useRouter } from 'next/router';

export const HomePage = () => {
  const router = useRouter();

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'done'>('idle');
  const [transcript, setTranscript] = useState<string[]>([]);
  const [participants, setParticipants] = useState<string[]>([]);
  const [decisionCount, setDecisionCount] = useState(0);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Catch browser reload/close
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (nodes.length > 0) {
        e.preventDefault();
        e.returnValue = ''; // Required for most browsers
        return '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [nodes.length]);

  // Handle Stripe Success Callback
  useEffect(() => {
    if (router.isReady && router.query.success === 'true' && router.query.session_id) {
      const confirmPayment = async () => {
        try {
          const result = await api.confirmPayment(router.query.session_id as string);
          if (result.success) {
            alert(`Subscription successful! You are now on the ${result.plan} plan.`);
            // Refresh to update user context across all components
            window.location.href = '/';
          }
        } catch (error) {
          console.error('Failed to confirm payment:', error);
        }
      };
      confirmPayment();
    }
  }, [router.isReady, router.query]);

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

  // Catch keyboard reload shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (nodes.length > 0) {
        if ((e.key === 'r' && (e.metaKey || e.ctrlKey)) || e.key === 'F5') {
          e.preventDefault();
          setShowResetDialog(true);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nodes.length]);

  const handleReset = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setParticipants([]);
    setTranscript([]);
    setDecisionCount(0);
    setStatus('idle');
    setShowResetDialog(false);
  };

  const handleManualReload = () => {
    window.location.reload();
  };

  const onConnect = useCallback(
    (params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const onNodeClick = (_: React.MouseEvent, node: any) => {
    setSelectedNode(node);
  };

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-200 overflow-hidden relative">
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        selectedNode={selectedNode}
        nodesLength={nodes.length}
        participants={participants}
        transcript={transcript}
        status={status}
        onAnalyze={handleAnalyze}
        onReset={() => nodes.length > 0 ? setShowResetDialog(true) : handleReset()}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
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

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="max-w-md border-slate-800 bg-slate-900 text-slate-100">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center mb-4">
              <Icon type="warning" className="text-amber-500 !text-[24px]" />
            </div>
            <DialogTitle className="text-slate-100 text-xl">Unsaved Graph Present</DialogTitle>
            <DialogDescription className="text-slate-400 mt-2">
              Do you really want to Reload? You will lose the graph you have created.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="bg-slate-900/50 border-slate-800 gap-3">
            <DialogClose>
              <button className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-200 transition-colors">
                Cancel
              </button>
            </DialogClose>
            <button
              onClick={handleManualReload}
              className="px-6 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-bold transition-all shadow-lg shadow-amber-900/20 flex items-center gap-2"
            >
              <Icon type="refresh" className="!text-[16px]" /> Ok, Reload
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default HomePage;
