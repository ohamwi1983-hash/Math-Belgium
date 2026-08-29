/** La valeur lue en sortie du premier graphe redevient l'entrée du second (méthode, sans chiffres). */
export function CompositionSchematicDiagram() {
  return (
    <svg viewBox="0 0 640 340" role="img" aria-label="Deux graphes empilés illustrant la lecture graphique de g rond f en a">
      <text x="20" y="24" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="18">
        C<tspan baselineShift="sub" fontSize="12">f</tspan>
      </text>
      <line x1="20" y1="30" x2="620" y2="30" className="svg-faint" strokeWidth="1" />
      <line x1="60" y1="10" x2="60" y2="140" className="svg-line" strokeWidth="1.5" />
      <line x1="20" y1="130" x2="620" y2="130" className="svg-line" strokeWidth="1.5" />
      <path d="M60,120 C160,40 260,150 380,70" fill="none" className="svg-line" strokeWidth="2.5" />
      <line x1="220" y1="130" x2="220" y2="98" className="svg-accent" strokeWidth="1.5" strokeDasharray="3 3" />
      <circle cx="220" cy="98" r="4" className="svg-accent" />
      <line x1="220" y1="98" x2="60" y2="98" className="svg-accent" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="220" y="150" textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="13">a</text>
      <text x="45" y="102" textAnchor="end" className="svg-accent" fontFamily="IBM Plex Mono, monospace" fontSize="13">f(a)</text>
      <text x="330" y="120" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">① lire f(a)</text>

      <text x="20" y="200" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="18">
        C<tspan baselineShift="sub" fontSize="12">g</tspan>
      </text>
      <line x1="60" y1="186" x2="60" y2="316" className="svg-line" strokeWidth="1.5" />
      <line x1="20" y1="306" x2="620" y2="306" className="svg-line" strokeWidth="1.5" />
      <path d="M60,300 C160,260 260,300 420,210" fill="none" className="svg-line" strokeWidth="2.5" />
      <line x1="98" y1="98" x2="98" y2="306" className="svg-good" strokeWidth="1.5" strokeDasharray="3 3" />
      <line x1="98" y1="291" x2="98" y2="306" className="svg-good" strokeWidth="1.5" />
      <circle cx="98" cy="291" r="4" className="svg-good" />
      <line x1="98" y1="291" x2="60" y2="291" className="svg-good" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="98" y="326" textAnchor="middle" className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="13">f(a)</text>
      <text x="45" y="295" textAnchor="end" className="svg-good" fontFamily="IBM Plex Mono, monospace" fontSize="13">g(f(a))</text>
      <text x="330" y="290" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12">② reporter f(a), lire g(f(a))</text>
    </svg>
  )
}
