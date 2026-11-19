import type { AdaptateurFeuilleExercices, CatalogueVarianteEntree, GroupeVerdict } from "./genererFeuilleExercices";

/**
 * Groupes de variantes « à verdict » (décision de l'utilisateur, audit 4e ch. 2) : dans le panneau
 * d'ÉVALUATION seulement, une seule rangée par groupe ; la variante réelle de chaque question est
 * tirée par `construirePlan` (`lib/evaluationLocal.ts`), équilibrée d'une série à l'autre. Voir
 * `AdaptateurFeuilleExercices.groupesVerdict` et `.claude/rules/feuilles-evaluations.md`.
 */

type AvecGroupes = Pick<AdaptateurFeuilleExercices<unknown>, "groupesVerdict" | "catalogueVariantes">;

/** Le groupe d'id `id`, ou `undefined` si `id` est une variante ordinaire. */
export function groupeVerdict(adaptateur: AvecGroupes | undefined, id: string | null | undefined): GroupeVerdict | undefined {
  if (!id) return undefined;
  return adaptateur?.groupesVerdict?.find((g) => g.id === id);
}

/** Variantes membres d'un id (celles du groupe, ou l'id lui-même s'il n'est pas un groupe). */
export function variantesDe(adaptateur: AvecGroupes | undefined, id: string): string[] {
  return groupeVerdict(adaptateur, id)?.variantes ?? [id];
}

/** Catalogue du panneau d'évaluation : chaque groupe remplace ses membres (à la place du premier
 * d'entre eux) ; un membre reste visible s'il est dans `clesActives` (plan enregistré avant le
 * regroupement), pour ne jamais cacher une question déjà demandée. */
export function catalogueAvecGroupes(catalogue: CatalogueVarianteEntree[], groupes: GroupeVerdict[] | undefined, clesActives: string[] = []): CatalogueVarianteEntree[] {
  if (!groupes || groupes.length === 0) return catalogue;
  const resultat: CatalogueVarianteEntree[] = [];
  for (const variante of catalogue) {
    const groupe = groupes.find((g) => g.variantes.includes(variante.id));
    if (!groupe) {
      resultat.push(variante);
      continue;
    }
    if (groupe.variantes[0] === variante.id || (!resultat.some((v) => v.id === groupe.id) && !catalogue.some((v) => v.id === groupe.variantes[0]))) {
      resultat.push({ id: groupe.id, label: groupe.label });
    }
    if (clesActives.includes(variante.id)) resultat.push(variante);
  }
  return resultat;
}

/** Variante membre tirée au hasard (estimation du niveau et de la durée d'une rangée de groupe). */
export function membreAuHasard(adaptateur: AvecGroupes | undefined, id: string): string {
  const membres = variantesDe(adaptateur, id);
  return membres[Math.floor(Math.random() * membres.length)]!;
}
