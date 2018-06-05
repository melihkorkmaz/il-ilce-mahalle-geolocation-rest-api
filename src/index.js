import express from 'express';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import routes from './routes';
import mongo from './utils/mongo.helper';
import loggerMiddleware from './utils/logger.middleware';

const app = express();
const { NODE_ENV } = process.env

if (NODE_ENV !== 'test') {
	mongo.connect(() => console.log('connected'));
	app.use(morgan('tiny'));
}


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if(NODE_ENV === "production")
	app.use(loggerMiddleware);

app.get('/', (req, res) => res.send('İl ilçe mahalle rest-api'));

routes(app);


if (NODE_ENV === 'test') {
	module.exports = app;
} else {
	app.listen(process.env.PORT || 8080, () => console.log('Server has been started'));
}
