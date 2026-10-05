import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques, ReponseCE, SymboleCE } from "../core/caracteristiquesAlgebriques.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { formatEquationNiveau1Latex } from "../ui/formatCaracteristiquesAlgebriques";
import { Katex } from "./Katex";

type Choix = "aucune" | "auMoinsUne";

interface LigneCE {
  symbole: SymboleCE | null;
  valeurTexte: string;
}

const SYMBOLES: SymboleCE[] = ["≠", ">", "≥", "<", "≤"];

function ligneVide(): LigneCE {
  return { symbole: null, valeurTexte: "" };
}

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseCE) => void;
}

/**
 * Étape "conditions d'existence" (spec section 4, point 2) — nombre variable (0 ou plusieurs) :
 * choix binaire "pas de CE"/"ajouter une CE" (même principe que
 * `EtapeZerosCaracteristiques.tsx`, douzième exercice), puis une liste extensible où chaque ligne
 * porte un symbole (`≠`/`>`/`≥`/`<`/`≤`) et une valeur (champ libre, tolérant aux fractions via
 * `parserNombreOuFraction` — les CE de ce générateur sont souvent des rationnels non entiers, ex.
 * `-1/3`).
 */
export function EtapeCE({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [lignes, setLignes] = useState<LigneCE[]>([ligneVide()]);

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setLignes([ligneVide()]);
  }

  function ajouterLigne() {
    setLignes([...lignes, ligneVide()]);
  }

  function retirerLigne(index: number) {
    if (lignes.length <= 1) return;
    setLignes(lignes.filter((_, i) => i !== index));
  }

  function modifierSymbole(index: number, symbole: SymboleCE) {
    setLignes(lignes.map((l, i) => (i === index ? { ...l, symbole } : l)));
  }

  function modifierValeur(index: number, valeurTexte: string) {
    setLignes(lignes.map((l, i) => (i === index ? { ...l, valeurTexte } : l)));
  }

  function construireReponse(): ReponseCE | null {
    if (choix === "aucune") return [];
    if (choix !== "auMoinsUne") return null;
    const conditions: ReponseCE = [];
    for (const ligne of lignes) {
      if (ligne.symbole === null) return null;
      const valeur = parserNombreOuFraction(ligne.valeurTexte);
      if (valeur === null) return null;
      conditions.push({ symbole: ligne.symbole, valeur });
    }
    return conditions;
  }

  const reponse = construireReponse();
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationNiveau1Latex(exercice)} block />
      </div>
      <p className="prompt-text">Quelles sont les conditions d'existence de cette fonction ?</p>
      <div className="options-grid">
        <button type="button" className={choix === "aucune" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucune")}>
          Pas de CE
        </button>
        <button type="button" className={choix === "auMoinsUne" ? "btn toggle-active" : "btn"} onClick={() => choisir("auMoinsUne")}>
          Ajouter une CE
        </button>
      </div>

      {choix === "auMoinsUne" && (
        <div className="liste-morceaux contenu-conditionnel">
          {lignes.map((ligne, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <div className="options-grid">
                {SYMBOLES.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className={ligne.symbole === s ? "btn toggle-active" : "btn"}
                    onClick={() => modifierSymbole(index, s)}
                  >
                    x {s}
                  </button>
                ))}
              </div>
              <input
                className={`text-input${erronee ? " is-erronee" : ""}`}
                value={ligne.valeurTexte}
                onChange={(e) => modifierValeur(index, e.target.value)}
                placeholder="valeur, ex : -1/3"
                aria-label={`Valeur de la CE ${index + 1}`}
              />
              {lignes.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer la CE ${index + 1}`}
                  onClick={() => retirerLigne(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterLigne}>
            + Ajouter une CE
          </button>
        </div>
      )}

      <button
        type="button"
        className="btn btn-primary"
        disabled={reponse === null}
        onClick={() => reponse !== null && onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          Incorrect — tentative {tentativesUtilisees}/{tentativesMax}, réessaie.
        </p>
      )}
    </div>
  );
}
