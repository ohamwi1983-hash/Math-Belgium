import { useState } from "react";
import type { ExerciceMedianeDiscrete } from "../core/mediane.types";
import type { ReponseQ1 } from "../moteur/verificationMediane";
import { diagnostiquerQ1 } from "../moteur/verificationMediane";
import { NIVEAU_AIDE_MAX_Q1 } from "../moteur/sessionMediane";
import { LABEL_Q1, PLACEHOLDER_Q1, PLACEHOLDER_SEUIL, consigneQ1, texteAideQ1Niveau1, texteAideQ1Niveau2 } from "../ui/formatMediane";
import { filtrerSaisieNumerique, gererKeyDownNumerique } from "../ui/bloquerSaisieNonNumerique";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { SegmentsInline } from "./SegmentsInline";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceMedianeDiscrete;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseQ1) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écran "q1" (variante "discrete" uniquement, `promptgen33modifications.md`) — même structure que
 * l'écran "mediane" (2 champs séparés : seuil n/4, Q1), calculée DIRECTEMENT sur le tableau
 * complet, indépendamment de la position de la médiane (pas de règle en cascade — divergence
 * assumée avec "Étendue et écart interquartile", gen35). Même comportement de surlignage à
 * l'Aide 2. Le tableau lui-même (identique sur les écrans "mediane"/"q1"/"q3") est centralisé
 * dans `blocDonnees` (`EnTeteExercice`, voir `AppMediane`/`AppExerciceSynthese`) — plus rendu ici.
 */
export function EtapeQ1Mediane({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation}: Props) {
  const [seuil, setSeuil] = useState("");
  const [q1, setQ1] = useState("");

  const complet = seuil.trim() !== "" && q1.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  const evaluation = apresEchec ? diagnostiquerQ1(exercice, { seuil, q1 }) : null;
  const statut = evaluation && (evaluation.seuil === "parse_error" || evaluation.q1 === "parse_error") ? "parse_error" : undefined;

  return (
    <div>
      <p className="prompt-text">{consigneQ1(exercice)}</p>

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
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_Q1} onActiverAide={onActiverAide} />

        <button type="button" className="btn btn-primary" disabled={!complet} onClick={() => onValider({ seuil, q1 })}>
          Valider
        </button>
        {tentativesUtilisees > 0 && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
