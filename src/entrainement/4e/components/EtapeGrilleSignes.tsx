import { useState } from "react";
import type { ExerciceSignesProduit, Grille, ValeurCellule } from "../core/signesProduit.types";
import { Katex } from "./Katex";
import { formatEnTeteInterieur, formatLigneLabel, formatTermesEnonceSignesProduitFactoriseLatex } from "../ui/formatSignesProduit";
import { celluleEstErronee, cyclerValeurCellule, grilleEstComplete } from "../ui/cycleValeurCellule";
import { ordreLignesGrille } from "../generateurs/signesProduit/grille";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { RecapitulatifPanel } from "./RecapitulatifPanel";

interface Props {
  exercice: ExerciceSignesProduit;
  tentativesUtilisees: number;
  tentativesMax: number;
  recapitulatif: EntreeRecapitulatif[];
  aideActivee: boolean;
  onActiverAide: () => void;
  onValider: (reponse: Grille) => void;
}

/**
 * Étape "tableau de signes" (prompt-refonte-tableau-signes.md,
 * promptgenerateur5signesProduit.md point 2), conforme au modèle classique : ligne d'en-tête "x"
 * (racines croissantes encadrées par -∞/+∞), colonnes alternées zone (large) / point (étroite, à
 * l'aplomb de chaque racine), une ligne par facteur P0/P1/P2 (ordreLignesGrille, jamais recalculé
 * différemment de exercice.grille) plus la ligne finale "signe du produit". L'inéquation affichée
 * montre la décomposition complète en facteurs (formatEnonceSignesProduitFactoriseLatex,
 * promptgenerateur5signesProduit.md point 8) : tous les facteurs de cet exercice ont déjà été
 * factorisés/identifiés aux étapes précédentes. Chaque cellule cycle ?→+→-→0→+
 * (cyclerValeurCellule), validée en un seul essai global pour toute la grille. Après une tentative
 * échouée (tentativesUtilisees > 0), les cellules remplies mais fausses passent en rouge
 * (comparaison en direct contre exercice.grille — voir celluleEstErronee — disparaît dès que
 * l'élève corrige) ; les cellules correctes restent en noir, sans mise en valeur positive.
 */
export function EtapeGrilleSignes({
  exercice,
  tentativesUtilisees,
  tentativesMax,
  recapitulatif,
  aideActivee,
  onActiverAide,
  onValider,
}: Props) {
  const refs = ordreLignesGrille(exercice.facteurs);
  const entete = formatEnTeteInterieur(exercice.racines);
  const nbColonnes = entete.length;

  const [lignes, setLignes] = useState<(ValeurCellule | null)[][]>(() => refs.map(() => Array(nbColonnes).fill(null)));
  const [produit, setProduit] = useState<(ValeurCellule | null)[]>(() => Array(nbColonnes).fill(null));

  function cyclerCellule(ligne: number, colonne: number) {
    setLignes((etat) => etat.map((row, i) => (i === ligne ? row.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)) : row)));
  }

  function cyclerProduit(colonne: number) {
    setProduit((etat) => etat.map((v, j) => (j === colonne ? cyclerValeurCellule(v) : v)));
  }

  const complet = grilleEstComplete(lignes, produit);
  const montrerErreurs = tentativesUtilisees > 0;

  function classeCellule(saisie: ValeurCellule | null, attendu: ValeurCellule): string {
    return montrerErreurs && celluleEstErronee(saisie, attendu) ? "btn toggle-signe is-erronee" : "btn toggle-signe";
  }

  function valider() {
    if (!complet) return;
    onValider({ lignes: lignes as ValeurCellule[][], produit: produit as ValeurCellule[] });
  }

  return (
    <div>
      <RecapitulatifPanel entrees={recapitulatif} />
      <div className="equation-box equation-box-termes">
        {formatTermesEnonceSignesProduitFactoriseLatex(exercice).map((terme, i) => (
          <Katex key={i} expression={terme} />
        ))}
      </div>
      <p className="prompt-text">Complète le tableau de signes.</p>

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
                </th>
              ))}
              <th className="grille-signes-borne">
                <Katex expression="+\infty" />
              </th>
            </tr>
          </thead>
          <tbody>
            {refs.map((ref, i) => (
              <tr key={i}>
                <td className="grille-signes-label">
                  <Katex expression={formatLigneLabel(exercice.facteurs, ref)} />
                </td>
                <td className="grille-signes-borne" />
                {lignes[i].map((valeur, j) => (
                  <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                    <button
                      type="button"
                      className={classeCellule(valeur, exercice.grille.lignes[i][j])}
                      onClick={() => cyclerCellule(i, j)}
                    >
                      {valeur ?? "?"}
                    </button>
                  </td>
                ))}
                <td className="grille-signes-borne" />
              </tr>
            ))}
            <tr>
              <td className="grille-signes-label">Signe du produit</td>
              <td className="grille-signes-borne" />
              {produit.map((valeur, j) => (
                <td key={j} className={j % 2 === 0 ? "grille-signes-zone" : "grille-signes-point"}>
                  <button
                    type="button"
                    className={classeCellule(valeur, exercice.grille.produit[j])}
                    onClick={() => cyclerProduit(j)}
                  >
                    {valeur ?? "?"}
                  </button>
                </td>
              ))}
              <td className="grille-signes-borne" />
            </tr>
          </tbody>
        </table>
      </div>

      <div>
        {aideActivee && (
          <p className="prompt-text">
            Rappel : dans chaque colonne, un nombre pair de facteurs négatifs donne un produit positif ; un nombre
            impair donne un produit négatif.
          </p>
        )}
        <button type="button" className="btn btn-aide" disabled={aideActivee} onClick={onActiverAide}>
          {aideActivee ? "Aide utilisée" : "Aide"}
        </button>
      </div>
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
