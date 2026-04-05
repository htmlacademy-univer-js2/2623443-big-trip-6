import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import FormCreateView from '../view/form-create-view.js';
import NoPointsView from '../view/no-points-view.js';
import PointPresenter from './point-presenter.js';
//import PointsModel from '../model/points-model.js';
import { render, remove } from '../framework/render.js';

export default class Presenter {
  #listComponent = null;
  #pointsModel = null;
  #pointPresenters = new Map();
  #formCreateComponent = null;
  #filtersComponent = null;
  #sortComponent = null;
  #noPointsComponent = null;
  #currentFilter = 'everything';
  #currentSort = 'day';

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
      this.#sortComponent = new SortView({currentSort: this.#currentSort});
      render(this.#sortComponent, sortContainer, 'afterbegin');
    }
  }

  #renderPoints() {
    this.#clearList();
    const points = this.#pointsModel.getPoints();

    if (points.length === 0) {
      this.#renderNoPoints();
      return;
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
