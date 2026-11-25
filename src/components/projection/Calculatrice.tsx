import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { MathInline } from '../Math'
import { calculer, latexValeur } from '../../lib/projection/calculatrice'
import type { Role } from '../../lib/projection/diapos'
import { normaliserSigneMoins } from '../../lib/normaliserSaisie'
import { LARGEUR_CALC, useInstrument } from './instruments'
import type { MagasinInstruments } from './instruments'
import { Pictogramme } from './Pictogrammes'
import { HAUTEUR, LARGEUR } from './Scene'

type Genre = 'chiffre' | 'operateur' | 'debut'
interface Touche {
  label: string
  insere: string
  genre: Genre
  aria?: string
  classe?: string
}

const T = (label: string, insere: string, genre: Genre, classe?: string, aria?: string): Touche => ({ label, insere, genre, classe, aria })

/**
 * Calculatrice flottante du mode projection, générique (aucune apparence de marque). Saisie au clavier
 * LIBRE (jamais bloquée, seul `normaliserSigneMoins`), touches à l'écran, modes DEG / RAD, valeur
 * exacte ou ≈, Ans ; « Épingler le résultat » pose le résultat sur la diapo. Évaluation par le parseur
 * maison `lib/projection/calculatrice.ts` (jamais `eval`). Position en px logiques de la diapo, partagée
 * avec l'autre écran ; sur la vue réduite du professeur, agrandie pour rester utilisable au doigt.
 *
 * Correctif du 25/11/2026 (« Épingler reste grisé ») — causes réelles reproduites : (1) taper « 3*4= »
 * au clavier donnait « Caractère « = » non reconnu » (l'aide disait même « puis « = » ») : le « = » final
 * calcule désormais ; (2) à l'ouverture le champ n'avait pas le focus : ce qu'on tapait au clavier était
 * perdu et Entrée passait à la diapo suivante — focus donné à l'ouverture (pas au doigt : clavier virtuel)
 * et chiffres / opérateurs frappés ailleurs renvoyés dans le champ ; (3) le bouton exigeait un « = »
 * préalable : il calcule maintenant lui-même la saisie en cours avant d'épingler. Punaise de la barre de
 * titre : la calculatrice reste ouverte d'une diapo à l'autre (sinon elle se ferme au changement de diapo).
 */
export function Calculatrice({
  magasin,
  role,
  echelle,
  versDiapo,
  epingler,
  diapo,
}: {
  magasin: MagasinInstruments
  role: Role
  echelle: number
  versDiapo: (x: number, y: number) => [number, number]
  epingler: (latex: string) => void
  /** Page courante (diapo, ou −1 pour l'écran blanc) : sans punaise, la calculatrice se ferme quand elle change. */
  diapo: number
}) {
  const calc = useInstrument(magasin, (e) => e.calc)
  const champ = useRef<HTMLInputElement>(null)
  const apresEgal = useRef(false)
  const racine = useRef<HTMLDivElement>(null)
  const [hauteur, setHauteur] = useState(500)
  const [message, setMessage] = useState<string | null>(null)
  useLayoutEffect(() => {
    if (racine.current) setHauteur(racine.current.offsetHeight)
  })
  const visibleIci = calc.visible && !(role === 'diapos' && calc.masque)

  // Changement de diapo (pas l'écran blanc) : sans punaise, la calculatrice se ferme.
  const diapoAvant = useRef(diapo)
  useEffect(() => {
    const avant = diapoAvant.current
    diapoAvant.current = diapo
    if (avant === diapo || avant < 0 || diapo < 0) return
    const c = magasin.lire().calc
    if (c.visible && !c.garde) magasin.calc({ visible: false })
  }, [diapo, magasin])

  // Ouverture ici (K, bouton) : le champ reçoit le focus pour taper au clavier tout de suite — sauf au
  // doigt (le clavier virtuel couvrirait la diapo) et dans la fenêtre qui n'a pas le focus.
  const dernierPointeur = useRef('mouse')
  useEffect(() => {
    const noter = (e: PointerEvent) => {
      dernierPointeur.current = e.pointerType
    }
    window.addEventListener('pointerdown', noter, true)
    return () => window.removeEventListener('pointerdown', noter, true)
  }, [])
  const ouverteAvant = useRef(visibleIci)
  useEffect(() => {
    const avant = ouverteAvant.current
    ouverteAvant.current = visibleIci
    if (!avant && visibleIci && dernierPointeur.current !== 'touch' && document.hasFocus()) {
      requestAnimationFrame(() => champ.current?.focus({ preventScroll: true }))
    }
    if (!visibleIci) setMessage(null)
  }, [visibleIci])

  // Chiffres et opérateurs frappés hors du champ (après un clic sur une touche, sur la diapo…) : renvoyés
  // dans le champ plutôt que perdus (« . » n'éteint plus l'écran tant que la calculatrice est ouverte).
  useEffect(() => {
    if (!visibleIci) return
    const surTouche = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || !/[0-9+\-*/×÷^().,=²π]/.test(e.key)) return
      const chemin = e.composedPath() as HTMLElement[]
      if (chemin.some((n) => n instanceof HTMLElement && (n.matches?.('input, textarea, select, [contenteditable="true"]') || n.classList?.contains('diapo-atelier')))) return
      const el = champ.current
      if (!el) return
      e.preventDefault()
      e.stopPropagation()
      const c = magasin.lire().calc
      const base = apresEgal.current ? (/[+\-*/×÷^²]/.test(e.key) ? 'Ans' : '') : c.saisie
      apresEgal.current = false
      const saisie = normaliserSigneMoins(base + e.key)
      magasin.calc({ saisie })
      // Valeur et curseur posés tout de suite (pas au prochain rendu) : les touches suivantes, frappées
      // directement dans le champ, arrivent à la fin et dans l'ordre.
      el.value = saisie
      el.focus({ preventScroll: true })
      el.setSelectionRange(saisie.length, saisie.length)
      if (e.key === '=') egalSur(saisie)
    }
    window.addEventListener('keydown', surTouche, true)
    return () => window.removeEventListener('keydown', surTouche, true)
  })

  if (!visibleIci) return null
  // Vue réduite (professeur, deux écrans) : agrandie (vers 80 % de la taille réelle), sans jamais
  // dépasser la hauteur de la diapo ; toujours entière dans la diapo (position bornée à l'affichage).
  const k = echelle > 0 ? Math.min(Math.max(1, 0.8 / echelle), (HAUTEUR - 8) / hauteur) : 1
  const gauche = Math.max(0, Math.min(calc.x, LARGEUR - LARGEUR_CALC * k))
  const haut = Math.max(0, Math.min(calc.y, HAUTEUR - hauteur * k))
  const r = calc.resultat
  const perime = !!r && r.saisie !== calc.saisie

  const inserer = (t: Touche) => {
    const el = champ.current
    const focus = !!el && document.activeElement === el
    let base = calc.saisie
    let debut = base.length
    let fin = base.length
    if (apresEgal.current) {
      // Après « = » : un opérateur continue le calcul (Ans …), le reste en commence un nouveau.
      base = t.genre === 'operateur' ? 'Ans' : ''
      debut = fin = base.length
    } else if (focus && el) {
      debut = el.selectionStart ?? base.length
      fin = el.selectionEnd ?? debut
    }
    apresEgal.current = false
    const saisie = base.slice(0, debut) + t.insere + base.slice(fin)
    magasin.calc({ saisie })
    if (focus && el) {
      const pos = debut + t.insere.length
      requestAnimationFrame(() => el.setSelectionRange(pos, pos))
    }
  }

  /** Calcule `saisie` (par défaut la saisie en cours) ; renvoie le résultat. */
  function egalSur(saisie: string) {
    const c = magasin.lire().calc
    if (!saisie.replace(/[=\s]+$/, '').trim()) return null
    const res = calculer(saisie, c.mode, c.ans)
    magasin.calc({ resultat: res, ans: res.ok ? res.valeur : c.ans })
    apresEgal.current = res.ok
    setMessage(null)
    return res
  }
  const egal = () => egalSur(calc.saisie)

  // « Épingler le résultat » : utilisable dès qu'il y a un calcul. Saisie modifiée depuis le dernier « = »
  // (ou jamais calculée) : on la calcule d'abord ; une erreur s'affiche à la place du résultat.
  const aCalculer = calc.saisie.replace(/[=\s]+$/, '').trim() !== ''
  const peutEpingler = (!!r?.ok && !perime) || aCalculer
  const titreEpingler = !peutEpingler
    ? 'Rien à épingler pour l’instant : tape un calcul (clavier ou touches), puis « = » ou Entrée'
    : r?.ok && !perime
      ? 'Poser le résultat sur la diapo (étiquette déplaçable, × pour la retirer)'
      : 'Calculer la saisie puis poser le résultat sur la diapo'
  const epinglerResultat = () => {
    if (!peutEpingler) {
      setMessage('Rien à épingler : tape d’abord un calcul.')
      champ.current?.focus({ preventScroll: true })
      return
    }
    const res = r?.ok && !perime ? r : egalSur(calc.saisie)
    if (res?.ok) epingler(`${res.latexExpression} ${latexValeur(res, calc.exact)}`)
  }

  const retour = () => {
    const el = champ.current
    const focus = !!el && document.activeElement === el
    apresEgal.current = false
    if (focus && el && el.selectionStart !== null && el.selectionEnd !== null && el.selectionStart !== el.selectionEnd) {
      const d = el.selectionStart
      magasin.calc({ saisie: calc.saisie.slice(0, d) + calc.saisie.slice(el.selectionEnd) })
      requestAnimationFrame(() => el.setSelectionRange(d, d))
      return
    }
    const pos = focus && el ? (el.selectionStart ?? calc.saisie.length) : calc.saisie.length
    if (pos === 0) return
    magasin.calc({ saisie: calc.saisie.slice(0, pos - 1) + calc.saisie.slice(pos) })
    if (focus && el) requestAnimationFrame(() => el.setSelectionRange(pos - 1, pos - 1))
  }

  const changerMode = (mode: 'deg' | 'rad') => {
    if (mode === calc.mode) return
    // Même calcul, autre unité d'angle : recalculé tout de suite (sauf s'il utilise Ans).
    const recalcul = r && !perime && !/ans/i.test(calc.saisie) ? calculer(calc.saisie, mode, calc.ans) : null
    magasin.calc(recalcul ? { mode, resultat: recalcul, ans: recalcul.ok ? recalcul.valeur : calc.ans } : { mode })
  }

  const deplacer = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('button')) return
    e.preventDefault()
    e.stopPropagation()
    const [px, py] = versDiapo(e.clientX, e.clientY)
    const dx = px - gauche
    const dy = py - haut
    const pid = e.pointerId
    const bouger = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return
      const [x, y] = versDiapo(ev.clientX, ev.clientY)
      magasin.calc({ x: Math.round(Math.max(0, Math.min(LARGEUR - LARGEUR_CALC * k, x - dx))), y: Math.round(Math.max(0, Math.min(HAUTEUR - Math.min(hauteur * k, HAUTEUR), y - dy))) })
    }
    const fin = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return
      window.removeEventListener('pointermove', bouger)
      window.removeEventListener('pointerup', fin)
      window.removeEventListener('pointercancel', fin)
    }
    window.addEventListener('pointermove', bouger)
    window.addEventListener('pointerup', fin)
    window.addEventListener('pointercancel', fin)
  }

  const inv = calc.inverse
  const touches: Touche[] = [
    T('2nde', '', 'debut', 'calc-fn calc-2nde', 'Fonctions réciproques'),
    T('ln', 'ln(', 'debut', 'calc-fn'),
    T('log', 'log(', 'debut', 'calc-fn'),
    T('xʸ', '^', 'operateur', 'calc-fn', 'Puissance'),
    T('e', 'e', 'debut', 'calc-fn', 'Nombre e'),
    T(inv ? 'sin⁻¹' : 'sin', inv ? 'sin⁻¹(' : 'sin(', 'debut', 'calc-fn'),
    T(inv ? 'cos⁻¹' : 'cos', inv ? 'cos⁻¹(' : 'cos(', 'debut', 'calc-fn'),
    T(inv ? 'tan⁻¹' : 'tan', inv ? 'tan⁻¹(' : 'tan(', 'debut', 'calc-fn'),
    T('√', '√(', 'debut', 'calc-fn', 'Racine carrée'),
    T('x²', '²', 'operateur', 'calc-fn', 'Au carré'),
    T('7', '7', 'chiffre'),
    T('8', '8', 'chiffre'),
    T('9', '9', 'chiffre'),
    T('÷', '÷', 'operateur', 'calc-op', 'Diviser'),
    T('(', '(', 'debut', 'calc-fn'),
    T('4', '4', 'chiffre'),
    T('5', '5', 'chiffre'),
    T('6', '6', 'chiffre'),
    T('×', '×', 'operateur', 'calc-op', 'Multiplier'),
    T(')', ')', 'operateur', 'calc-fn'),
    T('1', '1', 'chiffre'),
    T('2', '2', 'chiffre'),
    T('3', '3', 'chiffre'),
    T('−', '-', 'operateur', 'calc-op', 'Moins'),
    T('π', 'π', 'debut', 'calc-fn', 'Pi'),
    T('0', '0', 'chiffre'),
    T(',', ',', 'chiffre', undefined, 'Virgule'),
    T('Ans', 'Ans', 'debut', 'calc-fn', 'Réponse précédente'),
    T('+', '+', 'operateur', 'calc-op', 'Plus'),
  ]

  return (
    <div
      ref={racine}
      className="projection-calc projection-interactif"
      style={{ left: gauche, top: haut, width: LARGEUR_CALC, transform: k !== 1 ? `scale(${k})` : undefined }}
      role="dialog"
      aria-label="Calculatrice"
      onClick={(e) => e.stopPropagation()}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="calc-tete" onPointerDown={deplacer}>
        <span className="calc-titre">Calculatrice{role === 'prof' && calc.masque ? <em> · cachée à la classe</em> : ''}</span>
        <button
          type="button"
          className={`calc-tete-bouton calc-punaise${calc.garde ? ' actif' : ''}`}
          aria-pressed={!!calc.garde}
          aria-label="Garder la calculatrice d’une diapo à l’autre"
          title={calc.garde ? 'Gardée d’une diapo à l’autre (cliquer pour qu’elle se ferme en changeant de diapo)' : 'Garder la calculatrice ouverte, à sa place, d’une diapo à l’autre'}
          onClick={() => magasin.calc({ garde: !calc.garde })}
        >
          <Pictogramme nom="punaise" taille={18} />
        </button>
        {role === 'prof' && (
          <button
            type="button"
            className={`calc-tete-bouton${calc.masque ? ' actif' : ''}`}
            aria-pressed={calc.masque}
            title={calc.masque ? 'Montrer à la classe' : 'Masquer à la classe'}
            aria-label="Masquer à la classe"
            onClick={() => magasin.calc({ masque: !calc.masque })}
          >
            <Pictogramme nom="masquer" taille={18} />
          </button>
        )}
        <button type="button" className="calc-tete-bouton" aria-label="Fermer la calculatrice" title="Fermer (K)" onClick={() => magasin.calc({ visible: false })}>
          <Pictogramme nom="fermer" taille={18} />
        </button>
      </div>
      <div className="calc-ecran">
        <div className="calc-ligne">
          <input
            ref={champ}
            className="calc-saisie"
            type="text"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="Calcul (saisie libre au clavier)"
            placeholder="ex. 8 × sin(40) ÷ sin(65)"
            value={calc.saisie}
            onChange={(e) => {
              apresEgal.current = false
              const saisie = normaliserSigneMoins(e.target.value)
              magasin.calc({ saisie })
              // « = » tapé en fin de saisie : calcule (comme Entrée), le « = » reste affiché.
              if (/=\s*$/.test(saisie) && !/=\s*$/.test(calc.saisie)) egalSur(saisie)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                egal()
              }
            }}
          />
          <button type="button" className="calc-petit" aria-label="Effacer le dernier caractère" title="Effacer le dernier caractère" onMouseDown={(e) => e.preventDefault()} onClick={retour}>
            ⌫
          </button>
          <button
            type="button"
            className="calc-petit"
            aria-label="Tout effacer"
            title="Tout effacer"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => {
              apresEgal.current = false
              magasin.calc({ saisie: '', resultat: null })
            }}
          >
            C
          </button>
        </div>
        <div className={`calc-resultat${perime ? ' perime' : ''}`} aria-live="polite">
          {r?.ok ? (
            <>
              <span className="calc-echo">
                <MathInline tex={r.latexExpression} />
              </span>
              <span className="calc-valeur">
                <MathInline tex={latexValeur(r, calc.exact)} />
              </span>
            </>
          ) : r ? (
            <span className="calc-erreur">{r.erreur}</span>
          ) : (
            <span className="calc-vide">{message ?? 'Tape un calcul, puis « = » ou Entrée.'}</span>
          )}
        </div>
      </div>
      <div className="calc-modes">
        <span className="calc-groupe" role="group" aria-label="Unité d'angle">
          <button type="button" className={`calc-mode${calc.mode === 'deg' ? ' actif' : ''}`} aria-pressed={calc.mode === 'deg'} onClick={() => changerMode('deg')}>
            DEG
          </button>
          <button type="button" className={`calc-mode${calc.mode === 'rad' ? ' actif' : ''}`} aria-pressed={calc.mode === 'rad'} onClick={() => changerMode('rad')}>
            RAD
          </button>
        </span>
        <span className="calc-groupe" role="group" aria-label="Affichage du résultat">
          <button type="button" className={`calc-mode${calc.exact ? ' actif' : ''}`} aria-pressed={calc.exact} title="Valeur exacte quand c'est possible (fraction, racine, multiple de π)" onClick={() => magasin.calc({ exact: true })}>
            Exact
          </button>
          <button type="button" className={`calc-mode${!calc.exact ? ' actif' : ''}`} aria-pressed={!calc.exact} aria-label="Valeur approchée" title="Valeur approchée (décimale)" onClick={() => magasin.calc({ exact: false })}>
            ≈
          </button>
        </span>
        <button
          type="button"
          className="calc-epingler"
          aria-disabled={!peutEpingler}
          title={titreEpingler}
          onMouseDown={(e) => e.preventDefault()}
          onClick={epinglerResultat}
        >
          <Pictogramme nom="epingle" taille={16} /> Épingler le résultat
        </button>
      </div>
      <div className="calc-touches">
        {touches.map((t) => (
          <button
            key={t.label}
            type="button"
            className={`calc-touche${t.classe ? ` ${t.classe}` : ''}${t.label === '2nde' && inv ? ' actif' : ''}`}
            aria-label={t.aria}
            aria-pressed={t.label === '2nde' ? inv : undefined}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => (t.label === '2nde' ? magasin.calc({ inverse: !inv }) : inserer(t))}
          >
            {t.label}
          </button>
        ))}
        <button type="button" className="calc-touche calc-egal" aria-label="Égal" onMouseDown={(e) => e.preventDefault()} onClick={egal}>
          =
        </button>
      </div>
    </div>
  )
}
