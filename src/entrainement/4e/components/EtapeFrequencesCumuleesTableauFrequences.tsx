import { useState } from "react";
import type { ExerciceTableauFrequences } from "../core/tableauFrequences.types";
import type { ReponseFrequencesCumulees } from "../moteur/verificationTableauFrequences";
import { evaluerFrequencesCumulees } from "../moteur/verificationTableauFrequences";
import { NIVEAU_AIDE_MAX_FREQUENCES_CUMULEES } from "../moteur/sessionTableauFrequences";
import {
  CONSIGNE_FREQUENCES_CUMULEES,
  LABEL_FREQUENCE_CUMULEE_PHI_I,
  LABEL_FREQUENCE_FI,
  LABEL_VALEUR_XI,
  PLACEHOLDER_FREQUENCE_CUMULEE,
  frequencesCumuleesRevelees,
  libelleBoutonAide,
  texteAideFrequencesCumuleesNiveau1,
} from "../ui/formatTableauFrequences";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceTableauFrequences } from "./EnonceTableauFrequences";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceTableauFrequences;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFrequencesCumulees) => void;
}

/**
 * Écran 4 — "Fréquences cumulées" (`promptameliorationsgenerateur30.md`, point 5) : les valeurs et
 * fréquences CORRECTES propagées depuis l'écran 2 sont rappelées (toujours la vérité, jamais la
 * saisie de l'élève) — un champ libre par ligne pour la fréquence cumulée. Tableau à **3
 * colonnes** — Valeur, Fréquence (%), Fréquence cumulée (%) — les colonnes "Effectif"/"Effectif
 * cumulé" ne sont jamais affichées ici.
 *
 * **Règle d'allègement des en-têtes** (`promptcorrectionsgenerateur30lot2.md`, point 2) : "Valeur"
 * et "Fréquence" sont déjà apparus en entier sur un écran antérieur (1 et 2 respectivement) — cet
 * écran-ci n'affiche donc plus que leur symbole seul (`$x_i$`, `$f_i$ (%)` — la mention "(%)" reste,
 * seul le mot devant le symbole disparaît) ; "Fréquence cumulée $\varphi_i$ (%)" est en revanche sa
 * toute première apparition dans la séquence de l'exercice, donc toujours affiché en entier.
 *
 * Même mécanique de calcul et mêmes types d'aide que l'écran "Effectifs cumulés" : Aide 1 = rappel
 * de la méthode (cumulée = cumulée précédente + fréquence de la ligne), montré uniquement pour la
 * première ligne. Aide 2 = révèle les fréquences cumulées pour TOUTES les lignes SAUF la dernière —
 * l'élève doit reconnaître lui-même que la dernière doit valoir 100 % et la produire.
 */
export function EtapeFrequencesCumuleesTableauFrequences({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  onActiverAide,
  onValider,
}: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(exercice.lignes.length).fill("") as string[]);

  function modifier(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerFrequencesCumulees(exercice, valeurs) : null;
  const statut = evaluation && evaluation.some((s) => s === "parse_error") ? "parse_error" : undefined;

  const reveles = niveauAide >= 2 ? frequencesCumuleesRevelees(exercice) : [];

  return (
    <div>
      <EnonceTableauFrequences exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_FREQUENCES_CUMULEES}</p>

      <div className="tf-table-scroll">
        <table className="tf-table">
          <thead>
            <tr>
              <th>
                <Katex expression={LABEL_VALEUR_XI} />
              </th>
              <th>
                <Katex expression={LABEL_FREQUENCE_FI} /> (%)
              </th>
              <th>
                Fréquence cumulée <Katex expression={LABEL_FREQUENCE_CUMULEE_PHI_I} /> (%)
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.lignes.map((ligne, index) => {
              const erronee = evaluation !== null && evaluation[index] !== "correct";
              return (
                <tr key={ligne.valeur}>
                  <td>{ligne.valeur}</td>
                  <td>{ligne.frequencePourcent}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_FREQUENCE_CUMULEE}
                      value={valeurs[index]}
                      onChange={(e) => modifier(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Fréquence cumulée de la valeur ${ligne.valeur}`}
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
          <p>{texteAideFrequencesCumuleesNiveau1(exercice)}</p>
          {niveauAide >= 2 && (
            <p>
              Fréquences cumulées déjà connues : {reveles.map((r) => `${r.valeur} → ${r.frequenceCumulee} %`).join(", ")}. Reste à
              trouver celle de la dernière ligne — souviens-toi de ce qu'elle doit valoir.
            </p>
          )}
        </div>
      )}
      <button
        type="button"
        className="btn btn-aide"
        disabled={niveauAide >= NIVEAU_AIDE_MAX_FREQUENCES_CUMULEES}
        onClick={onActiverAide}
      >
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_FREQUENCES_CUMULEES)}
      </button>

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
