import React, { useState, useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

interface ProfilePictureUploadProps {
  profilePicture: File | null;
  updateProfilePicture: (file: File | null) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({ 
  profilePicture, 
  updateProfilePicture 
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      processSelectedFile(file);
    }
  };
  
  const processSelectedFile = (file: File) => {
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file');
      return;
    }
    
    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size should be less than 5MB');
      return;
    }
    
    updateProfilePicture(file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };
  
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  
  const removeImage = () => {
    updateProfilePicture(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4 mb-6">
        <div className="h-12 w-12 rounded-full bg-white text-navy flex items-center justify-center text-xl font-bold">
          2
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Add a profile picture</h2>
          <p className="text-sky-100">Help others recognize you with a profile picture</p>
        </div>
      </div>
      
      <div 
        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-8 transition-all duration-300 ${
          dragActive 
            ? 'border-white bg-white/20' 
            : 'border-white/30 bg-white/10 hover:bg-white/15'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={!previewUrl ? triggerFileInput : undefined}
        style={{ cursor: !previewUrl ? 'pointer' : 'default' }}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        
        {!previewUrl ? (
          <div className="flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center mb-4">
              <Camera className="h-12 w-12 text-white" />
            </div>
            <p className="text-white font-medium mb-2">Drag & drop your photo here</p>
            <p className="text-sky-100 text-sm mb-4">or click to browse</p>
            <p className="text-sky-100 text-xs">
              JPEG, PNG or GIF • Max 5MB
            </p>
          </div>
        ) : (
          <div className="relative">
            <div className="relative h-48 w-48 rounded-full overflow-hidden border-4 border-white shadow-lg">
              <img 
                src={previewUrl} 
                alt="Profile preview" 
                className="h-full w-full object-cover"
              />
            </div>
            <button 
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                removeImage();
              }}
              className="absolute -top-2 -right-2 bg-red-500 h-8 w-8 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors duration-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
      
      {previewUrl && (
        <div className="flex justify-center mt-4">
          <button
            type="button"
            onClick={triggerFileInput}
            className="flex items-center space-x-2 text-white bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-colors duration-300"
          >
            <Upload className="h-4 w-4" />
            <span>Upload different photo</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfilePictureUpload;