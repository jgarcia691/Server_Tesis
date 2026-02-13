import request from "supertest";
import app from "../server.js";

describe("Endpoints de Profesor", () => {
    it("debería obtener una lista de profesores", async () => {
        const res = await request(app).get("/api/profesor");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
