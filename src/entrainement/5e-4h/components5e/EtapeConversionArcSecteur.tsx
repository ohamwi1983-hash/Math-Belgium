import { useState } from "react";
import type { ExerciceModeConversion } from "../core5e/arcsSecteurs.types";
import { TEXTE_AIDE_CONVERSION_NIVEAU1, consigneConversion, labelReponseConversion, latexAideConversionNiveau2, latexEnonceConversion } from "../ui5e/formatArcsSecteurs";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceModeConversion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs calculé côté présentation (promptcorrectionsregroupees.md, A.1), jamais
   * consommé par le score — optionnel, comportement générique inchangé sans lui. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

export function EtapeConversionArcSecteur({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneConversion(exercice)}</p>
      <div className="equation-box">
        <Katex expression={latexEnonceConversion(exercice)} />
      </div>
      <ApercuExpressionLatex texte={texte} label={labelReponseConversion(exercice)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelReponseConversion(exercice)}</label>
        <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 5*pi/6 ou 2.62" />
      </div>
      <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
      <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
        Valider
      </button>
      {montrerErreurs && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
        </p>
      )}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <Katex expression={TEXTE_AIDE_CONVERSION_NIVEAU1} block />
          {niveauAide >= 2 && <Katex expression={latexAideConversionNiveau2(exercice)} block />}
        </div>
      )}
    </div>
  );
}
