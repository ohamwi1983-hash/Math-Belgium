import { useState } from "react";
import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ReponseQ1 } from "../moteur/verificationMediane";
import { diagnostiquerQ1 } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_Q1 } from "../moteur/sessionMediane";
import { LABEL_EFFECTIF_CUMULE_VI, LABEL_EFFECTIF_NI, LABEL_Q1, LABEL_VALEUR_XI, PLACEHOLDER_Q1, PLACEHOLDER_SEUIL, consigneQ1, surlignageSeuilTable, texteAideQ1Niveau1, texteAideQ1Niveau2 } from "../ui/formatMediane";
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
  onValider: (reponse: ReponseQ1) => void;
}

/**
 * Écran "q1" (variante "discrete" uniquement, `promptgen33modifications.md`) — même structure que
 * l'écran "mediane" (2 champs séparés : seuil n/4, Q1), calculée DIRECTEMENT sur le tableau
 * complet, indépendamment de la position de la médiane (pas de règle en cascade — divergence
 * assumée avec "Étendue et écart interquartile", gen35). Même comportement de surlignage à
 * l'Aide 2.
 */
export function EtapeQ1Mediane({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [seuil, setSeuil] = useState("");
  const [q1, setQ1] = useState("");

  const complet = seuil.trim() !== "" && q1.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerQ1(exercice, { seuil, q1 }) : null;
  const statut = evaluation && (evaluation.seuil === "parse_error" || evaluation.q1 === "parse_error") ? "parse_error" : undefined;
  const surlignage = niveauAide >= 2 ? surlignageSeuilTable(exercice, exercice.seuilQ1, exercice.indexQ1) : null;

  return (
    <div>
      <EnonceMediane exercice={exercice} />
      <p className="prompt-text">{consigneQ1(exercice)}</p>

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
        <label className="field-label" htmlFor="q1-seuil">
          Seuil (n/4) =
        </label>
        <input
          id="q1-seuil"
          className={`text-input${evaluation && evaluation.seuil !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_SEUIL}
          value={seuil}
          onChange={(e) => setSeuil(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule" htmlFor="q1-valeur">
          <Katex expression={LABEL_Q1} /> =
        </label>
        <input
          id="q1-valeur"
          className={`text-input${evaluation && evaluation.q1 !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_Q1}
          value={q1}
          onChange={(e) => setQ1(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            <SegmentsInline segments={texteAideQ1Niveau1()} />
          </p>
          {niveauAide >= 2 && <p>{texteAideQ1Niveau2(exercice)}</p>}
        </div>
      )}
      <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_Q1} onActiverAide={onActiverAide} />

      <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ seuil, q1 })}>
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
