import express from 'express';
import mongo from '../utils/mongo.helper';
import logger from '../utils/winston.logger';

const router = express.Router();

const findLocation = (source, lat, lon) => {
    return new Promise((resolve, reject) => {
        mongo.db.collection(source).aggregate([{
            $match: {
                'geolocation.polygons': {
                    $geoIntersects: {
                        $geometry: {
                            type: "Point",
                            coordinates: [parseFloat(lon), parseFloat(lat)]
                        }
                    }
                }
            }
        }, {
            $project: {
                name: 1, city: 1
            }
        }]).toArray((err, data) => {
            if (err) {
                reject(err);
                logger.error(err);
                return;
            }
            resolve(data);
        });
    })
}

router.get('/coordinates', (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        res.send('Please send lat and lon parameters!');
        return;
    }

    findLocation('towns', lat, lon).then(data => {
        if(!data || data.length === 0){
            findLocation('cities', lat, lon).then(data => {
                res.send(data && data.length > 0 ? data[0] : data);
            },  err => res.status(500).send(err))
        }else{
            res.send(data && data.length > 0 ? data[0] : data);
        }
    }, err => res.status(500).send(err));


    // const query = new QueryBuilder('cities', { queryString: req.query });

    // query.execute().then(data => res.send({
    // 	status: true,
    // 	data,
    // }), (err) => {
    // 	logger.error(err);
    // 	res.status(500).send({ status: false, error: err, data: [] });
    // });
});

module.exports = router;
