import { useEffect, useState } from "react";
import MainLayout from "../../../components/Layout/MainLayout";
import "./Financeiro.css";

import {
  listarFinanceiro,
  criarDespesa,
  editarDespesa,
  deletarDespesa,
} from "../../../services/financeiroService";

const NOMES_MES = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

// Agrupa entradas e saídas reais por mês (últimos 6 meses, com base na
// data de criação de cada lançamento), pra alimentar o gráfico comparativo
function montarGraficoMensal(lista) {
  const hoje = new Date();
  const meses = [];

  // monta os últimos 6 meses (do mais antigo pro mais recente)
  for (let i = 5; i >= 0; i--) {
    const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    meses.push({
      chave: `${data.getFullYear()}-${data.getMonth()}`,
      label: NOMES_MES[data.getMonth()],
      entrada: 0,
      saida: 0,
    });
  }

  lista.forEach((registro) => {
    if (!registro.criado_em) return;
    const data = new Date(registro.criado_em);
    const chave = `${data.getFullYear()}-${data.getMonth()}`;
    const mes = meses.find((m) => m.chave === chave);
    if (!mes) return; // fora da janela dos últimos 6 meses

    if (registro.tipo === "entrada") {
      mes.entrada += Number(registro.valor);
    } else {
      mes.saida += Number(registro.valor);
    }
  });

  return meses;
}

export default function Financeiro() {
  const [modalAberto, setModalAberto] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [erroForm, setErroForm] = useState(null);
  const [salvandoDespesa, setSalvandoDespesa] = useState(false);

  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);
  const [despesaParaExcluir, setDespesaParaExcluir] = useState(null);

  const [despesas, setDespesas] = useState([]);
  const [graficoMensal, setGraficoMensal] = useState([]);

  const [resumo, setResumo] = useState({
    entradas: 0,
    saidas: 0,
    saldo: 0,
    pendente: 0,
  });

  const [novaDespesa, setNovaDespesa] = useState({
    descricao: "",
    categoria: "",
    categoriaOutro: "",
    valor: "",
    tipo: "saida",
  });

  useEffect(() => {
    carregarDespesas();
  }, []);

  function formatarMoeda(valor) {
    return Number(valor).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  async function carregarDespesas() {
    try {
      const dados = await listarFinanceiro();
      setDespesas(dados);
      setGraficoMensal(montarGraficoMensal(dados));

      let totalEntradas = 0;
      let totalSaidas = 0;

      dados.forEach((registro) => {
        if (registro.tipo === "entrada") {
          totalEntradas += Number(registro.valor);
        } else {
          totalSaidas += Number(registro.valor);
        }
      });

      setResumo({
        entradas: totalEntradas,
        saidas: totalSaidas,
        saldo: totalEntradas - totalSaidas,
        pendente: 0,
      });
    } catch (error) {
      console.log(error);
    }
  }

  function exportarCSV() {
    const cabecalho = ["Descrição", "Categoria", "Tipo", "Valor (R$)"];
    const linhas = despesas.map((d) => [
      `"${d.descricao}"`,
      `"${d.categoria}"`,
      d.tipo === "entrada" ? "Entrada" : "Saída",
      Number(d.valor).toFixed(2).replace(".", ","),
    ]);

    const conteudo = [cabecalho, ...linhas].map((l) => l.join(";")).join("\n");
    const blob = new Blob(["\uFEFF" + conteudo], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "financeiro.csv");
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function abrirModalNovaDespesa() {
    setEditandoId(null);
    setErroForm(null);
    setNovaDespesa({
      descricao: "",
      categoria: "",
      categoriaOutro: "",
      valor: "",
      tipo: "saida",
    });
    setModalAberto(true);
  }

  function validarDespesa() {
    if (!novaDespesa.descricao.trim()) {
      return "Informe a descrição do lançamento.";
    }
    if (!novaDespesa.categoria) {
      return "Selecione uma categoria.";
    }
    if (novaDespesa.categoria === "Outros" && !novaDespesa.categoriaOutro.trim()) {
      return "Digite o nome da categoria personalizada.";
    }
    if (!novaDespesa.valor || Number(novaDespesa.valor) <= 0) {
      return "Informe um valor maior que zero.";
    }
    return null;
  }

  async function salvarDespesa() {
    const erroValidacao = validarDespesa();
    if (erroValidacao) {
      setErroForm(erroValidacao);
      return;
    }

    const categoriaFinal =
      novaDespesa.categoria === "Outros"
        ? novaDespesa.categoriaOutro
        : novaDespesa.categoria;

    const payload = {
      descricao: novaDespesa.descricao,
      categoria: categoriaFinal,
      tipo: novaDespesa.tipo,
      valor: Number(novaDespesa.valor),
    };

    setSalvandoDespesa(true);
    setErroForm(null);
    try {
      if (editandoId) {
        await editarDespesa(editandoId, payload);
      } else {
        await criarDespesa(payload);
      }
      await carregarDespesas();
      setNovaDespesa({ descricao: "", categoria: "", categoriaOutro: "", valor: "", tipo: "saida" });
      setEditandoId(null);
      setModalAberto(false);
    } catch (error) {
      const detalhe = error?.response?.data?.detail;
      setErroForm(typeof detalhe === "string" ? detalhe : "Não foi possível salvar o lançamento. Tente novamente.");
    } finally {
      setSalvandoDespesa(false);
    }
  }

  function abrirEdicao(despesa) {
    setEditandoId(despesa.id);
    setErroForm(null);
    setNovaDespesa({
      descricao: despesa.descricao,
      categoria: despesa.categoria,
      categoriaOutro: "",
      valor: despesa.valor,
      tipo: despesa.tipo,
    });
    setModalAberto(true);
  }

  function abrirModalExcluir(despesa) {
    setDespesaParaExcluir(despesa);
    setModalExcluirAberto(true);
  }

  function cancelarExclusao() {
    setDespesaParaExcluir(null);
    setModalExcluirAberto(false);
  }

  async function confirmarExclusao() {
    try {
      await deletarDespesa(despesaParaExcluir.id);
      await carregarDespesas();
      setDespesaParaExcluir(null);
      setModalExcluirAberto(false);
    } catch (error) {
      const detalhe = error?.response?.data?.detail;
      alert(typeof detalhe === "string" ? detalhe : "Erro ao remover despesa.");
    }
  }

  function fecharModalDespesa() {
    setModalAberto(false);
    setEditandoId(null);
    setErroForm(null);
    setNovaDespesa({ descricao: "", categoria: "", categoriaOutro: "", valor: "", tipo: "saida" });
  }

  return (
    <MainLayout>
      <div className="financeiro-page">

        {/* Cabeçalho */}
        <div className="financeiro-header">
          <h1>Relatório Financeiro</h1>

          <div className="financeiro-header-actions">
            <button className="export-btn" onClick={exportarCSV}>
              ⬇ Exportar CSV
            </button>

            <button className="btn-despesa" onClick={abrirModalNovaDespesa}>
              + Lançar Despesa
            </button>
          </div>
        </div>

        {/* Cards de resumo */}
        <div className="financeiro-cards">
          <div className="finance-card">
            <div className="finance-card-top">
              <span className="finance-card-label">Entradas (mês)</span>
              <span className="finance-card-icon green">💰</span>
            </div>
            <h2 className="green">{formatarMoeda(resumo.entradas)}</h2>
          </div>

          <div className="finance-card">
            <div className="finance-card-top">
              <span className="finance-card-label">Saídas (mês)</span>
              <span className="finance-card-icon red">📤</span>
            </div>
            <h2 className="red">{formatarMoeda(resumo.saidas)}</h2>
          </div>

          <div className="finance-card">
            <div className="finance-card-top">
              <span className="finance-card-label">Saldo</span>
              <span className="finance-card-icon blue">📊</span>
            </div>
            <h2 className={resumo.saldo >= 0 ? "green" : "red"}>
              {formatarMoeda(resumo.saldo)}
            </h2>
          </div>

          <div className="finance-card">
            <div className="finance-card-top">
              <span className="finance-card-label">Pendente</span>
              <span className="finance-card-icon orange">⏳</span>
            </div>
            <h2 className="orange">{formatarMoeda(resumo.pendente)}</h2>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="financeiro-content">
          <div className="financeiro-left">

            {/* Gráfico comparativo */}
            <div className="financeiro-box">
              <h2>Comparativo de Faturamento</h2>

              <div className="bar-chart-legenda">
                <span><i className="dot dot-entrada" /> Entradas</span>
                <span><i className="dot dot-saida" /> Saídas</span>
              </div>

              {(() => {
                const maiorValor = Math.max(
                  1,
                  ...graficoMensal.flatMap((m) => [m.entrada, m.saida])
                );

                return (
                  <div className="bar-chart">
                    {graficoMensal.map((mes) => (
                      <div key={mes.chave} className="bar-col">
                        <div className="bar-par">
                          <div
                            className="bar bar-entrada"
                            style={{ height: `${(mes.entrada / maiorValor) * 140}px` }}
                            title={`Entradas: ${formatarMoeda(mes.entrada)}`}
                          />
                          <div
                            className="bar bar-saida"
                            style={{ height: `${(mes.saida / maiorValor) * 140}px` }}
                            title={`Saídas: ${formatarMoeda(mes.saida)}`}
                          />
                        </div>
                        <span className="bar-label">{mes.label}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Tabela */}
            <div className="financeiro-box">
              <h2>Registro de Despesas</h2>

              <table className="expense-table">
                <thead>
                  <tr>
                    <th>Descrição</th>
                    <th>Categoria</th>
                    <th>Tipo</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>

                <tbody>
                  {despesas.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="tabela-vazia">
                        Nenhum lançamento registrado
                      </td>
                    </tr>
                  ) : (
                    despesas.map((despesa) => (
                      <tr key={despesa.id}>
                        <td>{despesa.descricao}</td>
                        <td>{despesa.categoria}</td>

                        <td>
                          <span className={`tipo-badge ${despesa.tipo}`}>
                            {despesa.tipo === "entrada" ? "↑ Entrada" : "↓ Saída"}
                          </span>
                        </td>

                        <td className={despesa.tipo === "entrada" ? "green" : "red"}>
                          <strong>{formatarMoeda(despesa.valor)}</strong>
                        </td>

                        <td>
                          <button
                            className="btn-acao edit"
                            onClick={() => abrirEdicao(despesa)}
                          >
                            Editar
                          </button>

                          <button
                            className="btn-acao delete"
                            onClick={() => abrirModalExcluir(despesa)}
                          >
                            Excluir
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar direita */}
          <aside className="financeiro-right">
            <div className="ticket-card">
              <p>Total de lançamentos</p>
              <h2>{despesas.length}</h2>
            </div>

            <div className="resumo-card">
              <h3>Resumo do período</h3>

              <div className="resumo-linha">
                <span>Entradas</span>
                <span className="green">{formatarMoeda(resumo.entradas)}</span>
              </div>

              <div className="resumo-linha">
                <span>Saídas</span>
                <span className="red">{formatarMoeda(resumo.saidas)}</span>
              </div>

              <div className="resumo-linha">
                <span>Saldo final</span>
                <span className={resumo.saldo >= 0 ? "green" : "red"}>
                  {formatarMoeda(resumo.saldo)}
                </span>
              </div>
            </div>
          </aside>
        </div>

        {/* Modal – Lançar / Editar */}
        {modalAberto && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editandoId ? "Editar Despesa" : "Lançar Despesa"}</h2>

              {erroForm && (
                <div className="alerta-form-erro">{erroForm}</div>
              )}

              <div className="modal-field">
                <label>Descrição <span className="campo-obrigatorio">*</span></label>
                <input
                  type="text"
                  placeholder="Ex: Manutenção do ar-condicionado"
                  value={novaDespesa.descricao}
                  onChange={(e) =>
                    setNovaDespesa({ ...novaDespesa, descricao: e.target.value })
                  }
                />
              </div>

              <div className="modal-field">
                <label>Categoria <span className="campo-obrigatorio">*</span></label>
                <select
                  value={novaDespesa.categoria}
                  onChange={(e) =>
                    setNovaDespesa({ ...novaDespesa, categoria: e.target.value, categoriaOutro: "" })
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
              </div>

              {novaDespesa.categoria === "Outros" && (
                <div className="modal-field">
                  <label>Especifique a categoria <span className="campo-obrigatorio">*</span></label>
                  <input
                    type="text"
                    placeholder="Digite a categoria"
                    value={novaDespesa.categoriaOutro}
                    onChange={(e) =>
                      setNovaDespesa({ ...novaDespesa, categoriaOutro: e.target.value })
                    }
                  />
                </div>
              )}

              <div className="modal-field">
                <label>Tipo <span className="campo-obrigatorio">*</span></label>
                <select
                  value={novaDespesa.tipo}
                  onChange={(e) =>
                    setNovaDespesa({ ...novaDespesa, tipo: e.target.value })
                  }
                >
                  <option value="saida">Saída</option>
                  <option value="entrada">Entrada</option>
                </select>
              </div>

              <div className="modal-field">
                <label>Valor <span className="campo-obrigatorio">*</span></label>
                <div className="input-money">
                  <span>R$</span>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={novaDespesa.valor}
                    onChange={(e) =>
                      setNovaDespesa({ ...novaDespesa, valor: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button className="btn-cancelar" onClick={fecharModalDespesa}>
                  Cancelar
                </button>

                <button className="btn-despesa" onClick={salvarDespesa} disabled={salvandoDespesa}>
                  {salvandoDespesa ? "Salvando..." : editandoId ? "Atualizar" : "Salvar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Modal – Confirmar exclusão */}
        {modalExcluirAberto && (
          <div className="modal-overlay">
            <div className="modal confirm-modal">
              <h2>Excluir lançamento</h2>

              <p>
                Tem certeza que deseja excluir o lançamento{" "}
                <strong>{despesaParaExcluir?.descricao}</strong>? Essa ação não pode ser desfeita.
              </p>

              <div className="modal-actions">
                <button className="btn-cancelar" onClick={cancelarExclusao}>
                  Cancelar
                </button>

                <button className="delete-confirm" onClick={confirmarExclusao}>
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
