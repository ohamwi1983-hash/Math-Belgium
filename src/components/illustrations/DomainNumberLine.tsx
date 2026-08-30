import type { IllustrationSpec } from '../../content/types'

type Props = Extract<IllustrationSpec, { kind: 'domainLine' }>

const AXIS_Y = 60
const SEGMENT_Y = 46
const PLOT_LEFT = 70
const PLOT_RIGHT = 600

/** Droite graduée : trait plein = valeurs acceptées, rond vide = point exclu. */
export function DomainNumberLine({ min, max, segments, points, extraTicks, signLabels, axisLabel }: Omit<Props, 'caption'>) {
  const toX = (value: number) => PLOT_LEFT + ((value - min) / (max - min)) * (PLOT_RIGHT - PLOT_LEFT)
  const resolve = (endpoint: number | 'min' | 'max') =>
    endpoint === 'min' ? PLOT_LEFT : endpoint === 'max' ? PLOT_RIGHT : toX(endpoint)

  return (
      <svg viewBox="0 0 640 120" role="img" aria-label={`Droite graduée montrant le domaine, avec l'axe ${axisLabel}`}>
        <line x1="20" y1={AXIS_Y} x2="620" y2={AXIS_Y} className="svg-line" strokeWidth="1.5" markerEnd="url(#domain-arrow)" />

        {segments.map((seg, i) => (
          <line
            key={i}
            x1={resolve(seg.from)}
            y1={SEGMENT_Y}
            x2={resolve(seg.to)}
            y2={SEGMENT_Y}
            className="svg-good"
            strokeWidth="4"
          />
        ))}

        {extraTicks?.map((tick, i) => (
          <g key={i}>
            <line x1={toX(tick.value)} y1={AXIS_Y - 5} x2={toX(tick.value)} y2={AXIS_Y + 5} className="svg-faint" strokeWidth="1" />
            <text x={toX(tick.value)} y={AXIS_Y + 42} textAnchor="middle" className="svg-ink" fontFamily="IBM Plex Mono, monospace" fontSize="12" opacity="0.7">
              {tick.label}
            </text>
          </g>
        ))}

        {points.map((pt, i) => {
          const x = toX(pt.value)
          const toneClass = pt.tone === 'good' ? 'svg-good' : 'svg-bad'
          const toneVar = pt.tone === 'good' ? 'var(--good)' : 'var(--bad)'
          return (
            <g key={i}>
              {!pt.closed && (
                <line x1={x} y1={AXIS_Y - 28} x2={x} y2={AXIS_Y} className="svg-faint" strokeWidth="1" strokeDasharray="2 3" />
              )}
              <circle
                cx={x}
                cy={SEGMENT_Y}
                r="5"
                // Inline `style` (not the `fill`/`stroke` attributes) so the "open circle" fill
                // actually wins over the .svg-good/.svg-bad class rules: a CSS class always beats
                // a plain SVG presentation attribute, which would otherwise render every point filled.
                style={{ fill: pt.closed ? toneVar : 'var(--surface)', stroke: toneVar }}
                strokeWidth={pt.closed ? 1.5 : 2.5}
              />
              <text x={x} y={AXIS_Y + 25} textAnchor="middle" className={toneClass} fontFamily="IBM Plex Mono, monospace" fontSize="14" fontWeight="600">
                {pt.label}
              </text>
              {pt.sublabel && (
                <text x={x} y={AXIS_Y + 45} textAnchor="middle" className={toneClass} fontFamily="IBM Plex Mono, monospace" fontSize="11">
                  {pt.sublabel}
                </text>
              )}
            </g>
          )
        })}

        {signLabels?.map((s, i) => (
          <text
            key={i}
            x={toX(s.value)}
            y={AXIS_Y - 30}
            textAnchor="middle"
            className={s.sign === '+' ? 'svg-good' : 'svg-bad'}
            fontFamily="Fraunces, serif"
            fontStyle="italic"
            fontSize="14"
          >
            {s.sign}
          </text>
        ))}

        <text x={(PLOT_LEFT + PLOT_RIGHT) / 2} y={AXIS_Y - 30} textAnchor="middle" className="svg-ink" fontFamily="Fraunces, serif" fontStyle="italic" fontSize="15">
          {axisLabel}
        </text>

        <defs>
          <marker id="domain-arrow" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
            <path d="M0,0 L8,4 L0,8 Z" className="svg-line" fill="currentColor" />
          </marker>
        </defs>
      </svg>
  )
}
