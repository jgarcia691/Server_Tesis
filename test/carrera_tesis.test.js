import request from "supertest";
import app from "../server.js";

describe("Endpoints de Carrera Tesis", () => {
    it("debería obtener una lista de relaciones carrera_tesis", async () => {
        const res = await request(app).get("/api/carrera_tesis");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
