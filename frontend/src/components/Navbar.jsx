import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, User, LogOut } from "lucide-react";
import { navbarStyles as styles } from "../assets/dummyStyles";

const Navbar = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = (user?.name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout?.();
  };

  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <div className={styles.logoContainer} onClick={() => navigate("/")}>
          <span className={styles.logoText}>ExpenseTracker</span>
        </div>

        <div className={styles.userContainer} ref={menuRef}>
          <button
            className={styles.userButton}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div className="relative">
              <div className={styles.userAvatar}>{initials}</div>
              <span className={styles.statusIndicator}></span>
            </div>
            <div className={styles.userTextContainer}>
              <p className={styles.userName}>{user?.name || "User"}</p>
              <p className={styles.userEmail}>{user?.email || ""}</p>
            </div>
            <ChevronDown className={styles.chevronIcon(menuOpen)} />
          </button>

          {menuOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownHeader}>
                <div className="flex items-center gap-3">
                  <div className={styles.dropdownAvatar}>{initials}</div>
                  <div>
                    <p className={styles.dropdownName}>{user?.name || "User"}</p>
                    <p className={styles.dropdownEmail}>{user?.email || ""}</p>
                  </div>
                </div>
              </div>

              <div className={styles.menuItemContainer}>
                <button
                  className={styles.menuItem}
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/profile");
                  }}
                >
                  <User size={16} />
                  Profile
                </button>
              </div>

              <div className={styles.menuItemBorder}>
                <button className={styles.logoutButton} onClick={handleLogout}>
                  <LogOut size={16} />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
