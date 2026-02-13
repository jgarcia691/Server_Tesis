import request from "supertest";
import app from "../server.js";

describe("Endpoints de Alumno Carrera", () => {
    it("debería obtener una lista de relaciones alumno_carrera", async () => {
        const res = await request(app).get("/api/alumno_carrera");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
