import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, database } from "../../firebase";
import { ref, push, onValue, update, remove } from "firebase/database";
import DOMPurify from 'dompurify';

function Dashboard() {
  const navigate = useNavigate();

  const hasEmoji = (str) => {
    return /([\u2700-\u27BF]|[\uE000-\uF8FF]|[\uD83C-\uDBFF\uDC00-\uDFFF])/.test(str);
  };

  const isInvalid = (value) => {
    const trimmed = value.trim();
    return (
      trimmed === "" ||
      /^"+$/.test(trimmed) || // apenas aspas duplas
      /^'+$/.test(trimmed) || // apenas aspas simples
      hasEmoji(trimmed)
    );
  };

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [propriedade, setPropriedade] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [equipamento, setEquipamento] = useState("");
  const [registros, setRegistros] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId(null);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [navigate]);

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

  const adicionarRegistro = () => {
    if (
      isInvalid(nome) ||
      isInvalid(matricula) ||
      isInvalid(propriedade) ||
      isInvalid(tarefa) ||
      isInvalid(equipamento)
    ) {
      alert("Opps!!! Não é permitido compo vazio, apenas com espaços, aspas ou emoje! Corriga por gentileza.");
      return;
    }

    if (
      nome.trim().length > 50 ||
      matricula.trim().length > 20 ||
      propriedade.trim().length > 50 ||
      tarefa.trim().length > 100 ||
      equipamento.trim().length > 50
    ) {
      alert("Um dos campos excedeu o tamanho máximo permitido.");
      return;
    }

    const safeNome = DOMPurify.sanitize(nome.trim());
    const safeMatricula = DOMPurify.sanitize(matricula.trim());
    const safePropriedade = DOMPurify.sanitize(propriedade.trim());
    const safeTarefa = DOMPurify.sanitize(tarefa.trim());
    const safeEquipamento = DOMPurify.sanitize(equipamento.trim());

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
  };

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

  const salvarEdicao = (id) => {
    if (
      isInvalid(editValues.nome) ||
      isInvalid(editValues.matricula) ||
      isInvalid(editValues.propriedade) ||
      isInvalid(editValues.tarefa) ||
      isInvalid(editValues.equipamento)
    ) {
      alert("Preencha todos os campos corretamente (não pode estar vazio, só com espaços, só aspas ou conter emojis).");
      return;
    }

    if (
      editValues.nome.trim().length > 50 ||
      editValues.matricula.trim().length > 20 ||
      editValues.propriedade.trim().length > 50 ||
      editValues.tarefa.trim().length > 100 ||
      editValues.equipamento.trim().length > 50
    ) {
      alert("Um dos campos excedeu o tamanho máximo permitido.");
      return;
    }

    const safeEditValues = {
      nome: DOMPurify.sanitize(editValues.nome.trim()),
      matricula: DOMPurify.sanitize(editValues.matricula.trim()),
      propriedade: DOMPurify.sanitize(editValues.propriedade.trim()),
      tarefa: DOMPurify.sanitize(editValues.tarefa.trim()),
      equipamento: DOMPurify.sanitize(editValues.equipamento.trim()),
    };

    const registroRef = ref(database, `registros/${userId}/${id}`);
    update(registroRef, safeEditValues);
    setEditId(null);
    setEditValues({});
  };

  const excluirRegistro = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      const registroRef = ref(database, `registros/${userId}/${id}`);
      remove(registroRef);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!userId) {
    return <p>Carregando...</p>;
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
          <p style={{ textAlign: "center", color: "gray" }}>Nenhuma tarefa encontrada.</p>
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
                    {["nome", "matricula", "propriedade", "tarefa", "equipamento"].map((field) => (
                      <input
                        key={field}
                        value={editValues[field]}
                        onChange={(e) => setEditValues({ ...editValues, [field]: e.target.value })}
                        style={{ padding: "5px", margin: "0 5px", width: "150px" }}
                      />
                    ))}
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
                      onClick={() => excluirRegistro(registro.id)}
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
