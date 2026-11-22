import { Katex } from "../components/Katex";
import type { EntreeRecapitulatif } from "../ui6e/recapitulatif";
import { PanneauRappels } from "../../components/PanneauRappels";

interface Props {
  entrees: EntreeRecapitulatif[];
}

/**
 * Récapitulatif accumulé des étapes déjà closes de l'exercice en cours — équivalent 6e-6h du
 * composant du même nom en 4e/5e-4h : toujours la valeur confirmée (jamais la saisie de l'élève),
 * avec une icône ✓/✗ devant chaque ligne (`entree.revele`). Mise en page partagée (`PanneauRappels`,
 * maquette E du 22/11/2026 : une ligne par écran clos, « Revoir » quand la fiche existe).
 */
export function RecapitulatifPanel({ entrees }: Props) {
  return (
    <PanneauRappels
      entrees={entrees.map((entree) => ({
        cle: entree.libelle,
        libelle: entree.libelle,
        revele: entree.revele,
        valeur:
          entree.valeurs !== undefined ? (
            <span className="equation-box-termes">
              {entree.valeurs.map((valeur, i) => (
                <Katex key={i} expression={valeur} />
              ))}
            </span>
          ) : entree.estLatex ? (
            <Katex expression={entree.valeur} />
          ) : (
            entree.valeur
          ),
      }))}
    />
  );
}
