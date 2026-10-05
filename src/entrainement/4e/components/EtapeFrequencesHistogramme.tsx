import { useState } from "react";
import type { ExerciceHistogramme } from "../core/histogramme.types";
import type { ReponseFrequencesHistogramme } from "../moteur/verificationHistogramme";
import { evaluerFrequencesHistogramme } from "../moteur/verificationHistogramme";
import { NIVEAU_AIDE_MAX_FREQUENCES } from "../moteur/sessionHistogramme";
import {
  CONSIGNE_FREQUENCES,
  LABEL_CLASSE_XI,
  LABEL_EFFECTIF_NI,
  LABEL_FREQUENCE_FI,
  PLACEHOLDER_FREQUENCE_CLASSE,
  formatClasseTexte,
  libelleBoutonAide,
  texteAideFrequencesNiveau1,
  texteAideFrequencesNiveau2,
} from "../ui/formatHistogramme";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceHistogramme } from "./EnonceHistogramme";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceHistogramme;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseFrequencesHistogramme) => void;
}

/**
 * Écran 2 — "Fréquences (%)" (variante "frequence" uniquement) : les effectifs CORRECTS de l'écran
 * "classement" sont rappelés (jamais la saisie de l'élève, même si elle était fausse) — un nombre
 * fixe de lignes, un champ libre par ligne pour la fréquence. Mêmes 2 niveaux d'aide que l'écran
 * "Fréquences" du trentième exercice (spec) : Aide 1 = rappel de la formule non substituée, Aide 2 =
 * substituée et calculée pour un seul exemple (la première classe).
 *
 * **En-têtes indiciels KaTeX** (`promptinvestigationpoint3latexmobile.md`) : $x_i$/$n_i$ en forme
 * ABRÉGÉE (déjà introduits en toutes lettres sur l'écran "Classement"), "Fréquence $f_i$ (%)" en
 * forme COMPLÈTE (première apparition de ce symbole) — mesuré à 375px sans aucun débordement (de
 * simples symboles courts, jamais une fraction substituée).
 */
export function EtapeFrequencesHistogramme({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [valeurs, setValeurs] = useState<string[]>(() => new Array(exercice.classes.length).fill("") as string[]);

  function modifier(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  const complet = valeurs.every((v) => v.trim() !== "");
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? evaluerFrequencesHistogramme(exercice, valeurs) : null;
  const statut = evaluation && evaluation.some((s) => s === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <EnonceHistogramme exercice={exercice} />
      <p className="prompt-text">{CONSIGNE_FREQUENCES}</p>

      <div className="tf-table-scroll">
        <table className="tf-table">
          <thead>
            <tr>
              <th>
                <Katex expression={LABEL_CLASSE_XI} />
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
            {exercice.classes.map((classe, index) => {
              const erronee = evaluation !== null && evaluation[index] !== "correct";
              return (
                <tr key={index}>
                  <td>{formatClasseTexte(exercice, index)}</td>
                  <td>{classe.effectif}</td>
                  <td>
                    <input
                      className={`text-input${erronee ? " is-erronee" : ""}`}
                      placeholder={PLACEHOLDER_FREQUENCE_CLASSE}
                      value={valeurs[index]}
                      onChange={(e) => modifier(index, filtrerSaisieNumerique(e.target.value))}
                      onKeyDown={gererKeyDownNumerique}
                      aria-label={`Fréquence de la classe ${formatClasseTexte(exercice, index)}`}
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
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_FREQUENCES} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_FREQUENCES)}
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
