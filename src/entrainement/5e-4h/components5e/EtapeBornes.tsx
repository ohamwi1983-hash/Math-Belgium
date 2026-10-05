import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { ReponseBornes } from "../moteur5e/sessionModelisationSinusoide";
import { consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { CercleTrigEquationSketch } from "./CercleTrigEquationSketch";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
import { formatMessageErreur } from "../ui/messageErreur";
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
}

/** Écran à 2 champs (borne inf/sup) — réutilisé par "resoudreUInequation" (bornes en u) et
 * "isolerTInequation" (bornes en t). Sur "resoudreUInequation" uniquement, l'aide niveau 2 illustre
 * l'arc solution directement sur le cercle trigonométrique (mode "arc ombré", nouveau pour 5gen13) —
 * même convention que 5gen10/5gen11 ("aide 2 place le point/la valeur réelle à titre d'exemple"). */
export function EtapeBornes({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  if (exercice.phase2 === null || exercice.phase2.type !== "inequation") throw new Error("EtapeBornes : phase2 hors type 'inequation'");
  const question = exercice.phase2;
  const [inf, setInf] = useState("");
  const [sup, setSup] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = inf.trim() !== "" && sup.trim() !== "";
  const apresEchec = tentativesUtilisees > 0;
  /** Bornes inf/sup diagnostiquées INDÉPENDAMMENT (`diagnostiquerNombre` réutilisée directement,
   * même logique que `diagnostiquerResoudreUInequation`/`diagnostiquerIsolerTInequation`, qui
   * combinent ces 2 mêmes appels — voir A.2). */
  const cibleInf = phase === "resoudreUInequation" ? question.borneInfU : question.borneInfT;
  const cibleSup = phase === "resoudreUInequation" ? question.borneSupU : question.borneSupT;
  const infErronee = apresEchec && diagnostiquerNombre(inf, cibleInf) !== "correct";
  const supErronee = apresEchec && diagnostiquerNombre(sup, cibleSup) !== "correct";

  function valider() {
    if (!complet) return;
    const reponse = { inf, sup };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
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
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{texteAideNiveau1(exercice, phase)}</p>
          {niveauAide >= 2 && phase === "resoudreUInequation" && (
            <>
              <Katex expression={texteAideNiveau2(exercice, phase)} block />
              <CercleTrigEquationSketch points={[]} regime="decimal" arcOmbre={{ debut: question.borneInfU, fin: question.borneSupU }} />
            </>
          )}
          {niveauAide >= 2 && phase === "isolerTInequation" && <Katex expression={texteAideNiveau2(exercice, phase)} block />}
        </div>
      )}
    </div>
  );
}
