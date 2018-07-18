process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongo = require('../../src/utils/mongo.helper');
const config = require('../../src/config');
const server = require('../../src/index');

const expect = chai.expect
chai.use(chaiHttp);


describe('Search routes', () => {
    before((done) => {
        mongo.connect(done);
    });

    describe('/coordinates', () => {
        it('should return town and city name with town id', done => {
            chai.request(server)
                .get(`/${config.apiVersion}/search/coordinates?lat=40.340134&lon=27.971170`)
                .end((err, res) => {
                    expect(res.status).to.equal(200);
                    expect(res.body).to.be.a('object');
                    expect(res.body._id).to.be.exist;
                    expect(res.body.name).to.be.exist;
                    expect(res.body.city).to.be.exist;
                    done();
                })
        });
    });

    after(done => {
        mongo.close(done);
    })
});