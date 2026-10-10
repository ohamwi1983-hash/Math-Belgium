import { useState } from "react";
import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { ReponseFrequences } from "../moteur/verificationTableauFrequences";
import { evaluerFrequences } from "../moteur/verificationTableauFrequences";
import { NIVEAU_AIDE_MAX_FREQUENCES } from "../moteur/sessionTableauFrequences";
import { CONSIGNE_FREQUENCES, LABEL_EFFECTIF_NI, LABEL_FREQUENCE_FI, LABEL_VALEUR_XI, PLACEHOLDER_FREQUENCE, texteAideFrequencesNiveau1, texteAideFrequencesNiveau2 } from "../ui/formatTableauFrequences";
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
  onValider: (reponse: ReponseFrequences) => void;
}

/**
 * Écran 2 — "Fréquences (%)" : les valeurs et effectifs CORRECTS de l'écran 1 sont affichés
 * (jamais la saisie de l'élève, même si elle était fausse) — un nombre fixe de lignes, un champ
 * libre par ligne pour la fréquence.
 *
 * **Règle d'allègement des en-têtes** (`promptcorrectionsgenerateur30lot2.md`, point 2) : "Valeur"
 * et "Effectif" sont déjà apparus en entier sur l'écran 1 — cet écran-ci n'affiche donc plus que
 * leur symbole seul (`$x_i$`, `$n_i$`, sans le mot devant) ; "Fréquence $f_i$ (%)" est en revanche
 * sa toute première apparition dans la séquence de l'exercice, donc toujours affiché en entier.
 *
 * Aide 1 : rappel de la formule générique, `n` substitué (déjà connu — la taille de la liste) mais
 * aucun effectif. Aide 2 : formule substituée et calculée pour la première valeur uniquement, à
 * titre d'exemple — les autres restent à calculer.
 */
export function EtapeFrequencesTableauFrequences({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(exercice.lignes.length).fill("") as string[]);

  function modifier(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerFrequences(exercice, valeurs) : null;
  const statut = evaluation && evaluation.some((s) => s === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <EnonceTableauFrequences exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_FREQUENCES}</p>

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
                Fréquence <Katex expression={LABEL_FREQUENCE_FI} /> (%)
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
                      placeholder={PLACEHOLDER_FREQUENCE}
                      value={valeurs[index]}
                      onChange={(e) => modifier(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Fréquence de la valeur ${ligne.valeur}`}
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
          <p>{texteAideFrequencesNiveau1(exercice)}</p>
          {niveauAide >= 2 && <p>{texteAideFrequencesNiveau2(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_FREQUENCES} onActiverAide={onActiverAide} />

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
