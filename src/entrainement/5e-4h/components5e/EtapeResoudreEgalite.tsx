import { useState } from "react";
import type { ExerciceEgaliteExpressions } from "../core5e/equationsTrigonometriques.types";
import { CONSIGNE_RESOUDRE_EGALITE, egaliteArgumentsLatex, fonctionEgalite, formatEnonceEgaliteLatex } from "../ui5e/formatEquationTrigonometrique";
import { CONSIGNE_GENERALE_EQUATION_TRIG } from "../ui5e/formatEquationTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import { EnTeteExercice } from "./EnTeteExercice";
import { aidesResoudreEgalite, messageCibleSeriesX } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceEgaliteExpressions;
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

/** Écran 2 (famille "egalite", fusionne "appliquer l'identité"/"isoler x" de la spec) — résoudre x
 * directement, add-as-needed pré-rempli au nombre de branches réelles (1 pour tanVersTan, 2
 * sinon). */
export function EtapeResoudreEgalite({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [lignes, setLignes] = useState<string[]>(() => Array.from({ length: Math.max(1, exercice.branches.length) }, () => ""));
  const saisie = useTentativeLisible<string[]>();
  const montrerErreurs = tentativesUtilisees > 0;
  const lignesErronee = (saisie.illisible || montrerErreurs) && !!diagnostiquer && diagnostiquer(lignes) !== "correct";
  const complet = lignes.length > 0 && lignes.every((l) => l.trim() !== "");

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
            <Katex expression={formatEnonceEgaliteLatex(exercice)} block />
          </div>
        }
      />
      <p className="prompt-text">{CONSIGNE_RESOUDRE_EGALITE}</p>
      {lignes.map((ligne, i) => (
        <div key={i}>
          <ApercuExpressionLatex texte={ligne} />
          <div className="field-row">
            <input
              type="text"
              className={`text-input${lignesErronee ? " is-erronee" : ""}`}
              value={ligne}
              onChange={(e) => setLignes((arr) => arr.map((v, j) => (j === i ? e.target.value : v)))}
              placeholder="ex : pi/5 + k*2*pi/7"
            />
            {lignes.length > 1 && (
              <button type="button" className="btn liste-morceaux-retirer" aria-label="Retirer" onClick={() => setLignes((arr) => arr.filter((_, j) => j !== i))}>
                ×
              </button>
            )}
          </div>
        </div>
      ))}
      <button type="button" className="btn" onClick={() => setLignes((arr) => [...arr, ""])}>
        + Ajouter une série
      </button>
      <AidesTrig niveauAide={niveauAide} aides={aidesResoudreEgalite(fonctionEgalite(exercice), egaliteArgumentsLatex(exercice))} />
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
          cible={montrerErreurs && saisie.soumise ? messageCibleSeriesX(saisie.soumise, exercice.branches, fonctionEgalite(exercice)) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
