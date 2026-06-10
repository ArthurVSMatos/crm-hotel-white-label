import MainLayout from "../../../components/Layout/MainLayout";
import "./Financeiro.css";

export default function Financeiro() {
  return (
    <MainLayout>
      <div className="financeiro-page">
        <div className="financeiro-header">
          <h1>Relatório Financeiro</h1>
          <button className="btn-despesa">+ Lançar Despesa</button>
        </div>

        <div className="financeiro-cards">
          <div className="finance-card">
            <p>ENTRADAS(MÊS)</p>
            <h2 className="green">R$ 12.450</h2>
          </div>

          <div className="finance-card">
            <p>SAÍDA(MÊS)</p>
            <h2 className="red">R$ 3.120</h2>
          </div>

          <div className="finance-card">
            <p>SALDO</p>
            <h2>R$ 9.330</h2>
          </div>

          <div className="finance-card">
            <p>PENDENTE</p>
            <h2 className="orange">R$ 15.200</h2>
          </div>
        </div>

        <div className="financeiro-content">
          <div className="financeiro-left">
            <h2>Comparativo de Faturamento (Meses Passados)</h2>

            <div className="bar-chart">
              <div className="bar small"></div>
              <div className="bar medium"></div>
              <div className="bar large"></div>
              <div className="bar small"></div>
              <div className="bar medium"></div>
            </div>

            <h2>Registro de Despesas Recentes</h2>

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
                <tr>
                  <td>Manutenção Ar-Condicionado</td>
                  <td>Manutenção</td>
                  <td className="red">R$ 450,00</td>
                  <td>
                    <button className="edit">EDITAR</button>
                    <button className="delete">DELETAR</button>
                  </td>
                </tr>

                <tr>
                  <td>Conta de Energia - Abr/26</td>
                  <td>Serviços</td>
                  <td className="red">R$ 200,00</td>
                  <td>
                    <button className="edit">EDITAR</button>
                    <button className="delete">DELETAR</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <aside className="financeiro-right">
            <div className="ticket-card">
              <p>Ticket Médio</p>
              <h2>R$ 380,00</h2>
            </div>

            <button className="export-btn">Exportar PDF</button>
          </aside>
        </div>
      </div>
    </MainLayout>
  );
}