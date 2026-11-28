import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { dateLocale, garderPage, lirePageGardee, pageAuJour, type PageEleve } from '../../lib/pageClasse'
import { ROUTE_PLAN, lienEntrainer, resumeClasse } from '../../lib/guideEleve'
import { chargerSupabase, supabaseConfigure } from '../../lib/supabase'
import { IconeEleve, type NomIconeEleve } from './IconesEleve'
import { BlocEvaluation } from './BlocEvaluation'
import './guideEleve.css'

/**
 * Accueil côté élève (chantier E, maquette `accueil.png` du 27/11/2026) : carte « Ma classe », trois portes
 * et ligne « Entre le code donné par ton professeur ». Tout se lit dans le navigateur (progression des pages de
 * chapitre, code de classe et dernière version vue de la page de classe) ; la seule requête est la relecture
 * de la page de classe PAR SON CODE, comme `/classe` (aucune donnée d'élève n'est envoyée).
 */

function Chevron() {
  return (
    <span className="ge-chevron" aria-hidden="true">
      ›
    </span>
  )
}

function Porte({ to, icone, ton, titre, texte }: { to: string; icone: NomIconeEleve; ton: string; titre: string; texte: string }) {
  return (
    <Link to={to} className={`ge-porte ge-ton-${ton}`}>
      <span className="ge-porte-icone">
        <IconeEleve nom={icone} taille={30} />
      </span>
      <span className="ge-porte-corps">
        <span className="ge-porte-titre">{titre}</span>
        <span className="ge-porte-texte">{texte}</span>
      </span>
      <Chevron />
    </Link>
  )
}

export interface RepriseAccueil {
  /** Titre du chapitre. */
  chapitre: string
  slug: string
  numero: number
  href: string
}

/** Les trois portes d'une année. « Mon cours » reprend la dernière étape ouverte, sinon mène aux chapitres. */
export function PortesAccueil({ niveau, reprise }: { niveau: string; reprise: RepriseAccueil | null }) {
  return (
    <nav className="ge-portes" aria-label="Que veux-tu faire ?" data-visite="portes">
      <Porte
        to={reprise ? reprise.href : `/#chapitres`}
        icone="cours"
        ton="cours"
        titre="Mon cours"
        texte={reprise ? `Reprendre : ${reprise.chapitre}, point ${reprise.numero}` : 'Choisis un chapitre et lis-le point par point'}
      />
      <Porte to={lienEntrainer(niveau, reprise?.slug)} icone="entrainer" ton="entrainer" titre="M’entraîner" texte="Exercices corrigés, feuille, interro blanche" />
      <Porte to={ROUTE_PLAN} icone="interro" ton="interro" titre="Préparer mon interro" texte="Mon plan jour par jour et ma progression" />
    </nav>
  )
}

/** « Pas encore de classe ? Entre le code donné par ton professeur » (élève sans code gardé). */
export function LigneCodeClasse() {
  return (
    <p className="ge-code">
      Pas encore de classe ? <Link to="/classe">Entre le code donné par ton professeur</Link>
    </p>
  )
}

type EtatClasse = { page: PageEleve | null; codePerime: boolean }

/**
 * Carte « Ma classe » : prochaine interro publiée (« Je prépare mon interro » → plan de révision prérempli,
 * format `lienPlanRevision` de `pageClasse.ts`) et devoir le plus proche. Affiche tout de suite la version
 * gardée sur l'appareil, puis la relit en tâche de fond (si Supabase est configuré).
 */
export function CarteMaClasse({ code }: { code: string }) {
  const [etat, setEtat] = useState<EtatClasse>(() => ({ page: lirePageGardee(code)?.page ?? null, codePerime: false }))
  const [ouvert, setOuvert] = useState(false)

  useEffect(() => {
    if (!supabaseConfigure() || (window as Window & { __prerendu?: boolean }).__prerendu) return
    let actif = true
    const minuteur = window.setTimeout(async () => {
      try {
        const { lirePageClasse } = await import('../../lib/pageClasseDonnees')
        const client = await chargerSupabase()
        if (!client || !actif) return
        const r = await lirePageClasse(client, code)
        if (!actif) return
        if (r.statut === 'ok') {
          setEtat({ page: garderPage(code, r.page, new Date()), codePerime: false })
        } else if (r.statut === 'inconnu') setEtat((e) => ({ ...e, codePerime: true }))
      } catch {
        /* hors ligne : la version gardée reste affichée */
      }
    }, 900)
    return () => {
      actif = false
      clearTimeout(minuteur)
    }
  }, [code])

  const aujourdhui = dateLocale(new Date())
  const resume = useMemo(() => (etat.page ? resumeClasse(pageAuJour(etat.page, aujourdhui), aujourdhui) : null), [etat.page, aujourdhui])

  return (
    <section className="ge-classe" aria-labelledby="ge-classe-titre">
      <p className="ge-classe-sur" id="ge-classe-titre">
        Ma classe{resume?.classe ? ` · ${resume.classe}` : ''}
      </p>
      {etat.codePerime ? (
        <>
          <p className="ge-classe-detail">Ton code de classe ne marche plus : ton professeur l’a sans doute changé.</p>
          <Link className="ge-bouton-plein ge-classe-bouton" to="/classe">
            Entrer le nouveau code ›
          </Link>
        </>
      ) : resume?.interro ? (
        <>
          <p className="ge-classe-interro">
            {resume.interro.titre}
            {resume.interro.avant && (
              <>
                {' '}
                <span className="ge-classe-change">date changée</span>
              </>
            )}
          </p>
          <p className="ge-classe-detail">{[resume.interro.detail, resume.devoir].filter(Boolean).join(' · ')}</p>
          {resume.interro.complete && (
            <details className="ge-classe-contenu" onToggle={(e) => setOuvert((e.currentTarget as HTMLDetailsElement).open)}>
              <summary>{ouvert ? 'Cacher le contenu' : 'Voir le contenu'}</summary>
              <BlocEvaluation interro={resume.interro.complete} aujourdhui={aujourdhui} plan={null} sansTitre />
            </details>
          )}
          <div className="ge-classe-actions">
            <Link className="ge-bouton-plein ge-classe-bouton" to={resume.interro.plan ?? ROUTE_PLAN}>
              Je prépare mon interro ›
            </Link>
            <Link className="ge-classe-lien" to="/classe">
              Voir la page de ma classe
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="ge-classe-interro">{resume?.devoir ?? 'Aucune interro annoncée pour l’instant'}</p>
          {resume?.devoir && <p className="ge-classe-detail">Aucune interro annoncée pour l’instant.</p>}
          <div className="ge-classe-actions">
            <Link className="ge-classe-lien" to="/classe">
              Voir la page de ma classe
            </Link>
          </div>
        </>
      )}
    </section>
  )
}
