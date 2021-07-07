process.env.NODE_ENV = "test";
const request = require("supertest");
const passport = require('passport');
// const MockStrategy = require('passport-mock-strategy');
const app = require("../app");
var User = require("../models/user");
const { startDB, endDB } = require("../seedDB");

beforeAll(async () => {
    await startDB();
});

afterAll(async () => {
    await endDB();
});

describe("Index Routes", () => {
    it("should render the landing page with GET /", async done => {
        const response = await request(app).get("/");
        const regex = /href="\/recipes\/([^"]*)"/g;
        const scrubbedHtml = response.text.replace(regex, 'href="/recipes/scrubbedId"');
        expect(response.statusCode).toBe(200);
        expect(scrubbedHtml).toMatchSnapshot();
        done();
    });

    it("should render the register page with GET /register", async done => {
        const response = await request(app).get("/register");
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatchSnapshot();
        done();
    });

    it("should register a user with valid inputs", async done => {
        const username = 'test-user';
        const response = await request(app)
            .post("/register")
            .send(`username=${username}`)
            .send('password=testpass');
        const user = await User.findOne({ username });
        expect(user.username).toBe(username);
        expect(user).toHaveProperty('_id');
        expect(response.statusCode).toBe(302);
        expect(response.text).toBe('Found. Redirecting to /recipes');
        done();
    });

    it("should redirect to /register when invalid inputs are sent", async done => {
        const response = await request(app)
            .post('/register')
            .send('username=aa')
            .send('password=aa');
        const user = await User.findOne({ username: 'aa' });
        expect(user).toBe(null);
        expect(response.statusCode).toBe(302);
        expect(response.text).toBe('Found. Redirecting to /register');
        done();
    });

    it("should render the login page with GET /login", async done => {
        const response = await request(app).get("/login");
        expect(response.statusCode).toBe(200);
        expect(response.text).toMatchSnapshot();
        done();
    });

    it("should redirect to landing page with GET /logout", async done => {
        const response = await request(app).get("/logout");
        expect(response.statusCode).toBe(302);
        expect(response.text).toBe('Found. Redirecting to /');
        done();
    });

    it("should redirect to /recipes with successful authentication", async done => {
        const response = await request(app)
            .post("/login", passport.authenticate('mock'))
            .send('username=test-user')
            .send('password=testpass');
        expect(response.statusCode).toBe(302);
        expect(response.text).toBe('Found. Redirecting to /recipes');
        done();
    });

    it("should redirect to /login with failed authentication", async done => {
        const response = await request(app)
            .post("/login", passport.authenticate())
            .send('username=notauser')
            .send('password=testpass');
        expect(response.statusCode).toBe(302);
        expect(response.text).toBe('Found. Redirecting to /login');
        done();
    });
});
