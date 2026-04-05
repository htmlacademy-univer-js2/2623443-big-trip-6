import Presenter from './presenter/presenter.js';
import PointsModel from './model/points-model.js';

const pointsModel = new PointsModel();
const listComponent = document.querySelector('.trip-events__list');

const presenter = new Presenter({
  listComponent,
  pointsModel
});

presenter.init();
