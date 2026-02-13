import request from "supertest";
import app from "../server.js";
import db from "../config/db.js";

describe("Endpoints de Autenticación", () => {
    afterAll(async () => {
        await db.close();
    });

    it("debería fallar el login con credenciales incorrectas", async () => {
        const res = await request(app)
            .post("/api/login")
            .send({
                email: "wrong@example.com",
                password: "wrongpassword",
                type: "encargado"
            });
        expect(res.statusCode).toBe(401);
    });
});
