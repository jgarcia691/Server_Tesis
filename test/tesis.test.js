import request from "supertest";
import app from "../server.js";

describe("Endpoints de Tesis", () => {
    it("debería obtener una lista de tesis", async () => {
        const res = await request(app).get("/api/tesis");
        expect(res.statusCode).toBe(200);
        expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("debería retornar 404 para una tesis inexistente", async () => {
        const res = await request(app).get("/api/tesis/99999999"); // Asumiendo que esta ID no existe
        expect(res.statusCode).toBe(404);
    });
});
