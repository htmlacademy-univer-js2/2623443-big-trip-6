import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';
import { POINT_TYPES, DEFAULT_POINT_TYPE } from '../const.js';
import { shake } from '../utils/shake.js';

function createFormCreateTemplate(state, destinations, offersByType) {
  const { basePrice, dateFrom, dateTo, destinationId, offers, type } = state;
  const currentDestination = destinations.find((destination) => destination.id === destinationId);
  const currentOffers = (offersByType[type] || []).filter(Boolean);
  const safeOffers = Array.isArray(offers) ? offers : [];
  const destinationName = currentDestination ? he.escape(currentDestination.name) : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                ${POINT_TYPES.map((item) => `
                  <div class="event__type-item">
                    <input class="event__type-input  visually-hidden" type="radio" name="event-type" id="event-type-${item}" value="${item}" ${type === item ? 'checked' : ''}>
                    <label class="event__type-label  event__type-label--${item}" for="event-type-${item}">${item}</label>
                  </div>
                `).join('')}
              </fieldset>
            </div>
          </div>
          <div class="event__field-group  event__field-group--destination">
            <label class="event__label  event__type-output" for="event-destination-1">
              ${he.escape(type)}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-1" type="text" name="event-destination" value="${destinationName}" list="destination-list-1">
            <datalist id="destination-list-1">
              ${destinations.map((destination) => `<option value="${he.escape(destination.name)}"></option>`).join('')}
            </datalist>
          </div>
          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input  event__input--time" id="event-start-time-1" type="text" name="event-start-time" value="${dateFrom || ''}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input  event__input--time" id="event-end-time-1" type="text" name="event-end-time" value="${dateTo || ''}">
          </div>
          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-1">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-1" type="text" name="event-price" value="${he.escape(`${basePrice}`)}">
          </div>
          <button class="event__save-btn  btn  btn--blue" type="submit"${state.isSaving ? ' disabled' : ''}>${state.isSaving ? 'Saving...' : 'Save'}</button>
          <button class="event__reset-btn" type="reset">Cancel</button>
        </header>
        <section class="event__details">
          ${currentOffers.length ? `
            <section class="event__section  event__section--offers">
              <h3 class="event__section-title  event__section-title--offers">Offers</h3>
              <div class="event__available-offers">
                ${currentOffers.map((offer) => `
                  <div class="event__offer-selector">
                    <input class="event__offer-checkbox  visually-hidden" id="event-offer-${offer.id}" type="checkbox" name="event-offer" value="${offer.id}" ${safeOffers.includes(offer.id) ? 'checked' : ''}>
                    <label class="event__offer-label" for="event-offer-${offer.id}">
                      <span class="event__offer-title">${he.escape(offer.title)}</span>
                      &plus;&euro;&nbsp;
                      <span class="event__offer-price">${he.escape(`${offer.price}`)}</span>
                    </label>
                  </div>
                `).join('')}
              </div>
            </section>
          ` : ''}
          ${currentDestination && currentDestination.description ? `
            <section class="event__section  event__section--destination">
              <h3 class="event__section-title  event__section-title--destination">Destination</h3>
              <p class="event__destination-description">${he.escape(currentDestination.description)}</p>
              ${currentDestination.pictures && currentDestination.pictures.length ? `
                <div class="event__photos-container">
                  <div class="event__photos-tape">
                    ${currentDestination.pictures.map((picture) => `
                      <img class="event__photo" src="${he.escape(picture.src)}" alt="${he.escape(picture.description)}">
                    `).join('')}
                  </div>
                </div>
              ` : ''}
            </section>
          ` : ''}
        </section>
      </form>
    </li>
  `;
}

export default class FormCreateView extends AbstractStatefulView {
  #destinations = null;
  #offersByType = null;
  #onFormSubmit = null;
  #onFormClose = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({defaultType, destinations, offersByType, onFormSubmit, onFormClose}) {
    super();
    this.#destinations = destinations || [];
    this.#offersByType = offersByType || {};
    this.#onFormSubmit = onFormSubmit;
    this.#onFormClose = onFormClose;

    this._setState({
      basePrice: 0,
      dateFrom: '',
      dateTo: '',
      destinationId: '',
      isFavorite: false,
      offers: [],
      type: defaultType || DEFAULT_POINT_TYPE,
      isSaving: false,
      isSaveError: false
    });

    this._restoreHandlers();
  }

  get template() {
    return createFormCreateTemplate(this._state, this.#destinations, this.#offersByType);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);
    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#offersChangeHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formCloseHandler);
    this.#setDatepickers();
  }

  removeElement() {
    super.removeElement();
    if (this.#datepickerFrom) {
      this.#datepickerFrom.destroy();
      this.#datepickerFrom = null;
    }
    if (this.#datepickerTo) {
      this.#datepickerTo.destroy();
      this.#datepickerTo = null;
    }
  }

  reset(state) {
    this.updateElement(state);
  }

  setSaving() {
    this.updateElement({ isSaving: true, isSaveError: false });
  }

  setSaveError() {
    this.updateElement({ isSaving: false, isSaveError: true });
    shake(this.element);
  }

  #formSubmitHandler = (evt) => {
    evt.preventDefault();
    this.#onFormSubmit(this._state);
  };

  #formCloseHandler = (evt) => {
    evt.preventDefault();
    this.#onFormClose();
  };

  #typeChangeHandler = (evt) => {
    this.updateElement({ type: evt.target.value, offers: [] });
  };

  #destinationChangeHandler = (evt) => {
    const selectedDestination = this.#destinations.find((destination) => destination.name === evt.target.value);
    if (selectedDestination) {
      this.updateElement({ destinationId: selectedDestination.id });
    }
  };

  #priceInputHandler = (evt) => {
    this._setState({ basePrice: evt.target.value });
  };

  #offersChangeHandler = () => {
    const offers = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked')).map((checkboxElement) => checkboxElement.value);
    this._setState({ offers });
  };

  #setDatepickers = () => {
    const [dateFromElement, dateToElement] = this.element.querySelectorAll('.event__input--time');
    const commonConfig = {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: { firstDayOfWeek: 1 },
      'time_24hr': true
    };

    this.#datepickerFrom = flatpickr(dateFromElement, {
      ...commonConfig,
      defaultDate: this._state.dateFrom,
      onClose: this.#dateFromChangeHandler,
      maxDate: this._state.dateTo
    });

    this.#datepickerTo = flatpickr(dateToElement, {
      ...commonConfig,
      defaultDate: this._state.dateTo,
      onClose: this.#dateToChangeHandler,
      minDate: this._state.dateFrom
    });
  };

  #dateFromChangeHandler = ([userDate]) => {
    this._setState({ dateFrom: userDate });
    this.#datepickerTo.set('minDate', this._state.dateFrom);
  };

  #dateToChangeHandler = ([userDate]) => {
    this._setState({ dateTo: userDate });
    this.#datepickerFrom.set('maxDate', this._state.dateTo);
  };
}
