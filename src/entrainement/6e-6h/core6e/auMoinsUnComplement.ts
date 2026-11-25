import { C } from "../ui6e/nombresCombinatoireLotH2";

/**
 * Couche core — `6gen105` « Au moins un : le complément » (6e ch. 7, § 2, processus 3 TRANSFÉRER).
 * Un groupe de k éléments est choisi (sans ordre, sans répétition) dans une population de a éléments
 * « ciblés » (femmes, as, ampoules défectueuses, élèves de 6e) et b autres. La question porte sur le
 * nombre de groupes qui contiennent AU MOINS UN, AU PLUS UN ou EXACTEMENT j éléments ciblés.
 *
 * Écran 1 (choix fermé, une tentative) : la STRATÉGIE la plus directe — c'est un VERDICT, tiré à parts
 * égales AVANT les nombres (jamais dans `forme`) :
 * - « au moins un » → le contraire : tous − aucun ;
 * - « au plus un » → deux cas disjoints : aucun + exactement un ;
 * - « exactement j » → un seul produit : Cₐʲ · C_bᵏ⁻ʲ.
 * Le leurre permanent « imposer un élément ciblé puis compléter librement » (a · Cₙ₋₁ᵏ⁻¹) compte
 * plusieurs fois les groupes qui ont plusieurs éléments ciblés : message ciblé à l'écran 1 et à
 * l'écran 3. Avec a ≥ 3 et k ≥ 3, la stratégie juste est la SEULE à deux termes (séparer « au moins
 * un » en cas demande au moins trois termes ; « au plus un » par le contraire aussi).
 * Écran 2 : les deux nombres de la stratégie (deux champs) ; écran 3 : le résultat.
 */

export type ContexteAMU = "comite" | "cartes" | "defectueuses" | "delegation";
export type EvenementAMU = "auMoinsUn" | "auPlusUn" | "exactement";
export type StrategieAMU = "complement" | "somme" | "direct" | "imposer";
export type PhaseAMU = "strategie" | "termes" | "resultat";

export const PHASES_AMU: PhaseAMU[] = ["strategie", "termes", "resultat"];
export const EVENEMENTS_AMU: EvenementAMU[] = ["auMoinsUn", "auPlusUn", "exactement"];

export interface ExerciceAMU {
  variante: ContexteAMU;
  evenement: EvenementAMU;
  /** Éléments ciblés, autres éléments, taille du groupe ; j = nombre exact (« exactement »), sinon 0. */
  a: number;
  b: number;
  k: number;
  j: number;
  /** Ordre d'affichage des quatre stratégies (le `?code=` rouvre le même ordre). */
  options: StrategieAMU[];
}

export const N = (e: ExerciceAMU): number => e.a + e.b;

export function strategieJuste(e: ExerciceAMU): StrategieAMU {
  return e.evenement === "auMoinsUn" ? "complement" : e.evenement === "auPlusUn" ? "somme" : "direct";
}

/** Les deux nombres de l'écran 2, dans l'ordre des champs. */
export function termes(e: ExerciceAMU): [number, number] {
  switch (strategieJuste(e)) {
    case "complement":
      return [C(N(e), e.k), C(e.b, e.k)];
    case "somme":
      return [C(e.b, e.k), e.a * C(e.b, e.k - 1)];
    default:
      return [C(e.a, e.j), C(e.b, e.k - e.j)];
  }
}

export function resultat(e: ExerciceAMU): number {
  const [t1, t2] = termes(e);
  const s = strategieJuste(e);
  return s === "complement" ? t1 - t2 : s === "somme" ? t1 + t2 : t1 * t2;
}

/** Nombre de groupes avec exactement i éléments ciblés. */
export const exactementI = (e: ExerciceAMU, i: number): number => C(e.a, i) * C(e.b, e.k - i);

/** Résultat FAUX de la stratégie « imposer un élément ciblé, puis compléter librement ». */
export const valeurImposer = (e: ExerciceAMU): number => e.a * C(N(e) - 1, e.k - 1);
