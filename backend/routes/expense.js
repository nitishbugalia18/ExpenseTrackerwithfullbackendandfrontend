const express = require("express");
const ExcelJS = require("exceljs");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/auth");
const { getDateRange } = require("../utils/dateFilter");

const router = express.Router();

// All routes require auth
router.use(protect);

// GET /api/expense/get
router.get("/get", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch expenses" });
  }
});

// POST /api/expense/add
router.post("/add", async (req, res) => {
  try {
    const { description, amount, category, date } = req.body;
    if (!description || !amount || !category || !date) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const expense = await Expense.create({
      description,
      amount: Number(amount),
      category,
      date: new Date(date),
      userId: req.user._id,
    });

    res.status(201).json(expense);
  } catch (err) {
    console.error("Add expense error:", err);
    res.status(500).json({ message: "Failed to add expense" });
  }
});

// PUT /api/expense/update/:id
router.put("/update/:id", async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });

    const { description, amount, category, date } = req.body;
    if (description) expense.description = description;
    if (amount)      expense.amount      = Number(amount);
    if (category)    expense.category    = category;
    if (date)        expense.date        = new Date(date);

    await expense.save();
    res.json(expense);
  } catch (err) {
    res.status(500).json({ message: "Failed to update expense" });
  }
});

// DELETE /api/expense/delete/:id
router.delete("/delete/:id", async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) return res.status(404).json({ message: "Expense not found" });
    res.json({ message: "Expense deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete expense" });
  }
});

// GET /api/expense/overview?range=monthly|weekly|daily|yearly
router.get("/overview", async (req, res) => {
  try {
    const range = req.query.range || "monthly";
    const { start, end } = getDateRange(range);

    const expenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });

    const totalExpense = expenses.reduce((acc, e) => acc + e.amount, 0);
    const averageExpense = expenses.length > 0 ? totalExpense / expenses.length : 0;
    const numberOfTransactions = expenses.length;

    res.json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
        numberOfTransactions,
        recentTransactions: expenses.slice(0, 5),
        range,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch expense overview" });
  }
});

// GET /api/expense/downloadexcel
router.get("/downloadexcel", async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Expenses");

    sheet.columns = [
      { header: "Date",        key: "date",        width: 15 },
      { header: "Description", key: "description", width: 30 },
      { header: "Category",    key: "category",    width: 15 },
      { header: "Amount ($)",  key: "amount",      width: 15 },
    ];

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = {
      type: "pattern", pattern: "solid",
      fgColor: { argb: "FFFF9800" },
    };

    expenses.forEach((e) => {
      sheet.addRow({
        date:        new Date(e.date).toLocaleDateString(),
        description: e.description,
        category:    e.category,
        amount:      e.amount,
      });
    });

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", 'attachment; filename="expense_details.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error("Excel export error:", err);
    res.status(500).json({ message: "Failed to export expenses" });
  }
});

module.exports = router;
