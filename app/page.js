"use client";
import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import Dashboard from "../components/Dashboard";
import Playbook from "../components/Playbook";
import Atendimento from "../components/Atendimento";


export default function SistemaAsas() {
  const [carregando, setCarregando] = useState(false);
  const [historicoDiario, setHistoricoDiario] = useState([]);
  const [logado, setLogado] = useState(false);
  const [senhaInserida, setSenhaInserida] = useState("");
  const [abaAtiva, setAbaAtiva] = useState("dashboard");
  const [corretorLogado, setCorretorLogado] = useState("Diogo");
  const [leads, setLeads] = useState([]);
  const [interacoes, setInteracoes] = useState([]);
  const [filtroData, setFiltroData] = useState("mes");
  const [textoCopiado, setTextoCopiado] = useState("");
  const [filtroTurno, setFiltroTurno] = useState("todos");

  
  const equipe = ["Diogo", "Pedro", "João", "Sidney", "Thales", "Carlos"];
  const META_LIGACOES = 400;

 async function carregarDados() {
    // 1. Busca os leads para a lista de atendimento
    const { data: leadsData } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });
    if (leadsData) setLeads(leadsData);

    // 2. Busca o histórico real de registros para o Dashboard
    const { data: interData } = await supabase
      .from("interacoes")
      .select("*");
    if (interData) {
      setInteracoes(interData);

      // --- INÍCIO DA LÓGICA DE HISTÓRICO ---
      // Filtra apenas as interações do corretor que está logado agora
      const minhasInters = interData.filter(i => i.corretor_nome === corretorLogado);

      // Agrupa as interações por dia e conta quantas foram feitas
      const agrupado = minhasInters.reduce((acc, curr) => {
        // curr.created_at vem do banco como "2026-02-12T..." - pegamos apenas a data
        const data = curr.created_at.split('T')[0]; 
        acc[data] = (acc[data] || 0) + 1;
        return acc;
      }, {});

      // Transforma o objeto agrupado em uma lista ordenada para exibir na tela
      const listaFormatada = Object.entries(agrupado)
        .map(([data, qtd]) => ({ data, qtd }))
        .sort((a, b) => b.data.localeCompare(a.data)); // Ordena: Mais recentes primeiro

      setHistoricoDiario(listaFormatada);
      // --- FIM DA LÓGICA DE HISTÓRICO ---
    }
  }

  useEffect(() => {
    carregarDados(); // Agora ele carrega os dois bancos de dados ao iniciar
  }, [corretorLogado]);

  const handleLogin = async (e) => {
  e.preventDefault();
  setCarregando(true); // 🚀 Inicia o carregamento
  
  try {
    const { data, error } = await supabase
      .from("perfis_acesso")
      .select("senha_acesso")
      .eq("nome_corretor", corretorLogado)
      .single();

    if (error) throw error;

    if (data && senhaInserida === data.senha_acesso) {
      setLogado(true);
      setSenhaInserida("");
    } else {
      alert(`Senha incorreta!`);
      setSenhaInserida("");
    }
  } catch (err) {
    console.error("Erro no login:", err.message);
    alert("Erro ao conectar com o servidor.");
  } finally {
    setCarregando(false); // ✅ Desativa o carregamento (independente do resultado)
  }
};
  const formatarData = (dataISO) => {
    if (!dataISO) return "Data não disponível";
    const data = new Date(dataISO);
    return data.toLocaleDateString("pt-BR");
  };

  // Cálculos do Dashboard
  // Lógica de Filtro de Tempo para o Dashboard
  const interacoesFiltradas = interacoes.filter(i => {
    const dataInteracao = new Date(i.created_at);
    const hoje = new Date();
    
    if (filtroData === "hoje") {
      return dataInteracao.toDateString() === hoje.toDateString();
    }
    if (filtroData === "mes") {
      return dataInteracao.getMonth() === hoje.getMonth() && 
             dataInteracao.getFullYear() === hoje.getFullYear();
    }
    return true; 
  });
const totalContatosGeral = interacoesFiltradas.length;
  const totalReunioesGeral = interacoesFiltradas.filter(i => i.tipo === "reuniao").length;
  const totalVisitasGeral = interacoesFiltradas.filter(i => i.tipo === "visita").length;
  // Lógica de Atendimento
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
    
    // Aqui definimos o tipo de forma amigável para o banco de dados
    let tipoTexto = "contato";
    if (tipoNum === "2") tipoTexto = "reuniao";
    if (tipoNum === "3") tipoTexto = "visita";

    // 1. Atualizamos o Lead (para que ele mude de posição no seu fluxo)
    let updateData = { 
      tentativa_atual: (lead.tentativa_atual || 0) + 1, 
      resultado_ultimo: status, 
      corretor_nome: corretorLogado 
    };
    if (tipoNum === "2") updateData.total_reunioes = (lead.total_reunioes || 0) + 1;
    if (tipoNum === "3") updateData.total_visitas = (lead.total_visitas || 0) + 1;

    await supabase.from("leads").update(updateData).eq("id", lead.id);

    // 2. CRIAMOS O REGISTRO NA TABELA INTERAÇÕES (O segredo do Dashboard correto)
    await supabase.from("interacoes").insert([{
      lead_id: lead.id,
      corretor_nome: corretorLogado,
      status: status,
      tipo: tipoTexto
    }]);

    carregarDados(); // Chama a função nova que criamos no passo anterior
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
  async function importarLeads() {
    const linhas = textoCopiado.split("\n");
    const novos = linhas.map((lin) => {
      const colunas = lin.split(/\t| {2,}/);
      return { nome_cliente: colunas[0]?.trim(), telefone: colunas[1]?.trim(), tentativa_atual: 1, corretor_nome: corretorLogado };
    }).filter((l) => l.nome_cliente);
    await supabase.from("leads").insert(novos);
    setTextoCopiado(""); 
    carregarDados(); 
    alert("Importação concluída!");
  }


  function exportarRelatorio() {
    const periodo = filtroData === "hoje" ? "HOJE" : "MÊS ATUAL";
    let relatorio = `*📊 RELATÓRIO ASAS - ${periodo}*\n\n`;

    equipe.forEach((nome) => {
      // Usa as interações filtradas (respeitando se o botão HOJE ou MÊS está ativo)
      const realizadas = interacoesFiltradas.filter((i) => i.corretor_nome === nome);
      
      const contatos = realizadas.length;
      const reunioes = realizadas.filter(i => i.tipo === "reuniao").length;
      const visitas = realizadas.filter(i => i.tipo === "visita").length;

      if (contatos > 0) { // Só adiciona ao relatório quem trabalhou no período
        relatorio += `👤 *${nome.toUpperCase()}*\n📞 Ligações: ${contatos}\n🤝 Reuniões: ${reunioes}\n🚗 Visitas: ${visitas}\n----------\n`;
      }
    });

    navigator.clipboard.writeText(relatorio);
    alert(`Relatório (${periodo}) copiado com sucesso!`);
  }

  return (
    <div style={{ backgroundColor: "#020617", minHeight: "100vh", color: "white", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", gap: "2rem", padding: "1.2rem 2.5rem", borderBottom: "1px solid #d4af37", alignItems: "center" }}>
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
        {/* DASHBOARD PÚBLICO */}
        {abaAtiva === "dashboard" && (
          <Dashboard 
            equipe={equipe}
            interacoesFiltradas={interacoesFiltradas}
            META_LIGACOES={META_LIGACOES}
            filtroData={filtroData}
            setFiltroData={setFiltroData}
            exportarRelatorio={exportarRelatorio}
            totalContatosGeral={totalContatosGeral}
            totalReunioesGeral={totalReunioesGeral}
            totalVisitasGeral={totalVisitasGeral}
          />
        )}

        {/* LOGIN PARA FLUXO E PLAYBOOK */}
        {(abaAtiva === "atendimento" || abaAtiva === "playbook") && !logado && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
            <div style={{ backgroundColor: "#0f172a", padding: "3rem", borderRadius: "1.5rem", border: "1px solid #d4af37", textAlign: "center", width: "100%", maxWidth: "400px" }}>
              <h2 style={{ color: "#d4af37", marginBottom: "0.5rem" }}>Login de Equipe</h2>
              <p style={{ color: "#94a3b8", marginBottom: "1.5rem", fontSize: "0.9rem" }}>Selecione seu perfil para acessar o fluxo</p>
              <form onSubmit={handleLogin}>
                <select value={corretorLogado} onChange={(e) => setCorretorLogado(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "#d4af37", marginBottom: "1rem" }}>
                  {equipe.map((nome) => ( <option key={nome} value={nome}>{nome}</option> ))}
                </select>
                <input type="password" placeholder="Digite sua senha" value={senhaInserida} onChange={(e) => setSenhaInserida(e.target.value)} style={{ width: "100%", padding: "12px", borderRadius: "8px", border: "1px solid #334155", background: "#020617", color: "white", marginBottom: "1.5rem", textAlign: "center" }} />
                <button 
  type="submit" 
  disabled={carregando} // Impede cliques duplos que gastam processamento
  style={{ 
    width: "100%", 
    padding: "12px", 
    borderRadius: "8px", 
    background: carregando ? "#4b5563" : "linear-gradient(45deg, #d4af37, #b8860b)", 
    color: "black", 
    fontWeight: "bold", 
    cursor: carregando ? "not-allowed" : "pointer", 
    border: "none",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px"
  }}
>
  {carregando ? (
    <>
      <span className="animate-spin">🌀</span> CARREGANDO...
    </>
  ) : (
    "ACESSAR"
  )}
</button>
              </form>
            </div>
          </div>
        )}

        {/* MEU FLUXO - PROTEGIDO */}
        {abaAtiva === "atendimento" && logado && (
          <Atendimento 
            filtroTurno={filtroTurno}
            setFiltroTurno={setFiltroTurno}
            limparMinhaFila={limparMinhaFila}
            leadsFiltrados={leadsFiltrados}
            formatarData={formatarData}
            registrarInteracao={registrarInteracao}
            excluirLead={excluirLead}
            historicoDiario={historicoDiario}
            textoCopiado={textoCopiado}
            setTextoCopiado={setTextoCopiado}
            importarLeads={importarLeads}
          />
        )}
        
        {/* PLAYBOOK - PROTEGIDO */}
        {abaAtiva === "playbook" && logado && (
          <Playbook />
        )}
       
      </div>
    </div>
  );
}
