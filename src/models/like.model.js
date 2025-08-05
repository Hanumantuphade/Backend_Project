import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId, // video that is liked
      ref: "Video",
    },
    comment: {
      type: Schema.Types.ObjectId, // comment that is liked
      ref: "Comment",
    },
    tweet: {
      type: Schema.Types.ObjectId, // tweet that is liked
      ref: "Tweet",
    },
    likeBy: {
      type: Schema.Types.ObjectId, // user who liked the video/comment/tweet
      ref: "User",
    },
  },
  { timestamps: true }
);

export const Like = mongoose.model("Like", likeSchema);
