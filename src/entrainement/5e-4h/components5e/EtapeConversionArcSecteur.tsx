import { useState } from "react";
import type { ExerciceModeConversion } from "../core5e/arcsSecteurs.types";
import { consigneConversion, labelReponseConversion, latexAideConversionNiveau2, latexEnonceConversion } from "../ui5e/formatArcsSecteurs";
import { aidesConversion, messageCibleConversion } from "../ui5e/aidesTrigonometrie";
import { AidesTrig, RetourSaisieTrig, estLisible, useTentativeLisible } from "./RetourSaisieTrig";
import { ApercuExpressionLatex } from "../components/ApercuExpressionLatex";
import { Katex } from "../components/Katex";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import { BoutonAide } from "./BoutonAide";
import type { StatutVerification } from "../moteur/statutVerification";

interface Props {
  exercice: ExerciceModeConversion;
  tentativesUtilisees: number;
  tentativesMax: number;
  niveauAide: number;
  niveauAideMax: number;
  onActiverAide: () => void;
  onValider: (texte: string) => void;
  /** Statut à 3 valeurs calculé côté présentation (promptcorrectionsregroupees.md, A.1), jamais
   * consommé par le score — optionnel, comportement générique inchangé sans lui. */
  diagnostiquer?: (texte: string) => StatutVerification;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le
   * champ, remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md,
   * "validation/invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
}

export function EtapeConversionArcSecteur({ exercice, tentativesUtilisees, tentativesMax, niveauAide, niveauAideMax, onActiverAide, onValider, diagnostiquer, validation}: Props) {
  const [texte, setTexte] = useState("");
  const saisie = useTentativeLisible<string>();
  const montrerErreurs = tentativesUtilisees > 0;
  const texteErronee = saisie.illisible || (montrerErreurs && !!diagnostiquer && diagnostiquer(texte) !== "correct");

  /** Saisie illisible : rien n'est transmis au moteur (aucune tentative consommée). */
  function valider() {
    if (texte.trim() === "") return;
    saisie.tenter(texte, estLisible(diagnostiquer?.(texte)), onValider);
  }

  return (
    <div>
      <p className="prompt-text">{consigneConversion(exercice)}</p>
      <div className="equation-box">
        <Katex expression={latexEnonceConversion(exercice)} />
      </div>
      <ApercuExpressionLatex texte={texte} label={labelReponseConversion(exercice)} />
      <div className="field field-inline">
        <label className="field-label field-label-minuscule">{labelReponseConversion(exercice)}</label>
        <input type="text" className={`text-input${texteErronee ? " is-erronee" : ""}`} value={texte} onChange={(e) => setTexte(e.target.value)} placeholder={exercice.direction === "degVersRad" ? "ex : 5π" : "ex : 37,5"} />
      </div>
      <AidesTrig niveauAide={niveauAide} aides={aidesConversion(latexAideConversionNiveau2(exercice))} />
      {!validation && (
        <>
        <BoutonAide niveauAide={niveauAide} niveauAideMax={niveauAideMax} onActiverAide={onActiverAide} />
        <button type="button" className="btn btn-primary" disabled={texte.trim() === ""} onClick={valider}>
          Valider
        </button>
        <RetourSaisieTrig
          illisible={saisie.illisible}
          champ={exercice.direction === "degVersRad" ? "angleRad" : "angleDeg"}
          tentativesUtilisees={tentativesUtilisees}
          tentativesMax={tentativesMax}
          cible={montrerErreurs && saisie.soumise ? messageCibleConversion(saisie.soumise, exercice) : null}
        />
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
