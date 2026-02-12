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
  const [filtroDataHistorico, setFiltroDataHistorico] = useState(new Date().toISOString().split('T')[0]);

  const SENHAS_EQUIPE = {
    "Diogo": "diogoasas",
    "Pedro": "pedroasas",
    "João": "joaoasas",
    "Sidney": "sidneyasas",
    "Thales": "thalesasas",
    "Carlos": "carlosasas"
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

  useEffect(() => {
    carregarLeads();
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (senhaInserida === SENHAS_EQUIPE[corretorLogado]) {
      setLogado(true);
      setSenhaInserida("");
    } else {
      alert(`Senha incorreta para ${corretorLogado}!`);
      setSenhaInserida("");
    }
  };

  const formatarData = (dataISO) => {
    if (!dataISO) return "---";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const mesAtual = new Date().getMonth();
  const leadsMesAtual = leads.filter(
    (l) => new Date(l.created_at).getMonth() === mesAtual
  );

  const totalContatosGeral = leadsMesAtual.reduce((acc, curr) => acc + (Number(curr.tentativa_atual) || 0), 0);
  const totalReunioesGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_reunioes || 0), 0);
  const totalVisitasGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_visitas || 0), 0);

  const meusLeads = leads.filter((l) => l.corretor_nome === corretorLogado);
  
  const leadsFiltrados = meusLeads.filter((l) => {
    if (filtroTurno === "manha") return l.tentativa_atual <= 3;
    if (filtroTurno === "tarde") return l.tentativa_atual > 3;
    return true;
  });

  const historicoDoDia = meusLeads.filter((l) => {
    const dataReferencia = l.updated_at || l.created_at; 
    if (!dataReferencia) return false;
    return dataReferencia.startsWith(filtroDataHistorico);
  });

  async function registrarInteracao(lead) {
    const status = window.prompt(`Último registro: ${lead.resultado_ultimo || "Nenhum"}\n\nNovo status:`);
    if (!status) return;
    const tipo = window.prompt("Gerou algo?\n1 - Apenas Contato\n2 - Reunião Agendada\n3 - Visita Agendada");
    
    let updateData = { 
      tentativa_atual: (Number(lead.tentativa_atual) || 0) + 1, 
      resultado_ultimo: status, 
      corretor_nome: corretorLogado,
      updated_at: new Date().toISOString() 
    };

    if (tipo === "2") updateData.total_reunioes = (lead.total_reunioes || 0) + 1;
    if (tipo === "3") updateData.total_visitas = (lead.total_visitas || 0) + 1;
    
    await supabase.from("leads").update(updateData).eq("id", lead.id);
    carregarLeads();
  }

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", gap: "2rem", padding: "1.2rem 2.5rem", borderBottom: "1px solid #d4af37", backgroundColor: "#0f172a", alignItems: "center" }}>
        <img src="/logo.png" alt="ASAS" style={{ height: "60px" }} />
        <button onClick={() => setAbaAtiva("dashboard")} style={{ background: "none", border: "none", color: abaAtiva === "dashboard" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📊 DASHBOARD</button>
        <button onClick={() => setAbaAtiva("atendimento")} style={{ background: "none", border: "none", color: abaAtiva === "atendimento" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📞 MEU FLUXO</button>
        <button onClick={() => setAbaAtiva("playbook")} style={{ background: "none", border: "none", color: abaAtiva === "playbook" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📖 PLAYBOOK</button>
        
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          {logado ? (
            <>
              <span style={{ color: "#d4af37", marginRight: "10px", fontSize: "0.9rem" }}>Olá, <strong>{corretorLogado}</strong></span>
              <button onClick={() => { setLogado(false); setAbaAtiva("dashboard"); }} style={{ background: "#ef4444", border: "none", color: "white", padding: "5px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}>SAIR</button>
            </>
          ) : (
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Modo Visualização</span>
          )}
        </div>
      </nav>

      <div style={{ padding: "2.5rem" }}>
        {/* DASHBOARD SEMPRE VISÍVEL */}
        {abaAtiva === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #1e293b" }}>
              <h3 style={{ color: "#d4af37", marginBottom: "2rem" }}>Performance Mensal</h3>
              {equipe.map((nome) => {
                const filtrados = leadsMesAtual.filter((l) => l.corretor_nome === nome);
                const contatos = filtrados.reduce((acc, curr) => acc + (Number(curr.tentativa_atual) || 0), 0);
                const progresso = Math.min((contatos / META_LIGACOES) * 100, 100);
                return (
                  <div key={nome} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>{nome}</span>
                      <span style={{ color: "#94a3b8" }}>📞 {contatos}</span>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "#020617", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ width: `${progresso}%`, height: "100%", background: "linear-gradient(90deg, #d4af37, #fde047)" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TELA DE LOGIN (Aparece se tentar acessar abas protegidas sem estar logado) */}
        {(abaAtiva === "atendimento" || abaAtiva === "playbook") && !logado && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "3rem", borderRadius: "1.5rem", border: "1px solid #d4af37", textAlign: "center", width: "100%", maxWidth: "400px" }}>
              <h2 style={{ color: "#d4af37", marginBottom: "0.5rem" }}>Área Restrita</h2>
              <p style={{ color: "#94a3b8", marginBottom: "1.5rem" }}>Faça login para acessar seu fluxo de trabalho.</p>
              <form onSubmit={handleLogin}>
                <select value={corretorLogado} onChange={(e) => setCorretorLogado(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#d4af37", marginBottom: "1rem" }}>
                  {equipe.map((nome) => ( <option key={nome} value={nome}>{nome}</option> ))}
                </select>
                <input type="password" placeholder="Sua senha" value={senhaInserida} onChange={(e) => setSenhaInserida(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "1.5rem", textAlign: "center" }} />
                <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "linear-gradient(45deg, #d4af37, #b8860b)", color: "black", fontWeight: "bold", cursor: "pointer", border: "none" }}>ACESSAR AGORA</button>
              </form>
            </div>
          </div>
        )}

        {/* MEU FLUXO (Apenas Logado) */}
        {abaAtiva === "atendimento" && logado && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem" }}>
            <div>
               <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
                  <button onClick={() => setFiltroTurno("todos")} style={{ backgroundColor: filtroTurno === "todos" ? "#d4af37" : "#1e293b", color: filtroTurno === "todos" ? "black" : "white", padding: "10px 15px", borderRadius: "8px", border: "none", cursor: "pointer" }}>Ver Todos</button>
               </div>
               <div style={{ backgroundColor: "#0f172a", borderRadius: "1.2rem", border: "1px solid #1e293b", padding: "1rem" }}>
                  <h4 style={{ color: "#d4af37", padding: "0 1rem" }}>Leads para Atendimento</h4>
                  {leadsFiltrados.map((lead) => (
                    <div key={lead.id} style={{ padding: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
                      <div>
                        <strong>{lead.nome_cliente}</strong><br/>
                        <small style={{ color: "#94a3b8" }}>{lead.telefone}</small>
                      </div>
                      <button onClick={() => registrarInteracao(lead)} style={{ backgroundColor: "#d4af37", color: "black", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>REGISTRAR</button>
                    </div>
                  ))}
               </div>
               {/* HISTÓRICO */}
               <div style={{ marginTop: "2rem", backgroundColor: "#0f172a", borderRadius: "1.2rem", border: "1px solid #1e293b", padding: "2rem" }}>
                  <h3 style={{ color: "#d4af37" }}>📅 Histórico de Registros</h3>
                  <input type="date" value={filtroDataHistorico} onChange={(e) => setFiltroDataHistorico(e.target.value)} style={{ background: "#020617", color: "white", border: "1px solid #d4af37", padding: "5px", borderRadius: "5px", marginBottom: "1rem" }} />
                  <table style={{ width: "100%" }}>
                    <tbody>
                      {historicoDoDia.map(h => (
                        <tr key={h.id} style={{ borderBottom: "1px solid #1e293b" }}>
                          <td style={{ padding: "10px" }}>{h.nome_cliente}</td>
                          <td style={{ padding: "10px" }}>{h.resultado_ultimo}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
            {/* Importação */}
            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #1e293b" }}>
              <h3 style={{ color: "#d4af37" }}>Importar Novos Leads</h3>
              <textarea value={textoCopiado} onChange={(e) => setTextoCopiado(e.target.value)} style={{ width: "100%", height: "200px", background: "#020617", color: "white", padding: "1rem", borderRadius: "12px" }} placeholder="Nome e Telefone..."/>
              <button onClick={async () => { /* lógica de importação */ }} style={{ width: "100%", marginTop: "1rem", background: "#d4af37", padding: "1rem", borderRadius: "12px", border: "none", fontWeight: "bold" }}>DECOLAR</button>
            </div>
          </div>
        )}

        {/* PLAYBOOK (Apenas Logado) */}
        {abaAtiva === "playbook" && logado && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "2rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #d4af37" }}>
              <h3 style={{ color: "#d4af37" }}>🚀 Início</h3>
              <p>"Oi [Nome], te liguei porque tenho um imóvel..."</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
