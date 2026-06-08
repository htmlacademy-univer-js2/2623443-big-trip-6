export const DATE_FORMAT = 'd/m/y H:i';

export const getDatepickerConfig = (defaultDate, onClose, extraConfig = {}) => ({
  dateFormat: DATE_FORMAT,
  enableTime: true,
  locale: { firstDayOfWeek: 1 },
  'time_24hr': true,
  defaultDate,
  onClose,
  ...extraConfig
});
