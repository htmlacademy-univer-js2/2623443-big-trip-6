import { points, offers, destinations, offersByType } from '../mock/point.js';
import { FilterType } from '../const.js';
import dayjs from 'dayjs';

export default class PointsModel {
  #points = points();
  #offers = offers();
  #destinations = destinations();
  #offersByType = offersByType();

  getPoints() {
    return this.#points;
  }

  setPoints(pointsData) {
    this.#points = pointsData;
  }

  updatePoint(update) {
    const index = this.#points.findIndex((point) => point.id === update.id);
    if (index === -1) {
      throw new Error('Can\'t update unexisting point');
    }
    this.#points[index] = update;
  }

  addPoint(point) {
    this.#points.unshift(point);
  }

  deletePoint(id) {
    const index = this.#points.findIndex((point) => point.id === id);
    if (index === -1) {
      throw new Error('Can\'t delete unexisting point');
    }
    this.#points.splice(index, 1);
  }

  getOffers() {
    return this.#offers;
  }

  getDestinations() {
    return this.#destinations;
  }

  getOfferById(offerId) {
    return this.#offers.find((offer) => offer.id === offerId);
  }

  getDestinationById(destinationId) {
    return this.#destinations.find((dest) => dest.id === destinationId);
  }

  getOffersByIds(offerIds) {
    return offerIds.map((id) => this.getOfferById(id)).filter(Boolean);
  }

  getOffersByType(type) {
    return this.#offersByType[type] || [];
  }

  getAllOffers() {
    return this.#offersByType;
  }

  getPointsByFilter(filter) {
    const now = dayjs();
    const allPoints = this.#points;

    switch (filter) {
      case FilterType.FUTURE:
        return allPoints.filter((point) => dayjs(point.dateFrom).isAfter(now));
      case FilterType.PRESENT:
        return allPoints.filter((point) =>
          !dayjs(point.dateFrom).isAfter(now) && !dayjs(point.dateTo).isBefore(now)
        );
      case FilterType.PAST:
        return allPoints.filter((point) => dayjs(point.dateTo).isBefore(now));
      default:
        return allPoints;
    }
  }
}
