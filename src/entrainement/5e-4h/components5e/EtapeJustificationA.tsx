import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import { diagnostiquerJustificationA, type ReponseJustificationA } from "../moteur5e/verificationProblemesContexte";
import { consigneJustificationA, texteCorrectionJustificationA } from "../ui5e/formatProblemesContexte";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { TexteRiche5e } from "./TexteRiche5e";
import { normaliserSigneMoins } from "../../../lib/normaliserSaisie";
import { PiedEcranFonctions } from "./PiedEcranFonctions";
import { aidesContexte, cibleContexte, illisibleContexte, lireNombre5e, texteIllisibleContexte } from "../ui5e/aidesProblemesContexte";

interface Props {
  exercice: ExerciceScenarioAConteneur;
  /** Bloc "données" persistant (contexte du scénario A) — rendu AVANT la question spécifique de
   * l'écran (convention transversale : données -> question, jamais l'inverse). */
  donnees: ReactNode;
  xOptimalRetenu: number;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseJustificationA) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Champ h vérifié par tolérance (mécanisme habituel, retry) — le champ "justification" en texte
 * libre a été retiré entièrement (D.1, `promptcorrectionsround2.md`) : la correction de référence
 * s'affiche dès la première soumission, indépendamment du résultat sur h, et fait désormais office
 * d'explication (l'élève n'en rédige plus). */
export function EtapeJustificationA({ exercice, donnees, xOptimalRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, validation}: Props) {
  const [h, setH] = useState("");
  const [aSoumis, setASoumis] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const [illisible, setIllisible] = useState(false);
  const [soumise, setSoumise] = useState<unknown>(null);
  const complet = h.trim() !== "";
  const hErronee = montrerErreurs && complet && diagnostiquerJustificationA(exercice, xOptimalRetenu, { h: lireNombre5e(h) }) !== "correct";

  function valider() {
    if (!complet) return;
    setASoumis(true);
    const reponseSoumise = { h: lireNombre5e(h) };
    // Saisie illisible : message, rien n'est transmis (aucune tentative — audit 5e ch. 1, lot B).
    if (illisibleContexte("justification", exercice, reponseSoumise)) {
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
      <p className="prompt-text"><TexteRiche5e texte={consigneJustificationA()} /></p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">h ≈</label>
        <input type="text" className={`text-input${hErronee ? " is-erronee" : ""}`} value={h} onChange={(e) => setH(normaliserSigneMoins(e.target.value))} />
      </div>
      <PiedEcranFonctions
        aides={aidesContexte("justification", exercice, { xOptimalRetenu })}
        niveauAide={niveauAide}
        niveauAideMax={niveauAideMax}
        onActiverAide={onActiverAide}
        onValider={valider}
        vide={!complet}
        illisible={illisible}
        texteIllisible={texteIllisibleContexte("justification")}
        tentativesUtilisees={tentativesUtilisees}
        tentativesMax={tentativesMax}
        cible={soumise !== null && montrerErreurs ? cibleContexte("justification", exercice, soumise, { xOptimalRetenu }) : null}
        validation={validation}
      />
      {validation && aSoumis && (
        <div className="aide-5e">
          <p><TexteRiche5e texte={texteCorrectionJustificationA(exercice, xOptimalRetenu)} /></p>
        </div>
      )}
    </div>
  );
}
