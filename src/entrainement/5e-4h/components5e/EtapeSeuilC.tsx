import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import { CONSIGNE_SEUIL_C, consigneContexteC } from "../ui5e/formatProblemesContexte";
import { diagnostiquerSeuilC } from "../moteur5e/verificationProblemesContexte";
import { ScenarioCGraph } from "./ScenarioCGraph";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { TexteRiche5e } from "./TexteRiche5e";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, lireNombre5e, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

interface Props {
  exercice: ExerciceScenarioC;
  /** Bloc "données" persistant (contexte du scénario C) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
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

export function EtapeSeuilC({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [valeur, setValeur] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const valeurErronee = montrerErreurs && valeur.trim() !== "" && diagnostiquerSeuilC(exercice, lireNombre5e(valeur)) !== "correct";

  function valider() {
    if (valeur.trim() === "") return;
    const reponseSoumise = lireNombre5e(valeur);
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("seuil", exercice, reponseSoumise)) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    setSoumise(reponseSoumise);
    onValider(reponseSoumise);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={<TexteRiche5e texte={consigneContexteC(exercice)} />}
        blocDonnees={
          <>
            {donnees}
            <ScenarioCGraph exercice={exercice} />
          </>
        }
      />
      <p className="prompt-text"><TexteRiche5e texte={CONSIGNE_SEUIL_C} /></p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">x ≈</label>
        <input
          type="text"
          className={`text-input${valeurErronee ? " is-erronee" : ""}`}
          value={valeur}
          onChange={(e) => setValeur(normaliserSigneMoins(e.target.value))}
        />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("seuil", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={valeur.trim() === ""}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("seuil")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("seuil", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
