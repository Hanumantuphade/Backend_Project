import mongoose, { Schema } from "mongoose";

const tweetSchema = new Schema(
  {
    content: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId, // user who created the tweet
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
export const Tweet = mongoose.model("Tweet", tweetSchema);
