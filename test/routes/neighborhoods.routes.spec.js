process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongo = require('../../src/utils/mongo.helper');
const server = require('../../src/index');
const expect = chai.expect
const config = require('../../src/config');
chai.use(chaiHttp);

describe('Neighborhoods routes', () => {
    before((done) => {
        mongo.connect(done);
    });

    describe('/neighborhoods', () => {
        it('should return top 100 neighborhoods as default', done => {
            chai.request(server)
                .get('/neighborhoods')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.be.at.least(0);
                    expect(res.body.data.length).to.be.at.most(config.maxDataItem);

                    const neighborhood = res.body.data[0];
                    expect(neighborhood._id).to.exist;
                    expect(neighborhood.name).to.exist;
                    expect(neighborhood.district).to.exist;
                    expect(neighborhood.town).to.exist;
                    expect(neighborhood.city).to.exist;
                    expect(neighborhood.zip_code).to.exist;
                    expect(Object.keys(neighborhood).length).to.equal(6);

                    done();
                })
        });

        it('should return limited neighborhoods data', done => {
            chai.request(server)
                .get('/neighborhoods?limit=10')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('array');
                    expect(res.body.data.length).to.equal(10);

                    const neighborhood = res.body.data[0];
                    expect(neighborhood._id).to.exist;
                    expect(neighborhood.name).to.exist;
                    expect(neighborhood.district).to.exist;
                    expect(neighborhood.town).to.exist;
                    expect(neighborhood.city).to.exist;
                    expect(neighborhood.zip_code).to.exist;
                    expect(Object.keys(neighborhood).length).to.equal(6);

                    done();
                })
        })
    })

    describe('/neighborhoods/:id', done => {
        it('should return neighborhoods with default fields', (done) => {
            chai.request(server)
                .get('/neighborhoods/00021ac2ce842415456ed4be91e1a9bf')
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body.data).to.be.a('object');
                    expect(res.body.data._id).to.be.exist;
                    expect(res.body.data.name).to.be.exist;
                    expect(res.body.data.district).to.be.exist;
                    expect(res.body.data.town).to.be.exist;
                    expect(res.body.data.city).to.be.exist;
                    expect(res.body.data.zip_code).to.exist;
                    expect(Object.keys(res.body.data).length).to.equal(6);
                    done();
                })
        })
    })

    after(done => {
        mongo.close(done);
    });
});