const mongoose = require("mongoose");

const feeSchema = new mongoose.Schema({
  name: String,
  amount: Number,
  due: Number,
  feeType: {
    type: String,
    enum: ['service', 'management', 'parking', 'utility', 'contribution'],
  },
  vehicleType: String, // 'Xe máy' hoặc 'Ô tô', chỉ dùng khi feeType === 'parking'
  period: {
    month: Number,
    year: Number,
  },
  status: String,
  household: [{ type: mongoose.Schema.Types.ObjectId, ref: 'household' }]
});

const fee = mongoose.model("fees", feeSchema);
module.exports = fee;
