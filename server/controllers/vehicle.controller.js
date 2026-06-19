const Vehicle = require("../models/vehicle.js");
const Household = require("../models/household.js");
const Person = require("../models/person.js");

const normalizePlate = (plate = "") => plate.trim().toUpperCase();
const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const plateRegex = (plate) => new RegExp(`^${escapeRegex(normalizePlate(plate))}$`, "i");

// [GET] vehicles/api/v2/vehicles
module.exports.index = async (req, res) => {
  try {
    const vehicles = await Vehicle.find().sort({ ownName: 1 }).lean();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

// [POST] vehicles/api/v2/delete
module.exports.deleteVehicle = async (req, res) => {
  try {
    const { household_id, plate, vehicle_type } = req.body;
    if (!household_id || !plate || !vehicle_type) {
      return res.status(400).json({ message: "Thiếu thông tin phương tiện cần xóa." });
    }

    const record = await Vehicle.findOne({ household_id });
    if (!record) {
      return res.status(404).json({ message: "Không tìm thấy chủ hộ." });
    }

    const initialLength = record.vehicle.length;
    record.vehicle = record.vehicle.filter((vehicle) => {
      return !(normalizePlate(vehicle.plate) === normalizePlate(plate) && vehicle.vehicle_type === vehicle_type);
    });

    if (record.vehicle.length === initialLength) {
      return res.status(404).json({ message: "Không tìm thấy phương tiện cần xóa." });
    }

    await record.save();
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting vehicle" });
  }
};

// [POST] vehicles/api/v2/edit
module.exports.editVehicle = async (req, res) => {
  try {
    const { household_id, oldPlate, plate, vehicle_type } = req.body;
    if (!household_id || !oldPlate || !plate || !vehicle_type) {
      return res.status(400).json({ message: "Thiếu thông tin phương tiện cần cập nhật." });
    }

    const normalizedOldPlate = normalizePlate(oldPlate);
    const normalizedPlate = normalizePlate(plate);
    const record = await Vehicle.findOne({ household_id });

    if (!record) return res.status(404).json({ message: "Không tìm thấy chủ hộ." });

    const entry = record.vehicle.find((vehicle) => normalizePlate(vehicle.plate) === normalizedOldPlate);
    if (!entry) return res.status(404).json({ message: "Không tìm thấy phương tiện." });

    const duplicatedPlate = await Vehicle.findOne({
      "vehicle.plate": plateRegex(normalizedPlate),
      $or: [
        { household_id: { $ne: household_id } },
        { vehicle: { $elemMatch: { plate: plateRegex(normalizedPlate), _id: { $ne: entry._id } } } },
      ],
    });

    if (duplicatedPlate) {
      return res.status(409).json({ message: "Biển số xe đã tồn tại." });
    }

    entry.plate = normalizedPlate;
    entry.vehicle_type = vehicle_type;
    await record.save();

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

// [POST] vehicles/api/v2/create
module.exports.createVehicle = async (req, res) => {
  try {
    const { ownName, vehicle_type } = req.body;
    const plate = normalizePlate(req.body.plate);

    if (!ownName || !vehicle_type || !plate) {
      return res.status(400).json({ message: "Thiếu thông tin phương tiện." });
    }

    const personFound = await Person.findOne({ name: ownName });
    if (!personFound) {
      return res.status(404).json({ message: "Không tìm thấy chủ hộ." });
    }

    const householdFound = await Household.findOne({ head: personFound._id });
    if (!householdFound) {
      return res.status(404).json({ message: "Không tìm thấy hộ gia đình." });
    }

    const duplicatedPlate = await Vehicle.findOne({ "vehicle.plate": plateRegex(plate) });
    if (duplicatedPlate) {
      return res.status(409).json({ message: "Biển số xe đã tồn tại." });
    }

    let vehicleRecord = await Vehicle.findOne({ household_id: householdFound._id });

    if (!vehicleRecord) {
      vehicleRecord = new Vehicle({
        ownName,
        household_id: householdFound._id,
        vehicle: [{ plate, vehicle_type }],
      });
    } else {
      vehicleRecord.ownName = ownName;
      vehicleRecord.vehicle.push({ plate, vehicle_type });
    }

    await vehicleRecord.save();
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
