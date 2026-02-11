# 🚀 ASAS System - CRM de Gestão de Cadência e Performance

O **ASAS System** é uma aplicação web **Full Stack** desenvolvida para gerenciar fluxos de vendas através de uma cadência sistemática de 21 dias. O sistema automatiza o acompanhamento de leads, monitora metas de equipe e fornece métricas em tempo real para tomada de decisão gerencial.

## 🧠 Conceito do Sistema
O software foi projetado para aplicar a metodologia de **"venda sistemática"**, onde o foco está na persistência do contato. A lógica do sistema prioriza leads que atingem do 5º ao 9º contato, estágio onde estatisticamente ocorrem a maioria das conversões.

## 🛠️ Stack Tecnológica
* **Frontend:** [Next.js](https://nextjs.org/) (React) com Hooks para gestão de estado global.
* **Backend as a Service:** [Supabase](https://supabase.com/) (PostgreSQL) para persistência e segurança de dados.
* **Segurança:** Implementação de **Row Level Security (RLS)** e variáveis de ambiente protegidas.
* **Deploy:** [Vercel](https://vercel.com/) com integração contínua via GitHub.

## ✨ Funcionalidades Principais
* **Dashboard de Performance:** Visualização dinâmica da meta mensal de 400 contatos por corretor, com barras de progresso automáticas.
* **Fila de Atendimento Inteligente:** Algoritmo que filtra leads por turnos (Manhã para novos leads e Tarde para follow-ups agressivos).
* **Playbook Estratégico:** Aba integrada com scripts de abordagem prontos para cada etapa do funil (Início, Meio e Fim).
* **Gestão de Métricas Finais:** Registro e soma automática de **Reuniões Agendadas** e **Visitas Realizadas** por membro da equipe.
* **Relatórios Automatizados:** Geração de relatórios formatados prontos para compartilhamento via WhatsApp.

## 🔒 Segurança e Boas Práticas (ADS)
* **Ocultação de Credenciais:** Uso de arquivos `.env.local` e `.gitignore` para proteção de chaves sensíveis.
* **Integridade de Dados:** Validação de tipos numéricos (`Number()`) para garantir cálculos precisos em ambiente de produção.
* **Componentização:** Código modularizado em React para facilitar a manutenção e escalabilidade.

## 📈 Resultados Gerenciais
O sistema permite ao gestor auditar o esforço da equipe, garantindo que o volume de contatos diários se transforme em resultados tangíveis no final do mês.

---
💡 **Desenvolvido por:** [Diogo Nascimento](https://github.com/diogocoding)  
*Estudante de Análise e Desenvolvimento de Sistemas - Faculdade SENAC.*
