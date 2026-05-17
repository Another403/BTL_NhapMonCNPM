const Fee = require("../models/fee.js");
const Household = require("../models/household.js");
const Payment = require("../models/payment.js");
const Vehicle = require("../models/vehicle.js");
const searchHelper = require("../helpers/search.js");

//[GET] fees/api/v1/fees
module.exports.index = async (req, res) => {
  try {
    const find = {};
    if (req.query.name) {
      find.name = req.query.name;
    }
    let objectSearch = searchHelper(req.query);
    if (req.query.keyword) {
      find.name = objectSearch.regex;
    }
    const sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    }
    let pagination = {
      currentPage: 1,
      limitItem: 8
    };
    if (req.query.page) {
      pagination.currentPage = parseInt(req.query.page);
    }
    const skip = (pagination.currentPage - 1) * pagination.limitItem;
    pagination.totalItems = await Fee.countDocuments(find);
    pagination.totalPage = Math.ceil(pagination.totalItems / pagination.limitItem);

    const fees = await Fee.find(find).sort(sort).skip(skip).limit(pagination.limitItem);
    if (!fees) {
      return res.status(404).json({ message: "Not Found" });
    }
    let results = { ...pagination, array: [] };
    results.array = fees.map((fee) => ({ ...fee._doc }));
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//[GET] fees/api/v1/detail?id=
module.exports.getDetail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Missing id" });
    const fee = await Fee.findById(id);
    if (!fee) return res.status(404).json({ message: "Not Found" });
    res.status(200).json({ message: "Success", fee });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//[POST] /fees/api/v1/post
module.exports.addFee = async (req, res) => {
  try {
    const { name, amount, due, status, feeType, vehicleType, period, households } = req.body;
    const fee = new Fee({ name, amount, due, status, feeType, vehicleType, period });
    await fee.save();

    let householdsToAddPayment = [];
    if (status === "Bắt buộc") {
      householdsToAddPayment = await Household.find({}, "_id apartments").populate({
        path: "apartments",
        select: "totalArea",
      });
    } else if (status === "Không bắt buộc" && households) {
      householdsToAddPayment = await Household.find(
        { _id: { $in: households } },
        "_id apartments"
      ).populate({
        path: "apartments",
        select: "totalArea",
      });
    }

    // Pre-fetch vehicle records for all affected households
    const householdIds = householdsToAddPayment.map(h => h._id);
    const vehicleRecords = await Vehicle.find({ household_id: { $in: householdIds } }).lean();
    const vehicleMap = vehicleRecords.reduce((acc, v) => {
      acc[v.household_id.toString()] = v;
      return acc;
    }, {});

    const payments = householdsToAddPayment.map((household) => {
      const vehicleDoc = vehicleMap[household._id.toString()];
      let count = 0;

      if (name === "Phí gửi xe máy") {
        count = vehicleDoc ? vehicleDoc.vehicle.filter(v => v.vehicle_type === 'Xe máy').length : 0;
      } else if (name === "Phí gửi ô tô") {
        count = vehicleDoc ? vehicleDoc.vehicle.filter(v => v.vehicle_type === 'Ô tô').length : 0;
      } else if (name === "Phí từ thiện") {
        count = 1;
      } else {
        count = household.apartments && Array.isArray(household.apartments)
          ? household.apartments.reduce((total, apt) => total + (apt.totalArea || 0), 0)
          : 0;
      }

      if (count === 0 && (name === "Phí gửi xe máy" || name === "Phí gửi ô tô")) {
        return null;
      }

      return {
        fee_id: fee._id,
        payment_id: generatePaymentID(),
        household_id: household._id,
        amount: fee.amount,
        payment_date: calculateDueDate(fee.due),
        status: "Chưa thanh toán",
        count,
      };
    }).filter(p => p !== null);

    if (payments.length > 0) {
      await Payment.insertMany(payments);
    }

    res.status(201).json({ message: "Fee created successfully", fee });
  } catch (error) {
    console.error("Error creating fee:", error);
    res.status(500).json({ message: "Error creating fee", error });
  }
};

//[POST] /fees/api/v1/change
module.exports.changeFee = async (req, res) => {
  try {
    const { id, name, amount, due, status, feeType, vehicleType, period, households, ...otherFields } = req.body;

    if (!id) {
      return res.status(400).json({ message: "Thiếu ID của phí cần cập nhật!!!!" });
    }

    const existingFee = await Fee.findById(id);
    if (!existingFee) {
      return res.status(404).json({ message: "Không tìm thấy phí với ID này." });
    }

    const updateFields = { ...otherFields };
    if (name !== undefined) updateFields.name = name;
    if (amount !== undefined) updateFields.amount = amount;
    if (due !== undefined) updateFields.due = due;
    if (status !== undefined) updateFields.status = status;
    if (feeType !== undefined) updateFields.feeType = feeType;
    if (vehicleType !== undefined) updateFields.vehicleType = vehicleType;
    if (period !== undefined) updateFields.period = period;

    if (Object.keys(updateFields).length === 0) {
      return res.status(400).json({ message: "Không có trường nào để cập nhật!!!" });
    }

    const updatedFee = await Fee.findByIdAndUpdate(id, updateFields, { new: true });

    let householdsToUpdatePayments = [];
    if (status === "Bắt buộc") {
      householdsToUpdatePayments = await Household.find({}, "_id apartments").populate({
        path: "apartments",
        select: "totalArea",
      });
    } else if (status === "Không bắt buộc" && households) {
      householdsToUpdatePayments = await Household.find(
        { _id: { $in: households } },
        "_id apartments"
      ).populate({
        path: "apartments",
        select: "totalArea",
      });
    }

    // Pre-fetch vehicle records for all affected households
    const householdIds = householdsToUpdatePayments.map(h => h._id);
    const vehicleRecords = await Vehicle.find({ household_id: { $in: householdIds } }).lean();
    const vehicleMap = vehicleRecords.reduce((acc, v) => {
      acc[v.household_id.toString()] = v;
      return acc;
    }, {});

    const feeName = name || existingFee.name;
    const paymentsToUpdate = householdsToUpdatePayments.map((household) => {
      const vehicleDoc = vehicleMap[household._id.toString()];
      let count = 0;

      if (feeName === "Phí gửi xe máy") {
        count = vehicleDoc ? vehicleDoc.vehicle.filter(v => v.vehicle_type === 'Xe máy').length : 0;
      } else if (feeName === "Phí gửi ô tô") {
        count = vehicleDoc ? vehicleDoc.vehicle.filter(v => v.vehicle_type === 'Ô tô').length : 0;
      } else if (feeName === "Phí từ thiện") {
        count = 1;
      } else {
        count = household.apartments && Array.isArray(household.apartments)
          ? household.apartments.reduce((total, apt) => total + (apt.totalArea || 0), 0)
          : 0;
      }

      if (count === 0 && (feeName === "Phí gửi xe máy" || feeName === "Phí gửi ô tô")) {
        return null;
      }

      return {
        fee_id: id,
        payment_id: generatePaymentID(),
        household_id: household._id,
        amount: updatedFee.amount,
        payment_date: calculateDueDate(updatedFee.due),
        status: "Chưa thanh toán",
        count,
      };
    }).filter(p => p !== null);

    await Payment.deleteMany({ fee_id: id });
    if (paymentsToUpdate.length > 0) {
      await Payment.insertMany(paymentsToUpdate);
    }

    res.status(200).json({ message: "Cập nhật thành công!", data: updatedFee });
  } catch (error) {
    console.error("Lỗi khi cập nhật:", error);
    res.status(500).json({ message: "Lỗi khi cập nhật!", error });
  }
};

function generatePaymentID() {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function calculateDueDate(due) {
  const now = new Date();
  now.setMonth(now.getMonth() + due);
  return now;
}

//[POST] /fees/api/v1/delete
module.exports.deleteFee = async (req, res) => {
  try {
    const { id } = req.body;
    await Payment.deleteMany({ fee_id: id });
    await Fee.deleteOne({ _id: id });
    res.status(201).json({ message: "Delete Fee Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete Fee Error", error });
  }
};
