import { MongoClient } from 'mongodb';
import config from '../config';

const url = process.env.CONNECTION_STRING || config.connectionString;
let dbo = null;
let _db = null;

const mongoHelper = {
	connect(done) {
		if (dbo) return done();

		MongoClient.connect(url, (err, db) => {
			if (err) return done(err);
			_db = db;
			dbo = db.db('api_database');
			done();
		});
	},
	close(done) {
		if (_db) {
			_db.close((err) => {
				dbo = null;
				_db = null;
				done(err);
			});
		}
	},
	get db() {
		return dbo;
	},
};

module.exports = mongoHelper;
