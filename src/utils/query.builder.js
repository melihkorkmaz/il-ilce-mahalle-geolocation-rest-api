import config from '../config';
import globalHelper from './global.helper';
import mongo from './mongo.helper';

const projectionReducer = (prev, current) => { prev[current] = 1; return prev; };

function buildAggregation() {
	const aggregation = [];
	if (this.find) { aggregation.push({ $match: this.find }); }

	if (this.lookupEnabled
		&& this.projection[this.lookUpCollection]
		&& this.projection[this.lookUpCollection] === 1) {
		const lookUpKey = this.lookUpCollection;
		aggregation.push({ $unwind: `$${lookUpKey}` });
		aggregation.push({
			$lookup: {
				from: lookUpKey,
				let: { relKey: `$${lookUpKey}` },
				pipeline: [
					{
						$match: {
							$expr: {
								$eq: ['$_id', '$$relKey'],
							},
						},
					},
					{ $project: { name: 1 } },
				],
				as: lookUpKey,
			},
		});
		aggregation.push({ $unwind: `$${lookUpKey}` });

		const groupObject = this.fields.reduce((prev, current) => {
			if (current === '_id') {
				prev._id = '$_id';
			} else if (current === lookUpKey) {
				prev[lookUpKey] = { $push: `$${current}` };
			} else {
				prev[current] = { $first: `$${current}` };
			}
			return prev;
		}, {});
		aggregation.push({
			$group: groupObject,
		});
	}

	if (this.skip) { aggregation.push({ $skip: this.skip }); }

	aggregation.push({ $limit: this.limit });

	if (this.projection
		&& Object.keys(this.projection).length > 0) {
		aggregation.push({ $project: this.projection });
	}

	return aggregation;
}

function processQueryString(queryString) {
	if (!queryString) return;

	if (queryString.fields) {
		const fieldsArray = queryString.fields.split(',');
		this.projection = fieldsArray.filter(key => (key && key.length > 0))
			.reduce(projectionReducer, {});
	}

	if (queryString.limit) {
		this.limit = globalHelper.toNumber(queryString.limit) > config.maxDataItem
			? config.maxDataItem :
			globalHelper.toNumber(queryString.limit);
	}

	if (queryString.skip) {
		this.skip = globalHelper.toNumber(queryString.skip);
	}
}

function initClassDefaults() {
	switch (this.collection) {
	case 'cities':
		this.fields = ['_id', 'name', 'geolocation', 'towns'];
		this.defaultFields = ['_id', 'name'];
		this.lookUpCollection = 'towns';
		break;
	case 'towns':
		this.fields = ['_id', 'name', 'city', 'geolocation', 'districts'];
		this.defaultFields = ['_id', 'name', 'city'];
		this.lookUpCollection = 'districts';
		break;
	case 'districts':
		this.fields = ['_id', 'name', 'town', 'city', 'geolocation', 'neighborhoods'];
		this.defaultFields = ['_id', 'name', 'town', 'city'];
		this.lookUpCollection = 'neighborhoods';
		break;
	case 'neighborhoods':
		this.fields = ['_id', 'name', 'district', 'town', 'city', 'zip_code'];
		this.defaultFields = ['_id', 'name', 'district', 'town', 'city', 'zip_code'];
		this.lookUpCollection = '';
		break;
	default:
		break;
	}
}

class QueryBuilder {
	constructor(collectionName, options = {}) {
		if (!collectionName) {
			throw new Error('Provide collection name');
		}

		this.collection = collectionName;
		this.lookupEnabled = options.lookupEnabled !== undefined ? options.lookupEnabled : true;

		initClassDefaults.call(this);
		this.defaultFields = options.defaultFields || this.defaultFields;

		this.find = options.find;
		this.projection = this.defaultFields.reduce(projectionReducer, {});
		this.limit = config.maxDataItem;

		processQueryString.call(this, options.queryString);
	}

	get aggregation() {
		return buildAggregation.call(this);
	}

	execute() {
		return new Promise((resolve, reject) => {
			mongo.db.collection(this.collection)
				.aggregate(this.aggregation)
				.toArray((err, data) => {
					if (err) { return reject(err); }
					return (this.find && this.find._id && typeof this.find._id === 'string') ?
						resolve(data[0]) : resolve(data);
				});
		});
	}
}

export default QueryBuilder;
