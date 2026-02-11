"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

export default function SistemaAsas() {
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [corretorLogado, setCorretorLogado] = useState("Diogo");
  const [leads, setLeads] = useState([]);
  const [textoCopiado, setTextoCopiado] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("todos");

  const equipe = ["Pedro", "João", "Sidney", "Thales", "Carlos", "Diogo"];
  const META_LIGACOES = 400;

  async function carregarLeads() {
    const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (data) setLeads(data);
  }

  useEffect(() => { carregarLeads(); }, []);

  const formatarData = (dataISO) => {
    if (!dataISO) return "---";
    return new Date(dataISO).toLocaleDateString("pt-BR");
  };

  const mesAtual = new Date().getMonth();
  const leadsMesAtual = leads.filter(l => new Date(l.created_at).getMonth() === mesAtual);
  const meusLeads = leads.filter(l => l.corretor_nome === corretorLogado);
  
  const leadsFiltrados = meusLeads.filter(l => {
    if (filtroTurno === "manha") return (Number(l.tentativa_atual) || 0) <= 3;
    if (filtroTurno === "tarde") return (Number(l.tentativa_atual) || 0) > 3;
    return true;
  });

  async function registrarInteracao(lead) {
    const status = window.prompt(`Último registro: ${lead.resultado_ultimo || "Nenhum"}\n\nNovo status:`);
    if (!status) return;
    const tipo = window.prompt("Gerou algo?\n1 - Apenas Contato\n2 - Reunião Agendada\n3 - Visita Agendada");
    
    let updateData = { 
      tentativa_atual: (Number(lead.tentativa_atual) || 0) + 1, 
      resultado_ultimo: status,
      corretor_nome: corretorLogado 
    };

    // CORREÇÃO DAS MÉTRICAS: Garante incremento matemático
    if (tipo === "2") updateData.total_reunioes = (Number(lead.total_reunioes) || 0) + 1;
    if (tipo === "3") updateData.total_visitas = (Number(lead.total_visitas) || 0) + 1;

    await supabase.from("leads").update(updateData).eq("id", lead.id);
    await carregarLeads(); // Força atualização da tela
  }

  function exportarRelatorio() {
    const tipo = window.confirm("MÊS ATUAL (OK) ou GERAL (Cancelar)?");
    const dadosRelatorio = tipo ? leadsMesAtual : leads;
    let relatorio = `*📊 RELATÓRIO ASAS - ${tipo ? "MÊS ATUAL" : "GERAL"}*\n\n`;
    
    equipe.forEach(nome => {
      const filtrados = dadosRelatorio.filter(l => l.corretor_nome === nome);
      const contatos = filtrados.reduce((acc, curr) => acc + (Number(curr.tentativa_atual) || 0), 0);
      const reunioes = filtrados.reduce((acc, curr) => acc + (Number(curr.total_reunioes) || 0), 0);
      const visitas = filtrados.reduce((acc, curr) => acc + (Number(curr.total_visitas) || 0), 0);
      relatorio += `👤 *${nome.toUpperCase()}*\n📞 Contatos: ${contatos}\n🤝 Reuniões: ${reunioes}\n🚗 Visitas: ${visitas}\n----------\n`;
    });
    navigator.clipboard.writeText(relatorio);
    alert("Copiado!");
  }

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", fontFamily: "sans-serif", display: "flex", flexDirection: "column" }}>
      {/* HEADER */}
      <nav style={{ display: "flex", gap: "2rem", padding: "1.2rem 2.5rem", borderBottom: "1px solid #d4af37", backgroundColor: "#0f172a", alignItems: "center" }}>
        <img src="/logo.png" alt="ASAS" style={{ height: "60px" }} />
        <button onClick={() => setAbaAtiva("dashboard")} style={{ background: "none", border: "none", color: abaAtiva === "dashboard" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📊 DASHBOARD</button>
        <button onClick={() => setAbaAtiva("atendimento")} style={{ background: "none", border: "none", color: abaAtiva === "atendimento" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📞 MEU FLUXO</button>
        <button onClick={() => setAbaAtiva("playbook")} style={{ background: "none", border: "none", color: abaAtiva === "playbook" ? "#d4af37" : "#94a3b8", cursor: "pointer", fontWeight: "bold" }}>📖 PLAYBOOK</button>
        <div style={{ marginLeft: "auto" }}>
          <select value={corretorLogado} onChange={(e) => setCorretorLogado(e.target.value)} style={{ backgroundColor: "#1e293b", color: "#d4af37", border: "1px solid #d4af37", borderRadius: "0.5rem", padding: "0.4rem" }}>
            {equipe.map(nome => <option key={nome} value={nome}>{nome}</option>)}
          </select>
        </div>
      </nav>

      <div style={{ padding: "2.5rem", flex: 1 }}>
        {/* DASHBOARD CORRIGIDO */}
        {abaAtiva === "dashboard" && (
          <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #1e293b" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
              <h3 style={{ color: "#d4af37" }}>Gestão de Performance Mensal</h3>
              <button onClick={exportarRelatorio} style={{ backgroundColor: "#10b981", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer" }}>📤 Relatório WhatsApp</button>
            </div>
            {equipe.map(nome => {
              const filtrados = leadsMesAtual.filter(l => l.corretor_nome === nome);
              const contatos = filtrados.reduce((acc, curr) => acc + (Number(curr.tentativa_atual) || 0), 0);
              const reunioes = filtrados.reduce((acc, curr) => acc + (Number(curr.total_reunioes) || 0), 0);
              const visitas = filtrados.reduce((acc, curr) => acc + (Number(curr.total_visitas) || 0), 0);
              const progresso = Math.min((contatos / META_LIGACOES) * 100, 100);
              return (
                <div key={nome} style={{ marginBottom: "1.5rem", borderBottom: "1px solid #1e293b", paddingBottom: "1rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                    <span>{nome} {progresso >= 100 && "🏆"}</span>
                    <span>{contatos} / {META_LIGACOES} contatos</span>
                  </div>
                  <div style={{ width: "100%", height: "10px", backgroundColor: "#020617", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ width: `${progresso}%`, height: "100%", background: "linear-gradient(90deg, #d4af37, #fde047)" }}></div>
                  </div>
                  <div style={{ marginTop: "8px", display: "flex", gap: "20px", fontSize: "0.85rem" }}>
                    <span style={{ color: "#60a5fa" }}>🤝 {reunioes} Reuniões</span>
                    <span style={{ color: "#10b981" }}>🚗 {visitas} Visitas</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MEU FLUXO COM IMPORTAÇÃO RESTAURADA */}
        {abaAtiva === "atendimento" && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem" }}>
            <div style={{ backgroundColor: "#0f172a", borderRadius: "1.2rem", border: "1px solid #1e293b", padding: "1.5rem" }}>
              <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
                <button onClick={() => setFiltroTurno("todos")} style={{ backgroundColor: filtroTurno === "todos" ? "#d4af37" : "#1e293b", color: filtroTurno === "todos" ? "black" : "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>Todos</button>
                <button onClick={() => setFiltroTurno("manha")} style={{ backgroundColor: filtroTurno === "manha" ? "#d4af37" : "#1e293b", color: filtroTurno === "manha" ? "black" : "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>☀️ Manhã</button>
                <button onClick={() => setFiltroTurno("tarde")} style={{ backgroundColor: filtroTurno === "tarde" ? "#d4af37" : "#1e293b", color: filtroTurno === "tarde" ? "black" : "white", border: "none", padding: "8px 15px", borderRadius: "8px", cursor: "pointer", fontWeight: "bold" }}>🌖 Tarde</button>
              </div>
              {leadsFiltrados.map(lead => (
                <div key={lead.id} style={{ padding: "1.2rem", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>{lead.nome_cliente}</strong><br/><small style={{ color: "#94a3b8" }}>{lead.telefone}</small><br/>
                    <small style={{ color: "#64748b" }}>Adicionado: {formatarData(lead.created_at)}</small>
                    <div style={{ marginTop: "10px", padding: "8px", backgroundColor: "#020617", borderRadius: "6px", borderLeft: "3px solid #d4af37", fontSize: "0.85rem" }}>
                      <strong>ÚLTIMO REGISTRO:</strong> {lead.resultado_ultimo || "Sem notas."}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span style={{ fontSize: "0.7rem", backgroundColor: "#1e293b", color: "#d4af37", padding: "3px 8px", borderRadius: "10px", fontWeight: "bold" }}>{lead.tentativa_atual || 1}ª tentativa</span>
                    <button onClick={() => registrarInteracao(lead)} style={{ backgroundColor: "#d4af37", color: "black", border: "none", padding: "10px 20px", borderRadius: "8px", fontWeight: "bold", display: "block", marginTop: "10px", cursor: "pointer" }}>REGISTRAR</button>
                  </div>
                </div>
              ))}
            </div>

            {/* ABA LATERAL DE IMPORTAÇÃO - RESTAURADA */}
            <div style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #1e293b", height: "fit-content" }}>
              <h3 style={{ color: "#d4af37", marginBottom: "1rem" }}>Importar Novos Leads</h3>
              <textarea value={textoCopiado} onChange={(e) => setTextoCopiado(e.target.value)} style={{ width: "100%", height: "200px", background: "#020617", border: "1px solid #334155", borderRadius: "12px", color: "white", padding: "1rem", resize: "none" }} placeholder="Nome e Telefone da planilha..." />
              <button onClick={async () => {
                const linhas = textoCopiado.split("\n");
                const novos = linhas.map(lin => { const colunas = lin.split(/\t| {2,}/); return { nome_cliente: colunas[0]?.trim(), telefone: colunas[1]?.trim(), tentativa_atual: 1, corretor_nome: corretorLogado }; }).filter(l => l.nome_cliente);
                await supabase.from("leads").insert(novos);
                setTextoCopiado(""); await carregarLeads();
                alert("Decolagem concluída!");
              }} style={{ width: "100%", marginTop: "1rem", background: "linear-gradient(45deg, #d4af37, #b8860b)", color: "black", padding: "1rem", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", border: "none" }}>DECOLAR PARA MINHA LISTA</button>
            </div>
          </div>
        )}

        {/* PLAYBOOK RESTAURADO EM 3 COLUNAS */}
        {abaAtiva === "playbook" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1.5rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "1.5rem", borderRadius: "1.2rem", border: "1px solid #d4af37" }}>
              <h3 style={{ color: "#d4af37", marginBottom: "1rem" }}>🚀 Início (Dia 1 e 2)</h3>
              <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #1e293b" }}><strong>WhatsApp Dia 1:</strong><br/>"Oi [Nome], te liguei porque tenho um imóvel específico que pode fazer sentido pra você. Me chama aqui."</div>
              <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", border: "1px solid #1e293b" }}><strong>WhatsApp Dia 2:</strong><br/>"Esse imóvel tem entrada facilitada e potencial de valorização alto. Posso te explicar em 2 min?"</div>
            </div>
            <div style={{ backgroundColor: "#0f172a", padding: "1.5rem", borderRadius: "1.2rem", border: "1px solid #3b82f6" }}>
              <h3 style={{ color: "#3b82f6", marginBottom: "1rem" }}>🔥 Meio (Dia 4 ao 9)</h3>
              <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #1e293b" }}><strong>WhatsApp Dia 6:</strong><br/>"Atendi um cliente essa semana que comprou com o mesmo perfil que o seu."</div>
              <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", border: "1px solid #1e293b" }}><strong>WhatsApp Dia 9:</strong><br/>"Você prefere investir ou morar? Isso muda totalmente a oportunidade."</div>
            </div>
            <div style={{ backgroundColor: "#0f172a", padding: "1.5rem", borderRadius: "1.2rem", border: "1px solid #ef4444" }}>
              <h3 style={{ color: "#ef4444", marginBottom: "1rem" }}>🏁 Final (Dia 12 ao 21)</h3>
              <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", border: "1px solid #1e293b" }}><strong>WhatsApp Dia 15:</strong><br/>"Algumas unidades estão sendo reservadas, por isso estou retomando contato."</div>
              <div style={{ backgroundColor: "#020617", padding: "1rem", borderRadius: "8px", border: "1px solid #1e293b" }}><strong>WhatsApp Dia 18:</strong><br/>"Se agora não for o momento, sem problema. Me avisa só pra eu não insistir."</div>
            </div>
          </div>
        )}
      </div>

      <footer style={{ padding: "1rem", textAlign: "center", fontSize: "0.75rem", color: "#475569", opacity: 0.6 }}>
        criado por: diogo nascimento
      </footer>
    </div>
  );
}
