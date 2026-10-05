import { useState } from "react";
import type { ExerciceEtudierFonction } from "../core5e/etudierFonction.types";
import type { EcranEtudierFonction } from "../moteur5e/typesEtudierFonction";
import type { StatutVerification } from "../moteur/statutVerification";
import { CONSIGNE_GENERALE_ETUDIER_FONCTION, consigneEcranEtudierFonction, formatTermesDonneesLatex, questionFinaleEtudierFonction, texteAideNiveau1EtudierFonction, texteAideNiveau2EtudierFonction } from "../ui5e/formatEtudierFonction";
import { Katex } from "../components/Katex";
import { QuestionFinale } from "../components/QuestionFinale";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelEtudierFonction } from "./EtatActuelEtudierFonction";
import { formatMessageErreur } from "../ui/messageErreur";

interface Props {
  exercice: ExerciceEtudierFonction;
  phase: "calculerFPrime" | "calculerFSeconde";
  /** "f'(x)=" ou "f''(x)=" — label du champ de saisie. */
  labelChamp: string;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  diagnostiquer: (texte: string) => StatutVerification;
}

/**
 * Écran GÉNÉRIQUE "calculer f'(x)"/"calculer f''(x)" — technique de vérification (différence finie
 * centrée + tolérance, `diagnostiquerDeriveeGenerique`, `moteur5e/verificationEtudierFonction.ts`)
 * EXTRAITE de `EtapeCalculerFonctionDerivee.tsx`/`diagnostiquerCalculerDerivee` (5gen27), jamais
 * réutilisée telle quelle : ce composant est câblé sur `ExerciceFonctionDerivee`/`TypeDerivee`
 * (décompositions, formatage propre à 4 familles u/v) — bien trop couplé pour être adapté ici sans
 * réécriture substantielle. Le PRINCIPE (différence finie + tolérance relative) est repris
 * fidèlement, jamais réinventé — voir le rapport de tâche pour la justification complète de cet
 * écart documenté.
 */
export function EtapeCalculerDeriveeGenerique({ exercice, phase, labelChamp, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = montrerErreurs && diagnostiquer(texte) !== "correct";

  function valider() {
    if (texte.trim() === "") return;
    setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  const ecran: EcranEtudierFonction = phase;

  return (
    <div>
      <p className="prompt-text">{CONSIGNE_GENERALE_ETUDIER_FONCTION}</p>
      <div className="equation-box equation-box-donnees">
        {formatTermesDonneesLatex(exercice).map((frag, i) => (
          <Katex key={i} expression={frag} />
        ))}
      </div>
      <QuestionFinale question={questionFinaleEtudierFonction()} />
      <EtatActuelEtudierFonction exercice={exercice} phase={ecran} />
      <p className="prompt-text">{consigneEcranEtudierFonction(ecran)}</p>
      <ApercuExpressionLatex texte={texte} label={labelChamp} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={labelChamp} />
        </label>
        <input
          type="text"
          className={`text-input${texteErronee ? " is-erronee" : ""}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder="ex : 2*x+3"
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
          <p>{texteAideNiveau1EtudierFonction(ecran)}</p>
          {niveauAide >= 2 && <p>{texteAideNiveau2EtudierFonction(ecran)}</p>}
        </div>
      )}
    </div>
  );
}
