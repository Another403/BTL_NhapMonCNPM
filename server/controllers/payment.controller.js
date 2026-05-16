const mongoose = require('mongoose');
const Payment = require("../models/payment.js");
const Fee = require("../models/fee.js");
const Household = require('../models/household.js');
const Person = require('../models/person.js');
const Vehicle = require('../models/vehicle.js');

//[GET] payments/api/v1/payments
module.exports.index = async (req, res) => {
  try {
    const filter = {};
    const householdFilter = {};

    if (req.query.fee_id) {
      filter.fee_id = req.query.fee_id;
    }
    if (req.query.household_id) {
      filter.household_id = req.query.household_id;
    }
    if (req.query.status === 'done') {
      filter.status = 'Đã thanh toán';
    }
    if (req.query.status === 'undone') {
      filter.status = 'Chưa thanh toán';
    }

    if (req.query.feeName) {
      const fees = await Fee.find({ name: req.query.feeName }).select('_id').lean();
      filter.fee_id = { $in: fees.map(f => f._id) };
    }

    if (!req.query.household_id) {
      if (req.query.householdHead) {
        const headPersons = await Person.find({ name: req.query.householdHead }).select('_id').lean();
        householdFilter.head = { $in: headPersons.map(p => p._id) };
      }
      const households = await Household.find(householdFilter).select('_id').lean();
      if (households.length > 0) {
        filter.household_id = { $in: households.map(h => h._id) };
      }
    }

    if (req.query.fromDate || req.query.toDate) {
      const fromDate = req.query.fromDate ? new Date(req.query.fromDate) : null;
      const toDate = req.query.toDate ? new Date(req.query.toDate) : null;
      if (fromDate && isNaN(fromDate)) {
        return res.status(400).json({ message: 'Ngày bắt đầu không hợp lệ' });
      }
      if (toDate && isNaN(toDate)) {
        return res.status(400).json({ message: 'Ngày kết thúc không hợp lệ' });
      }
      filter.payment_date = {};
      if (fromDate) filter.payment_date.$gte = fromDate;
      if (toDate) filter.payment_date.$lte = toDate;
    }

    let pagination = { currentPage: 1, limitItem: 8 };
    if (req.query.page) {
      pagination.currentPage = parseInt(req.query.page);
    }
    const skip = (pagination.currentPage - 1) * pagination.limitItem;
    pagination.totalItems = await Payment.countDocuments(filter);
    pagination.totalPage = Math.ceil(pagination.totalItems / pagination.limitItem);
    pagination.limitItem = req.query.limit ? parseInt(req.query.limit) : 8;

    const payments = await Payment.find(filter).lean().skip(skip).limit(pagination.limitItem);

    const householdIds = [...new Set(payments.map(p => p.household_id.toString()))];
    const householdsFound = await Household.find({ _id: { $in: householdIds } }).lean();
    const householdMap = householdsFound.reduce((acc, h) => {
      acc[h._id.toString()] = h;
      return acc;
    }, {});

    const personIds = householdsFound.map(h => h.head);
    const persons = await Person.find({ _id: { $in: personIds } }).lean();
    const personMap = persons.reduce((acc, p) => {
      acc[p._id.toString()] = p;
      return acc;
    }, {});

    const feeIds = [...new Set(payments.map(p => p.fee_id?.toString()).filter(Boolean))];
    const fees = await Fee.find({ _id: { $in: feeIds } }).select('name').lean();
    const feeMap = fees.reduce((acc, f) => {
      acc[f._id.toString()] = f.name;
      return acc;
    }, {});

    let results = { ...pagination, array: [] };
    results.array = payments.map(payment => {
      const household = householdMap[payment.household_id.toString()];
      const headPerson = household?.head ? personMap[household.head.toString()] : null;
      const paymentDateObj = new Date(payment.payment_date);
      const month = paymentDateObj.getMonth() + 1;
      const year = paymentDateObj.getFullYear();
      const householdHead = headPerson ? headPerson.name : "Unknown";
      const feeName = feeMap[payment.fee_id?.toString()] || "Unknown";
      const payment_name = `${feeName} tháng ${month}/${year}`;
      return { ...payment, householdHead, feeName, payment_name };
    });

    res.json(results);
  } catch (error) {
    console.error('Payment index error:', error);
    res.status(500).json({ message: "Server Error" });
  }
};

//[GET] /payments/api/v1/detail?id=  (tìm theo payment_id 8 ký tự)
module.exports.getDetail = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "Missing id" });
    const payment = await Payment.findOne({ payment_id: id }).lean();
    if (!payment) return res.status(404).json({ message: "Not Found" });
    const fee = payment.fee_id ? await Fee.findById(payment.fee_id).select('name feeType').lean() : null;
    res.status(200).json({ message: "Success", payment: { ...payment, feeName: fee?.name, feeType: fee?.feeType } });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//[POST] /payments/api/v1/post
module.exports.addPayment = async (req, res) => {
  try {
    const { fee_id, household_id, amount, payment_date } = req.body;
    const payment = new Payment({ fee_id, household_id, amount, payment_date });
    await payment.save();
    res.status(201).json(payment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating payment", error });
  }
};

//[POST] /payments/api/v1/change
module.exports.changePayment = async (req, res) => {
  try {
    const { payment_id, bill_id } = req.body;
    const payment = await Payment.findOne({ payment_id });

    if (!payment) {
      return res.status(404).json({ message: 'Thanh toán không tồn tại' });
    }
    if (payment.status === 'Đã thanh toán') {
      return res.status(400).json({ message: 'Thanh toán đã được hoàn tất' });
    }

    payment.status = 'Đã thanh toán';
    await payment.save();
    res.status(200).json({ message: 'Thanh toán đã được cập nhật thành công', payment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

//[POST] /payments/api/v1/changes
module.exports.changePayments = async (req, res) => {
  const { payment_ids, bill_id, bill_time } = req.body;
  try {
    if (!payment_ids || !Array.isArray(payment_ids) || payment_ids.length === 0) {
      return res.status(400).json({ message: 'Danh sách payment_id không hợp lệ' });
    }

    const updatedPayments = await Payment.updateMany(
      { payment_id: { $in: payment_ids }, status: 'Chưa thanh toán' },
      { $set: { status: 'Đã thanh toán', bill_id, bill_time } }
    );

    if (updatedPayments.modifiedCount === 0) {
      return res.status(404).json({ message: 'Không tìm thấy thanh toán nào cần thay đổi' });
    }

    res.status(200).json({ message: 'Cập nhật thanh toán thành công', updatedPayments });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Lỗi máy chủ' });
  }
};

//[POST] /payments/api/v1/delete
module.exports.deletePayment = async (req, res) => {
  try {
    const { fee_id, household_id } = req.body;
    await Payment.deleteOne({ fee_id, household_id });
    res.status(201).json({ message: "Delete Payment Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Delete Payment Error", error });
  }
};

//[GET] /payments/api/v1/totalPayment
module.exports.totalPayment = async (req, res) => {
  try {
    const households = await Household.find({});
    if (!households) {
      return res.status(404).json({ message: "Not Found" });
    }

    const results = [];
    for (const household of households) {
      const householdObjectId = new mongoose.Types.ObjectId(household._id.toString());

      const payments = await Payment.aggregate([
        { $match: { household_id: householdObjectId } },
        { $group: { _id: null, totalAmount: { $sum: { $multiply: ["$amount", "$count"] } } } }
      ]);

      const unpaid = await Payment.aggregate([
        { $match: { household_id: householdObjectId, status: { $ne: "Đã thanh toán" } } },
        { $group: { _id: null, totalAmount: { $sum: { $multiply: ["$amount", "$count"] } } } }
      ]);

      const unpaidAmount = unpaid.length > 0 ? unpaid[0].totalAmount : 0;
      const totalAmount = payments.length > 0 ? payments[0].totalAmount : 0;

      const headPerson = await Person.findById(household.head).select('name');
      const headName = headPerson ? headPerson.name : "Unknown";

      results.push({ household_id: household._id, headName, unpaidAmount, totalAmount });
    }

    res.status(200).json({ data: results });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//[GET] /payments/api/v1/feeTypeStats
module.exports.getFeeTypeStats = async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $lookup: {
          from: 'fees',
          localField: 'fee_id',
          foreignField: '_id',
          as: 'fee'
        }
      },
      { $unwind: { path: '$fee', preserveNullAndEmpty: true } },
      {
        $group: {
          _id: { $ifNull: ['$fee.feeType', 'unknown'] },
          totalAmount: { $sum: { $multiply: ['$amount', { $ifNull: ['$count', 1] }] } },
          paidAmount: {
            $sum: {
              $cond: [
                { $eq: ['$status', 'Đã thanh toán'] },
                { $multiply: ['$amount', { $ifNull: ['$count', 1] }] },
                0
              ]
            }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const labelMap = {
      service: 'Phí dịch vụ',
      management: 'Phí quản lý',
      parking: 'Phí gửi xe',
      utility: 'Điện/nước/internet',
      contribution: 'Khoản đóng góp',
      unknown: 'Chưa phân loại'
    };

    const data = stats.map(s => ({
      feeType: s._id,
      label: labelMap[s._id] || s._id,
      totalAmount: s.totalAmount,
      paidAmount: s.paidAmount,
      unpaidAmount: s.totalAmount - s.paidAmount
    }));

    res.status(200).json({ data });
  } catch (error) {
    console.error('getFeeTypeStats error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

//[GET] /payments/api/v1/history?household_id=...
module.exports.getHistory = async (req, res) => {
  try {
    const { household_id } = req.query;
    if (!household_id) return res.status(400).json({ message: 'Missing household_id' });

    const payments = await Payment.find({
      household_id: new mongoose.Types.ObjectId(household_id),
      bill_id: { $ne: null },
      status: 'Đã thanh toán'
    }).lean();

    const feeIds = [...new Set(payments.map(p => p.fee_id?.toString()).filter(Boolean))];
    const fees = await Fee.find({ _id: { $in: feeIds } }).select('name').lean();
    const feeMap = fees.reduce((acc, f) => { acc[f._id.toString()] = f.name; return acc; }, {});

    const grouped = {};
    for (const payment of payments) {
      const key = payment.bill_id;
      if (!grouped[key]) {
        grouped[key] = { bill_id: key, bill_time: payment.bill_time, payments: [], total_amount: 0 };
      }
      const feeName = feeMap[payment.fee_id?.toString()] || 'Unknown';
      const d = new Date(payment.payment_date);
      const payment_name = `${feeName} tháng ${d.getMonth() + 1}/${d.getFullYear()}`;
      grouped[key].payments.push({ payment_id: payment.payment_id, payment_name, amount: payment.amount, count: payment.count || 1 });
      grouped[key].total_amount += payment.amount * (payment.count || 1);
    }

    const array = Object.values(grouped).sort((a, b) => new Date(b.bill_time) - new Date(a.bill_time));
    res.status(200).json({ array });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// Cron job: tự động tạo payment mỗi tháng
const generatePaymentID = () => Math.random().toString(36).substring(2, 10).toUpperCase();

const calculateDueDate = (monthsToAdd) => {
  const now = new Date();
  now.setMonth(now.getMonth() + monthsToAdd);
  return now;
};

module.exports.autoGeneratePayments = async () => {
  try {
    const mandatoryFees = await Fee.find({ status: "Bắt buộc" });

    for (const fee of mandatoryFees) {
      const households = await Household.find({}, "_id apartments").populate({
        path: "apartments",
        select: "totalArea",
      });

      // Pre-fetch vehicle records for all households
      const householdIds = households.map(h => h._id);
      const vehicleRecords = await Vehicle.find({ household_id: { $in: householdIds } }).lean();
      const vehicleMap = vehicleRecords.reduce((acc, v) => {
        acc[v.household_id.toString()] = v;
        return acc;
      }, {});

      const payments = households.map((household) => {
        const vehicleDoc = vehicleMap[household._id.toString()];
        let count = 0;

        if (fee.name === "Phí gửi xe máy") {
          count = vehicleDoc ? vehicleDoc.vehicle.filter(v => v.vehicle_type === 'Xe máy').length : 0;
        } else if (fee.name === "Phí gửi ô tô") {
          count = vehicleDoc ? vehicleDoc.vehicle.filter(v => v.vehicle_type === 'Ô tô').length : 0;
        } else {
          count = household.apartments && Array.isArray(household.apartments)
            ? household.apartments.reduce((total, apt) => total + (apt.totalArea || 0), 0)
            : 0;
        }

        if (count === 0 && (fee.name === "Phí gửi xe máy" || fee.name === "Phí gửi ô tô")) {
          return null;
        }

        return {
          fee_id: fee._id,
          household_id: household._id,
          amount: fee.amount,
          payment_date: calculateDueDate(fee.due),
          status: "Chưa thanh toán",
          payment_id: generatePaymentID(),
          count,
        };
      }).filter(p => p !== null);

      if (payments.length > 0) {
        await Payment.insertMany(payments);
      }
    }
  } catch (error) {
    console.error("Lỗi khi tạo payment tự động:", error);
  }
};
