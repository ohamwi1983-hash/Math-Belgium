import { useState } from "react";
import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ReponseQ3 } from "../moteur/verificationMediane";
import { diagnostiquerQ3 } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_Q3 } from "../moteur/sessionMediane";
import { LABEL_EFFECTIF_CUMULE_VI, LABEL_EFFECTIF_NI, LABEL_Q3, LABEL_VALEUR_XI, PLACEHOLDER_Q3, PLACEHOLDER_SEUIL, consigneQ3, surlignageSeuilTable, texteAideQ3Niveau1, texteAideQ3Niveau2 } from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMediane } from "./EnonceMediane";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceMedianeDiscrete;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseQ3) => void;
}

/**
 * Écran "q3" (variante "discrete" uniquement, `promptgen33modifications.md`) — même structure que
 * l'écran "q1" (2 champs séparés : seuil 3n/4, Q3), calculée DIRECTEMENT sur le tableau complet.
 */
export function EtapeQ3Mediane({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [seuil, setSeuil] = useState("");
  const [q3, setQ3] = useState("");

  const complet = seuil.trim() !== "" && q3.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerQ3(exercice, { seuil, q3 }) : null;
  const statut = evaluation && (evaluation.seuil === "parse_error" || evaluation.q3 === "parse_error") ? "parse_error" : undefined;
  const surlignage = niveauAide >= 2 ? surlignageSeuilTable(exercice, exercice.seuilQ3, exercice.indexQ3) : null;

  return (
    <div>
      <EnonceMediane exercice={exercice} />
      <p className="prompt-text">{consigneQ3(exercice)}</p>

      <div className="tf-table-scroll">
        <table className="tf-table md-table">
          <thead>
            <tr>
              <th>
                Valeur <Katex expression={LABEL_VALEUR_XI} />
              </th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th>
                Effectif cumulé <Katex expression={LABEL_EFFECTIF_CUMULE_VI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.lignes.map((ligne, index) => (
              <tr key={index} className={surlignage?.type === "ligne" && surlignage.index === index ? "is-surlignee" : undefined}>
                <td>{ligne.valeur}</td>
                <td>{ligne.effectif}</td>
                <td className={surlignage?.type === "valeur" && surlignage.index === index ? "is-surlignee" : undefined}>{ligne.effectifCumule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="field field-inline">
        <label className="field-label" htmlFor="q3-seuil">
          Seuil (3n/4) =
        </label>
        <input
          id="q3-seuil"
          className={`text-input${evaluation && evaluation.seuil !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SEUIL}
          value={seuil}
          onChange={(e) => setSeuil(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="q3-valeur">
          <Katex expression={LABEL_Q3} /> =
        </label>
        <input
          id="q3-valeur"
          className={`text-input${evaluation && evaluation.q3 !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_Q3}
          value={q3}
          onChange={(e) => setQ3(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={texteAideQ3Niveau1()} />
          </p>
          {niveauAide >= 2 && <p>{texteAideQ3Niveau2(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_Q3} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ seuil, q3 })}>
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
