import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { ReponseBornes } from "../moteur5e/sessionModelisationSinusoide";
import { consignePhaseFragments, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { FragmentsConsigneSinusoide } from "./FragmentsConsigneSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesModelisation, messageCibleBornesU } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { diagnostiquerNombre } from "../moteur5e/verificationModelisationSinusoide";

type PhaseBornes = "resoudreUInequation" | "isolerTInequation";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  phase: PhaseBornes;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseBornes) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error), même motif que 5gen2 (A.1) — voir
   * `EtapeChampSimpleModelisation.tsx` pour la documentation complète. */
  diagnostiquer?: (reponse: ReponseBornes) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran à 2 champs (borne inf/sup) — réutilisé par "resoudreUInequation" (bornes en u) et
 * "isolerTInequation" (bornes en t). Sur "resoudreUInequation" uniquement, l'aide niveau 2 illustre
 * l'arc solution directement sur le cercle trigonométrique (mode "arc ombré", nouveau pour 5gen13) —
 * même convention que 5gen10/5gen11 ("aide 2 place le point/la valeur réelle à titre d'exemple"). */
export function EtapeBornes({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  if (exercice.phase2 === null || exercice.phase2.type !== "inequation") throw new Error("EtapeBornes : phase2 hors type 'inequation'");
  const question = exercice.phase2;
  const [inf, setInf] = useState("");
  const [sup, setSup] = useState("");
  const saisie = useTentativeLisible<ReponseBornes>();
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = inf.trim() !== "" && sup.trim() !== "";
  /** Bornes inf/sup diagnostiquées INDÉPENDAMMENT (`diagnostiquerNombre` réutilisée directement,
   * même logique que `diagnostiquerResoudreUInequation`/`diagnostiquerIsolerTInequation`, qui
   * combinent ces 2 mêmes appels — voir A.2). */
  const cibleInf = phase === "resoudreUInequation" ? question.borneInfU : question.borneInfT;
  const cibleSup = phase === "resoudreUInequation" ? question.borneSupU : question.borneSupT;
  const infErronee = (saisie.illisible || montrerErreurs) && diagnostiquerNombre(inf, cibleInf) !== "correct";
  const supErronee = (saisie.illisible || montrerErreurs) && diagnostiquerNombre(sup, cibleSup) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { inf, sup };
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(reponse, estLisible(diagnostiquer?.(reponse)), onValider);
  }

  return (
    <div>
      <p className="prompt-text"><FragmentsConsigneSinusoide fragments={consignePhaseFragments(exercice, phase)} /></p>
      <div className="field-row">
        <div>
          <ApercuExpressionLatex texte={inf} label={phase === "resoudreUInequation" ? "u_inf =" : "t_inf ="} />
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">{phase === "resoudreUInequation" ? "u_inf =" : "t_inf ="}</label>
            <input type="text" className={`text-input${infErronee ? " is-erronee" : ""}`} value={inf} onChange={(e) => setInf(e.target.value)} />
          </div>
        </div>
        <div>
          <ApercuExpressionLatex texte={sup} label={phase === "resoudreUInequation" ? "u_sup =" : "t_sup ="} />
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">{phase === "resoudreUInequation" ? "u_sup =" : "t_sup ="}</label>
            <input type="text" className={`text-input${supErronee ? " is-erronee" : ""}`} value={sup} onChange={(e) => setSup(e.target.value)} />
          </div>
        </div>
      </div>
      <AidesTrig niveauAide={niveauAide} aides={aidesModelisation(exercice, phase, texteAideNiveau2(exercice, phase))} />
      {niveauAide >= 2 && phase === "resoudreUInequation" && <CercleTrigEquationSketch points={[]} regime="decimal" arcOmbre={{ debut: question.borneInfU, fin: question.borneSupU }} />}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="intervalles"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? (phase === "resoudreUInequation" ? messageCibleBornesU(exercice, saisie.soumise) : null) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
