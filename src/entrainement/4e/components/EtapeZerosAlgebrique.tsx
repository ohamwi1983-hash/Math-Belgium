import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques, ReponseZerosCaracteristiques } from "../core/caracteristiquesAlgebriques.types";
import { diagnostiquerExpressionNumerique, parserExpressionNumerique } from "../moteur/verificationCaracteristiquesAlgebriques";
import { INSTRUCTION_ZEROS, formatEquationRechercheZerosLatex, placeholderExpressionNumerique, texteAideZeros } from "../ui/formatCaracteristiquesAlgebriques";
import { NIVEAU_AIDE_MAX_ZEROS } from "../moteur/sessionCaracteristiquesAlgebriques";
import { BoutonAide } from "./BoutonAide";
import { formatMessageErreur } from "../ui/messageErreur";
import { Katex } from "./Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";

type Choix = "aucun" | "auMoinsUn";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseZerosCaracteristiques) => void;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
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
 * `prompt-corrections-caracteristiquesalgebriques.md`, point 1). Les étapes déjà confirmées
 * (équation isolée, séparation/débarrasser niveau 1, validité/regroupe/résolution des branches
 * niveau 2...) ne sont plus rappelées ici via un bloc "état actuel" isolé : elles apparaissent
 * désormais dans le récapitulatif "Ce qu'on sait déjà" (`RecapitulatifPanel`,
 * `calculerRecapitulatifCaracteristiquesAlgebriques`) affiché en haut de chaque écran par
 * `AppCaracteristiquesAlgebriques.tsx`.
 */
export function EtapeZerosAlgebrique({ exercice, tentativesUtilisees, tentativesMax, niveauAide, onActiverAide, onValider, validation }: Props) {
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

      {niveauAide > 0 && (
        <div className="triangle-quelconque-aide">
          <p>{texteAideZeros(exercice)}</p>
        </div>
      )}
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={NIVEAU_AIDE_MAX_ZEROS} onActiverAide={onActiverAide} />
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
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
