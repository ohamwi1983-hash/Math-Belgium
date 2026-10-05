import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques, ReponseZerosCaracteristiques } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerExpressionNumerique, parserExpressionNumerique } from "../moteur/verificationCaracteristiquesAlgebriques";
import { INSTRUCTION_ZEROS, formatEquationRechercheZerosLatex, placeholderExpressionNumerique } from "../ui/formatCaracteristiquesAlgebriques";
import { formatMessageErreur } from "../ui/messageErreur";
import { EtatActuelPanel } from "./EtatActuelPanel";
import { Katex } from "./Katex";

type Choix = "aucun" | "auMoinsUn";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  etatActuel: string | null;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseZerosCaracteristiques) => void;
}

/**
 * Étape "zéros" (spec section 4, point 5, écran final commun aux 6 familles) — même composant à
 * nombre variable que `EtapeZerosCaracteristiques.tsx` (douzième exercice, "aucun"/"au moins un" +
 * liste extensible), minus le graphique. Vérifié par tolérance numérique (`verifierZerosNiveau1`),
 * jamais par égalité stricte. Chaque champ accepte des EXPRESSIONS COMPLÈTES (`sqrt(...)`,
 * `cbrt(...)`), pas seulement des fractions `p/q` (`parserExpressionNumerique`,
 * `prompt-3-ameliorations-finales.md`, point 1) — les zéros eux-mêmes sont toujours rationnels pour
 * les 6 familles (voir `zerosNiveau1`), mais rien n'empêche l'élève de les exprimer via une
 * expression radicale équivalente (ex. `cbrt(-8/27)`, qui vaut exactement `-2/3`) ; le champ `f(0)`
 * (`EtapeOrdonneeAlgebrique.tsx`), lui, a réellement besoin de cette flexibilité, `racine_carree`/
 * `racine_cubique` pouvant y produire une vraie valeur irrationnelle. Placeholder adapté
 * DYNAMIQUEMENT à la famille réellement générée (`placeholderExpressionNumerique`,
 * `prompt-corrections-caracteristiquesalgebriques.md`, point 1). `etatActuel` rappelle la forme
 * confirmée la plus récente (équation isolée, les deux équations séparées niveau 1 `valeur_absolue`/
 * `carre`, l'équation isolée + "débarrassée" niveau 1 pour les 4 autres familles, les deux
 * équations de branche + conditions niveau 2 `valeur_absolue`, ou l'équation isolée + regroupée
 * niveau 2 pour `inverse`/`racine_carree`/`racine_cubique` — voir
 * `calculerEtatActuelCaracteristiquesAlgebriques`).
 */
export function EtapeZerosAlgebrique({ exercice, etatActuel, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeurs([""]);
  }

  function ajouterChamp() {
    setValeurs([...valeurs, ""]);
  }

  function retirerChamp(index: number) {
    if (valeurs.length <= 1) return;
    setValeurs(valeurs.filter((_, i) => i !== index));
  }

  function modifierChamp(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function construireReponse(): ReponseZerosCaracteristiques | null {
    if (choix === "aucun") return { aucun: true, valeurs: [] };
    if (choix === "auMoinsUn") {
      const nombres = valeurs.map(parserExpressionNumerique);
      if (nombres.some((n) => n === null)) return null;
      return { aucun: false, valeurs: nombres as number[] };
    }
    return null;
  }

  const reponse = construireReponse();
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationRechercheZerosLatex(exercice)} block />
      </div>
      <EtatActuelPanel latex={etatActuel} />
      <p className="prompt-text">{INSTRUCTION_ZEROS}</p>
      <div className="options-grid">
        <button type="button" className={choix === "aucun" ? "btn toggle-active" : "btn"} onClick={() => choisir("aucun")}>
          Aucun zéro
        </button>
        <button
          type="button"
          className={choix === "auMoinsUn" ? "btn toggle-active" : "btn"}
          onClick={() => choisir("auMoinsUn")}
        >
          Au moins un zéro
        </button>
      </div>

      {choix === "auMoinsUn" && (
        <div className="liste-morceaux contenu-conditionnel">
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                className={`text-input${erronee ? " is-erronee" : ""}`}
                value={valeur}
                onChange={(e) => modifierChamp(index, e.target.value)}
                placeholder={`zéro ${index + 1}, ${placeholderExpressionNumerique(exercice.famille)}`}
                aria-label={`Zéro ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer le zéro ${index + 1}`}
                  onClick={() => retirerChamp(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterChamp}>
            + Ajouter un zéro
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
          {formatMessageErreur(
            tentativesUtilisees,
            tentativesMax,
            choix === "auMoinsUn" && valeurs.some((v) => diagnostiquerExpressionNumerique(v) === "parse_error")
              ? "parse_error"
              : undefined,
          )}
        </p>
      )}
    </div>
  );
}
