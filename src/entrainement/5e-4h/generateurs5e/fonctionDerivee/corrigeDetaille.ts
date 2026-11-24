import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { AtomeDerivable, ExerciceFonctionDerivee, TypeDerivee } from "../../core5e/fonctionDerivee.types";
import type { EcranFonctionDerivee } from "../../moteur5e/typesFonctionDerivee";
import { formatReponseAttendueCalculerLatex, formatTermesReponseAttendueDecomposerLatex } from "../../ui5e/formatFonctionDerivee";
import { COURS_DERIVEE, coefFacteur, dernierMembre, droiteTropLongue, f, finaliser, jf, liste, par, sansDoublons, t, type Fragments } from "../../ui5e/corrigeDerivees1";
import { formatPolynomeLatex } from "../domaineDefinition/polynome";
import { formatAtomeLatex, formatDeriveeAtomeLatex, formatDeriveeBruteFDeXLatex, formatDeriveeFDeXLatex, formatExterieurEnULatex, formatFDeXLatex, formatInterieurLatex } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de 5gen27 (fonction dérivée) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN : reconnaissance (a), décomposition (b,
 * absente pour une somme de termes), calcul (dernière lettre). Calcul : chaque dérivée de référence
 * écrite avant d'être simplifiée (u′, v′, g′(u), un terme d'une somme par ligne), formule du produit /
 * du quotient / de la chaîne posée puis remplie ; la dernière ligne est la réponse de l'écran
 * (`formatReponseAttendueCalculerLatex`). SANS `docx` : importé par l'adaptateur ET par `App5gen27.tsx`.
 */

export function lettreEcranFonctionDerivee(e: ExerciceFonctionDerivee, ecran: EcranFonctionDerivee): string {
  if (ecran === "reconnaissance") return "a";
  if (ecran === "decomposer") return "b";
  return e.famille === "reglebase" ? "b" : "c";
}

function trivial(at: AtomeDerivable): boolean {
  return at.interieurA === 1 && at.interieurB === 0;
}

/** Règle de référence utilisée pour dériver l'atome (justification). */
function regleAtome(at: AtomeDerivable): Fragments {
  const chaine = !trivial(at);
  switch (at.noyau.type) {
    case "monome":
      if (at.noyau.exposant === 1) return jf("règle ", { l: "(ax)'=a" });
      if (at.noyau.exposant < 0) return jf("règle ", { l: `\\left(\\frac{1}{x^{${-at.noyau.exposant}}}\\right)'=-\\frac{${-at.noyau.exposant}}{x^{${1 - at.noyau.exposant}}}` });
      return jf("règle ", { l: "(x^n)'=n\\,x^{n-1}" });
    case "racine":
      return jf("règle ", { l: "(\\sqrt{x})'=\\frac{1}{2\\sqrt{x}}" });
    case "trig":
      if (at.noyau.fonction === "sin") return chaine ? jf("règle de la chaîne ", { l: "(\\sin u)'=u'\\cos u" }) : jf("règle ", { l: "(\\sin x)'=\\cos x" });
      return chaine ? jf("règle de la chaîne ", { l: "(\\cos u)'=-u'\\sin u" }) : jf("règle ", { l: "(\\cos x)'=-\\sin x" });
  }
}

/** Dérivée de l'atome écrite AVANT simplification (« 3\cdot 4x^{3} »), ou `null` si elle est déjà
 * la forme simplifiée. */
function deriveeBrute(at: AtomeDerivable, v = "x"): string | null {
  const c = at.coeff;
  const fois = (expr: string) => (c === 1 ? expr : c === -1 ? `-${expr}` : `${c}\\cdot ${expr}`);
  if (!trivial(at)) {
    // Facteur trigonométrique d'argument ax + b (produit / quotient) : règle de la chaîne.
    const u = formatInterieurLatex(at);
    const a = par(at.interieurA);
    if (at.noyau.type === "trig") {
      if (at.noyau.fonction === "sin") return `${coefFacteur(c, `\\cos(${u})`)}\\cdot ${a}`;
      return `${coefFacteur(-c, `\\sin(${u})`)}\\cdot ${a}`;
    }
    return null;
  }
  switch (at.noyau.type) {
    case "monome": {
      const n = at.noyau.exposant;
      if (n === 1) return null;
      if (n > 0) return fois(`${n}${n - 1 === 1 ? v : `${v}^{${n - 1}}`}`);
      const m = -n;
      return fois(`\\left(-\\dfrac{${m}}{${v}^{${m + 1}}}\\right)`).replace(/^\\left\((.*)\\right\)$/, "$1");
    }
    case "racine":
      return fois(`\\dfrac{1}{2\\sqrt{${v}}}`);
    case "trig":
      if (at.noyau.fonction === "sin") return null;
      return c === 1 ? null : fois(`(-\\sin(${v}))`);
  }
}

/** « nom'(x) = brute = simplifiée » (une transformation par ligne). */
function lignesDeriveeAtome(nom: string, at: AtomeDerivable): LigneCalcul[] {
  const brute = deriveeBrute(at);
  const finale = formatDeriveeAtomeLatex(at);
  if (brute === null) return [ligne(`${nom}=${finale}`, regleAtome(at))];
  return sansDoublons([ligne(`${nom}=${brute}`, regleAtome(at)), ligne(`=${finale}`, "on simplifie")]);
}

// Produit de deux écritures signées (même règle que l'écran : signe sorti devant).
function sansSigne(s: string): string {
  return s.startsWith("-") ? s.slice(1) : s;
}
function produit(s1: string, s2: string): string {
  const signe = s1.startsWith("-") !== s2.startsWith("-") ? "-" : "";
  return `${signe}${sansSigne(s1)}\\cdot ${sansSigne(s2)}`;
}

// ============================================================================
// Étapes.
// ============================================================================

/** Libellé du type, formules en KaTeX (« Produit u·v », « Quotient u/v » de l'écran). */
function libelleType(ty: TypeDerivee): Fragments {
  switch (ty) {
    case "reglebase":
      return [t("Règle de base (somme)")];
    case "produit":
      return [t("Produit "), f("u\\cdot v")];
    case "quotient":
      return [t("Quotient "), f("\\frac{u}{v}")];
    case "composee":
      return [t("Composée (chaîne)")];
  }
}

const JUSTIFICATION_TYPE: Record<TypeDerivee, string> = {
  reglebase: "somme de termes, chacun en x seul",
  produit: "deux expressions en x multipliées",
  quotient: "une expression en x divisée par une autre",
  composee: "une seule expression appliquée à ax + b, pas à x",
};

function etapeReconnaissance(e: ExerciceFonctionDerivee): EtapeCorrection[] {
  const ambigu = e.typesAcceptes.length > 1;
  const justif =
    e.famille === "quotient" && e.ambigu
      ? jf("1 divisé par une expression en x, ou bien ", { l: "\\frac{1}{u^2}" }, ` appliquée à ${e.trig === "sin" ? "sin" : "cos"}(ax + b)`)
      : ambigu
        ? `${JUSTIFICATION_TYPE[e.typesAcceptes[0]]}, ou bien un nombre divisé par une puissance de ax + b`
        : JUSTIFICATION_TYPE[e.typesAcceptes[0]];
  const lignes: LigneCalcul[] = [ligne(formatFDeXLatex(e), justif)];
  return [
    utilise("a", [
      t("On regarde la dernière opération de f(x) : une somme de termes → règles de base ; un produit → "),
      f("(uv)'"),
      t(" ; un quotient → "),
      f("\\left(\\frac{u}{v}\\right)'"),
      t(` ; une seule expression appliquée à autre chose que x → règle de la chaîne ${COURS_DERIVEE}.`),
    ]),
    calcul("a", lignes),
    resultat("a", [...e.typesAcceptes.flatMap((ty, i) => [...(i > 0 ? [t(" ou ")] : []), ...libelleType(ty)]), t("."), ...(ambigu ? [t(" Les deux lectures sont correctes.")] : [])]),
  ];
}

function etapeDecomposition(e: ExerciceFonctionDerivee): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  const types = e.typesAcceptes;
  const plusieurs = types.length > 1;
  const phrases: Record<TypeDerivee, string> = {
    reglebase: "",
    produit: "Produit : u et v sont les deux facteurs, tels quels.",
    quotient: "Quotient : u est le numérateur, v le dénominateur — l'ordre compte.",
    composee: "Composée : u(x) est ce qui est à l'intérieur, g(u) l'opération appliquée à u — remplacer u par u(x) doit redonner f(x).",
  };
  etapes.push(utilise("b", [t(`${types.map((ty) => phrases[ty]).join(" ").replace(/\.$/, "")} ${COURS_DERIVEE}.`)]));
  for (const type of types) {
    const termes = formatTermesReponseAttendueDecomposerLatex(e, type);
    if (termes.length === 0) continue;
    const lignes: LigneCalcul[] =
      type === "composee"
        ? [ligne(termes[0], "ce qui est à l'intérieur"), ligne(termes[1], "on remplace l'intérieur par u")]
        : [ligne(termes[0], type === "produit" ? "premier facteur" : "numérateur"), ligne(termes[1], type === "produit" ? "second facteur" : "dénominateur")];
    etapes.push(calcul("b", lignes, [], plusieurs ? `Lecture ${type === "composee" ? "composée" : type}` : "Calcul"));
  }
  if (plusieurs) {
    etapes.push(
      resultat(
        "b",
        types.flatMap((ty, i) => [t(`${i > 0 ? ". " : ""}Lecture ${ty === "composee" ? "composée" : ty} : `), ...liste(formatTermesReponseAttendueDecomposerLatex(e, ty))]).concat([t(".")]),
      ),
    );
  } else etapes.push(resultat("b", liste(formatTermesReponseAttendueDecomposerLatex(e, types[0]))));
  if (types[0] === "composee" && e.famille === "composee") {
    const at = e.atome;
    const u = formatInterieurLatex(at);
    const g = formatExterieurEnULatex(at);
    etapes.push(verification("b", [t("En remplaçant u par u(x) dans g(u), on retrouve f(x) :")], [ligne(`g(u(x))=${remplacerU(g, u)}`), ligne(`=f(x)`)]));
  }
  return etapes;
}

/** u remplacé par l'expression intérieure (« \sqrt{u} » → « \sqrt{2x+1} », « u^{3} » → « (2x+1)^{3} »). */
function remplacerU(l: string, u: string): string {
  return l
    .replace(/\\sqrt\{u\}/g, `\\sqrt{${u}}`)
    .replace(/\(u\)/g, `(${u})`)
    .replace(/u\^\{/g, `(${u})^{`)
    .replace(/(?<![a-z\\])u(?![a-z])/g, `(${u})`);
}

function lignesCalcul(e: ExerciceFonctionDerivee): LigneCalcul[] {
  const finale = dernierMembre(formatReponseAttendueCalculerLatex(e));
  switch (e.famille) {
    case "reglebase": {
      const lignes: LigneCalcul[] = [];
      for (const at of e.atomes) {
        const a = formatAtomeLatex(at);
        const brute = deriveeBrute(at);
        const fin = formatDeriveeAtomeLatex(at);
        lignes.push(ligne(`\\left(${a}\\right)'=${brute ?? fin}`, regleAtome(at)));
        if (brute !== null) lignes.push(ligne(`=${fin}`, "on simplifie"));
      }
      lignes.push(ligne(`f'(x)=${formatDeriveeFDeXLatex(e)}`, "dérivée d'une somme : on additionne les dérivées"));
      return sansDoublons(lignes);
    }
    case "produit": {
      const { atome1: A, atome2: B } = e;
      const lignes = [...lignesDeriveeAtome("u'(x)", A), ...lignesDeriveeAtome("v'(x)", B)];
      if (droiteTropLongue(`f'(x)=${finale}`)) {
        lignes.push(ligne(`u'(x)\\cdot v(x)=${produit(formatDeriveeAtomeLatex(A), formatAtomeLatex(B))}`, "premier terme"));
        lignes.push(ligne(`u(x)\\cdot v'(x)=${produit(formatAtomeLatex(A), formatDeriveeAtomeLatex(B))}`, "second terme"));
      }
      lignes.push(ligne(`f'(x)=u'(x)\\cdot v(x)+u(x)\\cdot v'(x)`, jf("dérivée d'un produit ", { l: "(uv)'=u'v+uv'" })));
      const brute = formatDeriveeBruteFDeXLatex(e);
      lignes.push(ligne(`=${brute}`, "on remplace u, u′, v et v′"));
      if (brute !== finale) lignes.push(ligne(`=${finale}`, A.noyau.type === "trig" || B.noyau.type === "trig" ? "on regroupe les nombres et les puissances de x" : "on réduit au même dénominateur et on regroupe"));
      return lignes;
    }
    case "quotient": {
      if (e.ambigu) {
        const inner = formatPolynomeLatex([e.b, e.a], "x");
        const fn = e.trig === "sin" ? "\\sin" : "\\cos";
        // (sin²)′ = 2 sin · cos · a ; (cos²)′ = 2 cos · (−sin) · a = −2a sin cos.
        const k = e.trig === "sin" ? 2 * e.a : -2 * e.a;
        const sc = `\\sin(${inner})\\cos(${inner})`;
        const vprime = coefFacteur(k, sc);
        const deriveeTrig = e.trig === "sin" ? `\\cos(${inner})` : `(-\\sin(${inner}))`;
        return [
          ligne("u'(x)=0", "la dérivée d'une constante est 0"),
          ligne(`v'(x)=2${fn}(${inner})\\cdot\\left(${fn}(${inner})\\right)'`, jf("règle de la chaîne ", { l: "(w^2)'=2w\\cdot w'" })),
          ligne(`=2${fn}(${inner})\\cdot ${deriveeTrig}${e.a === 1 ? "" : `\\cdot ${par(e.a)}`}`, e.trig === "sin" ? jf("règle de la chaîne ", { l: "(\\sin u)'=u'\\cos u" }) : jf("règle de la chaîne ", { l: "(\\cos u)'=-u'\\sin u" })),
          ligne(`=${vprime}`, "on regroupe les nombres"),
          ligne(`f'(x)=\\dfrac{u'(x)\\cdot v(x)-u(x)\\cdot v'(x)}{[v(x)]^{2}}`, jf("dérivée d'un quotient ", { l: "\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}" })),
          ligne(`=\\dfrac{0-1\\cdot ${vprime.startsWith("-") ? `(${vprime})` : vprime}}{${fn}^{4}(${inner})}`, jf("on remplace, avec ", { l: `v^2=${fn}^{4}(${inner})` })),
          ligne(`=\\dfrac{${coefFacteur(-k, sc)}}{${fn}^{4}(${inner})}`, "on réduit le numérateur"),
          ligne(`=${finale}`, jf("on simplifie par ", { l: `${fn}(${inner})` })),
        ];
      }
      const { atome1: A, atome2: B } = e;
      return [
        ...lignesDeriveeAtome("u'(x)", A),
        ...lignesDeriveeAtome("v'(x)", B),
        ligne(`f'(x)=\\dfrac{u'(x)\\cdot v(x)-u(x)\\cdot v'(x)}{[v(x)]^{2}}`, jf("dérivée d'un quotient ", { l: "\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}" })),
        ligne(`=${formatDeriveeBruteFDeXLatex(e)}`, "on remplace u, u′, v et v′"),
        ...(formatDeriveeBruteFDeXLatex(e) === finale ? [] : [ligne(`=${finale}`, "on chasse les fractions du numérateur et on réduit")]),
      ];
    }
    case "composee": {
      const at = e.atome;
      const u = formatInterieurLatex(at);
      const g: AtomeDerivable = { ...at, interieurA: 1, interieurB: 0 };
      const gpu = formatDeriveeAtomeLatex(g).replace(/x/g, "u");
      const brute = deriveeBrute(g, "u");
      const lignes: LigneCalcul[] = [];
      lignes.push(ligne(`g'(u)=${brute ?? gpu}`, regleAtome(g)));
      if (brute !== null) lignes.push(ligne(`=${gpu}`, "on simplifie"));
      lignes.push(ligne(`u'(x)=${at.interieurA}`, jf("règle ", { l: "(ax+b)'=a" })));
      lignes.push(ligne(`f'(x)=g'(u(x))\\cdot u'(x)`, jf("règle de la chaîne ", { l: "(g(u))'=g'(u)\\cdot u'" })));
      lignes.push(ligne(`=${remplacerU(gpu, u)}\\cdot ${par(at.interieurA)}`, [t("on remplace u par "), f(u)]));
      lignes.push(ligne(`=${finale}`, "on calcule le coefficient"));
      return sansDoublons(lignes);
    }
  }
}

function texteRegle(e: ExerciceFonctionDerivee): Fragments {
  switch (e.famille) {
    case "reglebase":
      return [t("Dérivées de référence "), f("(x^n)'=n\\,x^{n-1}"), t(", "), f("(\\sqrt{x})'=\\frac{1}{2\\sqrt{x}}"), t(", "), f("(\\sin x)'=\\cos x"), t(", "), f("(\\cos x)'=-\\sin x"), t(` ; la dérivée d'une somme est la somme des dérivées ${COURS_DERIVEE}.`)];
    case "produit":
      return [t("Dérivée d'un produit "), f("(uv)'=u'v+uv'"), t(` : on dérive d'abord u et v ${COURS_DERIVEE}.`)];
    case "quotient":
      return [t("Dérivée d'un quotient "), f("\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}"), t(` : on dérive d'abord u et v ${COURS_DERIVEE}.`)];
    case "composee":
      return [t("Règle de la chaîne "), f("(g(u))'=g'(u)\\cdot u'"), t(` : on dérive l'extérieure en gardant l'intérieure, puis on multiplie par la dérivée de l'intérieure ${COURS_DERIVEE}.`)];
  }
}

function texteParPiege(e: ExerciceFonctionDerivee): string {
  switch (e.typesAcceptes[0]) {
    case "reglebase":
      return "La dérivée de cos x est −sin x (et celle de sin x est cos x) : attention au signe ; une constante disparaît.";
    case "produit":
      return "La dérivée d'un produit n'est pas le produit des dérivées : (uv)′ = u′v + uv′, jamais u′v′.";
    case "quotient":
      return "Au numérateur, l'ordre compte (u′v − uv′, pas uv′ − u′v) et le dénominateur est v².";
    case "composee":
      return "Ne pas oublier de multiplier par la dérivée de l'intérieure (le coefficient de x dans ax + b).";
  }
}

export function correctionDetailleeFonctionDerivee(e: ExerciceFonctionDerivee): EtapeCorrection[] {
  const l = lettreEcranFonctionDerivee(e, "calculer");
  const etapes: EtapeCorrection[] = [...etapeReconnaissance(e)];
  if (e.famille !== "reglebase") etapes.push(...etapeDecomposition(e));
  etapes.push(utilise(l, texteRegle(e)), calcul(l, lignesCalcul(e)), resultat(l, [f(formatReponseAttendueCalculerLatex(e))]), piege(l, [t(texteParPiege(e))]));
  return finaliser(etapes);
}
