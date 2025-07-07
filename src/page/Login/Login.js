import { useState, useEffect } from 'react';
import Input from '../../components/Input/input';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../../firebase";

function Login() {
  const [form, setForm] = useState({ email: '', senha: '' });
  const navigate = useNavigate();

  useEffect(() => {
    // desloga automaticamente ao abrir a tela de login
    signOut(auth);
  }, []);
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, form.email, form.senha);
      console.log("Login bem-sucedido");

      // não salva mais no localStorage
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro ao fazer login:", error.code, error.message);
      alert("Erro ao fazer login: " + error.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1 style={{fontFamily:'sans-serif'}}>Acesso do Usuário</h1><br />
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
        <button type="submit" style={{
          padding: '0.7rem',
          width: '100%',
          background: 'rgb(13, 80, 39)',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          fontSize: '15px',
          fontWeight: 'bold',
          pointerEvents:'auto'
        }}>
          Entrar
        </button>
        <p style={{ textAlign: 'left', margin: '2rem' }}>
          Não tem cadastro:
          <Link to='/cadastro'style={{textDecoration: 'none'}} > Clique aqui.</Link>
        </p>

      </form>

    </div>
  );
}

export default Login;
