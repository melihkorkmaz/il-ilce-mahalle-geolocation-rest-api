process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;

import mongo from '../../src/utils/mongo.helper';
import config from '../../src/config';
import QueryBuilder from '../../src/utils/query.builder';


describe('Query builder', () => {
    before((done) => {
        mongo.connect(done);
    });

    it('should create empty object', () => {
        const query = new QueryBuilder('cities');
        expect(query).to.be.a('object');
    })

    it('should create default values by collection name', () => {
        const query = new QueryBuilder('cities');

        expect(query.collection).to.equal('cities');
        expect(query.fields).to.deep.equal(['_id', 'name', 'geolocation', 'towns']);
        expect(query.defaultFields).to.deep.equal(['_id', 'name']);
    })

    it('should create find query', () => {
        const query = new QueryBuilder('cities', {
            find: { _id: "fake-id" }
        });

        expect(query.aggregation).to.deep.equal([
            { $match: { _id: "fake-id" } },
            { $limit: config.maxDataItem },
            { $project: { _id: 1, name: 1 } }
        ])
    })

    it('should create projection from query string', () => {
        const query = new QueryBuilder('cities', { queryString: { fields: 'geolocation,name' } })
        expect(query.aggregation).to.deep.equal([
            { $limit: config.maxDataItem },
            { $project: { 'geolocation': 1, 'name': 1 } }
        ])
    })

    it('should add default max size as limit', () => {
        const query = new QueryBuilder('cities');
        expect(query.aggregation).to.deep.equal([
            { $limit: config.maxDataItem },
            { $project: { _id: 1, name: 1 } }
        ]);
    })

    it('user can define limit of size', () => {
        const query = new QueryBuilder('cities', { queryString: { limit: 10 } });
        expect(query.aggregation).to.deep.equal([
            { $limit: 10 },
            { $project: { _id: 1, name: 1 } }
        ]);
    })

    it('user can not define limit of size as string char, it should set limit to 0', () => {
        const query = new QueryBuilder('cities', { queryString: { limit: "a" } });
        expect(query.aggregation).to.deep.equal([
            { $limit: 0 },
            { $project: { _id: 1, name: 1 } }
        ]);
    })

    it('user take should be less than max limit', () => {
        const query = new QueryBuilder('cities', { queryString: { limit: 20000 } });
        expect(query.aggregation).to.deep.equal([
            { $limit: config.maxDataItem },
            { $project: { _id: 1, name: 1 } }
        ]);
    })

    it('should skip data if user defined skip at querystirng', () => {
        const query = new QueryBuilder('cities', { queryString: { skip: 1 } });
        expect(query.aggregation).to.deep.equal([
            { $skip: 1 },
            { $limit: config.maxDataItem },
            { $project: { _id: 1, name: 1 } }
        ]);
    })

    it('should create lookup query for sub collection if required', () => {
        const query = new QueryBuilder('cities', {
            queryString: { fields: 'name,towns' }
        });

        expect(query.aggregation).to.deep.equal([
            { "$unwind": "$towns" },
            {
                "$lookup": {
                    "from": "towns",
                    'let': { relKey: '$towns' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $eq: ['$_id', '$$relKey']
                                }
                            }
                        },
                        { $project: { name: 1 } }
                    ],
                    "as": "towns"
                }
            },
            { "$unwind": "$towns" },
            {
                "$group": {
                    "_id": "$_id",
                    "name": { $first: "$name" },
                    "geolocation": { $first: "$geolocation" },
                    "towns": { $push: "$towns" }
                }
            },
            { $limit: config.maxDataItem },
            { $project: { name: 1, towns: 1 } }
        ])
    })

    it('should defaultFields can be overritable', () => {
        const query = new QueryBuilder('cities', { defaultFields : ['_id' ,'name', 'geolocation'] });
        expect(query.aggregation).to.deep.equal([
            { $limit: config.maxDataItem },
            { $project: { _id: 1, name: 1, geolocation : 1 } }
        ]);
    })

    it('lookup can be disabled', () => {
        const query = new QueryBuilder('cities', {
            queryString: { fields: 'name,towns' },
            lookupEnabled : false
        });

        expect(query.aggregation).to.deep.equal([
            { $limit: config.maxDataItem },
            { $project: { name: 1, towns : 1 } }
        ])
    })

    it('should execute query', (done) => {
        const query = new QueryBuilder('cities');

        query.execute().then(res => {
            expect(res).to.not.undefined;
            expect(res.length).to.be.greaterThan(0);
            expect(res[0]._id).to.exist;
            expect(res[0].name).to.exist;
            expect(res[0].geolocation).to.not.exist;
            expect(res[0].towns).to.not.exist;
            done();
        })
    })

    it('should one data if id is exists in find query', done => {
        const query = new QueryBuilder('cities', { find : { _id : 'fbf55ec2f75ae0ee54a2c55b49eef828'} });

        query.execute().then(res => {
            expect(res).to.not.undefined;
            expect(res).to.be.a('object');
            done();
        })
    })

    after((done) => {
        mongo.close(done);
    });
})