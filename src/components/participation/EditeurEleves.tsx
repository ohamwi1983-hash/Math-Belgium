import { useEffect, useId, useState } from 'react'
import { ecrireEleves, elevesDe, lireEleves, lireListe, listeDepuisTexte, texteListe } from '../../lib/participation'
import type { ListeEleves } from '../../lib/participation'
import { normaliserSigneMoins } from '../../lib/normaliserSaisie'
import './editeur-eleves.css'

/**
 * Liste des élèves d'une classe, gardée SUR CET APPAREIL seulement (P6, décision du professeur : jamais sur le
 * serveur, jamais dans la vidéo, le PowerPoint / PDF ni la page des élèves). Prénoms tapés ou collés depuis
 * Smartschool / un tableur (un par ligne, ou séparés par des virgules), ou « numéros seulement » (1 à n) ;
 * « Copier la liste » / « Coller une liste » pour la recopier sur un autre appareil (pas de serveur).
 * Utilisée dans les réglages de la participation (projection) et sur la page de la classe (Mes classes).
 * Saisie libre jamais bloquée (aucun filtre pendant la frappe ; la lecture se fait à l'enregistrement).
 */
export function EditeurEleves({ classeId, onChange, titre = true }: { classeId: string; onChange?: (l: ListeEleves | null) => void; titre?: boolean }) {
  const id = useId()
  const [liste, setListe] = useState<ListeEleves | null>(() => lireEleves(classeId))
  const [texte, setTexte] = useState(() => (liste?.mode === 'noms' ? liste.noms.join(', ') : ''))
  const [nombre, setNombre] = useState(() => (liste?.mode === 'numeros' ? String(liste.nombre) : '24'))
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const l = lireEleves(classeId)
    setListe(l)
    setTexte(l?.mode === 'noms' ? l.noms.join(', ') : '')
    setNombre(l?.mode === 'numeros' ? String(l.nombre) : '24')
  }, [classeId])

  const enregistrer = (l: ListeEleves | null) => {
    const ok = ecrireEleves(classeId, l)
    setListe(l)
    onChange?.(l)
    setMessage(ok ? null : 'Ce navigateur refuse de garder la liste (navigation privée ?) : elle vaut pour cette visite seulement.')
  }
  const enregistrerTexte = (t: string) => {
    const noms = lireListe(t)
    enregistrer(noms.length ? { mode: 'noms', noms, nombre: 0 } : null)
  }
  const enregistrerNombre = (t: string) => {
    const n = Number(normaliserSigneMoins(t).trim())
    if (Number.isInteger(n) && n >= 1 && n <= 60) enregistrer({ mode: 'numeros', noms: [], nombre: n })
    else setMessage('Indique un nombre d’élèves entre 1 et 60.')
  }
  const numeros = liste?.mode === 'numeros'
  const n = elevesDe(liste).length

  const copier = () => {
    if (!liste) return
    void navigator.clipboard?.writeText(texteListe(liste)).then(
      () => setMessage('Liste copiée : colle-la dans « Coller une liste » sur l’autre appareil.'),
      () => setMessage('Copie refusée par le navigateur : sélectionne la liste et copie-la (Ctrl+C).'),
    )
  }
  const coller = () => {
    if (!navigator.clipboard?.readText) {
      setMessage('Colle la liste dans le cadre (Ctrl+V ou appui long).')
      return
    }
    navigator.clipboard.readText().then(
      (t) => {
        const l = listeDepuisTexte(t)
        if (l.mode === 'numeros') {
          setNombre(String(l.nombre))
          enregistrer(l)
        } else if (l.noms.length) {
          setTexte(l.noms.join(', '))
          enregistrer(l)
        } else setMessage('Le presse-papiers ne contient pas de liste de prénoms.')
      },
      () => setMessage('Lecture du presse-papiers refusée : colle la liste dans le cadre (Ctrl+V ou appui long).'),
    )
  }

  return (
    <div className="eleves-appareil">
      {titre && <p className="eleves-titre">Élèves (sur cet appareil)</p>}
      <div className="eleves-mode" role="radiogroup" aria-label="Élèves désignés par">
        <button type="button" role="radio" aria-checked={!numeros} className={!numeros ? 'on' : ''} onClick={() => enregistrerTexte(texte)}>
          Prénoms
        </button>
        <button type="button" role="radio" aria-checked={numeros} className={numeros ? 'on' : ''} onClick={() => enregistrerNombre(nombre)}>
          Numéros seulement
        </button>
      </div>
      {numeros ? (
        <label className="eleves-nombre" htmlFor={`${id}-n`}>
          Nombre d’élèves (numéros 1 à n)
          <input id={`${id}-n`} type="text" value={nombre} onChange={(e) => setNombre(normaliserSigneMoins(e.target.value))} onBlur={(e) => enregistrerNombre(e.target.value)} />
        </label>
      ) : (
        <>
          <label className="sr-only" htmlFor={`${id}-t`}>
            Prénoms des élèves
          </label>
          <textarea
            id={`${id}-t`}
            className="eleves-texte"
            rows={4}
            value={texte}
            placeholder="Colle ici la liste copiée de Smartschool ou d’un tableur : un prénom par ligne, ou séparés par des virgules."
            onChange={(e) => setTexte(e.target.value)}
            onBlur={(e) => enregistrerTexte(e.target.value)}
          />
        </>
      )}
      <p className="eleves-etat" role="status">
        {n > 0 ? (
          <>
            <span className="eleves-ok">
              ✓ {n} {numeros ? 'numéros' : `prénom${n > 1 ? 's' : ''}`} · gardés sur cet appareil seulement
            </span>{' '}
            <span className="eleves-aide">jamais envoyés au site ; sur un autre appareil, recolle la liste.</span>
          </>
        ) : (
          <span className="eleves-aide">Aucune liste sur cet appareil. Tapés ou collés, un par ligne ou séparés par des virgules.</span>
        )}
      </p>
      <div className="eleves-actions">
        <button type="button" className="eleves-bouton" disabled={!liste} onClick={copier}>
          Copier la liste
        </button>
        <button type="button" className="eleves-bouton" onClick={coller}>
          Coller une liste
        </button>
        {liste && (
          <button
            type="button"
            className="eleves-bouton eleves-effacer"
            onClick={() => {
              setTexte('')
              enregistrer(null)
            }}
          >
            Effacer la liste
          </button>
        )}
      </div>
      {message && <p className="eleves-message">{message}</p>}
    </div>
  )
}
