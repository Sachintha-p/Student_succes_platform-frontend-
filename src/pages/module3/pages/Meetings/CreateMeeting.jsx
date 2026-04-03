import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../../../components/Sidebar';
import DashboardAccessButton from '../../../../components/DashboardAccessButton';
import { ChevronLeft, Save, AlertCircle, CheckCircle, X, Plus } from 'lucide-react';
import { DatePicker, TimePicker } from '../../components/DateTimePicker';

const CreateMeeting = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('accessToken');

  const [formData, setFormData] = useState({
    groupId: '',
    title: '',
    location: '',
    meetingLink: '',
    proposedDates: []
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [dateInput, setDateInput] = useState('');
  const [timeInput, setTimeInput] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const addProposedDate = () => {
    if (!dateInput || !timeInput) {
      setErrors(prev => ({
        ...prev,
        date: 'Please select both date and time'
      }));
      return;
    }

    const dateTime = new Date(`${dateInput}T${timeInput}`);
    const isoDateTime = dateTime.toISOString();

    if (formData.proposedDates.includes(isoDateTime)) {
      setErrors(prev => ({
        ...prev,
        date: 'This date and time is already added'
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      proposedDates: [...prev.proposedDates, isoDateTime]
    }));
    setDateInput('');
    setTimeInput('');
    setErrors(prev => ({
      ...prev,
      date: ''
    }));
  };

  const removeProposedDate = (index) => {
    setFormData(prev => ({
      ...prev,
      proposedDates: prev.proposedDates.filter((_, i) => i !== index)
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.groupId) {
      newErrors.groupId = 'Please select a group';
    } else if (parseInt(formData.groupId) < 1) {
      newErrors.groupId = 'Group ID must be valid';
    }

    if (!formData.title.trim()) {
      newErrors.title = 'Meeting title is required';
    } else if (formData.title.trim().length < 3) {
      newErrors.title = 'Meeting title must be at least 3 characters';
    } else if (formData.title.trim().length > 200) {
      newErrors.title = 'Meeting title must not exceed 200 characters';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required';
    } else if (formData.location.trim().length < 3) {
      newErrors.location = 'Location must be at least 3 characters';
    } else if (formData.location.trim().length > 200) {
      newErrors.location = 'Location must not exceed 200 characters';
    }

    if (formData.meetingLink && formData.meetingLink.trim()) {
      try {
        new URL(formData.meetingLink);
      } catch {
        newErrors.meetingLink = 'Please enter a valid URL';
      }
    }

    if (formData.proposedDates.length === 0) {
      newErrors.proposedDates = 'Add at least one proposed date';
    } else if (formData.proposedDates.length > 10) {
      newErrors.proposedDates = 'Maximum 10 proposed dates allowed';
    }

    // Check if all proposed dates are in the future
    const now = new Date();
    const invalidDates = formData.proposedDates.filter(date => new Date(date) <= now);
    if (invalidDates.length > 0) {
      newErrors.proposedDates = 'All proposed dates must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      const meetingData = {
        groupId: parseInt(formData.groupId),
        title: formData.title,
        location: formData.location || null,
        meetingLink: formData.meetingLink || null,
        proposedDates: formData.proposedDates
      };

      const response = await fetch('http://localhost:8080/api/module3/meetings', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(meetingData)
      });

      if (response.ok) {
        const resData = await response.json();
        setSuccessMessage('Meeting scheduled successfully! Redirecting...');
        setTimeout(() => {
          navigate('/module3-meetings');
        }, 2000);
      } else {
        const errorData = await response.json();
        setErrors({ submit: errorData.message || 'Failed to schedule meeting' });
      }
    } catch (err) {
      console.error("Error scheduling meeting:", err);
      setErrors({ submit: 'An error occurred while scheduling the meeting' });
    } finally {
      setLoading(false);
    }
  };

  const formatDateForDisplay = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-[#090e17] min-h-screen">
      <DashboardAccessButton />
      
      <div className="flex">
        <Sidebar />

      <main className="flex-1 ml-72">
        {/* Hero Section */}
        <div className="bg-gradient-to-b from-[#00d09c]/10 to-transparent border-b border-gray-800/50 px-10 py-12">
          <div className="flex items-center gap-6">
            <button
              onClick={() => navigate('/module3-meetings')}
              className="p-2.5 bg-[#121826] border border-gray-800 rounded-lg text-gray-400 hover:text-[#00d09c] hover:border-[#00d09c] transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-2">Schedule Meeting</h1>
              <p className="text-gray-400 text-lg font-medium">Create a group meeting with proposed time slots</p>
            </div>
          </div>
        </div>

        <div className="p-10 text-gray-300 font-sans">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-8 bg-green-500/15 border border-green-500/40 text-green-400 p-5 rounded-lg flex items-center gap-3">
            <CheckCircle size={20} className="flex-shrink-0" />
            <p className="font-bold">{successMessage}</p>
          </div>
        )}

        {/* Form Container */}
        <div className="bg-[#121826] border border-gray-800 rounded-2xl p-10 max-w-3xl shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Error Alert */}
            {errors.submit && (
              <div className="bg-red-500/15 border border-red-500/40 text-red-400 p-5 rounded-lg flex items-center gap-3">
                <AlertCircle size={20} className="flex-shrink-0" />
                <p className="font-bold">{errors.submit}</p>
              </div>
            )}

            {/* Group Selection */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Group ID *
              </label>
              <input
                type="number"
                name="groupId"
                value={formData.groupId}
                onChange={handleChange}
                min="1"
                className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white focus:outline-none transition-all ${
                  errors.groupId
                    ? 'border-red-500/60 focus:border-red-400'
                    : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                }`}
              />
              {errors.groupId && <p className="text-red-400  text-sm mt-2.5 font-medium">{errors.groupId}</p>}
            </div>

            {/* Meeting Title */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Meeting Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Project Planning Session"
                className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white placeholder:text-gray-600 focus:outline-none transition-all ${
                  errors.title
                    ? 'border-red-500/60 focus:border-red-400'
                    : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                }`}
              />
              {errors.title && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.title}</p>}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g., Library Room 102, Main Building"
                className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white placeholder:text-gray-600 focus:outline-none transition-all ${
                  errors.location
                    ? 'border-red-500/60 focus:border-red-400'
                    : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                }`}
              />
              {errors.location && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.location}</p>}
            </div>

            {/* Meeting Link */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Meeting Link (Optional)
              </label>
              <input
                type="url"
                name="meetingLink"
                value={formData.meetingLink}
                onChange={handleChange}
                placeholder="e.g., https://meet.google.com/..."
                className={`w-full bg-[#090e17] border rounded-lg py-3.5 px-5 text-white placeholder:text-gray-600 focus:outline-none transition-all ${
                  errors.meetingLink
                    ? 'border-red-500/60 focus:border-red-400'
                    : 'border-gray-800 hover:border-gray-700 focus:border-[#00d09c]'
                }`}
              />
              {errors.meetingLink && <p className="text-red-400 text-sm mt-2.5 font-medium">{errors.meetingLink}</p>}
            </div>

            {/* Proposed Dates */}
            <div>
              <label className="block text-sm font-black uppercase text-gray-500 tracking-wider mb-3">
                Proposed Dates *
              </label>
              <div className="space-y-5">
                {/* Date & Time Pickers */}
                <div className="grid grid-cols-2 gap-4">
                  <DatePicker 
                    value={dateInput} 
                    onChange={setDateInput} 
                    label="Select Date"
                    required={true}
                    minDate={new Date().toISOString().split('T')[0]}
                  />
                  <div>
                    <label className="block text-xs text-gray-500 font-bold mb-2.5 uppercase tracking-wider">Select Time</label>
                    <TimePicker value={timeInput} onChange={setTimeInput} />
                  </div>
                </div>
                
                <button
                  type="button"
                  onClick={addProposedDate}
                  className="w-full bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 px-6 py-3.5 rounded-lg font-bold transition-all flex items-center justify-center gap-2 active:scale-95 shadow-[0_4px_12px_rgba(0,208,156,0.2)]"
                >
                  <Plus size={18} /> Add to Schedule
                </button>
                
                {errors.date && <p className="text-red-400 text-sm font-medium">{errors.date}</p>}

                {/* Proposed Dates List */}
                {formData.proposedDates.length > 0 && (
                  <div className="space-y-2.5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-bold">{formData.proposedDates.length} Date{formData.proposedDates.length !== 1 ? 's' : ''} Added</p>
                    {formData.proposedDates.map((date, idx) => (
                      <div key={idx} className="bg-[#090e17] p-4 rounded-lg border border-gray-800 flex items-center justify-between hover:border-gray-700 transition-all">
                        <span className="text-white font-medium">{formatDateForDisplay(date)}</span>
                        <button
                          type="button"
                          onClick={() => removeProposedDate(idx)}
                          className="p-2 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg transition-all"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {errors.proposedDates && <p className="text-red-400 text-sm font-medium">{errors.proposedDates}</p>}
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-gray-800">
              <button
                type="button"
                onClick={() => navigate('/module3-meetings')}
                className="flex-1 bg-gray-800/60 hover:bg-gray-700/70 text-gray-300 py-3.5 rounded-lg font-bold transition-all active:scale-95"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-[#00d09c] hover:bg-[#00e6ae] text-gray-900 py-3.5 rounded-lg font-black transition-all shadow-[0_6px_20px_rgba(0,208,156,0.3)] active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? 'Scheduling...' : 'Schedule Meeting'}
              </button>
            </div>
          </form>
        </div>
        </div>
      </main>
    </div>
    </div>
  );
};

export default CreateMeeting;
