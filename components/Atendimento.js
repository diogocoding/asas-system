import React from "react";

export default function Atendimento({ 
  filtroTurno, 
  setFiltroTurno, 
  limparMinhaFila, 
  leadsFiltrados, 
  formatarData, 
  registrarInteracao, 
  excluirLead, 
  historicoDiario, 
  textoCopiado, 
  setTextoCopiado, 
  importarLeads 
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 400px", gap: "2rem" }}>
      <div>
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center" }}>
          <button onClick={() => setFiltroTurno("todos")} style={{ backgroundColor: filtroTurno === "todos" ? "#d4af37" : "#1e293b", color: filtroTurno === "todos" ? "black" : "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>Ver Todos</button>
          <button onClick={() => setFiltroTurno("manha")} style={{ backgroundColor: filtroTurno === "manha" ? "#d4af37" : "#1e293b", color: filtroTurno === "manha" ? "black" : "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>☀️ Manhã - N/Q Até 3°</button>
          <button onClick={() => setFiltroTurno("tarde")} style={{ backgroundColor: filtroTurno === "tarde" ? "#d4af37" : "#1e293b", color: filtroTurno === "tarde" ? "black" : "white", border: "none", padding: "10px 15px", borderRadius: "8px", cursor: "pointer" }}>🌖 Tarde - Follow-ups</button>
          <button onClick={limparMinhaFila} style={{ backgroundColor: "#ef4444", color: "white", border: "none", padding: "10px 15px", borderRadius: "8px", fontWeight: "bold", cursor: "pointer", marginLeft: "auto" }}>🔥 Limpar Minha Fila</button>
        </div>
        <div style={{ backgroundColor: "#0f172a", borderRadius: "1.2rem", border: "1px solid #1e293b", padding: "1rem" }}>
          {leadsFiltrados.map((lead) => (
            <div key={lead.id} style={{ padding: "1.5rem", borderBottom: "1px solid #1e293b", display: "flex", justifyContent: "space-between" }}>
              <div style={{ flex: 1 }}>
                <strong style={{ fontSize: "1.1rem" }}>{lead.nome_cliente}</strong><br />
                <small style={{ 
  color: "#94a3b8", 
  display: "block", 
  marginBottom: "4px", 
  filter: "blur(3px)" //adicionando blur para fazer o gif e por no linkedin
}}>
  {lead.telefone}
</small>
                <small style={{ color: "#64748b", fontStyle: "italic" }}>Adicionado em: {formatarData(lead.created_at)}</small>
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
      </div>

      <div style={{ backgroundColor: "rgba(15, 23, 42, 0.4)", padding: "2rem", borderRadius: "1.5rem", border: "1px solid #1e293b", height: "fit-content" }}>
        <div style={{ backgroundColor: "#0f172a", padding: "1.5rem", borderRadius: "1.2rem", border: "1px solid #d4af37", marginBottom: "2rem" }}>
          <h3 style={{ color: "#d4af37", fontSize: "1rem", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "10px" }}>📅 MEU HISTÓRICO DIÁRIO</h3>
          <div style={{ maxHeight: "200px", overflowY: "auto", paddingRight: "5px" }}>
            {historicoDiario.length > 0 ? (
              historicoDiario.map((item) => (
                <div key={item.data} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #1e293b" }}>
                  <div><span style={{ fontSize: "0.85rem", color: "#94a3b8" }}>{new Date(item.data + "T00:00:00").toLocaleDateString("pt-BR")}</span></div>
                  <div style={{ textAlign: "right" }}><strong style={{ color: "#d4af37", fontSize: "1rem" }}>{item.qtd}</strong><small style={{ color: "#64748b", marginLeft: "5px" }}>registros</small></div>
                </div>
              ))
            ) : (<div style={{ color: "#64748b", textAlign: "center", padding: "20px" }}>Nenhum registro.</div>)}
          </div>
        </div>
        <h3 style={{ color: "#d4af37", marginBottom: "1rem" }}>Importar Novos Leads</h3>
        <textarea value={textoCopiado} onChange={(e) => setTextoCopiado(e.target.value)} style={{ width: "100%", height: "200px", background: "#020617", border: "1px solid #334155", borderRadius: "12px", color: "white", padding: "1rem" }} placeholder="Nome e Telefone..." />
        <button onClick={importarLeads} style={{ width: "100%", marginTop: "1rem", background: "linear-gradient(45deg, #d4af37, #b8860b)", color: "black", padding: "1rem", borderRadius: "12px", fontWeight: "bold", cursor: "pointer", border: "none" }}>DECOLAR PARA MINHA LISTA</button>
      </div>
    </div>
  );
}