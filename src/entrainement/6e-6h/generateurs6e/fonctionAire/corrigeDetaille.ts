import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceFonctionAire, MorceauF } from "../../core6e/fonctionAire.types";
import type { ValeurExacte } from "../../moteur6e/modeleFonctionAire";
import {
  aireExacte,
  candidatsExtremums,
  changementsSensF,
  debut,
  evaluerF,
  extremumsA,
  fin,
  integraleExacte,
  intervallesSens,
  natureEn,
  pointsTableau,
  signeEntre,
  somme,
  valeurNumerique,
  zerosInterieurs,
} from "../../moteur6e/modeleFonctionAire";
import { phasesPourExercice } from "../../moteur6e/typesFonctionAire";
import type { PhaseFonctionAire } from "../../moteur6e/typesFonctionAire";
import { abscissesValeursA, intervallesAires, pentesAttendues, valeursExactesAttendues } from "../../moteur6e/verificationFonctionAire";
import { figureCorrigeExercice } from "../../ui6e/figureFonctionAire";
import { aLatex, equationTangenteLatex, integraleLatex, intervalleLatex, libelleNature, nombreLatex, nombreTexte, reponseAttendue, valeurLatex } from "../../ui6e/formatFonctionAire";
import { COURS_INTEGRALES, sommeTermes } from "../../ui6e/corrigeIntegrales2";

/**
 * Corrigé détaillé « comme au tableau » de `6gen78` (la fonction aire) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`phasesPourExercice`) : aires signées
 * (figures lues sur le quadrillage), valeurs de A (de proche en proche depuis a, bornes échangées à
 * gauche de a), sens de variation (signe de f), tableau, extremums (changement de signe de f),
 * pentes A′(p) = f(p), tangente, choix du graphique. Valeurs tirées du moteur de l'écran
 * (`modeleFonctionAire.ts`, `verificationFonctionAire.ts`, `formatFonctionAire.ts`).
 */

type E = ExerciceFonctionAire;
const t = texte;
const f = latex;
const LETTRES = "abcdefgh";
const n = nombreLatex;

function lettre(e: E, phase: PhaseFonctionAire): string {
  return LETTRES[phasesPourExercice(e).indexOf(phase)]!;
}

/** Terme d'une somme : les négatifs entre parenthèses. */
function terme(v: ValeurExacte): string {
  const s = valeurLatex(v);
  return s.startsWith("-") ? `(${s})` : s;
}

/** Opposé d'une expression : `-x` ou `-(a+b)`. */
function moins(x: string): string {
  if (x === "0") return "0";
  return /^[0-9\\]/.test(x) && !/[+-]/.test(x.replace(/^-/, "")) ? `-${x}` : `-(${x})`;
}

// ============================================================================
// Figures simples entre deux abscisses (lecture du quadrillage).
// ============================================================================

interface Figure {
  formule: string;
  valeur: ValeurExacte;
  description: string;
}

/** Figures (signées) qui composent la région entre la courbe et l'axe sur [u ; v] (u < v, sommets ou centres). */
function figures(e: E, u: number, v: number): Figure[] {
  const res: Figure[] = [];
  for (const m of e.morceaux) {
    const de = Math.max(u, debut(m));
    const a = Math.min(v, fin(m));
    if (a <= de + 1e-9) continue;
    res.push(figureMorceau(e, m, de, a));
  }
  return res;
}

function figureMorceau(e: E, m: MorceauF, de: number, a: number): Figure {
  const valeur = integraleExacte(e, de, a);
  const negatif = valeurNumerique(valeur) < 0;
  const pos = negatif ? "sous l'axe" : "au-dessus de l'axe";
  const signe = negatif ? "-" : "";
  if (m.type === "demiDisque") {
    const entier = Math.abs(de - debut(m)) < 1e-9 && Math.abs(a - fin(m)) < 1e-9;
    const r = m.rayon;
    return entier
      ? { formule: `${signe}\\dfrac{\\pi\\times ${r}^2}{2}`, valeur, description: `demi-disque de rayon ${r} ${pos}` }
      : { formule: `${signe}\\dfrac{\\pi\\times ${r}^2}{4}`, valeur, description: `quart de disque de rayon ${r} ${pos}` };
  }
  const w = a - de;
  const h0 = Math.abs(evaluerF(e, de));
  const h1 = Math.abs(evaluerF(e, a));
  const W = n(w);
  if (Math.abs(h0 - h1) < 1e-9) return { formule: `${signe}${W}\\times ${n(h0)}`, valeur, description: `rectangle ${nombreTexte(w)} × ${nombreTexte(h0)} ${pos}` };
  if (h0 < 1e-9 || h1 < 1e-9) {
    const h = Math.max(h0, h1);
    return { formule: `${signe}\\dfrac{${W}\\times ${n(h)}}{2}`, valeur, description: `triangle ${pos} (base ${nombreTexte(w)}, hauteur ${nombreTexte(h)})` };
  }
  return {
    formule: `${signe}\\dfrac{(${n(Math.max(h0, h1))}+${n(Math.min(h0, h1))})\\times ${W}}{2}`,
    valeur,
    description: `trapèze ${pos} (bases ${nombreTexte(Math.max(h0, h1))} et ${nombreTexte(Math.min(h0, h1))}, hauteur ${nombreTexte(w)})`,
  };
}

/** Somme de valeurs exactes : écrite terme à terme. */
function sommeValeurs(vs: ValeurExacte[]): string {
  return sommeTermes(vs.map((v) => valeurLatex(v)));
}

/** ∫ᵤᵛ f(t) dt par les figures lues : formules signées, valeurs, total. */
function lignesIntegrale(e: E, u: number, v: number): LigneCalcul[] {
  const figs = figures(e, u, v);
  const total = integraleExacte(e, u, v);
  const formules = sommeTermes(figs.map((x) => x.formule));
  const lignes: LigneCalcul[] = [ligne(`${integraleLatex(u, v)}=${formules}`, figs.map((x) => x.description).join(" ; "))];
  const valeurs = sommeValeurs(figs.map((x) => x.valeur));
  if (valeurs !== formules) lignes.push(ligne(`=${valeurs}`));
  if (valeurLatex(total) !== valeurs) lignes.push(ligne(`=${valeurLatex(total)}`));
  return lignes;
}

/**
 * A(x) = ∫ₐˣ f(t) dt. `intervalles` : intégrales déjà calculées (étape précédente) sur lesquelles on
 * s'appuie de proche en proche ; sinon les figures lues entre a et x.
 */
function lignesA(e: E, x: number, intervalles?: [number, number][]): LigneCalcul[] {
  const v = aireExacte(e, x);
  if (x === e.a) return [ligne(`${aLatex(x)}=${integraleLatex(e.a, e.a)}`, "définition de A : bornes égales"), ligne("=0")];
  const gauche = x < e.a;
  const [u, w] = gauche ? [x, e.a] : [e.a, x];
  const lignes: LigneCalcul[] = [ligne(`${aLatex(x)}=${integraleLatex(e.a, x)}`, "définition de A")];
  const enveloppe = (s: string) => (gauche ? moins(s) : s);
  if (gauche) lignes.push(ligne(`=-${integraleLatex(x, e.a)}`, "bornes échangées : le signe change"));
  let morceaux: ValeurExacte[];
  if (intervalles) {
    const utiles = intervalles.filter(([p, q]) => p >= u - 1e-9 && q <= w + 1e-9);
    morceaux = utiles.map(([p, q]) => integraleExacte(e, p, q));
    if (utiles.length > 1) lignes.push(ligne(`=${enveloppe(utiles.map(([p, q]) => integraleLatex(p, q)).join("+"))}`, "relation de Chasles"));
    lignes.push(ligne(`=${enveloppe(utiles.length > 1 ? morceaux.map(terme).join("+") : valeurLatex(morceaux[0]!))}`, "valeur de l'étape 1".replace("valeur ", utiles.length > 1 ? "valeurs " : "valeur ")));
  } else {
    const figs = figures(e, u, w);
    morceaux = figs.map((y) => y.valeur);
    lignes.push(ligne(`=${enveloppe(sommeTermes(figs.map((y) => y.formule)))}`, figs.map((y) => y.description).join(" ; ")));
    const valeurs = sommeValeurs(morceaux);
    if (valeurs !== sommeTermes(figs.map((y) => y.formule))) lignes.push(ligne(`=${enveloppe(valeurs)}`));
  }
  const integrale = morceaux.reduce(somme, { demi: 0, quartPi: 0 });
  const cumul = enveloppe(valeurLatex(integrale));
  if (lignes[lignes.length - 1]!.latex !== `=${cumul}`) lignes.push(ligne(`=${cumul}`));
  if (cumul !== valeurLatex(v)) lignes.push(ligne(`=${valeurLatex(v)}`));
  return lignes;
}

// ============================================================================
// Étapes.
// ============================================================================

const RAPPEL_A: FragmentConsigne[] = [
  t("A(x) est l'aire signée accumulée de a jusqu'à x : "),
];

function rappelA(e: E): FragmentConsigne[] {
  return [
    ...RAPPEL_A,
    f(`${aLatex(e.a)}=0`),
    t(" ; par additivité, on ajoute les intégrales de proche en proche ; pour x < a, on échange les bornes : "),
    f(`A(x)=-\\int_x^{${n(e.a)}} f(t)\\,dt`),
    t(` ${COURS_INTEGRALES}.`),
  ];
}

function etapeAires(e: E): EtapeCorrection[] {
  const sq = lettre(e, "aires");
  const disque = e.morceaux.some((m) => m.type === "demiDisque");
  return [
    utilise(sq, [
      t("Sur un intervalle, l'intégrale vaut l'aire au-dessus de l'axe moins l'aire en dessous ; on découpe la région en triangles, rectangles, trapèzes"),
      t(disque ? " et portions de disque (aire " : " (aire d'un trapèze "),
      f(disque ? "\\dfrac{\\pi r^2}{2}" : "\\dfrac{(B+b)\\times h}{2}"),
      t(`) ${COURS_INTEGRALES}.`),
    ]),
    calcul(
      sq,
      intervallesAires(e).flatMap(([u, v]) => lignesIntegrale(e, u, v)),
      [t("Figures lues sur le quadrillage, comptées négativement sous l'axe :")],
    ),
    resultat(sq, reponseAttendue(e, "aires")),
    piege(sq, [t("Compter positivement une aire située sous l'axe : l'intégrale est une aire signée, les morceaux de part et d'autre d'un zéro de f se compensent.")]),
  ];
}

function etapeValeursA(e: E): EtapeCorrection[] {
  const sq = lettre(e, "valeursA");
  const ints = intervallesAires(e);
  return [
    utilise(sq, rappelA(e)),
    calcul(sq, abscissesValeursA(e).flatMap((x) => lignesA(e, x, ints))),
    resultat(sq, reponseAttendue(e, "valeursA")),
    piege(
      sq,
      e.points.some((p) => p < e.a)
        ? [t("Pour x < a, oublier le signe moins : "), f("\\int_a^x f(t)\\,dt=-\\int_x^a f(t)\\,dt"), t(". Et ne pas oublier que "), f(`${aLatex(e.a)}=0`), t(".")]
        : [t("Oublier que la fonction aire s'annule en a, "), f(`${aLatex(e.a)}=0`), t(", ou recommencer chaque calcul depuis le bord gauche du graphique au lieu de partir de a.")],
    ),
  ];
}

function intervallePiegeSens(e: E): { de: number; a: number; positive: boolean } | null {
  for (const i of intervallesSens(e)) {
    const s = signeEntre(e, i.de, i.a);
    const pente = evaluerF(e, i.a) - evaluerF(e, i.de);
    if (s > 0 && pente < 0) return { de: i.de, a: i.a, positive: true };
    if (s < 0 && pente > 0) return { de: i.de, a: i.a, positive: false };
  }
  return null;
}

function etapeSens(e: E): EtapeCorrection[] {
  const sq = lettre(e, "sens");
  const p = intervallePiegeSens(e);
  return [
    utilise(sq, [t("La fonction aire est une primitive de f : "), f("A'(x)=f(x)"), t(`. A est croissante là où f est positive, décroissante là où f est négative — c'est le signe de f qui compte, pas son sens de variation ${COURS_INTEGRALES}.`)]),
    calcul(
      sq,
      intervallesSens(e).map((i) => {
        const montee = evaluerF(e, i.a) - evaluerF(e, i.de);
        const remarque = i.sens > 0 && montee < 0 ? " (f décroît mais reste positive)" : i.sens < 0 && montee > 0 ? " (f croît mais reste négative)" : "";
        return ligne(`x\\in${intervalleLatex(i.de, i.a)}`, i.sens > 0 ? `courbe de f au-dessus de l'axe : A′ = f ≥ 0, A croissante${remarque}` : `courbe de f sous l'axe : A′ = f ≤ 0, A décroissante${remarque}`);
      }),
      [t("On lit le signe de f sur chaque intervalle :")],
    ),
    resultat(sq, reponseAttendue(e, "sens")),
    piege(
      sq,
      p
        ? [t("Croire que A décroît là où f décroît : sur "), f(intervalleLatex(p.de, p.a)), t(p.positive ? ", f décroît mais reste positive, donc A y est croissante." : ", f croît mais reste négative, donc A y est décroissante.")]
        : [t("Croire que A décroît là où f décroît : c'est le signe de f qui donne le sens de variation de A.")],
    ),
  ];
}

/** Expression additionnée ou soustraite : entre parenthèses si elle a plusieurs termes ou un signe. */
function bloc(x: string): string {
  return /^[0-9\\]/.test(x) && !/[+-]/.test(x) ? x : `(${x})`;
}

/**
 * A(x) de proche en proche : on part du point connu le plus proche entre a et x (A(a) = 0 ou une
 * valeur déjà calculée), et on ajoute (ou retranche, à gauche) l'intégrale lue entre les deux.
 */
function lignesAProche(e: E, x: number, connus: number[]): LigneCalcul[] {
  const droite = x > e.a;
  const candidats = connus.filter((c) => (droite ? c >= e.a && c < x : c <= e.a && c > x));
  const base = droite ? Math.max(...candidats) : Math.min(...candidats);
  if (candidats.length === 0 || base === e.a || x === e.a) return lignesA(e, x);
  const [u, w] = droite ? [base, x] : [x, base];
  const figs = figures(e, u, w);
  const F = sommeTermes(figs.map((y) => y.formule));
  const V = sommeValeurs(figs.map((y) => y.valeur));
  const Ab = valeurLatex(aireExacte(e, base));
  const op = droite ? "+" : "-";
  const combine = (y: string) => (Ab === "0" ? (droite ? y : `-${bloc(y)}`) : droite ? sommeTermes([Ab, y]) : `${Ab}-${bloc(y)}`);
  const lignes: LigneCalcul[] = [
    ligne(`${aLatex(x)}=${aLatex(base)}${op}${integraleLatex(u, w)}`, `relation de Chasles : on part de ${"A"}(${nombreTexte(base)}), déjà calculé`),
    ligne(`=${combine(F)}`, figs.map((y) => y.description).join(" ; ")),
  ];
  if (V !== F) lignes.push(ligne(`=${combine(V)}`));
  const final = `=${valeurLatex(aireExacte(e, x))}`;
  if (lignes[lignes.length - 1]!.latex !== final) lignes.push(ligne(final));
  return lignes;
}

function etapeValeurs(e: E, phase: "tableau" | "valeursExt"): EtapeCorrection[] {
  const sq = lettre(e, phase);
  const xs = phase === "tableau" ? pointsTableau(e) : extremumsA(e).map((m) => m.x);
  const derniere = phasesPourExercice(e).indexOf(phase) === phasesPourExercice(e).length - 1;
  const res = resultat(sq, reponseAttendue(e, phase));
  return [
    utilise(sq, rappelA(e)),
    calcul(
      sq,
      xs.flatMap((x, i) => lignesAProche(e, x, [e.a, ...xs.slice(0, i)])),
    ),
    derniere ? { ...res, figureHtml: figureCorrigeExercice(e) } : res,
    piege(sq, [t("Confondre les zéros de A avec ceux de f : A change de sens de variation là où f change de signe, pas là où A s'annule — A s'annule notamment en a, qui n'est pas forcément un extremum.")]),
  ];
}

function etapeNature(e: E): EtapeCorrection[] {
  const sq = lettre(e, "nature");
  const s = (v: number) => (v > 0 ? "+" : "−");
  const contact = zerosInterieurs(e).find((z) => !z.changeSigne);
  const pic = changementsSensF(e)[0];
  return [
    utilise(sq, [t("A′ = f : A admet un extremum local là où f change de signe — maximum si f passe de + à −, minimum si f passe de − à + "), t(`${COURS_INTEGRALES}.`)]),
    calcul(
      sq,
      candidatsExtremums(e).map((x) => {
        const g = signeEntre(e, x - 0.5, x);
        const d = signeEntre(e, x, x + 0.5);
        const y = evaluerF(e, x);
        const nature = natureEn(e, x);
        const verdict =
          nature !== "aucun"
            ? `f passe de ${s(g)} à ${s(d)} : ${libelleNature(nature)} de A`
            : Math.abs(y) < 1e-9
              ? `f s'annule sans changer de signe (${s(g)} des deux côtés) : pas d'extremum`
              : `extremum de f mais f ne s'annule pas (${s(g)} des deux côtés) : pas d'extremum de A`;
        return ligne(`f(${n(x)})=${n(Math.round(y * 1e9) / 1e9)}`, verdict);
      }),
      [t("En chaque abscisse candidate, on lit f et son signe juste avant et juste après :")],
    ),
    resultat(sq, reponseAttendue(e, "nature")),
    piege(
      sq,
      contact
        ? [t("Prendre tout zéro de f pour un extremum de A : en "), f(`x=${n(contact.x)}`), t(", f s'annule sans changer de signe, A ne change pas de sens de variation.")]
        : [t("Prendre un extremum de f pour un extremum de A : en "), f(`x=${n(pic ?? e.a)}`), t(", f change de sens de variation mais pas de signe, A garde le même sens de variation.")],
    ),
  ];
}

function etapePentes(e: E): EtapeCorrection[] {
  const sq = lettre(e, "pentes");
  const m = pentesAttendues(e);
  return [
    utilise(sq, [t("La pente de la tangente à la courbe de A au point d'abscisse p est "), f("A'(p)=f(p)"), t(` : on lit l'ordonnée sur la courbe de f ${COURS_INTEGRALES}.`)]),
    calcul(
      sq,
      e.points.flatMap((p, i) => [ligne(`A'(${n(p)})=f(${n(p)})`, "A est une primitive de f"), ligne(`=${n(m[i]!)}`, `ordonnée lue sur la courbe de f en x = ${nombreTexte(p)}`)]),
    ),
    resultat(sq, reponseAttendue(e, "pentes")),
    piege(sq, [t("Calculer une aire au lieu de lire une ordonnée : la pente de la courbe de A en p est la hauteur f(p) de la courbe de f, pas l'aire A(p).")]),
  ];
}

function etapeTangente(e: E): EtapeCorrection[] {
  const sq = lettre(e, "tangente");
  const p = e.points[0]!;
  const m = pentesAttendues(e)[0]!;
  const ap = valeursExactesAttendues(e, "tangente")[0]!;
  const xMoinsP = p === 0 ? "x" : p > 0 ? `(x-${n(p)})` : `(x+${n(-p)})`;
  const coef = m === 1 ? "" : m === -1 ? "-" : `${n(m)}\\,`;
  const apL = valeurLatex(ap);
  const pente = m === 0 ? "" : `${coef}${xMoinsP}`;
  const cst = apL === "0" ? (pente ? "" : "0") : pente && !apL.startsWith("-") ? `+${apL}` : apL;
  const developpee = equationTangenteLatex(e);
  const tangente: LigneCalcul[] = [
    ligne(`y=A'(${n(p)})\\,${xMoinsP}+${aLatex(p)}`, "équation de la tangente au point d'abscisse p"),
    ligne(`y=${pente}${cst}`, [t("avec "), f(`A'(${n(p)})=f(${n(p)})=${n(m)}`), t(" et "), f(`${aLatex(p)}=${apL}`)]),
  ];
  if (`y=${pente}${cst}` !== developpee) tangente.push(ligne(`=${developpee.slice(2)}`, "on développe"));
  return [
    utilise(sq, [t("Tangente au point d'abscisse p : "), f("y=A'(p)\\,(x-p)+A(p)"), t(", avec "), f("A'(p)=f(p)"), t(` et A(p) calculée par les aires signées ${COURS_INTEGRALES}.`)]),
    calcul(sq, lignesA(e, p), [], `Valeur de ${"A"} en ${nombreTexte(p)}`),
    calcul(sq, tangente, [], "Tangente"),
    { ...resultat(sq, reponseAttendue(e, "tangente")), figureHtml: figureCorrigeExercice(e) },
    verification(sq, [t("Le point de contact "), f(`(${n(p)}\\,;\\,${apL})`), t(" vérifie l'équation :")], [ligne(`${developpee.slice(2).replace(/x/g, `\\times(${n(p)})`).replace(/^\\times/, "1\\times")}=${apL}`, "✓")]),
    piege(sq, [t("Prendre f(p) comme ordonnée du point de contact : ce point de la courbe de A est "), f("(p\\,;\\,A(p))"), t(", la pente seule vaut f(p).")]),
  ];
}

function etapeChoixGraphique(e: E): EtapeCorrection[] {
  const sq = lettre(e, "choixGraphique");
  const num = (indice: number) => e.ordre.indexOf(indice) + 1;
  const fa = evaluerF(e, e.a);
  const positif = intervallesSens(e).find((i) => i.sens > 0);
  const lignes: LigneCalcul[] = [
    ligne(`${aLatex(e.a)}=0`, `la courbe de A passe par (${nombreTexte(e.a)} ; 0) ; les graphiques ${num(1)} et ${num(2)} passent par (${nombreTexte(e.a)} ; ${nombreTexte(fa)}) : éliminés`),
    ligne("A'(x)=f(x)", positif ? `A croît là où f est positive, par exemple sur [${nombreTexte(positif.de)} ; ${nombreTexte(positif.a)}] ; le graphique ${num(3)} y décroît : éliminé` : `A croît là où f est positive ; le graphique ${num(3)} a les variations inversées : éliminé`),
  ];
  return [
    utilise(sq, [t("La courbe de A passe par "), f(`(${n(e.a)}\\,;\\,0)`), t(" car "), f(`${aLatex(e.a)}=0`), t(" ; elle monte là où f est positive, descend là où f est négative, et ses extremums sont aux zéros où f change de signe "), t(`${COURS_INTEGRALES}.`)]),
    calcul(sq, lignes, [t("On teste chaque condition sur les quatre graphiques :")]),
    { ...resultat(sq, [t(`C'est le graphique ${num(0)}.`)]), figureHtml: figureCorrigeExercice(e) },
    piege(sq, [
      t(`Le graphique ${num(1)} est la courbe de f elle-même ; le graphique ${num(2)} part de `),
      f(`f(${n(e.a)})`),
      t(` au lieu de 0 en a ; le graphique ${num(3)} a les variations inversées (il décroît là où f est positive).`),
    ]),
  ];
}

export function correctionDetailleeFonctionAire(e: E): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase) => {
    switch (phase) {
      case "aires":
        return etapeAires(e);
      case "valeursA":
        return etapeValeursA(e);
      case "sens":
        return etapeSens(e);
      case "tableau":
        return etapeValeurs(e, "tableau");
      case "nature":
        return etapeNature(e);
      case "valeursExt":
        return etapeValeurs(e, "valeursExt");
      case "pentes":
        return etapePentes(e);
      case "tangente":
        return etapeTangente(e);
      case "choixGraphique":
        return etapeChoixGraphique(e);
    }
  });
}

