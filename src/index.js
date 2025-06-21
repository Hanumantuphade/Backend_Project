// require ("dotenv").config({path: "./config/.env"}); 
import dotenv from "dotenv";
import ConnectDB from "./db/index.js";


dotenv.config({ path: "./config/.env" });


ConnectDB()

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