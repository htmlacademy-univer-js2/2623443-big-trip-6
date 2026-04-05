import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import FormCreateView from '../view/form-create-view.js';
import FormEditView from '../view/form-edit-view.js';
import PointItemView from '../view/point-item-view.js';
//import PointsModel from '../model/points-model.js';
import { render, replace, remove } from '../framework/render.js';

export default class Presenter {
  #listComponent = null;
  #pointsModel = null;
  #pointComponents = new Map();
  #formCreateComponent = null;
  #formEditComponent = null;
  #editedPointId = null;
  #filtersComponent = null;
  #sortComponent = null;

  constructor({listComponent, pointsModel}) {
    this.#listComponent = listComponent;
    this.#pointsModel = pointsModel;
  }

  init() {
    this.#renderFilters();
    this.#renderSort();
    this.#renderPoints();
    this.#setNewEventButtonListener();
  }

  #renderFilters() {
    const filtersContainer = document.querySelector('.trip-controls__filters');
    if (filtersContainer) {
      this.#filtersComponent = new FiltersView();
      render(this.#filtersComponent, filtersContainer);
    }
  }

  #renderSort() {
    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      this.#sortComponent = new SortView();
      render(this.#sortComponent, sortContainer, 'afterbegin');
    }
  }

  #setNewEventButtonListener() {
    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (newEventButton) {
      newEventButton.addEventListener('click', () => this.#handleNewEventClick());
    }
  }

  #handleNewEventClick() {
    if (this.#formCreateComponent) {
      return;
    }

    if (this.#formEditComponent) {
      const point = this.#pointsModel.getPoints().find((p) => p.id === this.#editedPointId);
      if (point) {
        this.#removeFormEdit(point);
      }
    }

    this.#renderFormCreate();
  }

  #renderFormCreate() {
    const destinations = this.#pointsModel.getDestinations();
    const defaultType = 'flight';
    const availableOffers = this.#pointsModel.getOffersByType(defaultType);

    this.#formCreateComponent = new FormCreateView({
      defaultType,
      destinations,
      availableOffers,
      onFormSubmit: () => this.#handleFormCreateSubmit(),
      onFormClose: () => this.#removeFormCreate()
    });

    render(this.#formCreateComponent, this.#listComponent, 'afterbegin');
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #removeFormCreate() {
    if (this.#formCreateComponent) {
      remove(this.#formCreateComponent);
      this.#formCreateComponent = null;
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  }

  #handleFormCreateSubmit() {
  }

  #renderPoints() {
    const points = this.#pointsModel.getPoints();
    points.forEach((point) => this.#renderPoint(point));
  }

  #renderPoint(point) {
    const destination = this.#pointsModel.getDestinationById(point.destinationId);
    const offersList = this.#pointsModel.getOffersByIds(point.offersIds);

    const pointComponent = new PointItemView({
      point,
      destination,
      offersList,
      onEditClick: () => this.#handlePointEdit(point)
    });

    this.#pointComponents.set(point.id, pointComponent);
    render(pointComponent, this.#listComponent);
  }

  #handlePointEdit(point) {
    if (this.#formCreateComponent) {
      this.#removeFormCreate();
    }

    this.#editedPointId = point.id;
    const pointComponent = this.#pointComponents.get(point.id);

    const destination = this.#pointsModel.getDestinationById(point.destinationId);
    const availableOffers = this.#pointsModel.getOffersByType(point.type);

    this.#formEditComponent = new FormEditView({
      point,
      destination,
      availableOffers,
      selectedOfferIds: point.offersIds,
      onFormSubmit: () => this.#handleFormEditSubmit(),
      onFormClose: () => this.#handleFormEditClose(point)
    });

    replace(this.#formEditComponent, pointComponent);
    document.addEventListener('keydown', this.#escKeyDownHandler);
  }

  #handleFormEditSubmit() {
  }

  #handleFormEditClose(point) {
    this.#removeFormEdit(point);
  }

  #removeFormEdit(point) {
    if (this.#formEditComponent) {
      const pointComponent = this.#pointComponents.get(point.id);
      replace(pointComponent, this.#formEditComponent);
      this.#formEditComponent = null;
      this.#editedPointId = null;
      document.removeEventListener('keydown', this.#escKeyDownHandler);
    }
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();

      if (this.#formCreateComponent) {
        this.#removeFormCreate();
        return;
      }

      if (this.#formEditComponent) {
        const point = this.#pointsModel.getPoints().find((p) => p.id === this.#editedPointId);
        if (point) {
          this.#handleFormEditClose(point);
        }
      }
    }
  };
}
