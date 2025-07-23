import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Calendar, 
  Clock, 
  Edit, 
  Trash2, 
  Bell,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { Card, CardHeader, CardBody } from '../components/Card';
import { Button } from '../components/Button';
import { ReminderModal } from '../components/ReminderModal';
import { api } from '../services/api';
import toast from 'react-hot-toast';

interface Reminder {
  id: string;
  title: string;
  description?: string;
  date: string;
  time: string;
  type: 'interview' | 'follow-up' | 'deadline' | 'other';
  applicationId?: string;
  applicationTitle?: string;
  isCompleted: boolean;
  notificationSent: boolean;
}

export const Reminders: React.FC = () => {
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

  useEffect(() => {
    fetchReminders();
  }, []);

  const fetchReminders = async () => {
    try {
      const response = await api.get('/reminders');
      setReminders(response.data);
    } catch (error) {
      toast.error('Failed to fetch reminders');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateReminder = () => {
    setEditingReminder(null);
    setShowModal(true);
  };

  const handleEditReminder = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setShowModal(true);
  };

  const handleDeleteReminder = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reminder?')) {
      return;
    }

    try {
      await api.delete(`/reminders/${id}`);
      setReminders(reminders.filter(reminder => reminder.id !== id));
      toast.success('Reminder deleted successfully');
    } catch (error) {
      toast.error('Failed to delete reminder');
    }
  };

  const handleToggleComplete = async (id: string, isCompleted: boolean) => {
    try {
      await api.put(`/reminders/${id}/complete`, { isCompleted: !isCompleted });
      setReminders(reminders.map(reminder => 
        reminder.id === id ? { ...reminder, isCompleted: !isCompleted } : reminder
      ));
      toast.success(`Reminder marked as ${!isCompleted ? 'completed' : 'pending'}`);
    } catch (error) {
      toast.error('Failed to update reminder');
    }
  };

  const handleReminderSaved = (reminder: Reminder) => {
    if (editingReminder) {
      setReminders(reminders.map(r => 
        r.id === reminder.id ? reminder : r
      ));
    } else {
      setReminders([reminder, ...reminders]);
    }
    setShowModal(false);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'interview':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'follow-up':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'deadline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'interview':
        return <Calendar className="h-4 w-4" />;
      case 'follow-up':
        return <Bell className="h-4 w-4" />;
      case 'deadline':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const isPastDue = (date: string, time: string) => {
    const reminderDateTime = new Date(`${date}T${time}`);
    return isBefore(reminderDateTime, new Date());
  };

  const isUpcoming = (date: string, time: string) => {
    const reminderDateTime = new Date(`${date}T${time}`);
    const threeDaysFromNow = addDays(new Date(), 3);
    return isAfter(reminderDateTime, new Date()) && isBefore(reminderDateTime, threeDaysFromNow);
  };

  const upcomingReminders = reminders.filter(r => 
    !r.isCompleted && isUpcoming(r.date, r.time)
  );
  const pastDueReminders = reminders.filter(r => 
    !r.isCompleted && isPastDue(r.date, r.time)
  );
  const completedReminders = reminders.filter(r => r.isCompleted);
  const otherReminders = reminders.filter(r => 
    !r.isCompleted && !isPastDue(r.date, r.time) && !isUpcoming(r.date, r.time)
  );

  const ReminderCard: React.FC<{ reminder: Reminder }> = ({ reminder }) => (
    <Card className="hover:shadow-lg transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-1">
              {getTypeIcon(reminder.type)}
            </div>
            <div className="flex-1">
              <h3 className={`text-lg font-semibold ${
                reminder.isCompleted 
                  ? 'text-gray-500 line-through dark:text-gray-400' 
                  : 'text-gray-900 dark:text-white'
              }`}>
                {reminder.title}
              </h3>
              {reminder.applicationTitle && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Related to: {reminder.applicationTitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex space-x-1">
            <button
              onClick={() => handleToggleComplete(reminder.id, reminder.isCompleted)}
              className={`p-1 rounded transition-colors ${
                reminder.isCompleted
                  ? 'text-green-600 hover:text-green-700'
                  : 'text-gray-400 hover:text-green-600'
              }`}
              title={reminder.isCompleted ? 'Mark as pending' : 'Mark as completed'}
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleEditReminder(reminder)}
              className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDeleteReminder(reminder.id)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between">
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(reminder.type)}`}>
              {reminder.type.charAt(0).toUpperCase() + reminder.type.slice(1)}
            </span>
            <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Calendar className="h-3 w-3 mr-1" />
              {format(new Date(reminder.date), 'MMM dd, yyyy')}
              <Clock className="h-3 w-3 ml-2 mr-1" />
              {format(new Date(`${reminder.date}T${reminder.time}`), 'h:mm a')}
            </div>
          </div>

          {isPastDue(reminder.date, reminder.time) && !reminder.isCompleted && (
            <div className="flex items-center text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="h-3 w-3 mr-1" />
              Past due
            </div>
          )}

          {isUpcoming(reminder.date, reminder.time) && !reminder.isCompleted && (
            <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm">
              <Bell className="h-3 w-3 mr-1" />
              Upcoming
            </div>
          )}
        </div>

        {reminder.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {reminder.description}
          </p>
        )}
      </CardBody>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Reminders
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Stay on top of interviews, follow-ups, and important deadlines.
            </p>
          </div>
          <Button 
            onClick={handleCreateReminder}
            icon={<Plus className="h-4 w-4" />}
          >
            Add Reminder
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-8">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="h-6 bg-gray-300 rounded w-48 mb-4"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, j) => (
                  <Card key={j}>
                    <CardBody>
                      <div className="animate-pulse">
                        <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2 mb-4"></div>
                        <div className="h-16 bg-gray-300 rounded"></div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {/* Past Due Reminders */}
          {pastDueReminders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-4 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2" />
                Past Due ({pastDueReminders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pastDueReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming Reminders */}
          {upcomingReminders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-blue-600 dark:text-blue-400 mb-4 flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Upcoming ({upcomingReminders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcomingReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            </div>
          )}

          {/* Other Reminders */}
          {otherReminders.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                All Reminders ({otherReminders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {otherReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            </div>
          )}

          {/* Completed Reminders */}
          {completedReminders.length > 0 &&  (
            <div>
              <h2 className="text-xl font-semibold text-green-600 dark:text-green-400 mb-4 flex items-center">
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Completed ({completedReminders.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {completedReminders.map((reminder) => (
                  <ReminderCard key={reminder.id} reminder={reminder} />
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {reminders.length === 0 && (
            <Card>
              <CardBody>
                <div className="text-center py-12">
                  <Bell className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                    No reminders yet
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Stay organized by setting up interview and follow-up reminders.
                  </p>
                  <div className="mt-6">
                    <Button 
                      onClick={handleCreateReminder}
                      icon={<Plus className="h-4 w-4" />}
                    >
                      Create Your First Reminder
                    </Button>
                  </div>
                </div>
              </CardBody>
            </Card>
          )}
        </div>
      )}

      {/* Reminder Modal */}
      {showModal && (
        <ReminderModal
          reminder={editingReminder}
          onClose={() => setShowModal(false)}
          onSave={handleReminderSaved}
        />
      )}
    </div>
  );
};