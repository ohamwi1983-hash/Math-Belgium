import { useState } from "react";
import type { ExerciceProduitFacteurs } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_SEPARER_FACTEURS, TEXTE_AIDE_SEPARER_FACTEURS_NIVEAU1, formatEnonceProduitLatex, formatTermesEtatActuelProduit } from "../ui5e/formatEquationTrigonometrique";
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
  onValider: (lignes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (lignes: string[]) => StatutVerification;
}

/** Bloc "état actuel" — rappelle la factorisation déjà confirmée à l'écran "prefacteur" (sousCas
 * "nonFactoree" uniquement — pour "factoree", cet écran est le tout premier de la famille, rien à
 * rappeler, `formatTermesEtatActuelProduit` retourne alors `[]`). */
function EtatActuelProduit({
  exercice,
  phase,
}: {
  exercice: ExerciceProduitFacteurs;
  phase: "separerFacteurs" | "argumentProduit" | "isolerXProduit" | "solutionsProduit";
}) {
  const termes = formatTermesEtatActuelProduit(exercice, phase);
  if (termes.length === 0) return null;
  return (
    <div className="etat-actuel-box etat-actuel-box-termes">
      {termes.map((t, i) => (
        <Katex key={i} expression={t} />
      ))}
    </div>
  );
}

/** Écran "séparer en 2 équations" (famille "produit") — EXACTEMENT 2 champs (un produit à 2
 * facteurs, jamais add-as-needed), ordre indifférent côté vérification. */
export function EtapeSepararFacteursProduit({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [ligne1, setLigne1] = useState("");
  const [ligne2, setLigne2] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = ligne1.trim() !== "" && ligne2.trim() !== "";
  // Ordre indifférent côté vérification (échange autorisé) — les 2 champs ne peuvent pas être
  // diagnostiqués séparément, un même statut combiné s'applique aux 2.
  const lignesErronee = montrerErreurs && !!diagnostiquer && complet && diagnostiquer([ligne1, ligne2]) !== "correct";

  function valider() {
    if (!complet) return;
    const lignes = [ligne1, ligne2];
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_EQUATION_TRIG}</p>
      <div className="equation-box equation-box-termes">
        {decouperEquationLongueLatex(formatEnonceProduitLatex(exercice)).map((morceau, i) => (
          <Katex key={i} expression={morceau} />
        ))}
      </div>
      <EtatActuelProduit exercice={exercice} phase="separerFacteurs" />
      <p className="prompt-text">{CONSIGNE_SEPARER_FACTEURS}</p>
      <ApercuExpressionLatex texte={ligne1} label="Équation 1" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Équation 1</label>
        <input type="text" className={`text-input${lignesErronee ? " is-erronee" : ""}`} value={ligne1} onChange={(e) => setLigne1(e.target.value)} placeholder="ex : tan(x)=0" />
      </div>
      <ApercuExpressionLatex texte={ligne2} label="Équation 2" />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">Équation 2</label>
        <input type="text" className={`text-input${lignesErronee ? " is-erronee" : ""}`} value={ligne2} onChange={(e) => setLigne2(e.target.value)} placeholder="ex : tan(x)=1/2" />
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
          <p>{TEXTE_AIDE_SEPARER_FACTEURS_NIVEAU1}</p>
        </div>
      )}
    </div>
  );
}
