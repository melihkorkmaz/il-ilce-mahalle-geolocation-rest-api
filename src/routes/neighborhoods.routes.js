import express from 'express';
import QueryBuilder from '../utils/query.builder';
import logger from '../utils/winston.logger';

const router = express.Router();

router.get('/', (req, res) => {
	const query = new QueryBuilder('neighborhoods', { queryString: req.query });

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

	const query = new QueryBuilder('neighborhoods', {
		find,
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


module.exports = router;
