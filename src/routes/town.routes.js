import express from 'express';
import QueryBuilder from '../utils/query.builder';
import logger from '../utils/winston.logger';

const router = express.Router();

router.get('/', (req, res) => {
	const query = new QueryBuilder('towns', { queryString: req.query });

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

	const query = new QueryBuilder('towns', {
		find,
		defaultFields: ['_id', 'name', 'city', 'geolocation'],
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

router.get('/:id/districts', (req, res) => {
	const { id } = req.params;
	const townQuery = new QueryBuilder('towns', {
		find: { _id: id },
		lookupEnabled: false,
		queryString: { fields: 'districts' },
	});

	townQuery.execute().then((town) => {
		const districtQuery = new QueryBuilder('districts', {
			find: {
				_id: { $in: town.districts },
			},
			queryString: req.query,
		});

		districtQuery.execute().then(
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

router.get('/:id/neighborhoods', (req, res) => {
	const { id } = req.params;
	const townQuery = new QueryBuilder('towns', {
		find: { _id: id },
		lookupEnabled: false,
		queryString: { fields: 'districts' },
	});

	townQuery.execute().then((town) => {
		const districtQuery = new QueryBuilder('districts', {
			find: { _id: { $in: town.districts } },
			lookupEnabled: false,
			queryString: { fields: 'neighborhoods' },
		});

		districtQuery.execute().then((districts) => {
			const ids = districts.reduce((prev, current) => {
				prev = [...prev, ...current.neighborhoods];
				return prev;
			}, []);

			const neighborhoodsQuery = new QueryBuilder('neighborhoods', {
				find: {
					_id: { $in: ids },
				},
				queryString: req.query,
			});

			neighborhoodsQuery.execute().then(
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
	}, (err) => {
		logger.error(err);
		res.status(500).send({ status: false, error: err, data: [] });
	});
});

module.exports = router;
