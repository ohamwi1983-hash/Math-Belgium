import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { SiteHeader } from '../components/SiteHeader'
import { LEVELS, findChapter } from '../content/chaptersIndex'
import type { ChapterContent } from '../content/types'
import { usePageNonIndexee } from '../lib/useDocumentMeta'
import { anneeDeDepart } from '../lib/anneeAccueil'
import { lireDernieresEtapes } from '../lib/parcoursChapitre'
import { EVENEMENT_SUIVI, lireEssais } from '../lib/suiviEssais'
import { estGenerateurMigre, generatorLink } from '../lib/generatorLink'
import { estChapitreFonctionnel } from '../lib/chapitresFonctionnels'
import { LIBELLE_ETAT_GENERATEUR, etatGenerateur, trierParEtat, type EtatGenerateur } from '../lib/guideEleve'
import { IconeEleve } from '../components/eleve/IconesEleve'
import '../components/eleve/guideEleve.css'

/** Feuille « Rapide » : ≈ 10 min, 4 exercices (maquette « entrainer » du 27/11/2026). */
const NOMBRE_RAPIDE = 4
/** « Tout le chapitre » : le nombre d'exercices par défaut de l'assistant (`compositionEleve.ts::NOMBRE_FEUILLE_DEFAUT`). */
const NOMBRE_TOUT = 10
const VISIBLES = 6

type Feuille = 'rapide' | 'tout' | 'mesure'

interface LigneGenerateur {
  id: string
  chantier: string
  titre: string
  etape: number | null
  etat: EtatGenerateur
}

/** Générateurs du chapitre dans l'ordre du cours (cartes « S'entraîner » des étapes, puis le quiz de fin). */
function generateursDuChapitre(chapter: ChapterContent, essais: ReturnType<typeof lireEssais>): LigneGenerateur[] {
  const vus = new Set<string>()
  const res: LigneGenerateur[] = []
  for (const s of chapter.sections) {
    for (const b of s.blocks) {
      if (b.kind !== 'entrainement' || vus.has(b.generatorId)) continue
      vus.add(b.generatorId)
      res.push({ id: b.generatorId, chantier: b.chantier, titre: b.title, etape: s.number, etat: etatGenerateur(essais[b.generatorId]) })
    }
  }
  const fin = chapter.recap.entrainement
  if (fin && !vus.has(fin.generatorId)) res.push({ id: fin.generatorId, chantier: fin.chantier, titre: fin.title, etape: null, etat: etatGenerateur(essais[fin.generatorId]) })
  return res
}

/** Chapitre de départ : `?niveau=&chapitre=`, sinon le dernier ouvert de l'année, sinon le premier de l'année. */
function chapitreDeDepart(params: URLSearchParams): ChapterContent {
  const niveau = params.get('niveau')
  const slug = params.get('chapitre')
  if (niveau && slug) {
    const c = findChapter(niveau, slug)
    if (c) return c
  }
  const annee = (niveau && LEVELS.some((l) => l.slug === niveau) ? niveau : null) ?? anneeDeDepart() ?? LEVELS[0].slug
  const d = lireDernieresEtapes()[annee]
  const dernier = d ? findChapter(annee, d.chapitre) : undefined
  return dernier ?? LEVELS.find((l) => l.slug === annee)?.chapters[0] ?? LEVELS[0].chapters[0]
}

/**
 * Page « M'entraîner » (`/entrainer`, côté élève, maquette « entrainer » du 27/11/2026) — publique, non
 * indexée, jamais pré-rendue : choix du chapitre, feuille à imprimer (Rapide ≈ 10 min · 4 exercices, Tout le
 * chapitre, Sur mesure → l'assistant existant `/{niveau}/{chapitre}/exercices`), exercices corrigés tout de
 * suite avec leur état d'après les essais gardés dans CE navigateur (à revoir / nouveau / réussi, même règle
 * que Ma progression) et l'interro blanche. Rien n'est envoyé.
 */
export function EntrainerPage() {
  usePageNonIndexee('M’entraîner')
  const [params, setParams] = useSearchParams()
  const [chapitre, setChapitre] = useState<ChapterContent>(() => chapitreDeDepart(params))
  const [feuille, setFeuille] = useState<Feuille>('rapide')
  const [tout, setTout] = useState(false)
  const [essais, setEssais] = useState(lireEssais)

  // Essais faits dans un autre onglet (ou au retour d'un générateur) : relus.
  useEffect(() => {
    const relire = () => setEssais(lireEssais())
    window.addEventListener(EVENEMENT_SUIVI, relire)
    window.addEventListener('storage', relire)
    window.addEventListener('focus', relire)
    return () => {
      window.removeEventListener(EVENEMENT_SUIVI, relire)
      window.removeEventListener('storage', relire)
      window.removeEventListener('focus', relire)
    }
  }, [])

  // L'adresse suit le chapitre choisi (retour arrière depuis un générateur : même chapitre).
  useEffect(() => {
    if (params.get('niveau') === chapitre.levelSlug && params.get('chapitre') === chapitre.slug) return
    setParams({ niveau: chapitre.levelSlug, chapitre: chapitre.slug }, { replace: true })
  }, [chapitre, params, setParams])

  const lignes = useMemo(() => trierParEtat(generateursDuChapitre(chapitre, essais)), [chapitre, essais])
  const visibles = tout ? lignes : lignes.slice(0, VISIBLES)
  const base = `/${chapitre.levelSlug}/${chapitre.slug}/exercices`
  const feuilles = estChapitreFonctionnel(chapitre.levelSlug, chapitre.slug)
  const lienFeuille = feuille === 'rapide' ? `${base}?type=feuille&nombre=${NOMBRE_RAPIDE}` : feuille === 'tout' ? `${base}?type=feuille&nombre=${NOMBRE_TOUT}` : base
  const cartes: { id: Feuille; titre: string; sous: string }[] = [
    { id: 'rapide', titre: 'Rapide', sous: `≈ 10 min · ${NOMBRE_RAPIDE} exercices` },
    { id: 'tout', titre: 'Tout le chapitre', sous: `${NOMBRE_TOUT} exercices` },
    { id: 'mesure', titre: 'Sur mesure', sous: 'je choisis' },
  ]
  const aRevoir = lignes.filter((l) => l.etat === 'revoir').length

  function choisirCarte(e: React.KeyboardEvent, i: number) {
    const j = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? (i + 1) % 3 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? (i + 2) % 3 : -1
    if (j < 0) return
    e.preventDefault()
    setFeuille(cartes[j].id)
    document.getElementById(`ge-feuille-${cartes[j].id}`)?.focus()
  }

  return (
    <>
      <SiteHeader />
      <main className="ge-ent">
        <h1>M’entraîner</h1>
        <div className="ge-ent-choix">
          <label htmlFor="ge-ent-chapitre">Chapitre :</label>
          <select
            id="ge-ent-chapitre"
            value={`${chapitre.levelSlug}/${chapitre.slug}`}
            onChange={(e) => {
              const [n, s] = e.target.value.split('/')
              const c = findChapter(n, s)
              if (c) {
                setChapitre(c)
                setTout(false)
              }
            }}
          >
            {LEVELS.map((l) => (
              <optgroup key={l.slug} label={l.label}>
                {l.chapters.map((c) => (
                  <option key={c.slug} value={`${l.slug}/${c.slug}`}>
                    {c.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {feuilles && (
          <section aria-labelledby="ge-ent-feuille">
            <h2 id="ge-ent-feuille">Une feuille d’exercices à imprimer</h2>
            <div className="ge-ent-cartes" role="radiogroup" aria-labelledby="ge-ent-feuille" style={{ marginTop: 10 }}>
              {cartes.map((c, i) => (
                <button
                  key={c.id}
                  id={`ge-feuille-${c.id}`}
                  type="button"
                  role="radio"
                  aria-checked={feuille === c.id}
                  tabIndex={feuille === c.id ? 0 : -1}
                  className="ge-ent-carte"
                  onClick={() => setFeuille(c.id)}
                  onKeyDown={(e) => choisirCarte(e, i)}
                >
                  <span className="ge-ent-carte-titre">{c.titre}</span>
                  <span className="ge-ent-carte-sous">{c.sous}</span>
                </button>
              ))}
            </div>
            <Link className="ge-bouton-plein ge-ent-creer" to={lienFeuille} style={{ marginTop: 12 }}>
              Créer ma feuille ›
            </Link>
            <p className="ge-ent-note" style={{ marginTop: 8 }}>
              Feuille et corrigé à imprimer ou à télécharger, avec un QR code par exercice pour le refaire en ligne.
            </p>
          </section>
        )}

        <section aria-labelledby="ge-ent-gens">
          <h2 id="ge-ent-gens">{feuilles ? 'Ou un exercice corrigé tout de suite' : 'Un exercice corrigé tout de suite'}</h2>
          {aRevoir > 0 && (
            <p className="ge-ent-note" style={{ marginTop: 4 }}>
              Commence par {aRevoir === 1 ? 'l’exercice « à revoir »' : `les ${aRevoir} exercices « à revoir »`} : ce sont ceux qui t’ont posé problème.
            </p>
          )}
          {lignes.length === 0 ? (
            <p className="ge-ent-note">Pas encore d’exercice en ligne pour ce chapitre.</p>
          ) : (
            <ul className="ge-ent-liste" style={{ marginTop: 10 }}>
              {visibles.map((g) => {
                const contenu = (
                  <>
                    <span className={`ge-etat ge-etat-${g.etat}`}>{LIBELLE_ETAT_GENERATEUR[g.etat]}</span>
                    <span className="ge-ent-gen-titre">
                      {g.titre} <span className="ge-ent-gen-id">· {g.id}</span>
                      <span className="ge-ent-gen-etape">{g.etape ? `Étape ${g.etape}` : 'Tout le chapitre'}</span>
                    </span>
                    <span className="ge-chevron" aria-hidden="true">
                      ›
                    </span>
                  </>
                )
                const lien = generatorLink(g.chantier, g.id)
                return (
                  <li key={g.id}>
                    {estGenerateurMigre(g.chantier, g.id) ? (
                      <Link className="ge-ent-gen" to={lien}>
                        {contenu}
                      </Link>
                    ) : (
                      <a className="ge-ent-gen" href={lien} target="_blank" rel="noopener noreferrer">
                        {contenu}
                        <span className="sr-only"> (nouvel onglet)</span>
                      </a>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
          {lignes.length > VISIBLES && (
            <button type="button" className="ge-bouton-discret ge-ent-plus" style={{ marginTop: 6 }} aria-expanded={tout} onClick={() => setTout((t) => !t)}>
              {tout ? 'Montrer moins d’exercices' : `Voir les ${lignes.length - VISIBLES} autres exercices`}
            </button>
          )}
        </section>

        {feuilles && (
          <Link className="ge-bouton-contour ge-ent-blanche" to={`${base}?type=blanche&duree=20`}>
            <IconeEleve nom="chrono" taille={22} />
            Interro blanche (20 min)
          </Link>
        )}
        <p className="ge-ent-note">
          <Link to={`/suivi?niveau=${encodeURIComponent(chapitre.levelSlug)}&chapitre=${encodeURIComponent(chapitre.slug)}`}>Voir ma progression</Link> · L’état des exercices reste sur cet appareil : rien n’est envoyé.
        </p>
        <p className="ge-ent-note">
          <Link to={`/${chapitre.levelSlug}/${chapitre.slug}`}>Revoir le cours : {chapitre.title}</Link>
        </p>
      </main>
    </>
  )
}
