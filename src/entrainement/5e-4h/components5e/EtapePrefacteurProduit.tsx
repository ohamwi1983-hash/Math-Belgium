import { useState } from "react";
import type { ExerciceProduitFacteurs } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_PREFACTEUR, TEXTE_AIDE_PREFACTEUR_NIVEAU1, formatEnonceProduitLatex } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceProduitFacteurs;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/** Écran "pré-1" (famille "produit", sous-cas "nonFactoree" uniquement) — factoriser T²-k₂T=0 par
 * mise en évidence, champ de texte libre. */
export function EtapePrefacteurProduit({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
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
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatEnonceProduitLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <p className="prompt-text">{CONSIGNE_PREFACTEUR}</p>
      <ApercuExpressionLatex texte={texte} />
      <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : tan(x)*(tan(x)-1/2)" />
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
          <p>{TEXTE_AIDE_PREFACTEUR_NIVEAU1}</p>
        </div>
      )}
    </div>
  );
}
