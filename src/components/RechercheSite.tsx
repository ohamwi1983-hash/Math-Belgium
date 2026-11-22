import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ResultatRecherche, Segment } from '../lib/rechercheIndex'
import { anneeDeDepart } from '../lib/anneeAccueil'

type ModuleRecherche = typeof import('../lib/rechercheIndex')

/** Module de recherche chargé une seule fois, au premier focus (ou au premier clic sur la loupe). */
let promesseModule: Promise<ModuleRecherche> | null = null
const chargerModule = () => (promesseModule ??= import('../lib/rechercheIndex'))

function Texte({ segments }: { segments: Segment[] }) {
  return (
    <>
      {segments.map((s, i) => (s.surligne ? <mark key={i}>{s.texte}</mark> : <span key={i}>{s.texte}</span>))}
    </>
  )
}

const Loupe = ({ taille = 18 }: { taille?: number }) => (
  <svg aria-hidden="true" width={taille} height={taille} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="M20 20l-4-4" />
  </svg>
)

/**
 * Recherche dans l'en-tête du site (toutes les pages qui portent `SiteHeader`) : chapitres, étapes et
 * sous-titres (index léger, `lib/rechercheIndex.ts`, chargé à la demande). Motif ARIA « combobox +
 * listbox » : flèches haut/bas, Entrée (ouvre le résultat actif, sinon le premier), Échap (ferme la
 * liste, puis le champ sur téléphone). Ordinateur (≥ 900 px) : champ toujours visible ; téléphone :
 * une loupe ouvre un champ pleine largeur sous l'en-tête. Le champ ne filtre jamais la frappe.
 */
export function RechercheSite() {
  const navigate = useNavigate()
  const location = useLocation()
  const id = useId()
  const idListe = `${id}-liste`
  const idAide = `${id}-aide`
  const champ = useRef<HTMLInputElement>(null)
  const racine = useRef<HTMLDivElement>(null)
  const boutonLoupe = useRef<HTMLButtonElement>(null)
  const [module, setModule] = useState<ModuleRecherche | null>(null)
  const [requete, setRequete] = useState('')
  const [ouvert, setOuvert] = useState(false) // champ déplié (téléphone)
  const [listeVisible, setListeVisible] = useState(false)
  const [actif, setActif] = useState(-1)

  const charger = useCallback(() => {
    if (!module) void chargerModule().then(setModule)
  }, [module])

  const { resultats, total } = module && requete.trim() ? module.chercher(requete, anneeDeDepart()) : { resultats: [] as ResultatRecherche[], total: 0 }
  const assezLong = requete.trim().length >= 2
  const montrer = listeVisible && assezLong && module !== null

  useEffect(() => setActif(-1), [requete])

  // Changement de page : tout se referme.
  useEffect(() => {
    setListeVisible(false)
    setOuvert(false)
  }, [location.pathname, location.hash])

  // Clic hors de la recherche : la liste se ferme (et le champ du téléphone s'il est vide).
  useEffect(() => {
    if (!listeVisible && !ouvert) return
    const dehors = (e: PointerEvent) => {
      if (racine.current?.contains(e.target as Node)) return
      setListeVisible(false)
      if (!requete) setOuvert(false)
    }
    document.addEventListener('pointerdown', dehors)
    return () => document.removeEventListener('pointerdown', dehors)
  }, [listeVisible, ouvert, requete])

  function ouvrirChamp() {
    charger()
    setOuvert(true)
    // Le champ n'existe à l'écran qu'après ce rendu.
    window.setTimeout(() => champ.current?.focus(), 0)
  }

  function fermerChamp() {
    setListeVisible(false)
    setOuvert(false)
    boutonLoupe.current?.focus()
  }

  function aller(r: ResultatRecherche | undefined) {
    if (!r) return
    setRequete('')
    setListeVisible(false)
    setOuvert(false)
    champ.current?.blur()
    navigate(r.entree.href)
  }

  function clavier(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!resultats.length) return
      e.preventDefault()
      setListeVisible(true)
      const n = resultats.length
      setActif((a) => (e.key === 'ArrowDown' ? (a + 1) % n : a <= 0 ? n - 1 : a - 1))
    } else if (e.key === 'Enter') {
      if (!montrer || !resultats.length) return
      e.preventDefault()
      aller(resultats[actif >= 0 ? actif : 0])
    } else if (e.key === 'Escape') {
      if (montrer) {
        e.preventDefault()
        setListeVisible(false)
        setActif(-1)
      } else if (requete) {
        e.preventDefault()
        setRequete('')
      } else if (ouvert) {
        e.preventDefault()
        fermerChamp()
      }
    }
  }

  const idOption = (i: number) => `${id}-option-${i}`
  const statut = !montrer ? '' : total === 0 ? 'Aucun résultat.' : `${total} résultat${total > 1 ? 's' : ''}${total > resultats.length ? `, ${resultats.length} affichés` : ''}.`

  return (
    <div className={`recherche-site no-export${ouvert ? ' ouvert' : ''}`} ref={racine}>
      <button
        type="button"
        className="recherche-loupe"
        ref={boutonLoupe}
        aria-label={ouvert ? 'Fermer la recherche' : 'Chercher une notion'}
        aria-expanded={ouvert}
        onClick={() => (ouvert ? fermerChamp() : ouvrirChamp())}
      >
        {ouvert ? (
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        ) : (
          <Loupe taille={20} />
        )}
      </button>
      <div className="recherche-zone" role="search">
        <label className="recherche-champ">
          <Loupe />
          <span className="sr-only">Chercher une notion</span>
          <input
            ref={champ}
            type="search"
            role="combobox"
            aria-expanded={montrer}
            aria-controls={idListe}
            aria-autocomplete="list"
            aria-activedescendant={montrer && actif >= 0 ? idOption(actif) : undefined}
            aria-describedby={idAide}
            placeholder="Chercher une notion : Chasles, dérivée…"
            autoComplete="off"
            spellCheck={false}
            enterKeyHint="search"
            value={requete}
            onFocus={() => {
              charger()
              setListeVisible(true)
            }}
            onChange={(e) => {
              setRequete(e.target.value)
              setListeVisible(true)
            }}
            onKeyDown={clavier}
          />
        </label>
        <span id={idAide} className="sr-only">
          Tape un mot du cours ; flèches pour parcourir les résultats, Entrée pour ouvrir.
        </span>
        <div className="recherche-popup" hidden={!montrer}>
          <ul id={idListe} role="listbox" aria-label="Résultats de la recherche" className="recherche-liste">
            {resultats.map((r, i) => (
              <li
                key={r.entree.href}
                id={idOption(i)}
                role="option"
                aria-selected={i === actif}
                className={i === actif ? 'actif' : undefined}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => aller(r)}
                onPointerMove={() => setActif(i)}
              >
                <span className="recherche-contexte">{r.contexte}</span>
                <span className="recherche-titre">
                  <Texte segments={r.titre} />
                </span>
                {r.detail && (
                  <span className="recherche-detail">
                    <Texte segments={r.detail} />
                  </span>
                )}
              </li>
            ))}
          </ul>
          {montrer && total === 0 && (
            <p className="recherche-vide">
              Rien trouvé pour « {requete.trim()} ». Essaie un autre mot du cours : « vecteur », « dérivée », « Pythagore »…
            </p>
          )}
          {montrer && total > resultats.length && <p className="recherche-plus">{total - resultats.length} autres résultats : précise ta recherche.</p>}
        </div>
        <span className="sr-only" role="status" aria-live="polite">
          {statut}
        </span>
      </div>
    </div>
  )
}
