"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Image from "next/image";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  className?: string;
}

export function ImageUpload({ value, onChange, label = "Görsel", className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(value || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Sadece resim dosyaları yüklenebilir");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Dosya boyutu 10MB'dan küçük olmalıdır");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        onChange(data.url);
        toast.success("Görsel başarıyla yüklendi!");
      } else {
        toast.error(data.error || "Görsel yüklenirken bir hata oluştu");
        setPreview(null);
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Görsel yüklenirken bir hata oluştu");
      setPreview(null);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];
    if (file) {
      const fakeEvent = {
        target: { files: [file] },
      } as any;
      handleFileSelect(fakeEvent);
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <Label className="text-sm font-medium text-slate-700">{label}</Label>
      
      {preview ? (
        <div className="relative inline-block">
          <div className="relative w-32 h-32 border-2 border-slate-300 rounded-lg overflow-hidden">
            <Image
              src={preview}
              alt="Preview"
              fill
              className="object-cover"
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
            onClick={handleRemove}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <p className="text-sm text-slate-600 mb-1">
            Görseli sürükleyip bırakın veya tıklayın
          </p>
          <p className="text-xs text-slate-500">
            PNG, JPG, GIF (max 10MB)
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="flex-1"
        >
          {uploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {preview ? "Değiştir" : "Görsel Seç"}
            </>
          )}
        </Button>
        {preview && (
          <Button
            type="button"
            variant="outline"
            onClick={handleRemove}
            className="text-red-600 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {!preview && (
        <div className="mt-2">
          <Label className="text-xs text-slate-500">veya URL ile ekle</Label>
          <Input
            type="url"
            placeholder="https://example.com/image.jpg"
            onChange={(e) => {
              if (e.target.value) {
                onChange(e.target.value);
                setPreview(e.target.value);
              }
            }}
            className="h-9 mt-1"
          />
        </div>
      )}
    </div>
  );
}
