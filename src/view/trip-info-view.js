import AbstractView from '../framework/view/abstract-view.js';
import dayjs from 'dayjs';

function formatMonthDay(dateString) {
  if (!dateString) {
    return '';
  }
  return dayjs(dateString).format('D MMM').toUpperCase();
}

function createTripInfoTemplate({ route, startDate, endDate, totalCost }) {
  const startFormatted = formatMonthDay(startDate);
  const endFormatted = formatMonthDay(endDate);

  const datesStr = startDate && endDate
    ? `${startFormatted} — ${endFormatted}`
    : '';

  const costSection = totalCost > 0
    ? `<p class="trip-info__cost">Total: &euro;&nbsp;<span class="trip-info__cost-value">${totalCost}</span></p>`
    : '';

  return `
    <section class="trip-main__trip-info trip-info">
      <div class="trip-info__main">
        <h1 class="trip-info__title">${route || ''}</h1>
        <p class="trip-info__dates">${datesStr}</p>
      </div>
      ${costSection}
    </section>
  `;
}

export default class TripInfoView extends AbstractView {
  #route = '';
  #startDate = null;
  #endDate = null;
  #totalCost = 0;

  constructor({ route, startDate, endDate, totalCost }) {
    super();
    this.#route = route;
    this.#startDate = startDate;
    this.#endDate = endDate;
    this.#totalCost = totalCost;
  }

  get template() {
    return createTripInfoTemplate({
      route: this.#route,
      startDate: this.#startDate,
      endDate: this.#endDate,
      totalCost: this.#totalCost,
    });
  }
}
