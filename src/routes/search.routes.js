import express from 'express';
import mongo from '../utils/mongo.helper';
import logger from '../utils/winston.logger';

const router = express.Router();

const findLocation = (source, lat, lon) => new Promise((resolve, reject) => {
	mongo.db.collection(source).aggregate([{
		$match: {
			'geolocation.polygons': {
				$geoIntersects: {
					$geometry: {
						type: 'Point',
						coordinates: [parseFloat(lon), parseFloat(lat)],
					},
				},
			},
		},
	}, {
		$project: {
			name: 1, city: 1,
		},
	}]).toArray((err, data) => {
		if (err) {
			reject(err);
			logger.error(err);
			return;
		}
		resolve(data);
	});
});

router.get('/coordinates', (req, res) => {
	const { lat, lon } = req.query;

	if (!lat || !lon) {
		res.send('Please send lat and lon parameters!');
		return;
	}

	findLocation('towns', lat, lon).then((townData) => {
		if (!townData || townData.length === 0) {
			findLocation('cities', lat, lon).then((cityData) => {
				res.send(cityData && cityData.length > 0 ? cityData[0] : cityData);
			}, err => res.status(500).send(err));
		} else {
			res.send(townData && townData.length > 0 ? townData[0] : townData);
		}
	}, err => res.status(500).send(err));
});

module.exports = router;
