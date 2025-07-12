import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import "./style.css"; // CSS separado para organizar

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Deseja realmente sair da sua conta?");
    if (confirmLogout) {
      await signOut(auth);
      navigate("/login");
    }
  };

  return (
    <header className="header-fixed">
      <div className="header-left">Web Tracker</div>
      <nav className="header-right">
        {user ? (
          <>
            <span className="user-name">👤 {user.displayName || "Usuário"}</span>
            <button className="logout-btn" onClick={handleLogout}>
              🚪 Sair
            </button>
          </>
        ) : (
          <>
            {location.pathname === "/login" && (
              <Link to="/cadastro" className="nav-link">
                ✍️ Cadastro
              </Link>
            )}
            {location.pathname === "/cadastro" && (
              <Link to="/login" className="nav-link">
                🔑 Login
              </Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
