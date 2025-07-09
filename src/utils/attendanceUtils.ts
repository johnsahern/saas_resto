
export const calculateHours = (clockIn?: string, clockOut?: string): string => {
  if (!clockIn || !clockOut) return '0h';
  
  const [inHours, inMinutes] = clockIn.split(':').map(Number);
  const [outHours, outMinutes] = clockOut.split(':').map(Number);
  
  const inTime = inHours * 60 + inMinutes;
  const outTime = outHours * 60 + outMinutes;
  
  const totalMinutes = outTime - inTime;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  
  return `${hours}h${minutes > 0 ? `${minutes}m` : ''}`;
};

export const getAttendanceStats = (attendanceRecords: Array<{ status: string }>) => {
  const total = attendanceRecords.length;
  const present = attendanceRecords.filter(r => r.status === 'present').length;
  const absent = attendanceRecords.filter(r => r.status === 'absent').length;
  const late = attendanceRecords.filter(r => r.status === 'late').length;
  
  return { total, present, absent, late };
};
