import { useState } from 'react';
import Input from '../../components/Input/input';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";
import DOMPurify from 'dompurify';
import "./login.css"

function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailSanitizado = DOMPurify.sanitize(form.email.trim());
    const senhaLimpa = form.senha.trim();

    if (!emailSanitizado || !senhaLimpa) {
      setError("Preencha o email e a senha.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, emailSanitizado, senhaLimpa);
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error.code, error.message);
      if (error.code === "auth/user-not-found") {
        setError("Usuário não encontrado. Verifique seu email ou faça o cadastro.");
      } else if (error.code === "auth/wrong-password") {
        setError("Senha incorreta. Tente novamente.");
      } else if (error.code === "auth/invalid-email") {
        setError("Email inválido. Verifique o formato.");
      } else if (error.code === "auth/invalid-credential") {
        setError("Credenciais inválidas. Por favor, verifique seu email e senha.");
      } else {
        setError("Erro ao fazer login: " + error.message);
      }
    }
  };

  return (
    <div className="login-container">
      <h1>Acesso do Usuário</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Digite seu email"
        />
        <Input
          label="Senha"
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          placeholder="Digite sua senha"
        />
        <button type="submit">
          Entrar
        </button>
        <p>
          Não tem cadastro:
          <Link to='/cadastro'> Clique aqui.</Link>
        </p>
        <p style={{ marginTop: '1rem', fontSize: '14px' }}>
          Esqueceu sua senha?{' '}
          <Link to="/reset-senha" style={{ fontWeight: 'bold', color: 'rgb(13, 80, 39)' }}>
            Clique aqui
          </Link>
        </p>

      </form>
    </div>
  );
}

export default Login;
