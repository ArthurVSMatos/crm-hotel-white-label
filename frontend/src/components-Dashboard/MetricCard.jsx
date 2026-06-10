export default function MetricCard({
  titulo,
  valor,
  crescimento,
  icone,
}) {
  return (
    <div className="metric-card">

      <div className="card-top">
        <div className="card-icon">
          {icone}
        </div>

        {crescimento && (
          <span className="growth">
            {crescimento}
          </span>
        )}
      </div>

      <p className="card-title">
        {titulo}
      </p>

      <h2 className="card-value">
        {valor}
      </h2>

    </div>
  );
}