import { WeightedTree } from "../../../components/illustrations/WeightedTree";
import type { ExerciceFamilleD } from "../core6e/tiragesArbres.types";
import { LETTRES_BRANCHES_D, branchesArbreD } from "../ui6e/formatTiragesArbres";

interface Props {
  exercice: ExerciceFamilleD;
  /** Faux : branches désignées par les lettres a…f (écran à compléter) ; vrai : probabilités
   * (fractions non réduites, composition de l'urne). */
  probabilitesVisibles: boolean;
  /** Chemin mis en évidence (écran 2), sinon aucun. */
  cheminSurligne?: [number, number] | null;
}

/**
 * Arbre pondéré des deux tirages de la famille D (`6gen31`, audit 6e ch. 6, décision D) — réutilise
 * l'illustration `WeightedTree` du site (même dessin que dans le chapitre) plutôt qu'un SVG dédié.
 */
export function ArbrePondereTirages({ exercice, probabilitesVisibles, cheminSurligne = null }: Props) {
  const branches = branchesArbreD(exercice);
  const etiquette = (i: number) => (probabilitesVisibles ? `${branches[i].num}/${branches[i].den}` : LETTRES_BRANCHES_D[i]);
  const i1 = exercice.initiale1;
  const i2 = exercice.initiale2;
  const surligne = (premier: number, second: number) => !!cheminSurligne && cheminSurligne[0] === premier && cheminSurligne[1] === second;
  return (
    <figure className="arbre-pondere-6gen31" style={{ margin: "0 0 12px", maxWidth: 460 }}>
      <WeightedTree
        kind="weightedTree"
        firstLevel={[
          { label: i1, prob: etiquette(0) },
          { label: i2, prob: etiquette(1) },
        ]}
        secondLevel={[
          { fromFirst: 0, label: i1, prob: etiquette(2), highlight: surligne(0, 0) },
          { fromFirst: 0, label: i2, prob: etiquette(3), highlight: surligne(0, 1) },
          { fromFirst: 1, label: i1, prob: etiquette(4), highlight: surligne(1, 0) },
          { fromFirst: 1, label: i2, prob: etiquette(5), highlight: surligne(1, 1) },
        ]}
      />
      <figcaption style={{ fontSize: "0.9em", marginTop: 4, color: "var(--color-text-muted, inherit)" }}>
        {i1} : boule {exercice.labelCouleur1.replace(/s$/, "")} ; {i2} : boule {exercice.labelCouleur2.replace(/s$/, "")}.
        {probabilitesVisibles ? "" : " Les lettres a à f désignent les probabilités à trouver."}
      </figcaption>
    </figure>
  );
}
