import { Katex } from "./Katex";
import type { EntreeRecapitulatif } from "../ui/recapitulatif";
import { PanneauRappels } from "../../components/PanneauRappels";

interface Props {
  entrees: EntreeRecapitulatif[];
}

/**
 * Récapitulatif accumulé des étapes déjà closes de l'exercice en cours — même contenu qu'avant
 * (`calculerRecapitulatif*`, jamais la saisie de l'élève, toujours la valeur confirmée), avec une
 * icône ✓/✗ devant chaque ligne (`entree.revele`) — design "Ce qu'on sait déjà" validé avec
 * l'utilisateur. Mise en page partagée (`PanneauRappels`, maquette E du 22/11/2026 : une ligne par
 * écran clos, ✓ jaune si réussi avec aide, « Revoir » quand la fiche existe).
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
