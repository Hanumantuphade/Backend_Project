// require ("dotenv").config({path: "./config/.env"});
import dotenv from "dotenv";
import ConnectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({ path: "./config/.env" });

ConnectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Server error:", error);
      throw error;
    });
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server start on port :${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("mongoDB connection failed !!!", err);
  });

/*

(async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);

    app.on("error", (error) => {
      console.error("Server error:", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
    throw error;
  }
})();
*/
