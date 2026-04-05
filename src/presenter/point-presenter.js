import PointItemView from '../view/point-item-view.js';
import FormEditView from '../view/form-edit-view.js';
import { render, replace } from '../framework/render.js';

export default class PointPresenter {
  #listComponent = null;
  #pointComponent = null;
  #formEditComponent = null;
  #point = null;
  #model = null;
  #onDataChange = null;
  #onModeChange = null;

  constructor({listComponent, point, model, onDataChange, onModeChange}) {
    this.#listComponent = listComponent;
    this.#point = point;
    this.#model = model;
    this.#onDataChange = onDataChange;
    this.#onModeChange = onModeChange;
  }

  init() {
    this.#renderPoint();
  }

  #renderPoint() {
    const destination = this.#model.getDestinationById(this.#point.destinationId);
    const offersList = this.#model.getOffersByIds(this.#point.offersIds);

    const prevPointComponent = this.#pointComponent;

    this.#pointComponent = new PointItemView({
      point: this.#point,
      destination,
      offersList,
      onEditClick: this.#handlePointEdit,
      onFavoriteClick: this.#handleFavoriteClick
    });

    if (prevPointComponent === null) {
      render(this.#pointComponent, this.#listComponent);
    } else {
      replace(this.#pointComponent, prevPointComponent);
    }
  }

  #renderFormEdit() {
    const destination = this.#model.getDestinationById(this.#point.destinationId);
    const availableOffers = this.#model.getOffersByType(this.#point.type);

    const prevFormEditComponent = this.#formEditComponent;

    this.#formEditComponent = new FormEditView({
      point: this.#point,
      destination,
      availableOffers,
      selectedOfferIds: this.#point.offersIds,
      onFormSubmit: this.#handleFormSubmit,
      onFormClose: this.#handleFormClose
    });

    if (prevFormEditComponent === null) {
      replace(this.#formEditComponent, this.#pointComponent);
    } else {
      replace(this.#formEditComponent, prevFormEditComponent);
    }
  }

  resetView() {
    if (this.#formEditComponent) {
      replace(this.#pointComponent, this.#formEditComponent);
      this.#formEditComponent = null;
    }
  }

  updatePoint(updatedPoint) {
    this.#point = updatedPoint;
    this.#renderPoint();
  }

  #handlePointEdit = () => {
    this.#onModeChange();
    this.#renderFormEdit();
  };

  #handleFormClose = () => {
    this.resetView();
  };

  #handleFormSubmit = () => {
    this.resetView();
  };

  #handleFavoriteClick = () => {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };
    this.#onDataChange(updatedPoint);
  };
}
