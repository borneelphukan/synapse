'use client';

import React, { useState, useRef } from 'react';
import { Upload, FileText, Sparkles, X, Loader2 } from 'lucide-react';

interface UploadTranscriptFormProps {
  onAnalyze: (transcript: string) => void;
  status: 'idle' | 'analyzing' | 'done';
  onReset: () => void;
}

export const UploadTranscriptForm = ({
  onAnalyze,
  status,
  onReset,
}: UploadTranscriptFormProps) => {
  const [transcriptText, setTranscriptText] = useState('');
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    
    // Check file type
    const isTextFile = file.name.match(/\.(txt|vtt|srt|csv|md)$/i) || 
                      file.type.startsWith('text/') || 
                      file.type === '';
    
    const isDocx = file.name.endsWith('.docx') || 
                  file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

    if (isTextFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setTranscriptText(text);
      };
      reader.readAsText(file);
    } else if (isDocx) {
      // Handle Word Documents (.docx)
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ arrayBuffer });
          setTranscriptText(result.value);
        } catch (err) {
          console.error('Error extracting Word document:', err);
          setTranscriptText(`Failed to extract text from Word document: ${file.name}. Please ensure it is a valid .docx file.`);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setTranscriptText(`[File: ${file.name}] - This file format is not yet supported for automatic extraction. Please paste the text manually or use a .txt/.docx file.`);
    }
  };

  const handleSubmit = () => {
    if (!transcriptText.trim()) return;
    onAnalyze(transcriptText);
  };

  const handleClear = () => {
    setTranscriptText('');
    setFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onReset();
  };

  const lineCount = transcriptText
    ? transcriptText.split('\n').filter((l) => l.trim()).length
    : 0;

  return (
    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">
      <h3 className="text-sm font-semibold text-sky-400 mb-4 flex items-center gap-2">
        <FileText className="w-4 h-4" /> Upload Transcript
      </h3>

      {status === 'done' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            Analysis Complete
          </div>
          <p className="text-[10px] text-slate-500">
            {lineCount} lines processed
            {fileName && <> from <span className="text-slate-400">{fileName}</span></>}
          </p>
          <button
            onClick={handleClear}
            className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-slate-700 hover:bg-slate-600 text-slate-300"
          >
            <X className="w-3 h-3" /> Clear & Upload New
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {/* File upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-sky-500/50 rounded-xl p-4 cursor-pointer transition-colors group text-center"
          >
            <Upload className="w-5 h-5 mx-auto mb-2 text-slate-500 group-hover:text-sky-400 transition-colors" />
            <p className="text-[10px] text-slate-500 group-hover:text-slate-400 transition-colors">
              {fileName ? (
                <span className="text-sky-400 font-semibold">{fileName}</span>
              ) : (
                <>
                  Click to upload <span className="text-slate-400">.docx</span> or{' '}
                  <span className="text-slate-400">.pdf</span> file
                </>
              )}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.vtt,.srt,.csv,.md,.doc,.docx"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2">
            <div className="flex-1 border-t border-slate-700/50"></div>
            <span className="text-[9px] text-slate-600 uppercase font-bold">or paste</span>
            <div className="flex-1 border-t border-slate-700/50"></div>
          </div>

          {/* Textarea */}
          <textarea
            value={transcriptText}
            onChange={(e) => {
              setTranscriptText(e.target.value);
              setFileName(null);
            }}
            placeholder={`Paste your meeting transcript here...`}
            className={`w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-sky-500 transition-colors resize-none ${
              !!fileName ? 'opacity-50 cursor-not-allowed border-dashed' : ''
            }`}
            style={{ scrollbarWidth: 'thin', scrollbarColor: '#334155 transparent' }}
            rows={6}
            disabled={status === 'analyzing' || !!fileName}
          />

          {/* Line count indicator */}
          {lineCount > 0 && (
            <p className="text-[9px] text-slate-500">
              {lineCount} line{lineCount !== 1 ? 's' : ''} detected
            </p>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={!transcriptText.trim() || status === 'analyzing'}
            className={`w-full py-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg ${
              status === 'analyzing'
                ? 'bg-slate-700 text-slate-400'
                : transcriptText.trim()
                  ? 'bg-sky-500 hover:bg-sky-600 text-white shadow-sky-500/20'
                  : 'bg-slate-700 text-slate-500 cursor-not-allowed'
            }`}
          >
            {status === 'analyzing' ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" /> Analyzing with AI...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" /> Analyze Transcript
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
