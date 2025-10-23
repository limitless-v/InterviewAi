import mongoose from "mongoose";
import app from "./app.js";
import { ENV, assertEnv } from "./config/env.js";

async function main() {
  assertEnv();
  await mongoose.connect(ENV.MONGODB_URI);
  app.listen(ENV.PORT, () => {
    console.log(`API listening on :${ENV.PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
