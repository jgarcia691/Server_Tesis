import request from "supertest";
import app from "../server.js";

describe("Endpoints de Sede", () => {
    it("debería obtener una lista de sedes", async () => {
        const res = await request(app).get("/api/sede");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
