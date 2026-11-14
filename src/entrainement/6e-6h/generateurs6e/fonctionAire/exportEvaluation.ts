import type { ExerciceFonctionAire } from "../../core6e/fonctionAire.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ValeurExacte } from "../../moteur6e/modeleFonctionAire";
import {
  aireExacte,
  bornesDomaine,
  candidatsExtremums,
  changementsSensF,
  evaluerF,
  extremumsA,
  integraleExacte,
  intervallesSens,
  natureEn,
  pointsTableau,
  signeEntre,
  zerosChangementSigne,
  zerosInterieurs,
} from "../../moteur6e/modeleFonctionAire";
import { phasesPourExercice } from "../../moteur6e/typesFonctionAire";
import type { PhaseFonctionAire } from "../../moteur6e/typesFonctionAire";
import { abscissesValeursA, intervallesAires, pentesAttendues, valeursExactesAttendues } from "../../moteur6e/verificationFonctionAire";
import { figureCandidat, figureCorrigeExercice, figureFonctionF } from "../../ui6e/figureFonctionAire";
import {
  aLatex,
  consigneGenerale,
  equationTangenteLatex,
  integraleLatex,
  intervalleLatex,
  libelleNature,
  nombreLatex,
  reponseAttendue,
  valeurLatex,
} from "../../ui6e/formatFonctionAire";
import { profilFonctionAire } from "./profil";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceFonctionAire } from "./index";
import type { IdVarianteFonctionAire } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceFonctionAire>` de `6gen78` « La fonction aire » —
 * méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la courbe de f sur quadrillage (`enteteHtml` ; variante `graphique` : plus les
 *   4 graphiques candidats numérotés 1 à 4), la définition de A et UNE consigne globale. Les écrans
 *   du générateur deviennent les étapes du corrigé (« Étape n — … »), lettres a, b.
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`valeursExactesAttendues`,
 *   `reponseAttendue`, `tableauVariationsLatex`), une ligne « Piège » par étape, et la figure du
 *   corrigé (aires signées utilisées + courbe de A) sous la conclusion de la dernière étape.
 */

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcdefgh";

function lettre(e: ExerciceFonctionAire, phase: PhaseFonctionAire): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)];
}

function listeEt(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(i === formules.length - 1 ? " et " : ", "), f(x)]));
}

function intervalleOuvertLatex(u: number, v: number): string {
  return `\\mathopen{]}${nombreLatex(u)}\\,;\\,${nombreLatex(v)}\\mathclose{[}`;
}

/** Terme d'une somme : les négatifs entre parenthèses. */
function terme(v: ValeurExacte): string {
  const s = valeurLatex(v);
  return s.startsWith("-") ? `\\left(${s}\\right)` : s;
}

/** ∫ᵤᵛ découpée aux zéros de f (u < v) : morceaux de signe constant. */
function decoupe(e: ExerciceFonctionAire, u: number, v: number): { de: number; a: number; valeur: ValeurExacte }[] {
  const coupes = [...new Set([u, v, ...zerosChangementSigne(e).filter((z) => z > u && z < v)])].sort((p, q) => p - q);
  return coupes.slice(1).map((c, i) => ({ de: coupes[i], a: c, valeur: integraleExacte(e, coupes[i], c) }));
}

/** « ∫ᵤᵛ f = (morceaux) = valeur » (u < v). */
function calculIntervalle(e: ExerciceFonctionAire, u: number, v: number): string {
  const morceaux = decoupe(e, u, v);
  const total = integraleExacte(e, u, v);
  if (morceaux.length === 1) return `${integraleLatex(u, v)}=${valeurLatex(total)}`;
  return `${integraleLatex(u, v)}=${morceaux.map((m) => integraleLatex(m.de, m.a)).join("+")}=${morceaux.map((m) => terme(m.valeur)).join("+")}=${valeurLatex(total)}`;
}

/** Chaîne de calcul de A(x), par additivité depuis a (bornes inversées si x < a). */
function chaineA(e: ExerciceFonctionAire, x: number): string {
  const v = aireExacte(e, x);
  if (x === e.a) return `${aLatex(x)}=${integraleLatex(e.a, e.a)}=0`;
  if (x > e.a) {
    const morceaux = decoupe(e, e.a, x);
    if (morceaux.length === 1) return `${aLatex(x)}=${integraleLatex(e.a, x)}=${valeurLatex(v)}`;
    return `${aLatex(x)}=${morceaux.map((m) => terme(m.valeur)).join("+")}=${valeurLatex(v)}`;
  }
  const inverse = integraleExacte(e, x, e.a);
  if (inverse.demi === 0 && inverse.quartPi === 0) return `${aLatex(x)}=-${integraleLatex(x, e.a)}=0`;
  // −(positif) s'écrit directement ; −(négatif) demande une étape « −(−2) = 2 ».
  if (!valeurLatex(inverse).startsWith("-")) return `${aLatex(x)}=-${integraleLatex(x, e.a)}=${valeurLatex(v)}`;
  return `${aLatex(x)}=-${integraleLatex(x, e.a)}=-${terme(inverse)}=${valeurLatex(v)}`;
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function consignePapier(e: ExerciceFonctionAire): FragmentConsigne[] {
  const { x0, xn } = bornesDomaine(e);
  switch (e.variante) {
    case "valeurs":
      return [t(" Donne "), f(aLatex(e.a)), t(", puis calcule "), ...listeEt(e.points.map(aLatex)), t(" (valeurs exactes), en justifiant par des aires signées.")];
    case "variations":
      return [t(" Dresse le tableau de variations de A sur "), f(intervalleLatex(x0, xn)), t(", valeurs exactes de A comprises, en justifiant le sens de variation.")];
    case "extremums":
      return [t(" Détermine les extremums locaux de A sur "), f(intervalleOuvertLatex(x0, xn)), t(" : abscisse, nature et valeur exacte. Justifie.")];
    case "pente":
      return [
        t(" Donne la pente de la tangente à la courbe de A aux points d'abscisses "),
        f(nombreLatex(e.points[0])),
        t(" et "),
        f(nombreLatex(e.points[1])),
        t(", puis une équation de la tangente à la courbe de A au point d'abscisse "),
        f(nombreLatex(e.points[0])),
        t(" (valeurs exactes)."),
      ];
    case "graphique":
      return [t(" Parmi les graphiques 1 à 4, lequel représente la fonction aire A ? Justifie ton choix en éliminant les trois autres.")];
  }
}

function entetePapier(e: ExerciceFonctionAire): FragmentConsigne[] {
  return [...consigneGenerale(e), ...consignePapier(e)];
}

function figureEnonce(e: ExerciceFonctionAire): string {
  const fig = figureFonctionF(e);
  if (e.variante !== "graphique") return fig;
  const candidats = e.ordre.map((indice, i) => figureCandidat(e, indice, i + 1, 240)).join("");
  return `<div style="text-align:center">${fig}</div><div class="grille-graphes-cyclo">${candidats}</div>`;
}

/** Titres d'étapes du corrigé (« Étape n — … »), rédigés pour le papier. */
function titreEtape(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] {
  switch (phase) {
    case "aires":
      return [t("Calcule "), ...listeEt(intervallesAires(e).map(([u, v]) => integraleLatex(u, v))), t(" à l'aide d'aires signées.")];
    case "valeursA":
      return [t("Déduis-en "), ...listeEt(abscissesValeursA(e).map(aLatex)), t(".")];
    case "sens":
      return [t("Sur chacun des intervalles "), ...listeEt(intervallesSens(e).map((i) => intervalleLatex(i.de, i.a))), t(", dis si A est croissante ou décroissante.")];
    case "tableau":
      return [t("Complète le tableau de variations par les valeurs de A.")];
    case "nature":
      return [t("En chacune des abscisses "), ...listeEt(candidatsExtremums(e).map((x) => `x=${nombreLatex(x)}`)), t(", dis si A admet un maximum local, un minimum local ou aucun extremum.")];
    case "valeursExt":
      return [t("Calcule la valeur de chaque extremum local de A.")];
    case "pentes":
      return [t("Donne "), f(`A'(${nombreLatex(e.points[0])})`), t(" et "), f(`A'(${nombreLatex(e.points[1])})`), t(".")];
    case "tangente":
      return [t("Calcule "), f(aLatex(e.points[0])), t(", puis une équation de la tangente au point d'abscisse "), f(nombreLatex(e.points[0])), t(".")];
    case "choixGraphique":
      return [t("Identifie le graphique de A et élimine les trois autres.")];
  }
}

function construireEnonce(e: ExerciceFonctionAire): SectionExercice {
  return { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: titreEtape(e, phase) })) };
}

function construireCorrection(e: ExerciceFonctionAire): BlocCorrection[] {
  const blocs: BlocCorrection[] = phasesPourExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...reponseAttendue(e, phase)] }));
  blocs.push({ type: "html", html: figureCorrigeExercice(e) });
  return blocs;
}

function reponseBreve(e: ExerciceFonctionAire): FragmentConsigne[] {
  switch (e.variante) {
    case "valeurs":
      return [...reponseAttendue(e, "valeursA"), t(".")];
    case "variations":
      return reponseAttendue(e, "tableau");
    case "extremums":
      return extremumsA(e).flatMap((m, i) => [...(i > 0 ? [t(" ; ")] : []), t(`${libelleNature(m.nature)} en `), f(`x=${nombreLatex(m.x)}`), t(", "), f(`${aLatex(m.x)}=${valeurLatex(aireExacte(e, m.x))}`)]);
    case "pente":
      return [...reponseAttendue(e, "pentes"), t(" ; "), f(equationTangenteLatex(e)), t(".")];
    case "graphique":
      return [t(`Le graphique ${e.ordre.indexOf(0) + 1}.`)];
  }
}

function enoncePapier(e: ExerciceFonctionAire): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), enteteHtml: figureEnonce(e), questions: [] }, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

/** Un intervalle où f est positive et décroissante (ou négative et croissante) : le piège. */
function intervallePiegeSens(e: ExerciceFonctionAire): { de: number; a: number; positive: boolean } | null {
  for (const i of intervallesSens(e)) {
    const s = signeEntre(e, i.de, i.a);
    const pente = evaluerF(e, i.a) - evaluerF(e, i.de);
    if (s > 0 && pente < 0) return { de: i.de, a: i.a, positive: true };
    if (s < 0 && pente > 0) return { de: i.de, a: i.a, positive: false };
  }
  return null;
}

function piege(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] {
  switch (phase) {
    case "aires":
      return [t("Compter positivement une aire située sous l'axe : l'intégrale est une aire SIGNÉE, les morceaux de part et d'autre d'un zéro de f se compensent.")];
    case "valeursA":
      if (e.points.some((p) => p < e.a)) return [t("Pour x < a, oublier le signe moins : "), f("\\int_a^x f(t)\\,dt=-\\int_x^a f(t)\\,dt"), t(". Et ne pas oublier que "), f(`${aLatex(e.a)}=0`), t(".")];
      return [t("Oublier que la fonction aire s'annule en a, "), f(`${aLatex(e.a)}=0`), t(", ou recommencer chaque calcul depuis le bord gauche du graphique au lieu de partir de a.")];
    case "sens": {
      const p = intervallePiegeSens(e);
      if (!p) return [t("Croire que A décroît là où f décroît : c'est le SIGNE de f qui donne le sens de variation de A.")];
      return [
        t("Croire que A décroît là où f décroît : sur "),
        f(intervalleLatex(p.de, p.a)),
        t(p.positive ? ", f décroît mais reste positive, donc A y est CROISSANTE." : ", f croît mais reste négative, donc A y est DÉCROISSANTE."),
      ];
    }
    case "tableau":
    case "valeursExt":
      return [t("Confondre les zéros de A avec ceux de f : A change de sens de variation là où f change de signe, pas là où A s'annule — A s'annule notamment au point d'abscisse a, qui n'est pas forcément un extremum.")];
    case "nature": {
      const contact = zerosInterieurs(e).find((z) => !z.changeSigne);
      if (contact) return [t("Prendre tout zéro de f pour un extremum de A : en "), f(`x=${nombreLatex(contact.x)}`), t(", f s'annule sans changer de signe, A ne change pas de sens de variation.")];
      const pic = changementsSensF(e)[0];
      return [t("Prendre un extremum de f pour un extremum de A : en "), f(`x=${nombreLatex(pic)}`), t(", f change de sens de variation mais pas de signe, A garde le même sens de variation.")];
    }
    case "pentes":
      return [t("Calculer une aire au lieu de lire une ordonnée : la pente de la courbe de A en p est la hauteur f(p) de la courbe de f, pas l'aire A(p).")];
    case "tangente":
      return [t("Prendre f(p) comme ordonnée du point de contact : ce point de la courbe de A est "), f(`(p\\,;\\,A(p))`), t(", la pente seule vaut f(p).")];
    case "choixGraphique": {
      const num = (indice: number) => e.ordre.indexOf(indice) + 1;
      return [
        t(`Le graphique ${num(1)} est la courbe de f elle-même ; le graphique ${num(2)} part de `),
        f(`f(${nombreLatex(e.a)})`),
        t(` au lieu de 0 en a ; le graphique ${num(3)} a les variations inversées (il décroît là où f est positive).`),
      ];
    }
  }
}

function methode(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] {
  switch (phase) {
    case "aires":
      return [
        t("Sur chaque intervalle, l'intégrale vaut l'aire au-dessus de l'axe moins l'aire en dessous ; on découpe aux zéros de f en triangles, trapèzes"),
        t(e.morceaux.some((m) => m.type === "demiDisque") ? " et demi-disque (aire " : " (aires "),
        f(e.morceaux.some((m) => m.type === "demiDisque") ? "\\frac{\\pi r^2}{2}" : "\\frac{b\\cdot h}{2}"),
        t(")."),
      ];
    case "valeursA":
    case "tableau":
    case "valeursExt":
      return [t("A(x) est l'aire signée accumulée de a jusqu'à x : "), f(`${aLatex(e.a)}=0`), t(", puis, par additivité, on ajoute les intégrales de proche en proche ; pour x < a, "), f("A(x)=-\\int_x^a f(t)\\,dt"), t(".")];
    case "sens":
      return [t("La fonction aire est une primitive de f : "), f("A'(x)=f(x)"), t(". A est croissante là où f est positive, décroissante là où f est négative — c'est le signe de f qui compte, pas son sens de variation.")];
    case "nature":
      return [t("A′ = f : A admet un extremum local là où f change de signe — maximum si f passe de + à −, minimum si f passe de − à +.")];
    case "pentes":
      return [t("La pente de la tangente à la courbe de A au point d'abscisse p est "), f("A'(p)=f(p)"), t(" : on lit l'ordonnée sur la courbe de f.")];
    case "tangente":
      return [t("Tangente au point d'abscisse p : "), f("y=A'(p)\\,(x-p)+A(p)"), t(", avec "), f("A'(p)=f(p)"), t(" et A(p) calculée par les aires signées.")];
    case "choixGraphique":
      return [t("La courbe de A passe par "), f(`(${nombreLatex(e.a)}\\,;\\,0)`), t(" car "), f(`${aLatex(e.a)}=0`), t(" ; elle monte là où f est positive, descend là où f est négative, et ses extremums sont aux zéros où f change de signe.")];
  }
}

function calcul(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] | null {
  const lignes = (formules: string[]) => formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
  switch (phase) {
    case "aires":
      return lignes(intervallesAires(e).map(([u, v]) => calculIntervalle(e, u, v)));
    case "valeursA":
      return lignes(abscissesValeursA(e).map((x) => chaineA(e, x)));
    case "tableau":
      return lignes(pointsTableau(e).map((x) => chaineA(e, x)));
    case "valeursExt":
      return lignes(extremumsA(e).map((m) => chaineA(e, m.x)));
    case "sens":
      return intervallesSens(e).flatMap((i, k) => [
        ...(k > 0 ? [t(" ; ")] : []),
        t("sur "),
        f(intervalleLatex(i.de, i.a)),
        t(i.sens > 0 ? ", f ≥ 0 : A croît" : ", f ≤ 0 : A décroît"),
      ]);
    case "nature":
      return candidatsExtremums(e).flatMap((x, k) => {
        const g = signeEntre(e, x - 0.5, x);
        const d = signeEntre(e, x, x + 0.5);
        const s = (v: number) => (v > 0 ? "+" : "−");
        return [...(k > 0 ? [t(" ; ")] : []), t("en "), f(`x=${nombreLatex(x)}`), t(`, f passe de ${s(g)} à ${s(d)}`)];
      });
    case "pentes": {
      const m = pentesAttendues(e);
      return lignes(e.points.map((p, i) => `A'(${nombreLatex(p)})=f(${nombreLatex(p)})=${nombreLatex(m[i])}`));
    }
    case "tangente": {
      const p = e.points[0];
      const m = pentesAttendues(e)[0];
      const ap = valeursExactesAttendues(e, phase)[0];
      const xMoinsP = p === 0 ? "x" : p > 0 ? `(x-${nombreLatex(p)})` : `(x+${nombreLatex(-p)})`;
      const coef = m === 0 ? "" : m === 1 ? "" : m === -1 ? "-" : `${nombreLatex(m)}\\,`;
      const apL = valeurLatex(ap);
      const pente = m === 0 ? "" : `${coef}${xMoinsP}`;
      const cst = apL === "0" ? (pente ? "" : "0") : pente && !apL.startsWith("-") ? `+${apL}` : apL;
      const developpee = equationTangenteLatex(e);
      return [f(chaineA(e, p)), t(" ; "), f(p === 0 || m === 0 ? developpee : `y=${pente}${cst}=${developpee.slice(2)}`)];
    }
    case "choixGraphique":
      return null;
  }
}

function conclusion(e: ExerciceFonctionAire, phase: PhaseFonctionAire): FragmentConsigne[] {
  if (phase === "nature") {
    return candidatsExtremums(e).flatMap((x, i) => [...(i > 0 ? [t(" ; ")] : []), t("en "), f(`x=${nombreLatex(x)}`), t(` : ${libelleNature(natureEn(e, x))}`)]);
  }
  if (phase === "choixGraphique") return [t(`C'est le graphique ${e.ordre.indexOf(0) + 1}.`)];
  if (phase === "tangente") return [f(equationTangenteLatex(e))];
  return reponseAttendue(e, phase);
}

function correctionDetaillee(e: ExerciceFonctionAire): EtapeCorrection[] {
  const phases = phasesPourExercice(e);
  return phases.flatMap((phase, k) => {
    const sq = lettre(e, phase);
    const lignes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion: sq, fragments: methode(e, phase) }];
    const c = calcul(e, phase);
    if (c) lignes.push({ label: "Calcul", sousQuestion: sq, fragments: c });
    const derniere = k === phases.length - 1;
    lignes.push({ label: "Conclusion", sousQuestion: sq, fragments: conclusion(e, phase), ...(derniere ? { figureHtml: figureCorrigeExercice(e) } : {}) });
    lignes.push({ label: "Piège", sousQuestion: sq, fragments: piege(e, phase) });
    return lignes;
  });
}

function difficulte(e: ExerciceFonctionAire): 1 | 2 | 3 {
  return e.variante === "extremums" || e.variante === "valeurs" ? 3 : 2;
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

function criteresValeurs(e: ExerciceFonctionAire, phase: PhaseFonctionAire, xs: number[], total: number): CritereBareme[] {
  const sq = lettre(e, phase);
  return xs.map((x) => ({ sousQuestion: sq, critere: [f(`${aLatex(x)}=${valeurLatex(aireExacte(e, x))}`)], points: Math.round((total / xs.length) * 100) / 100 }));
}

const ERREUR_SIGNE: ErreurFrequente = { description: [t("Aires sous l'axe comptées positivement (aire géométrique au lieu d'aire signée)")], cout: "−1" };
const ERREUR_SENS: ErreurFrequente = { description: [t("Sens de variation de A lu sur celui de f (A décroît là où f décroît)")], cout: "0 pt sur le sens de variation" };
const ERREUR_ZEROS: ErreurFrequente = { description: [t("Extremums de A placés aux zéros de A ou aux extremums de f au lieu des changements de signe de f")], cout: "0 pt sur les abscisses" };

function bareme(e: ExerciceFonctionAire): BaremeExercice {
  const acceptees: FragmentConsigne[][] = [[t("Valeurs exactes sous toute forme équivalente (fraction, décimal exact)")]];
  if (e.morceaux.some((m) => m.type === "demiDisque")) acceptees.push([t("Valeur décimale arrondie au centième d'une expression en "), f("\\pi"), t(" si l'expression exacte figure dans le calcul")]);
  switch (e.variante) {
    case "valeurs": {
      const ints = intervallesAires(e);
      const vAires = valeursExactesAttendues(e, "aires");
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          ...ints.map(([u, v], i) => ({ sousQuestion: "a", critere: [f(`${integraleLatex(u, v)}=${valeurLatex(vAires[i])}`)], points: Math.round((1.5 / ints.length) * 100) / 100 })),
          { sousQuestion: "b", critere: [f(`${aLatex(e.a)}=0`)], points: 0.5 },
          ...criteresValeurs(e, "valeursA", e.points, 2),
        ],
        erreursFrequentes: [ERREUR_SIGNE, { description: [t("Oubli du signe moins pour une valeur de A à gauche de a, ou calcul depuis le bord du graphique au lieu de a")], cout: "−0,5 par valeur" }],
        reponsesAcceptees: acceptees,
      };
    }
    case "variations":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Justification : "), f("A'=f"), t(", A croît où f > 0 et décroît où f < 0")], points: 0.75 },
          { sousQuestion: "a", critere: [t("Sens de variation correct sur chaque intervalle")], points: 1.25 },
          ...criteresValeurs(e, "tableau", pointsTableau(e), 2),
        ],
        erreursFrequentes: [ERREUR_SENS, ERREUR_SIGNE, { description: [t("Valeur de A en a différente de 0")], cout: "−0,5" }],
        reponsesAcceptees: acceptees,
      };
    case "extremums":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t("Abscisses des extremums : changements de signe de f, avec justification")], points: 1 },
          { sousQuestion: "a", critere: [t("Nature (maximum ou minimum) correcte")], points: 1 },
          ...criteresValeurs(
            e,
            "valeursExt",
            extremumsA(e).map((m) => m.x),
            2,
          ),
        ],
        erreursFrequentes: [ERREUR_ZEROS, ERREUR_SIGNE],
        reponsesAcceptees: acceptees,
      };
    case "pente": {
      const m = pentesAttendues(e);
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          ...e.points.map((p, i) => ({ sousQuestion: "a", critere: [f(`A'(${nombreLatex(p)})=f(${nombreLatex(p)})=${nombreLatex(m[i])}`)], points: 0.75 })),
          { sousQuestion: "b", critere: [f(`${aLatex(e.points[0])}=${valeurLatex(aireExacte(e, e.points[0]))}`)], points: 1 },
          { sousQuestion: "b", critere: [t("Équation de la tangente : "), f(equationTangenteLatex(e))], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [t("Pente prise égale à l'aire A(p) au lieu de f(p)")], cout: "0 pt sur a)" },
          { description: [t("Ordonnée du point de contact prise égale à f(p) au lieu de A(p)")], cout: "−1" },
        ],
        reponsesAcceptees: [...acceptees, [t("Équation non développée "), f("y=A'(p)(x-p)+A(p)"), t(" avec les bonnes valeurs")]],
      };
    }
    case "graphique": {
      const n = e.ordre.indexOf(0) + 1;
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [t(`Choix du graphique ${n}`)], points: 1 },
          { sousQuestion: "a", critere: [t("La courbe de A passe par "), f(`(${nombreLatex(e.a)}\\,;\\,0)`)], points: 1 },
          { sousQuestion: "a", critere: [t("A croît où f > 0 et décroît où f < 0 (extremums aux changements de signe de f)")], points: 1 },
          { sousQuestion: "a", critere: [t("Élimination argumentée des trois autres graphiques")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [t("Choix de la courbe de f elle-même")], cout: "0 pt" },
          { description: [t("Choix d'un graphique qui ne passe pas par "), f("(a\\,;\\,0)")], cout: "0 pt" },
        ],
        reponsesAcceptees: [[t("Toute justification correcte fondée sur "), f("A(a)=0"), t(" et "), f("A'=f")]],
      };
    }
  }
}

export const adaptateurEvaluationFonctionAire: AdaptateurFeuilleExercices<ExerciceFonctionAire> = {
  titreDocument: "La fonction aire — Évaluation",
  nomFichierBase: "fonction-aire",
  genererInstance: genererExerciceFonctionAire,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteFonctionAire),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
  profilInstance: profilFonctionAire,
};
