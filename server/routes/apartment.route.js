const express = require("express");
const router = express.Router();
const controller = require("../controllers/apartment.controller.js");

router.get("/api/v1/apartments", controller.index);
router.get("/api/v1/detail", controller.getDetail);
router.get("/api/v1/remains", controller.getRemain);
router.post("/api/v1/create", controller.createApartment);
router.post("/api/v1/edit", controller.editApartment);
router.post("/api/v1/delete", controller.deleteApartment);

module.exports = router;