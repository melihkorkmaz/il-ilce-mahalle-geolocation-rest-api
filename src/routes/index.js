import cityRoutes from './city.routes';
import townRoutes from './town.routes';
import districtRoutes from './district.routes';
import neightborhoodsRoutes from './neighborhoods.routes';


module.exports = (app) => {
	app.use('/cities', cityRoutes);
	app.use('/towns', townRoutes);
	app.use('/districts', districtRoutes);
	app.use('/neighborhoods', neightborhoodsRoutes);
};
