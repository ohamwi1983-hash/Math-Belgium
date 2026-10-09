import { useState } from "react";
import { Katex } from "../components/Katex";
import { formatMessageErreur } from "../ui/messageErreur";
import type { StatutVerification } from "../moteur/statutVerification";
import { BoutonAide } from "./BoutonAide";

interface AideAvecLatex {
  texte: string;
  latex: string | null;
}

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  /** `null` — jamais rendu — sur le premier écran de chaque famille (rien à rappeler). */
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
  /** Statut à 3 valeurs de la DERNIÈRE tentative (optionnel) — permet de distinguer un message
   * "syntaxe non reconnue" d'un simple "incorrect" (convention CLAUDE.md). */
  diagnostiquer?: (texte: string) => StatutVerification;
}

/**
 * Écran GÉNÉRIQUE à un seul champ texte libre pour `6gen22` — réutilisé par la quasi-totalité des
 * écrans du générateur. Structure d'écran imposée par CLAUDE.md : consigne générale → bloc données
 * → bloc "état actuel" → bloc de travail, toujours cet ordre. Copié-adapté de
 * `EtapeChampExpoProblemes.tsx` (6gen12) — duplication délibérée, convention de ce chantier (chaque
 * générateur garde ses propres composants d'écran génériques).
 */
export function EtapeChampLogProblemes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, placeholder, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [texte, setTexte] = useState("");
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs && diagnostiquer ? diagnostiquer(texte) : null;

  function valider() {
    if (texte.trim() === "") return;
    onValider(texte);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} />
          ))}
        </div>
      </div>
      {etatActuel && (
        <div className="etat-actuel-box">
          <div className="etat-actuel-box-termes">
            {etatActuel.map((frag, i) => (
              <Katex key={i} expression={frag} />
            ))}
          </div>
        </div>
      )}
      <p className="prompt-text">{consigneEcran}</p>
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
