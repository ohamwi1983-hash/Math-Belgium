import { useState } from "react";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import type { StatutVerification } from "../moteur/statutVerification";
import { formatMessageErreur } from "../ui/messageErreur";
import type { AideAvecLatex } from "../ui6e/formatEquationsComplexes";
import { BoutonAide } from "./BoutonAide";

interface Props {
  consigneGenerale: string;
  blocDonnees: string[];
  etatActuel: string[] | null;
  consigneEcran: string;
  /** Nombre de valeurs RÉELLEMENT attendu par cet écran précis (2 ou 4 selon la famille/écran —
   * voir `ui6e/formatEquationsComplexes.ts`, `nombreCibleEnsemble`) — démarre à CE nombre (jamais
   * moins : piège central de plusieurs familles, ex. famille E écran 3, une équation quartique
   * réductible produit TOUJOURS le nombre de racines annoncé, jamais moins). */
  nombreCible: number;
  aideNiveau1: AideAvecLatex;
  aideNiveau2: AideAvecLatex;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (textes: string[]) => void;
  diagnostiquer: (textes: string[]) => StatutVerification;
}

/**
 * Écran add-as-needed GÉNÉRIQUE (ensemble de N racines/valeurs complexes, ordre indifférent) pour
 * `6gen36` — mirroir `EtapeRacinesAffixesRacines.tsx` (6gen35), généralisé au nombre de valeurs
 * CIBLE (2 pour cEcran2/dEcran2/dEcran3/eEcran2/fEcran4, 4 pour eEcran3/fEcran5 — jamais un nombre
 * fixe codé en dur ici, contrairement à 6gen35 qui n'avait qu'un seul cas à 2). Démarre à
 * `nombreCible` lignes (PAS moins — piège central de la famille E/l'écran 5 de F, voir en-tête de
 * la prop `nombreCible`), une croix rouge `×` pour retirer une ligne (jamais un bouton texte
 * "Retirer"), jusqu'à `nombreCible+2` lignes (marge pour corriger une saisie sans tout effacer).
 * `App6gen36.tsx` doit le rendre avec `key={phase}`.
 */
export function EtapeListeEquationsComplexes({ consigneGenerale, blocDonnees, etatActuel, consigneEcran, nombreCible, aideNiveau1, aideNiveau2, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: nombreCible }, () => ""));
  const maxLignes = nombreCible + 2;
  const montrerErreurs = tentativesUtilisees > 0;
  const dernierStatut = montrerErreurs ? diagnostiquer(lignes) : null;
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

  function ajouterLigne() {
    if (lignes.length >= maxLignes) return;
    setLignes((arr) => [...arr, ""]);
  }
  function retirerLigne(i: number) {
    setLignes((arr) => arr.filter((_, j) => j !== i));
  }
  function modifierLigne(i: number, valeur: string) {
    setLignes((arr) => arr.map((v, j) => (j === i ? valeur : v)));
  }
  function valider() {
    if (!complet) return;
    onValider(lignes);
  }

  return (
    <div>
      <p className="prompt-text">{consigneGenerale}</p>
      <div className="equation-box">
        <div className="equation-box-donnees">
          {blocDonnees.map((frag, i) => (
            <Katex key={i} expression={frag} block />
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
      <div className="contenu-conditionnel">
        {lignes.map((ligne, i) => (
          <div key={i}>
            <ApercuExpressionLatex texte={ligne} />
            <div className="field-row">
              <input type="text" className={`text-input ${montrerErreurs ? "is-erronee" : ""}`} value={ligne} placeholder="ex : 2+i" onChange={(e) => modifierLigne(i, e.target.value)} />
              {lignes.length > 1 && (
                <button type="button" className="btn liste-morceaux-retirer" aria-label={`Retirer la valeur ${i + 1}`} onClick={() => retirerLigne(i)}>
                  ×
                </button>
              )}
            </div>
          </div>
        ))}
        {lignes.length < maxLignes && (
          <button type="button" className="btn" onClick={ajouterLigne}>
            + Ajouter une valeur
          </button>
        )}
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
