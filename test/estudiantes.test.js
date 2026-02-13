import request from "supertest";
import app from "../server.js";

describe("Endpoints de Estudiantes", () => {
    it("debería obtener una lista de estudiantes", async () => {
        const res = await request(app).get("/api/estudiantes");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
