import { useState } from "react";
import type { ExerciceLimitesContexte, OptionInterpretation } from "../core5e/limitesContexte.types";
import type { PhaseLimitesContexte } from "../moteur5e/typesLimitesContexte";
import { consignePhaseRiche } from "../ui5e/formatLimitesContexte";
import { TexteRiche5e } from "./TexteRiche5e";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexteLimites } from "../ui5e/retoursLimitesContexte";

interface Props {
  exercice: ExerciceLimitesContexte;
  phase: PhaseLimitesContexte;
  options: OptionInterpretation[];
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (indexChoisi: number | null) => void;
  verifier: (indexChoisi: number | null) => boolean;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran QCM "interprétation"/"AV sens"/"croissance-régression" — motif du précédent 4e
 * (`EtapeInterpretationOptimisation.tsx`) : `optionsInterpretation`, phrases pré-écrites (une seule
 * correcte, ordre mélangé à la génération), jamais de saisie libre en français. */
export function EtapeQCMLimitesContexte({ exercice, phase, options, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, verifier, validation}: Props) {
  const [choix, setChoix] = useState<number | null>(null);
  const apresEchec = tentativesUtilisees > 0;
  const erronee = apresEchec && choix !== null && !verifier(choix);

  return (
    <div>
      <p className="prompt-text">
        <TexteRiche5e texte={consignePhaseRiche(exercice, phase)} />
      </p>

      <div className="options-grid">
        {options.map((option, index) => (
          <button
            key={index}
            type="button"
            className={`btn${choix === index ? " toggle-active" : ""}${erronee && choix === index ? " is-erronee" : ""}`}
            onClick={() => setChoix(index)}
          >
            {option.texte}
          </button>
        ))}
      </div>

      <CalculatriceScientifique />
      <PiedEcranFonctions
        aides={aidesContexteLimites(exercice, phase)}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={() => choix !== null && onValider(choix)}
        vide={choix === null}
        illisible={false}
        texteIllisible=""
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        validation={validation}
      />
    </div>
  );
}
