import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques, ReponseExistence } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerExpressionNumerique, parserExpressionNumerique } from "../moteur/verificationCaracteristiquesAlgebriques";
import { formatEquationNiveau1Latex, placeholderExpressionNumerique } from "../ui/formatCaracteristiquesAlgebriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";

type Choix = "nExistePas" | "existe";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseExistence) => void;
}

/** Étape "ordonnée à l'origine" (spec section 4, point 1) — même principe que
 * `EtapeOrdonneeCaracteristiques.tsx` (douzième exercice) : le domaine pouvant exclure x=0
 * (`inverse`/`racine_carree`), l'ordonnée à l'origine peut ne pas exister. Aucun graphique
 * (générateur purement algébrique) : la formule de f(x) est rappelée en KaTeX à la place. Le champ
 * `f(0)` accepte des EXPRESSIONS COMPLÈTES (`sqrt(...)`, `cbrt(...)`), pas seulement des fractions
 * `p/q` (`parserExpressionNumerique`, `prompt-3-ameliorations-finales.md`, point 1) — nécessaire
 * pour les familles `racine_carree`/`racine_cubique`, dont `f(0)` peut être irrationnel. Placeholder
 * adapté DYNAMIQUEMENT à la famille réellement générée (`placeholderExpressionNumerique`,
 * `prompt-corrections-caracteristiquesalgebriques.md`, point 1 — corrige un exemple `sqrt(...)`
 * statique, jusque-là affiché même pour la famille `racine_cubique`, dont l'exemple pertinent
 * utilise `cbrt(...)`). */
export function EtapeOrdonneeAlgebrique({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeur, setValeur] = useState("");

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeur("");
  }

  const nombre = parserExpressionNumerique(valeur);
  const reponse: ReponseExistence | null =
    choix === "nExistePas"
      ? { existe: false, valeur: null }
      : choix === "existe" && nombre !== null
        ? { existe: true, valeur: nombre }
        : null;
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationNiveau1Latex(exercice)} block />
      </div>
      <p className="prompt-text">
        Quelle est l'ordonnée à l'origine de cette fonction ? (forme exacte ou décimale arrondie au centième)
      </p>
      <div className="options-grid">
        <button type="button" className={choix === "nExistePas" ? "btn toggle-active" : "btn"} onClick={() => choisir("nExistePas")}>
          Pas d'ordonnée à l'origine
        </button>
        <button type="button" className={choix === "existe" ? "btn toggle-active" : "btn"} onClick={() => choisir("existe")}>
          Il y en a une
        </button>
      </div>
      {choix === "existe" && (
        <div className="field field-inline contenu-conditionnel">
          <label className="field-label field-label-minuscule" htmlFor="caract-alg-ordonnee">
            f(0) =
          </label>
          <input
            id="caract-alg-ordonnee"
            className={`text-input${erronee ? " is-erronee" : ""}`}
            placeholder={placeholderExpressionNumerique(exercice.famille)}
            value={valeur}
            onChange={(e) => setValeur(e.target.value)}
          />
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
          {formatMessageErreur(
            tentativesUtilisees,
            tentativesMax,
            choix === "existe" ? diagnostiquerExpressionNumerique(valeur) : undefined,
          )}
        </p>
      )}
    </div>
  );
}
