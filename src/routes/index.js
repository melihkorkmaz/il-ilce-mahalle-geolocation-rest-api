import config from '../config';
import cityRoutes from './city.routes';
import townRoutes from './town.routes';
import districtRoutes from './district.routes';
import neightborhoodsRoutes from './neighborhoods.routes';


module.exports = (app) => {
	app.use(`/${config.apiVersion}/cities`, cityRoutes);
	app.use(`/${config.apiVersion}/towns`, townRoutes);
	app.use(`/${config.apiVersion}/districts`, districtRoutes);
	app.use(`/${config.apiVersion}/neighborhoods`, neightborhoodsRoutes);
};
