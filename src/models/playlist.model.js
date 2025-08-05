import mongoose, { Schema } from "mongoose";

const playlistSchema = new Schema(
  {
    name: {
      tyepe: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    videos: [
      {
        type: Schema.Types.ObjectId, // video IDs in the playlist
        ref: "Video",
      },
    ],
    owner: {
      type: Schema.Types.ObjectId, // user who created the playlist 
      ref: "User",
    }
  },
  
  {
    timestamps: true,
  }
);
export const Playlist = mongoose.model("Playlist", playlistSchema);
