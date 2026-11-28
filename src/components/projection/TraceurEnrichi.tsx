import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { MathInline } from '../Math'
import { normaliserSigneMoins } from '../../lib/normaliserSaisie'
import { analyser, evaluer, ErreurCalcul } from '../../lib/projection/calculatrice'
import { clePageBlanche } from '../../lib/projection/annotations'
import type { Courbe, ElementAnnotation, PageBlanche } from '../../lib/projection/annotations'
import { lireFonction, traceMemorise, versPxX, versPxY } from '../../lib/projection/traceur'
import {
  avecTraces,
  calculerAire,
  calculerTangente,
  COULEUR_TANGENTE,
  COULEURS_LIAISONS,
  COULEURS_POINTS,
  debutAnimation,
  estAnimee,
  fonctionCourbe,
  latexNombre,
  latexSubstitue,
  lirePoint,
  pasTriangle,
  prendrePassages,
  surCran,
  texteParametre,
  valeurAnimee,
  valeursCourbe,
} from '../../lib/projection/traceurEnrichi'
import type { Aire, Liaison, Parametre, PointRepere, Tangente } from '../../lib/projection/traceurEnrichi'
import { ecranVersRepere, graduations, repereVue, vueDe } from '../../lib/projection/vue'
import type { OutilsLocaux } from './BarreOutils'
import type { MagasinAnnotations } from './magasinAnnotations'
import { suivrePointeur } from './ObjetsPage'
import { Pictogramme } from './Pictogrammes'
import { PictoBlanc } from './PictosEcranBlanc'
import './ecran-blanc.css'

/**
 * Traceur enrichi (planche P3 du 28/11/2026) : onglets Courbes / Points / Tangente / Aire du panneau du traceur, curseurs
 * des paramètres (animés), étiquettes sur le repère, poignées (point de la tangente, bornes de l'aire, points). Les
 * onglets ne sont jamais imposés : fermés, le traceur est celui d'avant. Pour toutes les années.
 */

type SetOutils = (f: (o: OutilsLocaux) => OutilsLocaux) => void
type P = [number, number]
export type OngletTraceur = NonNullable<OutilsLocaux['ongletTraceur']>

const nouvelId = () => `t${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
const estGenre = <G extends ElementAnnotation['genre']>(g: G) => (e: ElementAnnotation): e is Extract<ElementAnnotation, { genre: G }> => e.genre === g
const borne = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v))

/** Valeur tapée (« 1/2 », « π/4 », « −1,5 ») ; message clair sinon. */
function lireValeur(s: string): { ok: true; v: number } | { ok: false; erreur: string } {
  try {
    const v = evaluer(analyser(s.trim()), 'rad', 0)
    return Number.isFinite(v) ? { ok: true, v } : { ok: false, erreur: 'Nombre trop grand.' }
  } catch (e) {
    return { ok: false, erreur: e instanceof ErreurCalcul ? e.message : 'Nombre illisible.' }
  }
}
const texteNb = (v: number) => {
  const r = Math.round(v * 1e6) / 1e6
  return String(r === 0 ? 0 : r).replace('.', ',').replace('-', '−')
}

/** Rendu régulier pendant une animation (canvas à chaque image ; `instant` pour les étiquettes, 10 fois par seconde). */
export function useBoucleAnimation(actif: boolean, peindre: () => void): number {
  const [instant, setInstant] = useState(0)
  const ref = useRef(peindre)
  ref.current = peindre
  useEffect(() => {
    if (!actif) return
    let id = 0
    let dernier = 0
    const tour = (t: number) => {
      ref.current()
      if (t - dernier > 100) {
        dernier = t
        setInstant(Date.now())
      }
      id = requestAnimationFrame(tour)
    }
    id = requestAnimationFrame(tour)
    return () => cancelAnimationFrame(id)
  }, [actif])
  return instant
}

// ---------- onglets ----------

export function OngletsTraceur({ onglet, setOutils }: { onglet: OngletTraceur; setOutils: SetOutils }) {
  const onglets: [OngletTraceur, string][] = [
    ['courbes', 'Courbes'],
    ['points', 'Points'],
    ['tangente', 'Tangente'],
    ['aire', 'Aire'],
  ]
  return (
    <div className="traceur-onglets" role="tablist" aria-label="Traceur">
      {onglets.map(([v, l]) => (
        <button key={v} type="button" role="tab" aria-selected={onglet === v} className="traceur-onglet" onClick={() => setOutils((o) => ({ ...o, ongletTraceur: v }))}>
          {l}
        </button>
      ))}
    </div>
  )
}

// ---------- curseurs des paramètres ----------

function Bornes({ nom, p, appliquer }: { nom: string; p: Parametre; appliquer: (p: Parametre) => void }) {
  const [t, setT] = useState({ min: texteNb(p.min), max: texteNb(p.max), pas: texteNb(p.pas) })
  const [erreur, setErreur] = useState<string | null>(null)
  const valider = () => {
    const a = lireValeur(t.min)
    const b = lireValeur(t.max)
    const c = lireValeur(t.pas)
    if (!a.ok || !b.ok || !c.ok) return setErreur('Écris trois nombres.')
    if (b.v <= a.v) return setErreur('Le maximum doit dépasser le minimum.')
    if (c.v <= 0 || (b.v - a.v) / c.v > 2000) return setErreur('Pas trop petit ou négatif.')
    setErreur(null)
    appliquer({ min: a.v, max: b.v, pas: c.v, v: surCran(p.v, { ...p, min: a.v, max: b.v, pas: c.v }) })
  }
  const champ = (k: 'min' | 'max' | 'pas', etiquette: string) => (
    <label className="param-borne">
      {etiquette}
      <input
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={t[k]}
        onChange={(e) => setT((x) => ({ ...x, [k]: normaliserSigneMoins(e.target.value) }))}
        onBlur={valider}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            valider()
          }
        }}
      />
    </label>
  )
  return (
    <div className="param-bornes" role="group" aria-label={`Bornes et pas de ${nom}`}>
      {champ('min', 'de')}
      {champ('max', 'à')}
      {champ('pas', 'pas')}
      {erreur && (
        <p className="traceur-erreur" role="alert">
          {erreur}
        </p>
      )}
    </div>
  )
}

/** Curseurs d'une courbe à paramètres : ▶ / ⏸ (animation partagée par les deux écrans), valeur, bornes, trace. */
export function CurseursParametres({ annotations, cle, courbe, page }: { annotations: MagasinAnnotations; cle: string; courbe: Courbe; page: PageBlanche }) {
  const [bornes, setBornes] = useState<string | null>(null)
  const params = courbe.params ?? {}
  const noms = Object.keys(params)
  const anime = estAnimee(courbe)
  // Pendant l'animation, la valeur affichée suit (10 fois par seconde).
  const [, setTic] = useState(0)
  useEffect(() => {
    if (!anime) return
    const t = window.setInterval(() => setTic((n) => n + 1), 100)
    return () => window.clearInterval(t)
  }, [anime])
  if (noms.length === 0) return null
  const remplacer = (c: Courbe) => annotations.remplacer(cle, c)
  const arreter = (c: Courbe): Courbe => {
    if (!c.animation || !c.params?.[c.animation.nom]) return c
    const p = c.params[c.animation.nom]
    const v = surCran(valeurAnimee(p, c.animation.debut, Date.now()), p)
    return { ...c, params: { ...c.params, [c.animation.nom]: { ...p, v } }, animation: null, traces: c.trace ? avecTraces(c, prendrePassages(c.id)) : c.traces }
  }
  const lecture = lireFonction(courbe.saisie, page.angle)
  return (
    <div className="params" role="group" aria-label={`Paramètres de ${courbe.nom}`}>
      <p className="params-titre">
        Paramètres de <MathInline tex={courbe.nom} /> : {noms.join(', ')}
      </p>
      {noms.map((n) => {
        const p = params[n]
        const enCours = courbe.animation?.nom === n
        const v = enCours && courbe.animation ? valeurAnimee(p, courbe.animation.debut, Date.now()) : p.v
        return (
          <div key={n} className="param">
            <div className="param-ligne">
              <button
                type="button"
                className={`param-lire${enCours ? ' actif' : ''}`}
                aria-label={enCours ? `Arrêter l’animation de ${n}` : `Animer ${n} de ${texteNb(p.min)} à ${texteNb(p.max)} et retour`}
                title={enCours ? 'Arrêter' : 'Animer (aller et retour, environ 6 s)'}
                onClick={() => {
                  if (enCours) remplacer(arreter(courbe))
                  else {
                    const c = arreter(courbe)
                    remplacer({ ...c, animation: { nom: n, debut: debutAnimation(c.params![n], Date.now()) } })
                  }
                }}
              >
                <PictoBlanc nom={enCours ? 'pause' : 'lecture'} taille={16} />
              </button>
              <input
                type="range"
                className="param-curseur"
                aria-label={`Valeur de ${n}`}
                min={p.min}
                max={p.max}
                step={p.pas}
                value={v}
                onChange={(e) => {
                  const c = courbe.animation?.nom === n ? arreter(courbe) : courbe
                  const nv = surCran(Number(e.target.value), p)
                  const params2 = { ...c.params!, [n]: { ...c.params![n], v: nv } }
                  const valeurs = Object.fromEntries(Object.entries(params2).map(([k, x]) => [k, x.v]))
                  remplacer({ ...c, params: params2, traces: c.trace ? avecTraces(c, [valeurs]) : c.traces })
                }}
              />
              <button type="button" className="param-valeur" aria-expanded={bornes === n} title="Toucher pour changer les bornes et le pas" onClick={() => setBornes((b) => (b === n ? null : n))}>
                {n} = {texteParametre(v, p.pas, enCours ? 1 : 0)}
              </button>
            </div>
            {bornes === n && <Bornes nom={n} p={p} appliquer={(q) => remplacer({ ...courbe, params: { ...params, [n]: q }, animation: courbe.animation?.nom === n ? { nom: n, debut: debutAnimation(q, Date.now()) } : courbe.animation })} />}
          </div>
        )
      })}
      <label className="traceur-case param-trace">
        <input
          type="checkbox"
          checked={!!courbe.trace}
          onChange={(e) => {
            prendrePassages(courbe.id)
            const valeurs = valeursCourbe(courbe)
            remplacer({ ...courbe, trace: e.target.checked, traces: e.target.checked && valeurs ? [valeurs] : [] })
          }}
        />
        Laisser une trace (la famille)
      </label>
      <p className="traceur-aide">
        {noms.map((n) => `${n} de ${texteNb(params[n].min)} à ${texteNb(params[n].max)}, pas ${texteNb(params[n].pas)}`).join(' · ')} · toucher la valeur : bornes
        {!lecture.ok && ` · ${lecture.erreur}`}
      </p>
    </div>
  )
}

// ---------- choix de la courbe (onglets Tangente / Aire) ----------

function ChoixCourbe({ courbes, choix, setChoix }: { courbes: Courbe[]; choix: string; setChoix: (id: string) => void }) {
  if (courbes.length < 2) return null
  return (
    <div className="traceur-groupe choix-courbe" role="radiogroup" aria-label="Courbe">
      {courbes.map((c) => (
        <button key={c.id} type="button" role="radio" aria-checked={choix === c.id} className="projection-duree traceur-choix" style={{ borderColor: c.couleur }} onClick={() => setChoix(c.id)}>
          <MathInline tex={c.nom} />
        </button>
      ))}
    </div>
  )
}

/** Champ numérique libre (jamais bloqué), validé à Entrée ou en quittant le champ. */
function ChampValeur({ etiquette, valeur, appliquer }: { etiquette: React.ReactNode; valeur: number; appliquer: (v: number) => void }) {
  const [t, setT] = useState(texteNb(valeur))
  const [erreur, setErreur] = useState<string | null>(null)
  const edition = useRef(false)
  const id = useId()
  useEffect(() => {
    if (!edition.current) setT(texteNb(valeur))
  }, [valeur])
  const valider = () => {
    edition.current = false
    const l = lireValeur(t)
    if (!l.ok) return setErreur(l.erreur)
    setErreur(null)
    appliquer(l.v)
  }
  return (
    <div className="traceur-champ">
      <label htmlFor={id}>{etiquette}</label>
      <input
        id={id}
        className="traceur-saisie"
        type="text"
        autoComplete="off"
        spellCheck={false}
        value={t}
        aria-invalid={erreur ? true : undefined}
        onChange={(e) => {
          edition.current = true
          setT(normaliserSigneMoins(e.target.value))
          setErreur(null)
        }}
        onBlur={valider}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault()
            valider()
          }
        }}
      />
      {erreur && (
        <p className="traceur-erreur" role="alert">
          {erreur}
        </p>
      )}
    </div>
  )
}

function useChoixCourbe(courbes: Courbe[]): [string, (id: string) => void] {
  const [choix, setChoix] = useState(courbes[0]?.id ?? '')
  const ok = courbes.some((c) => c.id === choix)
  return [ok ? choix : (courbes[0]?.id ?? ''), setChoix]
}

/** Abscisse de départ : 1 si on la voit, sinon le centre de la vue (arrondi). */
function xDepart(page: PageBlanche, prefere = 1): number {
  const v = vueDe(page)
  const [x0] = ecranVersRepere(v, [100, 360])
  const [x1] = ecranVersRepere(v, [1180, 360])
  return prefere > x0 && prefere < x1 ? prefere : Math.round(v.cx)
}

export function OngletTangente({ annotations, page }: { annotations: MagasinAnnotations; page: PageBlanche }) {
  const cle = clePageBlanche(page.id)
  const elements = annotations.pages.get(cle) ?? []
  const courbes = elements.filter(estGenre('courbe'))
  const [choix, setChoix] = useChoixCourbe(courbes)
  const c = courbes.find((k) => k.id === choix)
  if (!c) return <p className="traceur-aide">Trace d’abord une courbe (onglet Courbes) : la tangente se pose ensuite en touchant la courbe.</p>
  const t = elements.filter(estGenre('tangente')).find((x) => x.courbe === c.id)
  const f = fonctionCourbe(c, page)
  const res = t && f ? calculerTangente(f, t.x) : null
  const maj = (n: Tangente) => {
    if (t) annotations.noterModif(cle, t)
    annotations.remplacer(cle, n)
  }
  return (
    <div className="traceur-bloc onglet-tangente">
      <ChoixCourbe courbes={courbes} choix={c.id} setChoix={setChoix} />
      <label className="traceur-case">
        <input
          type="checkbox"
          checked={!!t}
          onChange={(e) => {
            if (e.target.checked) annotations.ajouter(cle, { genre: 'tangente', id: nouvelId(), courbe: c.id, x: xDepart(page), triangle: false, couleur: COULEUR_TANGENTE })
            else if (t) annotations.retirer(cle, t.id)
          }}
        />
        Tangente à <MathInline tex={c.nom} />
        <span className="traceur-etiquette-douce">toucher la courbe</span>
      </label>
      {t && (
        <>
          <ChampValeur etiquette={<MathInline tex="\text{en } x =" />} valeur={t.x} appliquer={(v) => maj({ ...t, x: v })} />
          {res &&
            (res.ok ? (
              <div className="tangente-resultat" aria-live="polite" data-tex={res.latexEquation}>
                <MathInline tex={res.latexEquation} />
                <span className="tangente-detail">
                  pente <MathInline tex={res.latexPente} /> · point <MathInline tex={res.latexPoint} />
                </span>
              </div>
            ) : (
              <p className="traceur-erreur" role="status">
                {res.erreur}
              </p>
            ))}
          <label className="traceur-case">
            <input type="checkbox" checked={t.triangle} onChange={(e) => maj({ ...t, triangle: e.target.checked })} />
            Montrer le triangle de la pente
          </label>
        </>
      )}
      <p className="traceur-aide">Toucher la courbe pose le point ; le glisser le long de la courbe : la tangente et son équation suivent.</p>
    </div>
  )
}

export function OngletAire({ annotations, page }: { annotations: MagasinAnnotations; page: PageBlanche }) {
  const cle = clePageBlanche(page.id)
  const elements = annotations.pages.get(cle) ?? []
  const courbes = elements.filter(estGenre('courbe'))
  const [choix, setChoix] = useChoixCourbe(courbes)
  const c = courbes.find((k) => k.id === choix)
  if (!c) return <p className="traceur-aide">Trace d’abord une courbe (onglet Courbes).</p>
  const a = elements.filter(estGenre('aire')).find((x) => x.courbe === c.id)
  const f = fonctionCourbe(c, page)
  const res = a && f ? calculerAire(f, a.a, a.b) : null
  const maj = (n: Aire) => {
    if (a) annotations.noterModif(cle, a)
    annotations.remplacer(cle, n)
  }
  const x0 = xDepart(page, 0)
  return (
    <div className="traceur-bloc onglet-aire">
      <ChoixCourbe courbes={courbes} choix={c.id} setChoix={setChoix} />
      <label className="traceur-case">
        <input
          type="checkbox"
          checked={!!a}
          onChange={(e) => {
            if (e.target.checked) annotations.ajouter(cle, { genre: 'aire', id: nouvelId(), courbe: c.id, a: x0, b: x0 + 2 * pasDe(page), integrale: false })
            else if (a) annotations.retirer(cle, a.id)
          }}
        />
        Aire sous <MathInline tex={c.nom} />
      </label>
      {a && (
        <>
          <div className="aire-bornes">
            <ChampValeur etiquette="de" valeur={a.a} appliquer={(v) => maj({ ...a, a: v })} />
            <ChampValeur etiquette="à" valeur={a.b} appliquer={(v) => maj({ ...a, b: v })} />
          </div>
          {res &&
            (res.ok ? (
              <>
                <div className="tangente-resultat" aria-live="polite" data-tex={res.latexValeur}>
                  <MathInline tex={`${res.signe === 'positive' ? '\\text{Aire}' : '\\text{Intégrale}'} ${res.latexValeur}`} />
                </div>
                {res.signe !== 'positive' && (
                  <p className="traceur-aide aire-negative" role="status">
                    {res.signe === 'negative'
                      ? 'La courbe est sous l’axe : l’intégrale est négative (l’aire vaut son opposé).'
                      : 'Une partie de la courbe est sous l’axe : elle compte négativement dans ce nombre.'}
                  </p>
                )}
              </>
            ) : (
              <p className="traceur-erreur" role="status">
                {res.erreur}
              </p>
            ))}
          <label className="traceur-case">
            <input type="checkbox" checked={a.integrale} onChange={(e) => maj({ ...a, integrale: e.target.checked })} />
            Écrire l’intégrale <span className="traceur-etiquette-douce">6e</span>
          </label>
        </>
      )}
      <p className="traceur-aide">Glisser les deux bornes sur l’axe des x.</p>
    </div>
  )
}

const pasDe = (page: PageBlanche) => graduations(vueDe(page)).pasX

export function OngletPoints({ annotations, page }: { annotations: MagasinAnnotations; page: PageBlanche }) {
  const cle = clePageBlanche(page.id)
  const elements = annotations.pages.get(cle) ?? []
  const points = elements.filter(estGenre('point'))
  const liaisons = elements.filter(estGenre('liaison'))
  const [saisie, setSaisie] = useState('')
  const [erreur, setErreur] = useState<string | null>(null)
  const id = useId()
  const noms = points.map((p) => p.nom)
  const apercu = saisie.trim() ? lirePoint(saisie, noms) : null
  const placer = () => {
    const l = lirePoint(saisie, noms)
    if (!l.ok) return setErreur(l.erreur)
    setErreur(null)
    if (l.genre === 'point') {
      const ancien = points.find((p) => p.nom === l.nom)
      if (ancien) {
        annotations.noterModif(cle, ancien)
        annotations.remplacer(cle, { ...ancien, x: l.x, y: l.y })
      } else annotations.ajouter(cle, { genre: 'point', id: nouvelId(), nom: l.nom, x: l.x, y: l.y, couleur: COULEURS_POINTS[points.length % COULEURS_POINTS.length] })
    } else {
      if (!liaisons.some((x) => x.sorte === l.sorte && x.a === l.a && x.b === l.b)) annotations.ajouter(cle, { genre: 'liaison', id: nouvelId(), sorte: l.sorte, a: l.a, b: l.b, couleur: COULEURS_LIAISONS[l.sorte] })
    }
    setSaisie('')
  }
  const latexLiaison = (l: Liaison) => {
    const A = points.find((p) => p.nom === l.a)
    const B = points.find((p) => p.nom === l.b)
    if (l.sorte === 'vecteur') return `\\text{vecteur } \\overrightarrow{${l.a}${l.b}}${A && B ? ` = \\left(${latexNombre(B.x - A.x)}\\,;\\,${latexNombre(B.y - A.y)}\\right)` : ''}`
    return l.sorte === 'segment' ? `\\text{segment } [${l.a}${l.b}]` : `\\text{droite } (${l.a}${l.b})`
  }
  return (
    <div className="traceur-bloc onglet-points">
      <form
        className="traceur-ligne traceur-ligne--saisie"
        onSubmit={(e) => {
          e.preventDefault()
          placer()
        }}
      >
        <label className="sr-only" htmlFor={id}>
          Point, vecteur, segment ou droite
        </label>
        <input
          id={id}
          className="traceur-saisie"
          type="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          placeholder="ex. A(1 ; 2)"
          value={saisie}
          aria-invalid={erreur ? true : undefined}
          aria-describedby={erreur ? `${id}-erreur` : undefined}
          onChange={(e) => {
            setSaisie(normaliserSigneMoins(e.target.value))
            setErreur(null)
          }}
        />
        <button type="submit" className="projection-duree traceur-tracer">
          Placer
        </button>
      </form>
      <span className="traceur-apercu" aria-live="polite">
        {apercu?.ok ? <MathInline tex={apercu.latex} /> : null}
      </span>
      {erreur && (
        <p id={`${id}-erreur`} className="traceur-erreur" role="alert">
          {erreur}
        </p>
      )}
      {(points.length > 0 || liaisons.length > 0) && (
        <ul className="traceur-liste" aria-label="Points et vecteurs placés">
          {points.map((p) => (
            <li key={p.id} className="traceur-courbe" style={{ ['--c' as string]: p.couleur }} data-tex={`${p.nom}\\left(${latexNombre(p.x)}\\,;\\,${latexNombre(p.y)}\\right)`}>
              <span className="traceur-pastille" aria-hidden="true" />
              <MathInline tex={`${p.nom}\\left(${latexNombre(p.x)}\\,;\\,${latexNombre(p.y)}\\right)`} />
              <button
                type="button"
                className="traceur-retirer"
                aria-label={`Retirer le point ${p.nom}`}
                title={`Retirer le point ${p.nom} (et ce qui en dépend)`}
                onClick={() => {
                  for (const l of liaisons) if (l.a === p.nom || l.b === p.nom) annotations.retirer(cle, l.id)
                  annotations.retirer(cle, p.id)
                }}
              >
                <Pictogramme nom="fermer" taille={16} />
              </button>
            </li>
          ))}
          {liaisons.map((l) => (
            <li key={l.id} className="traceur-courbe" style={{ ['--c' as string]: l.couleur }}>
              <span className="traceur-pastille" aria-hidden="true" />
              <MathInline tex={latexLiaison(l)} />
              <button type="button" className="traceur-retirer" aria-label={`Retirer ${l.sorte} ${l.a}${l.b}`} title="Retirer" onClick={() => annotations.retirer(cle, l.id)}>
                <Pictogramme nom="fermer" taille={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="traceur-aide">Écrire « vecteur AB », « segment BC », « droite AC ». Parenthèse oubliée : fermée d’office. Un point se déplace au doigt.</p>
    </div>
  )
}

// ---------- étiquettes sur le repère (écran et export) ----------

function largeur(latex: string, taille: number) {
  const visible = latex.replace(/\\(left|right|text|mathrm|,|;|quad|approx)/g, ' ').replace(/\\[a-z]+/g, 'x').replace(/[{}\\^_]/g, '')
  return 20 + visible.length * taille * 0.52
}

/**
 * Étiquettes du traceur enrichi : noms des points, composantes des vecteurs, équation de la tangente et coordonnées du
 * point de contact, triangle de la pente, valeur de l'aire, courbe du moment des paramètres (« a = 1,5 : f(x) = … »).
 * Même composant à l'écran et dans l'export annoté.
 */
export function EtiquettesTraceur({ elements, page, instant = 0 }: { elements: ElementAnnotation[]; page: PageBlanche; instant?: number }) {
  const r = useMemo(() => repereVue(page), [page])
  void instant
  const maintenant = Date.now()
  const courbes = elements.filter(estGenre('courbe'))
  const points = elements.filter(estGenre('point'))
  const parNom = new Map(points.map((p) => [p.nom, p]))
  const etiquettes: React.ReactNode[] = []
  const boite = (cle: string, x: number, y: number, tex: string, couleur: string, taille = 24) => {
    const l = largeur(tex, taille)
    etiquettes.push(
      <span key={cle} className="traceur-boite" style={{ left: borne(x, 4, 1276 - l), top: borne(y, 4, 700 - taille * 1.8), borderColor: couleur, fontSize: taille }} data-tex={tex}>
        <MathInline tex={tex} />
      </span>,
    )
  }
  const libre = (cle: string, x: number, y: number, tex: string, couleur: string, taille = 22, classe = 'traceur-libre') =>
    etiquettes.push(
      <span key={cle} className={classe} style={{ left: borne(x, 2, 1250), top: borne(y, 2, 690), color: couleur, fontSize: taille }} data-tex={tex}>
        <MathInline tex={tex} />
      </span>,
    )
  for (const t of elements.filter(estGenre('tangente'))) {
    const c = courbes.find((k) => k.id === t.courbe)
    const f = c && fonctionCourbe(c, page, maintenant)
    if (!f) continue
    const res = calculerTangente(f, t.x)
    if (!res.ok) continue
    const [px, py] = [versPxX(res.x0, r), versPxY(res.y0, r)]
    if (px < -20 || px > 1300 || py < -20 || py > 740) continue
    boite(`t${t.id}`, px + 34, py - 96, `${res.latexEquation}\\quad{\\small \\text{pente}\\ {${res.latexPente}}}`, t.couleur)
    // Coordonnées du point de contact : sous le point, du côté opposé à l'équation.
    libre(`tp${t.id}`, px - 24 - largeur(res.latexPoint, 20), py + 14, res.latexPoint, t.couleur, 20)
    if (t.triangle) {
      const d = pasTriangle(r)
      const p1x = versPxX(res.x0 + d, r)
      const p2y = versPxY(res.y0 + res.m * d, r)
      const dm = res.m * d
      libre(`tx${t.id}`, (px + p1x) / 2 - 14, py + (p2y < py ? 6 : -34), `+${latexNombre(d)}`, t.couleur, 20)
      libre(`ty${t.id}`, p1x + 8, (py + p2y) / 2 - 14, `${dm >= 0 ? '+' : ''}${latexNombre(dm)}`, t.couleur, 20)
    }
  }
  for (const a of elements.filter(estGenre('aire'))) {
    const c = courbes.find((k) => k.id === a.courbe)
    const f = c && fonctionCourbe(c, page, maintenant)
    if (!c || !f) continue
    const res = calculerAire(f, a.a, a.b)
    const [u, w] = a.a <= a.b ? [a.a, a.b] : [a.b, a.a]
    let haut = versPxY(0, r)
    for (let i = 0; i <= 20; i++) {
      const y = f(u + ((w - u) * i) / 20)
      if (!Number.isNaN(y)) haut = Math.min(haut, versPxY(y, r))
    }
    if (res.ok) {
      const l = lireFonction(c.saisie, page.angle, valeursCourbe(c, maintenant))
      const expr = c.params ? latexSubstitue(c.saisie, page.angle, valeursCourbe(c, maintenant) ?? {}) : l.ok ? l.latex : null
      const tex = a.integrale && expr ? `\\displaystyle\\int_{${latexNombre(a.a)}}^{${latexNombre(a.b)}} ${expr}\\,\\mathrm{d}x ${res.latexValeur}` : `${res.signe === 'positive' ? '\\text{Aire}' : '\\text{Intégrale}'} ${res.latexValeur}`
      boite(`a${a.id}`, (versPxX(u, r) + versPxX(w, r)) / 2 + 40, Math.max(70, haut - 110), tex, '#b65c1f')
    }
    // Bornes a et b (poignées dessinées : elles se glissent sur l'axe).
    const axe = borne(versPxY(0, r), 20, 700)
    for (const [k, v] of [
      ['a', a.a],
      ['b', a.b],
    ] as const)
      etiquettes.push(
        <span key={`ab${a.id}${k}`} className="aire-borne" style={{ left: versPxX(v, r) - 15, top: axe - 15 }} aria-hidden="true">
          {k}
        </span>,
      )
  }
  for (const l of elements.filter(estGenre('liaison'))) {
    if (l.sorte !== 'vecteur') continue
    const A = parNom.get(l.a)
    const B = parNom.get(l.b)
    if (!A || !B) continue
    const [ax, ay] = [versPxX(A.x, r), versPxY(A.y, r)]
    const [bx, by] = [versPxX(B.x, r), versPxY(B.y, r)]
    const dx = B.x - A.x
    const dy = B.y - A.y
    const tex = `\\text{vecteur } \\overrightarrow{${l.a}${l.b}} = \\left(${latexNombre(dx)}\\,;\\,${latexNombre(dy)}\\right)`
    libre(`v${l.id}`, (ax + bx) / 2 - largeur(tex, 22) / 2, Math.min(ay, by) - 64, tex, l.couleur, 22)
    if (Math.abs(bx - ax) > 30) libre(`vx${l.id}`, (ax + bx) / 2 - 12, ay + (by < ay ? 6 : -34), `${dx >= 0 ? '+' : ''}${latexNombre(dx)}`, l.couleur, 20)
    if (Math.abs(by - ay) > 24) libre(`vy${l.id}`, bx + 10, (ay + by) / 2 - 14, `${dy >= 0 ? '+' : ''}${latexNombre(dy)}`, l.couleur, 20)
  }
  for (const p of points) {
    const [px, py] = [versPxX(p.x, r), versPxY(p.y, r)]
    if (px < -10 || px > 1290 || py < -10 || py > 730) continue
    libre(`p${p.id}`, px + 10, py - 44, p.nom, p.couleur, 30, 'traceur-libre traceur-nom-point')
  }
  // Courbe du moment des paramètres : en bas à droite, empilées.
  let rang = 0
  for (const c of courbes) {
    const v = valeursCourbe(c, maintenant)
    if (!v || !c.params) continue
    // Valeurs arrondies comme le curseur (pas du paramètre, une décimale de plus pendant l'animation).
    const affichees = Object.fromEntries(Object.entries(v).map(([k, x]) => [k, Number(texteParametre(x, c.params![k].pas, estAnimee(c) && c.animation?.nom === k ? 1 : 0).replace(',', '.').replace('−', '-'))]))
    const sub = latexSubstitue(c.saisie, page.angle, affichees)
    if (!sub) continue
    const vals = Object.entries(affichees)
      .map(([k, x]) => `${k} = ${String(x).replace('.', '{,}')}`)
      .join(',\\ ')
    const tex = `${vals} :\\ ${c.nom}(x) = ${sub}`
    const l = largeur(tex, 24)
    boite(`c${c.id}`, 1260 - l, 600 - rang * 58, tex, c.couleur)
    rang++
  }
  if (etiquettes.length === 0) return null
  return (
    <div className="traceur-calque traceur-calque--enrichi" aria-hidden="true">
      {etiquettes}
    </div>
  )
}

// ---------- poignées (point de la tangente, bornes de l'aire, points) ----------

/**
 * Poignées du traceur enrichi, SOUS le stylo (le canvas du stylo, outil pris, reçoit les appuis à leur place) : glisser
 * le point de contact de la tangente (il suit la courbe), les bornes de l'aire (sur l'axe des x), les points (accrochés
 * aux nœuds de la grille). Onglet Tangente ouvert : toucher une courbe y pose la tangente.
 */
export function PoigneesTraceur({
  annotations,
  page,
  blanche,
  outils,
  echelle,
  versDiapo,
}: {
  annotations: MagasinAnnotations
  page: string
  blanche: PageBlanche
  outils: OutilsLocaux
  echelle: number
  versDiapo: (cx: number, cy: number) => P
}) {
  const elements = annotations.pages.get(page) ?? []
  const courbes = elements.filter(estGenre('courbe'))
  const tangentes = elements.filter(estGenre('tangente'))
  const aires = elements.filter(estGenre('aire'))
  const points = elements.filter(estGenre('point'))
  const toucherCourbe = outils.traceur && outils.ongletTraceur === 'tangente' && courbes.length > 0
  if (outils.stylo || (!tangentes.length && !aires.length && !points.length && !toucherCourbe)) return null
  const r = repereVue(blanche)
  const v = vueDe(blanche)
  const g = graduations(v)
  const rayon = Math.max(22, echelle > 0 ? 22 / echelle : 22)
  const xRepere = (ev: PointerEvent) => ecranVersRepere(v, versDiapo(ev.clientX, ev.clientY))
  const arrondir = (x: number, pas: number) => Math.round(x / pas) * pas
  const glisser = <E extends Tangente | Aire | PointRepere>(e: React.PointerEvent, el: E, maj: (ev: PointerEvent, el: E) => E) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    e.stopPropagation()
    e.preventDefault()
    const avant = el
    let dernier = el
    suivrePointeur(
      e,
      (ev) => {
        dernier = maj(ev, el)
        annotations.remplacer(page, dernier)
      },
      () => {
        if (dernier !== avant) annotations.noterModif(page, avant)
      },
    )
  }
  const xTangente = (ev: PointerEvent) => arrondir(xRepere(ev)[0], g.pasX / 10)
  const xBorne = (ev: PointerEvent) => {
    const x = xRepere(ev)[0]
    const demi = arrondir(x, g.pasX / 2)
    return Math.abs(versPxX(demi, r) - versPxX(x, r)) <= 10 ? demi : arrondir(x, g.pasX / 10)
  }
  const axe = borne(versPxY(0, r), 20, 700)
  return (
    <svg className="traceur-poignees" width={1280} height={720} viewBox="0 0 1280 720">
      {toucherCourbe &&
        courbes.map((c) => {
          const { polylignes } = traceMemorise(c.saisie, blanche.angle, r, valeursCourbe(c))
          const d = polylignes.map((l) => `M ${l.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ')}`).join(' ')
          return (
            <path
              key={c.id}
              className="poignee-courbe projection-interactif"
              d={d}
              style={{ strokeWidth: 2 * rayon }}
              onPointerDown={(e) => {
                e.stopPropagation()
                e.preventDefault()
                const x0 = arrondir(ecranVersRepere(v, versDiapo(e.clientX, e.clientY))[0], g.pasX / 10)
                const t = tangentes.find((k) => k.courbe === c.id)
                const el: Tangente = t ? { ...t, x: x0 } : { genre: 'tangente', id: nouvelId(), courbe: c.id, x: x0, triangle: false, couleur: COULEUR_TANGENTE }
                if (t) annotations.noterModif(page, t)
                if (t) annotations.remplacer(page, el)
                else annotations.ajouter(page, el)
                glisser(e, el, (ev, x) => ({ ...x, x: xTangente(ev) }))
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <title>{`Toucher la courbe ${c.nom} : poser la tangente`}</title>
            </path>
          )
        })}
      {tangentes.map((t) => {
        const c = courbes.find((k) => k.id === t.courbe)
        const f = c && fonctionCourbe(c, blanche)
        const y = f ? f(t.x) : NaN
        if (Number.isNaN(y)) return null
        return (
          <circle key={t.id} className="poignee projection-interactif" cx={versPxX(t.x, r)} cy={versPxY(y, r)} r={rayon} onPointerDown={(e) => glisser(e, t, (ev, x) => ({ ...x, x: xTangente(ev) }))} onClick={(e) => e.stopPropagation()}>
            <title>Glisser le point le long de la courbe</title>
          </circle>
        )
      })}
      {aires.map((a) =>
        (['a', 'b'] as const).map((k) => (
          <circle key={`${a.id}${k}`} className="poignee projection-interactif poignee-borne" cx={versPxX(a[k], r)} cy={axe} r={rayon} onPointerDown={(e) => glisser(e, a, (ev, x) => ({ ...x, [k]: xBorne(ev) }))} onClick={(e) => e.stopPropagation()}>
            <title>{`Glisser la borne ${k} sur l’axe des x`}</title>
          </circle>
        )),
      )}
      {points.map((p) => (
        <circle
          key={p.id}
          className="poignee projection-interactif"
          cx={versPxX(p.x, r)}
          cy={versPxY(p.y, r)}
          r={rayon}
          onPointerDown={(e) =>
            glisser(e, p, (ev, x) => {
              const [mx, my] = xRepere(ev)
              return { ...x, x: Number(arrondir(mx, g.pasX).toFixed(10)), y: Number(arrondir(my, g.pasY).toFixed(10)) }
            })
          }
          onClick={(e) => e.stopPropagation()}
        >
          <title>{`Déplacer le point ${p.nom} (accroché aux nœuds de la grille)`}</title>
        </circle>
      ))}
    </svg>
  )
}
