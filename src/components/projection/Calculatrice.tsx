import { useLayoutEffect, useRef, useState } from 'react'
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
 * exacte ou ≈, Ans ; « Épingler » pose le résultat sur la diapo. Évaluation par le parseur maison
 * `lib/projection/calculatrice.ts` (jamais `eval`). Position en px logiques de la diapo, partagée avec
 * l'autre écran ; sur la vue réduite du professeur, agrandie pour rester utilisable au doigt.
 */
export function Calculatrice({
  magasin,
  role,
  echelle,
  versDiapo,
  epingler,
}: {
  magasin: MagasinInstruments
  role: Role
  echelle: number
  versDiapo: (x: number, y: number) => [number, number]
  epingler: (latex: string) => void
}) {
  const calc = useInstrument(magasin, (e) => e.calc)
  const champ = useRef<HTMLInputElement>(null)
  const apresEgal = useRef(false)
  const racine = useRef<HTMLDivElement>(null)
  const [hauteur, setHauteur] = useState(500)
  useLayoutEffect(() => {
    if (racine.current) setHauteur(racine.current.offsetHeight)
  })
  if (!calc.visible || (role === 'diapos' && calc.masque)) return null
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

  const egal = () => {
    if (!calc.saisie.trim()) return
    const res = calculer(calc.saisie, calc.mode, calc.ans)
    magasin.calc({ resultat: res, ans: res.ok ? res.valeur : calc.ans })
    apresEgal.current = res.ok
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
              magasin.calc({ saisie: normaliserSigneMoins(e.target.value) })
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
            <span className="calc-vide">Tape un calcul, puis « = » ou Entrée.</span>
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
          disabled={!r?.ok}
          title="Poser le résultat sur la diapo"
          onClick={() => {
            if (r?.ok) epingler(`${r.latexExpression} ${latexValeur(r, calc.exact)}`)
          }}
        >
          <Pictogramme nom="epingle" taille={16} /> Épingler
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
