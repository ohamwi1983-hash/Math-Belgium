import type { ExerciceExpoProbA, ExerciceExpoProbB, ExerciceExpoProbC, ExerciceExpoProbD, ExerciceExpoProbE, ExerciceExpoProbF, ExerciceExpoProbG, ExerciceExponentiellesProblemes } from "../../core6e/exponentiellesProblemes.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { PhaseExponentiellesProblemes } from "../../moteur6e/typesExponentiellesProblemes";
import { aTLatexE, formatDecimal, formatExposantG, formatModeleG, formatPuissance, formatReponseAttenduePhaseLatex, PHASES_PAR_FAMILLE, uniteTempsProblemes } from "../../ui6e/formatExponentiellesProblemes";
import { COURS_PROBLEMES, dec, finaliserCorrige, formulesSeparees, justif, lim } from "../../ui6e/corrigeExponentielles2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen12` (exponentielles : problèmes contextualisés) —
 * règle `.claude/rules/feuilles-evaluations.md`. SOURCE UNIQUE : importé par l'adaptateur papier
 * (`exportEvaluation.ts`) ET par l'appli (`App6gen12.tsx`). Une étape par écran
 * (`PHASES_PAR_FAMILLE`) : modèle, substitution, résolution (équation isolée puis logarithme),
 * interprétation. Résultats = réponses de l'écran (`formatReponseAttenduePhaseLatex`) ; les
 * calculs partent des DONNÉES IMPRIMÉES et gardent les valeurs NON arrondies jusqu'à la dernière
 * ligne (« ≈ » à la précision demandée).
 */

type E = ExerciceExponentiellesProblemes;
type Etapes = Partial<Record<PhaseExponentiellesProblemes, EtapeCorrection[]>>;

function rep(e: E, phase: PhaseExponentiellesProblemes): string[] {
  return formatReponseAttenduePhaseLatex(e, phase);
}

/** Lignes « ≈ valeur à d1 décimales », puis « ≈ arrondi » (à d2) quand l'écriture diffère. */
function lignesArrondi(v: number, d1: number, d2: number, quoi: string): LigneCalcul[] {
  const l1 = vautAbs(v, d1);
  const l2 = `\\approx ${formatDecimal(v, d2)}`;
  if (l1.replace("=", "\\approx ") === l2 || l1 === `=${formatDecimal(v, d2)}`) return [ligne(l1, "calculatrice")];
  return [ligne(l1, "calculatrice"), ligne(l2, quoi)];
}

/** « =valeur » si v s'écrit EXACTEMENT avec d décimales (écart absolu < 1e-9 : `vaut` compare en
 * relatif, et « = 9954834,2 » passait pour exact), sinon « \\approx valeur ». */
function vautAbs(v: number, d: number): string {
  const f = Math.pow(10, d);
  return `${Math.abs(Math.round(v * f) / f - v) < 1e-9 ? "=" : "\\approx "}${dec(v, d)}`;
}

/** Entier avec espaces fines des milliers (« 5\,000\,000 »). */
function milliers(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "\\,");
}

const mot = (u: string) => texte(` ${u}`);

// ---------------------------------------------------------------------------- Famille A

function etapesA(e: ExerciceExpoProbA): Etapes {
  const u = uniteTempsProblemes(e);
  if (e.sousType === "evaluer") {
    const rL = formatDecimal(e.r, 3);
    const signe = e.croissance ? "+" : "-";
    const final = rep(e, "aEcran2")[0]!;
    const exact = Math.abs(Math.round(e.valeurFinale) - e.valeurFinale) < 1e-9;
    return {
      aEcran1: [
        utilise("a", [texte("Une hausse de p % par période multiplie la quantité par "), latex("r=1+\\dfrac{p}{100}"), texte(" (une baisse : "), latex("r=1-\\dfrac{p}{100}"), texte(") ; après t périodes : "), latex("Q(t)=Q_0\\cdot r^{t}"), texte(` ${COURS_PROBLEMES}.`)]),
        calcul("a", [
          ligne(`r=1${signe}\\dfrac{${e.p}}{100}`, `${e.croissance ? "hausse" : "baisse"} de ${e.p} % par période`),
          ligne(`=${rL}`),
          ligne("Q(t)=Q_0\\cdot r^{t}", "modèle exponentiel"),
          ligne(`=${e.Q0}\\cdot ${rL}^{\\,t}`, justif("", { l: `Q_0=${e.Q0}` }, " : quantité de départ")),
        ]),
        resultat("a", [latex(rep(e, "aEcran1")[0]!)]),
        verification("a", [texte("Au départ ("), latex("t=0"), texte(") :")], [ligne(`Q(0)=${e.Q0}\\cdot ${rL}^{0}`), ligne(`=${e.Q0}`, "on retrouve la quantité de départ")]),
        ...(e.croissance ? [] : [piege("a", [texte("Une baisse de "), latex(`${e.p}\\,\\%`), texte(" donne "), latex(`r=${rL}`), texte(", pas "), latex(`-${formatDecimal(e.p / 100, 2)}`), texte(" ni "), latex(formatDecimal(1 + e.p / 100, 2)), texte(".")])]),
      ],
      aEcran2: [
        utilise("b", [texte("On remplace t par "), latex(String(e.n)), texte(` dans le modèle, puis on arrondit à l'unité ${COURS_PROBLEMES}.`)]),
        calcul("b", [ligne(`Q(${e.n})=${e.Q0}\\cdot ${rL}^{${e.n}}`, `on remplace t par ${e.n}`), ...lignesArrondi(e.valeurFinale, 3, 0, "arrondi à l'unité")]),
        resultat("b", [latex(`Q(${e.n})${exact ? "=" : "\\approx "}${final}`), texte(` après ${e.n} ${u}`)]),
        piege("b", [texte("Les pourcentages se composent : on multiplie "), latex(String(e.n)), texte(" fois par "), latex(rL), texte(" ; ce n'est pas "), latex(`Q_0\\cdot\\left(1${signe}${e.n}\\cdot\\dfrac{${e.p}}{100}\\right)`), texte(".")]),
      ],
    };
  }
  const { T, k, t } = e;
  return {
    aEcran1: [
      utilise("a", [texte(`La quantité double à chaque période : en reculant d'une période, elle est divisée par 2. Entre l'instant t et l'instant T, il y a T − t périodes ${COURS_PROBLEMES}.`)]),
      calcul("a", [ligne("n=T-t", "nombre de périodes entre t et T"), ligne(`=${T}-t`, justif("", { l: `T=${T}` }))]),
      resultat("a", [texte("Nombre de reculs : "), latex(rep(e, "aEcran1")[0]!)]),
    ],
    aEcran2: [
      utilise("b", [texte("Chaque recul divise la quantité par 2 : après "), latex("T-t"), texte(" reculs, elle vaut "), latex("\\dfrac{Q(T)}{2^{T-t}}"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("b", [
        ligne(`Q(t)=\\dfrac{Q(T)}{2^{${T}-t}}`, "étape 1"),
        ligne(`\\dfrac{Q(T)}{2^{${T}-t}}=\\dfrac{Q(T)}{2^{${k}}}`, justif("la quantité vaut ", { l: `\\dfrac{1}{2^{${k}}}` }, " de sa valeur en T")),
        ligne(`${T}-t=${k}`, "mêmes puissances de 2 : exposants égaux"),
        ligne(`t=${t}`, `on isole t`),
      ]),
      resultat("b", [latex(`t=${rep(e, "aEcran2")[0]!}`), mot(u)]),
      verification("b", [texte("De "), latex(`t=${t}`), texte(" à "), latex(`T=${T}`), texte(" :")], [ligne(`${T}-${t}=${k}`, "doublements restants"), ligne(`2^{${k}}=${Math.pow(2, k)}`, "la quantité est multipliée par ce nombre jusqu'à T")]),
      piege("b", [texte("La quantité ne vaut pas la moitié de sa valeur finale à "), latex("\\dfrac{T}{2}"), texte(" mais à "), latex("T-1"), texte(" : la croissance est exponentielle, pas linéaire.")]),
    ],
  };
}

// ---------------------------------------------------------------------------- Famille B

function etapesB(e: ExerciceExpoProbB): Etapes {
  const qL = formatDecimal(e.q, 3);
  const tolL = formatDecimal(e.toleranceSeuil, 1);
  const u = uniteTempsProblemes(e);
  const quot = `\\dfrac{${tolL}}{${e.Q0}}`;
  return {
    bEcran1: [
      utilise("a", [texte("Ce qui diminue de p % par période, c'est ce qui reste : il est multiplié par "), latex("q=1-\\dfrac{p}{100}"), texte(" à chaque période, donc "), latex("\\text{reste}(t)=Q_0\\cdot q^{t}"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("a", [
        ligne(`q=1-\\dfrac{${e.p}}{100}`, `il reste ${100 - e.p} % à chaque période`),
        ligne(`=${qL}`),
        ligne("\\text{reste}(t)=Q_0\\cdot q^{t}", "modèle exponentiel du reste"),
        ligne(`=${e.Q0}\\cdot ${qL}^{\\,t}`, justif("", { l: `Q_0=${e.Q0}` })),
      ]),
      resultat("a", [latex(`\\text{reste}(t)=${rep(e, "bEcran1")[0]!}`)]),
      verification("a", [texte("Au départ, tout reste à faire :")], [ligne(`${e.Q0}\\cdot ${qL}^{0}=${e.Q0}`, justif("", { l: "t=0" }))]),
      piege("a", [texte("Le pourcentage porte sur ce qui reste, pas sur la quantité de départ : l'évolution n'est pas linéaire.")]),
    ],
    bEcran2: [
      utilise("b", [texte("Ce qui a déjà été fait est ce qui manque au reste : "), latex("\\text{complément}(t)=Q_0-\\text{reste}(t)"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("b", [
        ligne("\\text{complément}(t)=Q_0-\\text{reste}(t)", "définition"),
        ligne(`=${e.Q0}-${e.Q0}\\cdot ${qL}^{\\,t}`, "étape 1"),
        ligne(`=${e.Q0}\\cdot(1-${qL}^{\\,t})`, justif("on met ", { l: String(e.Q0) }, " en évidence")),
      ]),
      resultat("b", [latex(`\\text{complément}(t)=${rep(e, "bEcran2")[0]!}`)]),
    ],
    bEcran3: [
      utilise("c", [texte("On remplace t par "), latex(String(e.n)), texte(` dans le complément, puis on arrondit au dixième ${COURS_PROBLEMES}.`)]),
      calcul("c", [ligne(`\\text{complément}(${e.n})=${e.Q0}\\cdot(1-${qL}^{${e.n}})`, `on remplace t par ${e.n}`), ...lignesArrondi(e.complementN, 3, 1, "arrondi au dixième")]),
      resultat("c", [latex(`\\text{complément}(${e.n})\\approx ${rep(e, "bEcran3")[0]!}`)]),
    ],
    bEcran4: [
      utilise("d", [texte("On pose l'équation, on isole la puissance, puis on prend le logarithme népérien des deux membres : "), latex("\\ln\\left(a^{t}\\right)=t\\ln(a)"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("d", [
        ligne(`${e.Q0}\\cdot(1-${qL}^{\\,t})=${e.Q0}-${tolL}`, justif("le complément atteint ", { l: `Q_0-${tolL}` })),
        ligne(`${e.Q0}-${e.Q0}\\cdot ${qL}^{\\,t}=${e.Q0}-${tolL}`, "on distribue"),
        ligne(`-${e.Q0}\\cdot ${qL}^{\\,t}=-${tolL}`, `on soustrait ${e.Q0}`),
        ligne(`${e.Q0}\\cdot ${qL}^{\\,t}=${tolL}`, "on multiplie par −1"),
        ligne(`${qL}^{\\,t}=${quot}`, `on divise par ${e.Q0}`),
        ligne(`t\\ln(${qL})=\\ln\\left(${quot}\\right)`, justif("on prend ln des deux membres : ", { l: "\\ln\\left(a^{t}\\right)=t\\ln(a)" })),
        ligne(`t=\\dfrac{\\ln\\left(${quot}\\right)}{\\ln(${qL})}`, justif("on divise par ", { l: `\\ln(${qL})\\neq 0` })),
        ...lignesArrondi(e.tSeuil, 3, 1, "arrondi au dixième"),
      ]),
      resultat("d", [latex(`t\\approx ${rep(e, "bEcran4")[0]!}`), mot(u)]),
      piege("d", [latex(`\\ln(${qL})`), texte(" et "), latex(`\\ln\\left(${quot}\\right)`), texte(" sont tous deux négatifs : leur quotient est positif (un t négatif signalerait une erreur de signe).")]),
    ],
  };
}

// ---------------------------------------------------------------------------- Famille C

/** Taux et Q₀ recalculés depuis les DONNÉES IMPRIMÉES (v₂ arrondi), non arrondis. */
export function tauxDepuisDonneesC(e: ExerciceExpoProbC): { r: number; Q0: number } {
  const r = Math.pow(e.v2Affiche / e.v1, 1 / (e.t2 - e.t1));
  return { r, Q0: e.v1 / Math.pow(r, e.t1) };
}

function etapesC(e: ExerciceExpoProbC): Etapes {
  const dt = e.t2 - e.t1;
  const v2L = formatDecimal(e.v2Affiche, 1);
  const { r, Q0 } = tauxDepuisDonneesC(e);
  return {
    cEcran1: [
      utilise("a", [texte("Entre les deux mesures, il s'écoule "), latex(`t_2-t_1=${dt}`), texte(" périodes : la valeur est multipliée par "), latex(`r^{${dt}}`), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("a", [
        ligne("v_2=v_1\\cdot r^{t_2-t_1}", "évolution exponentielle"),
        ligne(`${v2L}=${e.v1}\\cdot r^{${dt}}`, "on remplace"),
        ligne(`r^{${dt}}=\\dfrac{${v2L}}{${e.v1}}`, `on divise par ${e.v1}`),
        ligne(`r=\\left(\\dfrac{${v2L}}{${e.v1}}\\right)^{\\frac{1}{${dt}}}`, `racine ${dt}-ième (r > 0)`),
        ligne(`\\approx ${dec(r, 4)}`, "calculatrice"),
      ]),
      resultat("a", [latex(`r\\approx ${rep(e, "cEcran1")[0]!}`)]),
      ...(e.r < 1 ? [piege("a", [texte("Les valeurs diminuent : "), latex("r<1"), texte(" ; le taux de baisse par période est "), latex("1-r"), texte(", pas r.")])] : []),
    ],
    cEcran2: [
      utilise("b", [texte("Le modèle "), latex("Q(t)=Q_0\\cdot r^{t}"), texte(" passe par le point connu "), latex(`(${e.t1}\\,;\\,${e.v1})`), texte(` : on isole Q₀, avec r non arrondi ${COURS_PROBLEMES}.`)]),
      calcul("b", [
        ligne(`${e.v1}=Q_0\\cdot r^{${e.t1}}`, justif("", { l: `Q(${e.t1})=${e.v1}` })),
        ligne(`Q_0=\\dfrac{${e.v1}}{r^{${e.t1}}}`, justif("on divise par ", { l: `r^{${e.t1}}` })),
        ligne(`\\approx ${dec(Q0, 3)}`, "r non arrondi (étape 1)"),
      ]),
      resultat("b", [latex(`Q_0\\approx ${rep(e, "cEcran2")[0]!}`)]),
    ],
    cEcran3: [
      utilise("c", [texte("On remplace t dans "), latex("Q(t)=Q_0\\cdot r^{t}"), texte(` (valeurs non arrondies de Q₀ et r) ${COURS_PROBLEMES}.`)]),
      calcul(
        "c",
        e.tempsDemandes.flatMap((t) => [ligne(`Q(${t})=Q_0\\cdot r^{${t}}`, `on remplace t par ${t}`), ligne(`\\approx ${dec(Q0 * Math.pow(r, t), 3)}`, "calculatrice")]),
      ),
      resultat("c", formulesSeparees(rep(e, "cEcran3"))),
    ],
  };
}

// ---------------------------------------------------------------------------- Famille D

/** Rapport, a − L (= C), L et r recalculés depuis les trois valeurs IMPRIMÉES a, b, c — entières et
 * exactes par construction (`familles/D.ts`) : ils redonnent exactement ρ, C, L de l'instance. */
export function parametresDepuisDonneesD(e: ExerciceExpoProbD): { d1: number; d2: number; rapport: number; aMoinsL: number; L: number; r: number } {
  const d1 = e.aAffiche - e.bAffiche;
  const d2 = e.bAffiche - e.cAffiche;
  const rapport = d2 / d1;
  const aMoinsL = (d1 * d1) / (d1 - d2);
  return { d1, d2, rapport, aMoinsL, L: e.aAffiche - aMoinsL, r: Math.pow(rapport, 1 / e.d) };
}

function etapesD(e: ExerciceExpoProbD): Etapes {
  const { aAffiche: a, bAffiche: b, cAffiche: c, d } = e;
  const p = parametresDepuisDonneesD(e);
  const par = (v: number) => (v < 0 ? `(${v})` : String(v));
  const rapportL = formatDecimal(p.rapport, 3);
  const rL = d === 1 ? `=${rapportL}` : vautAbs(p.r, 4);
  const exactSuppl = Math.abs(Math.round(e.valeurSuppl * 10) / 10 - e.valeurSuppl) < 1e-9;
  const signeC = p.aMoinsL < 0 ? "-" : "+";
  const rd = d === 1 ? "r" : `r^{${d}}`;
  return {
    dEcran1: [
      utilise("a", [
        texte("Pour "),
        latex("T(t)=L+C\\cdot r^{t}"),
        texte(", deux différences consécutives, à "),
        latex(`d=${d}`),
        texte(" unités d'écart, valent "),
        latex("C\\left(1-r^{d}\\right)"),
        texte(" et "),
        latex("C\\,r^{d}\\left(1-r^{d}\\right)"),
        texte(" : leur rapport vaut "),
        latex(rd),
        texte(`, même sans connaître L ${COURS_PROBLEMES}.`),
      ]),
      calcul("a", [
        ligne(`a-b=${a}-${par(b)}`, justif("mesures à ", { l: "t=0" }, " et ", { l: `t=${d}` })),
        ligne(`=${p.d1}`),
        ligne(`b-c=${b}-${par(c)}`, justif("mesures à ", { l: `t=${d}` }, " et ", { l: `t=${2 * d}` })),
        ligne(`=${p.d2}`),
        ligne(`\\dfrac{b-c}{a-b}=\\dfrac{${p.d2}}{${p.d1}}`, "rapport des différences"),
        ligne(`=${rapportL}`, "on simplifie"),
      ]),
      resultat("a", [latex(`${rd}=${rep(e, "dEcran1")[0]!}`)]),
    ],
    dEcran2: [
      utilise("b", [texte("La valeur de départ s'écarte de la limite de "), latex("C=a-L"), texte(", et "), latex("a-b=C\\left(1-r^{d}\\right)"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("b", [
        ligne("a-L=\\dfrac{a-b}{1-r^{d}}", justif("car ", { l: "a-L=C" }, " et ", { l: "a-b=C\\left(1-r^{d}\\right)" })),
        ligne(`=\\dfrac{${p.d1}}{1-${rapportL}}`, "étape 1"),
        ligne(`=\\dfrac{${p.d1}}{${formatDecimal(1 - p.rapport, 3)}}`),
        ligne(`=${formatDecimal(p.aMoinsL, 3)}`),
        ligne(`L=${a}-${par(p.aMoinsL)}`, "on isole L"),
        ligne(`=${formatDecimal(p.L, 3)}`),
      ]),
      resultat("b", [latex(`L=${rep(e, "dEcran2")[0]!}`)]),
      verification("b", [texte("Avec ces valeurs, la troisième mesure est retrouvée :")], [ligne(`L+C\\cdot\\left(${rd}\\right)^{2}=${formatDecimal(p.L, 3)}${signeC}${Math.abs(p.aMoinsL)}\\cdot ${rapportL}^{2}`, justif("", { l: `C=a-L=${formatDecimal(p.aMoinsL, 3)}` })), ligne(`=${c}`, justif("c'est bien ", { l: "c" }))]),
    ],
    dEcran3: [
      utilise("c", [latex("C=T(0)-L=a-L"), texte(" et r est la racine d-ième du rapport "), texte(`${COURS_PROBLEMES}.`)]),
      calcul("c", [
        ligne("C=a-L", "valeur en t = 0 moins la limite"),
        ligne(`=${formatDecimal(p.aMoinsL, 3)}`, "étape 2"),
        ...(d === 1 ? [ligne(`r=${rapportL}`, "d = 1 : r est le rapport lui-même")] : [ligne(`r=${rapportL}^{\\frac{1}{${d}}}`, `racine ${d}-ième du rapport`), ligne(rL, "calculatrice")]),
        ligne(`T(t)${d === 1 ? "=" : "\\approx "}${formatDecimal(p.L, 1)}${signeC}${Math.abs(p.aMoinsL)}\\cdot ${formatDecimal(p.r, 3)}^{\\,t}`, "on remplace L, C et r"),
      ]),
      resultat("c", [latex(`T(t)${d === 1 ? "=" : "\\approx "}${rep(e, "dEcran3")[0]!}`)]),
      ...(e.C < 0 ? [piege("c", [texte("Les valeurs montent vers la limite : "), latex("C<0"), texte(" ; le modèle s'écrit avec un signe « − » devant le terme exponentiel.")])] : []),
    ],
    dEcran4: [
      utilise("d", [texte("On remplace t dans le modèle ; comme "), latex(`t=${e.tSuppl}=3\\times ${d}`), texte(", "), latex(`r^{${e.tSuppl}}=\\left(${rd}\\right)^{3}`), texte(` est exact ${COURS_PROBLEMES}.`)]),
      calcul("d", [
        ligne(`T(${e.tSuppl})=L+C\\cdot r^{${e.tSuppl}}`, `on remplace t par ${e.tSuppl}`),
        ligne(`=${formatDecimal(p.L, 3)}${signeC}${Math.abs(p.aMoinsL)}\\cdot ${rapportL}^{3}`, justif("", { l: `r^{${e.tSuppl}}=\\left(${rd}\\right)^{3}` })),
        ligne(vautAbs(e.valeurSuppl, 3), "on calcule"),
        ...(exactSuppl ? [] : [ligne(`\\approx ${formatDecimal(e.valeurSuppl, 1)}`, "arrondi au dixième")]),
      ]),
      resultat("d", [latex(`T(${e.tSuppl})${exactSuppl ? "=" : "\\approx "}${rep(e, "dEcran4")[0]!}`)]),
    ],
  };
}

// ---------------------------------------------------------------------------- Famille E

function etapesE(e: ExerciceExpoProbE): Etapes {
  const { k, n, a } = e;
  const aL = formatDecimal(a, 1);
  const aT = aTLatexE(a);
  const eat = `e^{-${aT}}`;
  const tn1 = formatPuissance("t", n - 1);
  const tMaxL = formatDecimal(e.tMax, 2);
  const u = uniteTempsProblemes(e);
  return {
    eEcran1: [
      utilise("a", [texte("Règle du produit "), latex("(uv)'=u'v+uv'"), texte(" avec "), latex(`u=${k}t^{${n}}`), texte(" et "), latex(`v=${eat}`), texte(", "), latex("\\left(e^{-at}\\right)'=-a\\,e^{-at}"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("a", [
        ligne(`f(t)=${k}\\,t^{${n}}\\,${eat}`, "modèle donné"),
        ligne(`f'(t)=${k}\\left(${n}${tn1}\\,${eat}-${a === 1 ? "" : aL}t^{${n}}\\,${eat}\\right)`, "règle du produit"),
        ligne(`=${k}\\,${tn1}\\,${eat}\\,(${n}-${aT})`, justif("on met ", { l: `${tn1}\\,${eat}` }, " en évidence")),
      ]),
      resultat("a", [latex(`f'(t)=${rep(e, "eEcran1")[0]!}`)]),
    ],
    eEcran2: [
      utilise("b", [texte(`Pour t > 0, les facteurs ${k}, `), latex(tn1), texte(" et "), latex(eat), texte(" sont strictement positifs : le signe de f′ est celui de "), latex(`${n}-${aT}`), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("b", [
        ligne(`${n}-${aT}=0`, "seul facteur qui peut s'annuler pour t > 0"),
        ligne(`${aT}=${n}`, `on ajoute ${aT === "t" ? "t" : `${aL}t`}`.replace(/\{,\}/g, ",")),
        ...(a === 1 ? [] : [ligne(`t=\\dfrac{${n}}{${aL}}`, `on divise par ${aL}`.replace("{,}", ",")), ligne(`=${tMaxL}`)]),
        ligne("f'(t)>0", justif("pour ", { l: `0<t<${tMaxL}` }, " : f croît")),
        ligne("f'(t)<0", justif("pour ", { l: `t>${tMaxL}` }, " : f décroît")),
      ]),
      resultat("b", [latex(`t=${rep(e, "eEcran2")[0]!}`), mot(u), texte(" (maximum)")]),
      piege("b", [latex("t=0"), texte(" annule aussi f′, mais "), latex("f(0)=0"), texte(" : c'est le minimum, pas le maximum.")]),
    ],
    eEcran3: [
      utilise("c", [texte("On remplace t par l'instant du maximum dans "), latex("f(t)"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("c", [
        ligne(`f(${tMaxL})=${k}\\cdot ${tMaxL}^{${n}}\\cdot e^{-${aL}\\cdot ${tMaxL}}`, `on remplace t par ${tMaxL}`.replace("{,}", ",")),
        ligne(`=${k}\\cdot ${formatDecimal(Math.pow(e.tMax, n), 4)}\\cdot e^{-${n}}`, justif("car ", { l: `${aL}\\cdot ${tMaxL}=${n}` })),
        ...lignesArrondi(e.fMax, 4, 2, "arrondi au centième"),
      ]),
      resultat("c", [latex(`f(${tMaxL})\\approx ${rep(e, "eEcran3")[0]!}`)]),
    ],
  };
}

// ---------------------------------------------------------------------------- Famille F

function etapesF(e: ExerciceExpoProbF): Etapes {
  const kL = formatDecimal(e.k, 2);
  const gL = formatDecimal(e.g, 1);
  const NL = milliers(e.N);
  const kn = (t: number) => formatDecimal(e.k * t, 2);
  const cout = e.F + e.V * e.n2;
  const revenu = e.g * e.personnesN2;
  return {
    fEcran1: [
      utilise("a", [texte("Avec "), latex("k>0"), texte(", "), latex("e^{-kt}\\to 0"), texte(` quand t devient très grand ${COURS_PROBLEMES}.`)]),
      calcul("a", [lim("t\\to+\\infty", `\\left(-${kL}\\,t\\right)`, "-\\infty", justif("", { l: `k=${kL}>0` })), lim("t\\to+\\infty", `e^{-${kL}t}`, "0", justif("", { l: "e^{u}\\to 0" }, " quand ", { l: "u\\to-\\infty" })), lim("t\\to+\\infty", "p(t)", "1-0", "on remplace"), ligne("=1")]),
      resultat("a", [latex(`\\lim\\limits_{t\\to+\\infty}p(t)=${rep(e, "fEcran1")[0]!}`), texte(" : à terme, toute la population visée est touchée")]),
    ],
    fEcran2: [
      utilise("b", [texte("On remplace t par "), latex(String(e.n1)), texte(" dans "), latex("p(t)=1-e^{-kt}"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("b", [ligne(`p(${e.n1})=1-e^{-${kL}\\cdot ${e.n1}}`, `on remplace t par ${e.n1}`), ligne(`=1-e^{-${kn(e.n1)}}`), ...lignesArrondi(e.pN1, 4, 3, "arrondi au millième")]),
      resultat("b", [latex(`p(${e.n1})\\approx ${rep(e, "fEcran2")[0]!}`)]),
    ],
    fEcran3: [
      utilise("c", [texte("Nombre de personnes touchées = population visée × proportion au temps "), latex(String(e.n2)), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("c", [
        ligne(`p(${e.n2})=1-e^{-${kL}\\cdot ${e.n2}}`, `on remplace t par ${e.n2}`),
        ligne(`=1-e^{-${kn(e.n2)}}`),
        ligne(`N\\cdot p(${e.n2})=${NL}\\cdot\\left(1-e^{-${kn(e.n2)}}\\right)`, justif("", { l: `N=${NL}` })),
        ...lignesArrondi(e.personnesN2, 1, 0, "arrondi à l'unité"),
      ]),
      resultat("c", [latex(`N\\cdot p(${e.n2})\\approx ${rep(e, "fEcran3")[0]!}`), texte(" personnes")]),
      piege("c", [texte("On recalcule p au temps "), latex(String(e.n2)), texte(" : réutiliser "), latex(`p(${e.n1})`), texte(" donnerait un nombre faux.")]),
    ],
    fEcran4: [
      utilise("d", [latex("\\text{bénéfice}=\\text{revenu}-(\\text{coûts fixes}+\\text{coûts variables})"), texte(", avec le nombre de personnes NON arrondi "), texte(`${COURS_PROBLEMES}.`)]),
      calcul("d", [
        ligne(`\\text{revenu}=${gL}\\cdot N\\cdot p(${e.n2})`, justif("", { l: `${gL}` }, " € par personne touchée")),
        ligne(vautAbs(revenu, 1), "étape 3, non arrondi"),
        ligne(`\\text{coûts}=${milliers(e.F)}+${milliers(e.V)}\\cdot ${e.n2}`, "coûts fixes + coût par jour × durée"),
        ligne(`=${milliers(cout)}`),
        ligne(`\\text{bénéfice}=\\text{revenu}-\\text{coûts}`, "définition"),
        ligne(`\\approx ${dec(revenu, 1)}-${milliers(cout)}`, "on remplace"),
        ...lignesArrondi(e.beneficeN2, 1, 0, "arrondi à l'unité"),
      ]),
      resultat("d", [latex(`\\text{bénéfice}\\approx ${rep(e, "fEcran4")[0]!}`), texte(" €")]),
      ...(e.beneficeN2 < 0 ? [piege("d", [texte("Le bénéfice est négatif : la campagne coûte plus qu'elle ne rapporte au temps "), latex(String(e.n2)), texte(".")])] : []),
    ],
  };
}

// ---------------------------------------------------------------------------- Famille G

function etapesG(e: ExerciceExpoProbG): Etapes {
  const aL = formatDecimal(e.a, 1);
  const modele = formatModeleG(e.c, e.k, aL);
  const expo = formatExposantG(e.k, aL);
  const sL = formatDecimal(e.sAffiche, 1);
  const smc = formatDecimal(e.sAffiche - e.c, 1);
  const u = uniteTempsProblemes(e);
  const cPlus = e.c === 0 ? "" : `${e.c}+`;
  const evalT = (t: number, v: number): LigneCalcul[] => {
    const ex = e.k - e.a * t;
    const subst = `${e.k === 0 ? "" : e.k}-${aL === "1" ? "" : `${aL}\\cdot `}${t}`;
    return [ligne(`f(${t})=${cPlus}e^{${subst}}`, `on remplace t par ${t}`), ...(ex === 0 ? [ligne(`=${cPlus}e^{0}`), ligne(`=${e.c + 1}`)] : [ligne(`=${cPlus}e^{${formatDecimal(ex, 2)}}`), ...lignesArrondi(v, 4, 2, "arrondi au centième")])];
  };
  const tSeuilL = formatDecimal(e.tSeuil, 2);
  const avant = e.duree <= e.tSeuil;
  const resolution: LigneCalcul[] = [ligne(`${modele}=${sL}`, justif("", { l: `f(t)=S` }))];
  if (e.c !== 0) resolution.push(ligne(`e^{${expo}}=${sL}-${e.c}`, `on soustrait ${e.c}`), ligne(`=${smc}`));
  resolution.push(ligne(`${expo}=\\ln(${smc})`, justif("on prend ln des deux membres (", { l: `${smc}>0` }, ")")));
  if (e.k !== 0) resolution.push(ligne(`-${aL === "1" ? "" : aL}t=\\ln(${smc})-${e.k}`, `on soustrait ${e.k}`));
  resolution.push(ligne(`t=\\dfrac{${e.k === 0 ? "" : e.k}-\\ln(${smc})}{${aL}}`, `on divise par −${aL}`.replace("{,}", ",")));
  resolution.push(...lignesArrondi(e.tSeuil, 4, 2, "arrondi au centième"));
  return {
    gEcran1: [
      utilise("a", [texte("On remplace chaque temps dans le modèle "), latex(`f(t)=${modele}`), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("a", [...evalT(e.tEval1, e.fEval1), ...evalT(e.tEval2, e.fEval2)]),
      resultat("a", formulesSeparees(rep(e, "gEcran1"))),
    ],
    gEcran2: [
      utilise("b", [texte("On isole l'exponentielle, puis on prend le logarithme népérien : "), latex("e^{u}=v\\iff u=\\ln(v)"), texte(" pour "), latex("v>0"), texte(` ${COURS_PROBLEMES}.`)]),
      calcul("b", resolution),
      resultat("b", [latex(`t\\approx ${rep(e, "gEcran2")[0]!}`), mot(u)]),
      piege("b", [texte("On isole d'abord l'exponentielle : le logarithme ne se « distribue » pas sur une somme.")]),
    ],
    gEcran3: [
      utilise("c", [texte("La grandeur décroît : elle reste au-dessus du seuil jusqu'au temps trouvé à l'étape 2, puis passe en dessous et n'y revient plus. On compare ce temps à la durée D.")]),
      calcul("c", [ligne(`t_{\\text{seuil}}\\approx ${tSeuilL}`, "étape 2"), ligne(`D=${e.duree}${avant ? "<" : ">"}${tSeuilL}`, justif("comparé à ", { l: "t_{\\text{seuil}}" }))]),
      resultat("c", [
        latex(rep(e, "gEcran3")[0]!),
        texte(
          avant
            ? e.objectif === "rester"
              ? " : la durée D se termine avant le temps seuil, la grandeur reste au-dessus du seuil pendant toute cette durée"
              : " : la durée D se termine avant le temps seuil, la grandeur n'est pas encore passée sous le seuil"
            : e.objectif === "rester"
              ? " : le temps seuil arrive avant la fin de la durée D, la grandeur passe sous le seuil avant la fin"
              : " : le temps seuil arrive avant la fin de la durée D, la grandeur est passée sous le seuil",
        ),
      ]),
    ],
  };
}

function etapes(e: E): Etapes {
  switch (e.famille) {
    case "A":
      return etapesA(e);
    case "B":
      return etapesB(e);
    case "C":
      return etapesC(e);
    case "D":
      return etapesD(e);
    case "E":
      return etapesE(e);
    case "F":
      return etapesF(e);
    case "G":
      return etapesG(e);
  }
}

export function correctionDetailleeExponentiellesProblemes(e: E): EtapeCorrection[] {
  const parPhase = etapes(e);
  return finaliserCorrige(PHASES_PAR_FAMILLE[e.famille].flatMap((phase) => parPhase[phase] ?? []));
}

/** Lettre d'étape de l'écran `phase`. */
export function lettrePhaseExponentiellesProblemes(e: E, phase: PhaseExponentiellesProblemes): string {
  return "abcd"[PHASES_PAR_FAMILLE[e.famille].indexOf(phase)] ?? "a";
}

