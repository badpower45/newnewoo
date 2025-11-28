import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

interface DeliverySlot {
  id: number;
  branch_id: number;
  date: string;
  start_time: string;
  end_time: string;
  max_orders: number;
  current_orders: number;
  is_active: boolean;
}

interface DeliverySlotPickerProps {
  branchId: number;
  onSelect: (slot: DeliverySlot) => void;
  selectedSlotId?: number;
}

const DeliverySlotPicker: React.FC<DeliverySlotPickerProps> = ({ 
  branchId, 
  onSelect, 
  selectedSlotId 
}) => {
  const [slots, setSlots] = useState<DeliverySlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');

  // Generate next 7 days
  const getNext7Days = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      days.push(date.toISOString().split('T')[0]);
    }
    return days;
  };

  const dates = getNext7Days();

  useEffect(() => {
    if (!selectedDate && dates.length > 0) {
      setSelectedDate(dates[0]);
    }
  }, []);

  useEffect(() => {
    if (selectedDate && branchId) {
      fetchSlots();
    }
  }, [selectedDate, branchId]);

  const fetchSlots = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.deliverySlots.getByBranch(branchId, selectedDate);
      const slotsData = response.data || response;
      // Filter available slots
      const availableSlots = slotsData.filter(
        (slot: DeliverySlot) => slot.is_active && slot.current_orders < slot.max_orders
      );
      setSlots(availableSlots);
    } catch (err) {
      setError('فشل تحميل أوقات التوصيل المتاحة');
      console.error('Error fetching delivery slots:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return 'اليوم';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'غداً';
    }

    return date.toLocaleDateString('ar-EG', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'م' : 'ص';
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return <LoadingSpinner message="جاري تحميل أوقات التوصيل..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSlots} />;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold mb-3">اختر موعد التوصيل</h3>

      {/* Date Selection */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {dates.map((date) => (
          <button
            key={date}
            onClick={() => setSelectedDate(date)}
            className={`px-4 py-2 rounded-lg border whitespace-nowrap transition ${
              selectedDate === date
                ? 'bg-green-600 text-white border-green-600'
                : 'border-gray-300 hover:border-green-600'
            }`}
          >
            {formatDate(date)}
          </button>
        ))}
      </div>

      {/* Time Slots */}
      {slots.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">لا توجد أوقات توصيل متاحة لهذا اليوم</p>
          <p className="text-sm text-gray-500 mt-1">يرجى اختيار يوم آخر</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {slots.map((slot) => (
            <button
              key={slot.id}
              onClick={() => onSelect(slot)}
              className={`p-4 rounded-lg border-2 transition ${
                selectedSlotId === slot.id
                  ? 'border-green-600 bg-green-50'
                  : 'border-gray-200 hover:border-green-400'
              }`}
            >
              <div className="font-semibold text-gray-900">
                {formatTime(slot.start_time)} - {formatTime(slot.end_time)}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                متاح {slot.max_orders - slot.current_orders} من {slot.max_orders}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DeliverySlotPicker;
