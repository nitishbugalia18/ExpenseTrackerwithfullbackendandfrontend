const express = require("express");
const Income = require("../models/Income");
const Expense = require("../models/Expense");
const { protect } = require("../middleware/auth");

const router = express.Router();
router.use(protect);

// GET /api/dashboard/overview
router.get("/overview", async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // Monthly totals
    const [monthlyIncomes, monthlyExpenses] = await Promise.all([
      Income.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
      Expense.find({ userId, date: { $gte: startOfMonth, $lte: endOfMonth } }),
    ]);

    const monthlyIncome  = monthlyIncomes.reduce((s, i) => s + i.amount, 0);
    const monthlyExpense = monthlyExpenses.reduce((s, e) => s + e.amount, 0);
    const savings        = monthlyIncome - monthlyExpense;
    const savingsRate    = monthlyIncome > 0 ? Math.round((savings / monthlyIncome) * 100) : 0;

    // Expense distribution by category (this month)
    const categoryMap = {};
    monthlyExpenses.forEach((e) => {
      categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
    });
    const expenseDistribution = Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount: Math.round(amount),
    }));

    // Recent transactions (last 10, mixed income + expense)
    const [recentIncome, recentExpense] = await Promise.all([
      Income.find({ userId }).sort({ date: -1 }).limit(10),
      Expense.find({ userId }).sort({ date: -1 }).limit(10),
    ]);

    const recentTransactions = [...recentIncome, ...recentExpense]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);

    res.json({
      success: true,
      data: {
        monthlyIncome,
        monthlyExpense,
        savings,
        savingsRate,
        expenseDistribution,
        recentTransactions,
      },
    });
  } catch (err) {
    console.error("Dashboard overview error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch dashboard data" });
  }
});

module.exports = router;
