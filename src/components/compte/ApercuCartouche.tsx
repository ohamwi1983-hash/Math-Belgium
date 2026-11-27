import { cartoucheEffectif, type CartoucheEcole } from '../../entrainement/export/cartouche'

/** Parties du cartouche en cours de modification (surlignées dans l'aperçu). */
export interface SurlignageCartouche {
  ecole: boolean
  adresse: boolean
  professeur: boolean
}

const MATIERE_EXEMPLE = 'Mathématiques 4h/sem'

/**
 * Panneau « Ce qui s'imprime » de la page Mon profil : aperçu du cartouche RÉEL des évaluations et
 * examens (mêmes données que `cartoucheDepuisCompte` → `cartoucheEffectif`, mêmes morceaux et même
 * ordre que `cartouche.ts::morceauxSurtitre` — école · matière · professeur, morceau vide retiré —,
 * adresse en fin de ligne méta comme `adresseCartoucheHtml`) et du pied de page des feuilles
 * d'exercices (nom du professeur à gauche, « page n / N » à droite). Mis à jour pendant la frappe ;
 * ce qui est en cours de modification est surligné (`<mark>`). Le titre et la date sont un exemple.
 */
export function ApercuCartouche({ cartouche, surligne, ecoleParDefaut, idTitre }: { cartouche: CartoucheEcole; surligne: SurlignageCartouche; ecoleParDefaut: string | null; idTitre: string }) {
  const c = cartoucheEffectif(cartouche)
  const morceaux = [
    { cle: 'ecole', texte: c.ecoleNom, marque: surligne.ecole },
    { cle: 'matiere', texte: MATIERE_EXEMPLE, marque: false },
    { cle: 'professeur', texte: c.professeur, marque: surligne.professeur },
  ].filter((m) => m.texte !== '')
  const date = new Intl.DateTimeFormat('fr-BE', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
  const marque = (texte: string, actif: boolean) => (actif ? <mark className="profil-surligne">{texte}</mark> : texte)

  return (
    <aside className="profil-apercu" id="cartouche" aria-labelledby={idTitre}>
      <div className="profil-apercu-tete">
        <h2 id={idTitre}>En-tête des copies</h2>
        <span className="profil-apercu-direct" aria-hidden="true">
          EN DIRECT
        </span>
      </div>
      <div className="profil-feuille">
        <div className="profil-cartouche">
          <div className="profil-cartouche-g">
            <span className="profil-cartouche-surtitre">
              {morceaux.map((m, i) => (
                <span key={m.cle}>
                  {i > 0 && ' · '}
                  {marque(m.texte, m.marque)}
                </span>
              ))}
            </span>
            <span className="profil-cartouche-titre">Évaluation — Calcul vectoriel</span>
            <span className="profil-cartouche-meta">
              {date} · Série <strong>A</strong>
              {c.ecoleAdresse !== '' && <> · {marque(c.ecoleAdresse, surligne.adresse)}</>}
            </span>
          </div>
          <div className="profil-cartouche-d" aria-hidden="true">
            <span>Nom</span>
            <span className="profil-cartouche-champ" />
            <span>Classe</span>
            <span className="profil-cartouche-champ" />
          </div>
        </div>
        <div className="profil-feuille-lignes" aria-hidden="true" />
        <div className="profil-feuille-pied">
          <span>{c.professeur !== '' ? marque(c.professeur, surligne.professeur) : ' '}</span>
          <span>page 1 / 3</span>
        </div>
      </div>
      <p className="profil-apercu-note">
        <span className="profil-apercu-note-detail">En haut : le cartouche des évaluations et des examens ; en bas : le pied de page des feuilles d'exercices. </span>
        Ce que tu modifies est surligné, pendant la frappe.{' '}
        {ecoleParDefaut ? (
          <>
            École affichée : celle par défaut (« {ecoleParDefaut} »).
          </>
        ) : (
          <>Aucune école : rien n'est imprimé à sa place.</>
        )}
      </p>
    </aside>
  )
}
