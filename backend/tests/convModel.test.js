const app = require('../app');
const request = require('supertest');
const path = require('path');

describe('group of tests testing /convModel POST endpoint', () => {
    test('test POST endpoint located at /convModel', async (done) => {
        let results = (await request(app)
            .post('/convModel')
            .attach('image', path.resolve(__dirname, 'test_image1.jpg'))
            .expect(201)
            .expect('Content-Type', /json/)).body;

        
        expect(results).toHaveProperty('MostLikelyClass');
        expect(results).toHaveProperty('allProbs');

        expect(results.allProbs.Batman).toBeGreaterThan(0.85)
        done(); 
    })
}); 