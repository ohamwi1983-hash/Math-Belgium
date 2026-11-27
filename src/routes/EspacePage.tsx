import { useCallback, useEffect, useId, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import '../components/carnet/carnet.css'
import { BandeauEspace } from '../components/compte/BandeauEspace'
import { CartePremiersPas as CartePremiersPasCarte } from '../components/compte/CartePremiersPas'
import { IconeCoche, IconeProjeter } from '../components/compte/IconesEspace'
import { MenuEspace, PORTES } from '../components/compte/MenuEspace'
import { EnTeteCompte, PageCompte, PageReservee } from '../components/compte/PageReservee'
import '../components/compte/profil.css'
import '../components/compte/espace-pages.css'
import { heureCourte } from '../components/carnet/outilsCarnet'
import { dateIso } from '../lib/carnet'
import { dateJourLong, motifCourt } from '../lib/agendaEvenements'
import { resumeDevoir } from '../lib/carnetDevoirs'
import { estConnecteActif, useCompte } from '../lib/compteContexte'
import { messageErreur } from '../lib/compteValidation'
import { aVenir, chapitreDeLInterro, chargerDonneesEspace, coursDuJour, lienProjection, type CoursDuJour, type DonneesEspace } from '../lib/espaceProfesseur'
import { useOrdreChapitres } from '../lib/ordreChapitres'
import { MatiereANoter, ouvrirProposition, usePropositionsGardees } from '../components/carnet/MatiereProjetee'

/**
 * `/espace` — tableau de bord de l'espace professeur (maquettes « dashboard » et « téléphone » validées le
 * 27/11/2026) : page d'arrivée après la connexion. Réservée (`PageReservee`), jamais pré-rendue ni
 * indexée. « Aujourd'hui » (cours du jour tirés de l'horaire et des séances du carnet : Projeter le
 * chapitre en cours, ou Noter la matière vue), « À venir » (évaluations, devoirs, événements, remises du
 * bulletin des trois semaines), puis les quatre portes. Aucune donnée inventée : tout vient du carnet.
 */
export function EspacePage() {
  return (
    <PageCompte titre="Tableau de bord" large sansTete>
      <TeteDeRepli />
      <PageReservee>
        <TableauDeBord />
      </PageReservee>
    </PageCompte>
  )
}

function TeteDeRepli() {
  const compte = useCompte()
  return estConnecteActif(compte) ? null : <EnTeteCompte titre="Tableau de bord" />
}

/** Carte « Premiers pas » (décidée le 27/11/2026, maquette « premiers ») : six étapes cochées d'après les
 * données réelles, en tête du tableau de bord tant qu'il en reste une et qu'elle n'est pas masquée
 * (`components/compte/CartePremiersPas.tsx`, `lib/premiersPas.ts`). */
function CartePremiersPas({ donnees }: { donnees: DonneesEspace | null }) {
  const compte = useCompte()
  if (!compte.profil) return null
  return <CartePremiersPasCarte donnees={donnees} ecoles={compte.ecoles.length} uid={compte.profil.id} />
}

function TableauDeBord() {
  const compte = useCompte()
  const client = compte.client
  const id = useId()
  // L'ordre du professeur (« Mon ordre des chapitres ») : re-rendu quand il arrive.
  useOrdreChapitres()
  const [donnees, setDonnees] = useState<DonneesEspace | null>(null)
  const [erreur, setErreur] = useState<string | null>(null)
  const [maintenant, setMaintenant] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setMaintenant(new Date()), 60_000)
    return () => window.clearInterval(t)
  }, [])

  const charger = useCallback(async () => {
    if (!client) return
    try {
      setDonnees(await chargerDonneesEspace(client))
      setErreur(null)
    } catch (ex) {
      setErreur(messageErreur(ex))
    }
  }, [client])
  useEffect(() => {
    void charger()
  }, [charger])

  const aujourdhui = dateIso(maintenant)
  const minutes = maintenant.getHours() * 60 + maintenant.getMinutes()
  const jour = useMemo(() => (donnees ? coursDuJour(donnees, aujourdhui, minutes) : null), [donnees, aujourdhui, minutes])
  const prochains = useMemo(() => (donnees ? aVenir(donnees, aujourdhui, { jours: 21, max: 6, ecoles: compte.ecoles }) : []), [donnees, aujourdhui, compte.ecoles])

  const profil = compte.profil
  if (!profil) return null
  const date = maintenant.toLocaleDateString('fr-BE', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div className="espace-tdb">
      <MenuEspace>
        <BandeauEspace titreId={`${id}-titre`} surtitre={date} titre={`Bonjour ${profil.nom_affiche}`} icone={null} />

        {erreur && (
          <div className="compte-encadre compte-erreur" role="alert">
            <p>{erreur}</p>
            <button type="button" className="compte-bouton-secondaire" onClick={() => void charger()}>
              Réessayer
            </button>
          </div>
        )}

        <CartePremiersPas donnees={donnees} />
        <MatiereANoter client={client} classes={donnees?.classes ?? []} onEnregistre={() => void charger()} />

        <div className="ep-tdb-haut">
          <section className="ep-carte ep-aujourdhui" aria-labelledby={`${id}-auj`}>
            <div className="ep-carte-tete">
              <h2 id={`${id}-auj`}>Aujourd'hui</h2>
              <Link className="ep-bouton" to="/carnet/semaine">
                Ma semaine <span aria-hidden="true">›</span>
              </Link>
            </div>
            <Aujourdhui donnees={donnees} jour={jour} erreur={erreur !== null} aujourdhui={aujourdhui} />
          </section>

          <section className="ep-carte ep-avenir" aria-labelledby={`${id}-avenir`}>
            <div className="ep-carte-tete">
              <h2 id={`${id}-avenir`}>À venir</h2>
              {donnees && donnees.classes.length > 0 && (
                <span className="ep-carte-tete-actions">
                  <Link className="ep-bouton" to="/carnet/annoncer">
                    Annoncer une évaluation
                  </Link>
                  <Link className="ep-bouton" to="/carnet/annoncer?quoi=devoir">
                    Donner un devoir
                  </Link>
                </span>
              )}
            </div>
            {donnees === null ? (
              <p className="ep-vide">{erreur ? '—' : 'Chargement…'}</p>
            ) : prochains.length === 0 ? (
              <p className="ep-vide">Rien d'annoncé pour les trois prochaines semaines.</p>
            ) : (
              <ul className="ep-avenir-liste">
                {prochains.map((a) => (
                  <li key={a.cle}>
                    <Link to={a.lien} className="ep-avenir-ligne">
                      <span className={`ep-chip${a.sorte === 'evaluation' ? ' evaluation' : ''}`}>{a.dateTexte}</span>
                      <span className="ep-avenir-texte">
                        {a.texte}
                        {a.rappel && (
                          <>
                            {' '}
                            <span className="ep-rappel">{a.rappel}</span>
                          </>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <p className="ep-carte-pied">
              <Link className="ep-bouton" to="/carnet/agenda">
                Agenda complet <span aria-hidden="true">›</span>
              </Link>
            </p>
          </section>
        </div>

        <section aria-label="Les quatre portes de l'espace professeur" className="ep-portes-cartes">
          {PORTES.filter((p) => p.cle !== 'tableau').map((p) => (
            <article key={p.cle} className={`ep-porte-carte ep-porte-${p.cle}`} aria-labelledby={`${id}-${p.cle}`}>
              <span className="ep-porte-icone" aria-hidden="true">
                {p.icone('bandeau')}
              </span>
              <div className="ep-porte-carte-texte">
                <h2 id={`${id}-${p.cle}`}>
                  <Link to={p.to}>{p.libelle}</Link>
                </h2>
                <p className="ep-porte-phrase">{p.phrase}</p>
                <p className="ep-porte-court">{p.court}</p>
                <ul className="ep-porte-liens">
                  {p.liens.map((l) => (
                    <li key={l.to}>
                      <Link to={l.to}>
                        <span aria-hidden="true">→</span> {l.libelle}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </section>
      </MenuEspace>
    </div>
  )
}

function Aujourdhui({ donnees, jour, erreur, aujourdhui }: { donnees: DonneesEspace | null; jour: ReturnType<typeof coursDuJour> | null; erreur: boolean; aujourdhui: string }) {
  if (!donnees || !jour) return <p className="ep-vide">{erreur ? '—' : 'Chargement…'}</p>
  if (donnees.carnetAbsent || donnees.classes.length === 0) {
    return (
      <div className="ep-vide-bloc">
        <p className="ep-vide">Pas encore de classe : ajoute tes classes et ton horaire de la semaine, tes cours du jour s'afficheront ici.</p>
        <Link className="ep-bouton principal" to="/carnet">
          Mes classes <span aria-hidden="true">›</span>
        </Link>
      </div>
    )
  }
  if (jour.sansHoraire) {
    return (
      <div className="ep-vide-bloc">
        <p className="ep-vide">Ton horaire de la semaine n'est pas encore rempli : remplis-le pour retrouver ici tes cours du jour.</p>
        <p className="ep-actions">
          <Link className="ep-bouton principal" to="/carnet/horaire">
            Mon horaire <span aria-hidden="true">›</span>
          </Link>
          <Link className="ep-bouton" to="/carnet">
            Mes classes <span aria-hidden="true">›</span>
          </Link>
        </p>
      </div>
    )
  }
  const etat = jour.etat
  if (jour.cours.length === 0) {
    const texte =
      etat?.type === 'weekend'
        ? 'Week-end : pas de cours aujourd’hui.'
        : etat?.type === 'conge'
          ? `Congé : ${etat.libelle ?? ''} — pas de cours.`
          : etat?.type === 'ete'
            ? 'Vacances d’été : pas de cours.'
            : 'Aucun cours aujourd’hui dans ton horaire.'
    return <p className="ep-vide">{texte}</p>
  }
  return (
    <>
      <ul className="ep-cours-liste">
        {jour.cours.map((c) => (
          <LigneCours key={c.cle} c={c} aujourdhui={aujourdhui} />
        ))}
      </ul>
      <p className="ep-carte-pied">
        <Link className="ep-lien-fleche" to="/carnet/aujourdhui">
          Voir la journée en détail <span aria-hidden="true">›</span>
        </Link>
      </p>
    </>
  )
}

function LigneCours({ c, aujourdhui }: { c: CoursDuJour; aujourdhui: string }) {
  // Projection faite pendant ce cours et gardée (« Plus tard », fenêtre fermée) : « Noter la matière vue » ouvre
  // directement sa proposition préremplie (étapes et exercices montrés), sinon le panneau de Mes classes.
  const gardees = usePropositionsGardees()
  const gardee = c.classe ? gardees.find((p) => p.classeId === c.classe!.id && p.date === aujourdhui && p.creneau.debut === c.debut) : undefined
  const nom = c.classe?.nom ?? 'Classe'
  const r = c.resume
  const heure = heureCourte(c.debut)
  if (c.supprime) {
    return (
      <li className="ep-cours supprime">
        <span className="ep-cours-heure">{heure}</span>
        <span className="ep-cours-texte">
          <strong>{nom}</strong> · <span>Pas cours — {motifCourt(c.supprime.evenement)}</span>
        </span>
      </li>
    )
  }
  const etape = r?.etape
  const noterLien = `/carnet/aujourdhui?noter=${encodeURIComponent(c.classe?.id ?? '')}`
  const projeter = r?.chapitre && !c.aNoter ? lienProjection(r.chapitre, etape?.id) : null
  return (
    <li className="ep-cours">
      <span className="ep-cours-heure">{heure}</span>
      <span className="ep-cours-texte">
        <span className="ep-cours-ligne">
          <strong>{nom}</strong>
          {' · '}
          {r?.chapitre ? (
            <>
              {r.titreCourt}
              {etape && (
                <>
                  <span className="ep-cours-detail">{` — étape ${etape.numero}`}</span>
                  <span className="ep-cours-court">{`, étape ${etape.numero}`}</span>
                  <span className="ep-cours-detail"> « {etape.titre} »</span>
                </>
              )}
            </>
          ) : (
            <span>chapitre pas encore noté</span>
          )}
          {c.aNoter && <span className="ep-cours-detail"> — matière vue à noter</span>}
          {c.seance && <span className="ep-cours-detail"> — matière vue notée ✓</span>}
        </span>
        {(c.devoirs.length > 0 || c.interros.length > 0) && (
          <span className="ep-cours-chips">
            {c.devoirs.map((s) => (
              <span key={s.id} className="ep-chip devoir">
                devoir à rendre{resumeDevoir(s, 40) ? ` : ${resumeDevoir(s, 40)}` : ''}
              </span>
            ))}
            {c.interros.map((e) => (
              <span key={e.id} className="ep-chip evaluation">
                {(e.intitule.trim() || 'évaluation').toLowerCase()} {dateJourLong(e.du)}
                {chapitreDeLInterro(e) ? ` · ${chapitreDeLInterro(e)}` : ''}
              </span>
            ))}
          </span>
        )}
      </span>
      {projeter ? (
        <Link className="ep-bouton principal ep-cours-action" to={projeter} aria-label={`Projeter ${r?.titreCourt ?? ''}${etape ? `, étape ${etape.numero}` : ''} (${nom})`}>
          <IconeProjeter />
          <span className="ep-cours-action-texte">Projeter</span>
        </Link>
      ) : (
        c.classe &&
        (gardee ? (
          <button type="button" className="ep-bouton ep-cours-action" onClick={() => ouvrirProposition(gardee.id)} aria-label={`Noter la matière vue (${nom}) : proposition préremplie d'après ta projection`}>
            <IconeCoche />
            <span className="ep-cours-action-texte">Noter la matière vue</span>
          </button>
        ) : (
          <Link className="ep-bouton ep-cours-action" to={noterLien} aria-label={`Noter la matière vue (${nom})`}>
            <IconeCoche />
            <span className="ep-cours-action-texte">Noter la matière vue</span>
          </Link>
        ))
      )}
    </li>
  )
}
