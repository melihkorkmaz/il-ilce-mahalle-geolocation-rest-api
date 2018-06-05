import winston from 'winston';
import Transport from 'winston-transport';
import mongo from './mongo.helper';


class MongoDBTransporter extends Transport {
	constructor(opts) {
		super(opts);
		this.collection = opts.collection;
	}

	log(info, callback) {
		setImmediate(() => {
			this.emit('logged', info);
		});

		mongo.db.collection(this.collection).insert(info, () => {
			callback();
		});
	}
}

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new MongoDBTransporter({ collection: 'logs' }),
	],
	exceptionHandlers: [
		new MongoDBTransporter({ collection: 'exceptions' }),
	],
});


export default logger;

