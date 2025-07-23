import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  FileText, 
  Download, 
  Edit, 
  Trash2, 
  Plus,
  Eye,
  Star,
  StarOff
} from 'lucide-react';
import { format } from 'date-fns';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { ResumeModal } from '../components/ResumeModal';
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

export const Resumes: React.FC = () => {
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResume, setEditingResume] = useState<Resume | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchResumes();
  }, []);

  const fetchResumes = async () => {
    try {
      const response = await api.get('/resumes');
      setResumes(response.data);
    } catch (error) {
      toast.error('Failed to fetch resumes');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (file: File, name: string, tags: string[]) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', name);
      formData.append('tags', JSON.stringify(tags));

      const response = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setResumes([response.data, ...resumes]);
      toast.success('Resume uploaded successfully');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to upload resume');
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (resume: Resume) => {
    setEditingResume(resume);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) {
      return;
    }

    try {
      await api.delete(`/resumes/${id}`);
      setResumes(resumes.filter(resume => resume.id !== id));
      toast.success('Resume deleted successfully');
    } catch (error) {
      toast.error('Failed to delete resume');
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      await api.put(`/resumes/${id}/default`);
      setResumes(resumes.map(resume => ({
        ...resume,
        isDefault: resume.id === id,
      })));
      toast.success('Default resume updated');
    } catch (error) {
      toast.error('Failed to set default resume');
    }
  };

  const handleDownload = async (id: string, filename: string) => {
    try {
      const response = await api.get(`/resumes/${id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download resume');
    }
  };

  const handleResumeUpdated = (updatedResume: Resume) => {
    setResumes(resumes.map(resume => 
      resume.id === updatedResume.id ? updatedResume : resume
    ));
    setShowModal(false);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Resume Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Upload, organize, and track your resume versions.
            </p>
          </div>
          <Button 
            onClick={() => setShowModal(true)}
            icon={<Plus className="h-4 w-4" />}
          >
            Upload Resume
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <Card className="mb-8">
        <CardBody>
          <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900 dark:text-white">
              Quick Upload
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Drag and drop your resume file here, or click to browse
            </p>
            <div className="mt-6">
              <Button 
                onClick={() => setShowModal(true)}
                icon={<Upload className="h-4 w-4" />}
                disabled={uploading}
              >
                {uploading ? 'Uploading...' : 'Select File'}
              </Button>
            </div>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              Supported formats: PDF, DOC, DOCX (Max 10MB)
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Resumes Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardBody>
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                  <div className="h-20 bg-gray-300 rounded mb-4"></div>
                  <div className="flex space-x-2">
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                    <div className="h-8 bg-gray-300 rounded w-16"></div>
                  </div>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : resumes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <Card key={resume.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-8 w-8 text-blue-600" />
                    {resume.isDefault && (
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                    )}
                  </div>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => handleSetDefault(resume.id)}
                      className="p-1 text-gray-400 hover:text-yellow-500 transition-colors"
                      title={resume.isDefault ? 'Remove as default' : 'Set as default'}
                    >
                      {resume.isDefault ? 
                        <Star className="h-4 w-4 fill-current" /> : 
                        <StarOff className="h-4 w-4" />
                      }
                    </button>
                    <button
                      onClick={() => handleEdit(resume)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(resume.id)}
                      className="p-1 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {resume.name}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {resume.filename}
                  </p>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Size:</span>
                    <span className="text-gray-900 dark:text-white">
                      {formatFileSize(resume.fileSize)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Uploaded:</span>
                    <span className="text-gray-900 dark:text-white">
                      {format(new Date(resume.uploadDate), 'MMM dd, yyyy')}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Used:</span>
                    <span className="text-gray-900 dark:text-white">
                      {resume.usageCount} times
                    </span>
                  </div>
                </div>

                {resume.tags.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {resume.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(resume.id, resume.filename)}
                    icon={<Download className="h-3 w-3" />}
                  >
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`/api/resumes/${resume.id}/preview`, '_blank')}
                    icon={<Eye className="h-3 w-3" />}
                  >
                    Preview
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardBody>
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No resumes uploaded
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Upload your first resume to get started.
              </p>
              <div className="mt-6">
                <Button 
                  onClick={() => setShowModal(true)}
                  icon={<Upload className="h-4 w-4" />}
                >
                  Upload Your First Resume
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Resume Modal */}
      {showModal && (
        <ResumeModal
          resume={editingResume}
          onClose={() => {
            setShowModal(false);
            setEditingResume(null);
          }}
          onUpload={handleUpload}
          onUpdate={handleResumeUpdated}
        />
      )}
    </div>
  );
};