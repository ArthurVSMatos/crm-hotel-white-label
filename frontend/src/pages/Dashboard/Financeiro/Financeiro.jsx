import { useEffect, useState } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import "./Financeiro.css";

import {
  resumoFinanceiro,
  despesasRecentes,
} from "../../../data/financeiroData";

// Página de relatório financeiro do CRM
export default function Financeiro() {
  // Controla a abertura e fechamento do modal de despesa
  const [modalAberto, setModalAberto] = useState(false);

  // Lista de despesas exibidas na tabela
  // Primeiro tenta carregar do localStorage. Se não existir, usa os dados padrão.
  const [despesas, setDespesas] = useState(() => {
    const despesasSalvas = localStorage.getItem("despesas");

    if (despesasSalvas) {
      return JSON.parse(despesasSalvas);
    }

    return despesasRecentes;
  });

  // Dados digitados no formulário de nova despesa
  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    categoria: "",
    categoriaOutro: "",
    valor: "",
  });

  // Sempre que a lista de despesas mudar, salva no localStorage
  useEffect(() => {
    localStorage.setItem("despesas", JSON.stringify(despesas));
  }, [despesas]);

  // Salva uma nova despesa temporariamente no FrontEnd
  function salvarDespesa() {
    const categoriaFinal =
      novaDespesa.categoria === "Outros"
        ? novaDespesa.categoriaOutro
        : novaDespesa.categoria;

    if (
      !novaDespesa.descricao ||
      !novaDespesa.categoria ||
      !novaDespesa.valor
    ) {
      alert("Preencha todos os campos.");
      return;
    }

    const despesa = {
      id: Date.now(),
      descricao: novaDespesa.descricao,
      categoria: categoriaFinal,
      valor: `R$ ${novaDespesa.valor}`,
    };

    setDespesas([...despesas, despesa]);

    setNovaDespesa({
      descricao: "",
      categoria: "",
      categoriaOutro: "",
      valor: "",
    });

    setModalAberto(false);
  }

  function deletarDespesa(id) {
    const despesasAtualizadas = despesas.filter(
      (despesa) => despesa.id !== id
    );

    setDespesas(despesasAtualizadas);
  }

  return (
    <MainLayout>
      <div className="financeiro-page">

        {/* Cabeçalho da página */}
        <div className="financeiro-header">
          <h1>Relatório Financeiro</h1>

          <button
            className="btn-despesa"
            onClick={() => setModalAberto(true)}
          >
            + Lançar Despesa
          </button>
        </div>

        {/* Cards de resumo financeiro */}
        <div className="financeiro-cards">
          <div className="finance-card">
            <p>ENTRADAS(MÊS)</p>
            <h2 className="green">{resumoFinanceiro.entradas}</h2>
          </div>

          <div className="finance-card">
            <p>SAÍDA(MÊS)</p>
            <h2 className="red">{resumoFinanceiro.saidas}</h2>
          </div>

          <div className="finance-card">
            <p>SALDO</p>
            <h2>{resumoFinanceiro.saldo}</h2>
          </div>

          <div className="finance-card">
            <p>PENDENTE</p>
            <h2 className="orange">{resumoFinanceiro.pendente}</h2>
          </div>
        </div>

        {/* Conteúdo principal da tela financeira */}
        <div className="financeiro-content">

          {/* Coluna esquerda: gráfico e tabela */}
          <div className="financeiro-left">
            <h2>Comparativo de Faturamento (Meses Passados)</h2>

            {/* Gráfico visual temporário feito em CSS */}
            <div className="bar-chart">
              <div className="bar small"></div>
              <div className="bar medium"></div>
              <div className="bar large"></div>
              <div className="bar small"></div>
              <div className="bar medium"></div>
            </div>

            <h2>Registro de Despesas Recentes</h2>

            {/* Tabela de despesas */}
            <table className="expense-table">
              <thead>
                <tr>
                  <th>DESCRIÇÃO</th>
                  <th>CATEGORIA</th>
                  <th>VALOR</th>
                  <th>AÇÕES</th>
                </tr>
              </thead>

              <tbody>
                {despesas.map((despesa) => (
                  <tr key={despesa.id}>
                    <td>{despesa.descricao}</td>
                    <td>{despesa.categoria}</td>
                    <td className="red">{despesa.valor}</td>
                    <td>
                      <button className="edit">EDITAR</button>
                      <button
                        className="delete"
                        onClick={() => deletarDespesa(despesa.id)}
                      >
                        DELETAR
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Coluna direita: indicadores extras */}
          <aside className="financeiro-right">
            <div className="ticket-card">
              <p>Ticket Médio</p>
              <h2>R$ 380,00</h2>
            </div>

            <button className="export-btn">Exportar PDF</button>
          </aside>
        </div>

        {/* Modal para cadastrar nova despesa */}
        {modalAberto && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>Lançar Despesa</h2>

              <input
                type="text"
                placeholder="Descrição"
                value={novaDespesa.descricao}
                onChange={(e) =>
                  setNovaDespesa({
                    ...novaDespesa,
                    descricao: e.target.value,
                  })
                }
              />

              <select
                value={novaDespesa.categoria}
                onChange={(e) =>
                  setNovaDespesa({
                    ...novaDespesa,
                    categoria: e.target.value,
                    categoriaOutro: "",
                  })
                }
              >
                <option value="">Selecione uma categoria</option>
                <option value="Manutenção">Manutenção</option>
                <option value="Serviços">Serviços</option>
                <option value="Limpeza">Limpeza</option>
                <option value="Marketing">Marketing</option>
                <option value="Funcionários">Funcionários</option>
                <option value="Outros">Outros</option>
              </select>

              {/* Campo aparece apenas quando a categoria "Outros" é selecionada */}
              {novaDespesa.categoria === "Outros" && (
                <input
                  type="text"
                  placeholder="Digite a categoria"
                  value={novaDespesa.categoriaOutro}
                  onChange={(e) =>
                    setNovaDespesa({
                      ...novaDespesa,
                      categoriaOutro: e.target.value,
                    })
                  }
                />
              )}

              <div className="input-money">
                <span>R$</span>

                <input
                  type="number"
                  placeholder="0,00"
                  value={novaDespesa.valor}
                  onChange={(e) =>
                    setNovaDespesa({
                      ...novaDespesa,
                      valor: e.target.value,
                    })
                  }
                />
              </div>

              <div className="modal-actions">
                <button onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>

                <button
                  className="btn-despesa"
                  onClick={salvarDespesa}
                >
                  Salvar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}