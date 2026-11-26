// Copie 5e (6h) de `5e-4h/components5e/EtapePoserRecurrence.tsx` (56gen12 ← 5gen19, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ExerciceSuiteRecurrenteAffine } from "../../../../5e-4h/core5e/suiteRecurrenteAffine.types";
import { consignePoserRecurrence, libellePoserRecurrence, texteAideNiveau1, texteAideNiveau2 } from "../ui/formatSuiteRecurrenteAffine";
import { remplacerLettreGrandeur } from "../moteur/verificationSuiteRecurrenteAffine";
import { ApercuExpressionLatex } from "../../../../5e-4h/components/ApercuExpressionLatex";
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
  onValider: (texte: string) => void;
  /**
   * Statut à 3 valeurs — calculé côté PRÉSENTATION uniquement (motif A.1, déjà prouvé sur 5gen2),
   * jamais consommé par le score/les tentatives. Optionnel : un appelant qui ne le fournit pas
   * garde le message générique historique.
   */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapePoserRecurrence({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const aide1 = texteAideNiveau1(exercice, "poserRecurrence");
  const aide2 = texteAideNiveau2(exercice, "poserRecurrence");

  function valider() {
    if (texte.trim() === "") return;
    if (diagnostiquer) setDernierStatut(diagnostiquer(texte));
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consignePoserRecurrence(exercice)}</p>
      {/* Aperçu : la lettre de la grandeur, acceptée à la saisie, est montrée comme x (variable de
          l'aperçu partagé) — jamais un aperçu qui disparaît parce que « Q » lui est inconnu. */}
      <ApercuExpressionLatex texte={remplacerLettreGrandeur(texte, exercice.variableGrandeur).replace(/\(x\)/g, "x")} label={libellePoserRecurrence(exercice)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">
          <Katex expression={`${exercice.variableGrandeur}_{n+1}=`} />
        </label>
        {/* Exemple hors de l'espace des tirages (a ∈ [0,6 ; 0,95] ∪ [1,05 ; 1,2] dans ce générateur). */}
        <input type="text" className="text-input" style={{ minHeight: 44 }} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder="ex : 2,5·x − 1" />
      </div>
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
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
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
