import { db } from "../config/firebase.js";

const productsRef = db.collection("products");

// ➕ Add Product (YouTube + TikTok)
export const addProduct = async (req, res) => {
  try {
    const { name, description, price, youtubeId, tiktokUrl } = req.body;

    // Basic validation
    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    // At least one video must be included
    if (!youtubeId && !tiktokUrl) {
      return res.status(400).json({
        message: "Please provide either a YouTube ID or TikTok URL",
      });
    }

    const newProduct = {
      name,
      description: description || "",
      price,
      youtubeId: youtubeId || null,
      tiktokUrl: tiktokUrl || null,
      createdAt: new Date(),
    };

    const doc = await productsRef.add(newProduct);

    res.status(201).json({ id: doc.id, ...newProduct });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 📦 Get All Products
export const getProducts = async (req, res) => {
  try {
    const snapshot = await productsRef.orderBy("createdAt", "desc").get();
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🗑 Delete Product
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    await productsRef.doc(id).delete();

    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
