import { useEffect, useId, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { findChapter } from '../../content/chaptersIndex'
import { ajouterJours } from '../../lib/calendrierFwb'
import { chapitresDeLaClasse, dateIso, dateLongue, libelleNiveau, progressionClasse, type Classe, type Seance } from '../../lib/carnet'
import { lundiDe } from '../../lib/carnetAgenda'
import type { CaseHoraire } from '../../lib/horaire'
import { CarteSeance } from './CarteSeance'
import { couleurClasse, useCarnet } from './contexteCarnet'
import { EvaluationMatiere } from './EvaluationMatiere'
import { FormClasse, type SaisieClasse } from './GestionClasses'
import { jourMois, trierRecentes } from './outilsCarnet'
import { ProgressionClasse } from './ProgressionClasse'
import { CompteurClasse } from './HeuresEffectives'
import { ListeARendre } from './DevoirsARendre'
import { devoirsEntre } from '../../lib/carnetDevoirs'

const SEMAINES_PAR_PAGE = 4
const SEMAINES_COMPLETES = 2

/**
 * Page d'UNE classe : en-tête (niveau, heures par semaine, école, nombre de séances, modifier la
 * classe), actions (Noter une séance, Évaluation sur la matière vue, Agenda de la classe), fil des
 * séances groupé par semaine (les deux semaines les plus récentes en entier, les plus anciennes en
 * une ligne), et à côté la progression du programme (sections vues avec leur date, en cours, à venir ;
 * comparaison avec une autre classe du même niveau ; détail complet repliable).
 */
export function PageClasse({
  classe,
  seances,
  cases,
  maintenant,
  onNoter,
  onModifierClasse,
  onSupprimerClasse,
}: {
  classe: Classe
  seances: Seance[]
  cases: CaseHoraire[]
  maintenant: Date
  onNoter: (classeId: string) => void
  onModifierClasse: (id: string, s: SaisieClasse) => Promise<boolean>
  onSupprimerClasse: (c: Classe) => void
}) {
  const id = useId()
  const ctx = useCarnet()
  const location = useLocation()
  const [edition, setEdition] = useState(false)
  const [semaines, setSemaines] = useState(SEMAINES_PAR_PAGE)
  const titreEvaluation = useRef<HTMLHeadingElement>(null)
  const aujourdhui = dateIso(maintenant)
  const seancesClasse = useMemo(() => trierRecentes(seances.filter((s) => s.classe_id === classe.id)), [seances, classe.id])
  const ecole = ctx.ecoles.find((e) => e.id === classe.ecole_id)?.nom ?? 'École inconnue'
  const heuresSemaine = cases.filter((c) => c.classe_id === classe.id && c.semaine === null && ctx.grilles.some((g) => g.ecole_id === c.ecole_id)).length
  const n = seancesClasse.length

  useEffect(() => {
    setEdition(false)
    setSemaines(SEMAINES_PAR_PAGE)
  }, [classe.id])

  // `#evaluation` (raccourci d'Aujourd'hui) : défiler jusqu'au bloc.
  useEffect(() => {
    if (location.hash === '#evaluation') requestAnimationFrame(() => titreEvaluation.current?.scrollIntoView({ block: 'start' }))
  }, [location.hash, classe.id])

  const groupes = useMemo(() => {
    const m = new Map<string, Seance[]>()
    for (const s of seancesClasse) {
      const l = lundiDe(s.date_seance)
      m.set(l, [...(m.get(l) ?? []), s])
    }
    return [...m.entries()]
  }, [seancesClasse])

  const cetteSemaine = lundiDe(aujourdhui)
  const titreGroupe = (lundi: string) => {
    if (lundi === cetteSemaine) return 'Cette semaine'
    if (lundi === ajouterJours(cetteSemaine, -7)) return 'Semaine dernière'
    const d = dateLongue(lundi, false)
    return `Semaine du ${lundi.slice(0, 4) === aujourdhui.slice(0, 4) ? d.replace(/ \d{4}$/, '') : d}`
  }

  function allerEvaluation() {
    titreEvaluation.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    titreEvaluation.current?.focus({ preventScroll: true })
  }

  return (
    <div className="carnet-vue carnet-vue-classe">
      <div className="carnet-classe-tete">
        <div>
          <h2 className="carnet-titre-vue carnet-titre-classe">
            <span className={`carnet-point carnet-c${couleurClasse(ctx.classes, classe.id)}`} aria-hidden="true" />
            {classe.nom}
          </h2>
          <p className="carnet-classe-meta">
            {[classe.niveau ? libelleNiveau(classe.niveau) : 'niveau non précisé', heuresSemaine > 0 ? `${heuresSemaine} h/semaine` : null, ecole, `${n} séance${n > 1 ? 's' : ''} notée${n > 1 ? 's' : ''}`]
              .filter(Boolean)
              .join(' · ')}
            {' · '}
            <button type="button" className="compte-bouton-lien" aria-expanded={edition} aria-controls={`${id}-edition`} onClick={() => setEdition(!edition)}>
              Modifier la classe
            </button>
          </p>
        </div>
        <div className="carnet-classe-actions">
          <button type="button" className="carnet-bouton" onClick={allerEvaluation}>
            Évaluation sur la matière vue
          </button>
          <Link className="carnet-bouton" to={`/carnet/agenda?classe=${classe.id}`}>
            Agenda de la classe
          </Link>
          <button type="button" className="carnet-bouton principal" onClick={() => onNoter(classe.id)}>
            Noter une séance
          </button>
        </div>
      </div>

      {edition && (
        <section id={`${id}-edition`} className="carnet-carte carnet-classe-edition" aria-label={`Modifier la classe ${classe.nom}`}>
          <FormClasse
            initiale={classe}
            ecoles={ctx.ecoles}
            occupe={ctx.occupe}
            libelle="Enregistrer"
            onEnvoyer={async (s) => {
              if (await onModifierClasse(classe.id, s)) setEdition(false)
            }}
            onAnnuler={() => setEdition(false)}
          />
          <div className="carnet-zone-danger">
            <button type="button" className="compte-bouton-secondaire compte-danger" disabled={ctx.occupe} onClick={() => onSupprimerClasse(classe)}>
              Supprimer la classe{n > 0 ? ` et ses ${n} séance${n > 1 ? 's' : ''}` : ''}
            </button>
          </div>
        </section>
      )}

      <CompteurClasse classe={classe} maintenant={maintenant} />
      <ListeARendre seances={devoirsEntre(seances, dateIso(maintenant), ajouterJours(dateIso(maintenant), 28), classe.id)} titre={`À rendre en ${classe.nom}`} avecClasse={false} avecDate idTitre={`${id}-a-rendre`} />

      <div className="carnet-classe-corps">
        <section className="carnet-colonne" aria-labelledby={`${id}-fil`}>
          <h3 id={`${id}-fil`} className="carnet-titre-bloc">
            Fil des séances
          </h3>
          {n === 0 ? (
            <p className="compte-vide">Aucune séance notée pour {classe.nom}.</p>
          ) : (
            <>
              {groupes.slice(0, semaines).map(([lundi, liste], i) => (
                <section key={lundi} className="carnet-semaine-fil" aria-labelledby={`${id}-g-${lundi}`}>
                  <h4 id={`${id}-g-${lundi}`} className="carnet-groupe">
                    {titreGroupe(lundi)}
                  </h4>
                  <ul className="carnet-fil">
                    {liste.map((s) => (
                      <li key={s.id}>
                        <CarteSeance seance={s} compacte={i >= SEMAINES_COMPLETES} titreId={`${id}-s-${s.id}`} />
                      </li>
                    ))}
                  </ul>
                </section>
              ))}
              {groupes.length > semaines && (
                <button type="button" className="carnet-bouton" onClick={() => setSemaines(semaines + SEMAINES_PAR_PAGE)}>
                  Voir les semaines précédentes
                </button>
              )}
            </>
          )}
        </section>

        <ProgressionResume classe={classe} seances={seancesClasse} toutes={seances} />

        <section className="carnet-bloc carnet-classe-evaluation" aria-labelledby={`${id}-evaluation`}>
          <h3 id={`${id}-evaluation`} className="carnet-titre-bloc carnet-ancre" tabIndex={-1} ref={titreEvaluation}>
            <span id="evaluation">Évaluation sur la matière vue</span>
          </h3>
          {n > 0 ? <EvaluationMatiere key={classe.id} classe={classe} seances={seancesClasse} sansTitre /> : <p className="compte-vide">Note d'abord une séance : l'évaluation reprend les sections vues depuis une date.</p>}
        </section>
      </div>
    </div>
  )
}

/** Progression du programme (colonne de droite) : chapitre en cours, sections vues (date), en cours,
 * à venir ; comparaison avec une autre classe du même niveau ; autres chapitres ; détail complet. */
function ProgressionResume({ classe, seances, toutes }: { classe: Classe; seances: Seance[]; toutes: Seance[] }) {
  const id = useId()
  const ctx = useCarnet()
  const [toutesSections, setToutesSections] = useState(false)
  const paralleles = ctx.classes.filter((c) => c.id !== classe.id && classe.niveau && c.niveau === classe.niveau)
  const [comparer, setComparer] = useState('')
  const autre = paralleles.find((c) => c.id === comparer) ?? null
  const chapitres = useMemo(() => chapitresDeLaClasse(classe, seances), [classe, seances])
  const progression = useMemo(() => progressionClasse(seances, chapitres), [seances, chapitres])
  const seancesAutre = useMemo(() => (autre ? toutes.filter((s) => s.classe_id === autre.id) : []), [autre, toutes])
  const progressionAutre = useMemo(() => (autre ? progressionClasse(seancesAutre, chapitres) : []), [autre, seancesAutre, chapitres])
  const derniere = seances[0]
  const courant = derniere ? progression.find((p) => p.levelSlug === derniere.niveau && p.slug === derniere.chapitre) : (progression.find((p) => p.vues > 0) ?? progression[0])
  const autresProgressions = useMemo(
    () => paralleles.map((a) => ({ classe: a, seances: toutes.filter((s) => s.classe_id === a.id) })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- dépend de la liste des classes et des séances
    [ctx.classes, toutes, classe.id],
  )

  useEffect(() => {
    setComparer('')
    setToutesSections(false)
  }, [classe.id])

  if (!courant) {
    return (
      <aside className="carnet-cote carnet-carte" aria-labelledby={`${id}-titre`}>
        <h3 id={`${id}-titre`}>Progression</h3>
        <p className="compte-vide">Aucune séance pour l'instant, et pas de niveau choisi pour cette classe : indique son niveau (« Modifier la classe ») pour voir tous ses chapitres.</p>
      </aside>
    )
  }

  const commencees = courant.sections.filter((s) => s.vues > 0).length
  const autreCourant = progressionAutre.find((p) => p.slug === courant.slug && p.levelSlug === courant.levelSlug)
  const premiereRestante = courant.sections.findIndex((s) => s.vues < s.total)
  const limite = premiereRestante < 0 ? courant.sections.length : premiereRestante + 3
  const visibles = toutesSections ? courant.sections : courant.sections.slice(0, limite)
  const cachees = courant.sections.length - visibles.length
  const autresChapitres = progression.filter((p) => p !== courant)

  return (
    <aside className="carnet-cote carnet-carte carnet-progression-resume" aria-labelledby={`${id}-titre`}>
      <div className="carnet-progression-tete">
        <h3 id={`${id}-titre`}>Progression</h3>
        {paralleles.length > 0 && (
          <label className="carnet-comparer">
            <span>Comparer avec</span>
            <select value={comparer} onChange={(e) => setComparer(e.target.value)}>
              <option value="">—</option>
              {paralleles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nom}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
      <div>
        <p className="carnet-progression-chapitre">
          <Link to={`/${courant.levelSlug}/${courant.slug}`}>
            {courant.numero}. {courant.titre}
          </Link>
          <span className="carnet-avancement-compte">
            {commencees} / {courant.sections.length} §
          </span>
        </p>
        <span className={`carnet-barre-classe carnet-c${couleurClasse(ctx.classes, classe.id)}`} aria-hidden="true">
          <span style={{ width: `${Math.round((100 * commencees) / Math.max(1, courant.sections.length))}%` }} />
        </span>
        {autre && autreCourant && (
          <p className="carnet-comparaison">
            {autre.nom} : {autreCourant.sections.filter((s) => s.vues > 0).length} / {autreCourant.sections.length} § commencées
          </p>
        )}
      </div>
      <ol className="carnet-sections-prog">
        {visibles.map((s) => {
          const etat = s.vues === s.total ? 'vue' : s.vues > 0 ? 'commencee' : 'a-venir'
          const dates = s.unites.map((u) => u.premiereFois).filter((d): d is string => d !== null).sort()
          const ailleurs = autreCourant?.sections.find((x) => x.id === s.id)
          const datesAilleurs = ailleurs ? ailleurs.unites.map((u) => u.premiereFois).filter((d): d is string => d !== null).sort() : []
          return (
            <li key={s.id} className={etat}>
              <span className="carnet-marque" aria-hidden="true">
                {etat === 'vue' ? '✓' : etat === 'commencee' ? '▸' : '○'}
              </span>
              <span className="carnet-sections-titre">
                {s.numero}. {s.titre}
                {etat === 'commencee' && <span className="carnet-commence"> (commencé{s.total > 1 ? ` · ${s.vues}/${s.total}` : ''})</span>}
                <span className="carnet-sr">{etat === 'vue' ? ' : vue' : etat === 'commencee' ? '' : ' : à venir'}</span>
                {autre && (
                  <span className="carnet-ailleurs">
                    {autre.nom} : {datesAilleurs.length === 0 ? 'pas encore' : datesAilleurs.length === (ailleurs?.total ?? 0) ? `vu le ${jourMois(datesAilleurs[datesAilleurs.length - 1])}` : `commencé le ${jourMois(datesAilleurs[0])}`}
                  </span>
                )}
              </span>
              {dates.length > 0 && <span className="carnet-date-prog">{jourMois(etat === 'vue' ? dates[dates.length - 1] : dates[0])}</span>}
            </li>
          )
        })}
      </ol>
      {(cachees > 0 || toutesSections) && courant.sections.length > limite && (
        <button type="button" className="compte-bouton-lien" aria-expanded={toutesSections} onClick={() => setToutesSections(!toutesSections)}>
          {toutesSections ? 'Afficher moins' : `+ ${cachees} section${cachees > 1 ? 's' : ''}`}
        </button>
      )}
      {autresChapitres.length > 0 && (
        <ul className="carnet-autres-chapitres" aria-label="Autres chapitres">
          {autresChapitres.map((p) => {
            const commence = p.sections.filter((s) => s.vues > 0).length
            const fini = p.vues === p.total && p.total > 0
            return (
              <li key={p.levelSlug + p.slug} className={fini ? 'vue' : commence > 0 ? 'commencee' : 'a-venir'}>
                <span aria-hidden="true">{fini ? '✓' : commence > 0 ? '▸' : '○'}</span> {p.numero}. {findChapter(p.levelSlug, p.slug) ? p.titre : p.slug}
                {fini && p.derniereSeance ? ` (terminé le ${jourMois(p.derniereSeance)})` : commence > 0 ? ` (${commence} / ${p.sections.length} §)` : ''}
              </li>
            )
          })}
        </ul>
      )}
      <details className="carnet-details-discret">
        <summary>Progression détaillée (sous-parties, autres classes)</summary>
        <ProgressionClasse classe={classe} seances={seances} autres={autresProgressions} />
      </details>
    </aside>
  )
}
