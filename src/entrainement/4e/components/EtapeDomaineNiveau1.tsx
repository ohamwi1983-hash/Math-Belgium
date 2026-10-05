import { useState } from "react";
import type { ExerciceCaracteristiquesAlgebriques, FormeDomaine, ReponseDomaine } from "../core/caracteristiquesAlgebriques.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { construireListeFraction, etatListeFractionInitiale } from "../ui/listeMorceauxFraction";
import type { EtatListeMorceauxFraction } from "../ui/listeMorceauxFraction";
import { formatTermesApercuDomaine } from "../ui/apercuDomaine";
import { formatEquationNiveau1Latex } from "../ui/formatCaracteristiquesAlgebriques";
import { ListeMorceauxFractionInput } from "./ListeMorceauxFractionInput";
import { Katex } from "./Katex";

interface Props {
  exercice: ExerciceCaracteristiquesAlgebriques;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseDomaine) => void;
}

const OPTIONS: { valeur: FormeDomaine; libelle: string }[] = [
  { valeur: "reel", libelle: "ℝ" },
  { valeur: "prive_points", libelle: "ℝ privé de points" },
  { valeur: "intervalles", libelle: "Union d'intervalles" },
  { valeur: "vide", libelle: "∅" },
];

/**
 * Étape "domaine de définition" (spec section 4, point 3) — construction guidée à 4 formes
 * mutuellement exclusives, "déduite des CE de l'étape précédente" : `ℝ`, `ℝ \ {points}` (liste de
 * points exclus, extensible, chaque champ tolérant aux fractions via `parserNombreOuFraction`),
 * `intervalles` (union extensible, `ListeMorceauxFractionInput` — bornes fraction-compatibles,
 * contrairement au `ListeMorceauxInput` du douzième exercice dont les frontières sont toujours
 * entières), `∅` (jamais la bonne réponse pour ce générateur, mais toujours sélectionnable —
 * mécanisme de construction complet). Aperçu en temps réel préfixé `domf = ` (`formatApercuDomaine`,
 * `prompt-3-ameliorations-finales.md`, point 3 — même principe que `formatApercuSolution`,
 * exercice "tableau de signes").
 */
export function EtapeDomaineNiveau1({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<FormeDomaine | null>(null);
  const [points, setPoints] = useState<string[]>([""]);
  const [intervalles, setIntervalles] = useState<EtatListeMorceauxFraction>(etatListeFractionInitiale());

  function choisir(nouveauChoix: FormeDomaine) {
    setChoix(nouveauChoix);
    setPoints([""]);
    setIntervalles(etatListeFractionInitiale());
  }

  function ajouterPoint() {
    setPoints([...points, ""]);
  }

  function retirerPoint(index: number) {
    if (points.length <= 1) return;
    setPoints(points.filter((_, i) => i !== index));
  }

  function modifierPoint(index: number, valeur: string) {
    setPoints(points.map((p, i) => (i === index ? valeur : p)));
  }

  function construireReponse(): ReponseDomaine | null {
    if (choix === "reel") return { forme: "reel", points: [], intervalles: [] };
    if (choix === "vide") return { forme: "vide", points: [], intervalles: [] };
    if (choix === "prive_points") {
      const valeurs = points.map(parserNombreOuFraction);
      if (valeurs.some((v) => v === null)) return null;
      return { forme: "prive_points", points: valeurs as number[], intervalles: [] };
    }
    if (choix === "intervalles") {
      const liste = construireListeFraction(intervalles);
      if (liste === null) return null;
      return { forme: "intervalles", points: [], intervalles: liste };
    }
    return null;
  }

  const reponse = construireReponse();
  const termesApercu = formatTermesApercuDomaine(choix, points, intervalles);
  const erronee = tentativesUtilisees > 0;

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatEquationNiveau1Latex(exercice)} block />
      </div>
      <p className="prompt-text">Quel est le domaine de définition de cette fonction ?</p>
      <div className="options-grid">
        {OPTIONS.map((option) => (
          <button
            key={option.valeur}
            type="button"
            className={choix === option.valeur ? "btn toggle-active" : "btn"}
            onClick={() => choisir(option.valeur)}
          >
            {option.libelle}
          </button>
        ))}
      </div>

      {choix === "prive_points" && (
        <div className="liste-morceaux contenu-conditionnel">
          {points.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                className={`text-input${erronee ? " is-erronee" : ""}`}
                value={valeur}
                onChange={(e) => modifierPoint(index, e.target.value)}
                placeholder="point exclu, ex : -1/3"
                aria-label={`Point exclu ${index + 1}`}
              />
              {points.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer le point ${index + 1}`}
                  onClick={() => retirerPoint(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterPoint}>
            + Ajouter un point
          </button>
        </div>
      )}

      {choix === "intervalles" && (
        <div className="contenu-conditionnel">
          <ListeMorceauxFractionInput etat={intervalles} onChange={setIntervalles} />
        </div>
      )}

      {termesApercu !== null && (
        <div className="apercu-box apercu-box-termes">
          {termesApercu.map((terme, i) => (
            <Katex key={i} expression={terme} />
          ))}
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
