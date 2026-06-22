import { X } from "lucide-react";
import { modalStyles } from "../assets/dummyStyles";

const AddTransactionModal = ({
  showModal,
  setShowModal,
  newTransaction,
  setNewTransaction,
  handleAddTransaction,
  loading = false,
  type = "both",
  title = "Add New Transaction",
  buttonText = "Add Transaction",
  categories = ["Food", "Housing", "Transport", "Shopping", "Entertainment", "Utilities", "Healthcare", "Salary", "Freelance", "Investments", "Bonus", "Other"],
  color = "teal",
}) => {
  if (!showModal) return null;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentDate = today.toISOString().split("T")[0];
  const minDate = `${currentYear}-01-01`;

  const colorClass = modalStyles.colorClasses[color];

  const handleSubmit = (e) => {
    e.preventDefault();
    handleAddTransaction();
  };

  return (
    <div className={modalStyles.overlay}>
      <div className={modalStyles.modalContainer}>
        <div className={modalStyles.modalHeader}>
          <h3 className={modalStyles.modalTitle}>{title}</h3>
          <button onClick={() => setShowModal(false)} className={modalStyles.closeButton}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={modalStyles.form}>
          {type === "both" && (
            <div>
              <label className={modalStyles.label}>Type</label>
              <div className={modalStyles.typeButtonContainer}>
                <button
                  type="button"
                  className={modalStyles.typeButton(
                    newTransaction.type === "income",
                    modalStyles.colorClasses.teal.typeButtonSelected
                  )}
                  onClick={() => setNewTransaction((prev) => ({ ...prev, type: "income" }))}
                >
                  Income
                </button>
                <button
                  type="button"
                  className={modalStyles.typeButton(
                    newTransaction.type === "expense",
                    modalStyles.colorClasses.orange.typeButtonSelected
                  )}
                  onClick={() => setNewTransaction((prev) => ({ ...prev, type: "expense" }))}
                >
                  Expense
                </button>
              </div>
            </div>
          )}

          <div>
            <label className={modalStyles.label}>Description</label>
            <input
              type="text"
              value={newTransaction.description}
              onChange={(e) =>
                setNewTransaction((prev) => ({ ...prev, description: e.target.value }))
              }
              className={modalStyles.input(colorClass.ring)}
              placeholder="e.g. Grocery shopping"
              required
            />
          </div>

          <div>
            <label className={modalStyles.label}>Amount ($)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={newTransaction.amount}
              onChange={(e) =>
                setNewTransaction((prev) => ({ ...prev, amount: e.target.value }))
              }
              className={modalStyles.input(colorClass.ring)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className={modalStyles.label}>Category</label>
            <select
              value={newTransaction.category}
              onChange={(e) =>
                setNewTransaction((prev) => ({ ...prev, category: e.target.value }))
              }
              className={modalStyles.input(colorClass.ring)}
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className={modalStyles.label}>Date</label>
            <input
              type="date"
              value={newTransaction.date}
              max={currentDate}
              min={minDate}
              onChange={(e) =>
                setNewTransaction((prev) => ({ ...prev, date: e.target.value }))
              }
              className={modalStyles.input(colorClass.ring)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={modalStyles.submitButton(colorClass.button)}
          >
            {loading ? "Processing..." : buttonText}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTransactionModal;
