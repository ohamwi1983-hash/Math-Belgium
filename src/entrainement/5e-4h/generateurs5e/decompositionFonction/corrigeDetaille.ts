import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { CoucheGeneree, ExerciceDecompositionFonction, TypeCoucheCatalogue } from "../../core5e/decompositionFonction.types";
import { labelLigne } from "../../ui5e/formatDecompositionFonction";
import { finaliserCorrige } from "../../ui5e/corrigeTrigonometrie1";
import { COURS_DECOMPOSER, jf, t, f, type Fragments } from "../../ui5e/corrigeFonctions1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen2 (décomposer une fonction composée) — règle
 * `.claude/rules/feuilles-evaluations.md`. Un seul écran (lettre a) : une ligne par couche
 * (`couches[].propreLatex`, la décomposition de la réponse attendue de l'écran, noms
 * `labelLigne`), puis la RECOMPOSITION écrite substitution par substitution
 * (`h(g(x)) = h(A₁) = … = f(x)`, chaque argument = `couches[].argumentLatex`, celui que cite l'aide
 * de l'écran) : elle prouve que la composée reconstitue f. SANS `docx` : importé par l'adaptateur ET
 * par `App5gen2.tsx`.
 */

const L = "a";

/** Nom de la fonction de la couche i (« g », « h », « i »…), celui de l'écran. */
export function nomCouche(i: number): string {
  return labelLigne(i).replace(/\(x\) =$/, "");
}

/** « h \circ g » (la plus extérieure à gauche). */
export function chaineComposee(n: number): string {
  return Array.from({ length: n }, (_, i) => nomCouche(n - 1 - i)).join("\\circ ");
}

/** Ce que fait la couche, en mots. */
export function operationCouche(couche: CoucheGeneree): string {
  if (couche.estAffineFinale) return "on multiplie le résultat par un nombre puis on ajoute une constante (fonction affine)";
  const noms: Record<TypeCoucheCatalogue, string> = {
    affine: "une fonction affine",
    carre: "on élève au carré",
    cube: "on élève au cube",
    racineCarree: "on prend la racine carrée",
    racineCubique: "on prend la racine cubique",
    inverse: "on prend l'inverse",
    valeurAbsolue: "on prend la valeur absolue",
    brute: "un polynôme, gardé en une seule fonction",
  };
  return noms[couche.type];
}

const corps = (fLatex: string) => fLatex.replace(/^f\(x\)\s*=\s*/, "");

/** « h(g(x)) », puis « h(A) » : appel imbriqué des couches k-1…0 sur `centre`. */
function appels(n: number, depuis: number, centre: string): string {
  let s = centre;
  for (let i = depuis; i < n; i++) s = `${nomCouche(i)}(${s})`;
  return s;
}

export function piegeDecomposition(e: ExerciceDecompositionFonction): string {
  const derniere = e.couches[e.couches.length - 1]!;
  if (derniere.estAffineFinale) return "La dernière fonction affine s'applique au résultat de la fonction précédente, pas directement à x.";
  if (e.couches[0]!.type === "brute") return "Le polynôme intérieur forme une seule fonction : il est appliqué en premier, on ne le découpe pas.";
  return "L'ordre compte : la fonction la plus intérieure est appliquée en premier, et f = h ∘ g se lit « h après g ».";
}

export function correctionDetailleeDecompositionFonction(e: ExerciceDecompositionFonction): EtapeCorrection[] {
  const n = e.couches.length;
  const couches: LigneCalcul[] = e.couches.map((c, i) =>
    ligne(`${nomCouche(i)}(x)=${c.propreLatex}`, i === 0 ? `appliquée en premier, à x : ${operationCouche(c)}` : `appliquée ensuite au résultat : ${operationCouche(c)}`),
  );
  // Recomposition : (… ∘ h ∘ g)(x) = …h(g(x)) = …h(A₁) = … = f(x).
  const recompo: LigneCalcul[] = [ligne(`(${chaineComposee(n)})(x)=${appels(n, 0, "x")}`, "définition de la composée")];
  for (let k = 1; k < n; k++) {
    const arg = e.couches[k]!.argumentLatex;
    recompo.push(ligne(`=${appels(n, k, arg)}`, k === 1 ? jf("on remplace ", { l: `${nomCouche(0)}(x)` }, " par son expression") : jf("on applique ", { l: nomCouche(k - 1) })));
  }
  recompo.push(ligne(`=${corps(e.fLatex)}`, jf("on applique ", { l: nomCouche(n - 1) }, " : c'est f(x)")));
  const res: Fragments = [];
  e.couches.forEach((c, i) => {
    if (i > 0) res.push(t(" ; "));
    res.push(f(`${nomCouche(i)}(x)=${c.propreLatex}`));
  });
  res.push(t(", donc "), f(`f=${chaineComposee(n)}`), t("."));
  return finaliserCorrige([
    utilise(L, [
      t("On suit le calcul de "), f("f(x)"), t(" pour un "), f("x"), t(` donné : chaque opération, appliquée au résultat précédent tout entier, est une fonction simple. La plus intérieure est appliquée en premier ; `),
      f("h\\circ g"),
      t(" se lit « "), f("h"), t(" après "), f("g"), t(` » ${COURS_DECOMPOSER}.`),
    ]),
    calcul(L, couches, [t("Une fonction par opération, de l'intérieur vers l'extérieur :")], "Fonctions"),
    calcul(L, recompo, [t("On recompose, une substitution par ligne :")], "Recomposition"),
    resultat(L, res),
    piege(L, [t(piegeDecomposition(e))]),
  ]);
}
