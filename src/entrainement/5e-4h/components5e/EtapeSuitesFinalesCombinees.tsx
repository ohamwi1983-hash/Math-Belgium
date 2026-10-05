import { useState } from "react";
import type { ExerciceSuitesCombinees } from "../core5e/suitesClassiques.types";
import { LABELS_SUITE_ARITHMETIQUE_COMBINEE, LABELS_SUITE_GEOMETRIQUE_COMBINEE, consigneGenerale, consignePhase, formatTermesDonneesLatex, texteAideNiveau1 } from "../ui5e/formatSuiteClassique";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteClassique } from "./EtatActuelSuiteClassique";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceSuitesCombinees;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: { arithmetique: string[]; geometrique: string[] }) => void;
  /** Statut à 3 valeurs — voir `EtapeChampSimpleClassique.tsx`, même motif (A.1). */
  diagnostiquer?: (reponse: { arithmetique: string[]; geometrique: string[] }) => StatutVerification;
  /** Statut à 3 valeurs d'UN SEUL champ (A.2 — highlight rouge indépendant par champ). */
  diagnostiquerChamp?: (groupe: "arithmetique" | "geometrique", index: number, texte: string) => StatutVerification;
}

/** Écran bespoke à 2 GROUPES de 3 champs (suite arithmétique 6,y,z puis suite géométrique y,x,z) —
 * seul écran de 5gen17 qui ne rentre pas dans le patron "liste plate" générique. */
export function EtapeSuitesFinalesCombinees({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, diagnostiquerChamp }: Props) {
  const [arithmetique, setArithmetique] = useState<string[]>(["6", "", ""]);
  const [geometrique, setGeometrique] = useState<string[]>(["", "", ""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = arithmetique.every((v) => v.trim() !== "") && geometrique.every((v) => v.trim() !== "");

  const apresEchec = tentativesUtilisees > 0;
  function champErronee(groupe: "arithmetique" | "geometrique", i: number): boolean {
    const valeur = groupe === "arithmetique" ? arithmetique[i] : geometrique[i];
    return apresEchec && !!diagnostiquerChamp && diagnostiquerChamp(groupe, i, valeur) !== "correct";
  }

  function valider() {
    if (!complet) return;
    const reponse = { arithmetique, geometrique };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice, "suitesFinalesCombinees").map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <EtatActuelSuiteClassique exercice={exercice} phase="suitesFinalesCombinees" />
      <p className="prompt-text">{consignePhase(exercice, "suitesFinalesCombinees")}</p>

      <p>Suite arithmétique :</p>
      {LABELS_SUITE_ARITHMETIQUE_COMBINEE.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${champErronee("arithmetique", i) ? " is-erronee" : ""}`}
            value={arithmetique[i]}
            disabled={i === 0}
            onChange={(e) => setArithmetique((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
          />
        </div>
      ))}

      <p>Suite géométrique :</p>
      {LABELS_SUITE_GEOMETRIQUE_COMBINEE.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input
            type="text"
            className={`text-input${champErronee("geometrique", i) ? " is-erronee" : ""}`}
            value={geometrique[i]}
            onChange={(e) => setGeometrique((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
          />
        </div>
      ))}

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
          <Katex expression={texteAideNiveau1(exercice, "suitesFinalesCombinees")} block />
        </div>
      )}
    </div>
  );
}
