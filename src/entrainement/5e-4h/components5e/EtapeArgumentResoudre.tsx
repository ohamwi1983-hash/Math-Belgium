import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { ReponseArgumentResoudre } from "../moteur5e/verificationModelisationSinusoide";
import { consignePhaseFragments, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { FragmentsConsigneSinusoide } from "./FragmentsConsigneSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesModelisation, messageCibleArgumentModelisation } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceModelisationSinusoide;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (reponse: ReponseArgumentResoudre) => void;
  /** Statut à 3 valeurs (correct/not_equivalent/parse_error), même motif que 5gen2 (A.1) — voir
   * `EtapeChampSimpleModelisation.tsx` pour la documentation complète. */
  diagnostiquer?: (reponse: ReponseArgumentResoudre) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran "argumentResoudre" (Phase 2, type "resoudre") — isoler sin(u)=m puis résoudre pour
 * u=ωt+φ, add-as-needed (1 ou 2 branches) + gate 2 boutons "Aucun angle"/"Au moins une série
 * d'angles" (blocage numérique, `prompt5gen13B1B2.md` — même patron que
 * `EtapeArgumentEquationTrig.tsx`, jamais un simple toggle visible en même temps que le champ).
 * Variable libre "k" — uniforme sur toutes les techniques partageant cette phase
 * (`prompt5gen13ftDonnee3variantes.md`, "donnée" n'utilise plus "n"). */
export function EtapeArgumentResoudre({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [choixAucunAngle, setChoixAucunAngle] = useState<boolean | null>(null);
  const [lignes, setLignes] = useState<string[]>([""]);
  const saisie = useTentativeLisible<ReponseArgumentResoudre>();
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesVisibles = choixAucunAngle === false;
  const complet = choixAucunAngle === true || (lignesVisibles && lignes.length > 0 && lignes.every((l) => l.trim() !== ""));
  const reponseCourante: ReponseArgumentResoudre = choixAucunAngle === true ? { aucuneSolution: true, lignes: [] } : { aucuneSolution: false, lignes };
  /** Les lignes forment UNE seule réponse (l'ensemble des branches), jamais des champs indépendants
   * — même flag partagé par toute la liste que "pointsErronee" dans `EnsembleReelGuideBuilder.tsx`. */
  const lignesErronee = (saisie.illisible || montrerErreurs) && lignesVisibles && !!diagnostiquer && lignes.every((l) => l.trim() !== "") && diagnostiquer(reponseCourante) !== "correct";
  const placeholder = "ex : asin(0,37) + 2*k*pi";

  function ajouterLigne() {
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
    const reponse: ReponseArgumentResoudre = choixAucunAngle === true ? { aucuneSolution: true, lignes: [] } : { aucuneSolution: false, lignes };
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(reponse, estLisible(diagnostiquer?.(reponse)), onValider);
  }

  return (
    <div>
      <p className="prompt-text"><FragmentsConsigneSinusoide fragments={consignePhaseFragments(exercice, "argumentResoudre")} /></p>
      <div className="options-grid">
        <button type="button" className={choixAucunAngle === true ? "btn toggle-active" : "btn"} onClick={() => setChoixAucunAngle(true)}>
          Aucun angle
        </button>
        <button type="button" className={choixAucunAngle === false ? "btn toggle-active" : "btn"} onClick={() => setChoixAucunAngle(false)}>
          Au moins une série d'angles
        </button>
      </div>
      {lignesVisibles && (
        <div className="contenu-conditionnel">
          {lignes.map((ligne, i) => (
            <div key={i}>
              <ApercuExpressionLatex texte={ligne} />
              <div className="field-row">
                <input
                  type="text"
                  className={`text-input${lignesErronee ? " is-erronee" : ""}`}
                  value={ligne}
                  onChange={(e) => modifierLigne(i, e.target.value)}
                  placeholder={placeholder}
                />
                {lignes.length > 1 && (
                  <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => retirerLigne(i)}>
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}
          <button type="button" className="btn" onClick={ajouterLigne}>
            + Ajouter une série
          </button>
        </div>
      )}
      <AidesTrig niveauAide={niveauAide} aides={aidesModelisation(exercice, "argumentResoudre", texteAideNiveau2(exercice, "argumentResoudre"))} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ="solutions"
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCibleArgumentModelisation(exercice, saisie.soumise) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
