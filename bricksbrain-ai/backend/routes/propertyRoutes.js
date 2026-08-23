const express = require("express");
const router = express.Router();
const {
  getProperties, getFeatured, getPropertyById, createProperty, updateProperty,
  deleteProperty, toggleSaveProperty, compareProperties, getRecommendations,
  predictPrice, forecastPrice, calculateEMI,
} = require("../controllers/propertyController");
const { protect, adminOnly } = require("../middleware/auth");

router.get("/featured", getFeatured);
router.get("/recommendations", protect, getRecommendations);
router.post("/predict-price", predictPrice);
router.post("/forecast", forecastPrice);
router.post("/emi", calculateEMI);
router.post("/compare", compareProperties);

router.get("/", getProperties);
router.post("/", protect, adminOnly, createProperty);
router.get("/:id", getPropertyById);
router.put("/:id", protect, adminOnly, updateProperty);
router.delete("/:id", protect, adminOnly, deleteProperty);
router.post("/:id/save", protect, toggleSaveProperty);

module.exports = router;
