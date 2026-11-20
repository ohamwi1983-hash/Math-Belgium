import { useState } from "react";
import type { ExerciceExtremumsSinusoide } from "../core5e/extremumsSinusoide.types";
import {
  PLACEHOLDER_ISOLER_X_EXTREMUMS,
  PLACEHOLDER_POSER_EQUATION_EXTREMUMS,
  consigneGeneraleExtremums,
  consignePhaseExtremums,
  donneesMessagesExtremums,
  formatArgumentExtremumsLatex,
  formatFonctionSourceLatex,
  latexAideNiveau1Extremums,
  substitutionIsolerXExtremums,
  texteAideNiveau1Extremums,
} from "../ui5e/formatExtremumsSinusoide";
import { decouperEquationLongueLatex } from "../ui5e/blocFitterEquation";
import { Katex } from "../components/Katex";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { aidesIsolerX, aidesPoserEquationExtremums, messageCibleExtremums } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";
import { EnTeteExercice } from "./EnTeteExercice";

interface Props {
  exercice: ExerciceExtremumsSinusoide;
  phase: "poserEquation" | "isolerX";
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs, calculé côté PRÉSENTATION uniquement — voir `EtapeArgumentEquationTrig`
   * (5gen10). `App5gen11.tsx` fournit la bonne fonction `diagnostiquerPoserEquationExtremum`/
   * `diagnostiquerIsolerXExtremum` selon `phase`. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

/**
 * Écrans 1-2 ("poser l'équation", "isoler x") — UN SEUL champ texte libre, jamais add-as-needed
 * (la formule n'a par nature qu'une seule branche, contrairement à 5gen10). `App5gen11.tsx` doit le
 * rendre avec `key={phase}` (leçon retenue de 5gen6/5gen7/5gen8/5gen10 — sans cette clé, React
 * réutilise la même instance entre deux phases et le champ `texte` local garde la réponse de
 * l'écran précédent).
 *
 * B.1 : écran "poserEquation" seul a un layout dédié (label "Équation :" empilé au-dessus du champ,
 * jamais inline comme "x =") — c'est aussi le SEUL écran des deux à conserver une aide (niveau 1
 * uniquement, `BoutonAide` rend `null` de lui-même sur "isolerX" via `niveauAideMax=0`, voir
 * `moteur5e/sessionExtremumsSinusoide.ts::niveauAideMaxExtremums`). A.2 : `is-erronee` recalculé à
 * chaque frappe après un premier échec, réutilisant `diagnostiquer` (déjà un statut à 3 valeurs).
 */
export function EtapeParametreExtremum({ exercice, phase, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const montrerErreurs = tentativesUtilisees > 0;
  const apresEchec = tentativesUtilisees > 0;
  const statutActuel = apresEchec && diagnostiquer ? diagnostiquer(texte) : undefined;
  const texteErronee = saisie.illisible || (statutActuel !== undefined && statutActuel !== "correct");

  function valider() {
    if (texte.trim() === "") return;
    // Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée).
    saisie.tenter(texte, estLisible(diagnostiquer?.(texte)), onValider);
  }

  return (
    <div>
      <EnTeteExercice
        consigneGenerale={consigneGeneraleExtremums(exercice)}
        blocDonnees={
          <div className="equation-box equation-box-termes">
            {decouperEquationLongueLatex(formatFonctionSourceLatex(exercice)).map((morceau, i) => (
              <Katex key={i} expression={morceau} />
            ))}
          </div>
        }
      />
      <p className="prompt-text">{consignePhaseExtremums(exercice, phase)}</p>
      {phase === "poserEquation" ? (
        <>
          <ApercuExpressionLatex texte={texte} />
          <div className="field">
            <label className="field-label">Équation : </label>
            <input
              type="text"
              className={`text-input${texteErronee ? " is-erronee" : ""}`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={PLACEHOLDER_POSER_EQUATION_EXTREMUMS}
            />
          </div>
        </>
      ) : (
        <>
          <ApercuExpressionLatex texte={texte} label="x =" />
          <div className="field field-inline">
            <label className="field-label field-label-minuscule">x =</label>
            <input
              type="text"
              className={`text-input${texteErronee ? " is-erronee" : ""}`}
              value={texte}
              onChange={(e) => setTexte(e.target.value)}
              placeholder={PLACEHOLDER_ISOLER_X_EXTREMUMS}
            />
          </div>
        </>
      )}
      <AidesTrig niveauAide={niveauAide} aides={phase === "poserEquation" ? aidesPoserEquationExtremums(texteAideNiveau1Extremums(exercice), latexAideNiveau1Extremums(exercice), formatArgumentExtremumsLatex(exercice)) : aidesIsolerX([substitutionIsolerXExtremums(exercice)])} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ={phase === "poserEquation" ? "equation" : "expression"}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCibleExtremums(saisie.soumise, phase, donneesMessagesExtremums(exercice)) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
