/**
 * Petits morceaux d'interface de l'agenda du carnet (0006) partagés par Aujourd'hui, Ma semaine, la
 * page d'une classe, l'agenda d'une période, le formulaire et les réglages : puce du type (icône au
 * trait), bandeau d'un événement, repère « Remise des points », avertissements d'une interro,
 * message « Agenda pas encore activé ». Styles : `agenda.css`.
 */
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  dateJourLong,
  joursDeClasse,
  LIBELLE_TYPE,
  periodeSuivante,
  prochaineRemise,
  texteAvertissement,
  texteSansCours,

  dateCourteJour,
  type Avertissement,
  type Evenement,
  type PeriodeBulletin,
  type TypeEvenement,
} from '../../lib/agendaEvenements'

/** Icône au trait (16 px, `currentColor`) d'un type d'événement. */
export function IconeType({ type, taille = 16 }: { type: TypeEvenement | 'remise' | 'attention' | 'horloge'; taille?: number }) {
  const p = { width: taille, height: taille, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true, focusable: false }
  switch (type) {
    case 'sortie':
      return (
        <svg {...p}>
          <path d="M4 5c5 2 11 2 16 0v6a8 8 0 0 1-16 0z" />
          <path d="M9 10h.01M15 10h.01M9.5 14.5c1.5 1 3.5 1 5 0" />
        </svg>
      )
    case 'voyage':
      return (
        <svg {...p}>
          <rect x="4" y="4" width="16" height="13" rx="2" />
          <path d="M4 11h16M7 17v3M17 17v3M8 14h.01M16 14h.01" />
        </svg>
      )
    case 'journee_pedagogique':
      return (
        <svg {...p}>
          <path d="M2 9l10-5 10 5-10 5z" />
          <path d="M6 11v5c3 2 9 2 12 0v-5" />
        </svg>
      )
    case 'conseil_classe':
      return (
        <svg {...p}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          <circle cx="17" cy="9" r="2.5" />
          <path d="M16 14.2c2.9.4 5 2.8 5 5.8" />
        </svg>
      )
    case 'absence_professeur':
      // Personne barrée.
      return (
        <svg {...p}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 20.5c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
          <path d="M3.5 3.5l17 17" />
        </svg>
      )
    case 'session_examens':
      return (
        <svg {...p}>
          <path d="M14 3H6v18h12V7z" />
          <path d="M14 3v4h4M9 12h6M9 16h6" />
        </svg>
      )
    case 'interrogation':
      return (
        <svg {...p}>
          <path d="M4 20l1-4L16 5l3 3L8 19z" />
          <path d="M13.5 7.5l3 3" />
        </svg>
      )
    case 'remise':
      return (
        <svg {...p}>
          <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
        </svg>
      )
    case 'attention':
      return (
        <svg {...p}>
          <path d="M12 3l10 18H2z" />
          <path d="M12 10v5M12 18h.01" />
        </svg>
      )
    case 'horloge':
      return (
        <svg {...p}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </svg>
      )
    default:
      return (
        <svg {...p}>
          <rect x="4" y="5" width="16" height="15" rx="2" />
          <path d="M4 10h16M9 3v4M15 3v4" />
        </svg>
      )
  }
}

/** Puce colorée du type (« Sortie », « Journée pédagogique »…). */
export function PuceType({ type, libelle }: { type: TypeEvenement; libelle?: string }) {
  return (
    <span className={`agenda-puce-type agenda-t-${type}`}>
      <IconeType type={type} taille={13} />
      {libelle ?? LIBELLE_TYPE[type]}
    </span>
  )
}

export function MessageAgendaInactif({ compact = false }: { compact?: boolean }) {
  return (
    <div className="compte-encadre agenda-inactif" role="status">
      <p>
        <strong>Agenda pas encore activé</strong>
        {compact ? ' : ' : '. '}colle le fichier <code>supabase/migrations/0006_agenda.sql</code> dans l'éditeur SQL de Supabase (SQL Editor → New query → coller → Run), puis
        recharge cette page. Le reste de « Mes classes » fonctionne normalement en attendant.
      </p>
    </div>
  )
}

/** Bandeau d'un événement d'un jour (Aujourd'hui) : bouton qui ouvre le formulaire. */
export function BandeauEvenement({ e, titre, suite, onOuvrir }: { e: Evenement; titre: string; suite: string; onOuvrir: () => void }) {
  return (
    <button type="button" className={`agenda-bandeau agenda-t-${e.type}`} onClick={onOuvrir}>
      <span className="agenda-bandeau-icone">
        <IconeType type={e.type} taille={18} />
      </span>
      <span>
        <strong>{titre}</strong>
        {suite}
        <span className="carnet-sr"> — modifier l’événement</span>
      </span>
    </button>
  )
}

/** Repère « Remise des points P2 : vendredi 11/12 — dans 5 jours de classe (la journée
 * pédagogique ne compte pas) » ; une ligne par école qui a des périodes. */
export function RepereRemise({ ecoleId, nomEcole, periodes, evenements, aujourdhui }: { ecoleId: string; nomEcole?: string; periodes: PeriodeBulletin[]; evenements: Evenement[]; aujourdhui: string }) {
  const p = prochaineRemise(ecoleId, periodes, aujourdhui)
  if (!p) return null
  const j = joursDeClasse(aujourdhui, p.remise, ecoleId, evenements)
  const sansCours = texteSansCours(j.sansCours)
  return (
    <div className="agenda-remise" role="note">
      <IconeType type="remise" taille={18} />
      <p>
        <strong>
          {nomEcole ? `${nomEcole} · ` : ''}Remise des points P{p.numero} : {dateJourLong(p.remise)}
        </strong>
        <span className="agenda-remise-detail">
          {p.remise === aujourdhui ? 'aujourd’hui' : `dans ${j.jours} jour${j.jours > 1 ? 's' : ''} de classe`}
          {sansCours ? ` ${sansCours}` : ''}
        </span>
      </p>
    </div>
  )
}

/** Carte « Remise des points P2 : ven. 11/12 · P3 ensuite : ven. 26/03 » (Ma semaine). */
export function CarteRemise({ ecoleId, nomEcole, periodes, aujourdhui }: { ecoleId: string; nomEcole?: string; periodes: PeriodeBulletin[]; aujourdhui: string }) {
  const p = prochaineRemise(ecoleId, periodes, aujourdhui)
  if (!p) return null
  const s = periodeSuivante(p, periodes)
  return (
    <div className="agenda-remise" role="note">
      <IconeType type="remise" taille={18} />
      <p>
        <strong>
          {nomEcole ? `${nomEcole} · ` : ''}Remise des points P{p.numero} : {dateCourteJour(p.remise)}
        </strong>
        {s && (
          <span className="agenda-remise-detail">
            P{s.numero} ensuite : {dateCourteJour(s.remise)}
          </span>
        )}
      </p>
    </div>
  )
}

/** Avertissements d'une interro (formulaire, panneau d'évaluation). */
export function AvertissementsInterro({ avertissements, date, apres }: { avertissements: Avertissement[]; date: string; apres?: ReactNode }) {
  if (avertissements.length === 0) return null
  return (
    <div className="agenda-avertissements" role="status">
      {avertissements.map((a) => {
        const t = texteAvertissement(a, date)
        return (
          <div key={a.type} className={`agenda-avertissement ${a.type === 'apres' ? 'apres' : 'presse'}`}>
            <IconeType type={a.type === 'apres' ? 'attention' : 'horloge'} taille={18} />
            <p>
              <strong>{t.titre}</strong>
              <span>{t.texte}</span>
            </p>
          </div>
        )
      })}
      {apres}
    </div>
  )
}

/** Lien vers les réglages des périodes quand il n'y en a pas. */
export function InvitationPeriodes() {
  return (
    <p className="compte-aide agenda-invitation-periodes">
      Ajoute les dates de remise des points dans <Link to="/carnet/reglages">Réglages</Link> pour voir les heures d’ici la prochaine remise et être averti quand une interro tombe trop
      tard.
    </p>
  )
}

