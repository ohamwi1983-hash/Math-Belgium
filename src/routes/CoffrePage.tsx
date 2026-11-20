import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Champ } from '../components/compte/Champ'
import { PageCompte, PageReservee } from '../components/compte/PageReservee'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { dupliquerPlan, importerPlansLocaux, listerPlans, renommerPlan, supprimerPlanCoffre, type PlanCoffre } from '../lib/compteDonnees'
import { erreurTitrePlan, LIBELLE_TYPE_PLAN, messageErreur, plansLocauxAImporter, routeDuPlan, type PlanLocal, type TypePlan } from '../lib/compteValidation'

const ORDRE_TYPES: TypePlan[] = ['evaluation', 'examen', 'exercice', 'remediation']
const CLE_ENREGISTREES = 'math-belgium-evaluations-enregistrees'

/** Enregistrements du navigateur (même lecture que `evaluationLocal.ts::lirePlansEnregistres`,
 * recopiée ici pour ne pas charger tout le pipeline d'export sur cette page). */
function lirePlansLocaux(): PlanLocal[] {
  try {
    const brut = localStorage.getItem(CLE_ENREGISTREES)
    const liste = brut ? (JSON.parse(brut) as PlanLocal[]) : []
    return Array.isArray(liste) ? liste.filter((p) => p?.plan?.version === 1) : []
  } catch {
    return []
  }
}

/** `/coffre` — configurations enregistrées dans le compte (feuilles d'exercices, évaluations,
 * examens, remédiations : le `PlanDocument` tel quel), rechargeables sur tout appareil ; import en
 * un clic des enregistrements de ce navigateur. */
export function CoffrePage() {
  return (
    <PageCompte titre="Mon coffre">
      <PageReservee>
        <Coffre />
      </PageReservee>
    </PageCompte>
  )
}

function Coffre() {
  const compte = useCompte()
  const client = compte.client
  const [plans, setPlans] = useState<PlanCoffre[] | null>(null)
  const [locaux] = useState(lirePlansLocaux)
  const [message, setMessage] = useState<string | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [occupe, setOccupe] = useState(false)
  const [renommage, setRenommage] = useState<{ id: string; titre: string; erreur: string | null } | null>(null)

  const recharger = useCallback(async () => {
    if (!client) return
    try {
      setPlans(await listerPlans(client))
    } catch (ex) {
      setErreur(messageErreur(ex))
      setPlans([])
    }
  }, [client])

  useEffect(() => {
    void recharger()
  }, [recharger])

  if (!estConnecteActif(compte) || !client) return null

  async function agir(action: () => Promise<unknown>, succes: string) {
    setOccupe(true)
    setErreur(null)
    setMessage(null)
    try {
      await action()
      await recharger()
      setMessage(succes)
    } catch (ex) {
      setErreur(messageErreur(ex))
    } finally {
      setOccupe(false)
    }
  }

  const aImporter = plans ? plansLocauxAImporter(locaux, plans) : []

  return (
    <div className="compte-sections">
      <p className="compte-intro">
        Les enregistrements de ton coffre suivent ton compte : enregistre depuis le panneau de conception (<Link to="/exercice">feuilles d'exercices</Link>,{' '}
        <Link to="/evaluation">évaluations et examens</Link>), recharge sur n'importe quel appareil. « Charger » reprend exactement les mêmes exercices.
      </p>
      {(message || erreur) && (
        <p className={erreur ? 'compte-erreur-champ' : 'compte-message'} role={erreur ? 'alert' : 'status'}>
          {erreur ?? message}
        </p>
      )}

      {aImporter.length > 0 && (
        <section className="compte-encadre" aria-labelledby="coffre-import">
          <h2 id="coffre-import" className="compte-titre-encadre">
            Enregistrements de ce navigateur
          </h2>
          <p>
            {aImporter.length} enregistrement{aImporter.length > 1 ? 's' : ''} de ce navigateur {aImporter.length > 1 ? 'ne sont' : "n'est"} pas encore dans ton coffre. Ils restent
            aussi dans le navigateur.
          </p>
          <button
            type="button"
            className="compte-bouton"
            disabled={occupe}
            onClick={() =>
              void agir(async () => {
                const r = await importerPlansLocaux(client, locaux, plans ?? [])
                return r
              }, `${aImporter.length} enregistrement${aImporter.length > 1 ? 's importés' : ' importé'} dans ton coffre.`)
            }
          >
            Importer dans mon coffre
          </button>
        </section>
      )}

      {plans === null ? (
        <p className="compte-chargement">Chargement du coffre…</p>
      ) : plans.length === 0 ? (
        <p className="compte-vide">Ton coffre est vide : génère un document dans le panneau, puis « Enregistrer dans mon coffre ».</p>
      ) : (
        ORDRE_TYPES.filter((t) => plans.some((p) => p.type === t)).map((type) => (
          <section className="compte-section" key={type} aria-labelledby={`coffre-${type}`}>
            <h2 id={`coffre-${type}`}>
              {LIBELLE_TYPE_PLAN[type]} <span className="compte-compte">({plans.filter((p) => p.type === type).length})</span>
            </h2>
            <ul className="compte-liste">
              {plans
                .filter((p) => p.type === type)
                .map((plan) => (
                  <li className="compte-liste-item" key={plan.id}>
                    {renommage?.id === plan.id ? (
                      <form
                        className="compte-form compte-form-ligne"
                        noValidate
                        onSubmit={(e) => {
                          e.preventDefault()
                          const err = erreurTitrePlan(renommage.titre)
                          if (err) {
                            setRenommage({ ...renommage, erreur: err })
                            return
                          }
                          void agir(() => renommerPlan(client, plan.id, renommage.titre), 'Enregistrement renommé.').then(() => setRenommage(null))
                        }}
                      >
                        <Champ label="Nouveau titre" valeur={renommage.titre} onChange={(v) => setRenommage({ ...renommage, titre: v })} erreur={renommage.erreur} autoFocus />
                        <div className="compte-actions">
                          <button type="submit" className="compte-bouton" disabled={occupe}>
                            Renommer
                          </button>
                          <button type="button" className="compte-bouton-secondaire" onClick={() => setRenommage(null)}>
                            Annuler
                          </button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="compte-liste-texte">
                          <strong>{plan.titre}</strong>
                          <span className="compte-detail">
                            {plan.contenu.levelSlug} · modifié le {new Date(plan.modifie_le).toLocaleDateString('fr-BE')}
                            {plan.contenu.series.length > 1 ? ` · séries ${plan.contenu.series.map((s) => s.lettre).join(', ')}` : ''}
                          </span>
                        </div>
                        <div className="compte-actions">
                          <Link className="compte-bouton" to={`${routeDuPlan(plan.type)}?plan=${encodeURIComponent(plan.id)}`}>
                            Charger dans le panneau
                          </Link>
                          <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={() => setRenommage({ id: plan.id, titre: plan.titre, erreur: null })}>
                            Renommer
                          </button>
                          <button type="button" className="compte-bouton-secondaire" disabled={occupe} onClick={() => void agir(() => dupliquerPlan(client, plan), 'Enregistrement dupliqué.')}>
                            Dupliquer
                          </button>
                          <button
                            type="button"
                            className="compte-bouton-secondaire compte-danger"
                            disabled={occupe}
                            onClick={() => {
                              if (window.confirm(`Supprimer « ${plan.titre} » de ton coffre ?`)) void agir(() => supprimerPlanCoffre(client, plan.id), 'Enregistrement supprimé.')
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </>
                    )}
                  </li>
                ))}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}
