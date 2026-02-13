import request from "supertest";
import app from "../server.js";

describe("Endpoints de Encargado", () => {
    it("debería obtener una lista de encargados", async () => {
        const res = await request(app).get("/api/encargado");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });
});
