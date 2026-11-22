import { useEffect, useState } from 'react'
import type { SupabaseClient } from '@supabase/supabase-js'
import { avertissementsInterro, jourMoisCourt, texteAvertissement, type Evenement, type PeriodeBulletin } from '../../lib/agendaEvenements'
import { dateIso } from '../../lib/carnet'
import './avertissement-evaluation.css'

interface Lu {
  ecoleId: string
  nom: string
  periodes: PeriodeBulletin[]
  evenements: Evenement[]
  seuil: number
}

/**
 * Panneau « Évaluations et examens » ouvert depuis le carnet pour UNE classe (`?cid=` posé par
 * « Créer une évaluation sur la matière vue ») : même avertissement que pour une interro de l'agenda,
 * d'après la date de l'en-tête (« Comptera pour la période 3… », « Peu de temps pour corriger… »).
 * Classe inconnue, 0006 absent, aucune période : rien n'est affiché. Lecture seule.
 */
export function AvertissementEvaluation({ client, classeId, date }: { client: SupabaseClient; classeId: string; date: string }) {
  const [lu, setLu] = useState<Lu | null>(null)
  useEffect(() => {
    let vivant = true
    void (async () => {
      try {
        const [{ chargerAgenda }, classe] = await Promise.all([import('../../lib/agendaDonnees'), client.from('classes').select('id, ecole_id, nom').eq('id', classeId).maybeSingle()])
        const k = classe.data as { ecole_id: string; nom: string } | null
        if (!k) return
        const a = await chargerAgenda(client)
        if (vivant && a.actif) setLu({ ecoleId: k.ecole_id, nom: k.nom, periodes: a.periodes, evenements: a.evenements, seuil: a.seuil })
      } catch {
        // Lecture facultative : en cas d'erreur, aucun avertissement.
      }
    })()
    return () => {
      vivant = false
    }
  }, [client, classeId])
  if (!lu || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null
  const avertissements = avertissementsInterro({ date, ecoleId: lu.ecoleId, periodes: lu.periodes, evenements: lu.evenements, seuil: lu.seuil, aujourdhui: dateIso(new Date()) })
  if (avertissements.length === 0) return null
  return (
    <div className="eval-agenda-avertissements" role="status" aria-label={`Date limite du bulletin pour la ${lu.nom}`}>
      {avertissements.map((a) => {
        const t = texteAvertissement(a, date)
        return (
          <p key={a.type} className={`eval-agenda-avertissement ${a.type === 'apres' ? 'apres' : 'presse'}`}>
            <strong>
              {t.titre} — évaluation du {jourMoisCourt(date)} pour la {lu.nom}
            </strong>
            <span>{t.texte.replace(/^Interro le /, 'Évaluation le ').replace('une interro du', 'une évaluation du')}</span>
          </p>
        )
      })}
    </div>
  )
}
