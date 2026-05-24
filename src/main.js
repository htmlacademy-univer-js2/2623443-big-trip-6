import PointsModel from './model/points-model.js';
import FiltersModel from './model/filters-model.js';
import Presenter from './presenter/presenter.js';
import FilterPresenter from './presenter/filter-presenter.js';
import TripInfoPresenter from './presenter/trip-info-presenter.js';

const siteMainElement = document.querySelector('.page-body');
const tripEventsElement = siteMainElement.querySelector('.trip-events');
const filtersContainer = siteMainElement.querySelector('.trip-controls__filters');
const tripMainElement = siteMainElement.querySelector('.trip-main');

const pointsModel = new PointsModel();
const filtersModel = new FiltersModel();

const tripInfoPresenter = new TripInfoPresenter({
  container: tripMainElement,
  pointsModel,
});

const presenter = new Presenter({
  listComponent: tripEventsElement,
  pointsModel,
  filtersModel,
  tripInfoPresenter,
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
tripInfoPresenter.init();
