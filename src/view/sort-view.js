import AbstractView from '../framework/view/abstract-view.js';

function createSortTemplate(currentSortType) {
  return `
    <form class='trip-events__trip-sort trip-sort' action='#' method='get'>
      <div class='trip-sort__item trip-sort__item--day'>
        <input id='sort-day' class='trip-sort__input visually-hidden' type='radio' name='trip-sort' value='day' ${currentSortType === 'day' ? 'checked' : ''}>
        <label class='trip-sort__btn' for='sort-day' data-sort-type='day'>Day</label>
      </div>
      <div class='trip-sort__item trip-sort__item--event'>
        <input id='sort-event' class='trip-sort__input visually-hidden' type='radio' name='trip-sort' value='event' disabled>
        <label class='trip-sort__btn' for='sort-event'>Event</label>
      </div>
      <div class='trip-sort__item trip-sort__item--time'>
        <input id='sort-time' class='trip-sort__input visually-hidden' type='radio' name='trip-sort' value='time' ${currentSortType === 'time' ? 'checked' : ''}>
        <label class='trip-sort__btn' for='sort-time' data-sort-type='time'>Time</label>
      </div>
      <div class='trip-sort__item trip-sort__item--price'>
        <input id='sort-price' class='trip-sort__input visually-hidden' type='radio' name='trip-sort' value='price' ${currentSortType === 'price' ? 'checked' : ''}>
        <label class='trip-sort__btn' for='sort-price' data-sort-type='price'>Price</label>
      </div>
      <div class='trip-sort__item trip-sort__item--offers'>
        <input id='sort-offers' class='trip-sort__input visually-hidden' type='radio' name='trip-sort' value='offers' disabled>
        <label class='trip-sort__btn' for='sort-offers'>Offers</label>
      </div>
    </form>
  `;
}

export default class SortView extends AbstractView {
  #currentSortType = null;
  #onSortTypeChange = null;

  constructor({currentSortType, onSortTypeChange}) {
    super();
    this.#currentSortType = currentSortType;
    this.#onSortTypeChange = onSortTypeChange;
    this.element.addEventListener('click', this.#sortTypeChangeHandler);
  }

  get template() {
    return createSortTemplate(this.#currentSortType);
  }

  #sortTypeChangeHandler = (evt) => {
    if (evt.target.tagName !== 'LABEL') {
      return;
    }
    const sortType = evt.target.dataset.sortType;
    if (!sortType) {
      return;
    }
    this.#onSortTypeChange(sortType);
  };
}
