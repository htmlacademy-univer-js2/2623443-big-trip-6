import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import FormCreateView from '../view/form-create-view.js';
import FormEditView from '../view/form-edit-view.js';
import PointItemView from '../view/point-item-view.js';
import PointsModel from '../model/points-model.js';

export default class Presenter {
  constructor() {
    this.model = new PointsModel();
    this.filtersComponent = null;
    this.sortComponent = null;
    this.formCreateComponent = null;
    this.formEditComponent = null;
    this.pointItemsComponents = [];
    this.editedPointComponent = null;

    this.handleNewEventClick = this.handleNewEventClick.bind(this);
    this.handleEscKey = this.handleEscKey.bind(this);
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderPointItems();
    this.setNewEventButtonListener();
    document.addEventListener('keydown', this.handleEscKey);
  }

  setNewEventButtonListener() {
    const newEventButton = document.querySelector('.trip-main__event-add-btn');
    if (newEventButton) {
      newEventButton.addEventListener('click', this.handleNewEventClick);
    }
  }

  handleNewEventClick() {
    this.closeForm();
    this.renderFormCreate();
  }

  handleEscKey(evt) {
    if (evt.key === 'Escape' || evt.key === 'Esc') {
      this.closeForm();
    }
  }

  closeForm() {
    if (this.formEditComponent && this.editedPointComponent) {
      const formElement = this.formEditComponent.getElement();
      const pointElement = this.editedPointComponent.getElement();
      if (formElement.parentNode) {
        formElement.replaceWith(pointElement);
      }
      this.formEditComponent.removeElement();
      this.formEditComponent = null;
      this.editedPointComponent = null;
    }

    if (this.formCreateComponent) {
      this.formCreateComponent.removeElement();
      this.formCreateComponent = null;
    }
  }

  renderFilters() {
    const container = document.querySelector('.trip-controls__filters');
    if (container) {
      this.filtersComponent = new FiltersView();
      container.appendChild(this.filtersComponent.getElement());
    }
  }

  renderSort() {
    const container = document.querySelector('.trip-events');
    const listElement = document.querySelector('.trip-events__list');
    if (container && listElement) {
      this.sortComponent = new SortView();
      container.insertBefore(this.sortComponent.getElement(), listElement);
    }
  }

  renderPointItems() {
    const container = document.querySelector('.trip-events__list');
    if (container) {
      const points = this.model.getPoints();
      this.pointItemsComponents = [];
      points.forEach((point) => {
        const destination = this.model.getDestinationById(point.destinationId);
        const offersList = this.model.getOffersByIds(point.offersIds);
        const pointView = new PointItemView(point, destination, offersList);
        pointView.getElement().querySelector('.event__rollup-btn').addEventListener('click', () => {
          this.handleEditClick(point);
        });
        this.pointItemsComponents.push(pointView);
        container.appendChild(pointView.getElement());
      });
    }
  }

  handleEditClick(point) {
    this.closeForm();
    this.renderFormEdit(point);
  }

  renderFormCreate() {
    const container = document.querySelector('.trip-events__list');
    if (!container) {
      return;
    }

    const destinations = this.model.getDestinations();
    const defaultType = 'flight';
    const availableOffers = this.model.getOffersByType(defaultType);

    this.formCreateComponent = new FormCreateView(defaultType, destinations, availableOffers);
    container.prepend(this.formCreateComponent.getElement());

    const cancelButton = this.formCreateComponent.getElement().querySelector('.event__reset-btn');
    cancelButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.closeForm();
    });
  }

  renderFormEdit(point) {
    const container = document.querySelector('.trip-events__list');
    if (!container) {
      return;
    }

    const destination = this.model.getDestinationById(point.destinationId);
    const availableOffers = this.model.getOffersByType(point.type);

    this.formEditComponent = new FormEditView(point, destination, availableOffers, point.offersIds);

    const pointComponent = this.pointItemsComponents.find((p) => p.point.id === point.id);
    if (pointComponent) {
      this.editedPointComponent = pointComponent;
      const pointElement = pointComponent.getElement();
      pointElement.replaceWith(this.formEditComponent.getElement());
    } else {
      container.appendChild(this.formEditComponent.getElement());
    }

    const rollupButton = this.formEditComponent.getElement().querySelector('.event__rollup-btn');
    rollupButton.addEventListener('click', () => {
      this.closeForm();
    });

    const cancelButton = this.formEditComponent.getElement().querySelector('.event__reset-btn');
    cancelButton.addEventListener('click', (evt) => {
      evt.preventDefault();
      this.closeForm();
    });
  }
}
