import { Katex } from "../components/Katex";
import type { EntreeRecapitulatif } from "../ui5e/recapitulatif";
import { PanneauRappels } from "../../components/PanneauRappels";

interface Props {
  entrees: EntreeRecapitulatif[];
}

/** `\displaystyle` : les fractions du récapitulatif gardent leur taille de formule (audit 5e ch. 2,
 * point 4) — en mode « inline », KaTeX les réduit à la taille d'un indice. */
function enDisplaystyle(latex: string): string {
  return latex.trimStart().startsWith("\\displaystyle") ? latex : `\\displaystyle ${latex}`;
}

/**
 * Récapitulatif accumulé des étapes déjà closes de l'exercice en cours — équivalent 5e-4h du
 * composant 4e du même nom : toujours la valeur confirmée (jamais la saisie de l'élève), avec une
 * icône ✓/✗ devant chaque ligne (`entree.revele`). Mise en page partagée (`PanneauRappels`, maquette
 * E du 22/11/2026 : une ligne par écran clos, « Revoir » quand la fiche existe).
 */
export function RecapitulatifPanel({ entrees }: Props) {
  return (
    <PanneauRappels
      entrees={entrees.map((entree, index) => ({
        // Clé indexée : deux lignes peuvent porter le même libellé (θ₁ et θ₂ en « θ (radians) »).
        cle: `${index}-${entree.libelle}`,
        libelle: entree.libelle,
        revele: entree.revele,
        valeur:
          entree.valeurs !== undefined ? (
            <span className="equation-box-termes">
              {entree.valeurs.map((valeur, i) => (
                <Katex key={i} expression={enDisplaystyle(valeur)} />
              ))}
            </span>
          ) : entree.estLatex ? (
            <Katex expression={enDisplaystyle(entree.valeur)} />
          ) : (
            entree.valeur
          ),
      }))}
    />
  );
}
