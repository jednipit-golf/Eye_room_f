export const leaveTypeLabels = {
  sick: 'ลาป่วย',
  vacation: 'ลาพักร้อน',
  other: 'อื่นๆ'
};

export const getLeaveTypeLabel = (leaveType) => leaveTypeLabels[leaveType] || '-';
