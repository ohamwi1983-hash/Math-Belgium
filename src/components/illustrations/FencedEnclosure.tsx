import type { IllustrationSpec } from '../../content/types'

type Props = Omit<Extract<IllustrationSpec, { kind: 'fencedEnclosure' }>, 'caption'>

/**
 * Enclos rectangulaire adossé à un mur : deux côtés égaux (étiquetés `sideLabel`) et un côté
 * opposé au mur (étiqueté `baseLabel`). Schéma géométrique, pas une courbe — reste un kind
 * distinct plutôt que d'être forcé dans `curvePlot`.
 */
export function FencedEnclosure({ wallLabel, sideLabel, baseLabel }: Props) {
  return (
    <svg viewBox="0 0 460 220" role="img" aria-label={`Enclos rectangulaire adossé à un mur, deux côtés ${sideLabel}, base ${baseLabel}`}>
      <line x1="55" y1="40" x2="405" y2="40" className="svg-line" strokeWidth="5" strokeLinecap="round" />
      <g className="svg-line" strokeWidth="1.6">
        {[65, 90, 115, 140, 165, 190, 215, 240, 265, 290, 315, 340, 365, 390].map((x) => (
          <line key={x} x1={x} y1="40" x2={x - 10} y2="52" />
        ))}
      </g>
      <text x="230" y="24" textAnchor="middle" fontFamily="Work Sans, sans-serif" fontSize="12.5" className="svg-ink">
        {wallLabel}
      </text>

      <path d="M60,42 L60,168 L400,168 L400,42" fill="none" className="svg-accent-outline" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />

      <line x1="30" y1="42" x2="30" y2="168" className="svg-faint" strokeWidth="1" />
      <line x1="24" y1="42" x2="36" y2="42" className="svg-faint" strokeWidth="1" />
      <line x1="24" y1="168" x2="36" y2="168" className="svg-faint" strokeWidth="1" />
      <text x="18" y="109" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fontWeight="600" className="svg-accent" transform="rotate(-90 18 109)">
        {sideLabel}
      </text>

      <line x1="430" y1="42" x2="430" y2="168" className="svg-faint" strokeWidth="1" />
      <line x1="424" y1="42" x2="436" y2="42" className="svg-faint" strokeWidth="1" />
      <line x1="424" y1="168" x2="436" y2="168" className="svg-faint" strokeWidth="1" />
      <text x="448" y="109" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fontWeight="600" className="svg-accent" transform="rotate(-90 448 109)">
        {sideLabel}
      </text>

      <line x1="60" y1="192" x2="400" y2="192" className="svg-faint" strokeWidth="1" />
      <line x1="60" y1="186" x2="60" y2="198" className="svg-faint" strokeWidth="1" />
      <line x1="400" y1="186" x2="400" y2="198" className="svg-faint" strokeWidth="1" />
      <text x="230" y="212" textAnchor="middle" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15" fontWeight="600" className="svg-accent">
        {baseLabel}
      </text>
    </svg>
  )
}
