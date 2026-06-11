import { useEffect, useState } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import "./Financeiro.css";

import {
  resumoFinanceiro,
  despesasRecentes,
} from "../../../data/financeiroData";

// Página de relatório financeiro do CRM
export default function Financeiro() {
  // Controla a abertura e fechamento do modal de cadastrar/editar despesa
  const [modalAberto, setModalAberto] = useState(false);

  // Guarda qual despesa está sendo editada
  // Se for null, significa que estamos cadastrando uma nova despesa
  const [despesaEditando, setDespesaEditando] = useState(null);

  // Controla a abertura e fechamento do modal de confirmação de exclusão
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  // Guarda temporariamente qual despesa o usuário quer excluir
  const [despesaParaExcluir, setDespesaParaExcluir] = useState(null);

  // Lista de despesas exibidas na tabela
  // Primeiro tenta carregar do localStorage. Se não existir, usa os dados padrão.
  const [despesas, setDespesas] = useState(() => {
    const despesasSalvas = localStorage.getItem("despesas");

    if (despesasSalvas) {
      return JSON.parse(despesasSalvas);
    }

    return despesasRecentes;
  });

  // Dados digitados no formulário de nova despesa ou edição
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

  // Salva uma nova despesa ou atualiza uma despesa existente
  function salvarDespesa() {
    const valorFormatado = Number(novaDespesa.valor).toLocaleString(
      "pt-BR",
      {
        style: "currency",
        currency: "BRL",
      }
    );
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
      id: despesaEditando ? despesaEditando.id : Date.now(),
      descricao: novaDespesa.descricao,
      categoria: categoriaFinal,
      valor: valorFormatado,
    };

    if (despesaEditando) {
      const despesasAtualizadas = despesas.map((item) =>
        item.id === despesaEditando.id ? despesa : item
      );

      setDespesas(despesasAtualizadas);
      setDespesaEditando(null);
    } else {
      setDespesas([...despesas, despesa]);
    }

    setNovaDespesa({
      descricao: "",
      categoria: "",
      categoriaOutro: "",
      valor: "",
    });

    setModalAberto(false);
  }

  // Abre o modal de confirmação antes de excluir
  function abrirModalExcluir(despesa) {
    setDespesaParaExcluir(despesa);
    setModalExcluirAberto(true);
  }

  // Cancela a exclusão
  function cancelarExclusao() {
    setDespesaParaExcluir(null);
    setModalExcluirAberto(false);
  }

  // Confirma a exclusão da despesa selecionada
  function confirmarExclusao() {
    const despesasAtualizadas = despesas.filter(
      (despesa) => despesa.id !== despesaParaExcluir.id
    );

    setDespesas(despesasAtualizadas);
    setDespesaParaExcluir(null);
    setModalExcluirAberto(false);
  }

  function abrirModalEdicao(despesa) {
    const valorSemFormatacao = String(despesa.valor)
      .replace("R$", "")
      .replace(/\./g, "")
      .replace(",", ".")
      .trim();

    setDespesaEditando(despesa);

    setNovaDespesa({
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      categoriaOutro: "",
      valor: valorSemFormatacao,
    });

    setModalAberto(true);
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
                      <button
                        className="edit"
                        onClick={() => abrirModalEdicao(despesa)}
                      >
                        EDITAR
                      </button>

                      <button
                        className="delete"
                        onClick={() => abrirModalExcluir(despesa)}
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

                {/* Modal para cadastrar ou editar despesa */}
        {modalAberto && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>
                {despesaEditando ? "Editar Despesa" : "Lançar Despesa"}
              </h2>

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
                <button
                  onClick={() => {
                    setModalAberto(false);
                    setDespesaEditando(null);
                    setNovaDespesa({
                      descricao: "",
                      categoria: "",
                      categoriaOutro: "",
                      valor: "",
                    });
                  }}
                >
                  Cancelar
                </button>

                <button
                  className="btn-despesa"
                  onClick={salvarDespesa}
                >
                  {despesaEditando ? "Salvar Alterações" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal de confirmação de exclusão */}
        {modalExcluirAberto && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>Excluir despesa</h2>

              <p>
                Tem certeza que deseja excluir a despesa{" "}
                <strong>{despesaParaExcluir?.descricao}</strong>?
              </p>

              <div className="modal-actions">
                <button onClick={cancelarExclusao}>
                  Cancelar
                </button>

                <button
                  className="delete-confirm"
                  onClick={confirmarExclusao}
                >
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </MainLayout>
  );
}