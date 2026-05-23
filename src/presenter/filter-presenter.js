import FiltersView from '../view/filters-view.js';
import { render, remove } from '../framework/render.js';

export default class FilterPresenter {
  #filtersContainer = null;
  #filtersModel = null;
  #pointsModel = null;
  #onFilterChange = null;
  #filtersComponent = null;

  constructor({filtersContainer, filtersModel, pointsModel, onFilterChange}) {
    this.#filtersContainer = filtersContainer;
    this.#filtersModel = filtersModel;
    this.#pointsModel = pointsModel;
    this.#onFilterChange = onFilterChange;
  }

  init() {
    this.#renderFilters();
  }

  update() {
    this.#renderFilters();
  }

  #renderFilters() {
    if (this.#filtersComponent) {
      remove(this.#filtersComponent);
    }
    this.#filtersComponent = new FiltersView({
      currentFilter: this.#filtersModel.getFilter(),
      points: this.#pointsModel.getPoints(),
      onFilterTypeChange: this.#handleFilterTypeChange
    });
    render(this.#filtersComponent, this.#filtersContainer);
  }

  #handleFilterTypeChange = (filterType) => {
    this.#filtersModel.setFilter(filterType);
    this.#onFilterChange();
  };
}
