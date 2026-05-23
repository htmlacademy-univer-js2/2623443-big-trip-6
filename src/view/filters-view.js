import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

function createFilterTemplate(currentFilter, points) {
  const now = dayjs();
  const hasFuture = points.some((p) => dayjs(p.dateFrom).isAfter(now));
  const hasPresent = points.some((p) =>
    !dayjs(p.dateFrom).isAfter(now) && !dayjs(p.dateTo).isBefore(now)
  );
  const hasPast = points.some((p) => dayjs(p.dateTo).isBefore(now));

  return `
    <form class='trip-filters' action='#' method='get'>
      <div class='trip-filters__filter'>
        <input id='filter-everything' class='trip-filters__filter-input visually-hidden' type='radio' name='trip-filter' value='everything' ${currentFilter === 'everything' ? 'checked' : ''}>
        <label class='trip-filters__filter-label' for='filter-everything'>Everything</label>
      </div>
      <div class='trip-filters__filter'>
        <input id='filter-future' class='trip-filters__filter-input visually-hidden' type='radio' name='trip-filter' value='future' ${currentFilter === 'future' ? 'checked' : ''} ${!hasFuture ? 'disabled' : ''}>
        <label class='trip-filters__filter-label' for='filter-future'>Future</label>
      </div>
      <div class='trip-filters__filter'>
        <input id='filter-present' class='trip-filters__filter-input visually-hidden' type='radio' name='trip-filter' value='present' ${currentFilter === 'present' ? 'checked' : ''} ${!hasPresent ? 'disabled' : ''}>
        <label class='trip-filters__filter-label' for='filter-present'>Present</label>
      </div>
      <div class='trip-filters__filter'>
        <input id='filter-past' class='trip-filters__filter-input visually-hidden' type='radio' name='trip-filter' value='past' ${currentFilter === 'past' ? 'checked' : ''} ${!hasPast ? 'disabled' : ''}>
        <label class='trip-filters__filter-label' for='filter-past'>Past</label>
      </div>
      <button class='visually-hidden' type='submit'>Accept filter</button>
    </form>
  `;
}

export default class FiltersView extends AbstractView {
  #currentFilter = null;
  #points = null;
  #onFilterTypeChange = null;

  constructor({currentFilter, points, onFilterTypeChange}) {
    super();
    this.#currentFilter = currentFilter;
    this.#points = points;
    this.#onFilterTypeChange = onFilterTypeChange;
    this.element.addEventListener('change', this.#filterTypeChangeHandler);
  }

  get template() {
    return createFilterTemplate(this.#currentFilter, this.#points);
  }

  #filterTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'INPUT') {
      return;
    }
    this.#onFilterTypeChange(evt.target.value);
  };
}
