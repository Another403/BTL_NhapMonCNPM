const Vehicle = require("../models/vehicle.js");
const Household = require("../models/household.js");
const Person = require("../models/person.js");

//[GET] vehicles/api/v2/vehicles
module.exports.index = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json(vehicles);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//[POST] vehicles/api/v2/delete
module.exports.deleteVehicle = async (req, res) => {
  try {
    const { household_id, plate, vehicle_type } = req.body;
    await Vehicle.updateOne(
      { household_id },
      { $pull: { vehicle: { plate, vehicle_type } } }
    );
    res.status(200).json({ message: "Vehicle deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error deleting vehicle" });
  }
};

//[POST] vehicles/api/v2/edit  — đổi biển số hoặc loại xe cho 1 phương tiện
module.exports.editVehicle = async (req, res) => {
  try {
    const { household_id, oldPlate, plate, vehicle_type } = req.body;
    if (!household_id || !oldPlate) return res.status(400).json({ message: "Missing household_id or oldPlate" });
    const record = await Vehicle.findOne({ household_id });
    if (!record) return res.status(404).json({ message: "Vehicle record not found" });
    const entry = record.vehicle.find(v => v.plate === oldPlate);
    if (!entry) return res.status(404).json({ message: "Vehicle not found" });
    if (plate !== undefined) entry.plate = plate;
    if (vehicle_type !== undefined) entry.vehicle_type = vehicle_type;
    await record.save();
    res.status(200).json({ message: "Success" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

//[POST] vehicles/api/v2/create
module.exports.createVehicle = async (req, res) => {
  try {
    const { ownName, vehicle_type, plate } = req.body;
    const personFound = await Person.findOne({ name: ownName });
    const householdFound = await Household.findOne({ head: personFound._id });
    let vehicleRecord = await Vehicle.findOne({ household_id: householdFound._id });

    if (!vehicleRecord) {
      vehicleRecord = new Vehicle({
        ownName,
        household_id: householdFound._id,
        vehicle: [{ plate, vehicle_type }],
      });
    } else {
      const existing = await Vehicle.findOne({ "vehicle.plate": plate });
      if (!existing) {
        vehicleRecord.vehicle.push({ plate, vehicle_type });
      }
    }
    await vehicleRecord.save();
    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
