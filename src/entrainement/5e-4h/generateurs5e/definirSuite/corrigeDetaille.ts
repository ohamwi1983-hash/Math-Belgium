import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { divise, ecarts, egal, fois, plus, premiersTermes, puissance, rapports, rat, valeursOptions } from "../../core5e/definirSuite";
import type { ExerciceDefinirSuite, ExerciceNature, ExerciceNatureFormule, ExerciceNatureRecurrence, ExerciceNatureTermes, ExerciceNotations, ExerciceRecurrence, FormuleExplicite, Q } from "../../core5e/definirSuite";
import {
  conclusionVerdict,
  indiceAutre,
  latexDecale,
  latexDifferenceFormule,
  latexDifferenceRecurrence,
  latexFormule,
  latexQuotientFormule,
  latexQuotientRecurrence,
  latexRecurrenceLineaire,
  latexRelation,
  qLatex,
  qParen,
  reponseFragments,
  somme,
  substitutionLatex,
} from "../../ui5e/formatDefinirSuite";
import { COURS_NATURE, COURS_SUITES, plusEnt, sansRepetition, sommeEntiers } from "../../ui5e/corrigeSuites2";

/**
 * Corrigé détaillé « comme au tableau » de `5gen44` (définir et reconnaître une suite) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (lettres a, b, c) :
 * - notations : uₙ₊₁ (n remplacé par n + 1, carré développé, distribution, regroupement), u₂ₙ ou uₙ₋₁,
 *   puis uₚ calculé (puissance, produits, somme) ;
 * - récurrence : u₂, u₃, u₄ (relation substituée, numérateur et dénominateur, simplification) ;
 * - nature (formule ou récurrence) : uₙ₊₁ − uₙ et uₙ₊₁/uₙ réduits ligne à ligne, puis le verdict
 *   (ce qui dépend de n ou de uₙ, ce qui est constant), vérifié sur les premiers termes ;
 * - nature d'une liste : chaque écart, chaque rapport, puis la comparaison.
 * Écritures produites par les fonctions de l'écran (`formatDefinirSuite.ts`) ; partagé par
 * l'adaptateur papier et l'appli.
 */

const t = texte;
const f = latex;

// ============================================================================
// Outils d'écriture.
// ============================================================================

/** Expression entre parenthèses pour une soustraction (sauf une fraction seule, déjà groupée). */
function paren(expr: string): string {
  return /^\\dfrac\{[^]*\}$/.test(expr) && !expr.includes("}+") && !expr.includes("}-") ? expr : `\\left(${expr}\\right)`;
}

/** Facteur d'un produit écrit tel quel s'il est un monôme sans signe (« n », « 2n », « 3 »). */
function estMonome(s: string): boolean {
  return /^\d*n$/.test(s) || /^\d+$/.test(s);
}

/** Produit X·Y de deux expressions en n : « 3(n+1) », « (n+2)(2n+1) », « 3\times 2n ». */
function produit(x0: string, y0: string): string {
  if (x0 === "1") return estMonome(y0) ? y0 : `(${y0})`;
  // Le monôme devant : « n(n+2) » plutôt que « (n+2)n ».
  const [x, y] = estMonome(y0) && !estMonome(x0) ? [y0, x0] : [x0, y0];
  const px = estMonome(x) ? x : `(${x})`;
  const py = estMonome(y) ? y : `(${y})`;
  if (py.startsWith("(") || (/^\d+$/.test(px) && /^n$/.test(py))) return `${px}${py}`;
  return `${px}\\times ${py}`;
}

/** Écriture sans parenthèses ni \\left/\\right (comparaison de deux écritures). */
function nu(s: string): string {
  return s.replace(/\\left|\\right|[()\s]/g, "");
}

/** Rationnel soustrait : entre parenthèses seulement s'il est négatif. */
function qMoins(x: Q): string {
  return x.num < 0 ? qParen(x) : qLatex(x);
}

/** Polynôme [c0, c1, c2] (constante, n, n²) en LaTeX. */
function poly(c: [Q, Q, Q]): string {
  return somme([
    { coef: c[2], mono: "n^{2}" },
    { coef: c[1], mono: "n" },
    { coef: c[0], mono: "" },
  ]);
}

/** Produit de deux polynômes affines [c0, c1]. */
function produitAffines(a: [Q, Q], b: [Q, Q]): [Q, Q, Q] {
  return [fois(a[0], b[0]), plus(fois(a[0], b[1]), fois(a[1], b[0])), fois(a[1], b[1])];
}

/** Monômes d'un polynôme, dans l'ordre n², n, constante (pour une somme non réduite). */
function monomes(c: [Q, Q, Q], signe = 1): { coef: Q; mono: string }[] {
  return [
    { coef: fois(rat(signe), c[2]), mono: "n^{2}" },
    { coef: fois(rat(signe), c[1]), mono: "n" },
    { coef: fois(rat(signe), c[0]), mono: "" },
  ];
}

/** k·p^{expo} écrit comme la formule de l'énoncé (produit, quotient, inverse), avec un exposant donné. */
function ecrireExpo(fo: Extract<FormuleExplicite, { type: "exponentielle" }>, expo: string): string {
  const base = qParen(fo.p);
  if (fo.ecriture === "quotient") return `\\dfrac{${base}^{${expo}}}{${fo.k.den}}`;
  if (fo.ecriture === "inverse") return `\\dfrac{${fo.k.num}}{${base}^{${expo}}}`;
  const puis = `${base}^{${expo}}`;
  if (fo.k.num === fo.k.den) return puis;
  if (fo.k.num === -fo.k.den) return `-${puis}`;
  return `${qLatex(fo.k)}\\cdot ${puis}`;
}

/** Exposant affiché de la formule (e·n + dec), sans le calculer, pour un argument (n+1, n-1, 2n). */
function exposantBrut(fo: Extract<FormuleExplicite, { type: "exponentielle" }>, arg: "n+1" | "n-1" | "2n"): string {
  if (fo.ecriture === "inverse") return arg;
  const e = fo.e;
  const dec = fo.dec === 0 ? "" : fo.dec > 0 ? `+${fo.dec}` : `${fo.dec}`;
  if (arg === "2n") return e === 1 ? `2n${dec}` : `${e}\\times 2n${dec}`;
  if (e === 1) return dec === "" ? arg : `(${arg})${dec}`;
  return `${e}(${arg})${dec}`;
}

type Arg = "n+1" | "n-1" | "2n";

/**
 * u_{n+1}, u_{n−1} ou u_{2n} : n remplacé dans la formule (`substitutionLatex`), puis, une
 * transformation par ligne, le carré développé, la distribution, le regroupement — jusqu'à
 * l'écriture simplifiée de l'écran (`latexDecale`).
 */
function lignesDecale(fo: FormuleExplicite, quoi: "suivant" | "precedent" | "double"): LigneCalcul[] {
  const arg: Arg = quoi === "suivant" ? "n+1" : quoi === "precedent" ? "n-1" : "2n";
  const indice = arg === "2n" ? "2n" : arg;
  const h = quoi === "suivant" ? 1 : -1;
  const final = latexDecale(fo, quoi);
  const remplace = arg === "2n" ? "on remplace chaque n par 2n" : `on remplace chaque n par (${arg === "n+1" ? "n + 1" : "n − 1"})`;
  const lignes: LigneCalcul[] = [];
  const dfr = (num: string, den: number) => (den === 1 ? num : `\\dfrac{${num}}{${den}}`);
  switch (fo.type) {
    case "affine": {
      lignes.push(ligne(`u_{${indice}}=${substitutionLatex(fo, arg)}`, remplace));
      if (arg !== "2n") lignes.push(ligne(`=${dfr(somme([{ coef: fo.a, mono: "n" }, { coef: h * fo.a, mono: "" }, { coef: fo.b, mono: "" }]), fo.c)}`, fo.a === 1 ? "on supprime les parenthèses" : "on distribue"));
      lignes.push(ligne(`=${final}`, arg === "2n" ? "on multiplie les coefficients" : "on regroupe les nombres"));
      break;
    }
    case "second-degre": {
      lignes.push(ligne(`u_{${indice}}=${substitutionLatex(fo, arg)}`, remplace));
      if (arg === "2n") {
        lignes.push(ligne(`=${somme([{ coef: fo.a, mono: "4n^{2}" }, { coef: 2 * fo.b, mono: "n" }, { coef: fo.c, mono: "" }])}`, [f("(2n)^{2}=4n^{2}")]));
      } else {
        const carre = `n^{2}${h > 0 ? "+" : "-"}2n+1`;
        const premier = fo.a === 1 ? carre : `${fo.a === -1 ? "-" : fo.a}(${carre})`;
        const bPart = fo.b === 0 ? "" : `${fo.b > 0 ? "+" : "-"}${Math.abs(fo.b) === 1 ? "" : Math.abs(fo.b)}(${arg})`;
        lignes.push(ligne(`=${premier}${bPart}${plusEnt(fo.c)}`, [t("on développe le carré : "), f(`(${arg})^{2}=${carre}`)]));
        lignes.push(
          ligne(
            `=${somme([
              { coef: fo.a, mono: "n^{2}" },
              { coef: 2 * h * fo.a, mono: "n" },
              { coef: fo.a, mono: "" },
              { coef: fo.b, mono: "n" },
              { coef: h * fo.b, mono: "" },
              { coef: fo.c, mono: "" },
            ])}`,
            "on distribue",
          ),
        );
      }
      lignes.push(ligne(`=${final}`, "on regroupe les termes de même degré"));
      break;
    }
    case "homographique": {
      lignes.push(ligne(`u_{${indice}}=${substitutionLatex(fo, arg)}`, `${remplace}, au numérateur et au dénominateur`));
      if (arg !== "2n") {
        const num = somme([{ coef: fo.a, mono: "n" }, { coef: h * fo.a, mono: "" }, { coef: fo.b, mono: "" }]);
        const den = somme([{ coef: fo.c, mono: "n" }, { coef: h * fo.c, mono: "" }, { coef: fo.d, mono: "" }]);
        lignes.push(ligne(`=\\dfrac{${num}}{${den}}`, Math.abs(fo.a) <= 1 && fo.c === 1 && fo.a >= 0 ? "on supprime les parenthèses" : "on distribue"));
      }
      lignes.push(ligne(`=${final}`, arg === "2n" ? "on multiplie les coefficients" : "on regroupe les nombres"));
      break;
    }
    case "exponentielle": {
      lignes.push(ligne(`u_{${indice}}=${ecrireExpo(fo, exposantBrut(fo, arg))}`, `${remplace}, dans l'exposant`));
      lignes.push(ligne(`=${final}`, "on simplifie l'exposant"));
      break;
    }
    case "somme-expo": {
      lignes.push(ligne(`u_{${indice}}=${substitutionLatex(fo, arg)}`, `${remplace}, dans l'exposant et dans le reste`));
      if (arg !== "2n") lignes.push(ligne(`=${somme([{ coef: 1, mono: `${fo.p}^{${arg}}` }, { coef: fo.alpha, mono: "n" }, { coef: h * fo.alpha, mono: "" }, { coef: fo.beta, mono: "" }])}`, Math.abs(fo.alpha) === 1 ? "on supprime les parenthèses" : "on distribue"));
      lignes.push(ligne(`=${final}`, arg === "2n" ? "on multiplie les coefficients" : "on regroupe les nombres"));
      break;
    }
  }
  return sansRepetition(lignes);
}

/** a × x (nombre déjà calculé x) : « 9 », « -9 », « 3\times 9 ». */
function fois_(a: number, x: string): string {
  return a === 1 ? x : a === -1 ? `-${x}` : `${a}\\times ${x}`;
}

/** uₚ : n remplacé par p (`substitutionLatex`), puissances, produits, somme, simplification. */
function lignesTerme(fo: FormuleExplicite, p: number, valeur: Q): LigneCalcul[] {
  const lignes: LigneCalcul[] = [ligne(`u_{${p}}=${substitutionLatex(fo, p)}`, `on remplace n par ${p}`)];
  switch (fo.type) {
    case "affine": {
      const num = sommeEntiers([fo.a * p, fo.b]);
      lignes.push(ligne(`=${fo.c === 1 ? num : `\\dfrac{${num}}{${fo.c}}`}`, "on multiplie"));
      if (fo.c !== 1) lignes.push(ligne(`=\\dfrac{${fo.a * p + fo.b}}{${fo.c}}`, "on additionne"));
      break;
    }
    case "second-degre":
      lignes.push(ligne(`=${fois_(fo.a, `${p * p}`)}${fo.b === 0 ? "" : plusEnt(fo.b * p)}${plusEnt(fo.c)}`, [t("puissance d'abord : "), f(`${p}^{2}=${p * p}`)]));
      lignes.push(ligne(`=${sommeEntiers([fo.a * p * p, fo.b * p, fo.c])}`, "puis les produits"));
      break;
    case "homographique": {
      lignes.push(ligne(`=\\dfrac{${sommeEntiers([fo.a * p, fo.b])}}{${sommeEntiers([fo.c * p, fo.d])}}`, "on multiplie"));
      lignes.push(ligne(`=\\dfrac{${fo.a * p + fo.b}}{${fo.c * p + fo.d}}`, "on additionne"));
      break;
    }
    case "exponentielle": {
      const expo = fo.e * p + fo.dec;
      const pv = puissance(fo.p, expo);
      if (fo.k.num !== fo.k.den && fo.k.num !== -fo.k.den) lignes.push(ligne(`=${qLatex(fo.k)}\\times ${qParen(pv)}`, [t("puissance d'abord : "), f(`${qParen(fo.p)}^{${expo}}=${qLatex(pv)}`)]));
      break;
    }
    case "somme-expo":
      lignes.push(ligne(`=${sommeEntiers([Math.pow(fo.p, p), fo.alpha * p, fo.beta])}`, [t("puissance d'abord : "), f(`${fo.p}^{${p}}=${Math.pow(fo.p, p)}`)]));
      break;
  }
  lignes.push(ligne(`=${qLatex(valeur)}`, valeur.den === 1 ? "on calcule" : "on simplifie la fraction"));
  return sansRepetition(lignes);
}

// ============================================================================
// Notations.
// ============================================================================

function etapesNotations(e: ExerciceNotations): EtapeCorrection[] {
  const F = latexFormule(e.f);
  const valeur = premiersTermes(e, e.p)[e.p - 1];
  const autre = indiceAutre(e);
  return [
    utilise("a", [f("u_{n+1}"), t(` est le terme de rang n + 1 : dans la formule de `), f("u_n"), t(` on remplace chaque n par (n + 1), parenthèses comprises, puis on simplifie ${COURS_SUITES}.`)]),
    calcul("a", lignesDecale(e.f, "suivant")),
    resultat("a", reponseFragments(e, "suivant")),
    piege("a", [t("Confondre "), f("u_{n+1}"), t(" (terme de rang n + 1) et "), f(`u_n+1=${F}+1`), t(" (le terme de rang n, plus 1).")]),
    utilise("b", [
      f(`u_{${autre}}`),
      t(e.autre === "double" ? " est le terme de rang 2n : on remplace chaque n par 2n, puis on simplifie " : " est le terme de rang n − 1 : on remplace chaque n par (n − 1), puis on simplifie "),
      t(`${COURS_SUITES}.`),
    ]),
    calcul("b", lignesDecale(e.f, e.autre)),
    resultat("b", reponseFragments(e, "autre")),
    piege("b", e.autre === "double" ? [t("Confondre "), f("u_{2n}"), t(" (terme de rang 2n) et "), f("2u_n"), t(" (double du terme de rang n).")] : [t("Confondre "), f("u_{n-1}"), t(" (terme de rang n − 1) et "), f("u_n-1"), t(" (le terme de rang n, moins 1).")]),
    utilise("c", [t(`On remplace n par ${e.p} dans la formule de `), f("u_n"), t(` et on calcule en respectant les priorités : puissances, puis produits, puis sommes ${COURS_SUITES}.`)]),
    calcul("c", lignesTerme(e.f, e.p, valeur)),
    resultat("c", reponseFragments(e, "terme")),
  ];
}

// ============================================================================
// Récurrence (u₂, u₃, u₄).
// ============================================================================

function lignesRecurrence(e: ExerciceRecurrence, k: number): LigneCalcul[] {
  const termes = premiersTermes(e, k);
  const prec = termes[k - 2];
  const valeur = termes[k - 1];
  const g = e.g;
  const lignes: LigneCalcul[] = [ligne(`u_{${k}}=${latexRelation(g, prec)}`, [t("on remplace "), f("u_n"), t(" par "), f(`u_{${k - 1}}=${qLatex(prec)}`)])];
  if (g.type === "carre") {
    lignes.push(ligne(`=${qLatex(fois(prec, prec))}${plusEnt(g.c)}`, prec.num < 0 ? "le carré d'un nombre négatif est positif" : "on calcule le carré"));
  } else {
    const num = plus(fois(rat(g.alpha), prec), rat(g.beta));
    const den = plus(fois(rat(g.gamma), prec), rat(g.delta));
    lignes.push(ligne(`=\\dfrac{${qLatex(num)}}{${qLatex(den)}}`, "on calcule le numérateur et le dénominateur"));
    if (num.den !== 1 || den.den !== 1) {
      // Quotient de deux fractions : on multiplie par l'inverse.
      lignes.push(ligne(`=${qLatex(num)}\\times ${qMoins(divise(rat(1), den))}`, "diviser par une fraction, c'est multiplier par son inverse"));
    }
  }
  lignes.push(ligne(`=${qLatex(valeur)}`, valeur.den === 1 ? "on calcule" : "on simplifie la fraction"));
  return sansRepetition(lignes);
}

function etapesRecurrence(e: ExerciceRecurrence): EtapeCorrection[] {
  const u2 = premiersTermes(e, 2)[1];
  const etapes: EtapeCorrection[] = [];
  (["a", "b", "c"] as const).forEach((sq, i) => {
    const k = i + 2;
    const prec = premiersTermes(e, k - 1)[k - 2];
    etapes.push(
      utilise(sq, [t("La relation de récurrence donne chaque terme à partir du précédent : on remplace "), f("u_n"), t(" par "), f(`u_{${k - 1}}=${qLatex(prec)}`), t(`, valeur exacte ${COURS_SUITES}.`)]),
      calcul(sq, lignesRecurrence(e, k)),
      resultat(sq, reponseFragments(e, `terme${k}` as "terme2" | "terme3" | "terme4")),
    );
    if (sq === "b") etapes.push(piege("b", [t("Remplacer "), f("u_n"), t(" par le rang (calculer "), f("u_3"), t(" avec 2 au lieu de "), f(`u_2=${qLatex(u2)}`), t("), ou arrondir au lieu de garder la valeur exacte.")]));
  });
  return etapes;
}

// ============================================================================
// Nature d'une suite (formule ou récurrence).
// ============================================================================

/** u_{n+1} − u_n pour une formule explicite, une transformation par ligne. */
function lignesDifferenceFormule(fo: FormuleExplicite): { differences: LigneCalcul[]; numerateur?: LigneCalcul[] } {
  const F = latexFormule(fo);
  const S = latexDecale(fo, "suivant");
  const D = latexDifferenceFormule(fo);
  const debut = ligne(`u_{n+1}-u_n=${paren(S)}-${paren(F)}`, [t("on soustrait "), f("u_n"), t(" tout entier")]);
  const fin = (just: string) => ligne(`=${D}`, just);
  switch (fo.type) {
    case "affine": {
      const num = somme([{ coef: fo.a, mono: "n" }, { coef: fo.a + fo.b, mono: "" }, { coef: -fo.a, mono: "n" }, { coef: -fo.b, mono: "" }]);
      if (fo.c === 1) return { differences: sansRepetition([debut, ligne(`=${num}`, "on supprime les parenthèses : le « − » change tous les signes"), fin("les termes en n s'éliminent")]) };
      return {
        differences: sansRepetition([
          ligne(`u_{n+1}-u_n=${S}-${F}`, [t("on soustrait "), f("u_n")]),
          ligne(`=\\dfrac{${num}}{${fo.c}}`, "même dénominateur : on soustrait les numérateurs"),
          ligne(`=\\dfrac{${fo.a}}{${fo.c}}`, "les termes en n s'éliminent"),
          fin("on simplifie la fraction"),
        ]),
      };
    }
    case "second-degre": {
      const s: [Q, Q, Q] = [rat(fo.a + fo.b + fo.c), rat(2 * fo.a + fo.b), rat(fo.a)];
      const u: [Q, Q, Q] = [rat(fo.c), rat(fo.b), rat(fo.a)];
      return { differences: sansRepetition([debut, ligne(`=${somme([...monomes(s), ...monomes(u, -1)])}`, "on supprime les parenthèses : le « − » change tous les signes"), fin("les termes en n² s'éliminent, on regroupe")]) };
    }
    case "homographique": {
      const A: [Q, Q] = [rat(fo.a + fo.b), rat(fo.a)];
      const B: [Q, Q] = [rat(fo.c + fo.d), rat(fo.c)];
      const C: [Q, Q] = [rat(fo.b), rat(fo.a)];
      const Dd: [Q, Q] = [rat(fo.d), rat(fo.c)];
      const lat = (x: [Q, Q]) => somme([{ coef: x[1], mono: "n" }, { coef: x[0], mono: "" }]);
      const P1 = produitAffines(A, Dd);
      const P2 = produitAffines(C, B);
      const ad = fo.a * fo.d - fo.b * fo.c;
      const numProduits = `${produit(lat(A), lat(Dd))}-${produit(lat(C), lat(B))}`;
      return {
        differences: sansRepetition([
          ligne(`u_{n+1}-u_n=${S}-${F}`, [t("on soustrait "), f("u_n")]),
          ligne(`=\\dfrac{${numProduits}}{${produit(lat(Dd), lat(B))}}`, "on réduit au même dénominateur"),
          fin("numérateur calculé ci-dessous"),
        ]),
        numerateur: sansRepetition([
          ...(nu(numProduits) === nu(`${poly(P1)}-${poly(P2)}`) ? [] : [ligne(`${numProduits}=${poly(P1)}-\\left(${poly(P2)}\\right)`, "on développe chaque produit")]),
          ligne(`${nu(numProduits) === nu(`${poly(P1)}-${poly(P2)}`) ? numProduits : ""}=${somme([...monomes(P1), ...monomes(P2, -1)])}`, "on supprime les parenthèses"),
          ligne(`=${ad}`, P1[2].num !== 0 ? "les termes en n² et en n s'éliminent" : "les termes en n s'éliminent"),
        ]),
      };
    }
    case "exponentielle": {
      const qr = puissance(fo.p, fo.e);
      const Fp = F.startsWith("-") ? `\\left(${F}\\right)` : F;
      return {
        differences: sansRepetition([
          ligne(`u_{n+1}-u_n=${S}-${Fp}`, [t("on soustrait "), f("u_n")]),
          ligne(`=${qLatex(qr)}\\times ${Fp}-${Fp}`, [t("l'exposant augmente de "), f(`${fo.ecriture === "inverse" ? 1 : fo.e}`), t(" : "), f(`u_{n+1}=${qLatex(qr)}\\times u_n`)]),
          ligne(`=\\left(${qLatex(qr)}-1\\right)\\times ${Fp}`, [t("on met "), f("u_n"), t(" en évidence")]),
          fin("on calcule et on regroupe"),
        ]),
      };
    }
    case "somme-expo": {
      const pn1 = `${fo.p}^{n+1}`;
      const pn = `${fo.p}^{n}`;
      return {
        differences: sansRepetition([
          debut,
          ligne(
            `=${somme([
              { coef: 1, mono: pn1 },
              { coef: fo.alpha, mono: "n" },
              { coef: fo.alpha + fo.beta, mono: "" },
              { coef: -1, mono: pn },
              { coef: -fo.alpha, mono: "n" },
              { coef: -fo.beta, mono: "" },
            ])}`,
            "on supprime les parenthèses : le « − » change tous les signes",
          ),
          ligne(`=${somme([{ coef: 1, mono: pn1 }, { coef: -1, mono: pn }, { coef: fo.alpha, mono: "" }])}`, "les termes en n s'éliminent"),
          ligne(`=${fo.p}\\times ${pn}-${pn}${plusEnt(fo.alpha)}`, [f(`${pn1}=${fo.p}\\times ${pn}`)]),
          fin(`on met ${fo.p}ⁿ en évidence`),
        ]),
      };
    }
  }
}

/** u_{n+1}/u_n pour une formule explicite. */
function lignesQuotientFormule(fo: FormuleExplicite): LigneCalcul[] {
  const F = latexFormule(fo);
  const S = latexDecale(fo, "suivant");
  const Qt = latexQuotientFormule(fo);
  const debut = ligne(`\\dfrac{u_{n+1}}{u_n}=\\dfrac{${S}}{${F}}`, [t("on divise "), f("u_{n+1}"), t(" par "), f("u_n"), t(", dans cet ordre")]);
  switch (fo.type) {
    case "affine":
      if (fo.c === 1) return [debut];
      return sansRepetition([debut, ligne(`=${Qt}`, `les dénominateurs ${fo.c} se simplifient`)]);
    case "second-degre":
    case "somme-expo":
      return [debut];
    case "homographique": {
      const A = somme([{ coef: fo.a, mono: "n" }, { coef: fo.a + fo.b, mono: "" }]);
      const B = somme([{ coef: fo.c, mono: "n" }, { coef: fo.c + fo.d, mono: "" }]);
      const C = somme([{ coef: fo.a, mono: "n" }, { coef: fo.b, mono: "" }]);
      const Dd = somme([{ coef: fo.c, mono: "n" }, { coef: fo.d, mono: "" }]);
      return sansRepetition([
        debut,
        ligne(`=\\dfrac{${A}}{${B}}\\times\\dfrac{${Dd}}{${C}}`, "diviser par une fraction, c'est multiplier par son inverse"),
        ligne(`=${Qt}`, fo.a === 0 ? `les ${fo.b} se simplifient` : "on écrit le produit en une fraction"),
      ]);
    }
    case "exponentielle": {
      if (fo.ecriture === "inverse") {
        const base = qParen(fo.p);
        return sansRepetition([
          debut,
          ligne(`=\\dfrac{${fo.k.num}}{${base}^{n+1}}\\times\\dfrac{${base}^{n}}{${fo.k.num}}`, "diviser par une fraction, c'est multiplier par son inverse"),
          ligne(`=${Qt}`, [t("on simplifie par "), f(`${fo.k.num}\\times ${base}^{n}`)]),
        ]);
      }
      const lignes = [debut];
      if (fo.e !== 1) lignes.push(ligne(`=${qParen(fo.p)}^{${fo.e}}`, [t("le coefficient se simplifie ; "), f(`\\dfrac{a^{m+${fo.e}}}{a^{m}}=a^{${fo.e}}`)]));
      lignes.push(ligne(`=${Qt}`, fo.e !== 1 ? "on calcule la puissance" : [t("le coefficient se simplifie ; "), f("\\dfrac{a^{m+1}}{a^{m}}=a")]));
      return sansRepetition(lignes);
    }
  }
}

function lignesDifferenceRecurrence(e: ExerciceNatureRecurrence): LigneCalcul[] {
  const g = e.g;
  const G = latexRecurrenceLineaire(g);
  const D = latexDifferenceRecurrence(g);
  const lignes: LigneCalcul[] = [ligne(`u_{n+1}-u_n=${G}-u_n`, [t("on soustrait "), f("u_n"), t(" aux deux membres de la relation")])];
  if (g.style === "deguisee-arith") lignes.push(ligne(`=2u_n${plusEnt(2 * (g.h ?? 0))}-u_n-u_n`, "on distribue le 2"));
  if (g.style === "fraction") lignes.push(ligne(`=\\dfrac{${g.A.num}u_n-${g.A.den}u_n}{${g.A.den}}`, "même dénominateur"));
  if (g.style === "quotient") lignes.push(ligne(`=\\dfrac{${g.A.num < 0 ? "-" : ""}u_n-${g.A.den}u_n}{${g.A.den}}`, "même dénominateur"));
  if (g.style === "deguisee-geom") lignes.push(ligne(`=${somme([{ coef: g.h ?? 1, mono: "u_n" }])}`, [f("u_n"), t(" et "), f("-u_n"), t(" s'éliminent")]));
  lignes.push(ligne(`=${D}`, "on réduit"));
  return sansRepetition(lignes);
}

function lignesQuotientRecurrence(e: ExerciceNatureRecurrence): LigneCalcul[] {
  const g = e.g;
  const G = latexRecurrenceLineaire(g);
  const Qt = latexQuotientRecurrence(g);
  const lignes: LigneCalcul[] = [ligne(`\\dfrac{u_{n+1}}{u_n}=\\dfrac{${G}}{u_n}`, [t("on divise les deux membres de la relation par "), f("u_n"), t(" (non nul)")])];
  if (g.style === "deguisee-arith") lignes.push(ligne(`=\\dfrac{2u_n${plusEnt(2 * (g.h ?? 0))}-u_n}{u_n}`, "on distribue le 2"));
  const tete = somme([{ coef: g.A, mono: "u_n" }]);
  const reste = somme([{ coef: g.B, mono: "n" }, { coef: g.C, mono: "" }]);
  if (g.style === "fraction" || g.style === "quotient") {
    lignes.push(ligne(`=\\dfrac{${g.A.num < 0 ? "-" : ""}${Math.abs(g.A.num) === 1 ? "" : Math.abs(g.A.num)}u_n}{${g.A.den}u_n}`, [t("diviser par "), f("u_n"), t(", c'est multiplier le dénominateur par "), f("u_n")]));
  } else if (reste === "0") {
    lignes.push(ligne(`=\\dfrac{${tete}}{u_n}`, "on réduit le numérateur"));
  } else {
    const negatifs = g.B <= 0 && g.C <= 0;
    const fraction = negatifs ? `-\\dfrac{${somme([{ coef: -g.B, mono: "n" }, { coef: -g.C, mono: "" }])}}{u_n}` : `+\\dfrac{${reste}}{u_n}`;
    lignes.push(ligne(`=\\dfrac{${tete}}{u_n}${fraction}`, [t(g.style === "deguisee-arith" ? "on réduit le numérateur et on divise chaque terme par " : "on divise chaque terme du numérateur par "), f("u_n")]));
  }
  lignes.push(ligne(`=${Qt}`, [f("u_n"), t(" se simplifie")]));
  return sansRepetition(lignes);
}

/** Premier indice k (1 ≤ k) où deux valeurs consécutives d'une liste diffèrent. */
function premierEcart(valeurs: Q[]): number {
  for (let k = 1; k < valeurs.length; k++) if (!egal(valeurs[k], valeurs[0])) return k;
  return -1;
}

/** Contre-exemple sur les premiers termes : deux écarts différents, deux rapports différents. */
function lignesContreExemple(e: ExerciceNature): LigneCalcul[] {
  const termes = premiersTermes(e, 6);
  const d = ecarts(termes);
  const qs = termes.every((x) => x.num !== 0) ? rapports(termes) : [];
  const lignes: LigneCalcul[] = [];
  const kd = premierEcart(d);
  if (kd > 0) {
    lignes.push(ligne(`u_2-u_1=${qLatex(termes[1])}-${qMoins(termes[0])}`, "premier écart"), ligne(`=${qLatex(d[0])}`));
    lignes.push(ligne(`u_{${kd + 2}}-u_{${kd + 1}}=${qLatex(termes[kd + 1])}-${qMoins(termes[kd])}`, "un autre écart"), ligne(`=${qLatex(d[kd])}`));
    lignes.push(ligne(`${qLatex(d[kd])}\\neq ${qLatex(d[0])}`, "deux écarts différents : pas arithmétique"));
  }
  const kq = premierEcart(qs);
  if (kq > 0) {
    lignes.push(ligne(`\\dfrac{u_2}{u_1}=\\dfrac{${qLatex(termes[1])}}{${qLatex(termes[0])}}`, "premier rapport"), ligne(`=${qLatex(qs[0])}`));
    lignes.push(ligne(`\\dfrac{u_{${kq + 2}}}{u_{${kq + 1}}}=\\dfrac{${qLatex(termes[kq + 1])}}{${qLatex(termes[kq])}}`, "un autre rapport"), ligne(`=${qLatex(qs[kq])}`));
    lignes.push(ligne(`${qLatex(qs[kq])}\\neq ${qLatex(qs[0])}`, "deux rapports différents : pas géométrique"));
  }
  return sansRepetition(lignes);
}

/** Vérification d'un verdict arithmétique / géométrique sur les deux premiers termes. */
function lignesVerificationRaison(e: ExerciceNature): LigneCalcul[] {
  const [u1, u2] = premiersTermes(e, 2);
  const { r, q } = valeursOptions(e);
  if (e.verdict === "arithmetique") return sansRepetition([ligne(`u_2-u_1=${qLatex(u2)}-${qMoins(u1)}`), ligne(`=${qLatex(r)}`, "on retrouve r ✓")]);
  return sansRepetition([ligne(`\\dfrac{u_2}{u_1}=\\dfrac{${qLatex(u2)}}{${qLatex(u1)}}`), ligne(`=${qLatex(q)}`, "on retrouve q ✓")]);
}

const METHODE_NATURE: FragmentConsigne[] = [
  t("Une suite est arithmétique si "),
  f("u_{n+1}-u_n"),
  t(" est un nombre constant (la raison r), géométrique si "),
  f("\\dfrac{u_{n+1}}{u_n}"),
  t(` est un nombre constant (la raison q) ; une expression qui contient encore n (ou uₙ) n'est pas constante ${COURS_NATURE}.`),
];

function piegeNature(e: ExerciceNature): FragmentConsigne[] {
  const { r, q } = valeursOptions(e);
  return [
    t("Conclure sur les deux premiers termes seulement : "),
    f(`u_2-u_1=${qLatex(r)}`),
    t(" et "),
    f(`\\dfrac{u_2}{u_1}=${qLatex(q)}`),
    t(" existent toujours ; seule une différence (ou un quotient) qui ne dépend "),
    ...(e.variante === "nature-recurrence" ? [t("ni de n ni de "), f("u_n")] : [t("pas de n")]),
    t(" prouve la nature. Autre piège : prendre le quotient à l'envers, "),
    f("\\dfrac{u_n}{u_{n+1}}"),
    t("."),
  ];
}

/** Étape « verdict » : ce qui est constant, ce qui dépend de n (ou de uₙ), puis la conclusion. */
function etapeVerdict(e: ExerciceNatureFormule | ExerciceNatureRecurrence, D: string, Qt: string): EtapeCorrection[] {
  const dependance = (expr: string, accord: string) => {
    const avecU = /u_n/.test(expr);
    const avecN = /n/.test(expr.replace(/u_n/g, ""));
    const de = avecU && avecN ? "de n et de uₙ" : avecU ? "de uₙ" : "de n";
    return `dépend ${de} : pas constant${accord}`;
  };
  const dep = dependance(D, "e");
  const depQ = dependance(Qt, "");
  return [
    utilise("c", METHODE_NATURE),
    calcul("c", [ligne(`u_{n+1}-u_n=${D}`, e.verdict === "arithmetique" ? "un nombre constant" : dep), ligne(`\\dfrac{u_{n+1}}{u_n}=${Qt}`, e.verdict === "geometrique" ? "un nombre constant" : depQ)], [t("On relit les deux expressions obtenues :")]),
    resultat("c", conclusionVerdict(e)),
    e.verdict === "aucune" ? verification("c", [t("Contre-exemple sur les premiers termes :")], lignesContreExemple(e)) : verification("c", [t("Sur les deux premiers termes :")], lignesVerificationRaison(e)),
    piege("c", piegeNature(e)),
  ];
}

function etapesNatureFormule(e: ExerciceNatureFormule): EtapeCorrection[] {
  const { differences, numerateur } = lignesDifferenceFormule(e.f);
  return [
    utilise("a", [t("On écrit "), f("u_{n+1}"), t(" (chaque n remplacé par n + 1), puis on soustrait "), f("u_n"), t(` tout entier, entre parenthèses, et on réduit ${COURS_SUITES}.`)]),
    calcul("a", lignesDecale(e.f, "suivant"), [t("Terme suivant :")]),
    calcul("a", differences, [t("Différence :")]),
    ...(numerateur ? [calcul("a", numerateur, [t("Numérateur :")])] : []),
    resultat("a", reponseFragments(e, "difference")),
    utilise("b", [t("On divise "), f("u_{n+1}"), t(" par "), f("u_n"), t(` (le terme suivant au numérateur) et on simplifie ce qui peut l'être ${COURS_SUITES}.`)]),
    calcul("b", lignesQuotientFormule(e.f)),
    resultat("b", reponseFragments(e, "quotient")),
    ...etapeVerdict(e, latexDifferenceFormule(e.f), latexQuotientFormule(e.f)),
  ];
}

function etapesNatureRecurrence(e: ExerciceNatureRecurrence): EtapeCorrection[] {
  return [
    utilise("a", [t("On soustrait "), f("u_n"), t(` aux deux membres de la relation de récurrence, puis on réduit ${COURS_SUITES}.`)]),
    calcul("a", lignesDifferenceRecurrence(e)),
    resultat("a", reponseFragments(e, "difference")),
    utilise("b", [t("On divise les deux membres de la relation par "), f("u_n"), t(` (aucun terme n'est nul), puis on simplifie ${COURS_SUITES}.`)]),
    calcul("b", lignesQuotientRecurrence(e)),
    resultat("b", reponseFragments(e, "quotient")),
    ...etapeVerdict(e, latexDifferenceRecurrence(e.g), latexQuotientRecurrence(e.g)),
  ];
}

// ============================================================================
// Nature d'une liste de termes.
// ============================================================================

function etapesNatureTermes(e: ExerciceNatureTermes): EtapeCorrection[] {
  const T = e.termes;
  const d = ecarts(T);
  const qs = rapports(T);
  const lignesEcarts = d.flatMap((x, i) => sansRepetition([ligne(`u_{${i + 2}}-u_{${i + 1}}=${qLatex(T[i + 1])}-${qMoins(T[i])}`), ligne(`=${qLatex(x)}`)]));
  const lignesRapports = qs.flatMap((x, i) => sansRepetition([ligne(`\\dfrac{u_{${i + 2}}}{u_{${i + 1}}}=\\dfrac{${qLatex(T[i + 1])}}{${qLatex(T[i])}}`), ligne(`=${qLatex(x)}`, x.den === 1 ? undefined : "on simplifie")]));
  const comparer = (valeurs: Q[], nom: (k: number) => string, quoi: "écarts" | "rapports"): LigneCalcul => {
    const k = premierEcart(valeurs);
    if (k < 0) return ligne(valeurs.map(qLatex).join("="), `tous les ${quoi} sont égaux`);
    return ligne(`${nom(k)}=${qLatex(valeurs[k])}\\neq ${qLatex(valeurs[0])}`, `un ${quoi === "écarts" ? "écart" : "rapport"} diffère du premier : ${quoi === "écarts" ? "pas arithmétique" : "pas géométrique"}`);
  };
  const piegeTermes: FragmentConsigne[] =
    e.piege === "ecart-dernier"
      ? [t("Les premiers écarts sont égaux, pas le dernier : s'arrêter aux premiers fait conclure à tort à une suite arithmétique. Un seul écart différent suffit à l'exclure.")]
      : e.piege === "rapport-dernier"
        ? [t("Les premiers rapports sont égaux, pas le dernier : s'arrêter aux premiers fait conclure à tort à une suite géométrique. Un seul rapport différent suffit à l'exclure.")]
        : [t("Ne regarder que les deux premiers termes, ou calculer les écarts dans le mauvais ordre ("), f("u_k-u_{k+1}"), t(") et les rapports à l'envers.")];
  return [
    utilise("a", [t(`Un écart entre deux termes consécutifs, c'est un terme MOINS le précédent, dans cet ordre : `), f("u_{k+1}-u_k"), t(` ${COURS_SUITES}.`)]),
    calcul("a", lignesEcarts),
    resultat("a", reponseFragments(e, "ecarts")),
    utilise("b", [t("Un rapport entre deux termes consécutifs, c'est un terme DIVISÉ par le précédent : "), f("\\dfrac{u_{k+1}}{u_k}"), t(`, valeur exacte ${COURS_NATURE}.`)]),
    calcul("b", lignesRapports),
    resultat("b", reponseFragments(e, "rapports")),
    utilise("c", [
      t("Une suite arithmétique a TOUS ses écarts égaux, une suite géométrique TOUS ses rapports égaux. Une liste finie peut réfuter (un seul écart ou rapport différent suffit) mais jamais prouver : d'où le mot « compatibles » "),
      t(`${COURS_NATURE}.`),
    ]),
    calcul("c", [comparer(d, (k) => `u_{${k + 2}}-u_{${k + 1}}`, "écarts"), comparer(qs, (k) => `\\dfrac{u_{${k + 2}}}{u_{${k + 1}}}`, "rapports")], [t("On compare les écarts entre eux, puis les rapports :")]),
    resultat("c", conclusionVerdict(e)),
    piege("c", piegeTermes),
  ];
}

export function correctionDetailleeDefinirSuite(e: ExerciceDefinirSuite): EtapeCorrection[] {
  switch (e.variante) {
    case "notations":
      return etapesNotations(e);
    case "recurrence":
      return etapesRecurrence(e);
    case "nature-formule":
      return etapesNatureFormule(e);
    case "nature-recurrence":
      return etapesNatureRecurrence(e);
    case "nature-termes":
      return etapesNatureTermes(e);
  }
}
