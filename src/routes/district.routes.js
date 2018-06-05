import express from 'express';
import QueryBuilder from '../utils/query.builder';
import logger from '../utils/winston.logger';

const router = express.Router();

router.get('/', (req, res) => {
	const query = new QueryBuilder('districts', { queryString: req.query });

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

	const query = new QueryBuilder('districts', {
		find,
		defaultFields: ['_id', 'name', 'town', 'city'],
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

router.get('/:id/neighborhoods', (req, res) => {
	const { id } = req.params;
	const districtQuery = new QueryBuilder('districts', {
		find: { _id: id },
		lookupEnabled: false,
		queryString: { fields: 'neighborhoods' },
	});

	districtQuery.execute().then((district) => {
		const neighborhoodsQuery = new QueryBuilder('neighborhoods', {
			find: {
				_id: { $in: district.neighborhoods },
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
});

module.exports = router;
