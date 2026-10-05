import { useState } from "react";
import type { ExerciceSuiteRecurrenteAffine } from "../core5e/suiteRecurrenteAffine.types";
import { consigneGenerale, consigneRegimePermanent, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatSuiteRecurrenteAffine";
import { Katex } from "../components/Katex";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelSuiteRecurrenteAffine } from "./EtatActuelSuiteRecurrenteAffine";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";

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
}

/** Écran-pivot : bascule "Existe"/"N'existe pas" puis, si "Existe", un champ numérique conditionnel
 * — même principe que `EtapeSommeInfinie` (5gen15). */
export function EtapeRegimePermanent({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [existe, setExiste] = useState<boolean | null>(null);
  const [L, setL] = useState("");
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const complet = existe !== null && (!existe || L.trim() !== "");
  const aide2 = texteAideNiveau2(exercice, "regimePermanent");

  function valider() {
    if (!complet || existe === null) return;
    const reponse = { existe, L };
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale(exercice)}</p>
      <EtatActuelSuiteRecurrenteAffine exercice={exercice} phase="regimePermanent" />
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
          <input type="text" className="text-input" value={L} onChange={(e) => setL(e.target.value)} />
        </div>
      )}
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
          <Katex expression={texteAideNiveau1(exercice, "regimePermanent")} block />
          {niveauAide >= 2 && aide2.length > 0 && <Katex expression={aide2} block />}
        </div>
      )}
    </div>
  );
}
