export default class FiltersModel {
  #currentFilter = 'everything';

  getFilter() {
    return this.#currentFilter;
  }

  setFilter(filter) {
    this.#currentFilter = filter;
  }
}
