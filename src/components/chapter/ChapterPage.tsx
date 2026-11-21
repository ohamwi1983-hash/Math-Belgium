import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { ChapterContent, ChapterSection } from '../../content/types'
import { RichText } from '../Math'
import { RecapFinal } from './RecapFinal'
import { Formulaire } from './Formulaire'
import { ExerciseGeneratorSection } from './ExerciseGeneratorSection'
import { ExportSection } from './ExportSection'
import { OutilsChapitre } from './OutilsChapitre'
import { ColonneDroite, ContenuEtape, CarteAToi, Essentiel } from './ContenuEtape'
import type { BlocEntrainement, Panneau } from './ContenuEtape'
import { BarreProgression, BlocReprendre, LienVue, ListeEtapes, OngletsChapitre } from './CarteChapitre'
import type { Aller, Vue } from './CarteChapitre'
import { ReviserVue } from './ReviserVue'
import { PanneauModal } from './PanneauModal'
import { Icone } from './Icones'
import { dureeEtape, insecables, minusculeInitiale, titreCourt, useParcours } from '../../lib/parcoursChapitre'
import { useMediaQuery } from '../../lib/useMediaQuery'

/** « Avant de commencer : qu'est-ce qu'un vecteur ? » → « Qu'est-ce qu'un vecteur ? » (le bouton
 * porte déjà « Avant de commencer »). */
function titreIntro(t: string): string {
  const reste = t.replace(/^Avant de commencer\s*[:—–-]\s*/i, '')
  return insecables(reste.charAt(0).toUpperCase() + reste.slice(1))
}

function decoder(fragment: string): string {
  try {
    return decodeURIComponent(fragment)
  } catch {
    return fragment
  }
}

/**
 * Gabarit unique partagé par tous les chapitres. Un chapitre est entièrement défini par ses
 * données (`ChapterContent`) — voir CLAUDE.md, section "Gabarit ChapterPage".
 *
 * Parcours « une étape par écran » (téléphone d'abord) sur UNE seule route `/{niveau}/{chapitre}` :
 * la vue est choisie par le fragment de l'URL — aucun → carte du chapitre (onglet Apprendre),
 * `#<sectionId>` → l'étape (les liens `…#sectionId` existants ouvrent donc la bonne étape),
 * `#reviser` / `#entrainer` → onglets Réviser / S'entraîner. Chaque changement de vue passe par
 * l'historique (React Router) : « retour » ramène à la vue précédente.
 *
 * TOUT le chapitre reste dans le DOM, dans l'ordre et avec le balisage d'avant (en-tête, intro,
 * sections, « Ce qu'il faut retenir », formulaire) : la vue courante ne fait que MASQUER à l'écran
 * ce qui n'en fait pas partie (`.parcours[data-vue]`, règles `@media screen` de `index.css`). D'où :
 * - pré-rendu (SEO) : `dist/{route}/index.html` contient le texte de toutes les sections, sans
 *   page spéciale pour les robots ni contenu différent de celui des visiteurs ;
 * - impression (Ctrl+P, menu « Imprimer ») et export HTML : inchangés — ils voient le même DOM,
 *   toutes les règles du parcours étant limitées à l'écran et à un ancêtre (`.chapter-layout`)
 *   situé hors de `.page`, le seul nœud cloné par l'export ;
 * - tout ce qui n'existe qu'à l'écran (carte, onglets, tiroirs, cartes « Manipuler »/« À toi »,
 *   barre du bas, essentiel, Réviser) porte `no-export`.
 */
export function ChapterPage({ chapter }: { chapter: ChapterContent }) {
  const location = useLocation()
  const navigate = useNavigate()
  const fragment = decoder(location.hash.slice(1))
  const sections = chapter.sections
  const indexEtape = sections.findIndex((s) => s.id === fragment)
  const etape = indexEtape >= 0 ? sections[indexEtape] : null
  const vue: Vue = etape ? 'etape' : fragment === 'reviser' ? 'reviser' : fragment === 'entrainer' ? 'entrainer' : 'carte'
  const large = useMediaQuery('(min-width: 1200px)')
  const colonneDroite = large && vue === 'etape'
  const { etat, ouvrir, marquer } = useParcours(chapter)
  const [introOuverte, setIntroOuverte] = useState(false)
  const [panneau, setPanneau] = useState<Panneau | null>(null)
  const durees = useMemo(() => Object.fromEntries(sections.map((s) => [s.id, dureeEtape(s.blocks)])), [sections])

  const aller: Aller = useCallback(
    (cible) => {
      if ((cible ?? '') === fragment) return
      navigate({ pathname: location.pathname, search: location.search, hash: cible ? `#${cible}` : '' })
    },
    [navigate, location.pathname, location.search, fragment],
  )

  // Changement de vue : haut de page ; après une navigation dans le parcours, focus sur le titre
  // de l'étape (lecteurs d'écran, clavier). Pas au premier affichage.
  const dejaAffiche = useRef(false)
  useLayoutEffect(() => {
    window.scrollTo(0, 0)
    if (dejaAffiche.current && etape) {
      document.getElementById(etape.id)?.querySelector<HTMLElement>('.section-title')?.focus({ preventScroll: true })
    }
    dejaAffiche.current = true
  }, [fragment]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (etape) ouvrir(etape.id)
  }, [etape, ouvrir])

  return (
    <div className={`chapter-layout parcours chapter-${chapter.slug}`} data-vue={vue}>
      {etape && <EnteteEtape chapter={chapter} index={indexEtape} aller={aller} />}

      {etape && (
        <aside className="parcours-cote no-export" aria-label="Le chapitre">
          <LienVue cible={null} aller={aller} className="cote-titre">
            <span className="eyebrow">
              {chapter.level} · chapitre {chapter.chapterNumber}
            </span>
            <span className="cote-nom">{chapter.title}</span>
          </LienVue>
          <OngletsChapitre vue={vue} aller={aller} prefixe="cote" />
          <BarreProgression lues={etat.lues.length} total={sections.length} />
          <ListeEtapes chapter={chapter} etat={etat} courante={etape.id} durees={durees} aller={aller} variante="cote" />
          <OutilsChapitre chapter={chapter} />
        </aside>
      )}

      <div className="page chapter-main">
        <header className="chapter-head">
          <p className="eyebrow">
            {chapter.level} — Chapitre {chapter.chapterNumber}
          </p>
          <h1 className="chapter-title">{chapter.title}</h1>
          <p className="chapter-lede">
            <RichText text={chapter.lede} />
          </p>
        </header>

        <BlocReprendre chapter={chapter} etat={etat} aller={aller} />
        <OngletsChapitre vue={vue} aller={aller} prefixe="page" className="onglets-page" />

        {chapter.intro && (
          <section className={`chapter-section intro-section${introOuverte ? ' intro-ouverte' : ''}`}>
            <button type="button" className="intro-bascule no-export" aria-expanded={introOuverte} onClick={() => setIntroOuverte((o) => !o)}>
              <span>
                <span className="intro-avant">Avant de commencer</span>
                <span className="intro-nom">{titreIntro(chapter.intro.title)}</span>
              </span>
              <span className="tiroir-signe" aria-hidden="true">
                {introOuverte ? '−' : '+'}
              </span>
            </button>
            <h2 className="section-title" style={{ marginBottom: 16 }}>
              {chapter.intro.title}
            </h2>
            <ContenuEtape blocks={chapter.intro.blocks} actif={vue === 'carte' && introOuverte} colonneDroite={false} ouvrirPanneau={setPanneau} />
          </section>
        )}

        <div id="panneau-apprendre" className="parcours-carte no-export" role="tabpanel" aria-labelledby="page-onglet-apprendre">
          <ListeEtapes chapter={chapter} etat={etat} courante={etat.derniere} durees={durees} aller={aller} variante="carte" />
          <div className="carte-outils">
            <OutilsChapitre chapter={chapter} />
          </div>
        </div>

        {sections.map((s, i) => (
          <EtapeSection
            key={s.id}
            section={s}
            actif={i === indexEtape}
            precedente={sections[i - 1]}
            suivante={sections[i + 1]}
            duree={durees[s.id]}
            lue={etat.lues.includes(s.id)}
            marquer={marquer}
            aller={aller}
            colonneDroite={colonneDroite}
            ouvrirPanneau={setPanneau}
          />
        ))}

        <ReviserVue chapter={chapter} aller={aller} />
        <RecapFinal recap={chapter.recap} />
        <Formulaire formulaire={chapter.formulaire} chapter={chapter} />
        <ExportSection chapter={chapter} />
        <EntrainerVue chapter={chapter} aller={aller} />
      </div>

      {colonneDroite && etape && (
        <aside className="parcours-droite no-export" aria-label="Manipuler et s'entraîner">
          <ColonneDroite blocks={etape.blocks} ouvrirPanneau={setPanneau} />
        </aside>
      )}

      <PanneauModal panneau={panneau} fermer={() => setPanneau(null)} />
    </div>
  )
}

/** En-tête collant d'une étape (téléphone, tablette) : bouton carte, « titre · étape n / N ». */
function EnteteEtape({ chapter, index, aller }: { chapter: ChapterContent; index: number; aller: Aller }) {
  const total = chapter.sections.length
  return (
    <div className="etape-entete no-export">
      <LienVue cible={null} aller={aller} className="etape-carte" aria-label="Carte du chapitre">
        <Icone nom="menu" />
      </LienVue>
      <div className="etape-entete-texte">
        <p>
          {chapter.title} · étape {index + 1} / {total}
        </p>
        <div className="barre" aria-hidden="true">
          <span style={{ width: `${(100 * (index + 1)) / total}%` }} />
        </div>
      </div>
    </div>
  )
}

function EtapeSection({
  section,
  actif,
  precedente,
  suivante,
  duree,
  lue,
  marquer,
  aller,
  colonneDroite,
  ouvrirPanneau,
}: {
  section: ChapterSection
  actif: boolean
  precedente?: ChapterSection
  suivante?: ChapterSection
  duree: number
  lue: boolean
  marquer: (id: string, lue: boolean) => void
  aller: Aller
  colonneDroite: boolean
  ouvrirPanneau: (p: Panneau) => void
}) {
  return (
    <section className={`chapter-section${actif ? ' etape-active' : ''}`} id={section.id}>
      <div className="section-head">
        <span className="section-num">{section.number}</span>
        <h2 className="section-title" tabIndex={-1}>
          {section.title}
        </h2>
      </div>
      <p className="etape-meta no-export">
        <span className="etape-meta-num">Étape {section.number} · </span>≈ {duree} min
        {precedente && <> · tu as vu : {minusculeInitiale(titreCourt(precedente))}</>}
      </p>
      <div className="section-body">
        {section.kicker && <p className="section-kicker">{section.kicker}</p>}
        {section.essentiel && section.essentiel.length > 0 && <Essentiel phrases={section.essentiel} />}
        <ContenuEtape blocks={section.blocks} actif={actif} colonneDroite={colonneDroite && actif} ouvrirPanneau={ouvrirPanneau} />
      </div>
      {actif && (
        <nav className="etape-nav no-export" aria-label="Étapes">
          {precedente ? (
            <LienVue cible={precedente.id} aller={aller} className="btn-parcours nav-prec" aria-label={`Étape précédente : ${precedente.number}. ${titreCourt(precedente)}`}>
              <span aria-hidden="true">‹</span>
              <span className="nav-court" aria-hidden="true">
                {precedente.number}
              </span>
              <span className="nav-long" aria-hidden="true">
                {precedente.number}. {titreCourt(precedente)}
              </span>
            </LienVue>
          ) : (
            <LienVue cible={null} aller={aller} className="btn-parcours nav-prec">
              <span aria-hidden="true">‹</span> Carte
            </LienVue>
          )}
          <button type="button" className={`btn-parcours btn-compris${lue ? ' fait' : ''}`} aria-pressed={lue} onClick={() => marquer(section.id, !lue)}>
            <Icone nom="coche" taille={17} />
            J’ai compris
          </button>
          {suivante ? (
            <LienVue cible={suivante.id} aller={aller} className="btn-parcours btn-plein nav-suiv" aria-label={`Étape suivante : ${suivante.number}. ${titreCourt(suivante)}`}>
              <span className="nav-texte" aria-hidden="true">
                {suivante.number}. {titreCourt(suivante)}
              </span>
              <span aria-hidden="true">›</span>
            </LienVue>
          ) : (
            <LienVue cible="reviser" aller={aller} className="btn-parcours btn-plein nav-suiv">
              <span className="nav-texte">Réviser le chapitre</span>
              <span aria-hidden="true">›</span>
            </LienVue>
          )}
        </nav>
      )}
    </section>
  )
}

/** Onglet « S'entraîner » : feuilles d'exercices / évaluation blanche du chapitre, puis les
 * exercices de chaque étape et le quiz vrai / faux du chapitre. */
function EntrainerVue({ chapter, aller }: { chapter: ChapterContent; aller: Aller }) {
  const parEtape = chapter.sections
    .map((s) => ({ s, cartes: s.blocks.filter((b): b is BlocEntrainement => b.kind === 'entrainement') }))
    .filter((x) => x.cartes.length > 0)
  return (
    <div id="panneau-entrainer" className="parcours-entrainer no-export" role="tabpanel" aria-label="S'entraîner">
      <ExerciseGeneratorSection chapter={chapter} />
      {parEtape.length > 0 && (
        <section className="entrainer-etapes" aria-labelledby="entrainer-titre">
          <h2 id="entrainer-titre">Les exercices de chaque étape</h2>
          {parEtape.map(({ s, cartes }) => (
            <div key={s.id} className="entrainer-groupe">
              <p className="entrainer-etape">
                <LienVue cible={s.id} aller={aller}>
                  {s.number}. {titreCourt(s)}
                </LienVue>
              </p>
              {cartes.map((b, i) => (
                <CarteAToi key={i} bloc={b} compacte />
              ))}
            </div>
          ))}
          {chapter.recap.entrainement && (
            <div className="entrainer-groupe">
              <p className="entrainer-etape">Tout le chapitre</p>
              <CarteAToi bloc={chapter.recap.entrainement} compacte />
            </div>
          )}
        </section>
      )}
    </div>
  )
}
