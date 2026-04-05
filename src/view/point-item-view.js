import AbstractView from '../framework/view/abstract-view.js';

function createPointItemTemplate(point, destination, offersList) {
  const { type, basePrice, dateFrom, dateTo, isFavorite } = point;
  const date = new Date(dateFrom);
  const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
  const day = date.getDate();
  const formattedDate = `${month} ${day}`;
  const startTime = new Date(dateFrom).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const endTime = new Date(dateTo).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const durationMs = new Date(dateTo) - new Date(dateFrom);
  const durationMinutes = Math.floor(durationMs / 60000);
  let durationStr = '';
  if (durationMinutes < 60) {
    durationStr = `${durationMinutes}M`;
  } else if (durationMinutes < 1440) {
    durationStr = `${Math.floor(durationMinutes / 60)}H ${durationMinutes % 60}M`;
  } else {
    durationStr = `${Math.floor(durationMinutes / 1440)}D ${Math.floor((durationMinutes % 1440) / 60)}H ${durationMinutes % 60}M`;
  }
  const typeIcon = `img/icons/${type}.png`;
  const destinationName = destination ? destination.name : '';
  const offersHtml = offersList.map((offer) => `
    <li class='event__offer'>
      <span class='event__offer-title'>${offer.title}</span>
      &plus;&euro;&nbsp;
      <span class='event__offer-price'>${offer.price}</span>
    </li>
  `).join('');
  const favoriteClass = isFavorite ? 'event__favorite-btn--active' : '';

  return `
    <li class='trip-events__item'>
      <div class='event'>
        <time class='event__date' datetime='${dateFrom.split('T')[0]}'>${formattedDate}</time>
        <div class='event__type'>
          <img class='event__type-icon' width='42' height='42' src='${typeIcon}' alt='Event type icon'>
        </div>
        <h3 class='event__title'>${type} ${destinationName}</h3>
        <div class='event__schedule'>
          <p class='event__time'>
            <time class='event__start-time' datetime='${dateFrom}'>${startTime}</time>
            &mdash;
            <time class='event__end-time' datetime='${dateTo}'>${endTime}</time>
          </p>
          <p class='event__duration'>${durationStr}</p>
        </div>
        <p class='event__price'>
          €&nbsp;<span class='event__price-value'>${basePrice}</span>
        </p>
        <h4 class='visually-hidden'>Offers:</h4>
        <ul class='event__selected-offers'>
          ${offersHtml}
        </ul>
        <button class='event__favorite-btn ${favoriteClass}' type='button'>
          <span class='visually-hidden'>Add to favorite</span>
          <svg class='event__favorite-icon' width='28' height='28' viewBox='0 0 28 28'>
            <path d='M14 21l-8.22899 4.3262 1.57159-9.1631L.685209 9.6738 9.8855 8.3369 14 0l4.1145 8.3369 9.2003 1.3369-6.6574 6.4892 1.5716 9.1631L14 21z'/>
          </svg>
        </button>
        <button class='event__rollup-btn' type='button'>
          <span class='visually-hidden'>Open event</span>
        </button>
      </div>
    </li>
  `;
}

export default class PointItemView extends AbstractView {
  #point = null;
  #destination = null;
  #offersList = null;
  #onEditClick = null;
  #onFavoriteClick = null;

  constructor({point, destination, offersList, onEditClick, onFavoriteClick}) {
    super();
    this.#point = point;
    this.#destination = destination;
    this.#offersList = offersList;
    this.#onEditClick = onEditClick;
    this.#onFavoriteClick = onFavoriteClick;

    this.element.querySelector('.event__rollup-btn').addEventListener('click', this.#editClickHandler);
    this.element.querySelector('.event__favorite-btn').addEventListener('click', this.#favoriteClickHandler);
  }

  get template() {
    return createPointItemTemplate(this.#point, this.#destination, this.#offersList);
  }

  #editClickHandler = (evt) => {
    evt.preventDefault();
    this.#onEditClick();
  };

  #favoriteClickHandler = (evt) => {
    evt.preventDefault();
    this.#onFavoriteClick();
  };
}
