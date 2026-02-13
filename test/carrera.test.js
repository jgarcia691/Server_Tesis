import request from "supertest";
import app from "../server.js";

describe("Endpoints de Carrera", () => {
    it("debería obtener una lista de carreras", async () => {
        const res = await request(app).get("/api/carrera");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
