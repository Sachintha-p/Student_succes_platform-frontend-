import { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

export const DatePicker = ({ value, onChange, error, label, required = false, minDate, maxDate }) => {
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(
    value ? new Date(value) : new Date()
  );

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const handlePrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const isDateDisabled = (day) => {
    const dateString = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      day
    ).toISOString().split('T')[0];

    if (minDate && dateString < minDate) return true;
    if (maxDate && dateString > maxDate) return true;
    return false;
  };

  const handleSelectDate = (day) => {
    if (isDateDisabled(day)) return;
    
    const selected = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    const dateString = selected.toISOString().split('T')[0];
    onChange(dateString);
    setShowCalendar(false);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2"></div>);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        day
      ).toISOString().split('T')[0];
      
      const isSelected = value === dateString;
      const isDisabled = isDateDisabled(day);
      
      days.push(
        <button
          key={day}
          onClick={() => handleSelectDate(day)}
          disabled={isDisabled}
          className={`p-2 rounded text-sm font-medium transition-all ${
            isSelected
              ? 'bg-[#00d09c] text-gray-900 font-bold'
              : isDisabled
              ? 'text-gray-600 cursor-not-allowed opacity-50'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          }`}
        >
          {day}
        </button>
      );
    }

    return days;
  };

  const selectedDate = value ? new Date(value + 'T00:00:00') : null;

  return (
    <div className="relative w-full">
      {label && (
        <label className="block text-white font-bold text-sm mb-3 uppercase tracking-wider">
          <span>{label}</span>
          {required && <span className="text-red-400">*</span>}
        </label>
      )}
      
      <button
        type="button"
        onClick={() => setShowCalendar(!showCalendar)}
        className={`w-full bg-[#090e17] border-2 rounded-xl py-3 px-4 text-white focus:outline-none transition-all text-left flex justify-between items-center ${
          error ? 'border-red-500' : 'border-gray-800 focus:border-[#00d09c]'
        }`}
      >
        <span>
          {value ? selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Select date'}
        </span>
        <span>📅</span>
      </button>

      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-400 text-sm font-bold">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {showCalendar && (
        <div className="absolute top-full mt-2 left-0 bg-[#121826] border border-gray-800 rounded-xl p-4 z-10 w-full shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 hover:bg-gray-800 rounded transition-all"
            >
              <ChevronLeft size={20} className="text-gray-400" />
            </button>
            <span className="text-white font-bold text-sm">
              {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 hover:bg-gray-800 rounded transition-all"
            >
              <ChevronRight size={20} className="text-gray-400" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-4">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="p-2 text-center text-xs text-gray-600 font-bold">
                {day}
              </div>
            ))}
            {renderCalendar()}
          </div>
        </div>
      )}
    </div>
  );
};

export const TimePicker = ({ value, onChange }) => {
  const [hour, setHour] = useState(value ? value.split(':')[0] : '09');
  const [minute, setMinute] = useState(value ? value.split(':')[1] : '00');

  const handleHourChange = (e) => {
    const h = e.target.value.padStart(2, '0');
    setHour(h);
    onChange(`${h}:${minute}`);
  };

  const handleMinuteChange = (e) => {
    const m = e.target.value.padStart(2, '0');
    setMinute(m);
    onChange(`${hour}:${m}`);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="flex gap-4 items-end">
      <div className="flex-1">
        <label className="block text-xs text-gray-600 font-bold mb-2">Hour</label>
        <select
          value={hour}
          onChange={handleHourChange}
          className="w-full bg-[#090e17] border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00d09c] transition-all"
        >
          {hours.map(h => (
            <option key={h} value={h}>{h}:00</option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-xs text-gray-600 font-bold mb-2">Minute</label>
        <select
          value={minute}
          onChange={handleMinuteChange}
          className="w-full bg-[#090e17] border border-gray-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-[#00d09c] transition-all"
        >
          {minutes.map(m => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>

      <div className="text-2xl text-[#00d09c] font-bold">🕐</div>
    </div>
  );
};
