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
  const [filtroData, setFiltroData] = useState("mes");
  const [textoCopiado, setTextoCopiado] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("todos");

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

  async function carregarDados() {
    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (leadsData) setLeads(leadsData);

    const { data: interData } = await supabase
      .from("interacoes")
      .select("*");
    if (interData) setInteracoes(interData);
  }

  useEffect(() => {
    carregarDados();
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
    if (!dataISO) return "Data não disponível";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  const interacoesFiltradas = interacoes.filter(i => {
    const dataInteracao = new Date(i.created_at);
    const hoje = new Date();
    if (filtroData === "hoje") return dataInteracao.toDateString() === hoje.toDateString();
    if (filtroData === "mes") return dataInteracao.getMonth() === hoje.getMonth() && dataInteracao.getFullYear() === hoje.getFullYear();
    return true; 
  });

  const totalContatosGeral = interacoesFiltradas.length;
  const totalReunioesGeral = interacoesFiltradas.filter(i => i.tipo === "reuniao").length;
  const totalVisitasGeral = interacoesFiltradas.filter(i => i.tipo === "visita").length;

  const meusLeads = leads.filter((l) => l.corretor_nome === corretorLogado);
  const leadsFiltrados = meusLeads.filter((l) => {
    if (filtroTurno === "manha") return l.tentativa_atual <= 3;
    if (filtroTurno === "tarde") return l.tentativa_atual > 3;
    return true;
  });

  async function registrarInteracao(lead) {
    const status = window.prompt(`Último registro: ${lead.resultado_ultimo || "Nenhum"}\n\nNovo status:`);
    if (!status) return;
    const tipoNum = window.prompt("Gerou algo?\n1 - Apenas Contato\n2 - Reunião Agendada\n3 - Visita Agendada");
    let tipoTexto = tipoNum === "2" ? "reuniao" : tipoNum === "3" ? "visita" : "contato";

    let updateData = { 
      tentativa_atual: (lead.tentativa_atual || 0) + 1, 
      resultado_ultimo: status, 
      corretor_nome: corretorLogado 
    };
    if (tipoNum === "2") updateData.total_reunioes = (lead.total_reunioes || 0) + 1;
    if (tipoNum === "3") updateData.total_visitas = (lead.total_visitas || 0) + 1;

    await supabase.from("leads").update(updateData).eq("id", lead.id);
    await supabase.from("interacoes").insert([{
      lead_id: lead.id,
      corretor_nome: corretorLogado,
      status: status,
      tipo: tipoTexto
    }]);
    carregarDados();
  }

  async function excluirLead(id) {
    if (confirm("Deseja realmente remover este lead?")) {
      await supabase.from("leads").delete().eq("id", id);
      carregarDados();
    }
  }

  async function limparMinhaFila() {
    if (confirm(`Atenção ${corretorLogado}: Isso apagará TODOS os seus leads permanentemente. Confirma?`)) {
      await supabase.from("leads").delete().eq("corretor_nome", corretorLogado);
      carregarDados();
      alert("Sua fila foi zerada!");
    }
  }

  function exportarRelatorio() {
    const periodo = filtroData === "hoje" ? "HOJE" : "MÊS ATUAL";
    let relatorio = `*📊 RELATÓRIO ASAS - ${periodo}*\n\n`;
    equipe.forEach((nome) => {
      const realizadas = interacoesFiltradas.filter((i) => i.corretor_nome === nome);
      if (realizadas.length > 0) {
        const contatos = realizadas.length;
        const reunioes = realizadas.filter(i => i.tipo === "reuniao").length;
        const visitas = realizadas.filter(i => i.tipo === "visita").length;
        relatorio += `👤 *${nome.toUpperCase()}*\n📞 Ligações: ${contatos}\n🤝 Reuniões: ${reunioes}\n🚗 Visitas: ${visitas}\n----------\n`;
      }
    });
    navigator.clipboard.writeText(relatorio);
    alert(`Relatório (${periodo}) copiado com sucesso!`);
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
        {abaAtiva === "dashboard" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #1e293b" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                <div>
                  <h3 style={{ color: "#d4af37", marginBottom: "12px", fontSize: "1.4rem" }}>Performance Mensal</h3>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button onClick={() => setFiltroData("hoje")} style={{ backgroundColor: filtroData === "hoje" ? "#d4af37" : "#1e293b", color: filtroData === "hoje" ? "black" : "white", border: "none", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}>HOJE</button>
                    <button onClick={() => setFiltroData("mes")} style={{ backgroundColor: filtroData === "mes" ? "#d4af37" : "#1e293b", color: filtroData === "mes" ? "black" : "white", border: "none", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}>MÊS</button>
                  </div>
                </div>
                <button onClick={exportarRelatorio} style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "12px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ fontSize: "1.1rem" }}>📤</span> Relatório WhatsApp
                </button>
              </div>

              {equipe.map((nome) => {
                const interacoesDoCorretor = interacoesFiltradas.filter((i) => i.corretor_nome === nome);
                const contatos = interacoesDoCorretor.length; 
                const reunioes = interacoesDoCorretor.filter(i => i.tipo === "reuniao").length;
                const visitas = interacoesDoCorretor.filter(i => i.tipo === "visita").length;
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
              <h3 style={{ color: "#d4af37", marginBottom: "2rem" }}>Distribuição do Mês</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ width: "100%" }}>
                  <small style={{ color: "#94a3b8" }}>LIGAÇÕES TOTAIS</small>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{totalContatosGeral}</div>
                  <div style={{ height: "4px", background: "#d4af37", width: "100%", marginTop: "5px", borderRadius: "2px" }}></div>
                </div>
                <div style={{ width: "80%" }}>
                  <small style={{ color: "#94a3b8" }}>REUNIÕES</small>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#60a5fa" }}>{totalReunioesGeral}</div>
                  <div style={{ height: "4px", background: "#60a5fa", width: "100%", marginTop: "5px", borderRadius: "2px" }}></div>
                </div>
                <div style={{ width: "60%" }}>
                  <small style={{ color: "#94a3b8" }}>VISITAS</small>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold", color: "#10b981" }}>{totalVisitasGeral}</div>
                  <div style={{ height: "4px", background: "#10b981", width: "100%", marginTop: "5px", borderRadius: "2px" }}></div>
                </div>
              </div>
              <div style={{ marginTop: "2rem", padding: "1rem", backgroundColor: "#020617", borderRadius: "12px", fontSize: "0.85rem", color: "#94a3b8" }}>
                Conversão Reunião/Visita: 
                <span style={{ color: "#d4af37", marginLeft: "5px" }}> {totalReunioesGeral > 0 ? ((totalVisitasGeral / totalReunioesGeral) * 100).toFixed(1) : 0}% </span>
              </div>
            </div>
          </div>
        )}

        {(abaAtiva === "atendimento" || abaAtiva === "playbook") && !logado && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "3rem", borderRadius: "1.5rem", border: "1px solid #d4af37", textAlign: "center", width: "100%", maxWidth: "400px" }}>
              <h2 style={{ color: "#d4af37", marginBottom: "0.5rem" }}>Login de Equipe</h2>
              <form onSubmit={handleLogin}>
                <select value={corretorLogado} onChange={(e) => setCorretorLogado(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#d4af37", marginBottom: "1rem" }}>
                  {equipe.map((nome) => ( <option key={nome} value={nome}>{nome}</option> ))}
                </select>
                <input type="password" placeholder="Digite sua senha" value={senhaInserida} onChange={(e) => setSenhaInserida(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "1.5rem", textAlign: "center" }} />
                <button type="submit" style={{ width: "100%", padding: "12px", borderRadius: "8px", background: "linear-gradient(45deg, #d4af37, #b8860b)", color: "black", fontWeight: "bold", cursor: "pointer", border: "none" }}>ACESSAR</button>
              </form>
            </div>
          </div>
        )}

        {abaAtiva === "atendimento" && logado && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem" }}>
            <div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center" }}>
                <button onClick={() => setFiltroTurno("todos")} style={{ backgroundColor: filtroTurno === "todos" ? "#d4af37" : "#1e293b", color: filtroTurno === "todos" ? "black" : "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>Ver Todos</button>
                <button onClick={limparMinhaFila} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginLeft: "auto" }}>🔥 Limpar Minha Fila</button>
              </div>
              <div style={{ backgroundColor: "#0f172a", borderRadius: "1.2rem", border: "1px solid #1e293b", padding: "1rem" }}>
                {leadsFiltrados.map((lead) => (
                  <div key={lead.id} style={{ padding: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "1.1rem" }}>{lead.nome_cliente}</strong><br />
                      <small style={{ color: "#94a3b8" }}>{lead.telefone}</small>
                      <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#020617", borderRadius: "8px", borderLeft: "4px solid #d4af37" }}>
                        <strong>ÚLTIMO REGISTRO:</strong> {lead.resultado_ultimo || "Sem anotações."}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "150px" }}>
                      <span style={{ fontSize: "0.75rem", backgroundColor: "#1e293b", color: "white", padding: "4px 10px", borderRadius: "20px" }}> {lead.tentativa_atual || 1}ª tentativa </span>
                      <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end" }}>
                        <button onClick={() => registrarInteracao(lead)} style={{ backgroundColor: "#d4af37", color: "black", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>REGISTRAR</button>
                        <button onClick={() => excluirLead(lead.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #1e293b", height: "fit-content" }}>
              <h3 style={{ color: "#d4af37", marginBottom: "1rem" }}>Importar Novos Leads</h3>
              <textarea value={textoCopiado} onChange={(e) => setTextoCopiado(e.target.value)} style={{ width: "100%", height: "200px", background: "#020617", border: "1px solid #334155", borderRadius: "12px", color: "white", padding: "1rem" }} placeholder="Nome e Telefone..." />
              <button 
                onClick={async () => {
                  const linhas = textoCopiado.split("\n");
                  const novos = linhas.map((lin) => {
                    const colunas = lin.split(/\t| {2,}/);
                    return { nome_cliente: colunas[0]?.trim(), telefone: colunas[1]?.trim(), tentativa_atual: 1, corretor_nome: corretorLogado };
                  }).filter((l) => l.nome_cliente);
                  await supabase.from("leads").insert(novos);
                  setTextoCopiado(""); carregarDados(); alert("Importação concluída!");
                }}
                style={{ width: "100%", marginTop: "1rem", background: "linear-gradient(45deg, #d4af37, #b8860b)", color: "black", padding: "1rem", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", border: "none" }}
              > DECOLAR PARA MINHA LISTA </button>
            </div>
          </div>
        )}

        {abaAtiva === "playbook" && logado && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #d4af37" }}>
              <h3 style={{ color: "#d4af37" }}>🚀 Início (Dia 1 e 2)</h3>
              <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                <strong>WhatsApp Dia 1:</strong> "Oi [Nome], te liguei porque tenho um imóvel específico que pode fazer sentido pra você."
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
