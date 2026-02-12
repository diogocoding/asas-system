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
      .order("updated_at", { ascending: false });
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

  // CORREÇÃO: Agora soma o total de tentativas (interações) em vez de contar apenas o lead
  const totalContatosGeral = leadsMesAtual.reduce((acc, curr) => acc + (Number(curr.tentativa_atual) || 0), 0);
  const totalReunioesGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_reunioes || 0), 0);
  const totalVisitasGeral = leadsMesAtual.reduce((acc, curr) => acc + (curr.total_visitas || 0), 0);

  const meusLeads = leads.filter((l) => l.corretor_nome === corretorLogado);
  const leadsFiltrados = meusLeads.filter((l) => {
    if (filtroTurno === "manha") return l.tentativa_atual <= 3;
    if (filtroTurno === "tarde") return l.tentativa_atual > 3;
    return true;
  });

  // HISTÓRICO FILTRADO POR DIA
  const historicoDoDia = meusLeads.filter((l) => {
    if (!l.updated_at) return false;
    return l.updated_at.startsWith(filtroDataHistorico);
  });

  async function registrarInteracao(lead) {
    const status = window.prompt(`Último registro: ${lead.resultado_ultimo || "Nenhum"}\n\nNovo status:`);
    if (!status) return;
    const tipo = window.prompt("Gerou algo?\n1 - Apenas Contato\n2 - Reunião Agendada\n3 - Visita Agendada");
    
    let updateData = { 
      tentativa_atual: (Number(lead.tentativa_atual) || 0) + 1, 
      resultado_ultimo: status, 
      corretor_nome: corretorLogado,
      updated_at: new Date().toISOString() // Garante que a data de atualização mude para o histórico
    };

    if (tipo === "2") updateData.total_reunioes = (lead.total_reunioes || 0) + 1;
    if (tipo === "3") updateData.total_visitas = (lead.total_visitas || 0) + 1;
    
    await supabase.from("leads").update(updateData).eq("id", lead.id);
    carregarLeads();
  }

  async function excluirLead(id) {
    if (confirm("Deseja realmente remover este lead?")) {
      await supabase.from("leads").delete().eq("id", id);
      carregarLeads();
    }
  }

  async function limparMinhaFila() {
    if (confirm(`Atenção ${corretorLogado}: Isso apagará TODOS os seus leads permanentemente. Confirma?`)) {
      await supabase.from("leads").delete().eq("corretor_nome", corretorLogado);
      carregarLeads();
      alert("Sua fila foi zerada!");
    }
  }

  function exportarRelatorio() {
    const tipo = window.confirm("MÊS ATUAL (OK) ou GERAL (Cancelar)?");
    const dadosRelatorio = tipo ? leadsMesAtual : leads;
    let relatorio = `*📊 RELATÓRIO ASAS - ${tipo ? "MÊS ATUAL" : "GERAL"}*\n\n`;
    equipe.forEach((nome) => {
      const filtrados = dadosRelatorio.filter((l) => l.corretor_nome === nome);
      const contatos = filtrados.reduce((acc, curr) => acc + (Number(curr.tentativa_atual) || 0), 0);
      const reunioes = filtrados.reduce((acc, curr) => acc + (curr.total_reunioes || 0), 0);
      const visitas = filtrados.reduce((acc, curr) => acc + (curr.total_visitas || 0), 0);
      relatorio += `👤 *${nome.toUpperCase()}*\n📞 Interações: ${contatos}\n🤝 Reuniões: ${reunioes}\n🚗 Visitas: ${visitas}\n----------\n`;
    });
    navigator.clipboard.writeText(relatorio);
    alert("Relatório copiado!");
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
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem" }}>
                <h3 style={{ color: "#d4af37" }}>Performance Mensal</h3>
                <button onClick={exportarRelatorio} style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>📤 Relatório WhatsApp</button>
              </div>
              {equipe.map((nome) => {
                const filtrados = leadsMesAtual.filter((l) => l.corretor_nome === nome);
                const contatos = filtrados.reduce((acc, curr) => acc + (Number(curr.tentativa_atual) || 0), 0);
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
              <h3 style={{ color: "#d4af37", marginBottom: "2rem" }}>Distribuição do Mês</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", alignItems: "center" }}>
                <div style={{ width: "100%" }}>
                  <small style={{ color: "#94a3b8" }}>INTERAÇÕES TOTAIS</small>
                  <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>{totalContatosGeral}</div>
                  <div style={{ height: "4px", background: "#d4af37", width: "100%", marginTop: "5px", borderRadius: "2px" }}></div>
                </div>
                {/* ... Restante do Dashboard ... */}
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

        {/* FLUXO COM HISTÓRICO POR DIA */}
        {abaAtiva === "atendimento" && logado && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem" }}>
            <div>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center" }}>
                <button onClick={() => setFiltroTurno("todos")} style={{ backgroundColor: filtroTurno === "todos" ? "#d4af37" : "#1e293b", color: filtroTurno === "todos" ? "black" : "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>Ver Todos</button>
                <button onClick={() => setFiltroTurno("manha")} style={{ backgroundColor: filtroTurno === "manha" ? "#d4af37" : "#1e293b", color: filtroTurno === "manha" ? "black" : "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>☀️ Manhã - N/Q Até 3°</button>
                <button onClick={() => setFiltroTurno("tarde")} style={{ backgroundColor: filtroTurno === "tarde" ? "#d4af37" : "#1e293b", color: filtroTurno === "tarde" ? "black" : "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>🌖 Tarde - Follow-ups</button>
                <button onClick={limparMinhaFila} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginLeft: "auto" }}>🔥 Limpar Minha Fila</button>
              </div>

              <div style={{ backgroundColor: "#0f172a", borderRadius: "1.2rem", border: "1px solid #1e293b", padding: "1rem" }}>
                <h4 style={{ color: "#d4af37", padding: "0 1rem" }}>Leads para Atendimento</h4>
                {leadsFiltrados.map((lead) => (
                  <div key={lead.id} style={{ padding: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
                    <div style={{ flex: 1 }}>
                      <strong style={{ fontSize: "1.1rem" }}>{lead.nome_cliente}</strong><br />
                      <small style={{ color: "#94a3b8", display: "block", marginBottom: "4px" }}>{lead.telefone}</small>
                      <div style={{ marginTop: "10px", padding: "10px", backgroundColor: "#020617", borderRadius: "8px", borderLeft: "4px solid #d4af37", fontSize: "0.9rem" }}>
                        <strong>ÚLTIMO REGISTRO:</strong> {lead.resultado_ultimo || "Sem anotações."}
                      </div>
                    </div>
                    <div style={{ textAlign: "right", minWidth: "150px" }}>
                      <span style={{ fontSize: "0.75rem", backgroundColor: lead.tentativa_atual >= 5 ? "#d4af37" : "#1e293b", color: lead.tentativa_atual >= 5 ? "black" : "white", padding: "4px 10px", borderRadius: "20px" }}> {lead.tentativa_atual || 1}ª tentativa </span>
                      <div style={{ display: "flex", gap: "10px", marginTop: "15px", justifyContent: "flex-end" }}>
                        <button onClick={() => registrarInteracao(lead)} style={{ backgroundColor: "#d4af37", color: "black", border: "none", padding: "8px 12px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}>REGISTRAR</button>
                        <button onClick={() => excluirLead(lead.id)} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "8px 12px", borderRadius: "6px", cursor: "pointer" }}>🗑️</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* SEÇÃO DE HISTÓRICO POR DIA */}
              <div style={{ marginTop: "2rem", backgroundColor: "#0f172a", borderRadius: "1.2rem", border: "1px solid #1e293b", padding: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                  <h3 style={{ color: "#d4af37", margin: 0 }}>📅 Histórico de Registros</h3>
                  <input 
                    type="date" 
                    value={filtroDataHistorico} 
                    onChange={(e) => setFiltroDataHistorico(e.target.value)}
                    style={{ background: "#020617", color: "white", border: "1px solid #d4af37", padding: "5px", borderRadius: "5px" }}
                  />
                </div>
                <div style={{ fontSize: "0.9rem", color: "#94a3b8", marginBottom: "1rem" }}>
                  Total de leads trabalhados neste dia: <strong>{historicoDoDia.length}</strong>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ textAlign: "left", color: "#d4af37", borderBottom: "1px solid #334155" }}>
                      <th style={{ padding: "10px" }}>Lead</th>
                      <th style={{ padding: "10px" }}>Último Registro</th>
                      <th style={{ padding: "10px" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historicoDoDia.length > 0 ? historicoDoDia.map((h) => (
                      <tr key={h.id} style={{ borderBottom: "1px solid #1e293b" }}>
                        <td style={{ padding: "10px" }}>{h.nome_cliente}</td>
                        <td style={{ padding: "10px", fontSize: "0.8rem" }}>{h.resultado_ultimo}</td>
                        <td style={{ padding: "10px" }}><span style={{ color: "#d4af37" }}>{h.tentativa_atual}ª tent.</span></td>
                      </tr>
                    )) : (
                      <tr><td colSpan="3" style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>Nenhum registro encontrado nesta data.</td></tr>
                    )}
                  </tbody>
                </table>
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
                    return { nome_cliente: colunas[0]?.trim(), telefone: colunas[1]?.trim(), tentativa_atual: 0, corretor_nome: corretorLogado, created_at: new Date().toISOString() };
                  }).filter((l) => l.nome_cliente);
                  await supabase.from("leads").insert(novos);
                  setTextoCopiado(""); carregarLeads(); alert("Importação concluída!");
                }}
                style={{ width: "100%", marginTop: "1rem", background: "linear-gradient(45deg, #d4af37, #b8860b)", color: "black", padding: "1rem", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", border: "none" }}
              > DECOLAR PARA MINHA LISTA </button>
            </div>
          </div>
        )}

        {/* ... PLAYBOOK e LOGIN permanecem os mesmos ... */}
        {(abaAtiva === "playbook") && logado && (
           <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem" }}>
             <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #d4af37" }}>
               <h3 style={{ color: "#d4af37" }}>🚀 Início (Dia 1 e 2)</h3>
               <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                 <strong>WhatsApp Dia 1:</strong> "Oi [Nome], te liguei porque tenho um imóvel específico que pode fazer sentido pra você. Me chama aqui."
               </div>
               <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                 <strong>WhatsApp Dia 2:</strong> "Esse imóvel tem entrada facilitada e potencial de valorização alto. Posso te explicar em 2 min?"
               </div>
             </div>
             <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #3b82f6" }}>
               <h3 style={{ color: "#60a5fa" }}>🔥 Meio (Dia 4 ao 9)</h3>
               <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                 <strong>WhatsApp Dia 6:</strong> "Atendi um cliente essa semana que comprou com o mesmo perfil que o seu."
               </div>
               <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                 <strong>WhatsApp Dia 9:</strong> "Você prefere investir ou morar? Isso muda totalmente a oportunidade."
               </div>
             </div>
             <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #ef4444" }}>
               <h3 style={{ color: "#f87171" }}>🏁 Final (Dia 12 ao 21)</h3>
               <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                 <strong>WhatsApp Dia 15:</strong> "Algumas unidades estão sendo reservadas, por isso estou retomando contato."
               </div>
               <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginTop: "1rem" }}>
                 <strong>WhatsApp Dia 18:</strong> "Se agora não for o momento, sem problema. Me avisa só pra eu não insistir."
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
      </div>
    </div>
  );
}
