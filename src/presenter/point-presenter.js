import PointItemView from '../view/point-item-view.js';
import FormEditView from '../view/form-edit-view.js';
import { render, replace, remove } from '../framework/render.js';
import { UpdateType } from '../const.js';
import { updatePoint as apiUpdatePoint, deletePoint as apiDeletePoint } from '../api/api-service.js';
import { adaptPointToServer, adaptPointToClient } from '../api/adapter.js';
import { shake } from '../utils/shake.js';

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

  destroy() {
    if (this.#pointComponent) {
      remove(this.#pointComponent);
    }
    if (this.#formEditComponent) {
      remove(this.#formEditComponent);
    }
  }

  #renderPoint() {
    const destination = this.#model.getDestinationById(this.#point.destinationId);
    const offersList = this.#model.getOffersByIds(this.#point.offersIds);

    const prevPointComponent = this.#pointComponent;

    this.#pointComponent = new PointItemView({
      point: this.#point,
      destination,
      offersList,
      onEditClick: () => this.#handlePointEdit(),
      onFavoriteClick: () => this.#handleFavoriteClick()
    });

    if (prevPointComponent === null) {
      render(this.#pointComponent, this.#listComponent);
    } else {
      replace(this.#pointComponent, prevPointComponent);
    }
  }

  #renderFormEdit() {
    const offersByType = this.#model.getAllOffers();

    this.#formEditComponent = new FormEditView({
      point: this.#point,
      destinations: this.#model.getDestinations(),
      offersByType,
      onFormSubmit: (state) => this.#handleFormSubmit(state),
      onFormClose: () => this.#handleFormClose(),
      onTypeChange: () => {},
      onDestinationChange: () => {},
      onDeleteClick: () => this.#handleDeleteClick()
    });

    replace(this.#formEditComponent, this.#pointComponent);
  }

  resetView() {
    if (this.#formEditComponent) {
      replace(this.#pointComponent, this.#formEditComponent);
      this.#formEditComponent = null;
    }
  }

  updatePoint(updatedPoint) {
    this.#point = updatedPoint;
    if (!this.#formEditComponent) {
      this.#renderPoint();
    }
  }

  #handlePointEdit() {
    this.#onModeChange(this);
    this.#renderFormEdit();
  }

  #handleFormClose() {
    this.resetView();
  }

  async #handleFormSubmit(updatedState) {
    const { offers, ...pointData } = updatedState;
    const pointToSave = {
      ...this.#point,
      ...pointData,
      offersIds: offers,
      basePrice: Number(pointData.basePrice)
    };

    const formComponent = this.#formEditComponent;
    if (!formComponent) {
      return;
    }

    formComponent.setSaving();

    try {
      const serverPoint = adaptPointToServer(pointToSave);
      const response = await apiUpdatePoint(serverPoint);

      let adaptedPoint;
      if (response) {
        adaptedPoint = adaptPointToClient(response);
      } else {
        adaptedPoint = pointToSave;
      }

      this.#point = adaptedPoint;
      this.resetView();
      this.#onDataChange(UpdateType.PATCH, adaptedPoint);
    } catch (error) {
      if (this.#formEditComponent === formComponent) {
        formComponent.setSaveError();
      }
    }
  }

  async #handleDeleteClick() {
    const formComponent = this.#formEditComponent;
    if (!formComponent) {
      return;
    }

    formComponent.setDeleting();

    try {
      await apiDeletePoint(this.#point.id);
      this.#onDataChange(UpdateType.DELETE, this.#point);
    } catch (error) {
      if (this.#formEditComponent === formComponent) {
        formComponent.setDeleteError();
      }
    }
  }

  async #handleFavoriteClick() {
    const updatedPoint = {
      ...this.#point,
      isFavorite: !this.#point.isFavorite
    };

    try {
      const serverPoint = adaptPointToServer(updatedPoint);
      const response = await apiUpdatePoint(serverPoint);

      let adaptedPoint;
      if (response) {
        adaptedPoint = adaptPointToClient(response);
      } else {
        adaptedPoint = updatedPoint;
      }

      this.#point = adaptedPoint;
      this.#onDataChange(UpdateType.PATCH, adaptedPoint);
    } catch (error) {
      if (this.#pointComponent) {
        shake(this.#pointComponent.element);
      }
    }
  }
}
