"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SistemaAsas() {
  const [logado, setLogado] = useState(false);
  const [senhaInserida, setSenhaInserida] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [corretorLogado, setCorretorLogado] = useState("Diogo");
  const [leads, setLeads] = useState([]);
  const [interacoes, setInteracoes] = useState([]); 
  const [textoCopiado, setTextoCopiado] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("todos");
  const [filtroHistorico, setFiltroHistorico] = useState("hoje");
  const [buscaLead, setBuscaLead] = useState("");

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

  async function carregarInteracoes() {
    if (!corretorLogado) return;
    const { data } = await supabase
      .from("interacoes")
      .select(`*, leads(nome_cliente)`)
      .eq("corretor_nome", corretorLogado)
      .order("created_at", { ascending: false });
    if (data) setInteracoes(data);
  }

  useEffect(() => {
    carregarLeads();
  }, []);

  useEffect(() => {
    if (logado) carregarInteracoes();
  }, [logado, corretorLogado]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (senhaInserida === SENHAS_EQUIPE[corretorLogado]) {
      setLogado(true);
      setSenhaInserida("");
    } else {
      alert(`Senha incorreta!`);
      setSenhaInserida("");
    }
  };

  const formatarData = (dataISO) => new Date(dataISO).toLocaleDateString("pt-BR");
  const formatarHora = (dataISO) => new Date(dataISO).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' });

  // Lógica do Dashboard
  const mesAtual = new Date().getMonth();
  const leadsMesAtual = leads.filter(l => new Date(l.created_at).getMonth() === mesAtual);
  const totalContatosGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.tentativa_atual || 0), 0);
  const totalReunioesGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_reunioes || 0), 0);
  const totalVisitasGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_visitas || 0), 0);

  // Lógica de Atendimento
  const meusLeads = leads.filter(l => l.corretor_nome === corretorLogado);
  const leadsFiltrados = meusLeads.filter(l => {
    if (filtroTurno === "manha") return (l.tentativa_atual || 0) <= 3;
    if (filtroTurno === "tarde") return (l.tentativa_atual || 0) > 3;
    return true;
  });

  // Filtro de Histórico
  const historicoFiltrado = interacoes.filter(i => {
    const dataI = new Date(i.created_at);
    const hoje = new Date();
    const diff = (hoje - dataI) / (1000 * 60 * 60 * 24);
    
    const matchesBusca = i.leads?.nome_cliente?.toLowerCase().includes(buscaLead.toLowerCase());
    if (filtroHistorico === "hoje") return diff < 1 && matchesBusca;
    if (filtroHistorico === "semana") return diff < 7 && matchesBusca;
    return matchesBusca;
  });

  async function registrarInteracao(lead) {
    const status = window.prompt(`Novo status para ${lead.nome_cliente}:`);
    if (!status) return;
    const tipo = window.prompt("Gerou o quê?\n1 - Contato\n2 - Reunião\n3 - Visita");
    
    const updateData = {
      tentativa_atual: (lead.tentativa_atual || 0) + 1,
      resultado_ultimo: status,
      corretor_nome: corretorLogado
    };
    if (tipo === "2") updateData.total_reunioes = (lead.total_reunioes || 0) + 1;
    if (tipo === "3") updateData.total_visitas = (lead.total_visitas || 0) + 1;

    await supabase.from("leads").update(updateData).eq("id", lead.id);
    await supabase.from("interacoes").insert({
      lead_id: lead.id,
      corretor_nome: corretorLogado,
      status: status,
      tipo: tipo === "2" ? "REUNIÃO" : tipo === "3" ? "VISITA" : "CONTATO"
    });

    carregarLeads();
    carregarInteracoes();
  }

  async function excluirLead(id) {
    if (confirm("Remover lead?")) {
      await supabase.from("leads").delete().eq("id", id);
      carregarLeads();
    }
  }

  function exportarRelatorio() {
    let relatorio = `*📊 RELATÓRIO ASAS*\n\n`;
    equipe.forEach(nome => {
      const f = leadsMesAtual.filter(l => l.corretor_nome === nome);
      relatorio += `👤 *${nome}*: 📞${f.reduce((a,c)=>a+(c.tentativa_atual||0),0)} | 🤝${f.reduce((a,c)=>a+(c.total_reunioes||0),0)}\n`;
    });
    navigator.clipboard.writeText(relatorio);
    alert("Copiado!");
  }

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", gap: "2rem", padding: "1.2rem 2.5rem", borderBottom: "1px solid #d4af37", backgroundColor: "#0f172a", alignItems: "center" }}>
        <img src="/logo.png" alt="ASAS" style={{ height: "40px" }} />
        <button onClick={() => setAbaAtiva("dashboard")} style={{ background: "none", border: "none", color: abaAtiva === "dashboard" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📊 DASHBOARD</button>
        <button onClick={() => setAbaAtiva("atendimento")} style={{ background: "none", border: "none", color: abaAtiva === "atendimento" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📞 MEU FLUXO</button>
        <button onClick={() => setAbaAtiva("playbook")} style={{ background: "none", border: "none", color: abaAtiva === "playbook" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📖 PLAYBOOK</button>
        <div style={{ marginLeft: "auto" }}>
          {logado ? <button onClick={() => setLogado(false)} style={{ background: "#ef4444", color: "white", border: "none", padding: "5px 10px", borderRadius: "5px", cursor: "pointer" }}>SAIR</button> : "Modo Visualização"}
        </div>
      </nav>

      <div style={{ padding: "2rem" }}>
        {abaAtiva === "dashboard" && (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem" }}>
                <div style={{ backgroundColor: "#0f172a", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #1e293b" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
                        <h3>Performance do Mês</h3>
                        <button onClick={exportarRelatorio} style={{ background: "#10b981", border: "none", color: "white", padding: "8px", borderRadius: "5px", cursor: "pointer" }}>Relatório WhatsApp</button>
                    </div>
                    {equipe.map(nome => {
                        const f = leadsMesAtual.filter(l => l.corretor_nome === nome);
                        const c = f.reduce((a,b)=>a+(b.tentativa_atual||0),0);
                        return (
                            <div key={nome} style={{ marginBottom: "1rem" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}>
                                    <span>{nome}</span>
                                    <span>📞 {c}</span>
                                </div>
                                <div style={{ height: "6px", background: "#020617", borderRadius: "3px", marginTop: "5px" }}>
                                    <div style={{ width: `${Math.min((c/META_LIGACOES)*100, 100)}%`, height: "100%", background: "#d4af37", borderRadius: "3px" }}></div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div style={{ backgroundColor: "#0f172a", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #d4af37", textAlign: "center" }}>
                    <h4>Total Geral</h4>
                    <h2 style={{ color: "#d4af37" }}>{totalContatosGeral}</h2>
                    <p>Ligações no mês</p>
                    <hr style={{ opacity: 0.1, margin: "1rem 0" }} />
                    <h3 style={{ color: "#60a5fa" }}>{totalReunioesGeral}</h3>
                    <p>Reuniões</p>
                </div>
            </div>
        )}

        {abaAtiva === "atendimento" && logado && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 450px", gap: "2rem" }}>
            {/* COLUNA DA ESQUERDA: LISTA DE TRABALHO */}
            <div>
              <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                <button onClick={() => setFiltroTurno("todos")} style={{ background: filtroTurno === "todos" ? "#d4af37" : "#1e293b", border: "none", padding: "8px", borderRadius: "5px", color: "black", cursor: "pointer" }}>Todos</button>
                <button onClick={() => setFiltroTurno("manha")} style={{ background: filtroTurno === "manha" ? "#d4af37" : "#1e293b", border: "none", padding: "8px", borderRadius: "5px", color: "black", cursor: "pointer" }}>☀️ Manhã</button>
                <button onClick={() => setFiltroTurno("tarde")} style={{ background: filtroTurno === "tarde" ? "#d4af37" : "#1e293b", border: "none", padding: "8px", borderRadius: "5px", color: "black", cursor: "pointer" }}>🌖 Tarde</button>
              </div>
              
              <div style={{ backgroundColor: "#0f172a", borderRadius: "1rem", border: "1px solid #1e293b", padding: "1rem" }}>
                {leadsFiltrados.map(lead => (
                  <div key={lead.id} style={{ padding: "1rem", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <strong>{lead.nome_cliente}</strong>
                      <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{lead.telefone} | {lead.tentativa_atual || 1}ª Tentativa</div>
                    </div>
                    <button onClick={() => registrarInteracao(lead)} style={{ background: "#d4af37", color: "black", border: "none", padding: "8px", borderRadius: "5px", fontWeight: "bold", cursor: "pointer" }}>REGISTRAR</button>
                  </div>
                ))}
              </div>
              
              <div style={{ marginTop: "2rem" }}>
                 <textarea value={textoCopiado} onChange={(e) => setTextoCopiado(e.target.value)} style={{ width: "100%", height: "100px", background: "#0f172a", border: "1px solid #1e293b", color: "white", padding: "10px", borderRadius: "8px" }} placeholder="Importar: Nome e Telefone..." />
                 <button onClick={async () => {
                    const linhas = textoCopiado.split("\n");
                    const novos = linhas.map(l => {
                        const cols = l.split(/\t| {2,}/);
                        return { nome_cliente: cols[0], telefone: cols[1], corretor_nome: corretorLogado, tentativa_atual: 1 };
                    }).filter(x => x.nome_cliente);
                    await supabase.from("leads").insert(novos);
                    setTextoCopiado(""); carregarLeads();
                 }} style={{ width: "100%", background: "#d4af37", padding: "10px", border: "none", borderRadius: "8px", marginTop: "10px", fontWeight: "bold", cursor: "pointer" }}>DECOLAR LEADS</button>
              </div>
            </div>

            {/* COLUNA DA DIREITA: HISTÓRICO REAL */}
            <div style={{ backgroundColor: "#0f172a", padding: "1.5rem", borderRadius: "1rem", border: "1px solid #d4af37", height: "fit-content" }}>
              <h3 style={{ color: "#d4af37", marginBottom: "1rem" }}>📜 Meu Histórico</h3>
              <div style={{ display: "flex", gap: "10px", marginBottom: "1rem" }}>
                <select value={filtroHistorico} onChange={(e) => setFiltroHistorico(e.target.value)} style={{ background: "#020617", color: "white", border: "1px solid #334155", padding: "5px", borderRadius: "5px" }}>
                  <option value="hoje">Hoje</option>
                  <option value="semana">7 dias</option>
                  <option value="todos">Tudo</option>
                </select>
                <input placeholder="Buscar lead..." value={buscaLead} onChange={(e) => setBuscaLead(e.target.value)} style={{ background: "#020617", color: "white", border: "1px solid #334155", padding: "5px", borderRadius: "5px", flex: 1 }} />
              </div>

              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                {historicoFiltrado.map(i => (
                  <div key={i.id} style={{ padding: "10px", borderBottom: "1px solid #1e293b", fontSize: "0.85rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#d4af37" }}>
                      <strong>{i.leads?.nome_cliente || "Lead Excluído"}</strong>
                      <span>{formatarHora(i.created_at)}</span>
                    </div>
                    <div style={{ color: "#94a3b8", marginTop: "4px" }}>
                      <span style={{ color: i.tipo === "REUNIÃO" ? "#60a5fa" : i.tipo === "VISITA" ? "#10b981" : "#94a3b8", fontWeight: "bold" }}>[{i.tipo}]</span> {i.status}
                    </div>
                  </div>
                ))}
                {historicoFiltrado.length === 0 && <p style={{ textAlign: "center", color: "#64748b" }}>Nenhum registro encontrado.</p>}
              </div>
            </div>
          </div>
        )}

        {abaAtiva === "playbook" && logado && <div style={{ color: "#94a3b8" }}>Conteúdo do Playbook...</div>}

        {!logado && (abaAtiva !== "dashboard") && (
          <div style={{ textAlign: "center", marginTop: "5rem" }}>
            <form onSubmit={handleLogin} style={{ display: "inline-block", background: "#0f172a", padding: "2rem", borderRadius: "1rem", border: "1px solid #d4af37" }}>
              <h3>Acesso à Equipe</h3>
              <select value={corretorLogado} onChange={(e) => setCorretorLogado(e.target.value)} style={{ width: "100%", padding: "10px", margin: "10px 0", background: "#020617", color: "white", border: "1px solid #334155" }}>
                {equipe.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <input type="password" value={senhaInserida} onChange={(e) => setSenhaInserida(e.target.value)} style={{ width: "100%", padding: "10px", margin: "10px 0", background: "#020617", color: "white", border: "1px solid #334155" }} placeholder="Senha" />
              <button type="submit" style={{ width: "100%", padding: "10px", background: "#d4af37", border: "none", fontWeight: "bold", cursor: "pointer" }}>ENTRAR</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
