export function Sidebar() {
  return (
    <aside className="sidebar">
      <a className="brand" href="#inicio"><span className="brand-mark">S</span><strong>SnailCircuit</strong></a>
      <nav aria-label="Navegación principal">
        <a className="nav-item active" href="#inicio"><span>Resumen</span></a>
        <a className="nav-item" href="#carreras"><span>Carreras</span></a>
        <a className="nav-item" href="#recarga"><span>Recargar saldo</span></a>
      </nav>
      <div className="sidebar-footer"><span className="status-dot" />Pista en línea</div>
    </aside>
  )
}