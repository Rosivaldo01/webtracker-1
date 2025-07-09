import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import './style.css';

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
    <header>
      <h1>Web Tracker</h1>
      <nav>
        {user ? (
          <>
            <span>👤 {user.displayName || "Usuário"}</span>
            <Link to="#" onClick={handleLogout}>🚪 Sair da conta</Link>
          </>
        ) : (
          <>
            {location.pathname === "/login" && (
              <Link to="/cadastro">✍️ Cadastro</Link>
            )}
            {location.pathname === "/cadastro" && (
              <Link to="/login">🔑 Login</Link>
            )}
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
