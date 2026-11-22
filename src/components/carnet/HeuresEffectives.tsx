import { useId, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { findChapter } from '../../content/chaptersIndex'
import { dateIso, texteBrut, type Classe } from '../../lib/carnet'
import {
  aVenirPourClasse,
  avertissementsInterro,
  compteurHeures,
  dateCourteJour,
  finDAnnee,
  horaireHebdo,
  jourMoisCourt,
  prochaineRemise,
  texteAvertissement,
  titreEvenement,
  type ContexteAgenda,
  type Evenement,
  type PeriodeBulletin,
} from '../../lib/agendaEvenements'
import { IconeType, InvitationPeriodes, PuceType } from './AgendaUi'
import { useCarnet } from './contexteCarnet'

/** Titre d'un chapitre « niveau/slug » (interro). */
export function titreChapitre(cle: string): string {
  const [niveau, slug] = cle.split('/')
  const ch = niveau && slug ? findChapter(niveau, slug) : undefined
  return ch ? texteBrut(ch.title) : cle
}

function minutes(d: Date): number {
  return d.getHours() * 60 + d.getMinutes()
}

/** Classes qui ont au moins une heure dans l'horaire (avec une grille). */
function classesDansHoraire(classes: Classe[], ctx: ContexteAgenda): Classe[] {
  return classes.filter((c) => ctx.cases.some((k) => k.classe_id === c.id && ctx.grilles.some((g) => g.ecole_id === k.ecole_id)))
}

/** Heures effectives d'une classe d'ici la prochaine remise des points et d'ici la fin de l'année. */
export function heuresClasse(classe: Classe, ctx: ContexteAgenda, periodes: PeriodeBulletin[], maintenant: Date) {
  const aujourdhui = dateIso(maintenant)
  const remise = prochaineRemise(classe.ecole_id, periodes, aujourdhui)
  const fin = finDAnnee(classe, ctx.evenements, aujourdhui)
  const base = { classeId: classe.id, ctx, aujourdhui, maintenant: minutes(maintenant) }
  return {
    remise,
    fin,
    versRemise: remise ? compteurHeures({ ...base, jusqua: remise.remise }) : null,
    versFin: compteurHeures({ ...base, jusqua: fin.jusqua }),
  }
}

/** Page d'une classe (maquette « Classe : compteur d'heures ») : deux grands chiffres, détail ligne
 * par ligne jusqu'à la prochaine remise, et « À venir pour la classe ». */
export function CompteurClasse({ classe, maintenant }: { classe: Classe; maintenant: Date }) {
  const id = useId()
  const ctx = useCarnet()
  const a = ctx.ctxAgenda
  const r = useMemo(() => (a ? heuresClasse(classe, a, ctx.agenda.periodes, maintenant) : null), [a, classe, ctx.agenda.periodes, maintenant])
  if (!ctx.agenda.actif || !a || !r) return null
  const hebdo = horaireHebdo(classe.id, a.grilles, a.cases)
  const aujourdhui = dateIso(maintenant)
  const aVenir = aVenirPourClasse(classe, ctx.agenda.evenements, aujourdhui).slice(0, 8)
  const detail = r.versRemise
  const jusqua = r.remise?.remise ?? r.fin.jusqua
  const avecHoraire = hebdo.heures > 0
  return (
    <section className="agenda-classe" aria-labelledby={`${id}-titre`}>
      {avecHoraire && (
        <div className="agenda-compteur-sombre">
          <h3 id={`${id}-titre`} className="agenda-compteur-titre">
            Heures de cours effectives
          </h3>
          <div className="agenda-compteur-chiffres">
            {r.remise && r.versRemise && (
              <p>
                <strong>{r.versRemise.reste} h</strong>
                <span>
                  d’ici la remise des points P{r.remise.numero} ({dateCourteJour(r.remise.remise)})
                </span>
              </p>
            )}
            <p>
              <strong>{r.versFin.reste} h</strong>
              <span>d’ici la fin de l’année ({r.fin.session ? `examens de juin le ${jourMoisCourt(r.fin.session.du)}` : `dernier jour de classe le ${jourMoisCourt(r.fin.jusqua)}`})</span>
            </p>
          </div>
        </div>
      )}
      {!avecHoraire && (
        <h3 id={`${id}-titre`} className="carnet-sr">
          Agenda de la classe
        </h3>
      )}
      <div className="agenda-classe-cartes">
        {avecHoraire && (
          <div className="carnet-carte agenda-detail">
            <h4>Détail jusqu’au {jourMoisCourt(jusqua)}</h4>
            <ul className="agenda-lignes">
              <li>
                <span>
                  <strong>Horaire de la {classe.nom}</strong>
                  <span className="agenda-ligne-detail">
                    {hebdo.heures} h par semaine ({hebdo.texte})
                  </span>
                </span>
              </li>
              {(() => {
                const c = detail ?? r.versFin
                return (
                  <>
                    <li>
                      <span>
                        <strong>
                          Prévues du {dateCourteJour(aujourdhui)} au {dateCourteJour(jusqua)}
                        </strong>
                        <span className="agenda-ligne-detail">d’après ton horaire</span>
                      </span>
                      <span className="agenda-ligne-h">{c.prevues} h</span>
                    </li>
                    {c.lignes.map((l) => (
                      <li key={`${l.evenement.id}-${l.accompagne}`}>
                        <span>
                          <button type="button" className="agenda-lien-evenement" onClick={() => ctx.ouvrirEvenement(l.evenement)}>
                            {titreEvenement(l.evenement)}
                            {l.accompagne ? ' (tu accompagnes)' : ''}
                          </button>
                          <span className="agenda-ligne-detail">{l.detail}</span>
                        </span>
                        <span className="agenda-ligne-h moins">− {l.heures} h</span>
                      </li>
                    ))}
                    <li className="agenda-ligne-total">
                      <strong>Il reste</strong>
                      <span className="agenda-ligne-h">{c.reste} h</span>
                    </li>
                  </>
                )
              })()}
            </ul>
            <p className="compte-aide">Congés officiels de la FWB déduits automatiquement. Un événement ajouté ou supprimé met le compte à jour.</p>
            {!r.remise && <InvitationPeriodes />}
          </div>
        )}
        <div className="agenda-a-venir">
          <h4 className="agenda-surtitre">À venir pour la {classe.nom}</h4>
          {aVenir.length === 0 ? (
            <p className="compte-vide">Aucun événement à venir.</p>
          ) : (
            <ul>
              {aVenir.map((e) => (
                <LigneAVenir key={e.id} e={e} classe={classe} aujourdhui={aujourdhui} />
              ))}
            </ul>
          )}
          <button type="button" className="carnet-bouton" onClick={() => ctx.nouvelEvenement({ ecole_id: classe.ecole_id, toutes_classes: false, classes: [classe.id] })}>
            + Événement pour la {classe.nom}
          </button>
        </div>
      </div>
    </section>
  )
}

function LigneAVenir({ e, classe, aujourdhui }: { e: Evenement; classe: Classe; aujourdhui: string }) {
  const ctx = useCarnet()
  const av = e.type === 'interrogation' ? avertissementsInterro({ date: e.du, ecoleId: classe.ecole_id, periodes: ctx.agenda.periodes, evenements: ctx.agenda.evenements, seuil: ctx.agenda.seuil, aujourdhui }) : []
  const suite =
    e.type === 'interrogation'
      ? e.chapitre
        ? ` — ${titreChapitre(e.chapitre)}`
        : ''
      : e.intitule.trim()
        ? ` — ${e.intitule.trim()}`
        : ''
  const heures = !e.journee_entiere && e.heure_debut !== null ? ` · ${e.heure_debut === e.heure_fin ? `H${e.heure_debut}` : `H${e.heure_debut}–H${e.heure_fin}`}` : ''
  return (
    <li>
      <button type="button" className="agenda-a-venir-ligne" onClick={() => ctx.ouvrirEvenement(e)}>
        <PuceType type={e.type} />
        <span>
          {e.du === e.au ? dateCourteJour(e.du) : `${dateCourteJour(e.du)} → ${dateCourteJour(e.au)}`}
          {heures}
          {suite}
        </span>
      </button>
      {av.map((a) => (
        <span key={a.type} className={`agenda-mini-alerte ${a.type === 'apres' ? 'apres' : 'presse'}`}>
          <IconeType type="attention" taille={13} /> {texteAvertissement(a, e.du).court}
        </span>
      ))}
    </li>
  )
}

/** Aujourd'hui (maquette « Aujourd'hui avec événements ») : heures effectives d'ici la prochaine
 * remise, une ligne par classe. */
export function ResumeHeuresEffectives({ maintenant }: { maintenant: Date }) {
  const id = useId()
  const ctx = useCarnet()
  const a = ctx.ctxAgenda
  const lignes = useMemo(() => {
    if (!a) return []
    return classesDansHoraire(ctx.classes, a).map((k) => {
      const aujourdhui = dateIso(maintenant)
      const remise = prochaineRemise(k.ecole_id, ctx.agenda.periodes, aujourdhui)
      return { k, remise, c: remise ? compteurHeures({ classeId: k.id, ctx: a, aujourdhui, maintenant: minutes(maintenant), jusqua: remise.remise }) : null }
    })
  }, [a, ctx.classes, ctx.agenda.periodes, maintenant])
  if (!ctx.agenda.actif || !a || lignes.length === 0) return null
  const avec = lignes.filter((l) => l.remise && l.c)
  if (avec.length === 0) {
    return (
      <section className="carnet-carte agenda-resume-heures" aria-labelledby={`${id}-titre`}>
        <h3 id={`${id}-titre`} className="agenda-surtitre">
          Heures de cours effectives
        </h3>
        <InvitationPeriodes />
      </section>
    )
  }
  const dates = [...new Set(avec.map((l) => l.remise!.remise))]
  return (
    <section className="carnet-carte agenda-resume-heures" aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`} className="agenda-surtitre">
        Heures de cours effectives {dates.length === 1 ? `d’ici le ${jourMoisCourt(dates[0])}` : 'd’ici la prochaine remise des points'}
      </h3>
      <ul className="agenda-heures-classes">
        {avec.map(({ k, remise, c }) => (
          <li key={k.id}>
            <Link to={`/carnet/classe/${k.id}`}>
              {k.nom}
              {dates.length > 1 && <span className="agenda-ligne-detail"> → {jourMoisCourt(remise!.remise)}</span>}
            </Link>
            <strong>{c!.reste} h</strong>
          </li>
        ))}
      </ul>
      <Link className="agenda-lien-detail" to={`/carnet/classe/${avec[0].k.id}`}>
        Voir le détail par classe
      </Link>
    </section>
  )
}

/** Ma semaine (maquette « Ma semaine avec événements ») : heures effectives restantes → prochaine
 * remise et → fin de l'année, par classe. */
export function TableauHeuresRestantes({ maintenant }: { maintenant: Date }) {
  const id = useId()
  const ctx = useCarnet()
  const a = ctx.ctxAgenda
  const lignes = useMemo(() => (a ? classesDansHoraire(ctx.classes, a).map((k) => ({ k, ...heuresClasse(k, a, ctx.agenda.periodes, maintenant) })) : []), [a, ctx.classes, ctx.agenda.periodes, maintenant])
  if (!ctx.agenda.actif || !a || lignes.length === 0) return null
  const dates = [...new Set(lignes.map((l) => l.remise?.remise).filter((d): d is string => !!d))]
  const finJuin = lignes.some((l) => l.fin.session)
  return (
    <section className="carnet-carte agenda-tableau-heures" aria-labelledby={`${id}-titre`}>
      <h3 id={`${id}-titre`} className="agenda-surtitre">
        Heures effectives restantes
      </h3>
      <table>
        <thead>
          <tr>
            <td />
            {dates.length > 0 && <th scope="col">→ {dates.length === 1 ? jourMoisCourt(dates[0]) : 'remise'}</th>}
            <th scope="col">→ {finJuin ? 'juin' : 'fin d’année'}</th>
          </tr>
        </thead>
        <tbody>
          {lignes.map((l) => (
            <tr key={l.k.id}>
              <th scope="row">
                <Link to={`/carnet/classe/${l.k.id}`}>{l.k.nom}</Link>
              </th>
              {dates.length > 0 && <td className="fort">{l.versRemise ? `${l.versRemise.reste} h` : '—'}</td>}
              <td>{l.versFin.reste} h</td>
            </tr>
          ))}
        </tbody>
      </table>
      {dates.length === 0 && <InvitationPeriodes />}
    </section>
  )
}
