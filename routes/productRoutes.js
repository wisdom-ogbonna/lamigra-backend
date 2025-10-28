import express from "express";
import {
  addProduct,
  getProducts,
  deleteProduct,
} from "../controllers/productController.js";

const router = express.Router();

router.post("/add", addProduct);
router.get("/", getProducts);
router.delete("/:id", deleteProduct);

export default router;
