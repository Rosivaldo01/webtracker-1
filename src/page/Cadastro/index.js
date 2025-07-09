import { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signOut } from "firebase/auth";
import { auth } from "../../firebase";
import Input from '../../components/Input/input';
import { useNavigate, Link } from "react-router-dom";
import DOMPurify from 'dompurify';
import './cadastro.css';

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

    const nomeSanitizado = DOMPurify.sanitize(form.nome.trim());
    const nomeSemEspacos = nomeSanitizado.replace(/\s/g, '');
    const nomeRegex = /^[A-Za-zÀ-ÿ0-9\s]+$/;

    if (!nomeSanitizado || nomeSemEspacos.length < 3 || nomeSanitizado.length > 60 || !nomeRegex.test(nomeSanitizado)) {
      setError("Informe o nome da companhia com pelo menos 3 letras ou números e no máximo 60 caracteres.");
      return;
    }

    if (!form.email || !form.senha) {
      setError("Preencha todos os campos!");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, form.email, form.senha);
      await updateProfile(auth.currentUser, {
        displayName: nomeSanitizado
      });
      await signOut(auth);
      alert("Cadastro realizado com sucesso.");
      navigate("/login");
    } catch (err) {
      console.error("Erro ao cadastrar:", err.code, err.message);
      if (err.code === "auth/weak-password") {
        setError("A senha deve conter pelo menos 6 caracteres.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("Este email já está em uso. Tente fazer login ou usar outro email.");
      } else {
        setError("Erro ao cadastrar: " + err.message);
      }
    }
  };

  return (
    <div className="cadastro-container">
      <h1>Cadastro do usuário</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Nome"
          type="text"
          name="nome"
          value={form.nome}
          onChange={handleChange}
          placeholder="Digite o nome da companhia"
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
        <button type="submit">
          Cadastrar
        </button>
        <p>
          Já possui cadastro?
          <Link to="/login"> Acesse seu login</Link>
        </p>
      </form>
    </div>
  );
}

export default Cadastro;
