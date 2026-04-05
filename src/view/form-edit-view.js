import AbstractView from '../framework/view/abstract-view.js';

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

function createFormEditTemplate(point, destination, availableOffers, selectedOfferIds = []) {
  const { type, basePrice, dateFrom, dateTo } = point;
  const destinationName = destination?.name || '';
  const offersTemplate = availableOffers.length ? `
    <section class="event__section event__section--offers">
      <h3 class="event__section-title event__section-title--offers">Offers</h3>
      <div class="event__available-offers">
        ${availableOffers.map((offer) => {
    const isChecked = selectedOfferIds.includes(offer.id);
    return `
            <div class="event__offer-selector">
              <input class="event__offer-checkbox visually-hidden"
                     id="offer-${offer.id}"
                     type="checkbox"
                     name="offer"
                     value="${offer.id}"
                     ${isChecked ? 'checked' : ''}>
              <label class="event__offer-label" for="offer-${offer.id}">
                <span class="event__offer-title">${offer.title}</span>
                &plus;&euro;&nbsp;
                <span class="event__offer-price">${offer.price}</span>
              </label>
            </div>
          `;
  }).join('')}
      </div>
    </section>
  ` : '';
  const destinationTemplate = (destination?.description || destination?.pictures?.length) ? `
    <section class="event__section event__section--destination">
      <h3 class="event__section-title event__section-title--destination">Destination</h3>
      ${destination.description ? `<p class="event__destination-description">${destination.description}</p>` : ''}
      ${destination.pictures?.length ? `
        <div class="event__photos-container">
          <div class="event__photos-tape">
            ${destination.pictures.map((pic) => `
              <img class="event__photo" src="${pic}" alt="${destination.name} photo">
            `).join('')}
          </div>
        </div>
      ` : ''}
    </section>
  ` : '';

  return `
    <li class="trip-events__item">
      <form class="event event--edit" action="#" method="post">
        <header class="event__header">
          <div class="event__type-wrapper">
            <label class="event__type event__type-btn" for="event-type-toggle-1">
              <span class="visually-hidden">Choose event type</span>
              <img class="event__type-icon" width="17" height="17" src="img/icons/${type}.png" alt="Event type icon">
            </label>
            <input class="event__type-toggle visually-hidden" id="event-type-toggle-1" type="checkbox">
            <div class="event__type-list">
              <fieldset class="event__type-group">
                <legend class="visually-hidden">Event type</legend>
                <button class="event__type-item event__type-item--btn" type="button" data-type="taxi">Taxi</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="bus">Bus</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="train">Train</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="ship">Ship</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="drive">Drive</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="flight">Flight</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="check-in">Check-in</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="sightseeing">Sightseeing</button>
                <button class="event__type-item event__type-item--btn" type="button" data-type="restaurant">Restaurant</button>
              </fieldset>
            </div>
          </div>
          <div class="event__field-group event__field-group--destination">
            <label class="event__label event__type-output" for="event-destination-1">
              ${type} to
            </label>
            <input class="event__input event__input--destination"
                   id="event-destination-1"
                   type="text"
                   name="event-destination"
                   value="${destinationName}"
                   list="destination-list-1"
                   required>
            <datalist id="destination-list-1">
              ${destinationName ? `<option value="${destinationName}"></option>` : ''}
            </datalist>
          </div>
          <div class="event__field-group event__field-group--time">
            <label class="visually-hidden" for="event-start-time-1">From</label>
            <input class="event__input event__input--time"
                   id="event-start-time-1"
                   type="text"
                   name="event-start-time"
                   value="${formatDateForInput(dateFrom)}"
                   placeholder="19/03/19 00:00"
                   required>
            &mdash;
            <label class="visually-hidden" for="event-end-time-1">To</label>
            <input class="event__input event__input--time"
                   id="event-end-time-1"
                   type="text"
                   name="event-end-time"
                   value="${formatDateForInput(dateTo)}"
                   placeholder="19/03/19 00:00"
                   required>
          </div>
          <div class="event__field-group event__field-group--price">
            <label class="visually-hidden" for="event-price-1">Price</label>
            <input class="event__input event__input--price"
                   id="event-price-1"
                   type="number"
                   name="event-price"
                   value="${basePrice}"
                   min="0"
                   required>
          </div>
          <button class="event__save-btn btn btn--blue" type="submit">Save</button>
          <button class="event__reset-btn" type="reset">Delete</button>
          <button class="event__rollup-btn" type="button">
            <span class="visually-hidden">Open event</span>
            <svg class="event__rollup-icon" width="17" height="17" viewBox="0 0 17 17">
              <path d="M13.5 8.5L8.5 3.5 3.5 8.5" stroke="#000" fill="none" stroke-width="1.5" stroke-linejoin="round"/>
            </svg>
          </button>
        </header>
        ${(destinationTemplate || offersTemplate) ? `
          <section class="event__details">
            ${destinationTemplate}
            ${offersTemplate}
          </section>
        ` : ''}
      </form>
    </li>
  `;
}

export default class FormEditView extends AbstractView {
  #point = null;
  #destination = null;
  #availableOffers = null;
  #selectedOfferIds = null;
  #onFormSubmit = null;
  #onFormClose = null;

  constructor({point, destination, availableOffers, selectedOfferIds, onFormSubmit, onFormClose}) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#availableOffers = availableOffers;
    this.#selectedOfferIds = selectedOfferIds;
    this.#onFormSubmit = onFormSubmit;
    this.#onFormClose = onFormClose;
    this.element.querySelector('form').addEventListener('submit', this.#formSubmitHandler);
    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#formCloseHandler);
    this.element.querySelector('.event__reset-btn').addEventListener('click', this.#formCloseHandler);
  }

  get template() {
    return createFormEditTemplate(
      this.#point,
      this.#destination,
      this.#availableOffers,
      this.#selectedOfferIds
    );
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
