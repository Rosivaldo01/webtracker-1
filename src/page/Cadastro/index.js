import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Input from '../../components/Input/input';
import { useNavigate, Link } from "react-router-dom";

function Cadastro() {
  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: ''
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.senha || !form.nome) {
      setError("Preencha todos os campos!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, form.email, form.senha);
      await updateProfile(auth.currentUser, {
        displayName: form.nome
      });
      await signOut(auth);
      //console.log("Usuário cadastrado e perfil atualizado!");
      alert("Cadastro realizado com sucesso.")
      navigate("/login");
    } catch (err) {
      console.error("Erro ao cadastrar:", err.message);
      setError(err.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto' }}>
      <h1>Cadastro</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Digite seu nome"
          autoComplete="name"
        />
        <Input
          label="Email"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Digite seu email"
          autoComplete="email"
        />
        <Input
          label="Senha"
          type="password"
          name="senha"
          value={form.senha}
          onChange={handleChange}
          placeholder="Digite sua senha"
          autoComplete="current-password"
        />
        <button type="submit" style={{
          padding: '0.7rem',
          width: '100%',
          background: 'rgb(13, 80, 39)',
          color: '#fff',
          border: 'none',
          fontSize: '15px',
          fontWeight: 'bold',
          borderRadius: '8px'
        }}>
          Cadastrar
        </button>
        <p style={{ textAlign: 'left', margin: '2rem' }}>
          Já possui cadastro?
          <Link to="/login" style={{textDecoration: 'none'}}> Acesse seu login</Link>
        </p>
      </form>
    </div>
  );
}

export default Cadastro;
