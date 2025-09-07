import dotenv from "dotenv";
import fs from "fs";

export function loadEnv() {
  const envPath = ".env";

  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
  } else {
    console.warn("⚠️  Por favor, crea un archivo .env en la raíz del proyecto");
  }
}
