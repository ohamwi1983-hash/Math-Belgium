import { useState } from "react";
import type { ExerciceDecompositionFonction } from "../core5e/decompositionFonction.types";
import { TEXTE_AIDE_NIVEAU1, TEXTE_AIDE_NIVEAU3_AFFINE_FINALE, labelLigne, texteAideNiveau2 } from "../ui5e/formatDecompositionFonction";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceDecompositionFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (lignes: string[]) => void;
  /**
   * Statut à 3 valeurs (correct/not_equivalent/parse_error) calculé côté PRÉSENTATION uniquement,
   * pour différencier le message affiché après une tentative échouée (promptcorrectionsregroupees.md,
   * A.1) — jamais consommé par `etapeTentatives.ts`/le score, qui reste piloté par le booléen
   * historique `onValider` déclenche côté moteur. Optionnel : un appelant qui ne le fournit pas
   * garde le message générique historique.
   */
  diagnostiquer?: (lignes: string[]) => StatutVerification;
  /** Motif de refus STRUCTUREL (la chaîne reconstruit f mais ne la décompose pas : ligne unique,
   * identité, couches fusionnées — audit 5e ch. 1, décision B). Affiché sans consommer de
   * tentative : `onValider` n'est pas appelé. */
  motifStructure?: (lignes: string[]) => string | null;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran unique de 5gen2 — add-as-needed : une ligne LaTeX libre par fonction intermédiaire,
 * l'élève décide lui-même combien de lignes soumettre (jamais pré-rempli au nombre de couches
 * réellement tirées à la génération). */
export function EtapeDecompositionFonction({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, motifStructure, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>(["", ""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const [messageStructure, setMessageStructure] = useState<string | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");
  /** La décomposition (toutes les lignes ensemble) forme UNE seule réponse — jamais une ligne
   * vérifiée isolément (`diagnostiquerDecomposition` juge la composition entière) — même flag
   * partagé par toutes les lignes, recalculé à chaque rendu depuis la saisie actuelle (A.2). */
  const lignesErronees = montrerErreurs && diagnostiquer !== undefined && diagnostiquer(lignes) !== "correct";

  function ajouterLigne() {
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
    setMessageStructure(null);
  }
  function valider() {
    if (!complet) return;
    const motif = motifStructure?.(lignes) ?? null;
    if (motif) {
      setMessageStructure(motif);
      return;
    }
    setMessageStructure(null);
    if (diagnostiquer) setDernierStatut(diagnostiquer(lignes));
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">Soit la fonction f ci-dessous :</p>
      <div className="equation-box">
        <Katex expression={exercice.fLatex} block />
      </div>
      <p className="prompt-text">
        Décompose f(x) en fonctions intermédiaires, de la plus intérieure (appliquée en premier) à la plus extérieure.
      </p>
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <span className="ce-slot-latex">{labelLigne(i)}</span>
            <input
              type="text"
              className={`text-input${lignesErronees ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => modifierLigne(i, e.target.value)}
              placeholder="ex : 5x+7"
            />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={ajouterLigne}>
        + Ajouter une fonction
      </button>
      <p className="prompt-text" style={{ fontSize: "0.85rem", opacity: 0.8 }}>Saisie : sqrt(…) ou √ pour la racine carrée, cbrt(…) ou ∛ pour la racine cubique, abs(…) ou |…| pour la valeur absolue, ^ pour une puissance.</p>
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p>{TEXTE_AIDE_NIVEAU1}</p>
          {niveauAide >= 2 && (
            <p>
              {texteAideNiveau2(exercice).avant}
              <Katex expression={texteAideNiveau2(exercice).latex} />
            </p>
          )}
          {niveauAide >= 3 && <p>{TEXTE_AIDE_NIVEAU3_AFFINE_FINALE}</p>}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {messageStructure && (
          <p className="alert-error" role="alert">
            {messageStructure} (Aucune tentative n'est comptée.)
          </p>
        )}
        {montrerErreurs && !messageStructure && (
          <p className="alert-error" role="alert">
            {formatMessageErreur(tentativesUtilisees, tentativesMax, dernierStatut)}
          </p>
        )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
