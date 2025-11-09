// src/components/CreateGroup/ImagePicker.tsx
import React, { useRef, useState, useEffect } from "react";
import { Camera } from "lucide-react";

type ImagePickerProps = {
  defaultSrc?: string; // default image URL
  onFileChange: (file: File | null) => void;
  className?: string;
};

const ImagePicker: React.FC<ImagePickerProps> = ({ defaultSrc, onFileChange, className }) => {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [preview, setPreview] = useState<string | null>(defaultSrc || null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // lift state up
    onFileChange(file);
  }, [file, onFileChange]);

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setFile(null);
      setPreview(defaultSrc || null);
      return;
    }
    // Basic client-side validation — limit to images and size (e.g. 5MB)
    if (!f.type.startsWith("image/")) {
      alert("Please choose an image file.");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      alert("Image too large (max 5MB).");
      return;
    }
    setFile(f);

    const reader = new FileReader();
    reader.onload = () => setPreview(String(reader.result));
    reader.readAsDataURL(f);
  };

  return (
    <div className={className}>
      <div
        className="w-full h-40 md:h-48 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center overflow-hidden relative"
        onClick={() => inputRef.current?.click()}
        role="button"
        aria-label="Upload group cover"
      >
        {preview ? (
          <img
            src={preview}
            alt="Group preview"
            className="w-full h-full object-contain"
            // object-contain ensures full image visible, not cropped
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-sky-500">
            <div className="w-12 h-12 rounded-full bg-sky-100 flex items-center justify-center">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-sm">Upload cover</p>
          </div>
        )}

        {/* subtle overlay hint */}
        <div className="absolute right-3 bottom-3 bg-white/80 rounded-full px-2 py-1 text-xs text-sky-600 border border-sky-100 shadow-sm">
          Click to change
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={onSelectFile}
        />
      </div>
    </div>
  );
};

export default ImagePicker;
