/** g agit en premier (la machine la plus proche de x), f agit en second. */
export function CompositionIntroDiagram() {
  return (
    <svg viewBox="0 0 700 160" role="img" aria-label="Schéma de composition : x entre dans g, g(x) sort et entre dans f, f(g(x)) sort">
      <line x1="10" y1="80" x2="90" y2="80" className="svg-line" strokeWidth="2" markerEnd="url(#ci-arrow)" />
      <text x="45" y="66" textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="18">x</text>
      <rect x="100" y="40" width="110" height="80" rx="3" fill="none" className="svg-line" strokeWidth="2" />
      <text x="155" y="88" textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontSize="24" fontStyle="italic">g</text>
      <line x1="210" y1="80" x2="290" y2="80" className="svg-line" strokeWidth="2" markerEnd="url(#ci-arrow)" />
      <text x="250" y="66" textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="16">g(x)</text>
      <rect x="300" y="40" width="110" height="80" rx="3" fill="none" className="svg-accent-outline" strokeWidth="2" />
      <text x="355" y="88" textAnchor="middle" className="svg-accent" fontFamily="Fraunces, serif" fontSize="24" fontStyle="italic">f</text>
      <line x1="410" y1="80" x2="500" y2="80" className="svg-line" strokeWidth="2" markerEnd="url(#ci-arrow)" />
      <rect x="510" y="40" width="180" height="80" rx="3" className="svg-faint" fill="none" strokeWidth="1.5" strokeDasharray="3 4" />
      <text x="600" y="88" textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontSize="19" fontStyle="italic">f(g(x))</text>
      <path d="M155,135 Q355,175 600,135" fill="none" className="svg-accent-outline" strokeWidth="1.5" strokeDasharray="2 3" />
      <text x="355" y="158" textAnchor="middle" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13">f ∘ g</text>
      <defs>
        <marker id="ci-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
          <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
        </marker>
      </defs>
    </svg>
  )
}
