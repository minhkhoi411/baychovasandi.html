
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

const PORT = process.env.PORT || 3000;

const AIRTABLE_TOKEN = process.env.AIRTABLE_TOKEN;
const BASE_ID = process.env.AIRTABLE_BASE_ID;
const TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

// Kiểm tra cấu hình
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Backend FPT SMART DEVICES đang hoạt động"
  });
});

// Lấy sản phẩm từ Airtable
app.get("/api/products", async (req, res) => {
  try {
    if (!AIRTABLE_TOKEN || !BASE_ID || !TABLE_NAME) {
      return res.status(500).json({
        success: false,
        message: "Thiếu cấu hình Airtable trong file .env"
      });
    }

    const url =
      `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE_NAME)}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${AIRTABLE_TOKEN}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        success: false,
        error: data.error || data
      });
    }

    res.json({
      success: true,
      products: data.records.map(record => ({
        id: record.id,
        ...record.fields
      }))
    });

  } catch (error) {
    console.error("Airtable error:", error);

    res.status(500).json({
      success: false,
      message: "Không thể kết nối Airtable"
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});

