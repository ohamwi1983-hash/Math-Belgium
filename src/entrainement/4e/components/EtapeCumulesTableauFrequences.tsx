import { useState } from "react";
import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { ReponseCumules } from "../moteur/verificationTableauFrequences";
import { evaluerCumules } from "../moteur/verificationTableauFrequences";
import { NIVEAU_AIDE_MAX_CUMULES } from "../moteur/sessionTableauFrequences";
import { CONSIGNE_CUMULES, LABEL_EFFECTIF_CUMULE_VI, LABEL_EFFECTIF_NI, LABEL_VALEUR_XI, PLACEHOLDER_CUMULE, cumulesReveles, texteAideCumulesNiveau1 } from "../ui/formatTableauFrequences";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceTableauFrequences } from "./EnonceTableauFrequences";
import { Katex } from "./Katex";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceTableauFrequences;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCumules) => void;
}

/**
 * Écran 3 — "Effectifs cumulés" : les valeurs et effectifs CORRECTS de l'écran 1 sont rappelés
 * (toujours la vérité, jamais la saisie de l'élève) — un champ libre par ligne pour l'effectif
 * cumulé. Tableau à **3 colonnes** — Valeur, Effectif, Effectif cumulé
 * (`promptcorrectionsgenerateur30lot2.md`, point 1 : rétablit la colonne "Valeur", retirée à tort
 * par la correction précédente en même temps que "Fréquence" — seule "Fréquence" reste absente).
 *
 * Aide 1 : rappel de la méthode (cumulé = cumulé précédent + effectif), montré uniquement pour la
 * première ligne (cumulé = son propre effectif). Aide 2 : révèle les effectifs cumulés pour
 * TOUTES les lignes SAUF la dernière — l'élève doit reconnaître lui-même que la dernière doit
 * valoir n et la produire (force l'auto-vérification plutôt que de la lui donner).
 */
export function EtapeCumulesTableauFrequences({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(exercice.lignes.length).fill("") as string[]);

  function modifier(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerCumules(exercice, valeurs) : null;
  const statut = evaluation && evaluation.some((s) => s === "parse_error") ? "parse_error" : undefined;

  const reveles = niveauAide >= 2 ? cumulesReveles(exercice) : [];

  return (
    <div>
      <EnonceTableauFrequences exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_CUMULES}</p>

      <div className="tf-table-scroll">
        <table className="tf-table">
          <thead>
            <tr>
              <th>
                <Katex expression={LABEL_VALEUR_XI} />
              </th>
              <th>
                <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th>
                Effectif cumulé <Katex expression={LABEL_EFFECTIF_CUMULE_VI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.lignes.map((ligne, index) => {
              const erronee = evaluation !== null && evaluation[index] !== "correct";
              return (
                <tr key={ligne.valeur}>
                  <td>{ligne.valeur}</td>
                  <td>{ligne.effectif}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_CUMULE}
                      value={valeurs[index]}
                      onChange={(e) => modifier(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Effectif cumulé de la valeur ${ligne.valeur}`}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideCumulesNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <p>
              Effectifs cumulés déjà connus : {reveles.map((r) => `${r.valeur} → ${r.effectifCumule}`).join(", ")}. Reste à trouver
              celui de la dernière ligne — souviens-toi de ce qu'il doit valoir.
            </p>
          )}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CUMULES} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider(valeurs)}>
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
