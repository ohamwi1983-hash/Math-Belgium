import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceAccumulerGrandeur, ExerciceCo2, ExerciceCuve, ExercicePluieComparer, ExercicePluieSeuil, ExerciceSalle, ExerciceSolaireComparer, ExerciceSolaireSeuil, InstallationSolaire } from "../../core6e/accumulerGrandeur.types";
import { PHASES_ACCUMULER_GRANDEUR } from "../../moteur6e/typesAccumulerGrandeur";
import type { PhaseAccumulerGrandeur } from "../../moteur6e/typesAccumulerGrandeur";
import { energieInstallation, modeleNumerique } from "../../moteur6e/verificationAccumulerGrandeur";
import { dl, fiche, formatReponseAttenduePhaseLatex, primitivePolyLatex } from "../../ui6e/formatAccumulerGrandeur";
import { figureAccumulerGrandeurSvg, legendeAire } from "../../ui6e/figureAccumulerGrandeur";
import { fractionDepuisValeur, fractionLatex } from "../../ui6e/nombresExactsIntegrales";
import { COURS_PRIMITIVES, COURS_PROBLEMES, crochet, integraleTexte } from "../../ui6e/corrigeIntegrales2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen80` (accumuler une grandeur) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans : a) le modèle (quantité
 * initiale + intégrale du taux), b) la primitive (terme à terme, vérifiée en dérivant), c) la
 * quantité accumulée (primitive entre crochets, F(b) − F(a), calcul), d) la question de transfert
 * (équation résolue ligne à ligne, ou seconde intégrale), e) l'unité demandée. Nombres tirés du
 * moteur (`modeleNumerique`) et réponses de l'écran (`formatReponseAttenduePhaseLatex`, `fiche`).
 */

type E = ExerciceAccumulerGrandeur;
const t = texte;
const f = latex;
const LETTRES: Record<PhaseAccumulerGrandeur, string> = { modele: "a", primitive: "b", quantite: "c", transfert: "d", unite: "e" };

const SUJET_CUVE = { cuve: "La cuve", bassin: "Le bassin", citerne: "La citerne" } as const;

const L = "\\ \\text{L}";
const MIN = "\\ \\text{min}";
const H = "\\ \\text{h}";
const WH = "\\ \\text{W}\\cdot\\text{h}";
const KWH = "\\ \\text{kW}\\cdot\\text{h}";
const MM = "\\ \\text{mm}";
const KT = "\\ \\text{kt}";

/** Valeur exacte : fraction irréductible si elle est rationnelle (petit dénominateur), sinon décimal. */
function exact(x: number): string {
  const fr = fractionDepuisValeur(x, 1000);
  return fr ? fractionLatex(fr.num, fr.den) : dl(x);
}

/** Coefficient devant une variable : 1 → « », sinon le décimal. */
function coef(x: number): string {
  return x === 1 ? "" : dl(x);
}

/** Facteur numérique devant une expression : 1 → « », sinon la valeur exacte. */
function facteur(x: number): string {
  return Math.abs(x - 1) < 1e-12 ? "" : exact(x);
}

function par(x: string): string {
  return x.startsWith("-") ? `(${x})` : x;
}

/** Nombre écrit dans un texte (justification) : virgule, « − ». */
function nt(x: number): string {
  return dl(x).replace("{,}", ",").replace("-", "−");
}

/** « =valeur » si le décimal affiché est exact, sinon « approx valeur ». */
function vaut(x: number, d = 3): string {
  const r = Math.round(x * 10 ** d) / 10 ** d;
  return `${Math.abs(r - x) < 1e-9 ? "=" : "\\approx "}${dl(x, d)}`;
}

const int = (a: string | number, b: string | number, integrande: string) => integraleTexte(a, b, integrande, "t");

function reponse(e: E, phase: PhaseAccumulerGrandeur): FragmentConsigne[] {
  return formatReponseAttenduePhaseLatex(e, phase).map(f);
}

function aide(e: E, phase: PhaseAccumulerGrandeur, renvoi = ""): FragmentConsigne[] {
  const a = fiche(e).aides[phase][0];
  const fin = renvoi ? ` ${renvoi}.` : ".";
  return a.latex ? [t(`${a.texte.replace(/\s*:$/, "")} : `), f(a.latex), t(fin)] : [t(a.texte.replace(/\.$/, "") + fin)];
}

interface Contenu {
  modele: LigneCalcul[];
  primitive: { utilise: FragmentConsigne[]; lignes: LigneCalcul[]; verif: LigneCalcul[] };
  quantite: LigneCalcul[];
  transfert: { utilise: FragmentConsigne[]; lignes: LigneCalcul[]; verif?: { texte: FragmentConsigne[]; lignes: LigneCalcul[] } };
  unite: { utilise: FragmentConsigne[]; lignes: LigneCalcul[] };
}

// ============================================================================
// Second degré (cuve vide, salle pleine) : Δ, √Δ, les deux solutions.
// ============================================================================

function lignesSecondDegre(A: number, B: number, Cst: number, garder: (x: number) => boolean): LigneCalcul[] {
  const delta = B * B - 4 * A * Cst;
  const rd = Math.sqrt(delta);
  const x1 = (-B - rd) / (2 * A);
  const x2 = (-B + rd) / (2 * A);
  const den = `2\\times ${par(dl(A))}`;
  return [
    ligne(`\\Delta=${par(dl(B))}^2-4\\times ${par(dl(A))}\\times ${par(dl(Cst))}`, "discriminant"),
    ligne(vaut(delta)),
    ligne(`\\sqrt{\\Delta}${vaut(rd)}`),
    ligne(`t_1=\\dfrac{${dl(-B)}-${dl(rd)}}{${den}}`, "formule du second degré"),
    ligne(vaut(x1), garder(x1) ? "solution retenue" : "négative : rejetée"),
    ligne(`t_2=\\dfrac{${dl(-B)}+${dl(rd)}}{${den}}`),
    ligne(vaut(x2), garder(x2) ? "solution retenue" : "négative : rejetée"),
  ];
}

// ============================================================================
// Situations.
// ============================================================================

function cuve(e: ExerciceCuve): Contenu {
  const m = modeleNumerique(e);
  const a = e.E - e.s0;
  const T = e.T;
  const c2 = e.c / 2;
  const R = `${a}t-${coef(c2)}t^2`;
  const tMax = a / e.c;
  const vMax = e.V0 + a * tMax - c2 * tMax * tMax;
  const max = e.variante === "cuve-max";
  return {
    modele: [
      ligne(`r(t)=e(t)-s(t)`, "débit net : l'eau qui entre moins celle qui sort"),
      ligne(`V(${T})=V(0)+${int(0, T, "r(t)")}`, `volume initial + eau accumulée entre 0 et ${T} min`),
      ligne(`=${e.V0}+${int(0, T, "\\big(e(t)-s(t)\\big)")}`, [t("car "), f(`V(0)=${e.V0}`)]),
    ],
    primitive: {
      utilise: [t("Primitive terme à terme d'une fonction du premier degré : "), f("\\int (a-ct)\\,dt=at-\\dfrac{c}{2}t^2+C"), t(` ${COURS_PRIMITIVES}.`)],
      lignes: [ligne(`r(t)=${e.E}-(${e.s0}+${coef(e.c)}t)`, "débit net"), ligne(`=${a}-${coef(e.c)}t`), ligne(`R(t)=${R}`, "primitive terme à terme (on prend C = 0)")],
      verif: [ligne(`R'(t)=${a}-${coef(e.c)}t`, "on dérive"), ligne(`=r(t)`, "✓")],
    },
    quantite: [
      ligne(`V(${T})=${e.V0}+${int(0, T, "r(t)")}`, "étape 1"),
      ligne(`=${e.V0}+${crochet(R, 0, T)}`, "primitive de l'étape 2"),
      ligne(`=${e.V0}+${a}\\times ${T}-${dl(c2)}\\times ${T}^2`, `R(${T}) − R(0), avec R(0) = 0`),
      ligne(`=${e.V0}+${dl(a * T)}-${dl(c2 * T * T)}`),
      ligne(vaut(m.quantite)),
    ],
    transfert: max
      ? {
          utilise: [t("Le volume augmente tant que le débit net est positif, puis diminue : il est maximal quand le débit net s'annule, "), f("r(t)=0"), t(` ${COURS_PROBLEMES}.`)],
          lignes: [ligne("r(t)=0", "maximum du volume"), ligne(`${a}-${coef(e.c)}t=0`), ligne(`t=\\dfrac{${a}}{${dl(e.c)}}`, "on isole t"), ligne(vaut(tMax))],
          verif: { texte: [t("Avant cet instant le débit net est positif, après il est négatif : "), f(`r(0)=${a}>0`), t(".")], lignes: [] },
        }
      : {
          utilise: [t(`${SUJET_CUVE[e.contexte]} est vide quand le volume s'annule : `), f("V(t)=V(0)+R(t)-R(0)=0"), t(`, équation du second degré dont seule la solution positive a un sens ${COURS_PROBLEMES}.`)],
          lignes: [
            ligne(`V(t)=${e.V0}+${R}`, "V(0) + R(t) − R(0)"),
            ligne(`${e.V0}+${R}=0`, "le volume s'annule"),
            ...lignesSecondDegre(-c2, a, e.V0, (x) => x > 0),
          ],
        },
    unite: max
      ? {
          utilise: [t("Volume maximal : on remplace t par l'instant trouvé, puis "), f("1\\ \\text{m}^3=1000\\ \\text{L}"), t(".")],
          lignes: [
            ligne(`V(${dl(tMax)})=${e.V0}+${a}\\times ${dl(tMax)}-${dl(c2)}\\times ${dl(tMax)}^2`, "on remplace t"),
            ligne(`=${e.V0}+${dl(a * tMax)}-${dl(c2 * tMax * tMax)}`),
            ligne(`${vaut(vMax)}${L}`),
            ligne(`=\\dfrac{${dl(vMax)}}{1000}\\ \\text{m}^3`, "1 m³ = 1000 L"),
            ligne(`${vaut(m.unite)}\\ \\text{m}^3`),
          ],
        }
      : {
          utilise: [t("Une heure compte soixante minutes : "), f("1\\ \\text{h}=60\\ \\text{min}"), t(".")],
          lignes: [ligne(`t=${e.tVide}${MIN}`, "étape 4"), ligne(`=\\dfrac{${e.tVide}}{60}${H}`, "on divise par 60"), ligne(`${vaut(m.unite)}${H}`)],
        },
  };
}

function salle(e: ExerciceSalle): Contenu {
  const m = modeleNumerique(e);
  const T = e.T;
  const b2 = e.b / 2;
  const R = `${e.a}t+${coef(b2)}t^2`;
  return {
    modele: [
      ligne(`N(${T})=N(0)+${int(0, T, "r(t)")}`, `personnes déjà là + personnes entrées entre 0 et ${T} min`),
      ligne(`=${e.N0}+${int(0, T, "r(t)")}`, [t("car "), f(`N(0)=${e.N0}`)]),
    ],
    primitive: {
      utilise: [t("Primitive terme à terme d'une fonction du premier degré : "), f("\\int (a+bt)\\,dt=at+\\dfrac{b}{2}t^2+C"), t(` ${COURS_PRIMITIVES}.`)],
      lignes: [ligne(`r(t)=${e.a}+${coef(e.b)}t`, "rythme d'entrée"), ligne(`R(t)=${R}`, "primitive terme à terme (on prend C = 0)")],
      verif: [ligne(`R'(t)=${e.a}+${coef(e.b)}t`, "on dérive"), ligne(`=r(t)`, "✓")],
    },
    quantite: [
      ligne(`N(${T})=${e.N0}+${int(0, T, "r(t)")}`, "étape 1"),
      ligne(`=${e.N0}+${crochet(R, 0, T)}`, "primitive de l'étape 2"),
      ligne(`=${e.N0}+${e.a}\\times ${T}+${dl(b2)}\\times ${T}^2`, `R(${T}) − R(0), avec R(0) = 0`),
      ligne(`=${e.N0}+${dl(e.a * T)}+${dl(b2 * T * T)}`),
      ligne(vaut(m.quantite)),
    ],
    transfert: {
      utilise: [t("C'est complet quand le nombre de personnes présentes atteint la capacité : "), f("N(t)=C"), t(`, équation du second degré dont seule la solution positive a un sens ${COURS_PROBLEMES}.`)],
      lignes: [
        ligne(`N(t)=${e.N0}+${R}`, "N(0) + R(t) − R(0)"),
        ligne(`${e.N0}+${R}=${e.capacite}`, "complet : N(t) = C"),
        ligne(`${coef(b2)}t^2+${e.a}t-${e.capacite - e.N0}=0`, `on retire ${e.N0} des deux membres`),
        ...lignesSecondDegre(b2, e.a, -(e.capacite - e.N0), (x) => x > 0),
      ],
      verif: { texte: [t("On remplace t dans N(t) :")], lignes: [ligne(`N(${e.tPlein})=${e.N0}+${e.a}\\times ${e.tPlein}+${dl(b2)}\\times ${e.tPlein}^2`), ligne(`=${dl(e.N0 + e.a * e.tPlein + b2 * e.tPlein * e.tPlein)}`, "c'est la capacité ✓")] },
    },
    unite: {
      utilise: [t("Une heure compte soixante minutes : "), f("1\\ \\text{h}=60\\ \\text{min}"), t(".")],
      lignes: [ligne(`t=${e.tPlein}${MIN}`, "étape 4"), ligne(`=\\dfrac{${e.tPlein}}{60}${H}`, "on divise par 60"), ligne(`${vaut(m.unite)}${H}`)],
    },
  };
}

function solaireSeuil(e: ExerciceSolaireSeuil): Contenu {
  const m = modeleNumerique(e);
  const fin = e.lever + e.D;
  const amp = `\\dfrac{${dl(e.Pm * e.D)}}{\\pi}`;
  const angle = (x: number | string) => `\\dfrac{\\pi(${x}-${e.lever})}{${e.D}}`;
  const cos = (x: number | string) => `\\cos\\left(${angle(x)}\\right)`;
  const sin = `\\sin\\left(${angle("t")}\\right)`;
  const quotient = `1-\\dfrac{${dl(e.Ebatterie)}\\pi}{${dl(e.Pm * e.D)}}`;
  return {
    modele: [ligne(`E=${int(e.t1, e.t2, "P(t)")}`, `énergie = intégrale de la puissance entre ${e.t1} h et ${e.t2} h (W × h = W·h)`)],
    primitive: {
      utilise: [t("Primitive d'un sinus : "), f("\\int \\sin(\\omega t+\\varphi)\\,dt=-\\dfrac{1}{\\omega}\\cos(\\omega t+\\varphi)+C"), t(", ici "), f(`\\omega=\\dfrac{\\pi}{${e.D}}`), t(` ${COURS_PRIMITIVES}.`)],
      lignes: [ligne(`F(t)=${e.Pm}\\times\\left(-\\dfrac{${e.D}}{\\pi}\\right)${cos("t")}`, [t("on divise par "), f(`\\omega=\\dfrac{\\pi}{${e.D}}`)]), ligne(`=-${amp}${cos("t")}`)],
      verif: [ligne(`F'(t)=${amp}\\times\\dfrac{\\pi}{${e.D}}${sin}`, "on dérive"), ligne(`=P(t)`, "✓")],
    },
    quantite: [
      ligne(`E=F(${e.t2})-F(${e.t1})`, "théorème fondamental"),
      ligne(`=-${amp}${cos(e.t2)}+${amp}${cos(e.t1)}`),
      ligne(`=${amp}\\left(${cos(e.t1)}-${cos(e.t2)}\\right)`, "on met en évidence"),
      ligne(`\\approx ${dl(Math.round(m.quantite))}${WH}`, "calculatrice en radians"),
    ],
    transfert: {
      utilise: [t("L'énergie produite depuis le lever du soleil jusqu'à l'heure t vaut "), f(`\\int_{${e.lever}}^{t} P(u)\\,du`), t(` ; on égale à l'énergie de la batterie et on isole t (arccos donne un angle de [0 ; π]) ${COURS_PROBLEMES}.`)],
      lignes: [
        ligne(`\\int_{${e.lever}}^{t} P(u)\\,du=${dl(e.Ebatterie)}`, "la batterie est pleine"),
        ligne(`${amp}\\left(1-${cos("t")}\\right)=${dl(e.Ebatterie)}`, [t("F(t) − F(" + e.lever + "), avec "), f("\\cos 0=1")]),
        ligne(`${cos("t")}=${quotient}`, "on isole le cosinus"),
        ligne(`${angle("t")}=\\arccos\\left(${quotient}\\right)`, "angle compris entre 0 et π"),
        ligne(`t=${e.lever}+\\dfrac{${e.D}}{\\pi}\\arccos\\left(${quotient}\\right)`, "on isole t"),
        ligne(`\\approx ${dl(m.transfert, 2)}`),
      ],
    },
    unite: {
      utilise: [t("Énergie de toute la journée : du lever au coucher du soleil ; puis "), f("1\\ \\text{kW}\\cdot\\text{h}=1000\\ \\text{W}\\cdot\\text{h}"), t(".")],
      lignes: [
        ligne(`E_{\\text{jour}}=${int(e.lever, fin, "P(t)")}`, `du lever (${e.lever} h) au coucher (${fin} h)`),
        ligne(`=F(${fin})-F(${e.lever})`),
        ligne(`=${amp}\\left(\\cos 0-\\cos\\pi\\right)`),
        ligne(`=\\dfrac{${dl(2 * e.Pm * e.D)}}{\\pi}${WH}`, [f("\\cos 0-\\cos\\pi=2")]),
        ligne(`\\approx ${dl((2 * e.Pm * e.D) / Math.PI, 0)}${WH}`),
        ligne(`${dl((2 * e.Pm * e.D) / Math.PI, 0)}${WH}\\approx ${dl(m.unite, 2)}${KWH}`, "on divise par 1000"),
      ],
    },
  };
}

function primitiveInstallation(i: InstallationSolaire): (x: number) => number {
  return (x) => i.k * (-(x ** 3) / 3 + ((i.debut + i.fin) / 2) * x * x - i.debut * i.fin * x);
}

function solaireComparer(e: ExerciceSolaireComparer): Contenu {
  const m = modeleNumerique(e);
  const EA = energieInstallation(e.A);
  const EB = energieInstallation(e.B);
  const FA = primitiveInstallation(e.A);
  const FB = primitiveInstallation(e.B);
  const lignesEnergie = (nom: "A" | "B", i: InstallationSolaire, F: (x: number) => number, En: number): LigneCalcul[] => [
    ligne(`E_${nom}=F_${nom}(${i.fin})-F_${nom}(${i.debut})`, "théorème fondamental"),
    ligne(`=${exact(F(i.fin))}-${par(exact(F(i.debut)))}`, `on remplace t par ${i.fin}, puis par ${i.debut}`),
    ligne(`=${dl(En)}`),
  ];
  return {
    modele: [ligne(`E_A=${int(e.A.debut, e.A.fin, "P_A(t)")}`, `énergie = intégrale de la puissance sur les heures de production de A (W × h = W·h)`)],
    primitive: {
      utilise: [t("On développe le produit, puis primitive terme à terme : "), f("\\int (-t^2+bt-c)\\,dt=-\\dfrac{t^3}{3}+\\dfrac{b}{2}t^2-ct+C"), t(` ${COURS_PRIMITIVES}.`)],
      lignes: [
        ligne(`P_A(t)=${e.A.k}(t-${e.A.debut})(${e.A.fin}-t)`, "donnée"),
        ligne(`=${e.A.k}\\left(-t^2+${e.A.debut + e.A.fin}t-${e.A.debut * e.A.fin}\\right)`, "on développe"),
        ligne(`F_A(t)=${primitivePolyLatex(e.A)}`, "primitive terme à terme (on prend C = 0)"),
      ],
      verif: [ligne(`F_A'(t)=${e.A.k}\\left(-t^2+${e.A.debut + e.A.fin}t-${e.A.debut * e.A.fin}\\right)`, "on dérive"), ligne(`=P_A(t)`, "✓")],
    },
    quantite: lignesEnergie("A", e.A, FA, EA),
    transfert: {
      utilise: [t("Même méthode pour B, sur ses propres heures de production : "), f(`F_B(t)=${primitivePolyLatex(e.B)}`), t(".")],
      lignes: [...lignesEnergie("B", e.B, FB, EB), ligne(`E_A-E_B=${dl(EA)}-${dl(EB)}`, "étape 3"), ligne(`=${dl(m.transfert)}${WH}`)],
      verif: { texte: [t("Contrôle par la formule "), f("\\int_a^b k(t-a)(b-t)\\,dt=\\dfrac{k(b-a)^3}{6}"), t(" :")], lignes: [ligne(`E_B=\\dfrac{${e.B.k}\\times ${e.B.fin - e.B.debut}^3}{6}`), ligne(`=${dl(EB)}`, "✓")] },
    },
    unite: {
      utilise: [t("Conversion : "), f("1\\ \\text{kW}\\cdot\\text{h}=1000\\ \\text{W}\\cdot\\text{h}"), t(".")],
      lignes: [ligne(`E_A-E_B=${dl(m.transfert)}${WH}`, "étape 4"), ligne(`=\\dfrac{${dl(m.transfert)}}{1000}${KWH}`, "on divise par 1000"), ligne(`=${dl(m.unite)}${KWH}`)],
    },
  };
}

function pluieSeuil(e: ExercicePluieSeuil): Contenu {
  const m = modeleNumerique(e);
  const q = exact(e.I0 / e.k);
  const ex = (x: string) => `e^{-${coef(e.k)}${x}}`;
  const frac = `1-\\dfrac{${e.Hcible}}{${q}}`;
  return {
    modele: [ligne(`H=${int(0, e.D, "i(t)")}`, `hauteur = intégrale de l'intensité pendant les ${e.D} h de l'averse (mm/h × h = mm)`)],
    primitive: {
      utilise: [t("Primitive d'une exponentielle : "), f("\\int e^{at}\\,dt=\\dfrac{1}{a}e^{at}+C"), t(", ici "), f(`a=-${dl(e.k)}`), t(` ${COURS_PRIMITIVES}.`)],
      lignes: [ligne(`F(t)=${e.I0}\\times\\left(-\\dfrac{1}{${dl(e.k)}}\\right)${ex("t")}`, [t("on divise par "), f(`-${dl(e.k)}`)]), ligne(`=-${q}${ex("t")}`)],
      verif: [ligne(`F'(t)=-${q}\\times(-${dl(e.k)})${ex("t")}`, "on dérive"), ligne(`=i(t)`, "✓")],
    },
    quantite: [
      ligne(`H=${crochet(`-${q}${ex("t")}`, 0, e.D)}`, "primitive de l'étape 2"),
      ligne(`=-${q}e^{-${dl(e.k * e.D)}}+${q}e^{0}`, `F(${e.D}) − F(0)`),
      ligne(`=${q}\\left(1-e^{-${dl(e.k * e.D)}}\\right)`, [t("on met en évidence, "), f("e^{0}=1")]),
      ligne(`\\approx ${dl(m.quantite, 2)}${MM}`),
    ],
    transfert: {
      utilise: [t("Hauteur tombée entre 0 et t : "), f(`${q}\\left(1-${ex("t")}\\right)`), t(` ; on l'égale à ${e.Hcible} mm, on isole l'exponentielle puis on prend le logarithme ${COURS_PROBLEMES}.`)],
      lignes: [
        ligne(`${q}\\left(1-${ex("t")}\\right)=${e.Hcible}`, `${e.Hcible} mm tombés`),
        ligne(`${ex("t")}=${frac}`, "on isole l'exponentielle"),
        ligne(`-${coef(e.k)}t=\\ln\\left(${frac}\\right)`, "on prend le logarithme"),
        ligne(`t=-${facteur(1 / e.k)}\\ln\\left(${frac}\\right)`, `on divise par −${nt(e.k)}`),
        ligne(`\\approx ${dl(m.transfert, 2)}`),
      ],
    },
    unite: {
      utilise: [t("Une hauteur de 1 mm sur 1 m² représente "), f("0{,}001\\ \\text{m}\\times 1\\ \\text{m}^2=0{,}001\\ \\text{m}^3=1\\ \\text{L}"), t(".")],
      lignes: [ligne(`V=H\\times ${e.aireToit}`, "volume en litres"), ligne(`=${q}\\left(1-e^{-${dl(e.k * e.D)}}\\right)\\times ${e.aireToit}`, "H de l'étape 3"), ligne(`\\approx ${dl(Math.round(m.unite))}${L}`)],
    },
  };
}

function pluieComparer(e: ExercicePluieComparer): Contenu {
  const m = modeleNumerique(e);
  const F = `${e.c}\\left(${facteur(e.D / 2)}t^2-\\dfrac{t^3}{3}\\right)`;
  const H2 = e.m * e.D2;
  return {
    modele: [ligne(`H_1=${int(0, e.D, "i(t)")}`, `hauteur = intégrale de l'intensité pendant les ${e.D} h de l'orage (mm/h × h = mm)`)],
    primitive: {
      utilise: [t("On développe, puis primitive terme à terme : "), f("\\int t^n\\,dt=\\dfrac{t^{n+1}}{n+1}+C"), t(` ${COURS_PRIMITIVES}.`)],
      lignes: [
        ligne(`i(t)=${e.c}t(${e.D}-t)`, "donnée"),
        ligne(`=${e.c * e.D}t-${coef(e.c)}t^2`, "on développe"),
        ligne(`F(t)=${e.c * e.D}\\times\\dfrac{t^2}{2}-${e.c}\\times\\dfrac{t^3}{3}`, "primitive terme à terme (on prend C = 0)"),
        ligne(`=${F}`, "on met en évidence"),
      ],
      verif: [ligne(`F'(t)=${e.c}\\left(${dl(e.D)}t-t^2\\right)`, "on dérive"), ligne(`=i(t)`, "✓")],
    },
    quantite: [
      ligne(`H_1=${crochet(F, 0, e.D)}`, "primitive de l'étape 2"),
      ligne(`=${e.c}\\left(${facteur(e.D / 2)}\\times ${e.D}^2-\\dfrac{${e.D}^3}{3}\\right)`, `F(${e.D}) − F(0), avec F(0) = 0`),
      ligne(`=\\dfrac{${e.c}\\times ${e.D}^3}{6}`, "on réduit au même dénominateur"),
      ligne(`=${dl(m.quantite)}${MM}`),
    ],
    transfert: {
      utilise: [t("Une intensité constante s'intègre en un rectangle : "), f("\\int_0^{d} m\\,dt=m\\times d"), t(".")],
      lignes: [
        ligne(`H_2=${int(0, e.D2, dl(e.m))}`, "pluie fine"),
        ligne(`=${dl(e.m)}\\times ${e.D2}`, "intensité constante"),
        ligne(`=${dl(H2)}`),
        ligne(`H_1-H_2=${dl(m.quantite)}-${dl(H2)}`, "étape 3"),
        ligne(`=${dl(m.transfert)}${MM}`),
      ],
    },
    unite: {
      utilise: [t("Une hauteur de 1 mm sur 1 m² représente "), f("0{,}001\\ \\text{m}\\times 1\\ \\text{m}^2=0{,}001\\ \\text{m}^3=1\\ \\text{L}"), t(".")],
      lignes: [ligne(`V=H_1\\times ${e.aireToit}`, "volume en litres"), ligne(`=${dl(m.quantite)}\\times ${e.aireToit}`), ligne(`=${dl(m.unite)}${L}`)],
    },
  };
}

function co2(e: ExerciceCo2): Contenu {
  const m = modeleNumerique(e);
  const q = exact(e.r0 / e.k);
  const k = dl(e.k);
  const B = dl(e.budget - e.Q0);
  const arg = `1+\\dfrac{${k}\\times ${B}}{${e.r0}}`;
  return {
    modele: [
      ligne(`Q(${e.T})=Q(0)+${int(0, e.T, "r(t)")}`, `déjà émis depuis ${e.anneeReference} + émissions des ${e.T} années (t en années depuis ${e.annee0})`),
      ligne(`=${e.Q0}+${int(0, e.T, "r(t)")}`, [t("car "), f(`Q(0)=${e.Q0}`)]),
    ],
    primitive: {
      utilise: [t("Primitive d'une exponentielle : "), f("\\int e^{kt}\\,dt=\\dfrac{1}{k}e^{kt}+C"), t(` ${COURS_PRIMITIVES}.`)],
      lignes: [ligne(`F(t)=${e.r0}\\times\\dfrac{1}{${k}}\\,e^{${k}t}`, [t("on divise par "), f(`k=${k}`)]), ligne(`=${q}e^{${k}t}`)],
      verif: [ligne(`F'(t)=${q}\\times ${k}\\,e^{${k}t}`, "on dérive"), ligne(`=r(t)`, "✓")],
    },
    quantite: [
      ligne(`Q(${e.T})=${e.Q0}+${crochet(`${q}e^{${k}t}`, 0, e.T)}`, "primitive de l'étape 2"),
      ligne(`=${e.Q0}+${q}e^{${dl(e.k * e.T)}}-${q}e^{0}`, `F(${e.T}) − F(0)`),
      ligne(`=${e.Q0}+${q}\\left(e^{${dl(e.k * e.T)}}-1\\right)`, [t("on met en évidence, "), f("e^{0}=1")]),
      ligne(`\\approx ${dl(Math.round(m.quantite))}${KT}`),
    ],
    transfert: {
      utilise: [t("Le budget est épuisé quand "), f("Q(t)=B"), t(` ; on isole l'exponentielle puis on prend le logarithme ${COURS_PROBLEMES}.`)],
      lignes: [
        ligne(`${e.Q0}+${q}\\left(e^{${k}t}-1\\right)=${dl(e.budget)}`, "Q(t) = B"),
        ligne(`${q}\\left(e^{${k}t}-1\\right)=${B}`, `on retire ${e.Q0} des deux membres`),
        ligne(`e^{${k}t}-1=\\dfrac{${k}\\times ${B}}{${e.r0}}`, [t("on multiplie par "), f(`\\dfrac{${k}}{${e.r0}}`), t(", l'inverse de "), f(q)]),
        ligne(`e^{${k}t}=${arg}`, "on ajoute 1"),
        ligne(`${k}t=\\ln\\left(${arg}\\right)`, "on prend le logarithme"),
        ligne(`t=${facteur(1 / e.k)}\\ln\\left(${arg}\\right)`, `on divise par ${nt(e.k)}`),
        ligne(`\\approx ${dl(m.transfert, 2)}`),
      ],
    },
    unite: {
      utilise: [t("Conversion : "), f("1\\ \\text{Mt}=1000\\ \\text{kt}"), t(".")],
      lignes: [ligne(`Q(${e.T})\\approx ${dl(Math.round(m.quantite))}${KT}`, "étape 3"), ligne(`\\approx\\dfrac{${dl(Math.round(m.quantite))}}{1000}\\ \\text{Mt}`, "on divise par 1000"), ligne(`\\approx ${dl(m.unite, 2)}\\ \\text{Mt}`)],
    },
  };
}

function contenu(e: E): Contenu {
  switch (e.variante) {
    case "cuve-max":
    case "cuve-vide":
      return cuve(e);
    case "salle-pleine":
      return salle(e);
    case "solaire-seuil":
      return solaireSeuil(e);
    case "solaire-comparer":
      return solaireComparer(e);
    case "pluie-seuil":
      return pluieSeuil(e);
    case "pluie-comparer":
      return pluieComparer(e);
    case "co2-seuil":
      return co2(e);
  }
}

export function correctionDetailleeAccumulerGrandeur(e: E): EtapeCorrection[] {
  const fi = fiche(e);
  const c = contenu(e);
  const p = (phase: PhaseAccumulerGrandeur) => (fi.pieges[phase] ? [piege(LETTRES[phase], [t(fi.pieges[phase]!)])] : []);
  return PHASES_ACCUMULER_GRANDEUR.flatMap((phase): EtapeCorrection[] => {
    const sq = LETTRES[phase];
    switch (phase) {
      case "modele":
        return [utilise(sq, aide(e, phase, COURS_PROBLEMES)), calcul(sq, c.modele), resultat(sq, [f(fi.options[0]!)]), ...p(phase)];
      case "primitive":
        return [utilise(sq, c.primitive.utilise), calcul(sq, c.primitive.lignes), resultat(sq, reponse(e, phase)), verification(sq, [t("On dérive la primitive trouvée :")], c.primitive.verif), ...p(phase)];
      case "quantite":
        return [
          utilise(sq, [...aide(e, phase), t(` L'aire hachurée du graphique représente ${legendeAire(e)}.`)]),
          calcul(sq, c.quantite),
          { ...resultat(sq, reponse(e, phase)), figureHtml: figureAccumulerGrandeurSvg(e, true) },
          ...p(phase),
        ];
      case "transfert":
        return [
          utilise(sq, c.transfert.utilise),
          calcul(sq, c.transfert.lignes),
          resultat(sq, reponse(e, phase)),
          ...(c.transfert.verif ? [verification(sq, c.transfert.verif.texte, c.transfert.verif.lignes.length ? c.transfert.verif.lignes : undefined)] : []),
          ...p(phase),
        ];
      case "unite":
        return [utilise(sq, c.unite.utilise), calcul(sq, c.unite.lignes), resultat(sq, reponse(e, phase)), ...p(phase)];
    }
  });
}

