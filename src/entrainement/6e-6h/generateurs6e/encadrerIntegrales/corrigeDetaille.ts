import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEncadrerIntegrale, ExerciceEncadrerIntegrales } from "../../core6e/encadrerIntegrales.types";
import { estPhaseChoix, phasesExercice } from "../../moteur6e/typesEncadrerIntegrales";
import type { PhaseEncadrerIntegrales } from "../../moteur6e/typesEncadrerIntegrales";
import { cibles } from "../../moteur6e/verificationEncadrerIntegrales";
import { bornesOrdonnees, formatReponseAttendueLatex, integraleLatex, intervalle, longueurDetaillee, optionCorrecteFragments } from "../../ui6e/formatEncadrerIntegrales";
import { figureCorrigeSvg } from "../../ui6e/figureEncadrerIntegrales";
import { COURS_INTEGRALES, lignesDepuisJustification, listeFormules } from "../../ui6e/corrigeIntegrales2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen79` (comparer et encadrer des intégrales) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`phasesExercice`). Le raisonnement
 * sur le signe de f (ou de f − g) vient de la justification écrite à la main dans le catalogue,
 * éclatée en lignes (une relation par ligne, le texte qui la précède en justification) ; positivité,
 * comparaison et encadrement m(b − a) ≤ I ≤ M(b − a) posés ligne à ligne ; valeurs tirées de
 * l'instance (`cibles`, `formatReponseAttendueLatex`, `optionCorrecteFragments`).
 */

type E = ExerciceEncadrerIntegrales;
const t = texte;
const f = latex;
const LETTRES = ["a", "b", "c", "d"];

function lettre(e: E, phase: PhaseEncadrerIntegrales): string {
  return LETTRES[phasesExercice(e).indexOf(phase)]!;
}

function frac(x: string): string {
  return x.replace(/\\dfrac/g, "\\frac");
}

/** ∫ entre les bornes rangées dans l'ordre croissant (style texte). */
function integraleOrdonnee(e: E, fonction = "f"): string {
  const [p, q] = bornesOrdonnees(e);
  return `\\int_{${frac(p.latex)}}^{${frac(q.latex)}} ${fonction}(x)\\,dx`;
}

/** Aide de l'écran en phrase : « … croissante et » + formule, ou « … : » + formule. */
function phraseAide(aide: { texte: string; latex?: string }): FragmentConsigne[] {
  const debut = aide.texte.replace(/\s*:$/, "");
  if (!aide.latex) return [t(debut.endsWith(".") ? debut : `${debut}.`)];
  return [t(/\bet$/.test(debut) ? `${debut} ` : `${debut} : `), f(aide.latex), t(".")];
}

function reponse(e: E, phase: PhaseEncadrerIntegrales): FragmentConsigne[] {
  if (estPhaseChoix(phase)) return optionCorrecteFragments(e, phase);
  return listeFormules(formatReponseAttendueLatex(e, phase));
}

/** Point simple écrit en LaTeX (entier, demi, quart, multiple de π/4) proche de `v`. */
function pointSimple(v: number): { latex: string; valeur: number } {
  for (const d of [1, 2, 3, 4]) {
    const k = Math.round(v * d);
    if (Math.abs(k / d - v) < 1e-9) return { latex: d === 1 ? `${k}` : `${k < 0 ? "-" : ""}\\frac{${Math.abs(k)}}{${d}}`, valeur: k / d };
  }
  for (const d of [1, 2, 3, 4, 6]) {
    const k = Math.round((v * d) / Math.PI);
    if (Math.abs((k * Math.PI) / d - v) < 1e-9) {
      const num = Math.abs(k) === 1 ? "\\pi" : `${Math.abs(k)}\\pi`;
      return { latex: `${k < 0 ? "-" : ""}${d === 1 ? num : `\\frac{${num}}{${d}}`}`, valeur: (k * Math.PI) / d };
    }
  }
  return { latex: `${v}`, valeur: v };
}

/** Dernière ligne : le signe de f lui-même, si la justification s'arrête sur un facteur. */
function conclureSigne(lignes: LigneCalcul[], fLatex: string, rel: string): LigneCalcul[] {
  const der = lignes[lignes.length - 1]?.latex ?? "";
  if (der.startsWith(fLatex) || der.startsWith("f(x)")) return lignes;
  return [...lignes, ligne(`f(x)=${fLatex}${rel} 0`, "conclusion sur le signe de f")];
}

// ============================================================================
// Variante « signe ».
// ============================================================================

function etapesSigne(e: Extract<E, { variante: "signe" }>): EtapeCorrection[] {
  const [p, q] = bornesOrdonnees(e);
  const pos = e.signeF === "positif";
  const rel = pos ? "\\ge" : "\\le";
  const positifI = pos !== e.inverse;
  const etapes: EtapeCorrection[] = [];
  const s1 = lettre(e, "signeF");
  etapes.push(
    utilise(s1, phraseAide(e.aide1)),
    calcul(s1, conclureSigne(lignesDepuisJustification(e.justification), e.fLatex, rel)),
    { ...resultat(s1, reponse(e, "signeF")), figureHtml: figureCorrigeSvg(e) },
  );
  const proprieteOrdonnee = (): LigneCalcul[] => [
    ligne(`${p.latex}<${q.latex}`, "bornes dans l'ordre croissant"),
    ligne(`f(x)${rel} 0`, [t("pour tout x de "), f(intervalle(p, q)), t(" (étape 1)")]),
    ligne(`${integraleOrdonnee(e)}${rel} 0`, pos ? "positivité de l'intégrale" : "positivité de l'intégrale, appliquée à −f"),
  ];
  if (e.inverse) {
    const s2 = lettre(e, "signeOrdonne");
    etapes.push(
      utilise(s2, [t("Positivité : si "), f("a\\le b"), t(" et "), f("f\\ge 0"), t(" sur "), f("[a\\,;\\,b]"), t(", alors "), f("\\int_a^b f(x)\\,dx\\ge 0"), t(` (et ≤ 0 si f ≤ 0) ${COURS_INTEGRALES}.`)]),
      calcul(s2, proprieteOrdonnee()),
      resultat(s2, reponse(e, "signeOrdonne")),
    );
    const s3 = lettre(e, "conclusionSigne");
    etapes.push(
      utilise(s3, [t("Échanger les bornes change le signe d'une intégrale : "), f("\\int_b^a f(x)\\,dx=-\\int_a^b f(x)\\,dx"), t(` ${COURS_INTEGRALES}.`)]),
      calcul(s3, [
        ligne(`I=${integraleLatex(e)}`, "les bornes de I sont dans l'ordre décroissant"),
        ligne(`=-${integraleOrdonnee(e)}`, "bornes échangées"),
        ligne(`I${positifI ? "\\ge" : "\\le"} 0`, [t("car "), f(`${integraleOrdonnee(e)}${rel} 0`), t(" (étape 2)")]),
      ]),
      resultat(s3, reponse(e, "conclusionSigne")),
      piege(s3, [t("Oublier que les bornes sont échangées : f est " + (pos ? "positive" : "négative") + " sur l'intervalle, mais "), f(`I=-${integraleOrdonnee(e)}`), t(" est de signe contraire.")]),
    );
  } else {
    const s2 = lettre(e, "conclusionSigne");
    etapes.push(
      utilise(s2, [t("Positivité : si "), f("a\\le b"), t(" et "), f("f\\ge 0"), t(" sur "), f("[a\\,;\\,b]"), t(", alors "), f("\\int_a^b f(x)\\,dx\\ge 0"), t(` (et ≤ 0 si f ≤ 0) ${COURS_INTEGRALES}.`)]),
      calcul(s2, [...proprieteOrdonnee().slice(0, 2), ligne(`I=${integraleLatex(e)}${rel} 0`, pos ? "positivité de l'intégrale" : "positivité de l'intégrale, appliquée à −f")]),
      resultat(s2, reponse(e, "conclusionSigne")),
      piege(s2, [t("Conclure à partir du signe de f en un seul point : il faut que f garde le même signe sur tout l'intervalle.")]),
    );
  }
  return etapes;
}

// ============================================================================
// Variante « comparer ».
// ============================================================================

function etapesComparer(e: Extract<E, { variante: "comparer" }>): EtapeCorrection[] {
  const [p, q] = bornesOrdonnees(e);
  const s1 = lettre(e, "inegalite");
  const s2 = lettre(e, "conclusionComparaison");
  const rel1 = e.issue === "fInfG" ? "\\le" : "\\ge";
  const frs = e.justification;
  const k = frs.findIndex((x) => x.type === "texte" && x.valeur.startsWith("La différence "));
  const diff = frs.find((x) => x.type === "latex" && x.valeur.startsWith("f(x)-g(x)="))?.valeur;
  const etude = frs.some((x) => x.type === "latex" && x.valeur.startsWith("h(x)="));
  let lignes1: LigneCalcul[];
  if (e.issue === "change") {
    const zero = frs.find((x) => x.type === "latex" && /^x=/.test(x.valeur))?.valeur.slice(2) ?? "";
    lignes1 = [
      ...(etude ? lignesDepuisJustification(frs.slice(0, k)) : []),
      ...(diff ? [ligne(diff, "on factorise la différence")] : []),
      ligne(`f(${zero})-g(${zero})=0`, [t("la différence s'annule en "), f(`x=${zero}`), t(", strictement à l'intérieur de "), f(intervalle(p, q)), t(", et y change de signe")]),
    ];
  } else if (!etude && diff) {
    lignes1 = [
      ligne(diff, "on factorise la différence"),
      ligne(`f(x)-g(x)${rel1} 0`, [t("chaque facteur garde un signe constant sur "), f(intervalle(p, q)), t(" (tableau de signes)")]),
      ligne(`f(x)${rel1} g(x)`, [t("pour tout x de "), f(intervalle(p, q))]),
    ];
  } else lignes1 = lignesDepuisJustification(frs);
  const etapes: EtapeCorrection[] = [
    utilise(s1, etude ? [t("On pose h(x) égale à la différence des deux fonctions et on étudie ses variations : le signe de h′ donne le sens de variation de h, puis la valeur de h en son extremum donne le signe de h.")] : phraseAide(e.aide1)),
    calcul(s1, lignes1, [t("On étudie le signe de "), f("f(x)-g(x)"), t(" sur "), f(intervalle(p, q)), t(" :")]),
    { ...resultat(s1, reponse(e, "inegalite")), figureHtml: figureCorrigeSvg(e) },
  ];
  if (e.issue === "change") {
    // zéro de f − g strictement à l'intérieur, puis un point simple de chaque côté
    let lo = p.valeur;
    let hi = q.valeur;
    const h = (x: number) => e.fn(x) - e.gn(x);
    const pas = (hi - lo) / 400;
    let z = (lo + hi) / 2;
    for (let x = lo + pas; x < hi - pas / 2; x += pas) {
      if (Math.sign(h(x)) !== Math.sign(h(x + pas)) && Math.abs(h(x)) > 1e-12) {
        z = x;
        break;
      }
    }
    lo = Math.max(p.valeur, z - (z - p.valeur) / 2);
    hi = Math.min(q.valeur, z + (q.valeur - z) / 2);
    const essais = (de: number, a: number) => {
      for (const d of [1, 2, 4]) {
        for (let k = Math.ceil(de * d); k <= Math.floor(a * d); k++) {
          const v = k / d;
          if (v > p.valeur + 1e-9 && v < q.valeur - 1e-9 && Math.abs(h(v)) > 1e-9 && Math.abs(v - z) > 1e-9) return pointSimple(v);
        }
      }
      for (const d of [4, 6, 3]) {
        for (let k = Math.ceil((de * d) / Math.PI); k <= Math.floor((a * d) / Math.PI); k++) {
          const v = (k * Math.PI) / d;
          if (v > p.valeur + 1e-9 && v < q.valeur - 1e-9 && Math.abs(h(v)) > 1e-9) return pointSimple(v);
        }
      }
      return pointSimple((de + a) / 2);
    };
    const x1 = essais(p.valeur, z);
    const x2 = essais(z, q.valeur);
    const cmp = (x: { latex: string; valeur: number }) => (h(x.valeur) > 0 ? ">" : "<");
    etapes.push(
      utilise(s2, [t("Propriété de comparaison : si "), f("a\\le b"), t(" et "), f("f\\le g"), t(" sur TOUT "), f("[a\\,;\\,b]"), t(", alors "), f("\\int_a^b f(x)\\,dx\\le\\int_a^b g(x)\\,dx"), t(` ${COURS_INTEGRALES}.`)]),
      calcul(
        s2,
        [
          ligne(`f\\left(${x1.latex}\\right)${cmp(x1)}g\\left(${x1.latex}\\right)`, `avant le zéro de f − g`),
          ligne(`f\\left(${x2.latex}\\right)${cmp(x2)}g\\left(${x2.latex}\\right)`, `après le zéro : l'inégalité s'inverse`),
        ],
        [t("On teste l'inégalité de part et d'autre du point où "), f("f-g"), t(" s'annule :")],
      ),
      resultat(s2, reponse(e, "conclusionComparaison")),
      piege(s2, [t("Comparer f et g en une seule valeur de x (ou aux bornes seulement) et conclure : l'inégalité doit être vraie sur tout l'intervalle.")]),
    );
  } else {
    const rel = e.issue === "fInfG" ? "\\le" : "\\ge";
    etapes.push(
      utilise(s2, [t("Propriété de comparaison (croissance de l'intégrale) : si "), f("a\\le b"), t(" et "), f("f\\le g"), t(" sur "), f("[a\\,;\\,b]"), t(", alors "), f("\\int_a^b f(x)\\,dx\\le\\int_a^b g(x)\\,dx"), t(` ${COURS_INTEGRALES}.`)]),
      calcul(s2, [
        ligne(`${p.latex}<${q.latex}`, "bornes dans l'ordre croissant"),
        ligne(`f(x)${rel} g(x)`, [t("pour tout x de "), f(intervalle(p, q)), t(" (étape 1)")]),
        ligne(`${integraleLatex(e, "f")}${rel}${integraleLatex(e, "g")}`, "on intègre l'inégalité"),
        ligne(`I${rel} J`),
      ]),
      resultat(s2, reponse(e, "conclusionComparaison")),
      piege(s2, [t("Croire qu'une puissance plus élevée donne toujours un nombre plus grand : sur "), f("[0\\,;\\,1]"), t(", par exemple, "), f("x^{3}\\le x^{2}"), t(".")]),
    );
  }
  return etapes;
}

// ============================================================================
// Variantes « encadrer » et « moyenne ».
// ============================================================================

function lignesExtremum(e: ExerciceEncadrerIntegrale, quoi: "m" | "M"): LigneCalcul[] {
  const valeur = quoi === "m" ? e.m : e.M;
  if (e.structure === "monotone") {
    const croissante = e.monotonie === "croissante";
    const gauche = (quoi === "m") === croissante;
    const xb = gauche ? e.a : e.b;
    return [ligne(`${quoi}=f(${xb.latex})`, `${gauche ? "borne de gauche" : "borne de droite"} : f est ${croissante ? "croissante" : "décroissante"}`), ligne(`=${valeur.latex}`)];
  }
  const tab = e.tableau!;
  const k = tab.valeurs.findIndex((v) => Math.abs(v.valeur - valeur.valeur) < 1e-12);
  return [ligne(`${quoi}=f(${tab.abscisses[k]!.latex})`, quoi === "m" ? "la plus petite des valeurs du tableau" : "la plus grande des valeurs du tableau"), ligne(`=${valeur.latex}`)];
}

function lignesMonotonie(e: ExerciceEncadrerIntegrale): LigneCalcul[] {
  if (e.structure === "monotone") {
    const croissante = e.monotonie === "croissante";
    return [ligne(e.deriveeLatex, "dérivée de f"), ligne(`f'(x)${croissante ? "\\ge" : "\\le"} 0`, [t("pour tout x de "), f(intervalle(e.a, e.b)), t(croissante ? " : f est croissante" : " : f est décroissante")])];
  }
  const tab = e.tableau!;
  return tab.abscisses.map((x, i) => ligne(`f(${x.latex})=${tab.valeurs[i]!.latex}`, i === 0 || i === tab.abscisses.length - 1 ? "valeur à une borne (tableau)" : "extremum local (tableau)"));
}

/** Facteur d'un produit : entre parenthèses s'il est une somme. */
function facteur(x: string): string {
  return /[+-]/.test(x.slice(1)) ? `(${x})` : x;
}

function etapesEncadrer(e: ExerciceEncadrerIntegrale): EtapeCorrection[] {
  const phases = phasesExercice(e);
  const etapes: EtapeCorrection[] = [];
  const methode: FragmentConsigne[] =
    e.structure === "monotone"
      ? [t("Une fonction monotone sur un intervalle fermé atteint son minimum et son maximum aux bornes : on étudie le signe de sa dérivée.")]
      : [t("Le tableau de variations donne les valeurs de f aux bornes et aux extremums locaux : le minimum est la plus petite, le maximum la plus grande.")];
  const L = e.longueur.latex;
  for (const phase of phases) {
    const sq = lettre(e, phase);
    const derniere = phase === phases[phases.length - 1];
    const res = resultat(sq, reponse(e, phase));
    switch (phase) {
      case "m":
      case "mM":
        etapes.push(
          utilise(sq, methode),
          calcul(sq, [...lignesMonotonie(e), ...lignesExtremum(e, "m"), ...(phase === "mM" ? lignesExtremum(e, "M") : [])]),
          res,
        );
        if (e.structure === "monotone" && e.monotonie === "decroissante" && e.variante === "encadrer") etapes.push(piege(sq, [t("Prendre l'image de la borne de gauche comme minimum sans étudier le sens de variation : f est décroissante, son minimum est atteint en "), f(e.b.latex), t(".")]));
        else if (e.structure === "variations" && e.variante === "encadrer") etapes.push(piege(sq, [t("Ne regarder que les valeurs aux bornes : un extremum local peut être le minimum ou le maximum de f sur l'intervalle.")]));
        break;
      case "M":
        etapes.push(utilise(sq, [t("Même raisonnement : le maximum est la plus grande des valeurs atteintes.")]), calcul(sq, lignesExtremum(e, "M")), res);
        break;
      case "bornes":
      case "bornesIntegrale": {
        const [inf, sup] = cibles(e, phase);
        const I = phase === "bornes" ? "I" : integraleLatex(e);
        etapes.push(
          utilise(sq, [t("Pour tout x de "), f(intervalle(e.a, e.b)), t(", "), f("m\\le f(x)\\le M"), t(" ; la croissance de l'intégrale donne "), f("m(b-a)\\le\\int_a^b f(x)\\,dx\\le M(b-a)"), t(` ${COURS_INTEGRALES}.`)]),
          calcul(sq, [
            ligne(longueurDetaillee(e), "longueur de l'intervalle"),
            ligne(`${e.m.latex}\\le f(x)\\le ${e.M.latex}`, [t("pour tout x de "), f(intervalle(e.a, e.b))]),
            ligne(`${facteur(e.m.latex)}\\times ${L}\\le ${I}\\le ${facteur(e.M.latex)}\\times ${L}`, "on intègre l'encadrement"),
            ligne(`${inf.latex}\\le ${I}\\le ${sup.latex}`),
          ]),
          derniere ? { ...res, figureHtml: figureCorrigeSvg(e) } : res,
        );
        if (e.variante === "encadrer" && e.structure === "monotone" && e.monotonie === "croissante" && Math.abs(e.longueur.valeur - 1) > 1e-9) {
          etapes.push(piege(sq, [t("Oublier de multiplier par la longueur "), f("b-a"), t(" : "), f("m\\le f(x)\\le M"), t(" encadre f, pas l'intégrale.")]));
        }
        break;
      }
      case "bornesMoyenne": {
        const I = integraleLatex(e);
        etapes.push(
          utilise(sq, [t("Valeur moyenne : "), f("\\mu=\\dfrac{1}{b-a}\\int_a^b f(x)\\,dx"), t(` ; on divise chaque membre de l'encadrement de l'intégrale par b − a > 0 ${COURS_INTEGRALES}.`)]),
          calcul(sq, [
            ligne(`\\mu=\\dfrac{1}{${L}}${I}`, "définition de la valeur moyenne"),
            ligne(`\\dfrac{${e.borneInf.latex}}{${L}}\\le\\mu\\le\\dfrac{${e.borneSup.latex}}{${L}}`, [t("on divise l'étape précédente par "), f(`${L}>0`)]),
            ligne(`${e.m.latex}\\le\\mu\\le ${e.M.latex}`),
          ]),
          { ...res, figureHtml: figureCorrigeSvg(e) },
          ...(e.m.valeur !== e.M.valeur ? [verification(sq, [t("On retrouve "), f("m\\le\\mu\\le M"), t(" : la valeur moyenne est comprise entre le minimum et le maximum de f.")])] : []),
          piege(sq, [t("Confondre l'encadrement de l'intégrale et celui de la valeur moyenne : il faut diviser par "), f("b-a"), t(".")]),
        );
        break;
      }
    }
  }
  return etapes;
}

export function correctionDetailleeEncadrerIntegrales(e: E): EtapeCorrection[] {
  if (e.variante === "signe") return etapesSigne(e);
  if (e.variante === "comparer") return etapesComparer(e);
  return etapesEncadrer(e);
}

