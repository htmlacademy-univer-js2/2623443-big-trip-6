export const adaptPointToServer = (point) => ({
  id: point.id,
  ['base_price']: point.basePrice,
  ['date_from']: point.dateFrom,
  ['date_to']: point.dateTo,
  ['destination']: point.destinationId,
  ['is_favorite']: point.isFavorite,
  ['offers']: point.offersIds,
  ['type']: point.type,
});

export const adaptPointToClient = (point) => ({
  id: point.id,
  basePrice: point['base_price'],
  dateFrom: point['date_from'],
  dateTo: point['date_to'],
  destinationId: point['destination'],
  isFavorite: point['is_favorite'],
  offersIds: point['offers'],
  type: point['type'],
});

export const adaptDestinationsToClient = (destinations) => destinations.map((dest) => ({
  id: dest.id,
  description: dest.description,
  name: dest.name,
  pictures: dest.pictures ? dest.pictures.map((pic) => pic.src) : [],
}));

export const adaptOffersToClient = (offers) => {
  const result = {};
  offers.forEach((typeGroup) => {
    result[typeGroup.type] = typeGroup.offers.map((offer) => ({
      id: offer.id,
      price: offer.price,
      title: offer.title,
    }));
  });
  return result;
};
