import React, { useRef, useState } from "react";
import { Upload, Camera, X } from "lucide-react";

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  isLoading: boolean;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  isLoading,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageSelected(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const clearImage = () => {
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      {previewUrl ? (
        <div className="relative rounded-2xl overflow-hidden shadow-lg border border-gray-200">
          <img
            src={previewUrl}
            alt="Prescription Preview"
            className="w-full h-64 object-cover md:h-80"
          />
          {!isLoading && (
            <button
              onClick={clearImage}
              className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors shadow-sm"
            >
              <X size={20} />
            </button>
          )}
          {isLoading && (
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <div className="flex flex-col items-center text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent mb-3"></div>
                <p className="font-medium animate-pulse">
                  Analyzing Prescription...
                </p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all duration-200 ${
            dragActive
              ? "border-blue-500 bg-blue-50/50"
              : "border-gray-300 hover:border-blue-400 hover:bg-gray-50/50"
          }`}
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(true);
          }}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleChange}
          />
          
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 bg-blue-100 text-blue-600 rounded-full">
              <Camera size={32} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Prescription
              </h3>
              <p className="text-gray-500 mt-1">
                Drag & drop or click to upload
              </p>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-200"
              >
                Select Image
              </button>
            </div>
            
            <p className="text-xs text-gray-400 mt-4 max-w-xs mx-auto">
              Supported formats: JPEG, PNG, WEBP. <br/> Please ensure the text is legible.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
