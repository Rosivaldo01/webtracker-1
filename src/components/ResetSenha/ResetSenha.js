import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";
import Input from '../../components/Input/input';
import { Link } from "react-router-dom";
import DOMPurify from 'dompurify';
import './resetSenha.css';
auth.languageCode = "pt-BR";


function ResetSenha() {
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensagem("");
    setErro("");

    // Sanitizar email
    const emailSanitizado = DOMPurify.sanitize(email.trim());

    if (!emailSanitizado) {
      setErro("Por favor, insira seu email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, emailSanitizado);
      setMensagem("Email de redefinição enviado! Verifique sua caixa de entrada.");
      setEmail(""); // 👈 LIMPA O INPUT AQUI
    } catch (error) {
      console.error(error);
      if (error.code === "auth/user-not-found") {
        setErro("Usuário não encontrado com esse email.");
      } else if (error.code === "auth/invalid-email") {
        setErro("Email inválido. Verifique o formato.");
      } else {
        setErro("Erro ao enviar email: " + error.message);
      }
    }
  };

  return (
    <div className="reset-container">
      <h1>Redefinir Senha</h1>
      {erro && <p className="error">{erro}</p>}
      {mensagem && <p className="mensagem">{mensagem}</p>}
      <form onSubmit={handleSubmit}>
        <Input
          label="Email"
          type="email"
          name="email"
          value={email}
          onChange={handleChange}
          placeholder="Digite seu email"
          autoComplete="email"
        />
        <button type="submit">Redefinir</button>
      </form>
      <p>
        <Link to="/login">Voltar ao login</Link>
      </p>
    </div>
  );
}

export default ResetSenha;
