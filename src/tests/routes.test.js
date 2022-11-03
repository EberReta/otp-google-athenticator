const request = require('supertest');
import User from '../models/User.js';
import { faker } from '@faker-js/faker';
const { authenticator } = require('otplib')

const app = require('../index.js')

const username = faker.internet.email();

describe('Register Endpoint', () => {
    test('Register success', async () => {
        const res = await request(app).post('/register').send({
            username: username
        });
        expect(res.statusCode).toEqual(200)
        expect(res.body.qr).toBeDefined()
        expect(res.body.authenticatorUrl).toBeDefined()
    });

    test('Register without params error', async () => {
        const res = await request(app).post('/register').send({
        });
        expect(res.statusCode).toEqual(403)
        expect(res.body.error).toBeDefined()
        expect(res.body.error).toEqual('The username field is required')
    });

    test('Register duplicate error', async () => {
        const res = await request(app).post('/register').send({
            username: username
        });
        expect(res.statusCode).toEqual(400)
        expect(res.body.error).toBeDefined()
        expect(res.body.error).toEqual('Username already exists')
    });
});

describe('User Info Endpoint', () => {
    test('Get user info success', async () => {
        const res = await request(app).get('/info').send({
            username: username
        });
        expect(res.statusCode).toEqual(200)
        expect(res.body.qr).toBeDefined()
        expect(res.body.authenticatorUrl).toBeDefined()
    });

    test('Get user info without params error', async () => {
        const res = await request(app).get('/info').send({
        });
        expect(res.statusCode).toEqual(404)
        expect(res.body.error).toBeDefined()
        expect(res.body.error).toEqual('User not found')
    });
});

describe('Validate User endpoint', () => {
    test('Validate user otp success', async () => {
        /** Configure a existing otp secret */
        const newUsername = faker.internet.email();
        const otpSecret = authenticator.generateSecret();
        await User.create({ username: newUsername, secret: otpSecret });

        /** TEST POST */
        const otpCode = authenticator.generate(otpSecret);
        const res = await request(app).post('/validate').send({
            username: newUsername,
            otpCode
        });
        expect(res.statusCode).toEqual(200)
        expect(res.body.status).toEqual(true)
        expect(res.body.user).toBeDefined()
    });

    test('Validate otpCode invalid error', async () => {
        /** Configure a existing otp secret */
        const newUsername = faker.internet.email();
        const otpSecret = authenticator.generateSecret();
        User.create({ username: newUsername, secret: otpSecret });

        /** TEST POST */
        const otpCode = faker.random.alphaNumeric(16);
        const res = await request(app).post('/validate').send({
            username: newUsername,
            otpCode
        });
        expect(res.statusCode).toEqual(200)
        expect(res.body.status).toEqual(false)
        expect(res.body.msg).toEqual('Invalid OTP code')
    });

    test('Validate without username param error', async () => {
        const otpCode = faker.random.alphaNumeric(16);
        const res = await request(app).post('/validate').send({
            otpCode
        });
        expect(res.statusCode).toEqual(403)
        expect(res.body.error).toEqual('The username and otpCode fields are required')
    });

    test('Validate without otpCode param error', async () => {
        const newUsername = faker.internet.email();
        const res = await request(app).post('/validate').send({
            username: newUsername,
        });
        expect(res.statusCode).toEqual(403)
        expect(res.body.error).toEqual('The username and otpCode fields are required')
    });
});
