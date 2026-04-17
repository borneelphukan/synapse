'use client';

import React, { useState } from 'react';

import { Upload } from '@synapse/ui';

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
    onReset();
  };

  return (
    <Upload
      status={status}
      transcriptText={transcriptText}
      onTranscriptChange={setTranscriptText}
      fileName={fileName}
      onFileChange={handleFileUpload}
      onSubmit={handleSubmit}
      onReset={handleClear}
    />
  );
};
