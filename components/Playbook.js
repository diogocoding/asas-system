import React from "react";

export default function Playbook() {
  return (
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
  );
}