import { useState } from "react";
import type { ExerciceInequation, ReponseRacines } from "../core/inequation.types";
import { Katex } from "./Katex";
import { formatEquationAssocieeLatex, formatInequationLatex } from "../ui/formatInequation";

type Choix = "auMoinsUne" | "pasDeSolutions";

const MAX_SOLUTIONS = 2;

interface Props {
  exercice: ExerciceInequation;
  tentativesUtilisees: number;
  tentativesMax: number;
  onValider: (reponse: ReponseRacines) => void;
}

/**
 * Étape "racines" (toujours la première) — prompt-generateurs123groupe.md, générateur 2, point 2 :
 * remplace l'ancien choix binaire "2 solutions"/"∅ (pas de solution)", qui ne couvrait pas
 * naturellement Δ=0 (racine double, une seule solution distincte — l'élève devait alors saisir
 * deux fois la même valeur sous un libellé "2 solutions" trompeur), par le pattern "Pas de
 * solutions"/"Au moins une solution" + liste extensible déjà utilisé ailleurs dans le projet pour
 * les zéros (terminologie "solution(s)" conservée ici, seul le mécanisme d'interface est repris).
 * Bornée à 2 champs (`MAX_SOLUTIONS`) : une inéquation du 2nd degré n'a jamais plus de 2 solutions
 * distinctes. `ReponseRacines` (le contrat, inchangé) n'accepte toujours que `{aucune}` ou
 * `{deux,x1,x2}` : une seule valeur saisie (racine double) est dupliquée en [v,v] avant l'appel à
 * onValider, exactement comme verifierRacines l'attend déjà — aucun changement côté moteur.
 * Pas de RecapitulatifPanel : toujours la première étape, il serait vide.
 */
export function EtapeRacines({ exercice, tentativesUtilisees, tentativesMax, onValider }: Props) {
  const [choix, setChoix] = useState<Choix | null>(null);
  const [valeurs, setValeurs] = useState<string[]>([""]);

  function choisir(nouveauChoix: Choix) {
    setChoix(nouveauChoix);
    setValeurs([""]);
  }

  function ajouterChamp() {
    if (valeurs.length >= MAX_SOLUTIONS) return;
    setValeurs([...valeurs, ""]);
  }

  function retirerChamp(index: number) {
    if (valeurs.length <= 1) return;
    setValeurs(valeurs.filter((_, i) => i !== index));
  }

  function modifierChamp(index: number, valeur: string) {
    setValeurs(valeurs.map((v, i) => (i === index ? valeur : v)));
  }

  function construireReponse(): ReponseRacines | null {
    if (choix === "pasDeSolutions") return { type: "aucune" };
    if (choix === "auMoinsUne") {
      const nombres = valeurs.map((v) => Number(v.trim().replace(",", ".")));
      if (valeurs.some((v) => v.trim() === "") || nombres.some((n) => !Number.isFinite(n))) return null;
      return nombres.length === 1 ? { type: "deux", x1: nombres[0], x2: nombres[0] } : { type: "deux", x1: nombres[0], x2: nombres[1] };
    }
    return null;
  }

  const reponse = construireReponse();

  return (
    <div>
      <div className="equation-box">
        <Katex expression={formatInequationLatex(exercice.enonce, exercice.symbole)} block />
      </div>
      <p className="prompt-text">Combien cette équation a-t-elle de solutions ?</p>
      <div className="equation-box">
        <Katex expression={formatEquationAssocieeLatex(exercice.enonce)} block />
      </div>
      <div className="options-grid">
        <button
          type="button"
          className={choix === "pasDeSolutions" ? "btn toggle-active" : "btn"}
          onClick={() => choisir("pasDeSolutions")}
        >
          Pas de solutions
        </button>
        <button type="button" className={choix === "auMoinsUne" ? "btn toggle-active" : "btn"} onClick={() => choisir("auMoinsUne")}>
          Au moins une solution
        </button>
      </div>

      {choix === "auMoinsUne" && (
        <div className="liste-morceaux contenu-conditionnel">
          {valeurs.map((valeur, index) => (
            <div key={index} className="liste-morceaux-ligne">
              <input
                className="text-input"
                value={valeur}
                onChange={(e) => modifierChamp(index, e.target.value)}
                placeholder={`solution ${index + 1}`}
                aria-label={`Solution ${index + 1}`}
              />
              {valeurs.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer la solution ${index + 1}`}
                  onClick={() => retirerChamp(index)}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          {valeurs.length < MAX_SOLUTIONS && (
            <button type="button" className="btn liste-morceaux-ajouter" onClick={ajouterChamp}>
              + Ajouter une solution
            </button>
          )}
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
