'use client';

import { useEffect, useRef } from 'react';
import { Icon } from '@synapse/ui';
import { UploadTranscriptForm } from '@/components/UploadTranscriptForm';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
  selectedNode: any;
  nodesLength: number;
  participants: string[];
  transcript: string[];
  status: 'idle' | 'analyzing' | 'done';
  onAnalyze: (transcript: string) => void;
  onReset: () => void;
}

export const Sidebar = ({
  isOpen,
  onClose,
  selectedNode,
  nodesLength,
  participants,
  transcript,
  status,
  onAnalyze,
  onReset,
}: SidebarProps) => {
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript]);

  const parseSpeaker = (line: string) => {
    const colonIndex = line.indexOf(':');
    if (colonIndex > 0 && colonIndex < 40) {
      return {
        speaker: line.substring(0, colonIndex).trim(),
        text: line.substring(colonIndex + 1).trim(),
      };
    }
    return { speaker: null, text: line };
  };

  const speakerColors = [
    '#38bdf8', // sky
    '#a78bfa', // violet
    '#34d399', // emerald
    '#fbbf24', // amber
    '#f472b6', // pink
    '#22d3ee', // cyan
    '#fb923c', // orange
  ];

  const getSpeakerColor = (name: string) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return speakerColors[hash % speakerColors.length];
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-40 lg:hidden" 
          onClick={onClose}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-6 overflow-y-auto transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Icon type="hub" className="text-sky-400 !text-[32px]" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
              Synapse AI
            </h1>
          </div>
          <button 
            className="lg:hidden text-slate-400 hover:text-white transition-colors"
            onClick={onClose}
          >
            <Icon type="close" className="!text-[24px]" />
          </button>
        </div>

      {selectedNode ? (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <h2 className="text-lg font-semibold text-sky-400 mb-4 flex items-center gap-2">
            <Icon type="info" className="!text-[20px]" /> {selectedNode.type === 'participant' ? 'Participant' : 'Decision Context'}
          </h2>
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50 mb-6">
            <p className="text-sm text-slate-400 mb-1">
              {selectedNode.type === 'participant' ? 'Name' : 'Topic'}
            </p>
            <p className="font-medium">{selectedNode.data.label}</p>
          </div>

          {selectedNode.data.rationale && (
            <>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-tight mt-4 mb-3 flex items-center gap-2">
                <Icon type="description" className="!text-[16px]" /> Rationale
              </h3>
              <div className="bg-slate-800/30 p-4 rounded-lg border border-slate-700/30 text-xs italic text-slate-400 leading-relaxed">
                {selectedNode.data.rationale}
              </div>
            </>
          )}

          {selectedNode.data.participants && selectedNode.data.participants.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-tight mt-6 mb-3 flex items-center gap-2">
                <Icon type="group" className="!text-[16px]" /> Involved Participants
              </h3>
              <div className="space-y-3">
                {selectedNode.data.participants.map((name: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-slate-800/30 p-3 rounded-lg border border-slate-700/30">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white"
                      style={{ background: getSpeakerColor(name) }}
                    >
                      {name[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{name}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 px-4">
          <Icon type="hub" className="mb-4 text-slate-500 !text-[48px]" />
          <p className="text-sm">
            {nodesLength === 0
              ? 'Upload a meeting transcript to identify participants and extract decisions.'
              : 'Select a node in the graph to view its details.'}
          </p>
        </div>
      )}

      {participants.length > 0 && (
        <div className="rounded-2xl p-4 border border-slate-300">
          <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
            <Icon type="group" className="!text-[16px]" /> Participants ({participants.length})
          </h3>
          <div className="space-y-2">
            {participants.map((name, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ background: getSpeakerColor(name) }}
                ></div>
                <span>{name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transcript viewer — shown after analysis */}
      {transcript.length > 0 && (
        <div className="bg-slate-900 border border-slate-300 rounded-lg p-3 space-y-1">
          <p className="text-[10px] text-sky-400 font-bold flex items-center gap-1 mb-2">
            <Icon type="description" className="!text-[12px]" /> TRANSCRIPT ({transcript.length} lines)
          </p>
          <div
            className="max-h-48 overflow-y-auto space-y-1.5 pr-1"
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
          >
            {transcript.map((line, i) => {
              const { speaker, text } = parseSpeaker(line);
              return (
                <div
                  key={i}
                  className="text-[10px] leading-relaxed border-l-2 pl-2 py-0.5"
                  style={{ borderColor: speaker ? getSpeakerColor(speaker) : '#334155' }}
                >
                  {speaker && (
                    <span
                      className="font-bold mr-1"
                      style={{ color: getSpeakerColor(speaker) }}
                    >
                      {speaker}:
                    </span>
                  )}
                  <span className="text-slate-300">{text}</span>
                </div>
              );
            })}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      <div className="mt-auto pt-4 border-t border-slate-800">
        <UploadTranscriptForm
          onAnalyze={onAnalyze}
          status={status}
          onReset={onReset}
        />
      </div>
      </div>
    </>
  );
};
