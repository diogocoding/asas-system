import React from "react";

export default function Dashboard({ 
  equipe, 
  interacoesFiltradas, 
  META_LIGACOES, 
  filtroData, 
  setFiltroData, 
  exportarRelatorio, 
  totalContatosGeral, 
  totalReunioesGeral, 
  totalVisitasGeral 
}) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "2rem" }}>
      
      {/* COLUNA DA ESQUERDA: PERFORMANCE */}
      <div style={{ backgroundColor: "#0f172a", padding: "2rem", borderRadius: "1.2rem", border: "1px solid #1e293b" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
          <div>
            <h3 style={{ color: "#d4af37", marginBottom: "12px", fontSize: "1.4rem" }}>Performance Mensal</h3>
            <div style={{ display: "flex", gap: "8px" }}>
              <button 
                onClick={() => setFiltroData("hoje")} 
                style={{ backgroundColor: filtroData === "hoje" ? "#d4af37" : "#1e293b", color: filtroData === "hoje" ? "black" : "white", border: "none", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
              >HOJE</button>
              <button 
                onClick={() => setFiltroData("mes")} 
                style={{ backgroundColor: filtroData === "mes" ? "#d4af37" : "#1e293b", color: filtroData === "mes" ? "black" : "white", border: "none", padding: "6px 16px", borderRadius: "6px", cursor: "pointer", fontSize: "0.75rem", fontWeight: "bold" }}
              >MÊS</button>
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

      {/* COLUNA DA DIREITA: CARDS TOTAIS */}
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
  );
}