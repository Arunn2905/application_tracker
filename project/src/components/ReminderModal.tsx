import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Clock, FileText, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from './Button';
import { Input } from './Input';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface ReminderData {
  id?: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: 'interview' | 'follow-up' | 'deadline' | 'other';
  applicationId?: string;
}

interface ReminderModalProps {
  reminder?: ReminderData | null;
  onClose: () => void;
  onSave: (reminder: ReminderData) => void;
}

interface Application {
  id: string;
  company: string;
  position: string;
}

export const ReminderModal: React.FC<ReminderModalProps> = ({
  reminder,
  onClose,
  onSave,
}) => {
  const [loading, setLoading] = useState(false);
  const [applications, setApplications] = useState<Application[]>([]);
  const isEditing = Boolean(reminder);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ReminderData>({
    defaultValues: reminder || {
      date: format(new Date(), 'yyyy-MM-dd'),
      time: '09:00',
      type: 'interview',
    },
  });

  useEffect(() => {
    fetchApplications();
    if (reminder) {
      reset({
        ...reminder,
        date: format(new Date(reminder.date), 'yyyy-MM-dd'),
      });
    }
  }, [reminder, reset]);

  const fetchApplications = async () => {
    try {
      const response = await api.get('/applications?fields=id,company,position');
      setApplications(response.data);
    } catch (error) {
      console.error('Failed to fetch applications:', error);
    }
  };

  const onSubmit = async (data: ReminderData) => {
    setLoading(true);
    try {
      const response = isEditing
        ? await api.put(`/reminders/${reminder.id}`, data)
        : await api.post('/reminders', data);

      onSave(response.data);
      toast.success(`Reminder ${isEditing ? 'updated' : 'created'} successfully`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} reminder`);
    } finally {
      setLoading(false);
    }
  };

  const reminderTypes = [
    { value: 'interview', label: 'Interview', icon: Calendar },
    { value: 'follow-up', label: 'Follow-up', icon: FileText },
    { value: 'deadline', label: 'Deadline', icon: AlertCircle },
    { value: 'other', label: 'Other', icon: Clock },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                {isEditing ? 'Edit Reminder' : 'Add New Reminder'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Title"
                placeholder="e.g., Interview with Google"
                error={errors.title?.message}
                {...register('title', { required: 'Title is required' })}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {reminderTypes.map((type) => (
                    <label
                      key={type.value}
                      className="relative flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <input
                        type="radio"
                        value={type.value}
                        className="sr-only"
                        {...register('type', { required: 'Type is required' })}
                      />
                      <type.icon className="h-5 w-5 text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {type.label}
                      </span>
                    </label>
                  ))}
                </div>
                {errors.type && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Date"
                  type="date"
                  icon={<Calendar className="h-4 w-4" />}
                  error={errors.date?.message}
                  {...register('date', { required: 'Date is required' })}
                />

                <Input
                  label="Time"
                  type="time"
                  icon={<Clock className="h-4 w-4" />}
                  error={errors.time?.message}
                  {...register('time', { required: 'Time is required' })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Related Application (optional)
                </label>
                <select
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  {...register('applicationId')}
                >
                  <option value="">Select an application</option>
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.position} at {app.company}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={3}
                  className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Add any additional details..."
                  {...register('description')}
                />
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
                >
                  {isEditing ? 'Update' : 'Create'} Reminder
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};