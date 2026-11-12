import type { ExerciceAffixesRacines, ValeurComplexe } from "../../core6e/affixesRacines.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LIBELLE_PHASE, blocDonnees, consigneEcran, consigneGenerale, entierComplexeLatex, formatReponseAttenduePhaseLatex } from "../../ui6e/formatAffixesRacines";
import { phasesPourExercice } from "../../moteur6e/typesAffixesRacines";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAffixesRacines, type IdVarianteAffixesRacines } from "./index";
import { LIBELLE_CAS_AFFIXES_RACINES, profilAffixesRacines } from "../profilsEvaluationComplexes34-36";

/**
 * Adaptateur feuille d'exercices / évaluation de `6gen35` (« Nombres complexes : affixes et racines
 * carrées ») — méthode `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier = données + consigne globale ; les écrans deviennent les étapes du corrigé
 *   (`sousQuestion` = lettre de l'écran), valeurs tirées de `formatReponseAttenduePhaseLatex`.
 * - Les écrans « à choix » (relation du parallélogramme, système de la racine carrée) n'ont pas de
 *   liste d'options sur papier : leur titre d'étape demande d'ÉCRIRE la relation / le système.
 * - Familles B et D : figure du plan (repère orthonormé) sous la conclusion du corrigé.
 */

type Exo<F extends ExerciceAffixesRacines["famille"]> = Extract<ExerciceAffixesRacines, { famille: F }>;

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

const p = (n: number) => (n < 0 ? `(${n})` : `${n}`);
const z = (re: number, im: number) => entierComplexeLatex(re, im);

/** Nombre avec au plus une décimale (milieux demi-entiers), virgule décimale. */
function nombreLatex(v: number): string {
  return String(v).replace(".", "{,}");
}

/** Affixe dont les parties peuvent être des demi-entiers (milieu de 6gen35 D). */
function affixeLatex(v: ValeurComplexe): string {
  if (Number.isInteger(v.re) && Number.isInteger(v.im)) return z(v.re, v.im);
  const re = v.re === 0 ? "" : nombreLatex(v.re);
  if (v.im === 0) return re;
  const mag = Math.abs(v.im) === 1 ? "" : nombreLatex(Math.abs(v.im));
  if (v.re === 0) return `${v.im < 0 ? "-" : ""}${mag}i`;
  return `${re}${v.im < 0 ? "-" : "+"}${mag}i`;
}

function attendu(e: ExerciceAffixesRacines, i: number): string {
  return formatReponseAttenduePhaseLatex(e, phasesPourExercice(e)[i]).join(",\\ ");
}

/** Consigne d'un écran, version papier : un écran « à choix » n'a pas d'options sur papier. */
function consigneEtape(e: ExerciceAffixesRacines, phase: ReturnType<typeof phasesPourExercice>[number]): FragmentConsigne[] {
  return consigneEcran(e, phase).map((f) => {
    if (f.type !== "texte") return f;
    const valeur = f.valeur
      .replace(/^Choisis le système vérifié par x et y/, "Écris le système vérifié par x et y")
      .replace(/ \(0 s'il n'y a pas de partie réelle\/imaginaire\)\./, ".")
      .replace(/ \(virgule décimale si besoin\)\./, ".");
    return valeur === f.valeur ? f : { ...f, valeur };
  });
}

// ============================================================================
// Figure : plan complexe (repère orthonormé), SVG autonome pour le corrigé papier.
// ============================================================================

const COUL = {
  encre: "var(--ink, #1b1d22)",
  doux: "var(--ink-soft, #5c6370)",
  pale: "var(--ink-faint, #c9ced6)",
  accent: "var(--accent, #b65c1f)",
  accentDoux: "var(--accent-soft, #f4e3d1)",
  bon: "var(--good, #2f7a4f)",
};
const POLICE = 'font-family="Work Sans, Arial, Helvetica, sans-serif"';
let compteurFigures = 0;

interface PointPlan {
  v: ValeurComplexe;
  nom: string;
  couleur?: string;
}

function planComplexeSvg(o: { points: PointPlan[]; polygone?: ValeurComplexe[]; segments?: { de: ValeurComplexe; a: ValeurComplexe; pointilles?: boolean; couleur?: string }[]; libelle: string }): string {
  const id = `pc${++compteurFigures}`;
  const xs = [0, ...o.points.map((q) => q.v.re)];
  const ys = [0, ...o.points.map((q) => q.v.im)];
  // Fenêtre entière avec une case de marge ; les repères « 1 » et « i » restent toujours à l'intérieur.
  const xMin = Math.min(Math.floor(Math.min(...xs)) - 1, -1);
  const xMax = Math.max(Math.ceil(Math.max(...xs)) + 1, 2);
  const yMin = Math.min(Math.floor(Math.min(...ys)) - 1, -1);
  const yMax = Math.max(Math.ceil(Math.max(...ys)) + 1, 2);
  const marge = { g: 18, d: 34, h: 24, b: 18 };
  const unite = Math.min(300 / (xMax - xMin), 260 / (yMax - yMin), 28);
  const L = (xMax - xMin) * unite + marge.g + marge.d;
  const H = (yMax - yMin) * unite + marge.h + marge.b;
  const sx = (x: number) => marge.g + (x - xMin) * unite;
  const sy = (y: number) => H - marge.b - (y - yMin) * unite;
  const f = (v: number) => v.toFixed(1);
  const m: string[] = [];
  m.push(`<defs><marker id="${id}fl" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${COUL.doux}"/></marker></defs>`);
  for (let x = xMin; x <= xMax; x++) m.push(`<line x1="${f(sx(x))}" y1="${f(sy(yMin))}" x2="${f(sx(x))}" y2="${f(sy(yMax))}" stroke="${COUL.pale}" stroke-width="0.6"/>`);
  for (let y = yMin; y <= yMax; y++) m.push(`<line x1="${f(sx(xMin))}" y1="${f(sy(y))}" x2="${f(sx(xMax))}" y2="${f(sy(y))}" stroke="${COUL.pale}" stroke-width="0.6"/>`);
  m.push(
    `<line x1="${f(sx(xMin))}" y1="${f(sy(0))}" x2="${f(sx(xMax) + 12)}" y2="${f(sy(0))}" stroke="${COUL.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<line x1="${f(sx(0))}" y1="${f(sy(yMin))}" x2="${f(sx(0))}" y2="${f(sy(yMax) - 12)}" stroke="${COUL.doux}" stroke-width="1.1" marker-end="url(#${id}fl)"/>`,
    `<text x="${f(sx(xMax) + 2)}" y="${f(sy(0) + 14)}" font-size="11" fill="${COUL.doux}" ${POLICE}>Re</text>`,
    `<text x="${f(sx(0) + 5)}" y="${f(sy(yMax) - 4)}" font-size="11" fill="${COUL.doux}" ${POLICE}>Im</text>`,
    `<text x="${f(sx(1))}" y="${f(sy(0) + 13)}" font-size="10" text-anchor="middle" fill="${COUL.doux}" ${POLICE}>1</text>`,
    `<text x="${f(sx(0) - 4)}" y="${f(sy(1) + 4)}" font-size="10" text-anchor="end" fill="${COUL.doux}" ${POLICE}>i</text>`,
  );
  if (o.polygone) m.push(`<polygon points="${o.polygone.map((v) => `${f(sx(v.re))},${f(sy(v.im))}`).join(" ")}" fill="${COUL.accentDoux}" fill-opacity="0.6" stroke="${COUL.accent}" stroke-width="1.6"/>`);
  for (const s of o.segments ?? [])
    m.push(`<line x1="${f(sx(s.de.re))}" y1="${f(sy(s.de.im))}" x2="${f(sx(s.a.re))}" y2="${f(sy(s.a.im))}" stroke="${s.couleur ?? COUL.accent}" stroke-width="1.4"${s.pointilles ? ' stroke-dasharray="4 3"' : ""}/>`);
  const cx = o.points.reduce((t, q) => t + q.v.re, 0) / o.points.length;
  const cy = o.points.reduce((t, q) => t + q.v.im, 0) / o.points.length;
  for (const q of o.points) {
    const couleur = q.couleur ?? COUL.encre;
    const px = sx(q.v.re);
    const py = sy(q.v.im);
    // Étiquette poussée à l'opposé du centre de la figure (jamais sur un côté du polygone).
    const dx = q.v.re >= cx ? 7 : -7;
    const dy = q.v.im >= cy ? -6 : 14;
    m.push(
      `<circle cx="${f(px)}" cy="${f(py)}" r="3.2" fill="${couleur}"/>`,
      `<text x="${f(px + dx)}" y="${f(py + dy)}" font-size="12" font-weight="600" text-anchor="${dx > 0 ? "start" : "end"}" fill="${couleur}" stroke="var(--surface, #ffffff)" stroke-width="3" paint-order="stroke" ${POLICE}>${q.nom}</text>`,
    );
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${f(L)} ${f(H)}" width="${f(L)}" height="${f(H)}" style="max-width:100%;height:auto" role="img" aria-label="${o.libelle}">${m.join("")}</svg>`;
}

// ============================================================================
// Énoncé
// ============================================================================

function donnees(e: ExerciceAffixesRacines): string {
  return blocDonnees(e).join(",\\ ");
}

function entetePapier(e: ExerciceAffixesRacines): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [texte("Soit "), latex(donnees(e)), texte(". Calcule "), latex("z+\\bar z"), texte(" et "), latex("z-\\bar z"), texte(" et écris chacun sous la forme "), latex("a+bi"), texte(".")];
    case "C":
      return [texte("Détermine les racines carrées complexes de "), latex(z(e.a, e.b)), texte(". Écris-les sous la forme "), latex("a+bi"), texte(".")];
    case "B":
    case "D":
      return [...consigneGenerale(e), texte(" Données : "), latex(donnees(e)), texte(".")];
  }
}

function construireEnonce(e: ExerciceAffixesRacines): SectionExercice {
  return { enteteFragments: entetePapier(e), questions: phasesPourExercice(e).map((phase) => ({ consigne: consigneEtape(e, phase) })) };
}

function enoncePapier(e: ExerciceAffixesRacines): EnoncePapier {
  return { section: { enteteFragments: entetePapier(e), questions: [] } };
}

function construireCorrection(e: ExerciceAffixesRacines): BlocCorrection[] {
  return phasesPourExercice(e).map((phase, i) => ({
    type: "paragraphe",
    fragments: [texte(`${LETTRES[i]}) ${LIBELLE_PHASE[phase]} : `), latex(formatReponseAttenduePhaseLatex(e, phase).join(",\\ "))],
  }));
}

// ============================================================================
// Corrigé détaillé
// ============================================================================

function correctionA(e: Exo<"A">): EtapeCorrection[] {
  const zz = z(e.a, e.b);
  const zb = z(e.a, -e.b);
  const somme = z(e.somme.re, e.somme.im);
  const diff = z(e.difference.re, e.difference.im);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Le conjugué change le signe de la partie imaginaire : "), latex(`\\bar z=${zb}`), texte(".")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`z+\\bar z=(${zz})+(${zb})=${somme}`)] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`z-\\bar z=(${zz})-(${zb})=${diff}`)] },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`z+\\bar z=${somme}`), texte(" (un réel : deux fois la partie réelle) et "), latex(`z-\\bar z=${diff}`), texte(" (un imaginaire pur : deux fois la partie imaginaire, multipliée par "), latex("i"), texte(").")] },
    { label: "Piège", fragments: [latex(`z-\\bar z=${diff}`), texte(" garde son "), latex("i"), texte(" : écrire "), latex(`${2 * e.b}`), texte(" (sans "), latex("i"), texte(") est faux.")] },
  ];
}

function correctionB(e: Exo<"B">): EtapeCorrection[] {
  const zA = { re: e.reA2 / 2, im: e.imA2 / 2 };
  const zB = { re: e.reB2 / 2, im: e.imB2 / 2 };
  const zC = { re: e.reC2 / 2, im: e.imC2 / 2 };
  const zD = { re: e.reD2 / 2, im: e.imD2 / 2 };
  const figure = planComplexeSvg({
    points: [
      { v: zA, nom: "A" },
      { v: zB, nom: "B" },
      { v: zC, nom: "C" },
      { v: zD, nom: "D", couleur: COUL.accent },
    ],
    polygone: [zA, zB, zC, zD],
    segments: [
      { de: zA, a: zC, pointilles: true, couleur: COUL.doux },
      { de: zB, a: zD, pointilles: true, couleur: COUL.doux },
    ],
    libelle: "Parallélogramme ABCD dans le plan complexe, diagonales en pointillés",
  });
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("Dans un parallélogramme ABCD, les diagonales [AC] et [BD] ont le même milieu : "), latex("\\dfrac{z_A+z_C}{2}=\\dfrac{z_B+z_D}{2}\\iff z_D=z_A-z_B+z_C")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`z_D=(${z(zA.re, zA.im)})-(${z(zB.re, zB.im)})+(${z(zC.re, zC.im)})=(${zA.re}-${p(zB.re)}+${p(zC.re)})+(${zA.im}-${p(zB.im)}+${p(zC.im)})\\,i=${z(zD.re, zD.im)}`)] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(attendu(e, 1))], figureHtml: figure },
    { label: "Piège", fragments: [texte("L'ordre des sommets compte : D est opposé à B, d'où "), latex("z_D=z_A+z_C-z_B"), texte(". Le calcul "), latex("z_A+z_B-z_C"), texte(" donne un autre parallélogramme (ACBD).")] },
  ];
}

function correctionC(e: Exo<"C">): EtapeCorrection[] {
  const xP = e.xPositif;
  const y = e.yDeduit;
  const z1 = z(xP, y);
  const z2 = z(-xP, -y);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("On cherche "), latex("x+yi"), texte(" tel que "), latex(`(x+yi)^2=${z(e.a, e.b)}`), texte(" : on identifie les parties réelles, les parties imaginaires et les modules (le module d'un carré est le carré du module).")] },
    {
      label: "Calcul",
      sousQuestion: "a",
      fragments: [latex(`(x+yi)^2=(x^2-y^2)+2xy\\,i`), texte(" et "), latex(`\\left|${z(e.a, e.b)}\\right|=\\sqrt{${p(e.a)}^2+${p(e.b)}^2}=${e.module}`), texte(", d'où le système "), latex(`\\begin{cases}x^2-y^2=${e.a}\\\\ 2xy=${e.b}\\\\ x^2+y^2=${e.module}\\end{cases}`)],
    },
    { label: "Calcul", sousQuestion: "b", fragments: [texte("En additionnant la 1re et la 3e équation : "), latex(`2x^2=${e.a}+${e.module}=${2 * xP * xP}`), texte(", donc "), latex(`x^2=${xP * xP}`), texte(" et "), latex(`x=${xP}`), texte(" ou "), latex(`x=${-xP}`), texte(".")] },
    { label: "Calcul", sousQuestion: "c", fragments: [texte("La 2e équation donne "), latex("y=\\dfrac{b}{2x}"), texte(" : pour "), latex(`x=${xP}`), texte(", "), latex(`y=\\dfrac{${e.b}}{${2 * xP}}=${y}`), texte(" ; pour "), latex(`x=${-xP}`), texte(", "), latex(`y=${-y}`), texte(".")] },
    { label: "Vérification", sousQuestion: "c", fragments: [latex(`(${z1})^2=${p(xP)}^2-${p(y)}^2+2\\cdot${p(xP)}\\cdot${p(y)}\\,i=${z(e.a, e.b)}`)] },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte("Les racines carrées de "), latex(z(e.a, e.b)), texte(" sont "), latex(`z_1=${z1}`), texte(" et "), latex(`z_2=${z2}`), texte(" (opposées l'une de l'autre).")] },
    { label: "Piège", fragments: [texte("Le signe de y n'est pas libre : "), latex("2xy=b"), texte(" l'impose. Associer "), latex(`x=${xP}`), texte(" à "), latex(`y=${-y}`), texte(" donne un nombre dont le carré vaut "), latex(z(e.a, -e.b)), texte(".")] },
  ];
}

function correctionD(e: Exo<"D">): EtapeCorrection[] {
  const zA = affixeLatex(e.zA);
  const zB = affixeLatex(e.zB);
  const milieu = affixeLatex(e.milieu);
  const diff = z(e.difference.re, e.difference.im);
  const figure = planComplexeSvg({
    points: [
      { v: e.zA, nom: "A" },
      { v: e.zB, nom: "B" },
      { v: e.milieu, nom: "M", couleur: COUL.accent },
    ],
    segments: [{ de: e.zA, a: e.zB }],
    libelle: "Segment [AB] et son milieu M dans le plan complexe",
  });
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte("L'affixe du milieu est la moyenne des affixes des extrémités : "), latex("z_M=\\dfrac{z_A+z_B}{2}")] },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(`z_M=\\dfrac{(${zA})+(${zB})}{2}=\\dfrac{${z(e.zA.re + e.zB.re, e.zA.im + e.zB.im)}}{2}=${milieu}`)] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("La distance AB est le module de "), latex("z_B-z_A"), texte(" : "), latex("AB=|z_B-z_A|=\\sqrt{x^2+y^2}\\ \\text{ si }\\ z_B-z_A=x+yi")] },
    { label: "Calcul", sousQuestion: "b", fragments: [latex(`z_B-z_A=(${zB})-(${zA})=${diff}`), texte(", puis "), latex(`AB=\\sqrt{${p(e.difference.re)}^2+${p(e.difference.im)}^2}=\\sqrt{${e.distance * e.distance}}=${e.distance}`), texte(".")] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`z_M=${milieu}`), texte(" et "), latex(`AB=${e.distance}`)], figureHtml: figure },
    { label: "Piège", fragments: [texte("AB est le module de la différence : "), latex("|z_B-z_A|\\neq|z_B|-|z_A|"), texte(". Pour le milieu, les deux parties se divisent par 2.")] },
  ];
}

function correctionDetaillee(e: ExerciceAffixesRacines): EtapeCorrection[] {
  switch (e.famille) {
    case "A":
      return correctionA(e);
    case "B":
      return correctionB(e);
    case "C":
      return correctionC(e);
    case "D":
      return correctionD(e);
  }
}

// ============================================================================
// Réponse brève, difficulté, barème
// ============================================================================

function reponseBreve(e: ExerciceAffixesRacines): FragmentConsigne[] {
  switch (e.famille) {
    case "A":
      return [latex(attendu(e, 0))];
    case "B":
      return [latex(attendu(e, 1))];
    case "C":
      return [latex(`z_1=${z(e.xPositif, e.yDeduit)}`), texte(" et "), latex(`z_2=${z(-e.xPositif, -e.yDeduit)}`)];
    case "D":
      return [latex(`z_M=${affixeLatex(e.milieu)}`), texte(" et "), latex(`AB=${e.distance}`)];
  }
}

function difficulte(e: ExerciceAffixesRacines): 1 | 2 | 3 {
  switch (e.famille) {
    case "A":
      return 1;
    case "B":
    case "D":
      return 2;
    case "C":
      return 3;
  }
}

const crit = (sousQuestion: string, points: number, ...critere: FragmentConsigne[]) => ({ sousQuestion, points, critere });

function bareme(e: ExerciceAffixesRacines): BaremeExercice {
  const reponseFinale = reponseBreve(e);
  switch (e.famille) {
    case "A":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1, texte("Conjugué : "), latex(`\\bar z=${z(e.a, -e.b)}`)),
          crit("a", 1.5, latex(`z+\\bar z=${z(e.somme.re, e.somme.im)}`)),
          crit("a", 1.5, latex(`z-\\bar z=${z(e.difference.re, e.difference.im)}`)),
        ],
        erreursFrequentes: [
          { description: [latex("z-\\bar z"), texte(" écrit sans le "), latex("i"), texte(" (réel au lieu d'imaginaire pur)")], cout: "−1" },
          { description: [texte("Conjugué qui change aussi le signe de la partie réelle")], cout: "−1" },
        ],
      };
    case "B":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Relation "), latex("z_D=z_A-z_B+z_C"), texte(" (diagonales de même milieu)")),
          crit("b", 1, texte("Partie réelle de "), latex("z_D"), texte(" : "), latex(`${e.reD2 / 2}`)),
          crit("b", 1, texte("Partie imaginaire de "), latex("z_D"), texte(" : "), latex(`${e.imD2 / 2}`)),
          crit("b", 0.5, texte("Affixe écrite sous la forme "), latex("a+bi")),
        ],
        erreursFrequentes: [{ description: [texte("Relation "), latex("z_D=z_A+z_B-z_C"), texte(" (mauvais sommet opposé)")], cout: "0 pt sur a)" }],
      };
    case "C":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Système : parties réelles, imaginaires et modules ("), latex(`x^2+y^2=${e.module}`), texte(")")),
          crit("b", 1, latex(`x=\\pm${e.xPositif}`)),
          crit("c", 1.5, texte("y déduit de "), latex("2xy=b"), texte(" et les 2 racines opposées")),
        ],
        erreursFrequentes: [
          { description: [texte("Une seule racine donnée (l'opposée oubliée)")], cout: "−1" },
          { description: [texte("Signe de y choisi sans utiliser "), latex("2xy=b")], cout: "−1" },
          { description: [texte("Module pris égal à "), latex("a^2+b^2"), texte(" (racine carrée oubliée)")], cout: "0 pt sur a)" },
        ],
      };
    case "D":
      return {
        reponseFinale,
        criteres: [
          crit("a", 1.5, texte("Milieu : "), latex(`z_M=${affixeLatex(e.milieu)}`)),
          crit("b", 1, texte("Différence : "), latex(`z_B-z_A=${z(e.difference.re, e.difference.im)}`)),
          crit("b", 1.5, texte("Distance : module, "), latex(`AB=${e.distance}`)),
        ],
        erreursFrequentes: [
          { description: [texte("Somme des affixes non divisée par 2")], cout: "−1" },
          { description: [latex("|z_B|-|z_A|"), texte(" au lieu de "), latex("|z_B-z_A|")], cout: "−1,5" },
        ],
      };
  }
}

export const adaptateurEvaluationAffixesRacines: AdaptateurFeuilleExercices<ExerciceAffixesRacines> = {
  profilInstance: profilAffixesRacines,
  libelleCasParticulier: LIBELLE_CAS_AFFIXES_RACINES,
  titreDocument: "Nombres complexes : affixes et racines carrées — Évaluation",
  nomFichierBase: "affixes-racines",
  genererInstance: genererExerciceAffixesRacines,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteAffixesRacines),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};
