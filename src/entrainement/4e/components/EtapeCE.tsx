import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques, ReponseCE, SymboleCE } from "../core/caracteristiquesAlgebriques.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { formatEquationNiveau1Latex, texteAideCE } from "../ui/formatCaracteristiquesAlgebriques";
import { NIVEAU_AIDE_MAX_CE } from "../moteur/sessionCaracteristiquesAlgebriques";
import { BoutonAide } from "./BoutonAide";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

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
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseCE) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Étape "conditions d'existence" (spec section 4, point 2) — nombre variable (0 ou plusieurs) :
 * choix binaire "pas de CE"/"ajouter une CE" (même principe que
 * `EtapeZerosCaracteristiques.tsx`, douzième exercice), puis une liste extensible où chaque ligne
 * porte « x », un symbole choisi dans une liste déroulante (`≠`/`>`/`≥`/`<`/`≤`) et une valeur — le tout sur une
 * seule ligne, même sur smartphone (champ libre, tolérant aux fractions via
 * `parserNombreOuFraction` — les CE de ce générateur sont souvent des rationnels non entiers, ex.
 * `-1/3`).
 */
export function EtapeCE({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
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
              {/* « x », puis le symbole dans une liste déroulante, puis la valeur — une seule ligne,
                  même à 360 px (retour de l'utilisateur : plus de rangée de 5 boutons « x ≠ », « x > »…). */}
              <div className="ce-ligne-champs ce-ligne-compacte">
                <span className="ce-slot-latex">
                  <Katex expression="x" />
                </span>
                <span className="select-souligne-wrap ce-symbole-wrap">
                  <select
                    className={`ce-select${erronee ? " is-erronee" : ""}`}
                    value={ligne.symbole ?? ""}
                    onChange={(e) => modifierSymbole(index, e.target.value as SymboleCE)}
                    aria-label={`Symbole de la CE ${index + 1}`}
                  >
                    <option value="" disabled>
                      …
                    </option>
                    {SYMBOLES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </span>
                <input
                  className={`text-input${erronee ? " is-erronee" : ""}`}
                  value={ligne.valeurTexte}
                  onChange={(e) => modifierValeur(index, e.target.value)}
                  placeholder="ex : 7/9"
                  aria-label={`Valeur de la CE ${index + 1}`}
                />
              </div>
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

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideCE()}</p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_CE} onActiverAide={onActiverAide} />
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
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
