// Copie 5e (6h) de `5e-4h/components5e/EtapeTermesSuccessifs.tsx` (56gen12 ← 5gen19, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ExerciceSuiteRecurrenteAffine } from "../../../../5e-4h/core5e/suiteRecurrenteAffine.types";
import { consigneTermesSuccessifs, texteAideNiveau1, texteAideNiveau2 } from "../ui/formatSuiteRecurrenteAffine";
import { Katex } from "../../../../5e-4h/components/Katex";
import { ValidationEcran } from "../../../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../../../components/ValidationEcran";
import { BoutonAide } from "../../../../5e-4h/components5e/BoutonAide";
import { formatMessageErreur } from "../../../../5e-4h/ui/messageErreur";
import type { StatutVerification } from "../../../../5e-4h/moteur/statutVerification";
import { TexteInsistance } from "../../../../components/TexteInsistance";

interface Props {
  exercice: ExerciceSuiteRecurrenteAffine;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  /** Statut à 3 valeurs — voir `EtapePoserRecurrence.tsx`, même motif (A.1). */
  diagnostiquer?: (textes: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran bonus (spec : "optionnel") — construit u2/u3/u4 pour observer empiriquement la
 * convergence (ou la divergence) vers/loin du régime permanent. Simplification assumée : 3 champs
 * FIXES plutôt que l'add-as-needed suggéré par la spec — même mécanique de compétence (appliquer
 * la récurrence pas à pas), format déjà établi ailleurs sur la plateforme (ex. 5gen17 `dixTermes`). */
export function EtapeTermesSuccessifs({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [valeurs, setValeurs] = useState(["", "", ""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = valeurs.every((v) => v.trim() !== "");
  const aide1 = texteAideNiveau1(exercice, "termesSuccessifs");
  const aide2 = texteAideNiveau2(exercice, "termesSuccessifs");
  const labels = [`${exercice.variableGrandeur}_2=`, `${exercice.variableGrandeur}_3=`, `${exercice.variableGrandeur}_4=`];

  function modifier(i: number, valeur: string) {
    setValeurs((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(valeurs));
    onValider(valeurs);
  }

  return (
    <div>
      <p className="prompt-text">{consigneTermesSuccessifs(exercice)}</p>
      {labels.map((label, i) => (
        <div key={i} className="field field-inline">
          <label className="field-label field-label-minuscule">
            <Katex expression={label} />
          </label>
          <input type="text" style={{ minHeight: 44 }} className="text-input" value={valeurs[i]} onChange={(e) => modifier(i, e.target.value)} />
        </div>
      ))}
      {niveauAide >= 1 && (
        <div className="aide-5e">
          <p><TexteInsistance texte={aide1.texte} /></p>
          {aide1.latex.length > 0 && <Katex expression={aide1.latex} block />}
          {niveauAide >= 2 && aide2.texte.length > 0 && <p><TexteInsistance texte={aide2.texte} /></p>}
          {niveauAide >= 2 && aide2.latex.length > 0 && <Katex expression={aide2.latex} block />}
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        {montrerErreurs && (
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
