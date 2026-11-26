// Copie 5e (6h) de `5e-4h/components5e/EtapeRegimePermanent.tsx` (56gen12 ← 5gen19, chantier D du 26/11/2026) — copiée pour que les deux années puissent diverger.
import { useState } from "react";
import type { ExerciceSuiteRecurrenteAffine } from "../../../../5e-4h/core5e/suiteRecurrenteAffine.types";
import { consigneRegimePermanent, texteAideNiveau1, texteAideNiveau2 } from "../ui/formatSuiteRecurrenteAffine";
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
  onValider: (reponse: { existe: boolean; L: string }) => void;
  /** Statut à 3 valeurs — voir `EtapePoserRecurrence.tsx`, même motif (A.1). */
  diagnostiquer?: (reponse: { existe: boolean; L: string }) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran-pivot : bascule "Existe"/"N'existe pas" puis, si "Existe", un champ numérique conditionnel
 * — même principe que `EtapeSommeInfinie` (5gen15). */
export function EtapeRegimePermanent({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [existe, setExiste] = useState<boolean | null>(null);
  const [L, setL] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = existe !== null && (!existe || L.trim() !== "");
  const aide1 = texteAideNiveau1(exercice, "regimePermanent");
  const aide2 = texteAideNiveau2(exercice, "regimePermanent");

  function valider() {
    if (!complet || existe === null) return;
    const reponse = { existe, L };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneRegimePermanent(exercice)}</p>
      <div className="options-grid-compact">
        <button type="button" className={`btn ${existe === false ? "toggle-active" : ""}`} onClick={() => setExiste(false)}>
          N'existe pas
        </button>
        <button type="button" className={`btn ${existe === true ? "toggle-active" : ""}`} onClick={() => setExiste(true)}>
          Existe
        </button>
      </div>
      {existe === true && (
        <div className="field field-inline contenu-conditionnel">
          <label className="field-label field-label-minuscule">
            <Katex expression="L=" />
          </label>
          <input type="text" style={{ minHeight: 44 }} className="text-input" value={L} onChange={(e) => setL(e.target.value)} />
        </div>
      )}
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
