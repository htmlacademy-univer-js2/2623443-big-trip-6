import TripInfoView from '../view/trip-info-view.js';
import { render, replace } from '../framework/render.js';
import { MAX_SHORT_ROUTE_LENGTH, MEDIUM_ROUTE_LENGTH } from '../const.js';
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
    const points = this.#pointsModel.getPoints() || [];
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
    if (points.length === 0) {
      return { route: '', startDate: null, endDate: null, totalCost: 0 };
    }

    const sortedByStart = [...points].sort((a, b) => dayjs(a.dateFrom).diff(dayjs(b.dateFrom)));
    const startDate = sortedByStart[0].dateFrom;

    const endDate = sortedByStart.reduce((maxDate, point) =>
      dayjs(point.dateTo).isAfter(dayjs(maxDate)) ? point.dateTo : maxDate
    , sortedByStart[0].dateTo);

    const destNames = sortedByStart
      .map((point) => {
        const destination = this.#pointsModel.findDestinationById(point.destinationId);
        return destination ? destination.name : '';
      })
      .filter((name) => name !== '');

    const routeStr = this.#buildRouteString(destNames);

    const totalCost = points.reduce((sum, point) => {
      const pointCost = point.basePrice || 0;
      const offersCost = (this.#pointsModel.getOffersByIds(point.offersIds) || [])
        .reduce((offerSum, offer) => offerSum + (offer.price || 0), 0);
      return sum + pointCost + offersCost;
    }, 0);

    return { route: routeStr, startDate, endDate, totalCost };
  }

  #buildRouteString(destNames) {
    if (destNames.length === 0) {
      return '';
    }
    if (destNames.length === 1) {
      return destNames[0];
    }
    if (destNames.length === MEDIUM_ROUTE_LENGTH) {
      return `${destNames[0]} — ${destNames[1]}`;
    }
    if (destNames.length === MAX_SHORT_ROUTE_LENGTH) {
      return `${destNames[0]} — ${destNames[1]} — ${destNames[2]}`;
    }
    return `${destNames[0]} — ... — ${destNames[destNames.length - 1]}`;
  }
}
