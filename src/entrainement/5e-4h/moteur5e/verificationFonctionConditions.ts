import type { ExerciceFonctionConditions } from "../core5e/fonctionConditions";
import { fp, fpp, idSysteme, POINTS_CONTROLE } from "../core5e/fonctionConditions";
import type { StatutVerification } from "../moteur/statutVerification";
import type { Frag } from "../ui5e/ecransTrigo.types";
import { lx, tx } from "../ui5e/ecransTrigo.types";
import type { PhaseFonctionConditions } from "../ui5e/formatFonctionConditions";
import { egal, lireFonctionVar, lireNombre, memesFonctions, statut, statutNombre } from "./lectureApplicationsDerivees";

/**
 * Vérification de `5gen69`. Saisie LUE avant le verdict (illisible → `parse_error`, aucune
 * tentative) : nombres par `lireNombre`, dérivée comparée en six points (toute écriture équivalente,
 * forme factorisée comprise). Choix fermés (système, nature) : une tentative. Messages ciblés : c et d
 * échangés, pente non nulle d'une tangente horizontale, f et f′ échangées, c et d oubliés, dérivée
 * sans les exposants, a et b échangés, c oublié dans f′, f′ donnée pour f″.
 */

type E = ExerciceFonctionConditions;

export function diagnostiquer(e: E, p: PhaseFonctionConditions, valeurs: string[]): StatutVerification[] {
  if (p === "directes") return [statutNombre(valeurs[0] ?? "", e.c), statutNombre(valeurs[1] ?? "", e.d)];
  if (p === "systeme") return [statut(valeurs[0] === idSysteme(0))];
  if (p === "resolution") return [statutNombre(valeurs[0] ?? "", e.a), statutNombre(valeurs[1] ?? "", e.b)];
  if (p === "derivee") {
    const g = lireFonctionVar(valeurs[0] ?? "");
    if (!g) return ["parse_error"];
    return [statut(memesFonctions(g, e.variante === "inflexion" ? fpp(e) : fp(e), POINTS_CONTROLE))];
  }
  return [statut(valeurs[0] === e.nature)];
}

export function piege(e: E, p: PhaseFonctionConditions, valeurs: string[]): Frag[] | null {
  if (p === "directes") {
    const c = lireNombre(valeurs[0] ?? "");
    const d = lireNombre(valeurs[1] ?? "");
    if (c === null || d === null) return null;
    if (egal(c, e.d) && egal(d, e.c) && e.c !== e.d) return [tx("c et d sont échangés : "), lx("f(0)=d"), tx(" est l'ordonnée du point, "), lx("f'(0)=c"), tx(" la pente.")];
    if (e.variante === "deuxTangentes" && !egal(c, 0)) return [tx("Une tangente horizontale a une pente nulle : "), lx("f'(0)=c=0"), tx(".")];
    return null;
  }
  if (p === "systeme") {
    const k = Number((valeurs[0] ?? "").slice(1));
    if (k === 1) return e.variante === "inflexion" ? [tx("Un point d'inflexion annule "), lx("f''"), tx(", pas "), lx("f'"), tx(" (ce serait une tangente horizontale).")] : [tx("Ce système échange les conditions : une tangente horizontale donne "), lx("f'(x)=0"), tx(", le point de la courbe donne "), lx("f(x)=y"), tx(".")];
    if (k === 2) return [tx("Les termes en c et d ont disparu : c et d sont connus, ils restent dans les équations.")];
    if (k === 3) return e.variante === "inflexion" ? [tx("Revois la dérivée seconde : "), lx("f''(x)=6ax+2b"), tx(".")] : [tx("Revois la dérivée : l'exposant passe devant, "), lx("f'(x)=3ax^2+2bx+c"), tx(".")];
    return null;
  }
  if (p === "resolution") {
    const a = lireNombre(valeurs[0] ?? "");
    const b = lireNombre(valeurs[1] ?? "");
    if (a === null || b === null) return null;
    if (egal(a, e.b) && egal(b, e.a) && e.a !== e.b) return [tx("a et b sont échangés : a multiplie "), lx("x^3"), tx(" (ses coefficients dans le système sont les plus grands).")];
    if (egal(a, e.a) && !egal(b, e.b)) return [tx("a est juste : remplace-le dans une équation du système pour trouver b, en soignant les signes.")];
    return null;
  }
  if (p === "derivee") {
    const g = lireFonctionVar(valeurs[0] ?? "");
    if (!g) return null;
    if (e.variante === "inflexion") {
      if (memesFonctions(g, fp(e), POINTS_CONTROLE)) return [tx("C'est "), lx("f'(x)"), tx(" : dérive encore une fois pour obtenir "), lx("f''(x)"), tx(".")];
      return null;
    }
    if (e.c !== 0 && memesFonctions(g, (x) => fp(e)(x) - e.c, POINTS_CONTROLE)) return [tx("Le terme "), lx("cx"), tx(" donne la constante c dans "), lx("f'(x)"), tx(" : ne l'oublie pas.")];
    if (memesFonctions(g, (x) => (e.a * x + e.b) * x + e.c, POINTS_CONTROLE)) return [tx("Les exposants passent devant : "), lx("(ax^3)'=3ax^2"), tx(", "), lx("(bx^2)'=2bx"), tx(".")];
    return null;
  }
  const v = valeurs[0];
  if (v === e.nature) return null;
  if (e.variante === "inflexion") return e.nature === "concaveConvexe" ? [lx("f''"), tx(" passe de − à + : la courbe est d'abord concave (∩), puis convexe (∪).")] : [lx("f''"), tx(" passe de + à − : la courbe est d'abord convexe (∪), puis concave (∩).")];
  if (e.nature === "palier") return [lx("f'"), tx(" s'annule sans changer de signe (facteur au carré) : la fonction continue dans le même sens, ce n'est pas un extremum.")];
  if (e.nature === "min") return [lx("f'"), tx(" passe de − à + : f décroît puis croît, c'est un minimum local.")];
  return [lx("f'"), tx(" passe de + à − : f croît puis décroît, c'est un maximum local.")];
}
