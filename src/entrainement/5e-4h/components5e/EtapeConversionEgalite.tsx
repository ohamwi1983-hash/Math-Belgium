import { useState } from "react";
import type { ExerciceEgaliteExpressions } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_CONVERSION_EGALITE, formatEnonceEgaliteLatex, texteAideConversionEgaliteNiveau1 } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEgaliteExpressions;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran 1 (famille "egalite") — convertir UN membre pour aligner les 2 côtés sur la même fonction,
 * champ de texte libre. */
export function EtapeConversionEgalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = montrerErreurs && !!diagnostiquer && diagnostiquer(texte) !== "correct";
  const complet = texte.trim() !== "";

  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box">
        <Katex expression={formatEnonceEgaliteLatex(exercice)} block />
      </div>
      <p className="prompt-text">{CONSIGNE_CONVERSION_EGALITE}</p>
      <ApercuExpressionLatex texte={texte} />
      <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : cos(pi/2-x-pi/4)" />
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
          <p>{texteAideConversionEgaliteNiveau1(exercice)}</p>
        </div>
      )}
    </div>
  );
}
