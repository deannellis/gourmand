process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../app");
const seedDB = require("../seedDB");

beforeAll(async () => {
    await seedDB();
});

describe("GET /", () => {
    test("It should render the landing page", async () => {
        const response = await request(app).get("/");
        // console.log(response);
        expect(response.statusCode).toBe(200);
    });
});