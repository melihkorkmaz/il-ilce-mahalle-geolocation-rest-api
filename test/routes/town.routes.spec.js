process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongo = require('../../src/utils/mongo.helper');
const server = require('../../src/index');
const expect = chai.expect
const config = require('../../src/config');
chai.use(chaiHttp);

describe('Towns routes', () => {
    before((done) => {
        mongo.connect(done);
    });

    describe('/towns', () => {
        it('should return top 100 towns as default', done => {
            chai.request(server)
                .get('/towns')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.at.least(0);
                    expect(res.body.data.length).to.be.at.most(config.maxDataItem);

                    const town = res.body.data[0];
                    expect(town._id).to.exist;
                    expect(town.name).to.exist;
                    expect(town.city).to.exist;
                    expect(town.neighborhoods).to.not.exist;
                    expect(town.geolocation).to.not.exist;

                    done();
                })
        });

        it('should return limited towns data', done => {
            chai.request(server)
                .get('/towns?limit=10')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.equal(10);

                    const town = res.body.data[0];
                    expect(town._id).to.exist;
                    expect(town.name).to.exist;
                    expect(town.city).to.exist;
                    expect(town.neighborhoods).to.not.exist;
                    expect(town.geolocation).to.not.exist;

                    done();
                })
        })

        it('should return districts if requested', done => {
            chai.request(server)
                .get('/towns?fields=districts,name')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.at.least(0);
                    expect(res.body.data.length).to.be.at.most(config.maxDataItem);

                    const town = res.body.data[0];
                    expect(town._id).to.exist;
                    expect(town.name).to.exist;
                    expect(town.city).to.not.exist;
                    expect(town.geolocation).to.not.exist;

                    expect(town.districts).to.exist;
                    expect(town.districts.length).to.greaterThan(0);
                    expect(town.districts[0]).to.be.a('object');
                    expect(town.districts[0]._id).to.exist;
                    expect(town.districts[0].name).to.exist;
                    expect(town.districts[0].geolocation).to.not.exist;

                    done();
                })
        })
    })

    describe('/towns/:id', () => {
        it('should return towns without districts', (done) => {
            chai.request(server)
                .get('/towns/c75bb35b73183e1abf9f948b3949b0ae')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('object');
                    expect(res.body.data._id).to.be.exist;
                    expect(res.body.data.name).to.be.exist;
                    expect(res.body.data.city).to.be.exist;
                    expect(res.body.data.geolocation).to.be.exist;
                    expect(res.body.data.districts).to.not.exist;
                    done();
                })
        })
        it('should return city towns if requested', (done) => {
            chai.request(server)
                .get('/towns/c75bb35b73183e1abf9f948b3949b0ae?fields=name,districts')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('object');
                    expect(res.body.data._id).to.be.exist;
                    expect(res.body.data.name).to.be.exist;
                    expect(res.body.data.city).to.not.exist;
                    expect(res.body.data.geolocation).to.not.exist;
                    expect(res.body.data.districts).to.exist;
                    expect(res.body.data.districts.length).to.be.greaterThan(0);
                    expect(res.body.data.districts[0]._id).to.be.exist;
                    expect(res.body.data.districts[0].name).to.be.exist;
                    expect(Object.keys(res.body.data.districts[0]).length).to.equal(2);
                    done();
                })
        })
    })

    describe('/towns/:id/districts', () => {
        it('should return districts list with default fields', (done) => {
            chai.request(server)
                .get('/towns/c75bb35b73183e1abf9f948b3949b0ae/districts')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.greaterThan(0)
                    expect(res.body.data[0]._id).to.be.exist;
                    expect(res.body.data[0].name).to.be.exist;
                    expect(res.body.data[0].town).to.be.exist;
                    expect(res.body.data[0].city).to.be.exist;
                    expect(res.body.data[0].geolocation).to.not.exist;
                    expect(res.body.data[0].neighborhoods).to.not.exist;
                    done();
                })
        })
    })
    
    describe('/towns/:id/neighborhoods', () => {
        it('should return all neighborhoods for town', done =>{
            chai.request(server)
                .get('/towns/c75bb35b73183e1abf9f948b3949b0ae/neighborhoods')
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
                    expect(Object.keys(res.body.data[0]).length).to.equal(6);
                    done();
                })
        })
    })

    after(done => {
        mongo.close(done);
    })
});