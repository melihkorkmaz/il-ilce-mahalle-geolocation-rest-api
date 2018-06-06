process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongo = require('../../src/utils/mongo.helper');
const config = require('../../src/config');
const server = require('../../src/index');

const expect = chai.expect
chai.use(chaiHttp);


describe('Cities routes', () => {
    before((done) => {
        mongo.connect(done);
    });

    describe('/cities', () => {
        it('should return top 100 cities as default', done => {
            chai.request(server)
                .get(`/${config.apiVersion}/cities`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.at.least(0);
                    expect(res.body.data.length).to.be.at.most(config.maxDataItem);

                    const city = res.body.data[0];
                    expect(city._id).to.exist;
                    expect(city.name).to.exist;
                    expect(city.towns).to.not.exist;
                    expect(city.geolocation).to.not.exist;

                    done();
                })
        });

        it('should return limited cities data', done => {
            chai.request(server)
                .get(`/${config.apiVersion}/cities?limit=10`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.equal(10);

                    const city = res.body.data[0];
                    expect(city._id).to.exist;
                    expect(city.name).to.exist;
                    expect(city.towns).to.not.exist;
                    expect(city.geolocation).to.not.exist;

                    done();
                })
        })

        it('should return towns if requested', done => {
            chai.request(server)
                .get(`/${config.apiVersion}/cities?fields=towns,name`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.at.least(0);
                    expect(res.body.data.length).to.be.at.most(config.maxDataItem);

                    const city = res.body.data[0];
                    expect(city._id).to.exist;
                    expect(city.name).to.exist;
                    expect(city.geolocation).to.not.exist;

                    expect(city.towns).to.exist;
                    expect(city.towns.length).to.greaterThan(0);
                    expect(city.towns[0]).to.be.a('object');
                    expect(city.towns[0]._id).to.exist;
                    expect(city.towns[0].name).to.exist;
                    expect(city.towns[0].geolocation).to.not.exist;

                    done();
                })
        })
    })

    describe('/cities/:id', done => {
        it('should return city without towns', (done) => {
            chai.request(server)
            .get(`/${config.apiVersion}/cities/fbf55ec2f75ae0ee54a2c55b49eef828`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.data).to.be.a('object');
                expect(res.body.data._id).to.be.exist;
                expect(res.body.data.name).to.be.exist;
                expect(res.body.data.geolocation).to.be.exist;
                expect(res.body.data.towns).to.not.exist;
                done();
            })
        })
        it('should return city towns if requested', (done) => {
            chai.request(server)
            .get(`/${config.apiVersion}/cities/fbf55ec2f75ae0ee54a2c55b49eef828?fields=name,towns`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.data).to.be.a('object');
                expect(res.body.data._id).to.be.exist;
                expect(res.body.data.name).to.be.exist;
                expect(res.body.data.geolocation).to.not.exist;
                expect(res.body.data.towns).to.exist;
                expect(res.body.data.towns.length).to.be.greaterThan(0);
                expect(res.body.data.towns[0]._id).to.be.exist;
                expect(res.body.data.towns[0].name).to.be.exist;
                expect(Object.keys(res.body.data.towns[0]).length).to.equal(2);
                done();
            })
        })
    })

    describe('/cities/:id/towns', done => {
        it('should return town list with default fields', (done) => {
            chai.request(server)
            .get(`/${config.apiVersion}/cities/fbf55ec2f75ae0ee54a2c55b49eef828/towns`)
            .end((err, res) => {
                expect(res.status).to.equal(200);
                expect(res.body.data).to.be.a('array');
                expect(res.body.data.length).to.be.greaterThan(0)
                expect(res.body.data[0]._id).to.be.exist;
                expect(res.body.data[0].name).to.be.exist;
                expect(res.body.data[0].geolocation).to.not.exist;
                expect(res.body.data[0].districts).to.not.exist;
                done();
            })
        })
    })

    after(done => {
        mongo.close(done);
    })
})