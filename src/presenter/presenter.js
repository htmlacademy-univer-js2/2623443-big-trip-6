import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import FormCreateView from '../view/form-create-view.js';
import NoPointsView from '../view/no-points-view.js';
import PointPresenter from './point-presenter.js';
//import PointsModel from '../model/points-model.js';
import { render, remove } from '../framework/render.js';

const sortPointsByDate = (pointA, pointB) => new Date(pointA.dateFrom) - new Date(pointB.dateFrom);

const sortPointsByTime = (pointA, pointB) => {
  const durationA = new Date(pointA.dateTo) - new Date(pointA.dateFrom);
  const durationB = new Date(pointB.dateTo) - new Date(pointB.dateFrom);
  return durationB - durationA;
};

const sortPointsByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

export default class Presenter {
  #listComponent = null;
  #pointsModel = null;
  #pointPresenters = new Map();
  #formCreateComponent = null;
  #filtersComponent = null;
  #sortComponent = null;
  #noPointsComponent = null;
  #currentFilter = 'everything';
  #currentSortType = 'day';

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
      this.#filtersComponent = new FiltersView({currentFilter: this.#currentFilter});
      render(this.#filtersComponent, filtersContainer);
    }
  }

  #renderSort() {
    const sortContainer = document.querySelector('.trip-events');
    if (sortContainer) {
      this.#sortComponent = new SortView({
        currentSortType: this.#currentSortType,
        onSortTypeChange: this.#handleSortTypeChange
      });
      render(this.#sortComponent, sortContainer, 'afterbegin');
    }
  }

  #handleSortTypeChange = (sortType) => {
    if (this.#currentSortType === sortType) {
      return;
    }
    this.#currentSortType = sortType;
    this.#renderPoints();
  };

  #renderPoints() {
    this.#clearList();
    let points = this.#pointsModel.getPoints();

    if (points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    switch (this.#currentSortType) {
      case 'time':
        points = [...points].sort(sortPointsByTime);
        break;
      case 'price':
        points = [...points].sort(sortPointsByPrice);
        break;
      case 'day':
      default:
        points = [...points].sort(sortPointsByDate);
        break;
    }

    points.forEach((point) => {
      const pointPresenter = new PointPresenter({
        listComponent: this.#listComponent,
        point,
        model: this.#pointsModel,
        onDataChange: this.#handleViewAction,
        onModeChange: this.#handleModeChange
      });
      this.#pointPresenters.set(point.id, pointPresenter);
      pointPresenter.init();
    });
  }

  #renderNoPoints() {
    this.#noPointsComponent = new NoPointsView();
    render(this.#noPointsComponent, this.#listComponent);
  }

  #clearList() {
    if (this.#noPointsComponent) {
      remove(this.#noPointsComponent);
      this.#noPointsComponent = null;
    }
    this.#listComponent.innerHTML = '';
    this.#pointPresenters.clear();
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
    this.#resetAllViews();
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
      onFormSubmit: () => {},
      onFormClose: () => this.#removeFormCreate()
    });

    render(this.#formCreateComponent, this.#listComponent, 'afterbegin');
  }

  #removeFormCreate() {
    if (this.#formCreateComponent) {
      remove(this.#formCreateComponent);
      this.#formCreateComponent = null;
    }
  }

  #handleViewAction = (updatedPoint) => {
    this.#pointsModel.updatePoint(updatedPoint);
    const pointPresenter = this.#pointPresenters.get(updatedPoint.id);
    if (pointPresenter) {
      pointPresenter.updatePoint(updatedPoint);
    }
  };

  #handleModeChange = () => {
    this.#resetAllViews();
  };

  #resetAllViews() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    this.#removeFormCreate();
  }
}
