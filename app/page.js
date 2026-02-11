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

  const SENHAS_EQUIPE = {
    "Diogo": "asas2026",
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

  const trocarAba = (novaAba) => {
    if (novaAba === "dashboard") {
      setAbaAtiva(novaAba);
    } else if (!logado) {
      // Se não estiver logado, mantém a aba como "login" temporariamente
      setAbaAtiva(novaAba); 
    } else {
      setAbaAtiva(novaAba);
    }
  };

  // Cálculos do Dashboard
  const mesAtual = new Date().getMonth();
  const leadsMesAtual = leads.filter((l) => new Date(l.created_at).getMonth() === mesAtual);
  const totalReunioesGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_reunioes || 0), 0);
  const totalVisitasGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_visitas || 0), 0);
  const totalContatosGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.tentativa_atual || 0), 0);

  // Lógica de Atendimento
  const meusLeads = leads.filter((l) => l.corretor_nome === corretorLogado);
  const leadsFiltrados = meusLeads.filter((l) => {
    if (filtroTurno === "manha") return l.tentativa_atual <= 3;
    if (filtroTurno === "tarde") return l.tentativa_atual > 3;
    return true;
  });

  async function registrarInteracao(lead) {
    const status = window.prompt(`Novo status para ${lead.nome_cliente}:`);
    if (!status) return;
    const tipo = window.prompt("1-Contato | 2-Reunião | 3-Visita");
    let updateData = { tentativa_atual: (lead.tentativa_atual || 0) + 1, resultado_ultimo: status, corretor_nome: corretorLogado };
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
        <button onClick={() => trocarAba("atendimento")} style={{ background: "none", border: "none", color: abaAtiva === "atendimento" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📞 MEU FLUXO</button>
        <button onClick={() => trocarAba("playbook")} style={{ background: "none", border: "none", color: abaAtiva === "playbook" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📖 PLAYBOOK</button>
        
        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
          {logado ? (
            <>
              <span style={{ color: "#d4af37", marginRight: "10px" }}>Corretor: <strong>{corretorLogado}</strong></span>
              <button onClick={() => { setLogado(false); setAbaAtiva("dashboard"); }} style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>SAIR</button>
            </>
          ) : (
            <span style={{ color: "#64748b", fontSize: "0.8rem" }}>Modo Visualização</span>
          )}
        </div>
      </nav>

      <div style={{ padding: "2.5rem" }}>
        {/* ABA DASHBOARD - SEMPRE VISÍVEL */}
        {abaAtiva === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #1e293b" }}>
              <h3 style={{ color: "#d4af37", marginBottom: "2rem" }}>Performance Mensal</h3>
              {equipe.map((nome) => {
                const filtrados = leadsMesAtual.filter((l) => l.corretor_nome === nome);
                const contatos = filtrados.reduce((acc, curr) => acc + (curr.tentativa_atual || 0), 0);
                const reunioes = filtrados.reduce((acc, curr) => acc + (curr.total_reunioes || 0), 0);
                const visitas = filtrados.reduce((acc, curr) => acc + (curr.total_visitas || 0), 0);
                const progresso = Math.min((contatos / META_LIGACOES) * 100, 100);
                return (
                  <div key={nome} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", paddingBottom: "1rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span>{nome} {progresso >= 100 && "🏆"}</span>
                      <div style={{ display: "flex", gap: "15px", fontSize: "0.85rem" }}>
                        <span style={{ color: "#94a3b8" }}>📞 {contatos}</span>
                        <span style={{ color: "#60a5fa" }}>🤝 {reunioes}</span>
                        <span style={{ color: "#10b981" }}>🚗 {visitas}</span>
                      </div>
                    </div>
                    <div style={{ width: "100%", height: "8px", backgroundColor: "#020617", borderRadius: "10px", overflow: "hidden" }}>
                      <div style={{ width: `${progresso}%`, height: "100%", background: "linear-gradient(90deg, #d4af37, #fde047)" }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #d4af37", textAlign: "center" }}>
              <h3 style={{ color: "#d4af37", marginBottom: "2rem" }}>Funil Geral</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
                <div><small>LIGAÇÕES</small><div style={{ fontSize: "1.5rem" }}>{totalContatosGeral}</div></div>
                <div><small>REUNIÕES</small><div style={{ fontSize: "1.5rem", color: "#60a5fa" }}>{totalReunioesGeral}</div></div>
                <div><small>VISITAS</small><div style={{ fontSize: "1.5rem", color: "#10b981" }}>{totalVisitasGeral}</div></div>
              </div>
            </div>
          </div>
        )}

        {/* TELA DE LOGIN PARA ABAS PRIVADAS */}
        {(abaAtiva === "atendimento" || abaAtiva === "playbook") && !logado && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "3rem", borderRadius: "1.5rem", border: "1px solid #d4af37", textAlign: "center", width: "400px" }}>
              <h2 style={{ color: "#d4af37" }}>Acesso ao Perfil</h2>
              <form onSubmit={handleLogin}>
                <select value={corretorLogado} onChange={(e) => setCorretorLogado(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#020617", color: "#d4af37", marginBottom: "1rem" }}>
                  {equipe.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
                <input type="password" placeholder="Sua Senha" value={senhaInserida} onChange={(e) => setSenhaInserida(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#020617", color: "white", marginBottom: "1rem" }} />
                <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "#d4af37", color: "black", fontWeight: "bold", border: "none", cursor: "pointer" }}>ENTRAR</button>
              </form>
            </div>
          </div>
        )}

        {/* ABA ATENDIMENTO - PRIVADA */}
        {abaAtiva === "atendimento" && logado && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem" }}>
             {/* ... (Todo o seu código original de Atendimento e Importação aqui) ... */}
             <div style={{ backgroundColor: "#0f172a", padding: "1rem", borderRadius: "1rem" }}>
                <h3>Lista de {corretorLogado}</h3>
                {leadsFiltrados.map(l => (
                  <div key={l.id} style={{ padding: "1rem", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
                    <div>{l.nome_cliente}<br/><small>{l.telefone}</small></div>
                    <button onClick={() => registrarInteracao(l)} style={{ background: "#d4af37", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>REGISTRAR</button>
                  </div>
                ))}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
