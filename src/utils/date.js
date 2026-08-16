const THAI_TIME_ZONE = 'Asia/Bangkok';

const dateFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: THAI_TIME_ZONE,
  day: '2-digit',
  month: '2-digit',
  year: 'numeric'
});

const dateTimeFormatter = new Intl.DateTimeFormat('en-GB', {
  timeZone: THAI_TIME_ZONE,
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false
});

const formatParts = (formatter, value) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return formatter.formatToParts(date).reduce((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
};

export const formatBangkokDate = (value, separator = '/') => {
  const parts = formatParts(dateFormatter, value);
  if (!parts) return '';

  const yearBE = Number.parseInt(parts.year, 10) + 543;
  return `${parts.day}${separator}${parts.month}${separator}${yearBE}`;
};

export const formatBangkokDateTime = (value) => {
  const parts = formatParts(dateTimeFormatter, value);
  if (!parts) return '';

  const yearBE = Number.parseInt(parts.year, 10) + 543;
  return `${parts.day}/${parts.month}/${yearBE} ${parts.hour}:${parts.minute}:${parts.second}`;
};

export const convertISODateToBuddhistEra = (dateString) => {
  if (!dateString) return '';

  const [year, month, day] = dateString.split('-');
  return `${day}-${month}-${Number.parseInt(year, 10) + 543}`;
};
