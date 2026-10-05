import { useState } from "react";
import type { ExerciceMedianeClasses } from "../core/mediane.types";
import type { ReponseSynthese } from "../moteur/verificationMediane";
import { diagnostiquerSynthese } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_SYNTHESE } from "../moteur/sessionMediane";
import {
  LABEL_EFFECTIF_CUMULE_VI,
  LABEL_EFFECTIF_NI,
  LABEL_X_MAX,
  LABEL_X_MIN,
  PLACEHOLDER_ETENDUE,
  PLACEHOLDER_MODE,
  PLACEHOLDER_XMAX,
  PLACEHOLDER_XMIN,
  TEXTE_AIDE_SYNTHESE_1_APRES,
  TEXTE_AIDE_SYNTHESE_1_AVANT,
  TEXTE_AIDE_SYNTHESE_1_ENTRE_1,
  TEXTE_AIDE_SYNTHESE_1_ENTRE_2,
  TEXTE_AIDE_SYNTHESE_1_ENTRE_3,
  consigneSynthese,
  formatClasseTexte,
  libelleBoutonAide,
  texteAideSyntheseNiveau2,
} from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { EnonceMediane } from "./EnonceMediane";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceMedianeClasses;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseSynthese) => void;
}

/**
 * Écran "synthese" (variante "classes" uniquement, dernière étape — `promptgen33modifications2.md`,
 * remplace "calculFinal") — tableau réaffiché en lecture seule, 3 champs numériques (xMin/xMax/
 * étendue, tolérance EXACTE — jamais celle des 3 écrans de lecture graphique précédents), un champ
 * CATÉGORIEL "Classe modale" (un bouton par classe, même patron exact que `EtapeClasseModale.tsx`,
 * "Mode et classe modale") et un champ numérique "Mode" — vérifié INDÉPENDAMMENT du champ "Classe
 * modale" (jamais dérivé de sa saisie, voir `verificationMediane.ts`).
 */
export function EtapeSyntheseMediane({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider }: Props) {
  const [xMin, setXMin] = useState("");
  const [xMax, setXMax] = useState("");
  const [etendue, setEtendue] = useState("");
  const [classeModale, setClasseModale] = useState<number | null>(null);
  const [mode, setMode] = useState("");

  const complet = xMin.trim() !== "" && xMax.trim() !== "" && etendue.trim() !== "" && classeModale !== null && mode.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerSynthese(exercice, { xMin, xMax, etendue, classeModale, mode }) : null;
  const statut =
    evaluation && (evaluation.xMin === "parse_error" || evaluation.xMax === "parse_error" || evaluation.etendue === "parse_error" || evaluation.mode === "parse_error")
      ? "parse_error"
      : undefined;

  return (
    <div>
      <EnonceMediane exercice={exercice} />
      <p className="prompt-text">{consigneSynthese(exercice)}</p>

      <div className="tf-table-scroll">
        <table className="tf-table">
          <thead>
            <tr>
              <th>Classe</th>
              <th>
                Effectif <Katex expression={LABEL_EFFECTIF_NI} />
              </th>
              <th>
                Effectif cumulé <Katex expression={LABEL_EFFECTIF_CUMULE_VI} />
              </th>
            </tr>
          </thead>
          <tbody>
            {exercice.classes.map((classe, index) => (
              <tr key={index}>
                <td>{formatClasseTexte(exercice, index)}</td>
                <td>{classe.effectif}</td>
                <td>{classe.effectifCumule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="synthese-xmin">
            <Katex expression={LABEL_X_MIN} /> =
          </label>
          <input
            id="synthese-xmin"
            className={`text-input${evaluation && evaluation.xMin !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_XMIN}
            value={xMin}
            onChange={(e) => setXMin(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="synthese-xmax">
            <Katex expression={LABEL_X_MAX} /> =
          </label>
          <input
            id="synthese-xmax"
            className={`text-input${evaluation && evaluation.xMax !== "correct" ? " is-erronee" : ""}`}
            placeholder={PLACEHOLDER_XMAX}
            value={xMax}
            onChange={(e) => setXMax(filtrerSaisieNumerique(e.target.value))}
            onKeyDown={gererKeyDownNumerique}
          />
        </div>
      </div>
      <div className="field field-inline">
        <label className="field-label" htmlFor="synthese-etendue">
          Étendue =
        </label>
        <input
          id="synthese-etendue"
          className={`text-input${evaluation && evaluation.etendue !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_ETENDUE}
          value={etendue}
          onChange={(e) => setEtendue(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      <p className="field-label">Classe modale</p>
      <div className="options-grid-compact">
        {exercice.classes.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`btn${classeModale === index ? " toggle-active" : ""}${evaluation && !evaluation.classeModale && classeModale === index ? " is-erronee" : ""}`}
            onClick={() => setClasseModale(index)}
          >
            {formatClasseTexte(exercice, index)}
          </button>
        ))}
      </div>

      <div className="field field-inline">
        <label className="field-label" htmlFor="synthese-mode">
          Mode =
        </label>
        <input
          id="synthese-mode"
          className={`text-input${evaluation && evaluation.mode !== "correct" ? " is-erronee" : ""}`}
          placeholder={PLACEHOLDER_MODE}
          value={mode}
          onChange={(e) => setMode(filtrerSaisieNumerique(e.target.value))}
          onKeyDown={gererKeyDownNumerique}
        />
      </div>

      {niveauAide >= 1 && (
        <div className="triangle-quelconque-aide">
          <p>
            {TEXTE_AIDE_SYNTHESE_1_AVANT} <Katex expression={LABEL_X_MIN} /> {TEXTE_AIDE_SYNTHESE_1_ENTRE_1}{" "}
            <Katex expression={LABEL_X_MAX} /> {TEXTE_AIDE_SYNTHESE_1_ENTRE_2} <Katex expression={LABEL_X_MAX} /> {TEXTE_AIDE_SYNTHESE_1_ENTRE_3}{" "}
            <Katex expression={LABEL_X_MIN} />
            {TEXTE_AIDE_SYNTHESE_1_APRES}
          </p>
          {niveauAide >= 2 && <p>{texteAideSyntheseNiveau2(exercice)}</p>}
        </div>
      )}
      <button type="button" className="btn btn-aide" disabled={niveauAide >= NIVEAU_AIDE_MAX_SYNTHESE} onClick={onActiverAide}>
        {libelleBoutonAide(niveauAide, NIVEAU_AIDE_MAX_SYNTHESE)}
      </button>

      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider({ xMin, xMax, etendue, classeModale: classeModale as number, mode })}
      >
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
