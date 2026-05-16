const apartment = require("../models/apartment.js");
const household = require("../models/household.js");
const searchHelper = require("../helpers/search.js");

//[GET] apartments/api/v1/detail?id=
module.exports.getDetail = async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) return res.status(400).json({ message: "Missing id" });
        const found = await apartment.findById(id);
        if (!found) return res.status(404).json({ message: "Not Found" });
        res.status(200).json({ message: "Success", apartment: found });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

//[POST] apartments/api/v1/create
module.exports.createApartment = async (req, res) => {
    try {
        const { number, type, totalArea } = req.body;
        if (!number || !totalArea) return res.status(400).json({ message: "Missing required fields" });
        const existing = await apartment.findOne({ number });
        if (existing) return res.status(400).json({ message: "Apartment number already exists" });
        const newApartment = new apartment({ number, type: type || "Căn hộ chung cư", totalArea, household: null });
        await newApartment.save();
        res.status(201).json({ message: "Success", apartment: newApartment });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

//[POST] apartments/api/v1/edit
module.exports.editApartment = async (req, res) => {
    try {
        const { id, number, type, totalArea } = req.body;
        if (!id) return res.status(400).json({ message: "Missing id" });
        const found = await apartment.findById(id);
        if (!found) return res.status(404).json({ message: "Not Found" });
        if (number !== undefined) {
            const conflict = await apartment.findOne({ number, _id: { $ne: id } });
            if (conflict) return res.status(400).json({ message: "Apartment number already exists" });
            found.number = number;
        }
        if (type !== undefined) found.type = type;
        if (totalArea !== undefined) found.totalArea = totalArea;
        await found.save();
        res.status(200).json({ message: "Success", apartment: found });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

//[POST] apartments/api/v1/delete
module.exports.deleteApartment = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) return res.status(400).json({ message: "Missing id" });
        const found = await apartment.findById(id);
        if (!found) return res.status(404).json({ message: "Not Found" });
        if (found.household) return res.status(400).json({ message: "Apartment is occupied" });
        await apartment.deleteOne({ _id: id });
        res.status(200).json({ message: "Delete complete" });
    } catch (error) {
        res.status(500).json({ message: "Server Error" });
    }
};

//[GET] apartments/api/v1/apartment
module.exports.index = async (req,res) => {
    try {
        const find = {};
        if (req.query.id){
            find.id = req.query.id;
        }
        //Search
        let objectSearch = searchHelper(req.query);
        if (req.query.keyword) {
            find.number = objectSearch.regex;
        }
        //End Search
        const apartments = await apartment.find(find);
        if (!apartments){
            return res.status(404).json({message: "Not Found"});
        } else {
            res.json(apartments);
        }
    } catch (error) {
        res.status(500).json({ message:"Server Error" });
    }
};

module.exports.getRemain = async (req, res) => {
    try {
        // filter=available → chỉ căn hộ chưa có hộ (dùng khi đăng ký chủ hộ mới)
        // filter=occupied  → chỉ căn hộ đã có hộ (dùng khi thêm thành viên)
        // không có filter  → tất cả (backward compat)
        const query = {};
        if (req.query.filter === 'available') query.household = null;
        else if (req.query.filter === 'occupied') query.household = { $ne: null };

        const apartments = await apartment.find(query);
        const json = apartments.map(apt => ({
            household_id: apt.household,
            floor: (apt.number / 100).toFixed(0),
            number: apt.number
        }));

        res.status(200).json(json);
    } catch (error) {
        res.status(500).json({ message:"Server Error" });
    }
}