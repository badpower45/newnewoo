import { supabase } from './supabaseClient';

export type AttendanceType = 'check_in' | 'check_out';

export interface AttendancePayload {
  locationLat?: number;
  locationLng?: number;
  note?: string;
}

const todayRange = () => {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date();
  end.setHours(23, 59, 59, 999);
  return {
    start: start.toISOString(),
    end: end.toISOString()
  };
};

export const supabaseAttendance = {
  record: async (userId: string, type: AttendanceType, payload: AttendancePayload = {}) => {
    const { error, data } = await supabase
      .from('attendance_logs')
      .insert({
        user_id: userId,
        type,
        location_lat: payload.locationLat ?? null,
        location_lng: payload.locationLng ?? null,
        note: payload.note ?? null
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  getToday: async (userId: string) => {
    const { start, end } = todayRange();
    const { data, error } = await supabase
      .from('attendance_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', start)
      .lte('created_at', end)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data;
  }
};
