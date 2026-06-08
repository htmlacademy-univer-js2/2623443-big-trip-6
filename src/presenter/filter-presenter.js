import FiltersView from '../view/filters-view.js';
import { render, replace } from '../framework/render.js';
import { FilterType } from '../const.js';
import dayjs from 'dayjs';

export default class FilterPresenter {
  #filtersContainer = null;
  #filtersModel = null;
  #pointsModel = null;
  #filtersComponent = null;
  #onFilterChange = null;

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
    const points = this.#pointsModel.getPoints() || [];
    const filterType = this.#filtersModel.getFilter();

    const filtersConfig = [
      { type: FilterType.EVERYTHING, count: points.length },
      { type: FilterType.FUTURE, count: points.filter((point) => dayjs(point.dateFrom).isAfter(dayjs())).length },
      { type: FilterType.PRESENT, count: points.filter((point) => !dayjs(point.dateFrom).isAfter(dayjs()) && !dayjs(point.dateTo).isBefore(dayjs())).length },
      { type: FilterType.PAST, count: points.filter((point) => dayjs(point.dateTo).isBefore(dayjs())).length },
    ];

    const prevComponent = this.#filtersComponent;
    this.#filtersComponent = new FiltersView({
      filters: filtersConfig,
      currentFilterType: filterType,
      onFilterTypeChange: this.#handleFilterTypeChange
    });

    if (prevComponent === null) {
      render(this.#filtersComponent, this.#filtersContainer);
      return;
    }

    replace(this.#filtersComponent, prevComponent);

    if (points.length === 0) {
      this.#filtersComponent.element.querySelectorAll('.trip-filters__filter-input').forEach((input) => {
        input.disabled = true;
      });
    }
  }

  #handleFilterTypeChange = (filterType) => {
    this.#filtersModel.setFilter(filterType);
    this.#onFilterChange();
  };
}
