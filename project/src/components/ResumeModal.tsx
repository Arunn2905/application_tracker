import React, { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { X, Upload, FileText, Tag } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Resume {
  id: string;
  name: string;
  filename: string;
  fileSize: number;
  uploadDate: string;
  isDefault: boolean;
  tags: string[];
  usageCount: number;
}

interface ResumeModalProps {
  resume?: Resume | null;
  onClose: () => void;
  onUpload: (file: File, name: string, tags: string[]) => Promise<void>;
  onUpdate: (resume: Resume) => void;
}

interface FormData {
  name: string;
  tags: string;
}

export const ResumeModal: React.FC<ResumeModalProps> = ({
  resume,
  onClose,
  onUpload,
  onUpdate,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEditing = Boolean(resume);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    defaultValues: {
      name: resume?.name || '',
      tags: resume?.tags.join(', ') || '',
    },
  });

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

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const validateFile = (file: File) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a PDF, DOC, or DOCX file');
      return false;
    }

    if (file.size > maxSize) {
      toast.error('File size must be less than 10MB');
      return false;
    }

    return true;
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const tags = data.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);

      if (isEditing) {
        // Update existing resume
        const response = await api.put(`/resumes/${resume.id}`, {
          name: data.name,
          tags,
        });
        onUpdate(response.data);
        toast.success('Resume updated successfully');
      } else {
        // Upload new resume
        if (!selectedFile) {
          toast.error('Please select a file to upload');
          return;
        }
        
        const name = data.name || selectedFile.name.replace(/\.[^/.]+$/, '');
        await onUpload(selectedFile, name, tags);
      }
      
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Resume' : 'Upload Resume'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Upload File
                  </label>
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                        : 'border-gray-300 dark:border-gray-600'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    {selectedFile ? (
                      <div className="space-y-2">
                        <FileText className="mx-auto h-8 w-8 text-blue-600" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedFile.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatFileSize(selectedFile.size)}
                        </p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedFile(null)}
                        >
                          Remove
                        </Button>
                      </div>
                    ) : (
                      <div>
                        <Upload className="mx-auto h-8 w-8 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                          Drag and drop your resume here, or{' '}
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-500"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          PDF, DOC, DOCX up to 10MB
                        </p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              )}

              <Input
                label="Resume Name"
                placeholder={selectedFile ? selectedFile.name.replace(/\.[^/.]+$/, '') : 'Enter resume name'}
                error={errors.name?.message}
                {...register('name', { required: 'Resume name is required' })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tags (optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g., frontend, senior, javascript (comma-separated)"
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  {...register('tags')}
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate multiple tags with commas
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!isEditing && !selectedFile}
                >
                  {isEditing ? 'Update' : 'Upload'} Resume
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};