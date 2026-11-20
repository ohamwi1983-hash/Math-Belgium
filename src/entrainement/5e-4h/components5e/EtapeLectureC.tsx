import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioC } from "../core5e/problemesContexte.types";
import { diagnostiquerCtLectureC, type ReponseLectureC } from "../moteur5e/verificationProblemesContexte";
import { consigneContexteC, consigneLectureC } from "../ui5e/formatProblemesContexte";
import { TexteRiche5e } from "./TexteRiche5e";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, lireNombre5e, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

interface Props {
  exercice: ExerciceScenarioC;
  /** Bloc "données" persistant (tableau de valeurs du scénario C) — rendu AVANT la question. */
  donnees: ReactNode;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseLectureC) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 1 du scénario C (audit 5e ch. 1) : CT(xLecture) calculé à partir du TABLEAU de valeurs
 * (affiché dans `donnees`) — plus de lecture graphique de CF/CV/CP au demi-millier près. */
export function EtapeLectureC({ exercice, donnees, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [ct, setCt] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = ct.trim() !== "";
  const ctErronee = montrerErreurs && complet && diagnostiquerCtLectureC(exercice, lireNombre5e(ct)) !== "correct";

  function valider() {
    if (!complet) return;
    const reponseSoumise = { ct: lireNombre5e(ct) };
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("lecture", exercice, reponseSoumise)) {
      setIllisible(true);
      return;
    }
    setIllisible(false);
    setSoumise(reponseSoumise);
    onValider(reponseSoumise);
  }

  return (
    <div>
      <EnTeteExercice consigneGenerale={<TexteRiche5e texte={consigneContexteC(exercice)} />} blocDonnees={donnees} />
      <p className="prompt-text">
        <TexteRiche5e texte={consigneLectureC(exercice)} />
      </p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">CT({exercice.xLecture}) =</label>
        <input type="text" className={`text-input${ctErronee ? " is-erronee" : ""}`} value={ct} onChange={(e) => setCt(normaliserSigneMoins(e.target.value))} />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("lecture", exercice, {})}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("lecture")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("lecture", exercice, soumise, {}) : null}
        validation={validation}
      />
    </div>
  );
}
