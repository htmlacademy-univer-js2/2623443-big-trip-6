import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';
import he from 'he';
import { POINT_TYPES } from '../const.js';
import { shake } from '../utils/shake.js';

function getSaveButtonText(state) {
  if (state.isSaving) {
    return 'Saving...';
  }
  if (state.isDeleting) {
    return 'Deleting...';
  }
  return 'Save';
}

function isSaveButtonDisabled(state) {
  return state.isSaving || state.isDeleting;
}

function createFormEditTemplate(state, destinations, offersByType) {
  const { id, basePrice, dateFrom, dateTo, destinationId, offers, type } = state;
  const currentDestination = destinations.find((dest) => dest.id === destinationId);
  const currentOffers = (offersByType[type] || []).filter(Boolean);
  const safeOffers = Array.isArray(offers) ? offers : [];
  const destinationName = currentDestination ? he.escape(currentDestination.name) : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type  event__type-btn" for="event-type-toggle-${id}">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle  visually-hidden" id="event-type-toggle-${id}" type="checkbox">
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
            <label class="event__label  event__type-output" for="event-destination-${id}">
              ${he.escape(type)}
            </label>
            <input class="event__input  event__input--destination" id="event-destination-${id}" type="text" name="event-destination" value="${destinationName}" list="destination-list-${id}">
            <datalist id="destination-list-${id}">
              ${destinations.map((dest) => `<option value="${he.escape(dest.name)}"></option>`).join('')}
            </datalist>
          </div>
          <div class="event__field-group  event__field-group--time">
            <label class="visually-hidden" for="event-start-time-${id}">From</label>
            <input class="event__input  event__input--time" id="event-start-time-${id}" type="text" name="event-start-time" value="${dateFrom || ''}">
            &mdash;
            <label class="visually-hidden" for="event-end-time-${id}">To</label>
            <input class="event__input  event__input--time" id="event-end-time-${id}" type="text" name="event-end-time" value="${dateTo || ''}">
          </div>
          <div class="event__field-group  event__field-group--price">
            <label class="event__label" for="event-price-${id}">
              <span class="visually-hidden">Price</span>
              &euro;
            </label>
            <input class="event__input  event__input--price" id="event-price-${id}" type="text" name="event-price" value="${he.escape(`${basePrice}`)}">
          </div>
          <button class="event__save-btn  btn  btn--blue" type="submit"${isSaveButtonDisabled(state) ? ' disabled' : ''}>${getSaveButtonText(state)}</button>
          <button class="event__rollup-btn" type="button"></button>
          <button class="event__reset-btn" type="reset">${state.isDeleting ? 'Deleting...' : 'Delete'}</button>
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
                    ${currentDestination.pictures.map((pic) => `
                      <img class="event__photo" src="${he.escape(pic.src)}" alt="${he.escape(pic.description)}">
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

export default class FormEditView extends AbstractStatefulView {
  #destinations = null;
  #offersByType = null;
  #onFormSubmit = null;
  #onFormClose = null;
  #onDeleteClick = null;
  #datepickerFrom = null;
  #datepickerTo = null;

  constructor({point, destinations, offersByType, onFormSubmit, onFormClose, onDeleteClick}) {
    super();
    this.#destinations = destinations || [];
    this.#offersByType = offersByType || {};
    this.#onFormSubmit = onFormSubmit;
    this.#onFormClose = onFormClose;
    this.#onDeleteClick = onDeleteClick;

    this._setState({
      id: point.id || '',
      basePrice: point.basePrice || 0,
      dateFrom: point.dateFrom || '',
      dateTo: point.dateTo || '',
      destinationId: point.destinationId || '',
      offers: Array.isArray(point.offersIds) ? point.offersIds : [],
      type: point.type || 'flight',
      isSaving: false,
      isDeleting: false,
      isSaveError: false,
      isDeleteError: false
    });

    this._restoreHandlers();
  }

  get template() {
    return createFormEditTemplate(this._state, this.#destinations, this.#offersByType);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__type-group').addEventListener('change', this.#typeChangeHandler);
    this.element.querySelector('.event__input--destination').addEventListener('change', this.#destinationChangeHandler);
    this.element.querySelector('.event__input--price').addEventListener('input', this.#priceInputHandler);
    this.element.querySelector('.event__available-offers')?.addEventListener('change', this.#offersChangeHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#formCloseHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#deleteClickHandler);
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

  reset(point) {
    this.updateElement({
      ...point,
      isSaving: false,
      isDeleting: false,
      isSaveError: false,
      isDeleteError: false
    });
  }

  setSaving() {
    this.updateElement({ isSaving: true, isSaveError: false });
  }

  setSaveError() {
    this.updateElement({ isSaving: false, isSaveError: true });
    shake(this.element);
  }

  setDeleting() {
    this.updateElement({ isDeleting: true, isDeleteError: false });
  }

  setDeleteError() {
    this.updateElement({ isDeleting: false, isDeleteError: true });
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

  #deleteClickHandler = (evt) => {
    evt.preventDefault();
    this.#onDeleteClick();
  };

  #typeChangeHandler = (evt) => {
    this.updateElement({ type: evt.target.value, offers: [] });
  };

  #destinationChangeHandler = (evt) => {
    const selectedDestination = this.#destinations.find((dest) => dest.name === evt.target.value);
    if (selectedDestination) {
      this.updateElement({ destinationId: selectedDestination.id });
    }
  };

  #priceInputHandler = (evt) => {
    this._setState({ basePrice: evt.target.value });
  };

  #offersChangeHandler = () => {
    const offers = Array.from(this.element.querySelectorAll('.event__offer-checkbox:checked')).map((el) => el.value);
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
