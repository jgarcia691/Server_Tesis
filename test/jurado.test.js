import request from "supertest";
import app from "../server.js";

describe("Endpoints de Jurado", () => {
    it("debería obtener una lista de jurados", async () => {
        const res = await request(app).get("/api/jurado/123");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
