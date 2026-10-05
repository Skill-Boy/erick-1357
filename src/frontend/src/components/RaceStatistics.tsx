const snailWins = [
  { name: 'Turbo', wins: 2, color: '#0b4dbb' },
  { name: 'Menta', wins: 1, color: '#16a864' },
  { name: 'Bruma', wins: 1, color: '#7646f5' },
  { name: 'Lima', wins: 1, color: '#f59023' },
  { name: 'Nube', wins: 1, color: '#0c80ce' },
  { name: 'Mora', wins: 0, color: '#a8b6ca' }
]

interface RaceStatisticsProps {
  balance: string;
}

export function RaceStatistics({ balance }: RaceStatisticsProps) {
  return (
    <>
      <section className="welcome" id="inicio">
        <div>
          <p className="eyebrow">Resumen del día</p>
          <h2>Actividad de la pista</h2>
          <p>Resultados simulados de las seis carreras programadas.</p>
        </div>
        <div className="balance"><span>Saldo actual</span><strong>{balance}</strong><small>Disponible para recargas simuladas</small></div>
      </section>
      <section className="summary-strip" aria-label="Registros del día">
        <div><strong>6</strong><span>Carreras</span></div>
        <div><strong>4</strong><span>Apuestas ganadas</span></div>
        <div><strong>2</strong><span>Apuestas perdidas</span></div>
        <div><strong>6</strong><span>Caracoles activos</span></div>
      </section>
      <section className="stats-grid" id="carreras" aria-label="Estadísticas del día">
        <article className="chart-card">
          <div className="card-heading"><div><p className="card-label">Apuestas</p><h2>Resultados</h2></div><span className="card-chip">Hoy</span></div>
          <div className="donut" aria-label="4 apuestas ganadas y 2 perdidas"><span>67%<small>acierto</small></span></div>
          <div className="legend"><span><i className="win-dot" />Ganadas <strong>4</strong></span><span><i className="loss-dot" />Perdidas <strong>2</strong></span></div>
        </article>
        <article className="chart-card wins-card">
          <div className="card-heading"><div><p className="card-label">Carreras</p><h2>Victorias por caracol</h2></div><span className="card-chip">6 en total</span></div>
          <div className="bar-chart" aria-label="Gráfica de victorias por caracol">
            {snailWins.map((snail) => (
              <div className="bar-column" key={snail.name}>
                <span className="bar-value">{snail.wins}</span>
                <div className="bar-track"><i style={{ height: `${snail.wins * 42}%`, background: snail.color }} /></div>
                <span>{snail.name}</span>
              </div>
            ))}
          </div>
        </article>
      </section>
    </>
  )
}