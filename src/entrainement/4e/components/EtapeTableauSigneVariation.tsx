import { useState } from "react";
import type { ExerciceAnalyseFonction, ValeurVariation } from "../core/analyseFonction.types";
import type { ValeurCellule } from "../core/signesProduit.types";
import type { ReponseGrilleSigneVariation } from "../moteur/verificationAnalyseFonction";
import { Katex } from "./Katex";
import { formatFonctionOrdreLatex } from "../ui/formatAnalyseFonction";
import { formatEnTeteSigneVariation } from "../ui/formatTableauSigneVariation";
import { celluleEstErronee, cyclerValeurCellule } from "../ui/cycleValeurCellule";
import { celluleVariationErronee, cyclerValeurVariation, ligneVariationEstComplete } from "../ui/cycleValeurVariation";
import {
  calculerCourbeAxeSommet,
  calculerMarquesOx,
  calculerSketchAxeSommet,
  calculerSurlignageImf,
} from "../ui/sketchAxeSommet";
import { SketchAxeSommet } from "./SketchAxeSommet";
import { SymboleVariation } from "./SymboleVariation";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";

interface Props {
  exercice: ExerciceAnalyseFonction;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: ReponseGrilleSigneVariation) => void;
}

/**
 * Étape 6 : tableau "signe et variation" — structure propre à cet exercice, distincte du tableau
 * de signes générique (exercice 2) et de la grille multi-facteurs (exercice 5), jamais réutilisés
 * ici. En-tête = racine(s) et x_S fusionnés/triés (grilleSigneVariation.colonnesValeurs) ; ligne
 * "signe de f(x)" cycle ?→+→-→0→+ (comme la grille de l'exercice 5) ; ligne "variation" cycle à 4
 * états uniformes sur toutes les colonnes, x_S comprise, sans retour à "?"
 * (prompt-4-modifications-analyse-fonction.md, point 4) — c'est à l'élève de repérer lui-même que
 * seule la colonne x_S doit recevoir un symbole de sommet. Validée en un seul essai global, tout
 * ou rien. Bouton "Aide" (révélation à sens unique, ×0,5) : croquis Ox/Oy avec surlignage vert et
 * racines/x_S marqués sur Ox.
 */
export function EtapeTableauSigneVariation({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const { grilleSigneVariation } = exercice;
  const entete = formatEnTeteSigneVariation(grilleSigneVariation.colonnesValeurs);
  const nbColonnes = entete.length;
  const indexSommetLigne = 2 * grilleSigneVariation.indexSommet + 1;

  const [ligneSigne, setLigneSigne] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));
  const [ligneVariation, setLigneVariation] = useState<(ValeurVariation | null)[]>(() => Array(nbColonnes).fill(null));

  function cyclerSigne(colonne: number) {
    setLigneSigne((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }

  function cyclerVariation(colonne: number) {
    setLigneVariation((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurVariation(v) : v)));
  }

  const complet = ligneSigne.every((v) => v !== null) && ligneVariationEstComplete(ligneVariation);
  const montrerErreurs = tentativesUtilisees > 0;

  function valider() {
    if (!complet) return;
    onValider({
      ligneSigne: ligneSigne as ValeurCellule[],
      ligneVariation: ligneVariation as ValeurVariation[],
    });
  }

  const { enonce } = exercice.exercice;
  const signeA = enonce.a > 0 ? "+" : "-";
  const geom = calculerSketchAxeSommet(exercice.xS, exercice.yS, enonce.c);
  const surlignage = calculerSurlignageImf(geom, signeA);
  // Catégorie "irreductible" (Δ<0, prompt-cas-non-factorisable.md) : solution.racines vaut
  // [NaN, NaN] (jamais de racine réelle) — ne jamais la transmettre telle quelle à
  // calculerMarquesOx, qui doit alors ne recevoir aucune racine (seul x_S est marqué sur Ox).
  const racinesReelles = exercice.exercice.categorie === "irreductible" ? [] : exercice.exercice.solution.racines;
  const marquesOx = calculerMarquesOx(geom, signeA, racinesReelles, exercice.xS);
  const courbe = calculerCourbeAxeSommet(geom, signeA);

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box">
        <Katex expression={formatFonctionOrdreLatex(exercice.exercice.enonce, exercice.ordreTermes)} block />
      </div>
      <p className="prompt-text">Complète le tableau de signe et de variation.</p>

      {aideActivee && <SketchAxeSommet geom={geom} courbe={courbe} signeA={signeA} surlignage={surlignage} marquesOx={marquesOx} />}

      <div className="grille-signes-scroll">
        <table className="grille-signes">
          <thead>
            <tr>
              <th className="grille-signes-label">x</th>
              <th className="grille-signes-borne">
                <Katex expression="-\infty" />
              </th>
              {entete.map((valeur, j) => (
                <th key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  {valeur !== "" && <Katex expression={valeur} />}
                  {j === indexSommetLigne && (
                    <div className="grille-signe-variation-sommet-label">
                      <Katex expression="x_S" />
                    </div>
                  )}
                </th>
              ))}
              <th className="grille-signes-borne">
                <Katex expression="+\infty" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="grille-signes-label">Signe de f(x)</td>
              <td className="grille-signes-borne" />
              {ligneSigne.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button
                    type="button"
                    className={
                      montrerErreurs && celluleEstErronee(valeur, grilleSigneVariation.ligneSigne[j])
                        ? "btn toggle-signe is-erronee"
                        : "btn toggle-signe"
                    }
                    onClick={() => cyclerSigne(j)}
                  >
                    {valeur ?? "?"}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
            <tr>
              <td className="grille-signes-label">Variation</td>
              <td className="grille-signes-borne" />
              {ligneVariation.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button
                    type="button"
                    className={
                      montrerErreurs && celluleVariationErronee(valeur, grilleSigneVariation.ligneVariation[j])
                        ? "btn toggle-signe is-erronee"
                        : "btn toggle-signe"
                    }
                    onClick={() => cyclerVariation(j)}
                  >
                    {valeur === null ? "?" : <SymboleVariation valeur={valeur} />}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
          </tbody>
        </table>
      </div>

      <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
        {aideActivee ? "Aide utilisée" : "Aide"}
      </button>
      <button type="button" className="btn btn-primary" disabled={!complet} onClick={valider}>
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
