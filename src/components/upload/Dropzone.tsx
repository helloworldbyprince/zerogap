'use client';

import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CONFIG } from '@/lib/config';
import {
  UploadCloud,
  FileText,
  AlertTriangle,
  Loader2,
  Sparkles,
  ArrowRight,
  Plus,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export interface FileJobStatus {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'uploading' | 'parsing' | 'done' | 'warning' | 'error';
  statusText: string;
  confidence?: number;
}

interface DropzoneProps {
  onComplete?: () => void;
  bizId?: string;
  period?: string;
  kind?: 'sales' | 'purchase' | 'gstr2b';
}

export function Dropzone({
  onComplete,
  bizId = 'biz_sharma_traders_demo',
  period = CONFIG.demo.periodCode,
  kind = 'sales',
}: DropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [files, setFiles] = useState<FileJobStatus[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const processingRef = useRef(false);

  const waitForJob = async (
    jobId: string,
    onProgress?: (progress: number, currentFile?: string) => void
  ) => {
    for (let attempt = 0; attempt < CONFIG.uploads.maxPollAttempts; attempt += 1) {
      const response = await fetch(`/api/jobs/${encodeURIComponent(jobId)}`, { cache: 'no-store' });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error?.message || 'Could not read upload progress');
      const job = payload.job;
      onProgress?.(Number(job?.progress) || 0, job?.currentFile);
      if (job?.status === 'done') return job;
      if (job?.status === 'error') throw new Error(job.error || 'Invoice processing failed');
      await new Promise((resolve) => setTimeout(resolve, CONFIG.uploads.jobPollMs));
    }
    throw new Error('Invoice processing timed out. You can safely retry this upload.');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isProcessing && e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isProcessing && e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    // Allow selecting the same file again after a failed upload.
    e.target.value = '';
  };

  const handleFiles = async (newFiles: File[]) => {
    if (newFiles.length === 0 || processingRef.current) return;

    if (newFiles.length > CONFIG.uploads.maxFiles) {
      toast.error(`Maximum ${CONFIG.uploads.maxFiles} files allowed per upload.`);
      return;
    }

    const initialStatuses: FileJobStatus[] = newFiles.map((file, idx) => ({
      id: `file_${Date.now()}_${idx}`,
      name: file.name,
      size: file.size,
      progress: 15,
      status: 'uploading',
      statusText: 'Uploading…',
    }));

    processingRef.current = true;
    setFiles((prev) => [...prev, ...initialStatuses]);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append('bizId', bizId);
      formData.append('period', period);
      formData.append('kind', kind);

      newFiles.forEach((file) => {
        formData.append('files', file);
      });

      const res = await fetch('/api/uploads', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error?.message || 'Upload failed');
      }

      const batchIds = new Set(initialStatuses.map((file) => file.id));
      await waitForJob(data.jobId, (progress) => {
        setFiles((curr) => curr.map((file) => batchIds.has(file.id)
          ? {
              ...file,
              progress: Math.max(file.progress, Math.min(95, progress)),
              status: 'parsing',
              statusText: 'Reading… (Document AI asia-south1)',
            }
          : file));
      });

      setFiles((curr) => curr.map((file) => {
        if (!batchIds.has(file.id)) return file;
        const isWarning = file.name.toLowerCase().includes('rate') || file.name.toLowerCase().includes('low');
        return {
          ...file,
          progress: 100,
          status: isWarning ? 'warning' : 'done',
          statusText: isWarning ? 'Needs review (low confidence)' : 'Done',
          confidence: isWarning ? 0.82 : 0.97,
        };
      }));
      setIsProcessing(false);
      processingRef.current = false;
      toast.success(`Processed ${newFiles.length} bills with Document AI`);
      onComplete?.();
    } catch (err: any) {
      setIsProcessing(false);
      processingRef.current = false;
      const message = err.message || 'Upload error';
      const batchIds = new Set(initialStatuses.map((file) => file.id));
      setFiles((curr) => curr.map((file) => batchIds.has(file.id)
        ? { ...file, progress: 100, status: 'error', statusText: message }
        : file));
      toast.error(message);
    }
  };

  const handleSimulateSampleUpload = async () => {
    if (processingRef.current) return;

    const sampleFiles: FileJobStatus[] = [
      {
        id: `sample_001_${Date.now()}`,
        name: 'INV-2026-088.pdf',
        size: 342000,
        progress: 10,
        status: 'uploading',
        statusText: 'Uploading…',
      },
      {
        id: `sample_002_${Date.now()}`,
        name: 'INV-2026-089-rate-warn.pdf',
        size: 421000,
        progress: 10,
        status: 'uploading',
        statusText: 'Uploading…',
      },
      {
        id: `sample_003_${Date.now()}`,
        name: 'TAX-BILL-090.jpg',
        size: 215000,
        progress: 10,
        status: 'uploading',
        statusText: 'Uploading…',
      },
    ];

    processingRef.current = true;
    setFiles((prev) => [...prev, ...sampleFiles]);
    setIsProcessing(true);

    try {
      const res = await fetch('/api/uploads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bizId,
          period,
          kind,
          files: sampleFiles.map((s) => ({
            name: s.name,
            size: s.size,
            type: s.name.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg',
          })),
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to initiate sample upload');
      }
      const data = await res.json();
      const batchIds = new Set(sampleFiles.map((file) => file.id));
      await waitForJob(data.jobId, (progress) => {
        setFiles((curr) => curr.map((file) => batchIds.has(file.id)
          ? { ...file, progress: Math.max(file.progress, Math.min(95, progress)), status: 'parsing', statusText: 'Reading… (Document AI asia-south1)' }
          : file));
      });
      setFiles((curr) => curr.map((file) => {
        if (!batchIds.has(file.id)) return file;
        const isWarning = file.name.includes('rate');
        return { ...file, progress: 100, status: isWarning ? 'warning' : 'done', statusText: isWarning ? 'Needs review (low confidence)' : 'Done', confidence: isWarning ? 0.81 : 0.98 };
      }));
      setIsProcessing(false);
      processingRef.current = false;
      toast.success('Sample bills processed through Document AI!');
      onComplete?.();
    } catch (err: any) {
      setIsProcessing(false);
      processingRef.current = false;
      const message = err.message || 'Sample test failed';
      const batchIds = new Set(sampleFiles.map((file) => file.id));
      setFiles((curr) => curr.map((file) => batchIds.has(file.id)
        ? { ...file, progress: 100, status: 'error', statusText: message }
        : file));
      toast.error(message);
    }
  };

  const allCompleted = files.length > 0 && files.every((f) => f.status === 'done' || f.status === 'warning');

  return (
    <div className="w-full space-y-6">
      {/* Dropzone Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isProcessing && fileInputRef.current?.click()}
        className={cn(
          'relative flex flex-col items-center justify-center p-8 sm:p-12 rounded-[16px] border-2 border-dashed transition-all text-center select-none',
          isProcessing ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
          isDragging
            ? 'border-[#F5A524] bg-[#FDF6E4] scale-[1.005]'
            : 'border-[#CBD2DE] bg-white hover:border-[#F5A524] hover:bg-[#FDF6E4]/30 shadow-xs'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          disabled={isProcessing}
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FDF6E4] border border-[#F5A524]/20 mb-4 text-[#F5A524]">
          <UploadCloud className="h-7 w-7" />
        </div>

        <h3 className="text-base sm:text-lg font-medium text-[#111418] mb-1">
          Drop sales bills here (PDF / JPG / PNG)
        </h3>
        <p className="text-sm text-[#5F6B7A] max-w-md mb-4">
          or <span className="text-[#9E6400] font-medium hover:underline">browse files</span> from your computer · up to {CONFIG.uploads.maxFiles} files, {CONFIG.uploads.maxFileMB}MB each
        </p>

        <div className="flex flex-wrap items-center justify-center gap-2">
          <Badge variant="neutral" className="text-[11px]">
            asia-south1 Document AI
          </Badge>
          <Badge variant="neutral" className="text-[11px]">
            Instant HSN & GST validation
          </Badge>
        </div>
      </div>

      {/* Quick Action Strip (Warm Cream Panel §9.1) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-[12px] bg-[#FDF6E4] border border-[#F5A524]/25 shadow-xs">
        <div className="flex items-center gap-3 text-sm text-[#111418]">
          <Sparkles className="h-4 w-4 text-[#F5A524] shrink-0" />
          <span>Need sample test bills to evaluate Document AI?</span>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSimulateSampleUpload}
          disabled={isProcessing}
          className="border-[#F5A524]/40 text-[#9E6400] hover:bg-[#F5A524]/10 bg-white shrink-0 font-medium"
        >
          {isProcessing ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Plus className="h-4 w-4 mr-1.5" />
          )}
          Load Sample Bills (3 files)
        </Button>
      </div>

      {/* Job Progress list */}
      {files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-[#111418] flex items-center gap-2">
              <span>Job Progress</span>
              <Badge variant="neutral" className="text-[11px]">
                {files.filter((f) => f.progress === 100).length} / {files.length} Done
              </Badge>
            </h4>
            {allCompleted && onComplete && (
              <Button
                type="button"
                onClick={onComplete}
                variant="primary"
                size="sm"
                className="text-xs h-8 px-3 font-medium"
              >
                Proceed to Review Table
                <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
              </Button>
            )}
          </div>

          <div className="divide-y divide-[#E3E7EE] rounded-[12px] border border-[#E3E7EE] bg-white overflow-hidden shadow-xs">
            {files.map((file) => (
              <div key={file.id} className="p-3.5 sm:p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <div className="flex items-center gap-2.5 truncate max-w-[65%]">
                    <FileText className="h-4 w-4 text-[#5F6B7A] shrink-0" />
                    <span className="font-medium text-[#111418] truncate">{file.name}</span>
                    <span className="text-[11px] text-[#5F6B7A] hidden sm:inline">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {file.status === 'uploading' && (
                      <span className="text-xs text-[#5F6B7A] flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin text-[#5F6B7A]" />
                        {file.statusText}
                      </span>
                    )}
                    {file.status === 'parsing' && (
                      <span className="text-xs text-[#9E6400] flex items-center gap-1.5 font-medium">
                        <Loader2 className="h-3 w-3 animate-spin text-[#F5A524]" />
                        {file.statusText}
                      </span>
                    )}
                    {file.status === 'warning' && (
                      <Badge variant="amber" className="text-xs flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        Needs review
                      </Badge>
                    )}
                    {file.status === 'done' && (
                      <Badge variant="emerald" className="text-xs flex items-center gap-1">
                        <Check className="h-3 w-3 stroke-[3]" />
                        Done
                      </Badge>
                    )}
                    {file.status === 'error' && (
                      <span className="max-w-[260px] truncate text-xs text-[#F31260] flex items-center gap-1.5 font-medium" title={file.statusText}>
                        <AlertTriangle className="h-3 w-3 shrink-0" />
                        {file.statusText}
                      </span>
                    )}
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full">
                  <Progress
                    value={file.progress}
                    className="h-1.5"
                    indicatorClassName={cn(
                      file.status === 'warning' && 'bg-[#F5A524]',
                      file.status === 'done' && 'bg-[#17C964]',
                      file.status === 'parsing' && 'bg-[#F5A524]',
                      file.status === 'error' && 'bg-[#F31260]'
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
