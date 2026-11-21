/**
 * Profils d'instance (tirage équilibré des évaluations, `AdaptateurFeuilleExercices.profilInstance`,
 * méthode : `.claude/rules/feuilles-evaluations.md`) de 5gen20 (limites) et 5gen21 (asymptote
 * oblique), chapitre 4 de 5e. Mesures (5 000 tirages par variante, scratchpad 5c4-R1/mesure.txt).
 *
 * 5gen20 — cas particuliers (ils RACCOURCISSENT la résolution) :
 * - `cible-zero` : limite en x = 0 (≈ 11 % du nombre réel, 16 % de la forme 0/0, 11 % de la forme
 *   k/0) — la substitution est immédiate et la factorisation se fait par mise en évidence de x ;
 * - `fonction-constante` : nombre réel dont N et D sont proportionnels (≈ 3 %) — la fraction vaut
 *   une constante, rien à calculer ;
 * - `polynome-monome` : limite à l'infini dont N ou D est réduit à son terme dominant (≈ 5 à 10 %).
 * Une limite nulle, le signe d'une limite infinie, une limite qui n'existe pas sont des VERDICTS :
 * jamais filtrés. `forme` = famille et sous-cas VISIBLE dans l'énoncé (degrés comparés en ±∞) ; pour
 * la forme k/0, la racine simple ou double du dénominateur décide si la limite existe (deux limites
 * latérales égales ou non) : c'est un VERDICT, retiré de la `forme` (lots B–D) et tiré par le groupe
 * à verdict `groupe_infinie_point` (la série B ne reproduit plus le verdict de la série A). Niveau
 * et durée constants dans le groupe (4, 9 min dans les deux sous-cas). `calcul` sans objet : valeurs
 * exactes.
 *
 * 5gen21 — paramètres au choix (présents dans les 4 variantes) : coefficient a ≠ ±1 (≈ 20 % de
 * a = ±1) et ordonnée à l'origine b ≠ 0 (≈ 6 % de b = 0). Cas particulier : dénominateur égal à x
 * (≈ 8 % du degré 1 — la division se fait terme à terme). `forme` = technique et degré du
 * dénominateur. `calcul` sans objet.
 * Niveau (rejugé aux lots B–D sur l'énoncé PAPIER) : la consigne impose la technique (division ou
 * limites de a et b) → méthode 0 ; aucune donnée piège (D(x) de degré 2 sans racine, reste non nul) ;
 * deux étapes de calcul sans charge (≤ 9 lignes) et la conclusion lue → niveau 1 justifié.
 *
 * Famille « position » (lots B–D) : `forme` = « position-oblique » ou « position-horizontale » —
 * JAMAIS le verdict (au-dessus / en dessous / recoupe, tiré à parts égales dans la variante) ; aucun
 * cas particulier ; les paramètres a ≠ ±1 et b ≠ 0 y sont sans objet.
 */
import type { ProfilInstance } from "../../export/genererFeuilleExercices";
import type { ExerciceLimite } from "../core5e/limites.types";
import type { ExerciceGen21 } from "../core5e/asymptoteOblique.types";

function cas(liste: (string | false)[]): string | null {
  const presents = liste.filter((c): c is string => !!c);
  return presents.length === 0 ? null : presents.join("+");
}

const estMonome = (coeffs: number[]) => coeffs.slice(0, -1).every((c) => c === 0);

/** Groupe à verdict de 5gen20 : le nom « racine simple / double » dit si la limite existe. */
export const GROUPES_VERDICT_LIMITES = [
  { id: "groupe_infinie_point", label: "Limite infinie en un point (racine simple ou double tirée au hasard)", variantes: ["limiteInfiniePoint-racineSimple", "limiteInfiniePoint-racineDouble"] },
];

export const LIBELLE_CAS_LIMITES = "Inclure un cas particulier (limite en x = 0, fonction constante, ou polynôme réduit à un seul terme)";

export function profilLimite(e: ExerciceLimite): ProfilInstance {
  switch (e.famille) {
    case "limiteReelle":
      return { casParticulier: cas([e.a === 0 && "cible-zero", e.kN * e.bD === e.kD * e.bN && "fonction-constante"]), forme: "limiteReelle" };
    case "formeIndeterminee":
      return { casParticulier: cas([e.a === 0 && "cible-zero"]), forme: "formeIndeterminee" };
    case "limiteInfiniePoint":
      return { casParticulier: cas([e.a === 0 && "cible-zero"]), forme: "limiteInfiniePoint" };
    case "limiteInfini":
      return { casParticulier: cas([(estMonome(e.coeffsN) || estMonome(e.coeffsD)) && "polynome-monome"]), forme: `limiteInfini-${e.sousCas}` };
  }
}

/** Paramètres de l'asymptote oblique y = ax + b que le professeur choisit d'inclure (cases cochées
 * par défaut) ; une case décochée impose ce paramètre neutre dans toutes les questions de la ligne. */
export const PARAMETRES_ASYMPTOTE_OBLIQUE = [
  { id: "a-egal-1", label: "Coefficient a ≠ ±1" },
  { id: "b-nul", label: "Ordonnée à l'origine b ≠ 0" },
];

export const LIBELLE_CAS_ASYMPTOTE_OBLIQUE = "Inclure un cas particulier (dénominateur égal à x)";

export function profilAsymptoteOblique(e: ExerciceGen21): ProfilInstance {
  if (e.variante === "position") return { casParticulier: null, forme: `position-${e.asymptote}`, parametresNonApplicables: PARAMETRES_ASYMPTOTE_OBLIQUE.map((p) => p.id) };
  const degre = e.coeffsD.length - 1;
  return {
    casParticulier: cas([Math.abs(e.a) === 1 && "a-egal-1", e.b === 0 && "b-nul", degre === 1 && e.coeffsD[0] === 0 && "denominateur-x"]),
    forme: `${e.variante}-degre${degre}`,
  };
}
