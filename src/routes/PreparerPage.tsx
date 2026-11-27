import { useId, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import '../components/carnet/carnet.css'
import { BandeauEspace } from '../components/compte/BandeauEspace'
import { IconeEvaluation, IconeFeuille, IconeProjeter } from '../components/compte/IconesEspace'
import { MenuEspace } from '../components/compte/MenuEspace'
import { EnTeteCompte, PageCompte, PageReservee } from '../components/compte/PageReservee'
import '../components/compte/profil.css'
import '../components/compte/espace-pages.css'
import { LEVELS } from '../content/chaptersIndex'
import { lireAnneeChoisie } from '../lib/anneeAccueil'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { chapitresDansMonOrdre, numeroRepere, useOrdreChapitres } from '../lib/ordreChapitres'

/**
 * `/espace/preparer` — porte « Préparer un cours » (maquette « préparer » validée le 27/11/2026) : quatre
 * outils en cartes, une phrase chacun. Les outils eux-mêmes ne changent pas : Projeter un chapitre (choix
 * de l'année et du chapitre → lanceur `#projeter` de la page du chapitre), Créer une feuille d'exercices
 * (`/exercice`, mode professeur), Créer une évaluation ou un examen (`/evaluation`, + « Reprendre un
 * document enregistré » → Mes documents), Feuille de remédiation (elle se crée depuis une évaluation
 * enregistrée, dans le panneau des évaluations : `/evaluation#remediation` ouvre ses enregistrements).
 * Réservée, jamais pré-rendue ni indexée.
 */
export function PreparerPage() {
  return (
    <PageCompte titre="Préparer un cours" large sansTete>
      <TeteDeRepli />
      <PageReservee>
        <Preparer />
      </PageReservee>
    </PageCompte>
  )
}

function TeteDeRepli() {
  const compte = useCompte()
  return estConnecteActif(compte) ? null : <EnTeteCompte titre="Préparer un cours" />
}

function IconeRemediation() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <path d="M4 10a8 8 0 0 1 14-4l2 2" />
      <path d="M20 4v4h-4" />
      <path d="M20 14a8 8 0 0 1-14 4l-2-2" />
      <path d="M4 20v-4h4" />
    </svg>
  )
}

function Preparer() {
  const id = useId()
  const navigate = useNavigate()
  const { ordre } = useOrdreChapitres()
  const [niveau, setNiveau] = useState(() => {
    const memo = lireAnneeChoisie()
    return LEVELS.some((l) => l.slug === memo) ? (memo as string) : LEVELS[0].slug
  })
  const chapitres = useMemo(() => chapitresDansMonOrdre(niveau, ordre, LEVELS.find((l) => l.slug === niveau)?.chapters ?? []), [niveau, ordre])
  const [chapitre, setChapitre] = useState<string>('')
  const choisi = chapitres.find((c) => c.slug === chapitre) ?? chapitres[0]

  function projeter(e: FormEvent) {
    e.preventDefault()
    if (choisi) navigate(`/${choisi.levelSlug}/${choisi.slug}#projeter`)
  }

  return (
    <div className="espace-preparer">
      <MenuEspace>
        <BandeauEspace
          titreId={`${id}-titre`}
          surtitre="Préparer un cours"
          titre="Qu'est-ce que tu prépares ?"
          icone={null}
          apresTitre={<p className="ep-phrase">Tout ce qui sert en classe ou sur papier : chaque outil dit en une phrase à quoi il sert.</p>}
        />
        <div className="ep-outils">
          <section className="ep-carte ep-outil" id="projeter" aria-labelledby={`${id}-projeter`}>
            <span className="ep-outil-icone" aria-hidden="true">
              <IconeProjeter taille={28} />
            </span>
            <div>
              <h2 id={`${id}-projeter`}>Projeter un chapitre</h2>
              <p className="ep-outil-phrase">Les diapos du cours, avec stylo, équerre, compas, calculatrice et traceur. PowerPoint ou PDF annoté à la fin.</p>
              <form className="ep-projeter-form" onSubmit={projeter}>
                <label>
                  Année
                  <select
                    value={niveau}
                    onChange={(e) => {
                      setNiveau(e.target.value)
                      setChapitre('')
                    }}
                  >
                    {LEVELS.map((l) => (
                      <option key={l.slug} value={l.slug}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="chapitre">
                  Chapitre
                  <select value={choisi?.slug ?? ''} onChange={(e) => setChapitre(e.target.value)}>
                    {chapitres.map((c) => (
                      <option key={c.slug} value={c.slug}>
                        {numeroRepere(c, ordre)}. {c.title}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="submit" className="ep-bouton principal" disabled={!choisi}>
                  Choisir les étapes <span aria-hidden="true">›</span>
                </button>
              </form>
              <p className="ep-outil-note">Le bouton « Projeter » reste aussi sur chaque page de chapitre.</p>
            </div>
          </section>

          <section className="ep-carte ep-outil" id="feuille" aria-labelledby={`${id}-feuille`}>
            <span className="ep-outil-icone" aria-hidden="true">
              <IconeFeuille mode="bandeau" />
            </span>
            <div>
              <h2 id={`${id}-feuille`}>Créer une feuille d'exercices</h2>
              <p className="ep-outil-phrase">Des exercices tirés des générateurs, avec corrigé et QR code pour refaire en ligne.</p>
              <p className="ep-actions">
                <Link className="ep-bouton principal" to="/exercice">
                  Commencer <span aria-hidden="true">›</span>
                </Link>
              </p>
            </div>
          </section>

          <section className="ep-carte ep-outil" id="evaluation" aria-labelledby={`${id}-evaluation`}>
            <span className="ep-outil-icone" aria-hidden="true">
              <IconeEvaluation mode="bandeau" />
            </span>
            <div>
              <h2 id={`${id}-evaluation`}>Créer une évaluation ou un examen</h2>
              <p className="ep-outil-phrase">Deux séries, version aménagée, corrigé, grille de correction, Word.</p>
              <p className="ep-actions">
                <Link className="ep-bouton principal" to="/evaluation">
                  Commencer <span aria-hidden="true">›</span>
                </Link>
                <Link className="ep-bouton" to="/coffre">
                  Reprendre un document enregistré
                </Link>
              </p>
            </div>
          </section>

          <section className="ep-carte ep-outil" id="remediation" aria-labelledby={`${id}-remediation`}>
            <span className="ep-outil-icone" aria-hidden="true">
              <IconeRemediation />
            </span>
            <div>
              <h2 id={`${id}-remediation`}>Feuille de remédiation</h2>
              <p className="ep-outil-phrase">À partir d'une évaluation corrigée : des exercices ciblés sur ce qui a coincé.</p>
              <p className="ep-actions">
                <Link className="ep-bouton principal" to="/evaluation#remediation">
                  Commencer <span aria-hidden="true">›</span>
                </Link>
                <Link className="ep-bouton" to="/coffre">
                  Mes documents
                </Link>
              </p>
              <p className="ep-outil-note">
                Elle part d'une évaluation enregistrée : « Commencer » ouvre tes enregistrements dans le panneau des évaluations ; sous l'évaluation voulue, clique « Feuille de remédiation ».
              </p>
            </div>
          </section>
        </div>
      </MenuEspace>
    </div>
  )
}
