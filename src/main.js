import PointsModel from './model/points-model.js';
import FiltersModel from './model/filters-model.js';
import Presenter from './presenter/presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';

const siteMainElement = document.querySelector('.page-body');
const tripEventsElement = siteMainElement.querySelector('.trip-events');
const filtersContainer = siteMainElement.querySelector('.trip-controls__filters');

const pointsModel = new PointsModel();
const filtersModel = new FiltersModel();

const presenter = new Presenter({
  listComponent: tripEventsElement,
  pointsModel,
  filtersModel,
});

const filterPresenter = new FilterPresenter({
  filtersContainer,
  filtersModel,
  pointsModel,
  onFilterChange: () => presenter.onFilterChange()
});

presenter.setFilterPresenter(filterPresenter);

filterPresenter.init();
presenter.init();
