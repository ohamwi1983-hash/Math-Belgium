import { useState } from "react";
import type { ExerciceExtremaBornes } from "../core5e/extremaBornes.types";
import { consigneEcranExtremaBornes, texteAideNiveau1ExtremaBornes, texteAideNiveau2ExtremaBornes } from "../ui5e/formatExtremaBornes";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EnonceExtremaBornes } from "./EnonceExtremaBornes";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceExtremaBornes;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran "deriver" — champ symbolique unique f'(t), même patron que
 * `EtapeCalculerFonctionDerivee.tsx` (5gen27) mais réécrit localement (contrat propre à ce
 * générateur). Jamais de calculatrice : f(t) est une fonction polynomiale à coefficients entiers,
 * dérivation purement symbolique/exacte. */
export function EtapeDeriverExtremaBornes({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const texteErronee = apresEchec && !!diagnostiquer && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <EnonceExtremaBornes exercice={exercice} phase="deriver" />
      <p className="prompt-text">{consigneEcranExtremaBornes("deriver")}</p>
      <ApercuExpressionLatex texte={texte} label="f'(t)=" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression="f'(t)=" />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : 3*t^2-6*t"
        />
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
          <p>{texteAideNiveau1ExtremaBornes("deriver")}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2ExtremaBornes("deriver")}</p>}
        </div>
      )}
    </div>
  );
}
