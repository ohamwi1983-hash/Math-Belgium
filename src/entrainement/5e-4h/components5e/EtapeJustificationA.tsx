import { useState } from "react";
import type { ReactNode } from "react";
import type { ExerciceScenarioAConteneur } from "../core5e/problemesContexte.types";
import { diagnostiquerJustificationA, type ReponseJustificationA } from "../moteur5e/verificationProblemesContexte";
import { TEXTE_AIDE_JUSTIFICATION_A_1, consigneJustificationA, formatTermesEtatActuelA, texteCorrectionJustificationA } from "../ui5e/formatProblemesContexte";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";

function EtatActuelA({ exercice, xOptimalRetenu }: { exercice: ExerciceScenarioAConteneur; xOptimalRetenu: number }) {
  const termes = formatTermesEtatActuelA(exercice, "justification", xOptimalRetenu);
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

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
}

/** Champ h vérifié par tolérance (mécanisme habituel, retry) — le champ "justification" en texte
 * libre a été retiré entièrement (D.1, `promptcorrectionsround2.md`) : la correction de référence
 * s'affiche dès la première soumission, indépendamment du résultat sur h, et fait désormais office
 * d'explication (l'élève n'en rédige plus). */
export function EtapeJustificationA({ exercice, donnees, xOptimalRetenu, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider }: Props) {
  const [h, setH] = useState("");
  const [aSoumis, setASoumis] = useState(false);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = h.trim() !== "";
  const hErronee = montrerErreurs && complet && diagnostiquerJustificationA(exercice, xOptimalRetenu, { h: Number(h.replace(",", ".")) }) !== "correct";

  function valider() {
    if (!complet) return;
    setASoumis(true);
    onValider({ h: Number(h.replace(",", ".")) });
  }

  return (
    <div>
      {donnees}
      <EtatActuelA exercice={exercice} xOptimalRetenu={xOptimalRetenu} />
      <p className="prompt-text">{consigneJustificationA()}</p>
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">h ≈</label>
        <input type="text" className={`text-input${hErronee ? " is-erronee" : ""}`} value={h} onChange={(e) => setH(e.target.value.replace(/[^0-9.,-]/g, ""))} />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
      {aSoumis && (
        <div className="aide-5e">
          <p>{texteCorrectionJustificationA(exercice, xOptimalRetenu)}</p>
        </div>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_JUSTIFICATION_A_1}</p>
        </div>
      )}
    </div>
  );
}
