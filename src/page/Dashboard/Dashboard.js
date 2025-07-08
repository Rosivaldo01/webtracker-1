import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, database } from "../../firebase";
import { ref, push, onValue, update, remove } from "firebase/database";
import DOMPurify from "dompurify";

function Dashboard() {
  const navigate = useNavigate();

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
    const unsubscribe = auth.onAuthStateChanged((user) => {
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

  const regexLetrasEspacos = /^[\p{L} ]+$/u;
  const regexAlnumEspacos = /^[\p{L}\d ]+$/u;
  const regexNumeros = /^\d+$/;

  const temLetra = /\p{L}/u;
  const temLetraOuNumero = /[\p{L}\d]/u;

  function validarLetrasEspacos(campo, nomeCampo) {
    if (!regexLetrasEspacos.test(campo) || !temLetra.test(campo)) {
      alert(`${nomeCampo} inválido! Use apenas letras e espaços, e pelo menos uma letra.`);
      return false;
    }
    if (campo.trim().length < 3) {
      alert(`${nomeCampo} deve ter pelo menos 3 caracteres.`);
      return false;
    }
    return true;
  }

  function validarAlnumEspacos(campo, nomeCampo) {
    if (!regexAlnumEspacos.test(campo) || !temLetraOuNumero.test(campo)) {
      alert(`${nomeCampo} inválido! Use letras, números e espaços, com pelo menos um caractere válido.`);
      return false;
    }
    if (campo.trim().length < 3) {
      alert(`${nomeCampo} deve ter pelo menos 3 caracteres.`);
      return false;
    }
    return true;
  }

  function validarNumeros(campo, nomeCampo) {
    if (!regexNumeros.test(campo)) {
      alert(`${nomeCampo} inválido! Use apenas números.`);
      return false;
    }
    if (campo.trim().length < 3) {
      alert(`${nomeCampo} deve ter pelo menos 3 caracteres.`);
      return false;
    }
    if (campo.length > 20) {
      alert(`${nomeCampo} não pode ter mais que 20 caracteres.`);
      return false;
    }
    return true;
  }

  const adicionarRegistro = () => {
    if (!nome || !matricula || !propriedade || !tarefa || !equipamento) {
      alert("Preencha todos os campos!");
      return;
    }

    if (!validarLetrasEspacos(nome, "Colaborador")) return;
    if (!validarNumeros(matricula, "Matrícula")) return;
    if (!validarLetrasEspacos(propriedade, "Propriedade")) return;
    if (!validarAlnumEspacos(tarefa, "Tarefa")) return;
    if (!validarAlnumEspacos(equipamento, "Equipamento")) return;

    if (
      nome.length > 50 ||
      propriedade.length > 50 ||
      tarefa.length > 100 ||
      equipamento.length > 50
    ) {
      alert("Um dos campos excedeu o tamanho permitido.");
      return;
    }

    const safeData = {
      nome: DOMPurify.sanitize(nome),
      matricula: DOMPurify.sanitize(matricula),
      propriedade: DOMPurify.sanitize(propriedade),
      tarefa: DOMPurify.sanitize(tarefa),
      equipamento: DOMPurify.sanitize(equipamento),
    };

    push(ref(database, `registros/${userId}`), safeData);

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
    if (!validarLetrasEspacos(editValues.nome, "Colaborador")) return;
    if (!validarNumeros(editValues.matricula, "Matrícula")) return;
    if (!validarLetrasEspacos(editValues.propriedade, "Propriedade")) return;
    if (!validarAlnumEspacos(editValues.tarefa, "Tarefa")) return;
    if (!validarAlnumEspacos(editValues.equipamento, "Equipamento")) return;

    if (
      editValues.nome.length > 50 ||
      editValues.propriedade.length > 50 ||
      editValues.tarefa.length > 100 ||
      editValues.equipamento.length > 50
    ) {
      alert("Um dos campos excedeu o tamanho permitido.");
      return;
    }
    if (editValues.matricula.length > 20) {
      alert("A matrícula não pode ter mais que 20 caracteres.");
      return;
    }

    const safeEditValues = {
      nome: DOMPurify.sanitize(editValues.nome),
      matricula: DOMPurify.sanitize(editValues.matricula),
      propriedade: DOMPurify.sanitize(editValues.propriedade),
      tarefa: DOMPurify.sanitize(editValues.tarefa),
      equipamento: DOMPurify.sanitize(editValues.equipamento),
    };

    update(ref(database, `registros/${userId}/${id}`), safeEditValues);
    setEditId(null);
    setEditValues({});
  };

  const excluirRegistro = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      remove(ref(database, `registros/${userId}/${id}`));
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (!userId) return <p>Carregando...</p>;

  const inputs = [
    {
      label: "Colaborador",
      placeholder: "Nome do colaborador",
      value: nome,
      setter: setNome,
      max: 50,
    },
    {
      label: "Matrícula",
      placeholder: "Número da matrícula",
      value: matricula,
      setter: setMatricula,
      // sem maxLength aqui para liberar digitação
    },
    {
      label: "Propriedade",
      placeholder: "Propriedade",
      value: propriedade,
      setter: setPropriedade,
      max: 50,
    },
    {
      label: "Tarefa",
      placeholder: "Tarefa",
      value: tarefa,
      setter: setTarefa,
      max: 100,
    },
    {
      label: "Equipamento",
      placeholder: "Equipamento",
      value: equipamento,
      setter: setEquipamento,
      max: 50,
    },
  ];

  return (
    <div style={{ maxWidth: "1024px", margin: "2rem auto", textAlign: "center" }}>
      <h1>Registro de Tarefas</h1>

      <div
        style={{
          margin: "2rem 0",
          maxWidth: 600,
          marginLeft: "auto",
          marginRight: "auto",
        }}
      >
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
          {inputs.map(({ label, placeholder, value, setter, max }) => (
            <div
              key={label}
              style={{ display: "flex", flexDirection: "column", textAlign: "left" }}
            >
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
                maxLength={max}
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
                {...(label === "Matrícula" ? { maxLength: undefined } : {})}
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
                    {Object.keys(editValues).map((key, index) => (
                      <input
                        key={index}
                        value={editValues[key]}
                        onChange={(e) =>
                          setEditValues({ ...editValues, [key]: e.target.value })
                        }
                        maxLength={
                          key === "nome"
                            ? 50
                            : key === "matricula"
                            ? undefined // sem limite aqui
                            : key === "propriedade"
                            ? 50
                            : key === "tarefa"
                            ? 100
                            : 50
                        }
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
