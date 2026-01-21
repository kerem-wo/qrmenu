"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, FileText, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface DocumentUploadProps {
  label: string;
  file: File | null;
  uploading: boolean;
  uploadedUrl: string;
  onFileSelect: (file: File) => void;
  onRemove: () => void;
  optional?: boolean;
}

export function DocumentUpload({
  label,
  file,
  uploading,
  uploadedUrl,
  onFileSelect,
  onRemove,
  optional = false,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      onFileSelect(selectedFile);
    }
  };

  return (
    <div className="space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".jpg,.jpeg,.png,.pdf"
        className="hidden"
        disabled={uploading}
      />
      
      {!uploadedUrl && !file ? (
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-slate-300 hover:bg-slate-50 h-11"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {optional ? `${label} Yükle (Opsiyonel)` : `${label} Yükle`}
            </>
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
          <FileText className="w-5 h-5 text-slate-600" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-slate-900 truncate">
              {file?.name || "Yüklendi"}
            </p>
            {file && (
              <p className="text-xs text-slate-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
            disabled={uploading}
            className="h-8 w-8 p-0 hover:bg-red-50"
          >
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      )}
      
      {!optional && !uploadedUrl && !file && (
        <p className="text-xs text-red-600">Bu belge zorunludur</p>
      )}
    </div>
  );
}
