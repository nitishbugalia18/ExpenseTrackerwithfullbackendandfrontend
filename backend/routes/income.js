const express = require("express");
const ExcelJS = require("exceljs");
const Income = require("../models/Income");
const { protect } = require("../middleware/auth");
const { getDateRange } = require("../utils/dateFilter");

const router = express.Router();

// All routes require auth
router.use(protect);

// GET /api/income/get  — fetch all incomes for the user
router.get("/get", async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch incomes" });
  }
});

// POST /api/income/add
router.post("/add", async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const income = await Income.create({
      description,
      amount: Number(amount),
      category,
      date: new Date(date),
      userId: req.user._id,
    });

    res.status(201).json(income);
  } catch (err) {
    console.error("Add income error:", err);
    res.status(500).json({ message: "Failed to add income" });
  }
});

// PUT /api/income/update/:id
router.put("/update/:id", async (req, res) => {
  try {
    const income = await Income.findOne({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ message: "Income not found" });

    const { description, amount, category, date } = req.body;
    if (description) income.description = description;
    if (amount)      income.amount      = Number(amount);
    if (category)    income.category    = category;
    if (date)        income.date        = new Date(date);

    await income.save();
    res.json(income);
  } catch (err) {
    res.status(500).json({ message: "Failed to update income" });
  }
});

// DELETE /api/income/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!income) return res.status(404).json({ message: "Income not found" });
    res.json({ message: "Income deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete income" });
  }
});

// GET /api/income/overview?range=monthly|weekly|daily|yearly
router.get("/overview", async (req, res) => {
  try {
    const range = req.query.range || "monthly";
    const { start, end } = getDateRange(range);

    const incomes = await Income.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, i) => acc + i.amount, 0);
    const averageIncome = incomes.length > 0 ? totalIncome / incomes.length : 0;
    const numberOfTransactions = incomes.length;

    res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions: incomes.slice(0, 5),
        range,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch income overview" });
  }
});

// GET /api/income/downloadexcel
router.get("/downloadexcel", async (req, res) => {
  try {
    const incomes = await Income.find({ userId: req.user._id }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Income");

    sheet.columns = [
      { header: "Date",        key: "date",        width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Category",    key: "category",    width: 15 },
      { header: "Amount ($)",  key: "amount",      width: 15 },
    ];

    // Style header row
    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb: "FF10B981" },
    };

    incomes.forEach((i) => {
      sheet.addRow({
        date:        new Date(i.date).toLocaleDateString(),
        description: i.description,
        category:    i.category,
        amount:      i.amount,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="income_details.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).json({ message: "Failed to export income" });
  }
});

module.exports = router;
