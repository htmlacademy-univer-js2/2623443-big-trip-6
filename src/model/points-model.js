import { points, offers, destinations, offersByType } from '../mock/point.js';

export default class PointsModel {
  #points = points();
  #offers = offers();
  #destinations = destinations();
  #offersByType = offersByType();

  getPoints() {
    return this.#points;
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
    const typeOffers = this.#offersByType[type];
    return typeOffers || [];
  }
}
