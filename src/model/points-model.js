import { FilterType } from '../const.js';
import dayjs from 'dayjs';
import { fetchPoints, fetchDestinations, fetchOffers, updatePoint } from '../api/api-service.js';
import { adaptPointToClient, adaptPointToServer, adaptDestinationsToClient, adaptOffersToClient } from '../api/adapter.js';

export default class PointsModel {
  #points = [];
  #destinations = [];
  #offersByType = {};

  async init() {
    try {
      const [pointsData, destinationsData, offersData] = await Promise.all([
        fetchPoints(),
        fetchDestinations(),
        fetchOffers(),
      ]);
      this.#points = Array.isArray(pointsData) ? pointsData.map(adaptPointToClient) : [];
      this.#destinations = adaptDestinationsToClient(destinationsData) || [];
      this.#offersByType = adaptOffersToClient(offersData) || {};
    } catch (error) {
      this.#points = [];
      this.#destinations = [];
      this.#offersByType = {};
      throw error;
    }
  }

  getPoints() {
    return this.#points || [];
  }

  setPoints(pointsData) {
    this.#points = Array.isArray(pointsData) ? pointsData : [];
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
    return this.#offersByType || {};
  }

  getDestinations() {
    return this.#destinations || [];
  }

  getOfferById(offerId) {
    for (const type in this.#offersByType) {
      const offers = this.#offersByType[type] || [];
      const offer = offers.find((o) => o.id === offerId);
      if (offer) {
        return offer;
      }
    }
    return null;
  }

  getDestinationById(destinationId) {
    return (this.#destinations || []).find((dest) => dest.id === destinationId) || null;
  }

  getOffersByIds(offerIds) {
    const safeIds = Array.isArray(offerIds) ? offerIds : [];
    const result = [];
    for (const type in this.#offersByType) {
      const offers = this.#offersByType[type] || [];
      for (const offer of offers) {
        if (safeIds.includes(offer.id)) {
          result.push(offer);
        }
      }
    }
    return result;
  }

  getOffersByType(type) {
    return (this.#offersByType[type] || []);
  }

  getAllOffers() {
    return this.#offersByType || {};
  }

  getPointsByFilter(filter) {
    const now = dayjs();
    const allPoints = this.#points || [];

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

  async updatePointOnServer(point) {
    const serverPoint = adaptPointToServer(point);
    const updated = await updatePoint(serverPoint);
    return adaptPointToClient(updated);
  }
}
