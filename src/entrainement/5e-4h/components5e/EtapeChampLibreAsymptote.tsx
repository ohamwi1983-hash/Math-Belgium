import { useState } from "react";
import type { ExerciceAsymptoteOblique } from "../core5e/asymptoteOblique.types";
import { consigneGenerale, consignePhase, formatFormulePhaseLatex, formatTermesDonneesLatex, labelPhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatAsymptoteOblique";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelAsymptoteOblique } from "./EtatActuelAsymptoteOblique";
import { CalculatriceScientifique } from "./CalculatriceScientifique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceAsymptoteOblique;
  phase: "ecrireFormeDeveloppee" | "calculerCoefficientA" | "calculerCoefficientB" | "conclureEquationAsymptote";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  placeholder: string;
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran à UN SEUL champ texte libre, réutilisé par 4 des 5 phases de 5gen21 (le placeholder varie
 * selon l'appelant, `App5gen21.tsx`). `key={phase}` obligatoire côté appelant (React réutiliserait
 * sinon la même instance entre deux écrans, gardant la réponse précédente). Les 2 écrans de la
 * variante "viaLimites" affichent, en plus de la consigne, la formule LaTeX de la limite à calculer
 * (`formatFormulePhaseLatex`) — mode DISPLAY (`block`) obligatoire, notation de limite déjà corrigée
 * sur 5gen20. */
export function EtapeChampLibreAsymptote({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, placeholder, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const aide2 = texteAideNiveau2(phase);
  const formule = formatFormulePhaseLatex(phase);

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale()}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelAsymptoteOblique exercice={exercice} phase={phase} />
      <p className="prompt-text">{consignePhase(exercice, phase)}</p>
      {formule !== "" && (
        <div className="equation-box">
          <Katex expression={formule} block />
        </div>
      )}
      <ApercuExpressionLatex texte={texte} label={labelPhase(phase)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelPhase(phase)} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={placeholder}
        />
      </div>
      <CalculatriceScientifique />
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
          <p>{texteAideNiveau1(phase)}</p>
          {niveauAide >= 2 && <p>{aide2}</p>}
        </div>
      )}
    </div>
  );
}
