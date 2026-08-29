/** "Une fonction, c'est une machine" — x entre, f(x) sort. */
export function MachineDiagram() {
  return (
    <svg viewBox="0 0 640 140" role="img" aria-label="Schéma d'une fonction comme une machine : x entre, f(x) sort">
      <line x1="20" y1="70" x2="120" y2="70" className="svg-line" strokeWidth="2" markerEnd="url(#machine-arrow)" />
      <text x="60" y="55" textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="20">x</text>
      <rect x="130" y="30" width="140" height="80" rx="3" fill="none" className="svg-accent-outline" strokeWidth="2" />
      <text x="200" y="76" textAnchor="middle" className="svg-accent" fontFamily="Fraunces, serif" fontSize="26" fontStyle="italic">f</text>
      <line x1="270" y1="70" x2="380" y2="70" className="svg-line" strokeWidth="2" markerEnd="url(#machine-arrow)" />
      <text x="325" y="55" textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="14">calcul</text>
      <rect x="390" y="30" width="230" height="80" rx="3" className="svg-faint" fill="none" strokeWidth="1.5" strokeDasharray="3 4" />
      <text x="505" y="76" textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontSize="22" fontStyle="italic">f(x)</text>
      <defs>
        <marker id="machine-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
