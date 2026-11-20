import { useState } from "react";
import type { ExerciceEquationTrig } from "../core5e/equationsTrigonometriques.types";
import { ANNONCE_PRECISION_DECIMAL, CONSIGNE_GENERALE_EQUATION_TRIG, formatAideIsolerXNiveau2Latex, formatEquationEnonceLatex } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { aidesIsolerX, messageCibleIsolerX } from "../ui5e/aidesTrigonometrie";
import { BoutonAide } from "./BoutonAide";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceEquationTrig;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (lignes: string[]) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`. */
  diagnostiquer?: (lignes: string[]) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/** Écran 2 (absent si `exercice.aucuneSolution`) — isoler x=(u-b)/a. Add-as-needed, pré-rempli au
 * nombre de branches déjà confirmées à l'écran 1 (connu avec certitude à ce stade). D.2 : AUCUNE
 * aide sur cet écran (`niveauAideMaxEquationTrig` plafonne cette phase à 0, voir
 * `moteur5e/sessionEquationTrig.ts`) — le bouton et le bloc d'aide sont donc entièrement absents. */
export function EtapeIsolerXEquationTrig({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: Math.max(1, exercice.branchesU.length) }, () => ""));
  const saisie = useTentativeLisible<string[]>();
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

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
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(lignes, estLisible(diagnostiquer?.(lignes)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={CONSIGNE_GENERALE_EQUATION_TRIG}
        blocDonnees={
          <div className="equation-box">
            <Katex expression={formatEquationEnonceLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">
        Isole x dans chaque série trouvée (k entier).
        {exercice.regime === "decimal" && ANNONCE_PRECISION_DECIMAL}
      </p>
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => modifierLigne(i, e.target.value)}
              placeholder="ex : π/5 + kπ/7"
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
      <AidesTrig niveauAide={niveauAide} aides={aidesIsolerX(formatAideIsolerXNiveau2Latex(exercice))} />
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
          cible={montrerErreurs && saisie.soumise ? messageCibleIsolerX(saisie.soumise, exercice.branchesX, exercice.a.numerateur / exercice.a.denominateur, exercice.b.decimal) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
