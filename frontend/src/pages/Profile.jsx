import { useState, useCallback, memo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Modal from "react-modal";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Eye, EyeOff, X, Mail, Calendar, Shield, Edit2 } from "lucide-react";
import { profileStyles } from "../assets/dummyStyles";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";

Modal.setAppElement("#root");

// Move PasswordInput component outside of ProfilePage to prevent recreation on every render
const PasswordInput = memo(({ name, label, value, error, showField, onToggle, onChange, disabled }) => (
  <div>
    <label className={profileStyles.passwordLabel}>{label}</label>
    <div className={profileStyles.passwordContainer}>
      <input
        type={showField ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        className={`${profileStyles.inputWithError} ${
          error ? "border-red-300" : "border-gray-200"
        }`}
        placeholder={`Enter ${label.toLowerCase()}`}
        disabled={disabled}
        key={`password-input-${name}`}
      />
      <button
        type="button"
        onClick={onToggle}
        className={profileStyles.passwordToggle}
        disabled={disabled}
      >
        {showField ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
      </button>
    </div>
    {error && <p className={profileStyles.errorText}>{error}</p>}
  </div>
));

PasswordInput.displayName = "PasswordInput";

const ProfilePage = ({ user: authUser, onLogout }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    name: authUser?.name || "",
    email: authUser?.email || "",
    joinDate: authUser?.joinDate || authUser?.createdAt || "",
  });
  const [editMode, setEditMode] = useState(false);
  const [tempUser, setTempUser] = useState({ ...user });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, []);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setTempUser((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
    setPasswordErrors((prev) => ({ ...prev, [name]: "" }));
  }, []);

  const togglePasswordVisibility = useCallback((field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }));
  }, []);

  const validatePassword = useCallback(() => {
    const errors = {};
    if (!passwordData.current) errors.current = "Current password is required";
    if (!passwordData.new) {
      errors.new = "New password is required";
    } else if (passwordData.new.length < 8) {
      errors.new = "Password must be at least 8 characters";
    }
    if (passwordData.new !== passwordData.confirm) {
      errors.confirm = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  }, [passwordData]);

  const handleEditToggle = () => {
    setTempUser({ ...user });
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    setTempUser({ ...user });
    setEditMode(false);
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const res = await axios.put(
        `${API_BASE}/auth/profile`,
        { name: tempUser.name, email: tempUser.email },
        { headers: getAuthHeaders() }
      );
      setUser((prev) => ({ ...prev, ...res.data }));
      setEditMode(false);
      toast.success("Profile updated successfully");
    } catch (err) {
      console.error("Profile update error:", err);
      toast.error(err?.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const closePasswordModal = () => {
    setShowPasswordModal(false);
    setPasswordData({ current: "", new: "", confirm: "" });
    setPasswordErrors({});
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;

    try {
      setLoading(true);
      await axios.put(
        `${API_BASE}/auth/change-password`,
        passwordData,
        { headers: getAuthHeaders() }
      );
      toast.success("Password updated successfully");
      closePasswordModal();
    } catch (err) {
      console.error("Password change error:", err);
      const msg = err?.response?.data?.message || "Failed to update password";
      setPasswordErrors({ current: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleLogoutClick = () => {
    onLogout?.();
    navigate("/login");
  };

  const initials = (user.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={profileStyles.container}>
      <div className={profileStyles.mainContainer}>
        <div className={profileStyles.header}>
          <div className={profileStyles.avatar}>
            <span className="text-3xl font-bold text-white">{initials}</span>
          </div>
          <h2 className={profileStyles.userName}>{user.name}</h2>
          <p className={profileStyles.userEmail}>{user.email}</p>
        </div>

        <div className={profileStyles.content}>
          <div className={profileStyles.grid}>
            <div className={profileStyles.card}>
              <div className="flex items-center justify-between">
                <h3 className={profileStyles.cardTitle}>
                  <Mail className={profileStyles.icon} />
                  Account Details
                </h3>
                {!editMode && (
                  <button onClick={handleEditToggle} className={profileStyles.editButton}>
                    <Edit2 className="w-4 h-4 inline mr-1" />
                    Edit
                  </button>
                )}
              </div>

              <div className="space-y-4 mt-3">
                <div>
                  <label className={profileStyles.label}>Full Name</label>
                  {editMode ? (
                    <input
                      type="text"
                      name="name"
                      value={tempUser.name}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-800">{user.name}</p>
                  )}
                </div>

                <div>
                  <label className={profileStyles.label}>Email</label>
                  {editMode ? (
                    <input
                      type="email"
                      name="email"
                      value={tempUser.email}
                      onChange={handleInputChange}
                      className={profileStyles.input}
                      disabled={loading}
                    />
                  ) : (
                    <p className="text-gray-800">{user.email}</p>
                  )}
                </div>

                {editMode && (
                  <div className="flex gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className={profileStyles.buttonPrimary}
                      disabled={loading}
                    >
                      {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className={profileStyles.buttonSecondary}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className={profileStyles.card}>
              <h3 className={profileStyles.cardTitle}>
                <Shield className={profileStyles.icon} />
                Security
              </h3>

              <div className="space-y-4 mt-3">
                <div className={profileStyles.securityItem}>
                  <div>
                    <p className="font-medium text-gray-800">Password</p>
                    <p className={profileStyles.securityText}>Last changed: unknown</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className={profileStyles.changeButton}
                  >
                    Change
                  </button>
                </div>

                <div className={profileStyles.securityItem}>
                  <div>
                    <p className="font-medium text-gray-800 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> Member Since
                    </p>
                  </div>
                  <p className={profileStyles.securityText}>
                    {user.joinDate ? new Date(user.joinDate).toLocaleDateString() : "—"}
                  </p>
                </div>

                <button
                  onClick={handleLogoutClick}
                  className="w-full mt-2 py-2.5 border border-red-200 text-red-600 rounded-xl font-medium hover:bg-red-50"
                >
                  Log Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={2000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Modal
        isOpen={showPasswordModal}
        onRequestClose={closePasswordModal}
        contentLabel="Change Password"
        className="modal"
        overlayClassName="modal-overlay"
        shouldCloseOnOverlayClick={!loading}
        shouldCloseOnEsc={!loading}
      >
        <div className={profileStyles.modalContent}>
          <div className={profileStyles.modalHeader}>
            <h3 className={profileStyles.modalTitle}>Change Password</h3>
            <button
              onClick={closePasswordModal}
              className="text-gray-500 hover:text-gray-800 disabled:opacity-50"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4 lg:-mx-20">
            <PasswordInput
              name="current"
              label="Current Password"
              value={passwordData.current}
              error={passwordErrors.current}
              showField={showPassword.current}
              onToggle={() => togglePasswordVisibility("current")}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <PasswordInput
              name="new"
              label="New Password"
              value={passwordData.new}
              error={passwordErrors.new}
              showField={showPassword.new}
              onToggle={() => togglePasswordVisibility("new")}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <PasswordInput
              name="confirm"
              label="Confirm New Password"
              value={passwordData.confirm}
              error={passwordErrors.confirm}
              showField={showPassword.confirm}
              onToggle={() => togglePasswordVisibility("confirm")}
              onChange={handlePasswordChange}
              disabled={loading}
            />

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                className={profileStyles.buttonPrimary}
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={closePasswordModal}
                className={profileStyles.buttonSecondary}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
