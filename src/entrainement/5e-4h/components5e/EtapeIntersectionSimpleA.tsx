import { useState } from "react";
import type { ReactNode } from "react";
import { diagnostiquerIntersectionSimpleA } from "../moteur5e/verificationProblemesContexte";
import { consigneIntersectionSimpleA } from "../ui5e/formatProblemesContexte";
import type { ExerciceScenarioAReduit } from "../ui5e/scenarioAGraphReduit";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteRiche5e } from "./TexteRiche5e";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, lireNombre5e, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

interface Props {
  exercice: ExerciceScenarioAReduit;
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: number) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeIntersectionSimpleA({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [valeur, setValeur] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const valeurErronee = montrerErreurs && valeur.trim() !== "" && diagnostiquerIntersectionSimpleA(exercice, lireNombre5e(valeur)) !== "correct";

  function valider() {
    if (valeur.trim() === "") return;
    const reponseSoumise = lireNombre5e(valeur);
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("intersectionSimple", exercice, reponseSoumise)) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    setSoumise(reponseSoumise);
    onValider(reponseSoumise);
  }

  return (
    <div>
      {donnees}
      <p className="prompt-text"><TexteRiche5e texte={consigneIntersectionSimpleA()} /></p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">x =</label>
        <input
          type="text"
          className={`text-input${valeurErronee ? " is-erronee" : ""}`}
          value={valeur}
          onChange={(e) => setValeur(normaliserSigneMoins(e.target.value))}
        />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("intersectionSimple", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={valeur.trim() === ""}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("intersectionSimple")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("intersectionSimple", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
