import type { ExerciceTableauLimites } from "../core5e/tableauLimitesGraphique";
import { lettreCorrecte } from "../core5e/tableauLimitesGraphique";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseTableauLimites } from "../ui5e/formatTableauLimites";
import { estOblique, messageIntrus } from "../ui5e/formatTableauLimites";
import { lireFonctionX, memesValeurs } from "./lectureLimitesLotG";
import { lireValeur } from "./lectureValeurTrigo";

/**
 * Vérification de `5gen66`. Graphique : lettre comparée (choix fermé, une tentative ; message ciblé
 * sur l'erreur que porte l'intrus choisi). Asymptotes : saisie LUE avant le verdict (illisible →
 * `parse_error`, aucune tentative) ; préfixe « x = » / « y = » recopié ignoré ; deux asymptotes
 * verticales acceptées dans n'importe quel ordre ; droite oblique comparée en cinq points.
 */

type E = ExerciceTableauLimites;
const st = (ok: boolean): StatutVerification => (ok ? "correct" : "not_equivalent");
const nb = (s: string): number | null => lireValeur(s.replace(/^\s*[a-z]\s*=/i, ""));
const PTS = [-3.3, -1.1, 0.4, 2.2, 4.7];

export function diagnostiquer(e: E, p: PhaseTableauLimites, valeurs: string[]): StatutVerification[] {
  const s = e.sit;
  if (p === "graphique") return [st(valeurs[0] === lettreCorrecte(e))];
  if (p === "av") {
    const v = valeurs.map(nb);
    if (s.av.length === 1) return [v[0] === null ? "parse_error" : st(v[0] === s.av[0])];
    if (v.some((x) => x === null)) return v.map((x) => (x === null ? "parse_error" : "not_equivalent"));
    const [a, b] = v as number[];
    const ok = (a === s.av[0] && b === s.av[1]) || (a === s.av[1] && b === s.av[0]);
    if (ok) return ["correct", "correct"];
    return [st(s.av.includes(a!) && a !== b), st(s.av.includes(b!) && a !== b)];
  }
  if (estOblique(s) && s.droite.type === "o") {
    const f = lireFonctionX(valeurs[0] ?? "");
    if (!f) return ["parse_error"];
    const { m, q } = s.droite;
    return [st(memesValeurs(f, (x) => m * x + q, PTS))];
  }
  if (e.variante === "deuxAh" && s.gauche.type === "h" && s.droite.type === "h") {
    const a = nb(valeurs[0] ?? "");
    const b = nb(valeurs[1] ?? "");
    return [a === null ? "parse_error" : st(a === s.gauche.L), b === null ? "parse_error" : st(b === s.droite.L)];
  }
  const v = nb(valeurs[0] ?? "");
  return [v === null ? "parse_error" : st(s.droite.type === "h" && v === s.droite.L)];
}

export function piege(e: E, p: PhaseTableauLimites, valeurs: string[]): Frag[] | null {
  const s = e.sit;
  if (p === "graphique") return messageIntrus(e, valeurs[0] ?? "");
  const ahs = [s.gauche, s.droite].filter((b) => b.type === "h").map((b) => (b as { L: number }).L);
  if (p === "av") {
    const v = valeurs.map(nb);
    if (v.some((x) => x !== null && ahs.includes(x) && !s.av.includes(x))) return [tx("Une asymptote verticale se lit là où la limite est infinie, quand x tend vers une valeur ; la limite finie en l'infini donne, elle, une asymptote horizontale.")];
    return null;
  }
  if (estOblique(s)) {
    const f = lireFonctionX(valeurs[0] ?? "");
    if (f && s.droite.type === "o" && memesValeurs(f, () => (s.droite as { q: number }).q, PTS)) return [tx("C'est une droite horizontale : l'asymptote oblique a une pente, lue sur la dernière ligne du tableau.")];
    return null;
  }
  const v = valeurs.map(nb);
  if (v.some((x) => x !== null && s.av.includes(x))) return [tx("Une asymptote horizontale se lit en "), lx("-\\infty"), tx(" et en "), lx("+\\infty"), tx(" : c'est la limite finie de f(x), pas une valeur de x.")];
  if (e.variante === "deuxAh" && s.gauche.type === "h" && s.droite.type === "h" && v[0] === s.droite.L && v[1] === s.gauche.L) return [tx("Tu as échangé les deux : la première est la limite en "), lx("-\\infty"), tx(".")];
  return null;
}
