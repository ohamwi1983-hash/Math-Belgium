import { useState } from "react";
import type { ExercicePolygonesArcsSecteurs } from "../core5e/polygonesArcsSecteurs.types";
import type { PhasePolygonesArcsSecteurs } from "../moteur5e/typesPolygonesArcsSecteurs";
import { consignePhase, surlignagePourPhase } from "../ui5e/formatPolygonesArcsSecteurs";
import { aidesPolygone, messageCiblePolygone } from "../ui5e/aidesTrigonometrie";
import { cibleEcranUnChamp } from "../moteur5e/verificationPolygonesArcsSecteurs";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import { PolygoneCercleSketch } from "./PolygoneCercleSketch";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExercicePolygonesArcsSecteurs;
  phase: Exclude<PhasePolygonesArcsSecteurs, "cercleEntier">;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs calculé côté présentation (promptcorrectionsregroupees.md, A.1), jamais
   * consommé par le score — optionnel, comportement générique inchangé sans lui. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Réutilisé pour les 4 écrans à un seul champ (arcElementaire/arcMultiPas/secteurElementaire/
 * secteurMultiPas) — seuls consigne de phase/surlignage/aides changent selon `phase`. Ordre des
 * blocs : consigne générale (intègre r/n, pas de bloc de données séparé) → consigne de phase +
 * diagramme + champ. Les écrans déjà clos sont désormais présentés par `RecapitulatifPanel`
 * (`App5gen7.tsx`, `ui5e/recapitulatifPolygonesArcsSecteurs.ts`), plus l'ancien bloc "état actuel"
 * local (`segmentsEtatActuelPolygone`, retiré ici — doublon visuel). */
export function EtapeEcranUnChampPolygone({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = saisie.illisible || (montrerErreurs && !!diagnostiquer && diagnostiquer(texte) !== "correct");

  /** Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée). */
  function valider() {
    if (texte.trim() === "") return;
    saisie.tenter(texte, estLisible(diagnostiquer?.(texte)), onValider);
  }

  return (
    <div>
      <p className="prompt-text">{consignePhase(phase)}</p>
      <PolygoneCercleSketch r={exercice.r} n={exercice.n} surlignage={surlignagePourPhase(exercice, phase)} />
      <ApercuExpressionLatex texte={texte} />
      <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 7π/11" />
      <AidesTrig niveauAide={niveauAide} aides={aidesPolygone(exercice, phase)} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ={phase === "arcElementaire" || phase === "arcMultiPas" ? "longueur" : "aire"}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCiblePolygone(saisie.soumise, exercice, phase, cibleEcranUnChamp(exercice, phase)) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
