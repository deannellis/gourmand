process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const seedDB = require("../seedDB");
const startDB = seedDB.startDB;
const endDB = seedDB.endDB;

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
        // console.log(response);
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
});
