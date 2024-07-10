import mongoose from "mongoose";

const connectionSchema = mongoose.Schema({
  chatId: {
    type: Number,
    required: true,
  },
  domainName: {
    type: String, 
    required: true,
  },
});

const connectionModel = mongoose.model("connectionModel", connectionSchema);
export default connectionModel;
