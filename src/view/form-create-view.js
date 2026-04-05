import AbstractView from '../framework/view/abstract-view.js';

function createFormCreateTemplate(defaultType = 'flight', destinations = [], availableOffers = []) {
  const destinationOptions = destinations.length
    ? destinations.map((dest) => `<option value="${dest.name}"></option>`).join('')
    : '';

  const offersTemplate = availableOffers.length ? `
    <section class='event__section event__section--offers'>
      <h3 class='event__section-title event__section-title--offers'>Offers</h3>
      <div class='event__available-offers'>
        ${availableOffers.map((offer) => `
          <div class='event__offer-selector'>
            <input class='event__offer-checkbox visually-hidden'
                   id='offer-${offer.id}'
                   type='checkbox'
                   name='offer'
                   value='${offer.id}'>
            <label class='event__offer-label' for='offer-${offer.id}'>
              <span class='event__offer-title'>${offer.title}</span>
              &plus;&euro;&nbsp;
              <span class='event__offer-price'>${offer.price}</span>
            </label>
          </div>
        `).join('')}
      </div>
    </section>
  ` : '';

  return `
    <li class='trip-events__item'>
      <form class='event event--edit' action='#' method='post'>
        <header class='event__header'>
          <div class='event__type-wrapper'>
            <label class='event__type event__type-btn' for='event-type-toggle-1'>
              <span class='visually-hidden'>Choose event type</span>
              <img class='event__type-icon' width='17' height='17' src='img/icons/${defaultType}.png' alt='Event type icon'>
            </label>
            <input class='event__type-toggle visually-hidden' id='event-type-toggle-1' type='checkbox'>
            <div class='event__type-list'>
              <fieldset class='event__type-group'>
                <legend class='visually-hidden'>Event type</legend>
                <button class='event__type-item event__type-item--btn' type='button' data-type='taxi'>Taxi</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='bus'>Bus</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='train'>Train</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='ship'>Ship</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='drive'>Drive</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='flight'>Flight</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='check-in'>Check-in</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='sightseeing'>Sightseeing</button>
                <button class='event__type-item event__type-item--btn' type='button' data-type='restaurant'>Restaurant</button>
              </fieldset>
            </div>
          </div>
          <div class='event__field-group event__field-group--destination'>
            <label class='event__label event__type-output' for='event-destination-1'>
              ${defaultType} to
            </label>
            <input class='event__input event__input--destination'
                   id='event-destination-1'
                   type='text'
                   name='event-destination'
                   value=''
                   list='destination-list-1'
                   required>
            <datalist id='destination-list-1'>
              ${destinationOptions}
            </datalist>
          </div>
          <div class='event__field-group event__field-group--time'>
            <label class='visually-hidden' for='event-start-time-1'>From</label>
            <input class='event__input event__input--time'
                   id='event-start-time-1'
                   type='text'
                   name='event-start-time'
                   value=''
                   placeholder='19/03/19 00:00'
                   required>
            &mdash;
            <label class='visually-hidden' for='event-end-time-1'>To</label>
            <input class='event__input event__input--time'
                   id='event-end-time-1'
                   type='text'
                   name='event-end-time'
                   value=''
                   placeholder='19/03/19 00:00'
                   required>
          </div>
          <div class='event__field-group event__field-group--price'>
            <label class='visually-hidden' for='event-price-1'>Price</label>
            <input class='event__input event__input--price'
                   id='event-price-1'
                   type='number'
                   name='event-price'
                   value='0'
                   min='0'
                   required>
          </div>
          <button class='event__save-btn btn btn--blue' type='submit'>Save</button>
          <button class='event__reset-btn' type='reset'>Cancel</button>
        </header>
        ${offersTemplate ? `<section class='event__details'>${offersTemplate}</section>` : ''}
      </form>
    </li>
  `;
}

export default class FormCreateView extends AbstractView {
  #defaultType = null;
  #destinations = null;
  #availableOffers = null;
  #onFormSubmit = null;
  #onFormClose = null;

  constructor({defaultType = 'flight', destinations, availableOffers, onFormSubmit, onFormClose}) {
    super();
    this.#defaultType = defaultType;
    this.#destinations = destinations;
    this.#availableOffers = availableOffers;
    this.#onFormSubmit = onFormSubmit;
    this.#onFormClose = onFormClose;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formCloseHandler);
  }

  get template() {
    return createFormCreateTemplate(this.#defaultType, this.#destinations, this.#availableOffers);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#onFormSubmit();
  };

  #formCloseHandler = (evt) => {
    evt.preventDefault();
    this.#onFormClose();
  };
}
