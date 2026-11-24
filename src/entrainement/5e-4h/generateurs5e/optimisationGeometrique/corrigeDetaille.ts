import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceCubique, ExerciceCylindre, ExerciceFenetre, ExerciceMarges, ExerciceOptimisation, ExerciceTrapeze, ValeurAvecPi } from "../../core5e/optimisationGeometrique.types";
import { ordreEcransOptimisation, type EcranOptimisation } from "../../moteur5e/typesOptimisationGeometrique";
import { formatReponseAttendueEcranLatex, formatValeurAvecPiLatex } from "../../ui5e/formatOptimisationGeometrique";
import { alphaOptTrapeze, conclusionReelle, coutOptimalCylindre, pointsTest, uOptTrapeze, valeurFOptimisation, valeurNumeriqueAvecPi, xOptimal } from "../../moteur5e/verificationOptimisationGeometrique";
import {
  COURS_OPTIMISATION,
  COURS_REGLES,
  COURS_SIGNE,
  approche,
  dec,
  egalApprox,
  f,
  finaliserDerivees,
  lignesTrinome,
  nbT,
  parN,
  q,
  qL,
  racineL,
  signeRel,
  t,
  valeurRacine,
  type Fragments,
} from "../../ui5e/corrigeDerivees2";

/**
 * Corrigé détaillé « comme au tableau » de 5gen32 (optimisation géométrique) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreEcransOptimisation`) : contrainte
 * exploitée (une inconnue isolée, une opération par ligne), fonction F à une variable (substitution,
 * développement), dérivée (règles du cours, une par ligne : produit pour sin·cos, (1/x)′, (u/v)′),
 * F′ = 0 résolue (trinôme en u = cos α, racine cubique, carré isolé, racine négative rejetée), signe de
 * F′ aux deux points test de l'écran, valeurs optimales (relation de l'optimum réutilisée : x³ = V/2 ⇒
 * h = 2x, (4 + π)r = P ⇒ h = r…), coût. Variante « cubique » : conditions traduites en équations.
 * La variable de l'énoncé (α, r) remplace le x que l'écran fait saisir. SANS `docx` : importé par
 * l'adaptateur ET par `App5gen32.tsx`.
 */

const LETTRES = "abcdefgh";

export function lettreEcranOptimisation(e: ExerciceOptimisation, ecran: EcranOptimisation): string {
  return LETTRES[ordreEcransOptimisation(e).indexOf(ecran)] ?? "a";
}

export function variableOptimisation(e: ExerciceOptimisation): string {
  if (e.famille === "trapeze") return "\\alpha";
  if (e.famille === "fenetreA" || e.famille === "fenetreB") return "r";
  return "x";
}

/** L'écran fait saisir x pour α ou r : le papier reprend la variable de l'énoncé. */
export function avecVariableOptimisation(e: ExerciceOptimisation, latexEcran: string): string {
  const v = variableOptimisation(e);
  if (v === "x") return latexEcran;
  return latexEcran.replace(/(?<![A-Za-z\\])x(?![A-Za-z])/g, v === "\\alpha" ? "\\alpha " : "r").replace(/\\alpha \)/g, "\\alpha)").replace(/\\alpha ([,}])/g, "\\alpha$1");
}

export function reponseEcranOptimisation(e: ExerciceOptimisation, ecran: EcranOptimisation): string {
  return avecVariableOptimisation(e, formatReponseAttendueEcranLatex(e, ecran));
}

type Etapes = Partial<Record<EcranOptimisation, { utilise: Fragments; blocs: { lignes: LigneCalcul[]; intro?: Fragments; label?: string }[]; verification?: { fr: Fragments; lignes?: LigneCalcul[] }; piege?: Fragments }>>;

const Pi = (v: ValeurAvecPi) => formatValeurAvecPiLatex(v);
/** Valeur avec π entre parenthèses si c'est une somme (facteur). */
const PiF = (v: ValeurAvecPi) => (v.coeffPi !== 0 && v.rationnel !== 0 ? `(${Pi(v)})` : Pi(v));
const rel = (v: number, d = 2) => egalApprox(v, d);

/** Lignes de F′ aux deux points test : expression substituée, valeur approchée et signe. */
function lignesPointsTest(e: ExerciceOptimisation, substituer: (x: string, xNum: number) => string, deriv: (x: number) => number): LigneCalcul[] {
  const pts = pointsTest(e);
  const u = e.famille === "trapeze" ? "^{\\circ}" : "";
  const lignes: LigneCalcul[] = [];
  for (const [aff, num, quand] of [
    [pts.affichageAvant, pts.avant, "avant l'optimum"],
    [pts.affichageApres, pts.apres, "après l'optimum"],
  ] as const) {
    const xL = `${dec(aff, 2)}${u}`;
    const v = deriv(num);
    lignes.push(ligne(`F'(${xL})=${substituer(xL, num)}`, `${quand} : on remplace ${e.famille === "trapeze" ? "α" : e.famille === "fenetreA" || e.famille === "fenetreB" ? "r" : "x"} par ${nbT(aff)}${e.famille === "trapeze" ? "° (calculatrice en degrés)" : ""}`));
    lignes.push(ligne(`${rel(v)}${signeRel(v)}`));
  }
  return lignes;
}

// ============================================================================
// Trapèze (gouttière).
// ============================================================================

function trapeze(e: ExerciceTrapeze): Etapes {
  const { b, l } = e;
  const lb = l * b;
  const ll = l * l;
  const sol = lignesTrinome(2 * l, b, -l, "u");
  const u1 = sol.racines.find((r) => valeurRacine(r) < 0);
  const alpha = alphaOptTrapeze(e);
  const deg = (alpha * 180) / Math.PI;
  const u = uOptTrapeze(e);
  const sin = Math.sqrt(1 - u * u);
  const lignesSin: LigneCalcul[] = [ligne(`\\sin\\alpha=\\sqrt{1-\\cos^{2}\\alpha}`, "sin α > 0 car 0° < α < 90°")];
  if (e.u) {
    const { num: p, den: d } = e.u;
    lignesSin.push(ligne(`=\\sqrt{1-\\left(\\frac{${p}}{${d}}\\right)^{2}}`, [t("car "), f(`\\cos\\alpha=u=${qL(q(p, d))}`)]));
    lignesSin.push(ligne(`=\\dfrac{\\sqrt{${d * d - p * p}}}{${d}}`, [f(`1-\\frac{${p * p}}{${d * d}}=\\frac{${d * d - p * p}}{${d * d}}`)]));
  }
  lignesSin.push(ligne(`\\approx ${approche(sin, 4)}`, e.u ? undefined : "avec u non arrondi"));
  const uL = e.u ? `\\frac{${e.u.num}}{${e.u.den}}` : dec(u, 4);
  const h = l * sin;
  const B = b + 2 * l * u;
  const A = valeurFOptimisation(e, alpha);
  return {
    lien: {
      utilise: [t("Dans le triangle rectangle formé par un bord, la hauteur et sa projection horizontale : "), f("\\sin\\alpha=\\frac{h}{l}"), t(" et "), f("\\cos\\alpha=\\frac{p}{l}"), t(" ; la grande base dépasse le fond de deux projections "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`h(\\alpha)=l\\sin\\alpha`, "côté opposé à α = hypoténuse × sin α"),
            ligne(`=${l}\\sin\\alpha`, [f(`l=${l}`)]),
            ligne(`p=${l}\\cos\\alpha`, "projection d'un bord : côté adjacent = hypoténuse × cos α"),
            ligne(`B(\\alpha)=b+2p`, "une projection de chaque côté du fond"),
            ligne(`=${b}+${2 * l}\\cos\\alpha`, [f(`b=${b}`)]),
          ],
        },
      ],
    },
    construire: {
      utilise: [t("Aire d'un trapèze : "), f("\\frac{b+B}{2}\\cdot h"), t(" ; on remplace B et h par leurs expressions en α "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`F(\\alpha)=\\dfrac{b+B(\\alpha)}{2}\\cdot h(\\alpha)`, "aire du trapèze"),
            ligne(`=\\dfrac{${b}+${b}+${2 * l}\\cos\\alpha}{2}\\cdot ${l}\\sin\\alpha`, "on remplace"),
            ligne(`=(${b}+${l}\\cos\\alpha)\\cdot ${l}\\sin\\alpha`, "on divise le numérateur par 2"),
          ],
        },
      ],
    },
    deriver: {
      utilise: [t("On distribue, puis on dérive terme à terme avec "), f("(\\sin\\alpha)'=\\cos\\alpha"), t(", "), f("(\\cos\\alpha)'=-\\sin\\alpha"), t(" (α en radians) et la règle du produit "), f("(uv)'=u'v+uv'"), t(" "), t(COURS_REGLES), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`F(\\alpha)=${lb}\\sin\\alpha+${ll}\\sin\\alpha\\cos\\alpha`, "on distribue"),
            ligne(`F'(\\alpha)=${lb}\\cos\\alpha+${ll}(\\sin\\alpha\\cos\\alpha)'`, [f("(\\sin\\alpha)'=\\cos\\alpha")]),
            ligne(`(\\sin\\alpha\\cos\\alpha)'=\\cos\\alpha\\cos\\alpha+\\sin\\alpha(-\\sin\\alpha)`, "dérivée d'un produit"),
            ligne(`=\\cos^{2}\\alpha-\\sin^{2}\\alpha`),
            ligne(`F'(\\alpha)=${lb}\\cos\\alpha+${ll}(\\cos^{2}\\alpha-\\sin^{2}\\alpha)`, "on remplace"),
          ],
        },
      ],
    },
    resoudre: {
      utilise: [t("On remplace "), f("\\sin^{2}\\alpha"), t(" par "), f("1-\\cos^{2}\\alpha"), t(" et on pose "), f("u=\\cos\\alpha"), t(" : on obtient une équation du second degré en u ; comme 0° < α < 90°, on garde la solution comprise entre 0 et 1 "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`${lb}\\cos\\alpha+${ll}(\\cos^{2}\\alpha-\\sin^{2}\\alpha)=0`, [f("F'(\\alpha)=0")]),
            ligne(`${lb}u+${ll}(u^{2}-(1-u^{2}))=0`, [f("\\sin^2\\alpha=1-u^{2}"), t(" avec "), f("u=\\cos\\alpha")]),
            ligne(`${2 * ll}u^{2}+${lb}u-${ll}=0`, "on réduit"),
            ligne(`${2 * l}u^{2}+${b}u-${l}=0`, `on divise par ${l}`),
            ...sol.lignes,
          ],
        },
        {
          label: "Angle",
          lignes: [ligne(`\\alpha=\\arccos(${e.u ? qL(q(e.u.num, e.u.den), true) : dec(u, 4)})`, [t("touche "), f("\\cos^{-1}"), t(", calculatrice en degrés")]), ligne(`${Math.abs(deg - Math.round(deg)) < 1e-9 ? "=" : "\\approx "}${Math.round(deg)}^{\\circ}`, Math.abs(deg - Math.round(deg)) < 1e-9 ? undefined : "arrondi au degré")],
        },
      ],
      piege: [t("On garde la solution u comprise entre 0 et 1 (u = cos α avec 0° < α < 90°)"), ...(u1 ? [t(" : "), f(`u=${racineL(u1)}<0`), t(" est rejetée")] : []), t(".")],
      verification: e.u ? { fr: [t("La solution retenue vérifie l'équation en u :")], lignes: [ligne(`${2 * l}\\cdot\\left(${qL(q(e.u.num, e.u.den), true)}\\right)^{2}+${b}\\cdot ${qL(q(e.u.num, e.u.den), true)}-${l}=0`)] } : undefined,
    },
    justifier: {
      utilise: [t("Signe de F′ de part et d'autre de l'angle trouvé : + puis −, F croît puis décroît, maximum "), t(COURS_SIGNE), t(". On écrit "), f("\\cos^{2}\\alpha-\\sin^{2}\\alpha=2\\cos^{2}\\alpha-1"), t(".")],
      blocs: [{ lignes: lignesPointsTest(e, (xL) => `${lb}\\cos ${xL}+${ll}(2\\cos^{2} ${xL}-1)`, (a) => lb * Math.cos(a) + ll * (Math.cos(a) ** 2 - Math.sin(a) ** 2)) }],
    },
    conclure: {
      utilise: [t("On remplace α par sa valeur non arrondie dans h, B et F, avec "), f("\\cos\\alpha=u"), t(" et "), f("\\sin\\alpha=\\sqrt{1-u^{2}}"), t(" "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        { label: "Sinus", lignes: lignesSin },
        {
          label: "Valeurs",
          lignes: [
            ligne(`h=${l}\\sin\\alpha`, "étape 1"),
            ligne(`${rel(h)}`),
            ligne(`B=${b}+${2 * l}\\cos\\alpha`, "étape 1"),
            ...(e.u ? [ligne(`=${b}+${2 * l}\\cdot ${uL}`, [f(`\\cos\\alpha=u`)])] : []),
            ligne(`${rel(B)}`, e.u ? undefined : [f("\\cos\\alpha=u"), t(" non arrondi")]),
            ligne(`\\text{Aire}_{\\max}=(${b}+${l}\\cos\\alpha)\\cdot ${l}\\sin\\alpha`, "F(α), étape 2"),
            ligne(`${rel(A)}`, "valeurs non arrondies de cos α et sin α"),
          ],
        },
      ],
    },
  };
}

// ============================================================================
// Cylindre.
// ============================================================================

function cylindre(e: ExerciceCylindre): Etapes {
  const V = e.coeffV;
  const x = e.xOpt;
  const exact = Number.isInteger(Math.round(x * 1e9) / 1e9);
  const xi = Math.round(x);
  const etapes: Etapes = {
    lien: {
      utilise: [t("Volume d'un cylindre : "), f("V=\\pi x^{2}h"), t(" ; on isole h "), t(COURS_OPTIMISATION), t(".")],
      blocs: [{ lignes: [ligne(`\\pi x^{2}h=${V}\\pi`, [f(`V=${V}\\pi`)]), ligne(`x^{2}h=${V}`, "on divise par π"), ligne(`h=\\dfrac{${V}}{x^{2}}`, "on divise par x² (x > 0)")] }],
    },
    construire: {
      utilise: [t("Aire totale = deux disques + surface latérale : "), f("S=2\\pi x^{2}+2\\pi x\\,h"), t(" ; on remplace h "), t(COURS_OPTIMISATION), t(".")],
      blocs: [{ lignes: [ligne(`F(x)=2\\pi x^{2}+2\\pi x\\,h`, "aire totale"), ligne(`=2\\pi x^{2}+2\\pi x\\cdot\\dfrac{${V}}{x^{2}}`, "on remplace h"), ligne(`=2\\pi x^{2}+\\dfrac{${2 * V}\\pi}{x}`, "on simplifie par x")] }],
    },
    deriver: {
      utilise: [t("On dérive terme à terme : "), f("(x^{2})'=2x"), t(" et "), f("\\left(\\frac{k}{x}\\right)'=-\\frac{k}{x^{2}}"), t(" "), t(COURS_REGLES), t(".")],
      blocs: [{ lignes: [ligne(`F'(x)=2\\pi\\cdot 2x+${2 * V}\\pi\\cdot\\left(-\\dfrac{1}{x^{2}}\\right)`, "terme à terme"), ligne(`=4\\pi x-\\dfrac{${2 * V}\\pi}{x^{2}}`)] }],
    },
    resoudre: {
      utilise: [t("On isole "), f("x^{3}"), t(" (x > 0), puis on prend la racine cubique "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`4\\pi x-\\dfrac{${2 * V}\\pi}{x^{2}}=0`, [f("F'(x)=0")]),
            ligne(`4\\pi x=\\dfrac{${2 * V}\\pi}{x^{2}}`, "on isole la fraction"),
            ligne(`4\\pi x^{3}=${2 * V}\\pi`, "on multiplie par x² (x > 0)"),
            ligne(`x^{3}=${V / 2}`, "on divise par 4π"),
            ligne(`x=\\sqrt[3]{${V / 2}}`, "racine cubique"),
            ligne(exact ? `=${xi}` : `\\approx ${approche(x, 2)}`, exact ? [t("car "), f(`${xi}^{3}=${V / 2}`)] : "arrondi au centième"),
          ],
        },
      ],
    },
    justifier: {
      utilise: [t("Signe de F′ de part et d'autre du rayon trouvé : − puis +, F décroît puis croît, minimum "), t(COURS_SIGNE), t(".")],
      blocs: [{ lignes: lignesPointsTest(e, (s) => `4\\pi\\cdot ${s}-\\dfrac{${2 * V}\\pi}{${s}^{2}}`, (a) => 4 * Math.PI * a - (2 * V * Math.PI) / (a * a)) }],
    },
    conclure: {
      utilise: [t("À l'optimum, "), f(`x^{3}=${V / 2}`), t(" : on s'en sert pour simplifier h et F avant de remplacer x "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        { label: "Hauteur", lignes: [ligne(`h=\\dfrac{${V}}{x^{2}}`, "étape 1"), ligne(`=\\dfrac{2x^{3}}{x^{2}}`, [t("car "), f(`${V}=2x^{3}`)]), ligne("=2x"), ligne(exact ? `=${2 * xi}` : `\\approx ${approche(2 * x, 2)}`, exact ? undefined : "x non arrondi")] },
        {
          label: "Aire",
          lignes: [
            ligne(`F(x)=2\\pi x^{2}+\\dfrac{${2 * V}\\pi}{x}`, "étape 2"),
            ligne(`=2\\pi x^{2}+4\\pi x^{2}`, [t("car "), f(`\\frac{${2 * V}}{x}=\\frac{4x^{3}}{x}=4x^{2}`)]),
            ligne("=6\\pi x^{2}"),
            ...(exact ? [ligne(`=6\\pi\\cdot ${xi}^{2}`), ligne(`=${6 * xi * xi}\\pi`)] : []),
            ligne(`\\approx ${approche(valeurFOptimisation(e, x), 2)}`, "arrondi au centième"),
          ],
        },
      ],
      verification: { fr: [t("Volume : "), f(`\\pi x^{2}h=\\pi x^{2}\\cdot 2x=2\\pi x^{3}=${V}\\pi`), t(" ✓.")] },
    },
  };
  if (e.avecApplicationNumerique) {
    const prix = e.prixUnitaireMateriau ?? 0;
    const aire = valeurFOptimisation(e, x);
    const cout = coutOptimalCylindre(e);
    etapes.application = {
      utilise: [t("Coût = prix au cm² × aire totale minimale (ce n'est pas une nouvelle optimisation) "), t(COURS_OPTIMISATION), t(".")],
      blocs: [{ lignes: [ligne(`\\text{Coût}=${dec(prix, 2)}\\times\\text{Aire}_{\\min}`, "prix au cm² × aire"), ligne(`\\approx ${approche(cout, 2)}`, [t("aire non arrondie (≈ "), f(approche(aire, 2)), t(" cm²), arrondi au centime")])] }],
    };
  }
  return etapes;
}

// ============================================================================
// Marges.
// ============================================================================

function marges(e: ExerciceMarges): Etapes {
  const { mh, mv } = e;
  const x = e.xOpt;
  const exact = Number.isInteger(Math.round(x * 1e9) / 1e9);
  const xi = Math.round(x);
  const testDerivee = (a: number) => (e.famille === "margesA" ? (2 * mh * (e.T as number)) / (a + 2 * mh) ** 2 - 2 * mv : 2 * mv - (2 * mh * (e.A as number)) / (a * a));
  if (e.famille === "margesA") {
    const T = e.T as number;
    const K = 2 * mh * T;
    const carre = q(mh * T, mv);
    const y = T / (x + 2 * mh) - 2 * mv;
    return {
      lien: {
        utilise: [t("Les dimensions totales de l'affiche sont "), f("x+2m_h"), t(" et "), f("y+2m_v"), t(" : "), f("T=(x+2m_h)(y+2m_v)"), t(" ; on isole y "), t(COURS_OPTIMISATION), t(".")],
        blocs: [{ lignes: [ligne(`${T}=(x+${2 * mh})(y+${2 * mv})`, [t("données : "), f(`T=${T}`), t(", "), f(`2m_h=${2 * mh}`), t(", "), f(`2m_v=${2 * mv}`)]), ligne(`y+${2 * mv}=\\dfrac{${T}}{x+${2 * mh}}`, `on divise par x + ${2 * mh}`), ligne(`y=\\dfrac{${T}}{x+${2 * mh}}-${2 * mv}`, `on retire ${2 * mv}`)] }],
      },
      construire: {
        utilise: [t("Aire imprimée = "), f("x\\cdot y"), t(" ; on remplace y "), t(COURS_OPTIMISATION), t(".")],
        blocs: [{ lignes: [ligne(`F(x)=x\\cdot y`, "aire de la zone imprimée"), ligne(`=x\\left(\\dfrac{${T}}{x+${2 * mh}}-${2 * mv}\\right)`, "on remplace y"), ligne(`=\\dfrac{${T}x}{x+${2 * mh}}-${2 * mv}x`, "on distribue x")] }],
      },
      deriver: {
        utilise: [t("Règle du quotient pour le premier terme, "), f("\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^{2}}"), t(", puis dérivée du terme en x "), t(COURS_REGLES), t(".")],
        blocs: [{ lignes: [ligne(`\\left(\\dfrac{${T}x}{x+${2 * mh}}\\right)'=\\dfrac{${T}(x+${2 * mh})-${T}x}{(x+${2 * mh})^{2}}`, [f(`u=${T}x`), t(", "), f(`v=x+${2 * mh}`), t(", "), f("u'="), f(`${T}`), t(", "), f("v'=1")]), ligne(`=\\dfrac{${K}}{(x+${2 * mh})^{2}}`, "on réduit le numérateur"), ligne(`F'(x)=\\dfrac{${K}}{(x+${2 * mh})^{2}}-${2 * mv}`, [f(`(${2 * mv}x)'=${2 * mv}`)])] }],
      },
      resoudre: {
        utilise: [t("On isole le carré, puis on prend la racine positive (x + 2m_h est une longueur) "), t(COURS_OPTIMISATION), t(".")],
        blocs: [
          {
            lignes: [
              ligne(`\\dfrac{${K}}{(x+${2 * mh})^{2}}-${2 * mv}=0`, [f("F'(x)=0")]),
              ligne(`(x+${2 * mh})^{2}=\\dfrac{${K}}{${2 * mv}}`, "on isole le carré"),
              ...(carre.d !== 2 * mv || carre.n !== K ? [ligne(`=${qL(carre)}`, "on simplifie")] : []),
              ligne(`x+${2 * mh}=\\sqrt{${qL(carre, true)}}`, "racine positive : l'autre donne x < 0"),
              ...(exact ? [ligne(`=${xi + 2 * mh}`)] : []),
              ligne(`x=${exact ? xi + 2 * mh : `\\sqrt{${qL(carre, true)}}`}-${2 * mh}`, `on retire ${2 * mh}`),
              ligne(exact ? `=${xi}` : `\\approx ${approche(x, 2)}`, exact ? undefined : "arrondi au centième"),
            ],
          },
        ],
        piege: [t("L'équation a deux solutions opposées pour "), f(`x+${2 * mh}`), t(" : une longueur est positive, on rejette la solution négative.")],
      },
      justifier: {
        utilise: [t("Signe de F′ de part et d'autre de la largeur trouvée : + puis −, F croît puis décroît, maximum "), t(COURS_SIGNE), t(".")],
        blocs: [{ lignes: lignesPointsTest(e, (s) => `\\dfrac{${K}}{(${s}+${2 * mh})^{2}}-${2 * mv}`, testDerivee) }],
      },
      conclure: {
        utilise: [t("On remplace x par sa valeur (non arrondie) dans y et dans F "), t(COURS_OPTIMISATION), t(".")],
        blocs: [
          { label: "Hauteur", lignes: [ligne(`y=\\dfrac{${T}}{x+${2 * mh}}-${2 * mv}`, "étape 1"), ...(exact ? [ligne(`=\\dfrac{${T}}{${xi + 2 * mh}}-${2 * mv}`), ligne(`=${qL(q(T - 2 * mv * (xi + 2 * mh), xi + 2 * mh))}`)] : [ligne(`=\\dfrac{${T}}{\\sqrt{${qL(carre, true)}}}-${2 * mv}`, [f(`x+${2 * mh}=\\sqrt{${qL(carre, true)}}`)])]), ...(exact && Number.isInteger(y) ? [] : [ligne(`\\approx ${approche(y, 2)}`)])] },
          { label: "Aire", lignes: [ligne(`F(x)=x\\cdot y`, "aire imprimée"), ...(exact ? [ligne(`=${xi}\\cdot ${qL(q(T - 2 * mv * (xi + 2 * mh), xi + 2 * mh))}`)] : []), ligne(`${rel(valeurFOptimisation(e, x))}`, exact ? undefined : "x et y non arrondis")] },
        ],
      },
    };
  }
  const A = e.A as number;
  const K = 2 * mh * A;
  const carre = q(mh * A, mv);
  const y = A / x;
  const cst = A + 4 * mh * mv;
  return {
    lien: {
      utilise: [t("La zone imprimée est un rectangle : "), f("A=x\\,y"), t(" ; on isole y "), t(COURS_OPTIMISATION), t(".")],
      blocs: [{ lignes: [ligne(`${A}=x\\,y`, [f(`A=${A}`)]), ligne(`y=\\dfrac{${A}}{x}`, "on divise par x (x > 0)")] }],
    },
    construire: {
      utilise: [t("Aire totale = produit des dimensions totales "), f("(x+2m_h)(y+2m_v)"), t(" ; on remplace y et on développe "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`F(x)=(x+${2 * mh})(y+${2 * mv})`, "aire totale"),
            ligne(`=(x+${2 * mh})\\left(\\dfrac{${A}}{x}+${2 * mv}\\right)`, "on remplace y"),
            ligne(`=${A}+${2 * mv}x+\\dfrac{${K}}{x}+${4 * mh * mv}`, "on développe"),
            ligne(`=${cst}+${2 * mv}x+\\dfrac{${K}}{x}`, "on regroupe les constantes"),
          ],
        },
      ],
    },
    deriver: {
      utilise: [t("On dérive terme à terme : constante → 0, "), f("(kx)'=k"), t(", "), f("\\left(\\frac{k}{x}\\right)'=-\\frac{k}{x^{2}}"), t(" "), t(COURS_REGLES), t(".")],
      blocs: [{ lignes: [ligne(`F'(x)=${2 * mv}+${K}\\cdot\\left(-\\dfrac{1}{x^{2}}\\right)`, "terme à terme"), ligne(`=${2 * mv}-\\dfrac{${K}}{x^{2}}`)] }],
    },
    resoudre: {
      utilise: [t("On isole "), f("x^{2}"), t(", puis on prend la racine positive (x est une longueur) "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`${2 * mv}-\\dfrac{${K}}{x^{2}}=0`, [f("F'(x)=0")]),
            ligne(`${2 * mv}x^{2}=${K}`, "on multiplie par x² et on isole"),
            ligne(`x^{2}=${qL(carre)}`, `on divise par ${2 * mv}`),
            ligne(`x=\\sqrt{${qL(carre, true)}}`, "racine positive : la solution négative est rejetée"),
            ligne(exact ? `=${xi}` : `\\approx ${approche(x, 2)}`, exact ? undefined : "arrondi au centième"),
          ],
        },
      ],
      piege: [t("L'équation a deux solutions opposées : une longueur est positive, on rejette la solution négative.")],
    },
    justifier: {
      utilise: [t("Signe de F′ de part et d'autre de la largeur trouvée : − puis +, F décroît puis croît, minimum "), t(COURS_SIGNE), t(".")],
      blocs: [{ lignes: lignesPointsTest(e, (s) => `${2 * mv}-\\dfrac{${K}}{${s}^{2}}`, testDerivee) }],
    },
    conclure: {
      utilise: [t("On remplace x par sa valeur (non arrondie) dans y et dans F "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        { label: "Hauteur", lignes: [ligne(`y=\\dfrac{${A}}{x}`, "étape 1"), ...(exact ? [ligne(`=\\dfrac{${A}}{${xi}}`), ligne(`=${qL(q(A, xi))}`)] : []), ...(exact && Number.isInteger(y) ? [] : [ligne(`\\approx ${approche(y, 2)}`)])] },
        { label: "Aire", lignes: [ligne(`F(x)=(x+${2 * mh})(y+${2 * mv})`, "aire totale"), ...(exact ? [ligne(`=${xi + 2 * mh}\\cdot ${qL(q(A + 2 * mv * xi, xi), true).startsWith("\\frac") ? `\\left(${qL(q(A + 2 * mv * xi, xi))}\\right)` : qL(q(A + 2 * mv * xi, xi))}`, [f(`y+${2 * mv}=${qL(q(A + 2 * mv * xi, xi))}`)])] : []), ligne(`${rel(valeurFOptimisation(e, x))}`, exact ? undefined : "x et y non arrondis")] },
      ],
    },
  };
}

// ============================================================================
// Fenêtre.
// ============================================================================

function fenetre(e: ExerciceFenetre): Etapes {
  const r = e.rOpt;
  const exact = Number.isInteger(Math.round(r * 1e9) / 1e9);
  const ri = Math.round(r);
  if (e.famille === "fenetreA") {
    const P = e.P as ValeurAvecPi;
    const Pn = valeurNumeriqueAvecPi(P);
    return {
      lien: {
        utilise: [t("Le périmètre extérieur comprend la base 2r, les deux côtés h et le demi-cercle πr : "), f("P=2r+2h+\\pi r"), t(" ; on isole h "), t(COURS_OPTIMISATION), t(".")],
        blocs: [{ lignes: [ligne(`${Pi(P)}=2r+2h+\\pi r`, [f(`P=${Pi(P)}`)]), ligne(`2h=${Pi(P)}-2r-\\pi r`, "on isole 2h"), ligne(`h=\\dfrac{${Pi(P)}-(2+\\pi)r}{2}`, "on met r en évidence et on divise par 2")] }],
      },
      construire: {
        utilise: [t("Aire = rectangle + demi-disque : "), f("2r\\,h+\\frac{\\pi r^{2}}{2}"), t(" ; on remplace h "), t(COURS_OPTIMISATION), t(".")],
        blocs: [
          {
            lignes: [
              ligne(`F(r)=2r\\,h+\\dfrac{\\pi r^{2}}{2}`, "aire de la fenêtre"),
              ligne(`=r(${Pi(P)}-(2+\\pi)r)+\\dfrac{\\pi r^{2}}{2}`, [f("2r\\cdot\\frac{\\ldots}{2}=r(\\ldots)")]),
              ligne(`=${PiF(P)}r-(2+\\pi)r^{2}+\\dfrac{\\pi}{2}r^{2}`, "on distribue r"),
              ligne(`=${PiF(P)}r-\\left(2+\\dfrac{\\pi}{2}\\right)r^{2}`, [t("on regroupe les termes en "), f("r^{2}")]),
            ],
          },
        ],
      },
      deriver: {
        utilise: [t("F est un polynôme du deuxième degré en r : on dérive terme à terme "), t(COURS_REGLES), t(".")],
        blocs: [{ lignes: [ligne(`F'(r)=${PiF(P)}-2\\left(2+\\dfrac{\\pi}{2}\\right)r`, [f("(r^{2})'=2r")]), ligne(`=${Pi(P)}-(4+\\pi)r`, "on distribue 2")] }],
      },
      resoudre: {
        utilise: [t("F′(r) est du premier degré : on isole r "), t(COURS_OPTIMISATION), t(".")],
        blocs: [
          {
            lignes: [
              ligne(`${Pi(P)}-(4+\\pi)r=0`, [f("F'(r)=0")]),
              ligne(`(4+\\pi)r=${Pi(P)}`, "on isole le terme en r"),
              ligne(`r=\\dfrac{${Pi(P)}}{4+\\pi}`, "on divise par 4 + π"),
              ...(exact ? [ligne(`=\\dfrac{${ri}(4+\\pi)}{4+\\pi}`, [t("car "), f(`${Pi(P)}=${ri}(4+\\pi)`)]), ligne(`=${ri}`)] : [ligne(`\\approx ${approche(r, 2)}`, "arrondi au centième")]),
            ],
          },
        ],
      },
      justifier: {
        utilise: [t("Signe de F′ de part et d'autre du rayon trouvé : + puis −, F croît puis décroît, maximum "), t(COURS_SIGNE), t(".")],
        blocs: [{ lignes: lignesPointsTest(e, (s) => `${Pi(P)}-(4+\\pi)\\cdot ${s}`, (a) => Pn - (4 + Math.PI) * a) }],
      },
      conclure: {
        utilise: [t("On remplace r par sa valeur (non arrondie) dans h et dans F "), t(COURS_OPTIMISATION), t(".")],
        blocs: [
          { label: "Hauteur", lignes: exact ? [ligne(`h=\\dfrac{${Pi(P)}-(2+\\pi)\\cdot ${ri}}{2}`, "étape 1"), ligne(`=\\dfrac{${2 * ri}}{2}`, "les termes en π s'annulent"), ligne(`=${ri}`)] : [ligne(`h=\\dfrac{${Pi(P)}-(2+\\pi)r}{2}`, "étape 1"), ligne(`\\approx ${approche((Pn - (2 + Math.PI) * r) / 2, 2)}`, "r non arrondi")] },
          {
            label: "Aire",
            lignes: exact
              ? [ligne(`F(${ri})=${PiF(P)}\\cdot ${ri}-\\left(2+\\dfrac{\\pi}{2}\\right)\\cdot ${ri}^{2}`, "étape 2"), ligne(`=${2 * ri * ri}+\\dfrac{${ri * ri}\\pi}{2}`, "on développe et on réduit"), ligne(`\\approx ${approche(valeurFOptimisation(e, r), 2)}`)]
              : [ligne(`F(r)=${PiF(P)}r-\\left(2+\\dfrac{\\pi}{2}\\right)r^{2}`, "étape 2"), ligne(`\\approx ${approche(valeurFOptimisation(e, r), 2)}`, "r non arrondi")],
          },
        ],
      },
    };
  }
  const A = e.A as ValeurAvecPi;
  const An = valeurNumeriqueAvecPi(A);
  return {
    lien: {
      utilise: [t("Aire = rectangle + demi-disque : "), f("A=2r\\,h+\\frac{\\pi r^{2}}{2}"), t(" ; on isole h "), t(COURS_OPTIMISATION), t(".")],
      blocs: [{ lignes: [ligne(`${Pi(A)}=2r\\,h+\\dfrac{\\pi r^{2}}{2}`, [f(`A=${Pi(A)}`)]), ligne(`2r\\,h=${Pi(A)}-\\dfrac{\\pi r^{2}}{2}`, "on isole 2rh"), ligne(`h=\\dfrac{${Pi(A)}}{2r}-\\dfrac{\\pi r}{4}`, "on divise chaque terme par 2r")] }],
    },
    construire: {
      utilise: [t("Périmètre = base + deux côtés + demi-cercle : "), f("P=2r+2h+\\pi r"), t(" ; on remplace h "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`F(r)=2r+2h+\\pi r`, "périmètre de la fenêtre"),
            ligne(`=2r+\\dfrac{${Pi(A)}}{r}-\\dfrac{\\pi r}{2}+\\pi r`, [f(`2h=\\frac{${Pi(A)}}{r}-\\frac{\\pi r}{2}`)]),
            ligne(`=\\left(2+\\dfrac{\\pi}{2}\\right)r+\\dfrac{${Pi(A)}}{r}`, "on regroupe les termes en r"),
          ],
        },
      ],
    },
    deriver: {
      utilise: [t("On dérive terme à terme : "), f("(kr)'=k"), t(" et "), f("\\left(\\frac{k}{r}\\right)'=-\\frac{k}{r^{2}}"), t(" "), t(COURS_REGLES), t(".")],
      blocs: [{ lignes: [ligne(`F'(r)=2+\\dfrac{\\pi}{2}-\\dfrac{${Pi(A)}}{r^{2}}`, "terme à terme")] }],
    },
    resoudre: {
      utilise: [t("On isole "), f("r^{2}"), t(", puis on prend la racine positive (r est une longueur) "), t(COURS_OPTIMISATION), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`2+\\dfrac{\\pi}{2}-\\dfrac{${Pi(A)}}{r^{2}}=0`, [f("F'(r)=0")]),
            ligne(`\\left(2+\\dfrac{\\pi}{2}\\right)r^{2}=${Pi(A)}`, "on multiplie par r² et on isole"),
            ligne(`r^{2}=\\dfrac{${Pi(A)}}{2+\\frac{\\pi}{2}}`, "on divise"),
            ...(exact
              ? [ligne(`=${ri * ri}`, [t("car "), f(`${Pi(A)}=${ri * ri}\\left(2+\\frac{\\pi}{2}\\right)`)]), ligne(`r=\\sqrt{${ri * ri}}`, "racine positive : la solution négative est rejetée"), ligne(`=${ri}`)]
              : [ligne(`\\approx ${approche(r * r, 4)}`), ligne(`r\\approx\\sqrt{${dec(r * r, 4)}}`, "racine positive : la solution négative est rejetée"), ligne(`\\approx ${approche(r, 2)}`, "arrondi au centième")]),
          ],
        },
      ],
      piege: [t("L'équation a deux solutions opposées : une longueur est positive, on rejette la solution négative.")],
    },
    justifier: {
      utilise: [t("Signe de F′ de part et d'autre du rayon trouvé : − puis +, F décroît puis croît, minimum "), t(COURS_SIGNE), t(".")],
      blocs: [{ lignes: lignesPointsTest(e, (s) => `2+\\dfrac{\\pi}{2}-\\dfrac{${Pi(A)}}{${s}^{2}}`, (a) => 2 + Math.PI / 2 - An / (a * a)) }],
    },
    conclure: {
      utilise: [t("On remplace r par sa valeur (non arrondie) dans h et dans F "), t(COURS_OPTIMISATION), t(".")],
      blocs: exact
        ? [
            { label: "Hauteur", lignes: [ligne(`h=\\dfrac{${Pi(A)}}{2\\cdot ${ri}}-\\dfrac{\\pi\\cdot ${ri}}{4}`, "étape 1"), ligne(`=${ri}+\\dfrac{${ri}\\pi}{4}-\\dfrac{${ri}\\pi}{4}`, "on divise chaque terme de A par 2r"), ligne(`=${ri}`)] },
            { label: "Périmètre", lignes: [ligne(`F(${ri})=\\left(2+\\dfrac{\\pi}{2}\\right)\\cdot ${ri}+\\dfrac{${Pi(A)}}{${ri}}`, "étape 2"), ligne(`=${2 * ri}+\\dfrac{${ri}\\pi}{2}+${2 * ri}+\\dfrac{${ri}\\pi}{2}`, "on développe"), ligne(`=${4 * ri}+${ri}\\pi`, "on réduit"), ligne(`\\approx ${approche(valeurFOptimisation(e, r), 2)}`)] },
          ]
        : [
            { label: "Hauteur", lignes: [ligne(`h=\\dfrac{${Pi(A)}}{2r}-\\dfrac{\\pi r}{4}`, "étape 1"), ligne(`\\approx ${approche(An / (2 * r) - (Math.PI * r) / 4, 2)}`, "r non arrondi")] },
            { label: "Périmètre", lignes: [ligne(`F(r)=\\left(2+\\dfrac{\\pi}{2}\\right)r+\\dfrac{${Pi(A)}}{r}`, "étape 2"), ligne(`\\approx ${approche(valeurFOptimisation(e, r), 2)}`, "r non arrondi")] },
          ],
    },
  };
}

// ============================================================================
// Cubique (variante du sélecteur).
// ============================================================================

function cubique(e: ExerciceCubique): Etapes {
  const { a, b, d, x2, x3, y3 } = e;
  const k = (-3 * x2) / 2;
  const coefA = x3 ** 3 + k * x3 * x3;
  const pa = (v: number) => (v < 0 ? `(${v})` : `${v}`);
  const kL = k === 1 ? "" : k === -1 ? "-" : `${k}`;
  const poly = `${a === 1 ? "" : a === -1 ? "-" : a}x^{3}${b < 0 ? b : `+${b}`}x^{2}${d < 0 ? d : `+${d}`}`;
  return {
    coeffsImmediats: {
      utilise: [t("En x = 0, tous les termes en x s'annulent : "), f("f(0)=d"), t(" ; et "), f("f'(x)=3ax^{2}+2bx+c"), t(" donne "), f("f'(0)=c"), t(" "), t(COURS_REGLES), t(".")],
      blocs: [{ lignes: [ligne(`f(0)=d`, "x = 0"), ligne(`d=${d}`, [f(`f(0)=${d}`), t(" (donnée)")]), ligne(`f'(x)=3ax^{2}+2bx+c`, "dérivée terme à terme"), ligne(`f'(0)=c`, "x = 0"), ligne(`c=0`, [f("f'(0)=0"), t(" (tangente horizontale en 0)")])] }],
    },
    relation: {
      utilise: [t("La tangente est aussi horizontale en "), f(`x=${x2}`), t(" : "), f(`f'(${x2})=0`), t(" ; on isole b "), t(COURS_REGLES), t(".")],
      blocs: [{ lignes: [ligne(`f'(${x2})=3a\\cdot ${pa(x2)}^{2}+2b\\cdot ${pa(x2)}`, "c = 0"), ligne(`=${3 * x2 * x2}a${2 * x2 < 0 ? 2 * x2 : `+${2 * x2}`}b`), ligne(`${3 * x2 * x2}a${2 * x2 < 0 ? 2 * x2 : `+${2 * x2}`}b=0`, [f(`f'(${x2})=0`)]), ligne(`${2 * x2}b=${-3 * x2 * x2}a`, "on isole le terme en b"), ligne(`b=${kL}a`, `on divise par ${nbT(2 * x2)}`)] }],
    },
    resoudreA: {
      utilise: [t("On remplace b par "), f(`${kL}a`), t(", c = 0 et d dans la condition de passage, puis on résout l'équation du premier degré en a "), t(COURS_REGLES), t(".")],
      blocs: [
        {
          lignes: [
            ligne(`f(${x3})=a\\cdot ${pa(x3)}^{3}+b\\cdot ${pa(x3)}^{2}${d < 0 ? d : `+${d}`}`, `on remplace x par ${nbT(x3)}`),
            ligne(`=${x3 ** 3}a+${x3 * x3}b${d < 0 ? d : `+${d}`}`),
            ligne(`=${x3 ** 3}a${k * x3 * x3 < 0 ? k * x3 * x3 : `+${k * x3 * x3}`}a${d < 0 ? d : `+${d}`}`, [f(`b=${kL}a`)]),
            ligne(`=${coefA}a${d < 0 ? d : `+${d}`}`, "on regroupe"),
            ligne(`${coefA}a${d < 0 ? d : `+${d}`}=${y3}`, [f(`f(${x3})=${y3}`)]),
            ligne(`${coefA}a=${y3 - d}`, `on retire ${nbT(d)}`),
            ligne(`a=\\dfrac{${y3 - d}}{${coefA}}`, `on divise par ${nbT(coefA)}`),
            ligne(`=${a}`),
          ],
        },
      ],
    },
    expressionFinale: {
      utilise: [t("On rassemble les quatre coefficients ; c = 0 : le terme en x n'apparaît pas "), t(COURS_REGLES), t(".")],
      blocs: [{ lignes: [ligne(`b=${kL === "" || kL === "-" ? `${kL}${pa(a)}` : `${kL}\\cdot ${pa(a)}`}`, [f(`b=${kL}a`)]), ligne(`=${b}`), ligne(`f(x)=${poly}`, [f(`a=${a}`), t(", "), f(`b=${b}`), t(", "), f("c=0"), t(", "), f(`d=${d}`)])] }],
      verification: { fr: [t("Le point de passage :")], lignes: [ligne(`f(${x3})=${a}\\cdot ${pa(x3)}^{3}${b < 0 ? b : `+${b}`}\\cdot ${pa(x3)}^{2}${d < 0 ? d : `+${d}`}`), ligne(`=${a * x3 ** 3}${b * x3 * x3 < 0 ? b * x3 * x3 : `+${b * x3 * x3}`}${d < 0 ? d : `+${d}`}`), ligne(`=${y3}`)] },
    },
  };
}

// ============================================================================
// Assemblage.
// ============================================================================

function piegeEcran(e: ExerciceOptimisation, ecran: EcranOptimisation): Fragments | undefined {
  if (ecran === "justifier") return conclusionReelle(e) === "max" ? [t("Annoncer un maximum sans étudier le signe de F′ : c'est le passage de + à − qui le prouve.")] : [t("Annoncer un minimum sans étudier le signe de F′ : c'est le passage de − à + qui le prouve.")];
  if (ecran === "construire" && e.famille !== "cubique") return [t("Garder deux variables dans F : la contrainte (étape 1) doit d'abord éliminer l'autre inconnue.")];
  if (ecran === "coeffsImmediats") return [t("Oublier que f′(0) = 0 impose c = 0.")];
  return undefined;
}

export function correctionDetailleeOptimisation(e: ExerciceOptimisation): EtapeCorrection[] {
  const donnees: Etapes = e.famille === "trapeze" ? trapeze(e) : e.famille === "cylindre" ? cylindre(e) : e.famille === "margesA" || e.famille === "margesB" ? marges(e) : e.famille === "cubique" ? cubique(e) : fenetre(e as ExerciceFenetre);
  const out: EtapeCorrection[] = [];
  for (const ecran of ordreEcransOptimisation(e)) {
    const d = donnees[ecran];
    if (!d) continue;
    const l = lettreEcranOptimisation(e, ecran);
    out.push(utilise(l, d.utilise));
    for (const b of d.blocs) out.push(calcul(l, b.lignes, b.intro ?? [], b.label));
    out.push(resultat(l, [f(reponseEcranOptimisation(e, ecran)), t(".")]));
    if (d.verification) out.push(verification(l, d.verification.fr, d.verification.lignes));
    const p = d.piege ?? piegeEcran(e, ecran);
    if (p) out.push(piege(l, p));
  }
  return finaliserDerivees(out);
}

export { xOptimal, parN };
