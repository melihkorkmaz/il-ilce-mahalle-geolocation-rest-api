process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongo = require('../../src/utils/mongo.helper');
const server = require('../../src/index');
const expect = chai.expect
const config = require('../../src/config');
chai.use(chaiHttp);

describe('Districts routes', () => {
    before((done) => {
        mongo.connect(done);
    });

    describe('/districts', () => {
        it('should return top 100 districts as default', done => {
            chai.request(server)
                .get(`/${config.apiVersion}/districts`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.at.least(0);
                    expect(res.body.data.length).to.be.at.most(config.maxDataItem);

                    const district = res.body.data[0];
                    expect(district._id).to.exist;
                    expect(district.name).to.exist;
                    expect(district.town).to.exist;
                    expect(district.city).to.exist;
                    expect(district.neighborhoods).to.not.exist;

                    done();
                })
        });

        it('should return limited districts data', done => {
            chai.request(server)
                .get(`/${config.apiVersion}/districts?limit=10`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.equal(10);

                    const district = res.body.data[0];
                    expect(district._id).to.exist;
                    expect(district.name).to.exist;
                    expect(district.city).to.exist;
                    expect(district.town).to.exist;
                    expect(district.neighborhoods).to.not.exist;

                    done();
                })
        })

        it('should return neighborhoods if requested', done => {
            chai.request(server)
                .get(`/${config.apiVersion}/districts?fields=neighborhoods,name`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.at.least(0);
                    expect(res.body.data.length).to.be.at.most(config.maxDataItem);

                    const district = res.body.data[0];
                    expect(district._id).to.exist;
                    expect(district.name).to.exist;
                    expect(district.town).to.not.exist;
                    expect(district.city).to.not.exist;

                    expect(district.neighborhoods).to.exist;
                    expect(district.neighborhoods.length).to.greaterThan(0);
                    expect(district.neighborhoods[0]).to.be.a('object');
                    expect(district.neighborhoods[0]._id).to.exist;
                    expect(district.neighborhoods[0].name).to.exist;

                    expect(district.neighborhoods[0].district).to.not.exist;
                    expect(district.neighborhoods[0].town).to.not.exist;
                    expect(district.neighborhoods[0].city).to.not.exist;

                    done();
                })
        })
    })

    describe('/districts/:id', done => {
        it('should return districts without neighborhoods', (done) => {
            chai.request(server)
                .get(`/${config.apiVersion}/districts/001d6df71fa45a535b31eef430977a2b`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('object');
                    expect(res.body.data._id).to.be.exist;
                    expect(res.body.data.name).to.be.exist;
                    expect(res.body.data.town).to.be.exist;
                    expect(res.body.data.city).to.be.exist;
                    expect(res.body.data.neighborhoods).to.not.exist;
                    done();
                })
        })
        it('should return districts with neighborhoods if requested', (done) => {
            chai.request(server)
                .get(`/${config.apiVersion}/districts/001d6df71fa45a535b31eef430977a2b?fields=name,neighborhoods`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('object');
                    expect(res.body.data._id).to.be.exist;
                    expect(res.body.data.name).to.be.exist;
                    expect(res.body.data.town).to.not.exist;
                    expect(res.body.data.city).to.not.exist;
                    expect(res.body.data.neighborhoods).to.exist;
                    expect(res.body.data.neighborhoods.length).to.be.greaterThan(0);
                    expect(res.body.data.neighborhoods[0]._id).to.be.exist;
                    expect(res.body.data.neighborhoods[0].name).to.be.exist;
                    expect(Object.keys(res.body.data.neighborhoods[0]).length).to.equal(2);
                    done();
                })
        })
    })

    describe('/districts/:id/neighborhoods', done => {
        it('should return neighborhoods list with default fields', (done) => {
            chai.request(server)
                .get(`/${config.apiVersion}/districts/001d6df71fa45a535b31eef430977a2b/neighborhoods`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.greaterThan(0)
                    expect(res.body.data[0]._id).to.be.exist;
                    expect(res.body.data[0].name).to.be.exist;
                    expect(res.body.data[0].district).to.be.exist;
                    expect(res.body.data[0].town).to.be.exist;
                    expect(res.body.data[0].city).to.be.exist;
                    expect(res.body.data[0].zip_code).to.be.exist;
                    done();
                })
        })
    })
    

    after(done => {
        mongo.close(done);
    })
});