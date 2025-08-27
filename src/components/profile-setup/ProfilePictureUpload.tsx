import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, CheckCircle, User } from 'lucide-react';

interface ProfilePictureUploadProps {
  profilePicture: File | null;
  updateProfilePicture: (file: File | null) => void;
}

const ProfilePictureUpload: React.FC<ProfilePictureUploadProps> = ({
  profilePicture,
  updateProfilePicture,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  React.useEffect(() => {
    if (profilePicture) {
      const objectUrl = URL.createObjectURL(profilePicture);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setPreview(null);
    }
  }, [profilePicture]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        updateProfilePicture(file);
      }
    }
  }, [updateProfilePicture]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        updateProfilePicture(file);
      }
    }
  };

  const removeImage = () => {
    updateProfilePicture(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4"
        >
          <Camera className="w-8 h-8 text-blue-700" />
        </motion.div>
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Add your photo</h2>
        <p className="text-slate-600">Upload a profile picture to personalize your account</p>
      </div>

      <div className="flex justify-center">
        <div className="relative">
          <AnimatePresence mode="wait">
            {preview ? (
              <motion.div
                key="preview"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="relative group"
              >
                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-lg">
                  <img
                    src={preview}
                    alt="Profile preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={removeImage}
                  className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg transition-colors duration-200"
                >
                  <X className="w-4 h-4" />
                </motion.button>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center shadow-lg"
                >
                  <CheckCircle className="w-4 h-4" />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="w-32 h-32 rounded-full border-2 border-dashed border-slate-400 flex items-center justify-center bg-white/20 hover:bg-white/30 transition-colors duration-200"
              >
                <User className="w-12 h-12 text-slate-500" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <motion.div
        className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
          dragActive 
            ? 'border-blue-500 bg-blue-50 scale-105' 
            : 'border-slate-400 hover:border-slate-500 hover:bg-white/20'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        
        <div className="text-center">
          <motion.div
            animate={{ y: dragActive ? -5 : 0 }}
            transition={{ type: "spring", stiffness: 300 }}
            className="flex justify-center mb-4"
          >
            <Upload className="w-8 h-8 text-slate-600" />
          </motion.div>
          
          <p className="text-slate-700 font-medium mb-2">
            {dragActive ? 'Drop your image here' : 'Drag & drop your image here'}
          </p>
          <p className="text-slate-500 text-sm mb-4">or click to browse</p>
          
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="button"
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-200 text-sm font-medium"
          >
            Choose File
          </motion.button>
        </div>
      </motion.div>

      <div className="text-center">
        <p className="text-slate-500 text-xs">
          Supported formats: JPG, PNG, GIF (Max 5MB)
        </p>
      </div>
    </motion.div>
  );
};

export default ProfilePictureUpload;