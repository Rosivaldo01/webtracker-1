import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../../firebase";
import './style.css';

function Header() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Observa mudanças de login/logout
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    // Cleanup ao desmontar
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
            <span>{user.displayName || "Usuário"}</span>
            <Link to="#" onClick={handleLogout}>Sair da conta</Link>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/cadastro">Cadastro</Link>
          </>
        )}
      </nav>
    </header>
  );
}

export default Header;
