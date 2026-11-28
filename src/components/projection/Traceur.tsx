import { useId, useMemo, useRef, useState } from 'react'
import { useCompacte } from './useCompacte'
import { MathInline } from '../Math'
import { normaliserSigneMoins } from '../../lib/normaliserSaisie'
import { ECHELLES, lireFonction, NOMS_COURBES, placeEtiquette, pointsRemarquables, texteGraduation, traceMemorise, versPxX, versPxY } from '../../lib/projection/traceur'
import type { CourbeACalculer, Fonction, PointRemarquable } from '../../lib/projection/traceur'
import type { Courbe, PageBlanche } from '../../lib/projection/annotations'
import { clePageBlanche } from '../../lib/projection/annotations'
import { avecEchelle, repereVue, vueDe } from '../../lib/projection/vue'
import { COULEURS_STYLO, EPAISSEURS } from './BarreOutils'
import type { OutilsLocaux } from './BarreOutils'
import type { MagasinAnnotations } from './magasinAnnotations'
import { useVersionAnnotations } from './magasinAnnotations'
import { Pictogramme } from './Pictogrammes'
import type { Projection } from './useProjection'
import { PARAMETRE_DEFAUT, parametresDe, valeursCourbe } from '../../lib/projection/traceurEnrichi'
import { CurseursParametres, OngletAire, OngletPoints, OngletsTraceur, OngletTangente } from './TraceurEnrichi'

const NOMS_POINTS: Record<PointRemarquable['genre'], string> = { zero: 'Zéro', extremum: 'Extremum', intersection: 'Intersection' }

/** Largeur approximative (px) d'une étiquette KaTeX de coordonnées, pour éviter les chevauchements. */
function largeurEtiquette(latex: string): number {
  const visible = latex
    .replace(/\\(left|right|approx|sqrt|frac|dfrac|pi|,|;)/g, (m) => (m === '\\approx' || m === '\\pi' || m === '\\sqrt' ? 'x' : ''))
    .replace(/[{}\\]/g, '')
  return 14 + visible.length * 11
}

/**
 * Étiquettes des courbes d'une page « repère » (nom f, g, h… près de la courbe, dans sa couleur) et points
 * remarquables demandés (zéros, extremums, intersections) avec leurs coordonnées en KaTeX. Rendu identique à
 * l'écran et dans l'export annoté (même composant).
 */
export function EtiquettesCourbes({ courbes, page, instant = 0 }: { courbes: Courbe[]; page: PageBlanche; instant?: number }) {
  // Repère de la VUE (zoom, déplacement) : noms, points et coordonnées d'écran suivent le graphique.
  const r = useMemo(() => repereVue(page), [page])
  const { noms, points } = useMemo(() => {
    const calculables: (CourbeACalculer & { courbe: Courbe })[] = []
    const noms: { c: Courbe; x: number; y: number }[] = []
    const prises: [number, number][] = []
    const maintenant = Date.now()
    for (const c of courbes) {
      // Paramètres à leur valeur du moment (animation : `instant` relance le calcul 10 fois par seconde).
      const t = traceMemorise(c.saisie, page.angle, r, valeursCourbe(c, maintenant))
      if (!t.f) continue
      calculables.push({ id: c.id, f: t.f as Fonction, courbe: c })
      const p = placeEtiquette(t.polylignes, prises)
      if (p) {
        prises.push(p)
        noms.push({ c, x: p[0], y: p[1] })
      }
    }
    const m = page.marques
    const points = m.zeros || m.extremums || m.intersections ? pointsRemarquables(calculables, r, m) : []
    return { noms, points }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courbes, page, r, instant])

  // Étiquettes des points : en haut à droite du point, sinon un autre coin, sans se chevaucher ni sortir du cadre.
  const poses: { p: PointRemarquable; x: number; y: number; l: number; couleur: string }[] = []
  const boites: [number, number, number, number][] = noms.map((n) => [n.x + 8, n.y < 60 ? n.y + 8 : n.y - 44, 44, 42])
  for (const p of points) {
    const px = versPxX(p.x, r)
    const py = versPxY(p.y, r)
    const l = largeurEtiquette(p.latex)
    const h = 34
    const essais: [number, number][] = [
      [px + 10, py - h - 6],
      [px - l - 10, py - h - 6],
      [px + 10, py + 8],
      [px - l - 10, py + 8],
    ]
    let choix = essais[0]
    for (const [x, y] of essais) {
      const dedans = x >= 4 && x + l <= 1276 && y >= 4 && y + h <= 716
      const libre = boites.every(([bx, by, bl, bh]) => x + l < bx || bx + bl < x || y + h < by || by + bh < y)
      if (dedans && libre) {
        choix = [x, y]
        break
      }
    }
    const [x, y] = [Math.max(4, Math.min(1276 - l, choix[0])), Math.max(4, Math.min(716 - h, choix[1]))]
    boites.push([x, y, l, h])
    const c = courbes.find((k) => k.id === p.courbes[0])
    poses.push({ p, x, y, l, couleur: p.genre === 'intersection' ? '#182430' : (c?.couleur ?? '#182430') })
  }

  return (
    <div className="traceur-calque" aria-hidden="true">
      <svg width={1280} height={720} viewBox="0 0 1280 720" className="traceur-points">
        {poses.map(({ p, couleur }, i) => (
          <circle key={i} cx={versPxX(p.x, r)} cy={versPxY(p.y, r)} r={7} fill="#fff" stroke={couleur} strokeWidth={4} />
        ))}
      </svg>
      {noms.map(({ c, x, y }) => (
        <span key={c.id} className="traceur-nom" style={{ left: Math.min(x + 10, 1236), top: y < 60 ? y + 8 : y - 44, color: c.couleur }}>
          <MathInline tex={c.nom} />
        </span>
      ))}
      {poses.map(({ p, x, y, couleur }, i) => (
        <span key={i} className="traceur-point" style={{ left: x, top: y, borderColor: couleur }} title={NOMS_POINTS[p.genre]} data-tex={p.latex}>
          <MathInline tex={p.latex} />
        </span>
      ))}
    </div>
  )
}

/** Hauteur offerte au traceur : sous la petite barre de l'écran blanc, jusqu'à la réserve du bas (`--bas-outils`). */
function hauteurTraceur(el: HTMLElement): number {
  const boite = el.parentElement
  const parent = boite?.offsetParent as HTMLElement | null
  if (!boite || !parent) return 0
  const reserve = parseFloat(getComputedStyle(boite).getPropertyValue('--bas-outils')) || 0
  let autres = 0
  for (const enfant of Array.from(boite.children)) if (enfant !== el) autres += (enfant as HTMLElement).offsetHeight + 6
  return parent.clientHeight - boite.offsetTop - reserve - autres
}

/** Couleur d'une nouvelle courbe : la première couleur du stylo pas encore prise sur la page. */
function couleurLibre(courbes: Courbe[]): string {
  const ordre = [COULEURS_STYLO[1], COULEURS_STYLO[0], COULEURS_STYLO[2], COULEURS_STYLO[3]]
  return (ordre.find((c) => !courbes.some((k) => k.couleur === c.valeur)) ?? ordre[courbes.length % ordre.length]).valeur
}

/**
 * Traceur de fonctions (palette du fond « repère ») : « f(x) = » en saisie libre JAMAIS bloquée (`type="text"`,
 * seul `normaliserSigneMoins`), lue par le parseur maison de la calculatrice étendu à x ; « Tracer » (ou Entrée) ;
 * angles en radians par défaut (choix DEG / RAD visible) ; échelle par axe ; points remarquables à marquer ; liste
 * des courbes avec × (retirer). Une courbe est un élément d'annotation de la page (annuler, tout effacer, deux
 * écrans, export, conservation).
 */
export function PaletteTraceur({
  id,
  projection,
  annotations,
  page,
  outils,
  replier,
  setOutils,
}: {
  id?: string
  projection: Projection
  annotations: MagasinAnnotations
  page: PageBlanche
  outils: OutilsLocaux
  /** Replié sur le bouton f(x) dès qu'une courbe est tracée (la liste reste accessible en rouvrant). */
  replier?: () => void
  /** Onglets Courbes / Points / Tangente / Aire (traceur enrichi, P3). */
  setOutils?: (f: (o: OutilsLocaux) => OutilsLocaux) => void
}) {
  useVersionAnnotations(annotations)
  const cle = clePageBlanche(page.id)
  const courbes = annotations.courbes(cle)
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const idChamp = useId()
  const nom = NOMS_COURBES.find((n) => !courbes.some((c) => c.nom === n)) ?? `f${courbes.length + 1}`
  const apercu = saisie.trim() ? lireFonction(saisie, page.angle) : null

  const tracer = () => {
    const l = lireFonction(saisie, page.angle)
    if (!l.ok) {
      setErreur(l.erreur)
      return
    }
    setErreur(null)
    // Lettres autres que x : un curseur par lettre (valeur de départ 1), le panneau reste ouvert pour les régler.
    const lettres = parametresDe(l.saisie)
    const courbe: Courbe = {
      genre: 'courbe',
      id: `${projection.id}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
      nom,
      saisie: l.saisie,
      couleur: couleurLibre(courbes),
      epaisseur: Math.max(4, EPAISSEURS[outils.epaisseur]),
      ...(lettres.length ? { params: Object.fromEntries(lettres.map((n) => [n, { ...PARAMETRE_DEFAUT }])) } : {}),
    }
    annotations.ajouter(cle, courbe)
    setSaisie('')
    if (!lettres.length) replier?.()
  }
  const onglet = outils.ongletTraceur ?? 'courbes'
  const vue = vueDe(page)
  const ref = useRef<HTMLDivElement>(null)
  const compacte = useCompacte(ref, hauteurTraceur)

  return (
    <div
      ref={ref}
      id={id}
      className={`projection-palette projection-palette--traceur projection-interactif${compacte ? ' compacte' : ''}`}
      role="group"
      aria-label="Traceur de fonctions sur le repère"
    >
      {setOutils && <OngletsTraceur onglet={onglet} setOutils={setOutils} />}
      {onglet === 'points' && <OngletPoints annotations={annotations} page={page} />}
      {onglet === 'tangente' && <OngletTangente annotations={annotations} page={page} />}
      {onglet === 'aire' && <OngletAire annotations={annotations} page={page} />}
      {/* Trois blocs : saisie + liste, réglages (angles, échelles), points à marquer — empilés dans le panneau étroit,
          côte à côte quand la hauteur manque (écran bas en paysage, vue du professeur). */}
      {onglet === 'courbes' && (
      <>
      <div className="traceur-bloc traceur-bloc--saisie">
        <form
          className="traceur-ligne traceur-ligne--saisie"
          onSubmit={(e) => {
            e.preventDefault()
            tracer()
          }}
        >
          <label className="traceur-etiquette" htmlFor={idChamp}>
            <MathInline tex={`${nom}(x) =`} />
          </label>
          <input
            id={idChamp}
            className="traceur-saisie"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            placeholder="ex. x² − 2x − 3"
            value={saisie}
            aria-invalid={erreur ? true : undefined}
            aria-describedby={erreur ? `${idChamp}-erreur` : undefined}
            onChange={(e) => {
              setSaisie(normaliserSigneMoins(e.target.value))
              setErreur(null)
            }}
          />
          <button type="submit" className="projection-duree traceur-tracer">
            Tracer
          </button>
        </form>
        <span className="traceur-apercu" aria-live="polite">
          {apercu?.ok ? <MathInline tex={`${nom}(x) = ${apercu.latex}`} /> : null}
        </span>
        {erreur && (
          <p id={`${idChamp}-erreur`} className="traceur-erreur" role="alert">
            {erreur}
          </p>
        )}
        {courbes.length > 0 && (
          <ul className="traceur-liste" aria-label="Courbes tracées">
            {courbes.map((c) => {
              const l = lireFonction(c.saisie, page.angle)
              return (
                <li key={c.id} className="traceur-courbe" style={{ ['--c' as string]: c.couleur }} data-tex={l.ok ? l.latex : c.saisie}>
                  <span className="traceur-pastille" aria-hidden="true" />
                  <MathInline tex={l.ok ? `${c.nom}(x) = ${l.latex}` : `${c.nom}`} />
                  <button type="button" className="traceur-retirer" aria-label={`Retirer la courbe ${c.nom}`} title={`Retirer la courbe ${c.nom}`} onClick={() => annotations.retirer(cle, c.id)}>
                    <Pictogramme nom="fermer" taille={16} />
                  </button>
                </li>
              )
            })}
          </ul>
        )}
        {courbes.map((c) => c.params && <CurseursParametres key={c.id} annotations={annotations} cle={cle} courbe={c} page={page} />)}
      </div>
      <div className="traceur-bloc traceur-bloc--reglages">
        <span className="traceur-groupe" role="group" aria-label="Angles des fonctions trigonométriques">
          {(
            [
              ['rad', 'RAD', 'Angles en radians'],
              ['deg', 'DEG', 'Angles en degrés'],
            ] as const
          ).map(([v, l, aide]) => (
            <button key={v} type="button" className="projection-duree traceur-choix" aria-pressed={page.angle === v} title={aide} onClick={() => projection.majPage({ angle: v })}>
              {l}
            </button>
          ))}
        </span>
        {(['ex', 'ey'] as const).map((axe) => (
          <span key={axe} className="traceur-groupe traceur-echelle" role="group" aria-label={axe === 'ex' ? 'Échelle de l’axe des abscisses : un carreau vaut' : 'Échelle de l’axe des ordonnées : un carreau vaut'}>
            <span className="traceur-axe" aria-hidden="true">
              <MathInline tex={axe === 'ex' ? 'x' : 'y'} /> :<span className="traceur-axe-long"> 1 carreau =</span>
            </span>
            {ECHELLES.map((v) => (
              <button key={v} type="button" className="projection-duree traceur-choix" aria-pressed={vue[axe] === v} title={`1 carreau = ${texteGraduation(v)}`} onClick={() => projection.majPage({ vue: avecEchelle(vue, axe, v) })}>
                {texteGraduation(v)}
              </button>
            ))}
          </span>
        ))}
      </div>
      <div className="traceur-bloc traceur-bloc--marques">
        {(
          [
            ['zeros', 'Zéros'],
            ['extremums', 'Sommet / extremums'],
            ['intersections', 'Intersections'],
          ] as const
        ).map(([k, l]) => (
          <label key={k} className="traceur-case">
            <input type="checkbox" checked={page.marques[k]} onChange={(e) => projection.majPage({ marques: { ...page.marques, [k]: e.target.checked } })} />
            {l}
          </label>
        ))}
      </div>
      </>
      )}
    </div>
  )
}
