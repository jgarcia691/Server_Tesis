import test from "node:test";
import assert from "node:assert";

test("Tesis Integration Tests", async (t) => {
  // Make sure the server is running before executing this test
  const port = process.env.PORT || 8080;
  const baseUrl = `http://localhost:${port}/api`;

  await t.test("GET /tesis - should return all tesis", async () => {
    try {
      const response = await fetch(`${baseUrl}/tesis`);
      assert.strictEqual(response.status, 200, "should return status 200");

      const body = await response.json();
      assert.ok(Array.isArray(body), "should return an array");

      // Optionally, check for the structure of the first element if the array is not empty
      if (body.length > 0) {
        const firstTesis = body[0];
        assert.ok(firstTesis.hasOwnProperty("id"), "tesis should have an id");
        assert.ok(
          firstTesis.hasOwnProperty("nombre"),
          "tesis should have a nombre"
        );
        assert.ok(
          firstTesis.hasOwnProperty("autores"),
          "tesis should have an autores property"
        );
        assert.ok(
          Array.isArray(firstTesis.autores),
          "autores should be an array"
        );
      }
    } catch (error) {
      assert.fail(`Test failed with error: ${error.message}`);
    }
  });

  await t.test(
    "GET /tesis/:id/download - should download a thesis file",
    async () => {
      try {
        const tesisId = 1; // Assuming a thesis with id=1 exists
        const response = await fetch(`${baseUrl}/tesis/${tesisId}/download`);

        assert.strictEqual(response.status, 200, "should return status 200");

        const contentType = response.headers.get("content-type");
        assert.strictEqual(
          contentType,
          "application/pdf",
          'should have content-type "application/pdf"'
        );

        const contentDisposition = response.headers.get("content-disposition");
        assert.strictEqual(
          contentDisposition,
          `attachment; filename="tesis_${tesisId}.pdf"`,
          "should have correct content-disposition"
        );

        // Check if the body is not empty
        const body = await response.blob();
        assert.ok(body.size > 0, "should have a body");
      } catch (error) {
        assert.fail(`Test failed with error: ${error.message}`);
      }
    }
  );
});
