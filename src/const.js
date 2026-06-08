export const UpdateType = {
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  ADD: 'ADD',
};

export const FilterType = {
  EVERYTHING: 'everything',
  FUTURE: 'future',
  PRESENT: 'present',
  PAST: 'past',
};

export const EmptyListMessage = {
  [FilterType.EVERYTHING]: 'Click New Event to create your first point',
  [FilterType.FUTURE]: 'There are no future events now',
  [FilterType.PRESENT]: 'There are no present events now',
  [FilterType.PAST]: 'There are no past events now',
};

export const POINT_TYPES = ['taxi', 'bus', 'train', 'ship', 'drive', 'flight', 'check-in', 'sightseeing', 'restaurant'];

export const DEFAULT_POINT_TYPE = 'flight';

export const MS_IN_MINUTE = 60000;
export const MINUTES_IN_HOUR = 60;
export const MINUTES_IN_DAY = 1440;
export const TOKEN_LENGTH = 16;
