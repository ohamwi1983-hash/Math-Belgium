import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioB } from "../core5e/problemesContexte.types";
import { diagnostiquerFormuleB } from "../moteur5e/verificationProblemesContexte";
import { CONSIGNE_FORMULE_B } from "../ui5e/formatProblemesContexte";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteRiche5e } from "./TexteRiche5e";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

interface Props {
  exercice: ExerciceScenarioB;
  /** Bloc "données" persistant (contexte du scénario B) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
  donnees: ReactNode;
  /** Continuité — a/b RETENUS (voir `moteur5e/sessionProblemesContexte.ts`), affichés dans le bloc
   * "état actuel" seulement (jamais dans un placeholder du champ, voir plus bas). */
  aRetenu: number;
  bRetenu: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: string) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Jamais de placeholder construit à partir de a/b RETENUS — reviendrait à afficher la réponse
 * attendue en clair dans le champ. */
export function EtapeFormuleB({ exercice, donnees, aRetenu, bRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const texteErronee = montrerErreurs && texte.trim() !== "" && diagnostiquerFormuleB(texte, exercice.modele, aRetenu, bRetenu) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    const reponseSoumise = texte;
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("formule", exercice, reponseSoumise)) {
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
      <p className="prompt-text"><TexteRiche5e texte={CONSIGNE_FORMULE_B} /></p>
      <ApercuExpressionLatex texte={texte} label="f(x) =" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">f(x) =</label>
        <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 3*x+7" />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("formule", exercice, { aRetenu, bRetenu })}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={texte.trim() === ""}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("formule")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("formule", exercice, soumise, { aRetenu, bRetenu }) : null}
        validation={validation}
      />
    </div>
  );
}
