import request from "supertest";
import app from "../server.js";

describe("Endpoints de Alumno Tesis", () => {
    it("debería obtener una lista de relaciones alumno_tesis", async () => {
        const res = await request(app).get("/api/alumno_tesis");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
