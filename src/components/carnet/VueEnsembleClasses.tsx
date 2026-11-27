import { useId } from 'react'
import { Link } from 'react-router-dom'
import { dateIso, libelleNiveau, type Classe, type Seance } from '../../lib/carnet'
import type { DonneesHoraire } from '../../lib/carnetDonnees'
import type { DonneesAgenda } from '../../lib/agendaDonnees'
import { reperesClasse, resumeClasse } from '../../lib/espaceProfesseur'
import { couleurClasse } from './contexteCarnet'

/**
 * Vue d'ensemble de « Mes classes » (`/carnet`, maquette « classes » validée le 27/11/2026) : une carte
 * par classe — niveau, chapitre en cours et étape, barre des étapes vues, prochain cours / évaluation /
 * séance à noter, et ses trois actions : Matière vue (page de la classe), Devoirs et évaluations (même
 * page, bloc « Évaluation sur la matière vue »), Page des élèves (l'ancienne page de classe à code).
 * Tout vient du carnet (aucune donnée nouvelle).
 */
export function VueEnsembleClasses({
  classes,
  seances,
  horaire,
  agenda,
  maintenant,
  pageEleves,
}: {
  classes: Classe[]
  seances: Seance[]
  horaire: DonneesHoraire
  agenda: DonneesAgenda
  maintenant: Date
  pageEleves: (classeId: string) => 'publiee' | 'coupee' | 'aucune' | 'inactive'
}) {
  const id = useId()
  const aujourdhui = dateIso(maintenant)
  const minutes = maintenant.getHours() * 60 + maintenant.getMinutes()
  const donnees = { horaire, agenda, classes, seances }
  return (
    <section className="ep-vue-classes" aria-labelledby={`${id}-titre`}>
      <h2 id={`${id}-titre`} className="carnet-sr">
        Mes classes : vue d'ensemble
      </h2>
      <div className="ep-classes-grille" id="page-des-eleves">
        {classes.map((c) => {
          const r = resumeClasse(c, seances)
          const reperes = reperesClasse(c.id, donnees, aujourdhui, minutes)
          const pourcent = r.etapesTotal > 0 ? Math.round((100 * r.etapesVues) / r.etapesTotal) : 0
          const etatPage = pageEleves(c.id)
          return (
            <article key={c.id} className={`ep-carte ep-classe carnet-c${couleurClasse(classes, c.id)}`} aria-labelledby={`${id}-${c.id}`}>
              <div className="ep-classe-tete">
                <h3 id={`${id}-${c.id}`}>
                  <Link to={`/carnet/classe/${c.id}`}>{c.nom}</Link>
                </h3>
                {c.niveau && <span className="ep-chip ep-classe-niveau">{libelleNiveau(c.niveau)}</span>}
              </div>
              {r.chapitre ? (
                <>
                  <p className="ep-classe-en-cours">
                    En cours : {r.titreCourt}
                    {r.etape ? `, étape ${r.etape.numero}` : ''}
                  </p>
                  {r.etapesTotal > 0 && (
                    <span
                      className="ep-progres"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={r.etapesTotal}
                      aria-valuenow={r.etapesVues}
                      aria-label={`Étapes vues dans ${r.titreCourt}`}
                      aria-valuetext={`${r.etapesVues} étape${r.etapesVues > 1 ? 's' : ''} sur ${r.etapesTotal}`}
                    >
                      <span style={{ width: `${pourcent}%` }} />
                    </span>
                  )}
                  <p>
                    {r.etapesVues} étape{r.etapesVues > 1 ? 's' : ''} sur {r.etapesTotal} vue{r.etapesVues > 1 ? 's' : ''}
                    {reperes.prochainCours ? ` · ${reperes.prochainCours}` : ''}
                  </p>
                </>
              ) : (
                <p>
                  Aucune matière vue notée pour l'instant.
                  {reperes.prochainCours ? ` ${reperes.prochainCours.charAt(0).toUpperCase()}${reperes.prochainCours.slice(1)}.` : ''}
                </p>
              )}
              {reperes.evaluation && <p className="ep-classe-alerte">{reperes.evaluation}</p>}
              {reperes.aNoter && <p>{reperes.aNoter}</p>}
              <div className="ep-classe-actions">
                <Link className="ep-bouton" to={`/carnet/classe/${c.id}`}>
                  Matière vue<span className="carnet-sr"> — {c.nom}</span>
                </Link>
                <Link className="ep-bouton" to={`/carnet/classe/${c.id}#evaluation`}>
                  Devoirs et évaluations<span className="carnet-sr"> — {c.nom}</span>
                </Link>
                <Link className="ep-bouton" to={`/carnet/classe/${c.id}/eleves`}>
                  Page des élèves<span className="carnet-sr"> — {c.nom}{etatPage === 'publiee' ? ' (publiée)' : etatPage === 'coupee' ? ' (code coupé)' : ''}</span>
                </Link>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
