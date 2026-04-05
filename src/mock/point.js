function createOffer(id, title, price) {
  return { id, title, price };
}

function createDestination(id, name, description, pictures) {
  return { id, name, description, pictures };
}

function createPoint(id, type, destinationId, offersIds, basePrice, dateFrom, dateTo, isFavorite) {
  return {
    id,
    type,
    destinationId,
    offersIds,
    basePrice,
    dateFrom,
    dateTo,
    isFavorite,
  };
}

export function offersByType() {
  return {
    taxi: [
      createOffer('offer-1', 'Order Uber', 20),
      createOffer('offer-2', 'Wait for a driver', 10),
    ],
    bus: [
      createOffer('offer-3', 'Comfortable seats', 15),
      createOffer('offer-4', 'Get tickets', 5),
    ],
    train: [
      createOffer('offer-5', 'Choose seat', 10),
      createOffer('offer-6', 'Order meal', 30),
    ],
    ship: [
      createOffer('offer-7', 'Choose cabin', 50),
      createOffer('offer-8', 'Order meal', 30),
    ],
    drive: [
      createOffer('offer-9', 'Rent a car', 100),
      createOffer('offer-10', 'Choose a car class', 50),
    ],
    flight: [
      createOffer('offer-1', 'Order Uber', 20),
      createOffer('offer-2', 'Breakfast', 50),
      createOffer('offer-3', 'Lunch', 70),
      createOffer('offer-4', 'Guide', 30),
      createOffer('offer-5', 'Priority boarding', 15),
    ],
    'check-in': [
      createOffer('offer-11', 'Add breakfast', 20),
      createOffer('offer-12', 'Choose the room', 30),
    ],
    sightseeing: [
      createOffer('offer-13', 'Book a museum', 40),
      createOffer('offer-14', 'Hire a guide', 60),
    ],
    restaurant: [
      createOffer('offer-15', 'Order appetizer', 15),
      createOffer('offer-16', 'Choose a table', 10),
    ],
  };
}

export function offers() {
  const allOffers = offersByType();
  return Object.values(allOffers).flat();
}

export function destinations() {
  return [
    createDestination('dest-1', 'Amsterdam', 'Beautiful city with canals', [
      'img/photos/1.jpg',
      'img/photos/2.jpg'
    ]),
    createDestination('dest-2', 'Geneva', 'City of peace and lakes', [
      'img/photos/3.jpg'
    ]),
    createDestination('dest-3', 'Chamonix', 'Alpine paradise', []),
  ];
}

export function points() {
  return [
    createPoint(
      'point-1',
      'flight',
      'dest-1',
      ['offer-1', 'offer-2'],
      350,
      '2024-08-18T10:30:00',
      '2024-08-18T12:00:00',
      true
    ),
    createPoint(
      'point-2',
      'bus',
      'dest-2',
      ['offer-3'],
      120,
      '2024-08-19T09:00:00',
      '2024-08-19T11:30:00',
      false
    ),
    createPoint(
      'point-3',
      'check-in',
      'dest-3',
      [],
      80,
      '2024-08-20T14:00:00',
      '2024-08-21T10:00:00',
      false
    ),
  ];
}
