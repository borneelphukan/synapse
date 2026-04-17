import * as React from "react";
import { Icon } from './icon';
import { TextArea } from './textarea';
import Button from './button';

export interface UploadProps {
  status: 'idle' | 'analyzing' | 'done';
  transcriptText: string;
  onTranscriptChange: (text: string) => void;
  fileName: string | null;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  onReset: () => void;
  className?: string;
}

const Upload = ({
  status,
  transcriptText,
  onTranscriptChange,
  fileName,
  onFileChange,
  onSubmit,
  onReset,
  className = "",
}: UploadProps) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const lineCount = transcriptText
    ? transcriptText.split('\n').filter((l) => l.trim()).length
    : 0;

  return (
    <div className={`${className}`}>
      {status === 'done' ? (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
            <Icon type={"auto_awesome" as any} className="!text-[14px]" />
            Analysis Complete
          </div>
          <p className="text-[10px] text-slate-500">
            {lineCount} lines processed
            {fileName && <> from <span className="text-slate-400">{fileName}</span></>}
          </p>
          <button
            onClick={onReset}
            className="w-full py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all bg-slate-700 hover:bg-slate-600 text-slate-300"
          >
            <Icon type="close" className="!text-[12px]" /> Clear & Upload New
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {/* File upload area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-sky-500 dark:hover:border-sky-500 hover:bg-sky-500/5 dark:hover:bg-sky-500/10 rounded-2xl p-8 cursor-pointer transition-all group text-center bg-slate-50/50 dark:bg-slate-800/20"
          >
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300">
              <Icon type="upload" className="!text-[24px] text-slate-400 dark:text-slate-500 group-hover:text-sky-500 transition-colors hover:cursor-pointer" />
            </div>
            <p className="text-xs text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300 transition-colors">
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
              onChange={onFileChange}
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
          <TextArea
            id="transcript-input"
            label=""
            hideLabel
            value={transcriptText}
            onChange={(e) => onTranscriptChange(e.target.value)}
            placeholder="Paste your meeting transcript here..."
            className={!!fileName ? 'opacity-50 cursor-not-allowed border-dashed' : ''}
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
          <Button
            onClick={onSubmit}
            isLoading={status === 'analyzing'}
            disabled={!transcriptText.trim()}
            className="w-full py-2.5"
            label={status === 'analyzing' ? "Analyzing with AI..." : "Analyze Transcript"}
            icon={{ 
              left: status === 'analyzing' 
                ? null 
                : <Icon type={"auto_awesome" as any} className="!text-[12px]" /> 
            }}
          />
        </div>
      )}
    </div>
  );
};

export { Upload };
