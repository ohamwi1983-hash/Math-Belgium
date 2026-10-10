import { useState } from "react";
import type { ExerciceAnalyseFonction, ReponseAxeSommet } from "../core/analyseFonction.types";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";
import { Katex } from "./Katex";
import { consigneAxeSommet, formatFonctionOrdreLatex } from "../ui/formatAnalyseFonction";
import { calculerCourbeAxeSommet, calculerSketchAxeSommet } from "../ui/sketchAxeSommet";
import { SketchAxeSommet } from "./SketchAxeSommet";
import { diagnostiquerAxeSommet, parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { formatMessageErreur } from "../ui/messageErreur";
import { BoutonAide } from "./BoutonAide";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseAxeSommet) => void;
}

/**
 * Étape 3 : axe de symétrie (texte libre "x=...") puis xS et yS (champs numériques, fractions
 * "p/q" acceptées). Le rappel textuel/visuel de l'allure (étape 2) n'apparaît plus sur cet écran
 * (point 1, prompt-4-modifications-analyse-fonction.md) — remplacé par un bouton "Aide" qui
 * affiche le croquis Ox/Oy partagé (S positionné selon les signes de xS/yS, c toujours marqué sur
 * Oy). L'entrée "Allure" est filtrée du récapitulatif spécifiquement sur cet écran ; elle continue
 * d'apparaître normalement sur les écrans suivants.
 */
export function EtapeAxeSommet({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const [axeTexte, setAxeTexte] = useState("");
  const [xS, setXS] = useState("");
  const [yS, setYS] = useState("");

  const complet = axeTexte.trim() !== "" && xS.trim() !== "" && yS.trim() !== "";
  const reponse = {
    axeTexte,
    xS: parserNombreOuFraction(xS) ?? NaN,
    yS: parserNombreOuFraction(yS) ?? NaN,
  };
  const statut = complet ? diagnostiquerAxeSommet(exercice, reponse) : undefined;
  const erronee = tentativesUtilisees > 0 && statut !== undefined && statut !== "correct";
  const { enonce } = exercice.exercice;
  const recapitulatifSansAllure = recapitulatif.filter((entree) => entree.libelle !== "Allure");
  const geom = calculerSketchAxeSommet(exercice.xS, exercice.yS, enonce.c);
  const signeA = enonce.a > 0 ? "+" : "-";
  const courbe = calculerCourbeAxeSommet(geom, signeA);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatifSansAllure} />
      <div className="equation-box">
        <Katex expression={formatFonctionOrdreLatex(exercice.exercice.enonce, exercice.ordreTermes)} block />
      </div>
      <p className="prompt-text">{consigneAxeSommet()}</p>
      {aideActivee && <SketchAxeSommet geom={geom} courbe={courbe} signeA={signeA} />}
      <div className="field">
        <label className="field-label" htmlFor="axe-symetrie">
          Axe de symétrie AS ≡
        </label>
        <input
          id="axe-symetrie"
          className={`text-input${erronee ? " is-erronee" : ""}`}
          placeholder="x = ... (fraction p/q acceptée)"
          value={axeTexte}
          onChange={(e) => setAxeTexte(e.target.value)}
        />
      </div>
      <div className="field-row">
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="xs">
            <Katex expression="x_S =" />
          </label>
          <input id="xs" className={`text-input${erronee ? " is-erronee" : ""}`} value={xS} onChange={(e) => setXS(e.target.value)} />
        </div>
        <div className="field field-inline">
          <label className="field-label field-label-minuscule" htmlFor="ys">
            <Katex expression="y_S =" />
          </label>
          <input id="ys" className={`text-input${erronee ? " is-erronee" : ""}`} value={yS} onChange={(e) => setYS(e.target.value)} />
        </div>
      </div>
      <BoutonAide niveauAide={aideActivee ? 1 : 0} niveauAideMax={1} onActiverAide={onActiverAide} />
      <button
        type="button"
        className="btn btn-primary"
        disabled={!complet}
        onClick={() => onValider(reponse)}
      >
        Valider
      </button>
      {tentativesUtilisees > 0 && (
        <p className="alert-error" role="alert">
          {formatMessageErreur(tentativesUtilisees, tentativesMax, statut)}
        </p>
      )}
    </div>
  );
}
