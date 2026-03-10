# 🚀 ASAS System - CRM de Gestão de Cadência e Performance

O **ASAS System** é uma aplicação web **Full Stack** profissional desenvolvida para gerenciar fluxos de vendas através de uma cadência sistemática de 21 dias. O sistema automatiza o acompanhamento de leads, monitora metas de equipe e fornece métricas em tempo real para tomada de decisão gerencial.

## 🧠 Conceito do Sistema
O software aplica a metodologia de **"venda sistemática"**, onde o foco está na persistência. A lógica prioriza o acompanhamento de leads do 5º ao 9º contato, estágio onde estatisticamente ocorrem a maioria das conversões no mercado imobiliário.

## 🛠️ Stack Tecnológica
* **Frontend:** [Next.js](https://nextjs.org/) (React) com **Arquitetura Componentizada** para alta manutenibilidade.
* **Backend as a Service:** [Supabase](https://supabase.com/) (PostgreSQL) para persistência e gestão de estados em tempo real.
* **Segurança:** Implementação de variáveis de ambiente (`.env`) e proteção de rotas via estado de autenticação.
* **Deploy:** [Vercel](https://vercel.com/) com CI/CD integrado ao GitHub.

## ✨ Funcionalidades Principais
* **Dashboard de Performance:** Monitoramento da meta mensal (400 contatos/corretor) com barras de progresso dinâmicas.
* **Fila de Atendimento Inteligente:** Algoritmo que segmenta leads por turnos (Manhã: novos leads; Tarde: follow-ups de alta conversão).
* **Playbook Estratégico:** Biblioteca de scripts de abordagem (WhatsApp/Ligação) integrada ao fluxo de trabalho.
* **Métricas de Conversão:** Registro automatizado de Reuniões e Visitas por membro da equipe.
* **Importação Massiva:** Módulo para importação de leads via processamento de texto, otimizando o setup inicial.

## 🔒 Engenharia de Software & Boas Práticas (ADS)
* **Refatoração e Componentização:** Separação de responsabilidades em componentes independentes (`Dashboard`, `Atendimento`, `Playbook`).
* **Privacidade de Dados (LGPD):** Implementação de máscaras e filtros de desfoque (*blur*) em campos sensíveis para demonstrações e segurança do usuário.
* **Integridade de Dados:** Tratamento rigoroso de tipos numéricos e estados para garantir cálculos precisos em ambiente de produção.

## 📈 Resultados Gerenciais
O sistema permite ao gestor auditar o esforço real da equipe, garantindo que o volume de contatos diários seja convertido em resultados tangíveis.

---
💡 **Desenvolvido por:** [Diogo Nascimento](https://github.com/diogocoding)  
*Estudante de Análise e Desenvolvimento de Sistemas - Faculdade SENAC.*
