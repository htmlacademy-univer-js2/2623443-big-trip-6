import FiltersView from '../view/filters-view.js';
import SortView from '../view/sort-view.js';
import FormCreateView from '../view/form-create-view.js';
import FormEditView from '../view/form-edit-view.js';
import PointItemView from '../view/point-item-view.js';

export default class Presenter {
  constructor() {
    this.filtersComponent = null;
    this.sortComponent = null;
    this.formCreateComponent = null;
    this.formEditComponent = null;
    this.pointItemsComponents = [];
  }

  init() {
    this.renderFilters();
    this.renderSort();
    this.renderFormCreate();
    this.renderFormEdit();
    this.renderPointItems();
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
    if (container) {
      this.sortComponent = new SortView();
      container.appendChild(this.sortComponent.getElement());
    }
  }

  renderFormCreate() {
    const container = document.querySelector('.trip-events__list');
    if (container) {
      this.formCreateComponent = new FormCreateView();
      container.appendChild(this.formCreateComponent.getElement());
    }
  }

  renderFormEdit() {
    const container = document.querySelector('.trip-events__list');
    if (container) {
      this.formEditComponent = new FormEditView();
      container.appendChild(this.formEditComponent.getElement());
    }
  }

  renderPointItems() {
    const container = document.querySelector('.trip-events__list');
    if (container) {
      for (let i = 0; i < 3; i++) {
        const pointItem = new PointItemView();
        this.pointItemsComponents.push(pointItem);
        container.appendChild(pointItem.getElement());
      }
    }
  }
}
