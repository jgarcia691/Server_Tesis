import request from "supertest";
import app from "../server.js";

describe("Verificación de Estado (Health Check)", () => {
  afterAll(async () => {
    // await db.close(); 
  });

  it("debería retornar 404 para una ruta desconocida", async () => {
    const res = await request(app).get("/api/unknown");
    expect(res.statusCode).toBe(404);
  });
});
