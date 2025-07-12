// src/pages/Dashboard/RegistroLista.jsx
import React from "react";

export default function RegistroLista({
                                          registros,
                                          editId,
                                          editValues,
                                          setEditValues,
                                          iniciarEdicao,
                                          salvarEdicao,
                                          cancelarEdicao,
                                          excluirRegistro,
                                      }) {
    return (
        <>
            {registros.length === 0 ? (
                <p className="empty-msg">Nenhuma tarefa encontrada.</p>
            ) : (
                <ul className="records-list">
                    {registros.map((registro) => (
                        <li key={registro.id} className="record-item">
                            {editId === registro.id ? (
                                <div style={{ flex: 1 }}>
                                    {Object.keys(editValues).map((key, index) => (
                                        <div
                                            key={index}
                                            style={{ display: "inline-block", marginRight: "10px" }}
                                        >
                                            <label
                                                className="edit-label"
                                                htmlFor={`edit-${key}-${editId}`}
                                                style={{ fontSize: "0.8rem", marginLeft: 9 }}
                                            >
                                                {key.charAt(0).toUpperCase() + key.slice(1)}:
                                            </label>
                                            <input
                                                id={`edit-${key}-${editId}`}
                                                className="edit-input"
                                                value={editValues[key]}
                                                onChange={(e) =>
                                                    setEditValues({ ...editValues, [key]: e.target.value })
                                                }
                                                maxLength={
                                                    key === "nome"
                                                        ? 50
                                                        : key === "matricula"
                                                            ? undefined
                                                            : key === "propriedade"
                                                                ? 50
                                                                : key === "tarefa"
                                                                    ? 100
                                                                    : 50
                                                }
                                                style={{ padding: "5px", width: "150px" }}
                                            />
                                        </div>
                                    ))}
                                    <div className="actions" style={{ marginTop: "10px" }}>
                                        <button onClick={() => salvarEdicao(registro.id)} className="save-btn">
                                            Salvar
                                        </button>
                                        <button onClick={cancelarEdicao} className="cancel-btn">
                                            Cancelar
                                        </button>
                                    </div>
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
                                <div className="actions">
                                    <button onClick={() => iniciarEdicao(registro)} className="edit-btn">
                                        Editar
                                    </button>
                                    <button onClick={() => excluirRegistro(registro.id)} className="delete-btn">
                                        Excluir
                                    </button>
                                </div>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </>
    );
}
