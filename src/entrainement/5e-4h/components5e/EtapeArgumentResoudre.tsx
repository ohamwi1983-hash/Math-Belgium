import { useState } from "react";
import type { ExerciceModelisationSinusoide } from "../core5e/modelisationSinusoide.types";
import type { ReponseArgumentResoudre } from "../moteur5e/verificationModelisationSinusoide";
import { consignePhase, texteAideNiveau1, texteAideNiveau2 } from "../ui5e/formatModelisationSinusoide";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { BlocDonneesModelisation } from "./BlocDonneesModelisation";
import { BoutonAide } from "./BoutonAide";
import { EtatActuelModelisation } from "./EtatActuelModelisation";
import { formatMessageErreur } from "../ui/messageErreur";
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
}

/** Écran "argumentResoudre" (Phase 2, type "resoudre") — isoler sin(u)=m puis résoudre pour
 * u=ωt+φ, add-as-needed (1 ou 2 branches) + gate 2 boutons "Aucun angle"/"Au moins une série
 * d'angles" (blocage numérique, `prompt5gen13B1B2.md` — même patron que
 * `EtapeArgumentEquationTrig.tsx`, jamais un simple toggle visible en même temps que le champ).
 * Variable libre "k" — uniforme sur toutes les techniques partageant cette phase
 * (`prompt5gen13ftDonnee3variantes.md`, "donnée" n'utilise plus "n"). */
export function EtapeArgumentResoudre({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer }: Props) {
  const [choixAucunAngle, setChoixAucunAngle] = useState<boolean | null>(null);
  const [lignes, setLignes] = useState<string[]>([""]);
  const [dernierStatut, setDernierStatut] = useState<StatutVerification | null>(null);
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesVisibles = choixAucunAngle === false;
  const complet = choixAucunAngle === true || (lignesVisibles && lignes.length > 0 && lignes.every((l) => l.trim() !== ""));
  const apresEchec = tentativesUtilisees > 0;
  const reponseCourante: ReponseArgumentResoudre = choixAucunAngle === true ? { aucuneSolution: true, lignes: [] } : { aucuneSolution: false, lignes };
  /** Les lignes forment UNE seule réponse (l'ensemble des branches), jamais des champs indépendants
   * — même flag partagé par toute la liste que "pointsErronee" dans `EnsembleReelGuideBuilder.tsx`. */
  const lignesErronee = apresEchec && lignesVisibles && !!diagnostiquer && lignes.every((l) => l.trim() !== "") && diagnostiquer(reponseCourante) !== "correct";
  const placeholder = "ex : asin(0.5) + k*2*pi";

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
    if (diagnostiquer) setDernierStatut(diagnostiquer(reponse));
    onValider(reponse);
  }

  return (
    <div>
      <BlocDonneesModelisation exercice={exercice} />
      <EtatActuelModelisation exercice={exercice} phase="argumentResoudre" />
      <p className="prompt-text">{consignePhase(exercice, "argumentResoudre")}</p>
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
          <p>{texteAideNiveau1(exercice, "argumentResoudre")}</p>
          {niveauAide >= 2 && <Katex expression={texteAideNiveau2(exercice, "argumentResoudre")} block />}
        </div>
      )}
    </div>
  );
}
