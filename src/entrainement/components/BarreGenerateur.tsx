import { Link } from "react-router-dom";
import { estClos, estConsultable, useEtatCadre, useStoreCadre } from "./cadreGenerateur";
import { BoutonLecture } from "../../components/lecture/BoutonLecture";

interface Props {
  /** Lien vers le chapitre (et la section qui renvoie vers ce générateur, voir `EntrainementPage`). */
  lienChapitre: string;
  /** Texte complet du lien de retour, pour les lecteurs d'écran et l'infobulle. */
  libelleRetour: string;
  /** Ligne « niveau · chapitre », en petit. */
  contexte: string;
}

const LIBELLES: Record<string, string> = {
  correcte: "réussi",
  aide: "réussi avec aide",
  revele: "réponse révélée",
  courante: "en cours",
  "a-venir": "à venir",
  "sans-objet": "sans objet",
};

/**
 * Barre du haut de la page d'un générateur (maquette A) : une seule ligne — retour au chapitre
 * (cible ≥ 44 px), « niveau · chapitre » en petit, progression des étapes en segments et « Étape n / N ».
 * Remplace le fil d'Ariane, le lien de retour sur deux lignes, le surtitre et la ligne du chapitre ;
 * le `<h1>` du générateur reste dans la page, juste en dessous.
 *
 * Les segments sont ceux que le générateur publie via `ProgressionPuces` (mêmes états, mêmes
 * couleurs : vert juste, jaune juste avec aide, rouge révélée, orange en cours). Un segment clos reste
 * cliquable quand le générateur a une fiche (même `onSegmentClick` qu'avant) : zone de toucher de toute
 * la hauteur de la barre de progression, pas seulement le trait de 6 px.
 *
 * Bouton « Aa » (confort de lecture, côté élève, lot G) en bout de barre : il ouvre le panneau commun
 * (taille, police, couleurs…), qui s'applique aussi au générateur (`confortLecture.css`).
 */
export function BarreGenerateur({ lienChapitre, libelleRetour, contexte }: Props) {
  const { segments, consultable } = useEtatCadre();
  const store = useStoreCadre();
  const total = segments?.length ?? 0;
  const indexCourant = segments ? segments.findIndex((s) => s === "courante") : -1;
  const etape = total === 0 ? 0 : indexCourant >= 0 ? indexCourant + 1 : Math.min(total, segments!.filter(estClos).length + 1);

  return (
    <div className="gen-barre no-export">
      <Link className="gen-barre-retour" to={lienChapitre} aria-label={libelleRetour} title={libelleRetour}>
        <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <div className="gen-barre-milieu">
        <p className="gen-barre-contexte">{contexte}</p>
        {segments && total > 0 && (
          <div className="gen-barre-segments" role="list" aria-label="Progression des étapes">
            {segments.map((etat, index) => {
              const libelle = `Étape ${index + 1} : ${LIBELLES[etat] ?? etat}`;
              return consultable && store && estConsultable(etat) ? (
                <button
                  key={index}
                  type="button"
                  role="listitem"
                  className={`gen-segment gen-segment-${etat} gen-segment-cliquable`}
                  onClick={() => store.revoir(index)}
                  aria-label={`Revoir l'écran ${index + 1} (${LIBELLES[etat]})`}
                  title={`Revoir l'écran ${index + 1}`}
                />
              ) : (
                <span key={index} role="listitem" className={`gen-segment gen-segment-${etat}`} aria-label={libelle} aria-current={etat === "courante" ? "step" : undefined} />
              );
            })}
          </div>
        )}
      </div>
      {total > 0 && (
        <p className="gen-barre-etape">
          Étape {etape}&nbsp;/&nbsp;{total}
        </p>
      )}
      <BoutonLecture variante="etape" />
    </div>
  );
}
