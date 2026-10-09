import { useState } from "react";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { AideAvecLatex } from "../ui6e/formatHyperboliques";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  /** `null` — jamais rendu — quand cet écran ne dépend d'aucun écran précédent. */
  etatActuel: string[] | null;
  consigneEcran: string;
  placeholder: string;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs de la DERNIÈRE tentative — distingue "syntaxe non reconnue" d'un simple
   * "incorrect" (convention CLAUDE.md). */
  diagnostiquer: (texte: string) => StatutVerification;
}

/**
 * Écran GÉNÉRIQUE à un seul champ texte libre pour `6gen19` — réutilisé par la majorité des écrans
 * (parité et limites EXCLUES, boutons dédiés). Copié-adapté de `EtapeChampDomaineDeriveeLog.tsx`
 * (`6gen16`). Structure d'écran imposée par CLAUDE.md : consigne générale → bloc données → bloc
 * "état actuel" → bloc de travail. `App6gen19.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeChampHyperboliques({
  consigneGenerale,
  blocDonnees,
  etatActuel,
  consigneEcran,
  placeholder,
  aideNiveau1,
  aideNiveau2,
  tentativesUtilisees,
  tentativesMax,
  niveauAide,
  niveauAideMax,
  onActiverAide,
  onValider,
  diagnostiquer,
}: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(texte) : null;

  function valider() {
    if (texte.trim() === "") return;
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        {blocDonnees.map((frag, i) => (
          <Katex key={i} expression={frag} block />
        ))}
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          {etatActuel.map((frag, i) => (
            <Katex key={i} expression={frag} block />
          ))}
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
      <ApercuExpressionLatex texte={texte} />
      <div className="field">
        <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={texte} placeholder={placeholder} onChange={(e) => setTexte(e.target.value)} />
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
          <p>{aideNiveau1.texte}</p>
          {aideNiveau1.latex && <Katex expression={aideNiveau1.latex} block />}
          {niveauAide >= 2 && (
            <>
              <p>{aideNiveau2.texte}</p>
              {aideNiveau2.latex && <Katex expression={aideNiveau2.latex} block />}
            </>
          )}
        </div>
      )}
    </div>
  );
}
