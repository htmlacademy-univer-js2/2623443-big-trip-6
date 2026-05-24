import TripInfoView from '../view/trip-info-view.js';
import { render, replace } from '../framework/render.js';
import dayjs from 'dayjs';

export default class TripInfoPresenter {
  #container = null;
  #pointsModel = null;
  #tripInfoComponent = null;

  constructor({ container, pointsModel }) {
    this.#container = container;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#renderTripInfo();
  }

  update() {
    this.#renderTripInfo();
  }

  #renderTripInfo() {
    const points = this.#pointsModel.getPoints();
    const { route, startDate, endDate, totalCost } = this.#calculateTripInfo(points);

    const prevComponent = this.#tripInfoComponent;
    this.#tripInfoComponent = new TripInfoView({ route, startDate, endDate, totalCost });

    if (prevComponent === null) {
      render(this.#tripInfoComponent, this.#container, 'afterbegin');
    } else {
      replace(this.#tripInfoComponent, prevComponent);
    }
  }

  #calculateTripInfo(points) {
    if (!points || points.length === 0) {
      return { route: '', startDate: null, endDate: null, totalCost: 0 };
    }

    const sortedByStart = [...points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    const startDate = sortedByStart[0].dateFrom;

    const endDate = sortedByStart.reduce((maxDate, point) =>
      dayjs(point.dateTo).isAfter(dayjs(maxDate)) ? point.dateTo : maxDate
    , sortedByStart[0].dateTo);

    const destNames = sortedByStart.map((point) => {
      const dest = this.#pointsModel.getDestinationById(point.destinationId);
      return dest ? dest.name : '';
    }).filter((name) => name !== '');

    let routeStr = '';
    if (destNames.length === 1) {
      routeStr = destNames[0];
    } else if (destNames.length === 2) {
      routeStr = `${destNames[0]} — ${destNames[1]}`;
    } else if (destNames.length === 3) {
      routeStr = `${destNames[0]} — ${destNames[1]} — ${destNames[2]}`;
    } else {
      routeStr = `${destNames[0]} — ... — ${destNames[destNames.length - 1]}`;
    }

    let totalCost = 0;
    for (const point of points) {
      totalCost += point.basePrice;
      const offers = this.#pointsModel.getOffersByIds(point.offersIds);
      for (const offer of offers) {
        totalCost += offer.price;
      }
    }

    return { route: routeStr, startDate, endDate, totalCost };
  }
}
