import AbstractStatefulView from '../framework/view/abstract-stateful-view.js';
import flatpickr from 'flatpickr';
import 'flatpickr/dist/flatpickr.min.css';

function formatDateForInput(dateString) {
  if (!dateString) {
    return '';
  }
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = String(date.getFullYear()).slice(-2);
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

function createFormCreateTemplate(state, destinations, offersByType) {
  const { type, basePrice, dateFrom, dateTo, destinationId, offers } = state;
  const destination = destinations.find((d) => d.id === destinationId) || null;
  const destinationName = destination?.name || '';
  const availableOffers = offersByType[type] || [];

  const offersTemplate = availableOffers.length ? `
    <section class='event__section event__section--offers'>
      <h3 class='event__section-title event__section-title--offers'>Offers</h3>
      <div class='event__available-offers'>
        ${availableOffers.map((offer) => {
    const isChecked = offers.includes(offer.id);
    return `
            <div class='event__offer-selector'>
              <input class='event__offer-checkbox visually-hidden'
                     id='offer-${offer.id}'
                     type='checkbox'
                     name='offer'
                     value='${offer.id}'
                     ${isChecked ? 'checked' : ''}>
              <label class='event__offer-label' for='offer-${offer.id}'>
                <span class='event__offer-title'>${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class='event__offer-price'>${offer.price}</span>
              </label>
            </div>
          `;
  }).join('')}
      </div>
    </section>
  ` : '';

  const destinationTemplate = (destination?.description || destination?.pictures?.length) ? `
    <section class='event__section event__section--destination'>
      <h3 class='event__section-title event__section-title--destination'>Destination</h3>
      ${destination.description ? `<p class='event__destination-description'>${destination.description}</p>` : ''}
      ${destination.pictures?.length ? `
        <div class='event__photos-container'>
          <div class='event__photos-tape'>
            ${destination.pictures.map((pic) => `
              <img class='event__photo' src='${pic}' alt='${destination.name} photo'>
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  ` : '';

  return `
    <li class='trip-events__item'>
      <form class='event event--edit' action='#' method='post'>
        <header class='event__header'>
          <div class='event__type-wrapper'>
            <label class='event__type event__type-btn' for='event-type-toggle-1'>
              <span class='visually-hidden'>Choose event type</span>
              <img class='event__type-icon' width='17' height='17' src='img/icons/${type}.png' alt='Event type icon'>
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
              ${type} to
            </label>
            <input class='event__input event__input--destination'
                   id='event-destination-1'
                   type='text'
                   name='event-destination'
                   value='${destinationName}'
                   list='destination-list-1'
                   required>
            <datalist id='destination-list-1'>
              ${destinations.map((d) => `<option value='${d.name}'></option>`).join('')}
            </datalist>
          </div>
          <div class='event__field-group event__field-group--time'>
            <label class='visually-hidden' for='event-start-time-1'>From</label>
            <input class='event__input event__input--time'
                   id='event-start-time-1'
                   type='text'
                   name='event-start-time'
                   value='${dateFrom ? formatDateForInput(dateFrom) : ''}'
                   placeholder='19/03/19 00:00'
                   required>
            &mdash;
            <label class='visually-hidden' for='event-end-time-1'>To</label>
            <input class='event__input event__input--time'
                   id='event-end-time-1'
                   type='text'
                   name='event-end-time'
                   value='${dateTo ? formatDateForInput(dateTo) : ''}'
                   placeholder='19/03/19 00:00'
                   required>
          </div>
          <div class='event__field-group event__field-group--price'>
            <label class='visually-hidden' for='event-price-1'>Price</label>
            <input class='event__input event__input--price'
                   id='event-price-1'
                   type='number'
                   name='event-price'
                   value='${basePrice}'
                   min='0'
                   required>
          </div>
          <button class='event__save-btn btn btn--blue' type='submit'>Save</button>
          <button class='event__reset-btn' type='reset'>Cancel</button>
        </header>
        ${(offersTemplate || destinationTemplate) ? `
          <section class='event__details'>
            ${offersTemplate}
            ${destinationTemplate}
          </section>
        ` : ''}
      </form>
    </li>
  `;
}

export default class FormCreateView extends AbstractStatefulView {
  #destinations = null;
  #offersByType = null;
  #onFormSubmit = null;
  #onFormClose = null;
  #datepickerStart = null;
  #datepickerEnd = null;

  constructor({defaultType = 'flight', destinations, offersByType, onFormSubmit, onFormClose}) {
    super();
    this._setState({
      type: defaultType,
      basePrice: 0,
      dateFrom: null,
      dateTo: null,
      destinationId: null,
      offers: []
    });
    this.#destinations = destinations;
    this.#offersByType = offersByType;
    this.#onFormSubmit = onFormSubmit;
    this.#onFormClose = onFormClose;
    this._restoreHandlers();
  }

  get template() {
    return createFormCreateTemplate(this._state, this.#destinations, this.#offersByType);
  }

  _restoreHandlers() {
    this.element.querySelector('form').addEventListener('submit', (evt) => this.#formSubmitHandler(evt));
    this.element.querySelector('.event__reset-btn').addEventListener('click', (evt) => this.#formCloseHandler(evt));

    this.element.querySelectorAll('.event__type-item--btn').forEach((btn) => {
      btn.addEventListener('click', (evt) => this.#typeChangeHandler(evt));
    });

    this.element.querySelector('.event__input--destination').addEventListener('change', (evt) => this.#destinationChangeHandler(evt));

    this.element.querySelectorAll('.event__offer-checkbox').forEach((checkbox) => {
      checkbox.addEventListener('change', (evt) => this.#offerChangeHandler(evt));
    });

    this.element.querySelector('.event__input--price').addEventListener('input', (evt) => {
      evt.target.value = evt.target.value.replace(/[^0-9]/g, '');
    });
    this.element.querySelector('.event__input--price').addEventListener('change', (evt) => {
      this._setState({ ...this._state, basePrice: Number(evt.target.value) || 0 });
    });

    const startTimeElement = this.element.querySelector('[name="event-start-time"]');
    const endTimeElement = this.element.querySelector('[name="event-end-time"]');

    if (this.#datepickerStart) {
      this.#datepickerStart.destroy();
    }
    if (this.#datepickerEnd) {
      this.#datepickerEnd.destroy();
    }

    this.#datepickerStart = flatpickr(startTimeElement, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: { firstDayOfWeek: 1 },
      'time_24hr': true,
      defaultDate: this._state.dateFrom ? new Date(this._state.dateFrom) : null,
      onChange: this.#dateChangeHandler('dateFrom')
    });

    this.#datepickerEnd = flatpickr(endTimeElement, {
      dateFormat: 'd/m/y H:i',
      enableTime: true,
      locale: { firstDayOfWeek: 1 },
      'time_24hr': true,
      defaultDate: this._state.dateTo ? new Date(this._state.dateTo) : null,
      minDate: this._state.dateFrom ? new Date(this._state.dateFrom) : null,
      onChange: this.#dateChangeHandler('dateTo')
    });
  }

  setSaving() {
    this.element.querySelector('.event__save-btn').textContent = 'Saving...';
    this.#setDisabled(true);
  }

  setSaveError() {
    this.#setDisabled(false);
    this.element.querySelector('.event__save-btn').textContent = 'Save';
    this.#shake();
  }

  #setDisabled(isDisabled) {
    this.element.querySelectorAll('input, select, button').forEach((el) => {
      el.disabled = isDisabled;
    });
  }

  #shake() {
    this.element.classList.add('shake');
    setTimeout(() => this.element.classList.remove('shake'), 600);
  }

  #formSubmitHandler(evt) {
    evt.preventDefault();
    this.#onFormSubmit(this._state);
  }

  #formCloseHandler(evt) {
    evt.preventDefault();
    this.#onFormClose();
  }

  #typeChangeHandler(evt) {
    evt.preventDefault();
    const newType = evt.target.dataset.type;
    if (!newType) {
      return;
    }
    this.updateElement({
      ...this._state,
      type: newType,
      offers: []
    });
  }

  #destinationChangeHandler(evt) {
    const newDestinationName = evt.target.value;
    const destination = this.#destinations.find((d) => d.name === newDestinationName);
    if (!destination) {
      return;
    }
    this.updateElement({
      ...this._state,
      destinationId: destination.id
    });
  }

  #offerChangeHandler(evt) {
    const offerId = evt.target.value;
    const currentOffers = [...this._state.offers];
    const index = currentOffers.indexOf(offerId);
    if (index === -1) {
      currentOffers.push(offerId);
    } else {
      currentOffers.splice(index, 1);
    }
    this.updateElement({
      ...this._state,
      offers: currentOffers
    });
  }

  #dateChangeHandler = (key) => ([selectedDate]) => {
    this._setState({
      ...this._state,
      [key]: selectedDate.toISOString()
    });
    if (key === 'dateFrom') {
      this.#datepickerEnd.set('minDate', this._state.dateFrom);
    }
  };
}
