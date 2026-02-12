"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SistemaAsas() {
  const [logado, setLogado] = useState(false);
  const [senhaInserida, setSenhaInserida] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [corretorLogado, setCorretorLogado] = useState("Diogo");
  const [leads, setLeads] = useState([]);
  const [textoCopiado, setTextoCopiado] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("todos");

  // 🔥 NOVOS STATES
  const [historico, setHistorico] = useState([]);
  const [filtroData, setFiltroData] = useState("");

  const SENHAS_EQUIPE = {
    Diogo: "diogoasas",
    Pedro: "pedroasas",
    João: "joaoasas",
    Sidney: "sidneyasas",
    Thales: "thalesasas",
    Carlos: "carlosasas",
  };

  const equipe = Object.keys(SENHAS_EQUIPE);
  const META_LIGACOES = 400;

  async function carregarLeads() {
    const { data } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (data) setLeads(data);
  }

  async function carregarHistorico() {
    const { data } = await supabase
      .from("interacoes")
      .select("*")
      .eq("corretor_nome", corretorLogado)
      .order("created_at", { ascending: false });

    if (data) setHistorico(data);
  }

  useEffect(() => {
    carregarLeads();
  }, []);

  useEffect(() => {
    if (logado) carregarHistorico();
  }, [logado]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (senhaInserida === SENHAS_EQUIPE[corretorLogado]) {
      setLogado(true);
      setSenhaInserida("");
    } else {
      alert("Senha incorreta!");
      setSenhaInserida("");
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "";
    return new Date(dataISO).toLocaleDateString("pt-BR");
  };

  const meusLeads = leads.filter(
    (l) => l.corretor_nome === corretorLogado
  );

  const leadsFiltrados = meusLeads.filter((l) => {
    if (filtroTurno === "manha") return l.tentativa_atual <= 3;
    if (filtroTurno === "tarde") return l.tentativa_atual > 3;
    return true;
  });

  async function registrarInteracao(lead) {
    const status = window.prompt("Novo status:");
    if (!status) return;

    const tipoEscolhido = window.prompt(
      "1 - Contato\n2 - Reunião\n3 - Visita"
    );

    let tipoTexto = "Contato";
    if (tipoEscolhido === "2") tipoTexto = "Reunião";
    if (tipoEscolhido === "3") tipoTexto = "Visita";

    let updateData = {
      tentativa_atual: (lead.tentativa_atual || 0) + 1,
      resultado_ultimo: status,
    };

    if (tipoEscolhido === "2")
      updateData.total_reunioes =
        (lead.total_reunioes || 0) + 1;

    if (tipoEscolhido === "3")
      updateData.total_visitas =
        (lead.total_visitas || 0) + 1;

    await supabase
      .from("leads")
      .update(updateData)
      .eq("id", lead.id);

    // 🔥 SALVA NO HISTÓRICO
    await supabase.from("interacoes").insert([
      {
        lead_id: lead.id,
        corretor_nome: corretorLogado,
        status: status,
        tipo: tipoTexto,
      },
    ]);

    carregarLeads();
    carregarHistorico();
  }

  const historicoFiltrado = historico.filter((item) => {
    if (!filtroData) return true;
    return (
      new Date(item.created_at)
        .toISOString()
        .split("T")[0] === filtroData
    );
  });

  return (
    <div
      style={{
        backgroundColor: "#020617",
        minHeight: "100vh",
        color: "white",
        padding: "2rem",
        fontFamily: "sans-serif",
      }}
    >
      <h2 style={{ color: "#d4af37" }}>
        Sistema ASAS
      </h2>

      {!logado && (
        <form onSubmit={handleLogin}>
          <select
            value={corretorLogado}
            onChange={(e) =>
              setCorretorLogado(e.target.value)
            }
          >
            {equipe.map((nome) => (
              <option key={nome}>{nome}</option>
            ))}
          </select>

          <input
            type="password"
            value={senhaInserida}
            onChange={(e) =>
              setSenhaInserida(e.target.value)
            }
            placeholder="Senha"
          />

          <button type="submit">Entrar</button>
        </form>
      )}

      {logado && (
        <>
          <h3>📞 Meu Fluxo</h3>

          {leadsFiltrados.map((lead) => (
            <div
              key={lead.id}
              style={{
                border: "1px solid #1e293b",
                padding: "1rem",
                marginBottom: "1rem",
                borderRadius: "10px",
              }}
            >
              <strong>{lead.nome_cliente}</strong>
              <br />
              Tentativas: {lead.tentativa_atual}
              <br />
              <button
                onClick={() =>
                  registrarInteracao(lead)
                }
              >
                Registrar
              </button>
            </div>
          ))}

          {/* 🔥 HISTÓRICO */}
          <div
            style={{
              marginTop: "3rem",
              padding: "1.5rem",
              background: "#0f172a",
              borderRadius: "1rem",
            }}
          >
            <h3 style={{ color: "#d4af37" }}>
              📊 Histórico de Interações
            </h3>

            <input
              type="date"
              value={filtroData}
              onChange={(e) =>
                setFiltroData(e.target.value)
              }
              style={{ marginBottom: "1rem" }}
            />

            {historicoFiltrado.map((item) => (
              <div
                key={item.id}
                style={{
                  borderBottom:
                    "1px solid #1e293b",
                  padding: "8px 0",
                }}
              >
                <strong>{item.tipo}</strong> —{" "}
                {item.status}
                <br />
                <small>
                  {new Date(
                    item.created_at
                  ).toLocaleString("pt-BR")}
                </small>
              </div>
            ))}

            <div
              style={{
                marginTop: "1rem",
                fontWeight: "bold",
                color: "#10b981",
              }}
            >
              Total no dia:{" "}
              {filtroData
                ? historicoFiltrado.length
                : 0}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
