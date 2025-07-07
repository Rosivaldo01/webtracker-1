import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, database } from "../../firebase";
import { ref, push, onValue, update, remove } from "firebase/database"; // Adicionado 'remove'
import DOMPurify from 'dompurify';

function Dashboard() {
  const navigate = useNavigate();

  // Estados dos campos do formulário
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [propriedade, setPropriedade] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [equipamento, setEquipamento] = useState("");

  // Registros do usuário
  const [registros, setRegistros] = useState([]);

  // Estados para edição
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // Estado para armazenar UID do usuário autenticado
  const [userId, setUserId] = useState(null);

  // Monitorar autenticação do usuário
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        navigate("/login"); // redireciona se não autenticado
      }
    });
    return () => unsubscribe();
  }, [navigate]);

  // Carregar registros do usuário autenticado
  useEffect(() => {
    if (!userId) return;

    const registrosRef = ref(database, `registros/${userId}`);
    const unsubscribe = onValue(registrosRef, (snapshot) => {
      const data = snapshot.val();
      const lista = [];
      for (let id in data) {
        lista.push({ id, ...data[id] });
      }
      setRegistros(lista);
    });

    return () => unsubscribe();
  }, [userId]);

  // Adicionar novo registro
  const adicionarRegistro = () => {
    if (nome && matricula && propriedade && tarefa && equipamento) {
      // Sanitizar cada campo
      const safeNome = DOMPurify.sanitize(nome);
      const safeMatricula = DOMPurify.sanitize(matricula);
      const safePropriedade = DOMPurify.sanitize(propriedade);
      const safeTarefa = DOMPurify.sanitize(tarefa);
      const safeEquipamento = DOMPurify.sanitize(equipamento);

      push(ref(database, `registros/${userId}`), {
        nome: safeNome,
        matricula: safeMatricula,
        propriedade: safePropriedade,
        tarefa: safeTarefa,
        equipamento: safeEquipamento,
      });

      setNome("");
      setMatricula("");
      setPropriedade("");
      setTarefa("");
      setEquipamento("");
    } else {
      alert("Preencha todos os campos!");
    }
  };

  // Iniciar edição de registro
  const iniciarEdicao = (registro) => {
    setEditId(registro.id);
    setEditValues({
      nome: registro.nome,
      matricula: registro.matricula,
      propriedade: registro.propriedade,
      tarefa: registro.tarefa,
      equipamento: registro.equipamento,
    });
  };

  // Salvar edição do registro
  const salvarEdicao = (id) => {
    const safeEditValues = {
      nome: DOMPurify.sanitize(editValues.nome),
      matricula: DOMPurify.sanitize(editValues.matricula),
      propriedade: DOMPurify.sanitize(editValues.propriedade),
      tarefa: DOMPurify.sanitize(editValues.tarefa),
      equipamento: DOMPurify.sanitize(editValues.equipamento),
    };

    const registroRef = ref(database, `registros/${userId}/${id}`);
    update(registroRef, safeEditValues);
    setEditId(null);
    setEditValues({});
  };

  // --- Função para EXCLUIR registro ---
  const excluirRegistro = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      const registroRef = ref(database, `registros/${userId}/${id}`);
      remove(registroRef);
      // O onValue no useEffect já vai atualizar a lista de registros automaticamente
    }
  };
  // --- Fim da Função para EXCLUIR registro ---

  // Logout
  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!userId) {
    return <p>Carregando...</p>; // ou um spinner
  }

  return (
    <div style={{ maxWidth: "1024px", margin: "2rem auto", textAlign: "center" }}>
      <h1>Registro de Tarefas</h1>
      

      <div style={{ margin: "2rem 0", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            adicionarRegistro();
          }}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
            backgroundColor: "#f9f9f9",
            padding: "1.5rem",
            borderRadius: "8px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {[
            { label: "Colaborador", placeholder: "Nome do colaborador", value: nome, setter: setNome },
            { label: "Matrícula", placeholder: "Número da matrícula", value: matricula, setter: setMatricula },
            { label: "Propriedade", placeholder: "Propriedade", value: propriedade, setter: setPropriedade },
            { label: "Tarefa", placeholder: "Tarefa", value: tarefa, setter: setTarefa },
            { label: "Equipamento", placeholder: "Equipamento", value: equipamento, setter: setEquipamento },
          ].map(({ label, placeholder, value, setter }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
              <label
                htmlFor={label.toLowerCase()}
                style={{ marginBottom: "0.3rem", fontWeight: "600", color: "#34495e" }}
              >
                {label}:
              </label>
              <input
                id={label.toLowerCase()}
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => setter(e.target.value)}
                style={{
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                  fontSize: "1rem",
                  transition: "border-color 0.3s",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#27ae60")}
                onBlur={(e) => (e.target.style.borderColor = "#ccc")}
                required
              />
            </div>
          ))}

          <button
            type="submit"
            style={{
              padding: "12px",
              backgroundColor: "rgb(13, 80, 39)",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              fontWeight: "700",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#219150")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "rgb(13, 80, 39)")}
          >
            Registrar
          </button>
        </form>
      </div>

      <div style={{ textAlign: "left" }}>
        {registros.length === 0 ? (
          <p style={{ textAlign: "center", color: "gray" }}>Nenhum tarefa encontrado.</p>
        ) : (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {registros.map((registro) => (
              <li
                key={registro.id}
                style={{
                  borderBottom: "1px solid #ccc",
                  padding: "15px 0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                }}
              >
                {editId === registro.id ? (
                  <div style={{ flex: 1 }}>
                    <input
                      value={editValues.nome}
                      onChange={(e) => setEditValues({ ...editValues, nome: e.target.value })}
                      style={{ padding: "5px", margin: "0 5px", width: "150px" }}
                    />
                    <input
                      value={editValues.matricula}
                      onChange={(e) => setEditValues({ ...editValues, matricula: e.target.value })}
                      style={{ padding: "5px", margin: "0 5px", width: "150px" }}
                    />
                    <input
                      value={editValues.propriedade}
                      onChange={(e) => setEditValues({ ...editValues, propriedade: e.target.value })}
                      style={{ padding: "5px", margin: "0 5px", width: "150px" }}
                    />
                    <input
                      value={editValues.tarefa}
                      onChange={(e) => setEditValues({ ...editValues, tarefa: e.target.value })}
                      style={{ padding: "5px", margin: "0 5px", width: "150px" }}
                    />
                    <input
                      value={editValues.equipamento}
                      onChange={(e) => setEditValues({ ...editValues, equipamento: e.target.value })}
                      style={{ padding: "5px", margin: "0 5px", width: "150px" }}
                    />
                    <button
                      onClick={() => salvarEdicao(registro.id)}
                      style={{
                        background: "darkgreen",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        marginLeft: "5px",
                      }}
                    >
                      Salvar
                    </button>
                  </div>
                ) : (
                  <div style={{ flex: 1 }}>
                    <strong>Colaborador:</strong> {registro.nome} <br />
                    <strong>Matrícula:</strong> {registro.matricula} <br />
                    <strong>Propriedade:</strong> {registro.propriedade} <br />
                    <strong>Tarefa:</strong> {registro.tarefa} <br />
                    <strong>Equipamento:</strong> {registro.equipamento}
                  </div>
                )}

                {editId !== registro.id && (
                  <div style={{ display: "flex", gap: "10px" }}>
                    <button
                      onClick={() => iniciarEdicao(registro)}
                      style={{
                        background: "darkgreen",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        height: "fit-content",
                      }}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => excluirRegistro(registro.id)} // Chama a função de exclusão
                      style={{
                        background: "darkred",
                        color: "#fff",
                        border: "none",
                        borderRadius: "5px",
                        padding: "6px 10px",
                        cursor: "pointer",
                        height: "fit-content",
                      }}
                    >
                      Excluir
                    </button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={handleLogout}
        style={{
          padding: "0.7rem 1.5rem",
          background: "rgb(13, 80, 39)",
          color: "#fff",
          border: "none",
          borderRadius: "8px",
          fontSize: "15px",
          fontWeight: "bold",
          cursor: "pointer",
          marginTop: "2rem",
        }}
      >
        Sair
      </button>
    </div>
  );
}

export default Dashboard;
