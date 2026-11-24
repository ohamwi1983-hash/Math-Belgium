import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceExtremaBornes } from "../../core5e/extremaBornes.types";
import { ORDRE_ECRANS_EXTREMA_BORNES, type EcranExtremaBornes } from "../../moteur5e/typesExtremaBornes";
import { formatReponseAttenduePhaseLatex } from "../../ui5e/formatExtremaBornes";
import { construireSvgTableauVariations } from "../../export5e/svgTableauVariations";
import {
  COURS_BORNE,
  COURS_SIGNE,
  f,
  finaliserDerivees,
  lignesDeriveePoly,
  lignesTrinome,
  lignesValeurPoly,
  listeEt,
  nbT,
  nombreExactL,
  nombreExactQ,
  parN,
  polyV,
  q,
  qL,
  qMul,
  qVal,
  signeRel,
  t,
  valeurTest,
  type Q,
} from "../../ui5e/corrigeDerivees2";
import { derivativeCoeffs, evalPoly } from "./index";

/**
 * Corrigé détaillé « comme au tableau » de 5gen34 (extrema en contexte borné) — règle
 * `.claude/rules/feuilles-evaluations.md`. Six étapes = six écrans (`ORDRE_ECRANS_EXTREMA_BORNES`) :
 * dérivée terme à terme ; f′(t) = 0 (divisée par 3a puis discriminant, ou — degré 4 — coefficient
 * mis en évidence, racine entière vérifiée, Horner coefficient par coefficient, discriminant), f′
 * écrite en facteurs ; signe de f′ par une valeur test dans chaque intervalle de [0 ; T] (forme
 * factorisée substituée), tableau de variations en figure ; valeurs de f aux extremums et aux
 * bornes (substitution, termes, somme) ; comparaison de TOUS les candidats rangés. SANS `docx` :
 * importé par l'adaptateur ET par `App5gen34.tsx`.
 */

const LETTRES = "abcdef";

export function lettreEcranExtremaBornes(ecran: EcranExtremaBornes): string {
  return LETTRES[ORDRE_ECRANS_EXTREMA_BORNES.indexOf(ecran)] ?? "a";
}

interface Candidat {
  t: number;
  valeur: number;
  origine: "extremum" | "borne";
  classification: "max" | "min" | null;
}

export function candidatsExtremaBornes(e: ExerciceExtremaBornes): Candidat[] {
  return [
    { t: 0, valeur: evalPoly(e.coeffs, 0), origine: "borne", classification: null },
    ...e.racinesFPrime.map((r, i): Candidat => ({ t: r, valeur: evalPoly(e.coeffs, r), origine: "extremum", classification: e.classificationFPrime[i] })),
    { t: e.T, valeur: evalPoly(e.coeffs, e.T), origine: "borne", classification: null },
  ];
}

export function candidatExtremeBornes(e: ExerciceExtremaBornes, sens: "max" | "min"): Candidat {
  return candidatsExtremaBornes(e).reduce((m, c) => ((sens === "max" ? c.valeur > m.valeur : c.valeur < m.valeur) ? c : m));
}

function reponse(e: ExerciceExtremaBornes, ecran: EcranExtremaBornes): string[] {
  return formatReponseAttenduePhaseLatex(e, ecran, candidatExtremeBornes(e, "max"), candidatExtremeBornes(e, "min"));
}

const intervalle = (e: ExerciceExtremaBornes) => `[0\\,;\\,${e.T}]`;

/** Coefficient dominant de f′ et forme factorisée « 6(t-1)(t-4) ». */
function factorisee(e: ExerciceExtremaBornes): { k: number; latex: string } {
  const d = derivativeCoeffs(e.coeffs);
  const k = d[d.length - 1];
  const prefixe = k === 1 ? "" : k === -1 ? "-" : `${k}`;
  return { k, latex: `${prefixe}${e.racinesFPrime.map((r) => `(t-${r})`).join("")}` };
}

/** Signes de f′ sur les intervalles de [0 ; T] délimités par les racines (déduits de la nature). */
function signes(e: ExerciceExtremaBornes): ("+" | "−")[] {
  const premier = e.classificationFPrime[0] === "max" ? "+" : "−";
  return Array.from({ length: e.racinesFPrime.length + 1 }, (_, i) => ((i % 2 === 0) === (premier === "+") ? "+" : "−"));
}

export function figureTableauExtremaBornes(e: ExerciceExtremaBornes): string {
  const abscisses = [0, ...e.racinesFPrime, e.T];
  const valeurs = abscisses.map((x) => evalPoly(e.coeffs, x));
  const u = (v: number) => (v < 0 ? `−${Math.abs(v)}` : `${v}`);
  return construireSvgTableauVariations(
    {
      variable: "t",
      libelleDerivee: "f′(t)",
      libelleFonction: "f(t)",
      abscisses: abscisses.map(u),
      zeros: abscisses.map((_, i) => i > 0 && i < abscisses.length - 1),
      signes: signes(e),
      valeurs: valeurs.map(u),
    },
    valeurs,
  );
}

// ============================================================================
// Étapes.
// ============================================================================

function etapeDeriver(e: ExerciceExtremaBornes, l: string): EtapeCorrection[] {
  return [
    utilise(l, [t("On dérive le polynôme terme à terme : "), f("(a\\,t^{n})'=n\\,a\\,t^{n-1}"), t(", la constante a pour dérivée 0 "), t(COURS_BORNE), t(".")]),
    calcul(l, [ligne(`f(t)=${polyV(e.coeffs, "t")}`, "énoncé"), ...lignesDeriveePoly("f'(t)", e.coeffs, "t", [t("terme à terme : "), f("(a\\,t^{n})'=n\\,a\\,t^{n-1}")])]),
    resultat(l, [f(reponse(e, "deriver")[0]), t(".")]),
  ];
}

function etapeRacines(e: ExerciceExtremaBornes, l: string): EtapeCorrection[] {
  const d = derivativeCoeffs(e.coeffs);
  const k = d[d.length - 1];
  const unitaire = d.map((c) => c / k);
  const lignes: LigneCalcul[] = [ligne(`${polyV(d, "t")}=0`, [f("f'(t)=0")])];
  const blocs: EtapeCorrection[] = [];
  let racinesTrouvees: string[] = [];
  if (d.length === 3) {
    if (k !== 1) lignes.push(ligne(`${polyV(unitaire, "t")}=0`, `on divise les deux membres par ${nbT(k)}`));
    const sol = lignesTrinome(1, unitaire[1], unitaire[0], "t");
    lignes.push(...sol.lignes);
    racinesTrouvees = sol.racines.map((r) => qL((r as { v: Q }).v));
    blocs.push(calcul(l, lignes));
  } else {
    // Degré 3 : K(t³ − St² + Pt − Π) ; racine entière r₁ ; Horner ; trinôme.
    lignes.push(ligne(`${k === 1 ? "" : k === -1 ? "-" : k}(${polyV(unitaire, "t")})=0`, [t("on met "), f(`${k}`), t(" en évidence")]));
    lignes.push(ligne(`${polyV(unitaire, "t")}=0`, `on divise les deux membres par ${nbT(k)}`));
    blocs.push(calcul(l, lignes));
    const r1 = e.racinesFPrime[0];
    const v = lignesValeurPoly(`g(${r1})`, unitaire, r1, `on remplace t par ${r1}`, "t");
    blocs.push(calcul(l, v.lignes, [t("On note "), f(`g(t)=${polyV(unitaire, "t")}`), t(` et on essaie les diviseurs entiers du terme constant ${nbT(unitaire[0])} :`)], "Racine entière"));
    const S = unitaire[2];
    const P = unitaire[1];
    const C0 = unitaire[0];
    const a1 = r1 + S;
    const a0 = r1 * a1 + P;
    const reste = r1 * a0 + C0;
    const horner: LigneCalcul[] = [
      ligne(`q_2=1`, [t("coefficient de "), f("t^{3}"), t(" recopié")]),
      ligne(`q_1=${r1}\\cdot 1${S < 0 ? S : `+${S}`}`, [t("on multiplie par "), f(`${r1}`), t(", on ajoute le coefficient de "), f("t^{2}")]),
      ligne(`=${a1}`),
      ligne(`q_0=${r1}\\cdot ${parN(a1)}${P < 0 ? P : `+${P}`}`, [t("on ajoute le coefficient de "), f("t")]),
      ligne(`=${a0}`),
      ligne(`R=${r1}\\cdot ${parN(a0)}${C0 < 0 ? C0 : `+${C0}`}`, "on ajoute le terme constant"),
      ligne(`=${reste}`, "reste nul"),
      ligne(`g(t)=(t-${r1})(${polyV([a0, a1, 1], "t")})`, [t("quotient "), f("q_2t^{2}+q_1t+q_0")]),
    ];
    blocs.push(calcul(l, horner, [t("Division de g(t) par "), f(`t-${r1}`), t(" (Horner) :")], "Horner"));
    const sol = lignesTrinome(1, a1, a0, "t");
    blocs.push(calcul(l, [ligne(`${polyV([a0, a1, 1], "t")}=0`, "second facteur nul"), ...sol.lignes], [], "Trinôme"));
    racinesTrouvees = [`${r1}`, ...sol.racines.map((r) => qL((r as { v: Q }).v))];
  }
  const fact = factorisee(e);
  return [
    utilise(
      l,
      d.length === 3
        ? [t("f′(t) est du second degré : on le rend unitaire, puis on calcule son discriminant et ses racines "), t(COURS_BORNE), t(".")]
        : [t("f′(t) est du troisième degré : on met le coefficient de "), f("t^{3}"), t(" en évidence, on cherche une racine entière parmi les diviseurs du terme constant, on factorise par Horner, puis on résout le second degré "), t(COURS_BORNE), t(".")],
    ),
    ...blocs,
    resultat(l, [f(reponse(e, "racines")[0]), t(` : ${racinesTrouvees.length === 2 ? "les deux solutions sont" : "les trois solutions sont"} dans `), f(intervalle(e)), t(", donc "), f(`f'(t)=${fact.latex}`), t(".")]),
    verification(l, [t("Somme des racines : "), f(`${e.racinesFPrime.join("+")}=${e.racinesFPrime.reduce((s, r) => s + r, 0)}`), t(", l'opposé du coefficient de "), f(d.length === 3 ? "t" : "t^{2}"), t(" de l'équation unitaire.")]),
  ];
}

function etapeTableau(e: ExerciceExtremaBornes, l: string): EtapeCorrection[] {
  const fact = factorisee(e);
  const bornes = [0, ...e.racinesFPrime, e.T];
  const sg = signes(e);
  const lignes: LigneCalcul[] = [];
  for (let i = 0; i < bornes.length - 1; i++) {
    const x = valeurTest(bornes[i], bornes[i + 1]);
    const xq = nombreExactQ(x);
    const xl = nombreExactL(x);
    const xi = xq.d === 1 ? xl : xl.replace("\\dfrac", "\\frac");
    const facteurs = e.racinesFPrime.map((r) => `(${xi}-${r})`).join("");
    const val: Q = e.racinesFPrime.reduce((p, r) => qMul(p, q(xq.n - r * xq.d, xq.d)), q(fact.k));
    const prefixe = fact.k === 1 ? "" : fact.k === -1 ? "-" : `${fact.k}\\cdot `;
    const sens = sg[i] === "+" ? "f croissante" : "f décroissante";
    lignes.push(ligne(`f'(${xi})=${prefixe}${facteurs}`, [t("sur "), f(`]${bornes[i]}\\,;\\,${bornes[i + 1]}[`), t(" : on prend "), f(`t=${xi}`)]));
    lignes.push(ligne(`=${qL(val)}${signeRel(qVal(val))}`, [t(`signe ${sg[i] === "+" ? "+" : "−"} : ${sens} sur `), f(`[${bornes[i]}\\,;\\,${bornes[i + 1]}]`)]));
  }
  const natures = e.racinesFPrime.map((r, i) => [f(`t=${r}`), t(e.classificationFPrime[i] === "max" ? " : maximum local (f′ passe de + à −)" : " : minimum local (f′ passe de − à +)")]);
  return [
    utilise(l, [t("Le signe de f′ donne les variations de f (f′ > 0 : f croissante ; f′ < 0 : f décroissante) ; f′ ne change de signe qu'en ses racines : une valeur test par intervalle suffit "), t(COURS_SIGNE), t(".")]),
    calcul(l, lignes, [t("Avec "), f(`f'(t)=${fact.latex}`), t(" (étape 2) :")]),
    { ...resultat(l, [...listeEt(natures), t(".")]), figureHtml: figureTableauExtremaBornes(e) },
  ];
}

function etapeValeursExtremums(e: ExerciceExtremaBornes, l: string): EtapeCorrection[] {
  const blocs = e.racinesFPrime.map((r) => calcul(l, lignesValeurPoly(`f(${r})`, e.coeffs, r, `on remplace t par ${r} dans f(t)`, "t").lignes, [], `En t = ${r}`));
  return [
    utilise(l, [t("On remplace t par l'abscisse de chaque extremum local dans f(t) (et non dans f′(t)) "), t(COURS_BORNE), t(".")]),
    ...blocs,
    resultat(l, [...listeEt(reponse(e, "valeursExtremums").map((x) => [f(x)])), t(".")]),
    piege(l, [t("La dérivée donne la pente, pas la valeur de la grandeur : on calcule f(t), pas f′(t).")]),
  ];
}

function etapeValeursBornes(e: ExerciceExtremaBornes, l: string): EtapeCorrection[] {
  const vT = lignesValeurPoly(`f(${e.T})`, e.coeffs, e.T, `on remplace t par ${e.T} dans f(t)`, "t");
  return [
    utilise(l, [t("Les bornes 0 et "), f(`${e.T}`), t(" de l'intervalle sont aussi candidates au maximum et au minimum absolus : on y calcule f "), t(COURS_BORNE), t(".")]),
    calcul(l, [ligne(`f(0)=${e.coeffs[0]}`, "tous les termes en t s'annulent : il reste le terme constant")], [], "En t = 0"),
    calcul(l, vT.lignes, [], `En t = ${e.T}`),
    resultat(l, reponse(e, "valeursBornes").flatMap((x, i) => [...(i ? [t(" et ")] : []), f(x)]).concat([t(".")])),
  ];
}

function etapeComparaison(e: ExerciceExtremaBornes, l: string): EtapeCorrection[] {
  const tous = candidatsExtremaBornes(e);
  const tries = [...tous].sort((a, b) => b.valeur - a.valeur);
  const max = candidatExtremeBornes(e, "max");
  const min = candidatExtremeBornes(e, "min");
  const role = (c: Candidat) => (c.origine === "borne" ? `borne t = ${c.t}` : c.classification === "max" ? "maximum local" : "minimum local");
  const lignes: LigneCalcul[] = tous.map((c) => ligne(`f(${c.t})=${c.valeur}`, `${role(c)}${c === max ? " : la plus grande valeur" : c === min ? " : la plus petite valeur" : ""}`));
  lignes.push(ligne(tries.map((c) => `${c.valeur}`).join(">"), "on range toutes les valeurs"));
  const borne = [max, min].filter((c) => c.origine === "borne");
  return [
    utilise(l, [t("Sur un intervalle fermé "), f(intervalle(e)), t(", le maximum et le minimum absolus sont parmi les extremums locaux ET les valeurs aux bornes : on compare toutes ces valeurs "), t(COURS_BORNE), t(".")]),
    calcul(l, lignes),
    resultat(l, [f(reponse(e, "comparaison")[0]), t(" et "), f(reponse(e, "comparaison")[1]), t(".")]),
    piege(
      l,
      borne.length > 0
        ? [t("S'arrêter aux extremums locaux : ici, "), ...borne.flatMap((c, i) => [...(i ? [t(" et ")] : []), t(c === max ? "le maximum absolu" : "le minimum absolu"), t(" est atteint à la borne "), f(`t=${c.t}`)]), t(", pas à un extremum local.")]
        : [t("Oublier les bornes : ici, les deux extremums absolus sont des extremums locaux, mais il fallait comparer aussi "), f("f(0)"), t(" et "), f(`f(${e.T})`), t(" pour le savoir.")],
    ),
  ];
}

export function correctionDetailleeExtremaBornes(e: ExerciceExtremaBornes): EtapeCorrection[] {
  const l = lettreEcranExtremaBornes;
  return finaliserDerivees([
    ...etapeDeriver(e, l("deriver")),
    ...etapeRacines(e, l("racines")),
    ...etapeTableau(e, l("tableauFPrime")),
    ...etapeValeursExtremums(e, l("valeursExtremums")),
    ...etapeValeursBornes(e, l("valeursBornes")),
    ...etapeComparaison(e, l("comparaison")),
  ]);
}

/** Écran « comparaison » : choisir parmi des valeurs déjà calculées (décision, aucune transformation). */
export const LETTRES_LECTURE_EXTREMA_BORNES = [lettreEcranExtremaBornes("comparaison")];
