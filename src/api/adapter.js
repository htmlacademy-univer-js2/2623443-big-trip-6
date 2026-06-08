export const adaptPointToClient = (point) => ({
  id: point.id,
  basePrice: point.base_price,
  dateFrom: point.date_from,
  dateTo: point.date_to,
  destinationId: point.destination,
  isFavorite: point.is_favorite,
  offersIds: point.offers || [],
  type: point.type
});

export const adaptPointToServer = (point) => ({
  id: point.id,
  ['base_price']: Number(point.basePrice),
  ['date_from']: point.dateFrom,
  ['date_to']: point.dateTo,
  destination: point.destinationId,
  ['is_favorite']: point.isFavorite,
  offers: point.offersIds,
  type: point.type
});

export const adaptDestinationsToClient = (destinations) =>
  Array.isArray(destinations) ? destinations.map((dest) => ({
    id: dest.id,
    name: dest.name,
    description: dest.description || '',
    pictures: dest.pictures || []
  })) : [];

export const adaptOffersToClient = (offers) => {
  if (!offers || !Array.isArray(offers)) {
    return {};
  }

  return offers.reduce((acc, item) => {
    if (item.type && Array.isArray(item.offers)) {
      acc[item.type] = item.offers.map((offer) => ({
        id: offer.id,
        title: offer.title,
        price: offer.price
      }));
    }
    return acc;
  }, {});
};
