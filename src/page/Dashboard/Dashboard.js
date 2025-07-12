
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ref, push, update, remove } from "firebase/database";
import DOMPurify from "dompurify";
import { database } from "../../firebase";

import Header from "../../components/Header";
import "./Dashboard.css";

import useAuth from "./hooks/useAuth";
import useRegistros from "./hooks/useRegistros";
import RegistroForm from "./RegistroForm";
import RegistroLista from "./RegistroLista";
import {
  validarLetrasEspacos,
  validarAlnumEspacos,
  validarNumeros,
  matriculaExiste,
} from "./validators";

function Dashboard() {
  const navigate = useNavigate();
  const { userId, userName } = useAuth(navigate);
  const registros = useRegistros(userId);

  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [propriedade, setPropriedade] = useState("");
  const [tarefa, setTarefa] = useState("");
  const [equipamento, setEquipamento] = useState("");

  const [editId, setEditId] = useState(null);
  const [editValues, setEditValues] = useState({});

  // 🔍 Campo de pesquisa
  const [searchTerm, setSearchTerm] = useState("");
  const registrosFiltrados = registros.filter((reg) => {
    const term = searchTerm.toLowerCase();
    return (
        reg.nome.toLowerCase().includes(term) ||
        reg.matricula.toLowerCase().includes(term)
    );
  });

  if (!userId) return <p>Carregando...</p>;

  const inputs = [
    { label: "Colaborador", placeholder: "Nome do colaborador", value: nome, setter: setNome, max: 50 },
    { label: "Matrícula", placeholder: "Número da matrícula", value: matricula, setter: setMatricula },
    { label: "Propriedade", placeholder: "Propriedade", value: propriedade, setter: setPropriedade, max: 50 },
    { label: "Tarefa", placeholder: "Tarefa", value: tarefa, setter: setTarefa, max: 100 },
    { label: "Equipamento", placeholder: "Equipamento", value: equipamento, setter: setEquipamento, max: 50 },
  ];

  const adicionarRegistro = () => {
    if (!nome || !matricula || !propriedade || !tarefa || !equipamento) {
      alert("Preencha todos os campos!");
      return;
    }

    if (matriculaExiste(matricula, registros)) {
      alert("Esta matrícula já existe! Não é possível cadastrar novamente.");
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

    if (matriculaExiste(editValues.matricula, registros, id)) {
      alert("Esta matrícula já existe! Não é possível cadastrar novamente.");
      return;
    }

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

  const cancelarEdicao = () => {
    if (
        window.confirm(
            "Tem certeza que deseja cancelar a edição? As alterações não serão salvas."
        )
    ) {
      setEditId(null);
      setEditValues({});
    }
  };

  return (
      <>
        <Header />
        <main className="dashboard-content">
          <h1 className="page-title">Registro de Tarefas</h1>

          <RegistroForm inputs={inputs} onSubmit={adicionarRegistro} />

          <div className="search-wrapper">
            <label htmlFor="search" className="search-label">
              Pesquisa por colaborador ou matrícula
            </label>
            <div className="search-input-wrapper">
              <input
                  id="search"
                  className="search-input"
                  type="text"
                  placeholder="Digite colaborador ou cmatrícula..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon" aria-hidden="true">🔍</span>
            </div>
          </div>

          <div className="records-container">
            <RegistroLista
                registros={registrosFiltrados}
                editId={editId}
                editValues={editValues}
                setEditValues={setEditValues}
                iniciarEdicao={iniciarEdicao}
                salvarEdicao={salvarEdicao}
                cancelarEdicao={cancelarEdicao}
                excluirRegistro={excluirRegistro}
            />
          </div>
        </main>
      </>
  );
}

export default Dashboard;
