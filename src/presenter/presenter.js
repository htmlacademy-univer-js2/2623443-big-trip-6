import SortView from '../view/sort-view.js';
import FormCreateView from '../view/form-create-view.js';
import NoPointsView from '../view/no-points-view.js';
import LoadingView from '../view/loading-view.js';
import ErrorView from '../view/error-view.js';
import PointPresenter from './point-presenter.js';
import { render, remove } from '../framework/render.js';
import { UpdateType, FilterType } from '../const.js';
import { createPoint as apiCreatePoint } from '../api/api-service.js';
import { adaptPointToServer, adaptPointToClient } from '../api/adapter.js';
import dayjs from 'dayjs';

const sortPointsByDate = (pointA, pointB) => dayjs(pointA.dateFrom).diff(dayjs(pointB.dateFrom));

const sortPointsByTime = (pointA, pointB) => {
  const durationA = dayjs(pointA.dateTo).diff(dayjs(pointA.dateFrom));
  const durationB = dayjs(pointB.dateTo).diff(dayjs(pointB.dateFrom));
  return durationB - durationA;
};

const sortPointsByPrice = (pointA, pointB) => pointB.basePrice - pointA.basePrice;

export default class Presenter {
  #listComponent = null;
  #pointsModel = null;
  #filtersModel = null;
  #filterPresenter = null;
  #tripInfoPresenter = null;
  #sortContainer = null;
  #pointPresenters = new Map();
  #formCreateComponent = null;
  #sortComponent = null;
  #noPointsComponent = null;
  #loadingComponent = null;
  #errorComponent = null;
  #currentSortType = 'day';
  #isDataLoaded = false;
  #newEventButton = null;

  constructor({listComponent, pointsModel, filtersModel, tripInfoPresenter}) {
    this.#listComponent = listComponent;
    this.#pointsModel = pointsModel;
    this.#filtersModel = filtersModel;
    this.#tripInfoPresenter = tripInfoPresenter;
    this.#sortContainer = document.querySelector('.trip-events');
    this.#newEventButton = document.querySelector('.trip-main__event-add-btn');
  }

  setFilterPresenter(filterPresenter) {
    this.#filterPresenter = filterPresenter;
  }

  async init() {
    this.#renderLoading();
    try {
      await this.#pointsModel.init();
      this.#isDataLoaded = true;
      this.#removeLoading();
      this.#filterPresenter?.update();
      this.#tripInfoPresenter?.update();
      this.#renderSort();
      this.#renderPoints();
      this.#setNewEventButtonListener();
      document.addEventListener('keydown', this.#escKeyDownHandler);
    } catch (error) {
      this.#removeLoading();
      this.#renderError();
    }
  }

  #renderLoading() {
    this.#loadingComponent = new LoadingView();
    render(this.#loadingComponent, this.#listComponent);
  }

  #removeLoading() {
    if (this.#loadingComponent) {
      remove(this.#loadingComponent);
      this.#loadingComponent = null;
    }
  }

  #renderError() {
    this.#errorComponent = new ErrorView();
    render(this.#errorComponent, this.#listComponent);
  }

  #renderSort() {
    if (this.#sortComponent) {
      remove(this.#sortComponent);
      this.#sortComponent = null;
    }
    if (this.#sortContainer && this.#isDataLoaded) {
      this.#sortComponent = new SortView({
        currentSortType: this.#currentSortType,
        onSortTypeChange: this.#handleSortTypeChange
      });
      render(this.#sortComponent, this.#sortContainer, 'afterbegin');
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
    let points = this.#pointsModel.getPointsByFilter(this.#filtersModel.getFilter());

    if (points.length === 0) {
      this.#renderNoPoints();
      return;
    }

    switch (this.#currentSortType) {
      case 'time': {
        points = [...points].sort(sortPointsByTime);
        break;
      }
      case 'price': {
        points = [...points].sort(sortPointsByPrice);
        break;
      }
      case 'day':
      default: {
        points = [...points].sort(sortPointsByDate);
        break;
      }
    }

    const listContainer = this.#listComponent.querySelector('.trip-events__list');

    points.forEach((point) => {
      const pointPresenter = new PointPresenter({
        listComponent: listContainer,
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
    const listContainer = this.#listComponent.querySelector('.trip-events__list');
    this.#noPointsComponent = new NoPointsView({filterType: this.#filtersModel.getFilter()});
    render(this.#noPointsComponent, listContainer);
  }

  #clearList() {
    if (this.#noPointsComponent) {
      remove(this.#noPointsComponent);
      this.#noPointsComponent = null;
    }
    if (this.#errorComponent) {
      remove(this.#errorComponent);
      this.#errorComponent = null;
    }
    this.#pointPresenters.forEach((presenter) => presenter.destroy());
    this.#pointPresenters.clear();
    const listContainer = this.#listComponent.querySelector('.trip-events__list');
    if (listContainer) {
      listContainer.innerHTML = '';
    }
  }

  #setNewEventButtonListener() {
    if (this.#newEventButton) {
      this.#newEventButton.addEventListener('click', () => this.#handleNewEventClick());
    }
  }

  #handleNewEventClick() {
    if (this.#formCreateComponent) {
      return;
    }
    this.#resetAllViews();
    if (this.#noPointsComponent) {
      remove(this.#noPointsComponent);
      this.#noPointsComponent = null;
    }
    this.#filtersModel.setFilter(FilterType.EVERYTHING);
    this.#filterPresenter?.update();
    this.#currentSortType = 'day';
    if (this.#sortComponent) {
      remove(this.#sortComponent);
    }
    this.#renderSort();
    this.#renderFormCreate();
    if (this.#newEventButton) {
      this.#newEventButton.disabled = true;
    }
  }

  #renderFormCreate() {
    const destinations = this.#pointsModel.getDestinations();
    const offersByType = this.#pointsModel.getAllOffers();
    const defaultType = 'flight';

    this.#formCreateComponent = new FormCreateView({
      defaultType,
      destinations,
      offersByType,
      onFormSubmit: (state) => this.#handleFormCreateSubmit(state),
      onFormClose: () => this.#removeFormCreate(),
      onTypeChange: () => {},
      onDestinationChange: () => {}
    });

    const listContainer = this.#listComponent.querySelector('.trip-events__list');
    render(this.#formCreateComponent, listContainer, 'afterbegin');
  }

  async #handleFormCreateSubmit(state) {
    const formComponent = this.#formCreateComponent;
    formComponent?.setSaving?.();

    const newPoint = {
      basePrice: Number(state.basePrice),
      dateFrom: state.dateFrom,
      dateTo: state.dateTo,
      destinationId: state.destinationId,
      isFavorite: false,
      offersIds: state.offers,
      type: state.type
    };

    try {
      const serverPayload = adaptPointToServer(newPoint);
      const response = await apiCreatePoint(serverPayload);

      if (!response || !response.id) {
        throw new Error('Invalid server response');
      }

      const adaptedPoint = adaptPointToClient(response);
      this.#pointsModel.addPoint(adaptedPoint);
      this.#filterPresenter?.update();
      this.#tripInfoPresenter?.update();
      this.#removeFormCreate();
      this.#renderPoints();
    } catch (error) {
      if (formComponent && this.#formCreateComponent === formComponent) {
        formComponent.setSaveError?.();
      }
    }
  }

  #removeFormCreate() {
    if (this.#formCreateComponent) {
      remove(this.#formCreateComponent);
      this.#formCreateComponent = null;
      if (this.#newEventButton) {
        this.#newEventButton.disabled = false;
      }
      if (this.#pointsModel.getPoints().length === 0) {
        this.#renderNoPoints();
      }
    }
  }

  #handleViewAction = async (updateType, update) => {
    switch (updateType) {
      case UpdateType.PATCH: {
        this.#pointsModel.updatePoint(update);
        const pointPresenter = this.#pointPresenters.get(update.id);
        if (pointPresenter) {
          pointPresenter.updatePoint(update);
        }
        this.#tripInfoPresenter?.update();
        this.#renderPoints();
        break;
      }
      case UpdateType.DELETE: {
        this.#pointsModel.deletePoint(update.id);
        this.#filterPresenter?.update();
        this.#tripInfoPresenter?.update();
        this.#renderPoints();
        break;
      }
      case UpdateType.ADD: {
        this.#pointsModel.addPoint(update);
        this.#filterPresenter?.update();
        this.#tripInfoPresenter?.update();
        this.#renderPoints();
        break;
      }
    }
  };

  onFilterChange() {
    this.#currentSortType = 'day';
    this.#renderSort();
    this.#renderPoints();
  }

  #handleModeChange = () => {
    this.#resetAllViews();
  };

  #resetAllViews() {
    this.#pointPresenters.forEach((presenter) => presenter.resetView());
    if (this.#formCreateComponent) {
      remove(this.#formCreateComponent);
      this.#formCreateComponent = null;
      if (this.#newEventButton) {
        this.#newEventButton.disabled = false;
      }
    }
  }

  #escKeyDownHandler = (evt) => {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      evt.preventDefault();
      if (this.#formCreateComponent) {
        this.#removeFormCreate();
      } else {
        this.#pointPresenters.forEach((presenter) => presenter.resetView());
      }
    }
  };
}
