import express from 'express';
import QueryBuilder from '../utils/query.builder';
import logger from '../utils/winston.logger';

const router = express.Router();

router.get('/', (req, res) => {
	const query = new QueryBuilder('cities', { queryString: req.query });

	query.execute().then(data => res.send({
		status: true,
		data,
	}), (err) => {
		logger.error(err);
		res.status(500).send({ status: false, error: err, data: [] });
	});
});

router.get('/:id', (req, res) => {
	const { id } = req.params;
	const find = { _id: id };

	const query = new QueryBuilder('cities', {
		find,
		defaultFields: ['_id', 'name', 'geolocation'],
		queryString: req.query,
	});

	query.execute().then(
		data => res.send({ status: true, data }),
		(err) => {
			logger.error(err);
			res.status(500).send({ status: false, error: err, data: [] });
		},
	);
});

router.get('/:id/towns', (req, res) => {
	const { id } = req.params;
	const cityQuery = new QueryBuilder('cities', {
		find: { _id: id },
		lookupEnabled: false,
		queryString: { fields: 'towns' },
	});

	cityQuery.execute().then((city) => {
		const townQuery = new QueryBuilder('towns', {
			find: {
				_id: { $in: city.towns },
			},
			queryString: req.query,
		});

		townQuery.execute().then(
			data => res.send({ status: true, data }),
			(err) => {
				logger.error(err);
				res.status(500).send({ status: false, error: err, data: [] });
			},
		);
	}, (err) => {
		logger.error(err);
		res.status(500).send({ status: false, error: err, data: [] });
	});
});

module.exports = router;
