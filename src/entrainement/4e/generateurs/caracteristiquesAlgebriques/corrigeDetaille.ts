import type {
  ExerciceCaracteristiquesAlgebriques,
  ExerciceCaracteristiquesAlgebriquesNiveau1,
  ExerciceCaracteristiquesAlgebriquesNiveau2,
  PhaseCaracteristiquesAlgebriques,
  ReponseDomaine,
} from "../../core/caracteristiquesAlgebriques.types";
import type { FamilleReference } from "../../core/fonctionsReference.types";
import type { Morceau } from "../../core/inequation.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import {
  brancheEstValide,
  ceAttendues,
  domaineAttendu,
  equationIsoleeAdmetSolution,
  existeOrdonneeNiveau1,
  necessiteSeparation,
  pariteAttendue,
  racineRespecteCondition,
  racinesAValiderRacineCarree,
  zerosAttendus,
  zerosNiveau1,
} from "../../moteur/verificationCaracteristiquesAlgebriques";
import {
  formatBaseLatex,
  formatCEAttenduesLatex,
  formatConditionLatex,
  formatConditionNegeeLatex,
  formatEquationDebarrasseeLatex,
  formatEquationDeveloppeeLatex,
  formatEquationIsoleeLatex,
  formatEquationRechercheZerosLatex,
  formatEquationsSepareesLatex,
  formatFractionLatex,
  formatOrdonneeExacteLatex,
  formatP1Latex,
  formatPariteLabel,
  formatValeurExacteLatex,
  racinesExactesQuadratiqueLatex,
  termesZerosExactsLatex,
} from "../../ui/formatCaracteristiquesAlgebriques";
import { COURS_ALGEBRE, lignesPremierDegre, nombreTexte, plusQ, polynome, q, qp, racineCarreeLatex, racineCubiqueLatex, rationnel, sansDoublons, somme } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen13 (étudier algébriquement une fonction de
 * référence, niveaux 1 et 2) — règle `.claude/rules/feuilles-evaluations.md`. Une étape par écran,
 * dans l'ordre de la session : CE, domaine, ordonnée à l'origine, parité (niveau 1) ou isolement,
 * puis les étapes propres à la famille (séparation / « se débarrasser », condition de validité,
 * équation regroupée, branches, zéros, validation). Valeurs tirées du moteur de l'écran
 * (`verificationCaracteristiquesAlgebriques.ts`) et de ses formats ; partagé par l'adaptateur et
 * l'appli.
 */

type N1 = ExerciceCaracteristiquesAlgebriquesNiveau1;
type N2 = ExerciceCaracteristiquesAlgebriquesNiveau2;
type Instance = ExerciceCaracteristiquesAlgebriques;

// ---------------------------------------------------------------------------------------------
// Lettres d'étape (ordre des écrans)
// ---------------------------------------------------------------------------------------------

export type EtapeGen13 = "ce" | "domaine" | "ordonnee" | "parite" | "isolement" | "intermediaire" | "validite" | "regroupe" | "branches" | "zeros" | "validation";

const LETTRES = "abcdefghij";

export function etapesCaracteristiquesAlgebriques(e: Instance): EtapeGen13[] {
  if (e.niveau === "niveau1") return ["ce", "domaine", "ordonnee", "parite", "isolement", ...(equationIsoleeAdmetSolution(e) ? (["intermediaire"] as const) : []), "zeros"];
  const base: EtapeGen13[] = ["ce", "domaine", "ordonnee", "isolement"];
  switch (e.famille) {
    case "carre":
    case "cube":
      return [...base, "zeros"];
    case "inverse":
    case "racine_cubique":
      return [...base, "regroupe", "zeros"];
    case "racine_carree":
      return [...base, "validite", "regroupe", "zeros", "validation"];
    case "valeur_absolue":
      return [...base, "validite", "branches", "validation", "zeros"];
  }
}

function lettre(e: Instance, etape: EtapeGen13): string {
  return LETTRES[etapesCaracteristiquesAlgebriques(e).indexOf(etape)]!;
}

/** Lettre du corrigé correspondant à un écran (phase) de l'appli. */
export function lettrePhaseCaracteristiquesAlgebriques(e: Instance, phase: PhaseCaracteristiquesAlgebriques): string {
  const etape: EtapeGen13 =
    phase === "separation" || phase === "debarrasser" ? "intermediaire" : phase === "resolutionBranches" ? "branches" : phase === "validationSolution" ? "validation" : (phase as EtapeGen13);
  return lettre(e, etape);
}

// ---------------------------------------------------------------------------------------------
// Écritures
// ---------------------------------------------------------------------------------------------

function formatMorceauLatex(m: Morceau): string {
  const gauche = typeof m.borneGauche === "number" ? formatValeurExacteLatex(m.borneGauche) : "-\\infty";
  const droite = typeof m.borneDroite === "number" ? formatValeurExacteLatex(m.borneDroite) : "+\\infty";
  return `${m.crochetGauche}${gauche} \\;;\\; ${droite}${m.crochetDroit}`;
}

export function formatDomaineAttenduLatex(domaine: ReponseDomaine): string {
  switch (domaine.forme) {
    case "reel":
      return "\\mathbb{R}";
    case "vide":
      return "\\varnothing";
    case "prive_points":
      return `\\mathbb{R} \\setminus \\{${domaine.points.map(formatValeurExacteLatex).join(" ; ")}\\}`;
    case "intervalles":
      return domaine.intervalles.map(formatMorceauLatex).join(" \\cup ");
  }
}

export function domaineLatex(e: Instance): string {
  return `\\mathrm{dom}\\,f = ${formatDomaineAttenduLatex(domaineAttendu(e))}`;
}

/** Valeur exacte de la fonction de référence en un rationnel v (`null` hors domaine). */
function baseEn(famille: FamilleReference, v: number): string | null {
  switch (famille) {
    case "carre":
      return q(v * v);
    case "cube":
      return q(v * v * v);
    case "valeur_absolue":
      return q(Math.abs(v));
    case "racine_carree":
      return v < 0 ? null : racineCarreeLatex(v);
    case "racine_cubique":
      return racineCubiqueLatex(v);
    case "inverse":
      return v === 0 ? null : q(1 / v);
  }
}

function baseNum(famille: FamilleReference, v: number): number {
  switch (famille) {
    case "carre":
      return v * v;
    case "cube":
      return v ** 3;
    case "valeur_absolue":
      return Math.abs(v);
    case "racine_carree":
      return Math.sqrt(v);
    case "racine_cubique":
      return Math.cbrt(v);
    case "inverse":
      return 1 / v;
  }
}

/** Fonction de référence appliquée à un nombre, écrite sans parenthèse superflue. */
function baseNombreLatex(famille: FamilleReference, v: number): string {
  switch (famille) {
    case "carre":
      return `${qp(v)}^2`;
    case "cube":
      return `${qp(v)}^3`;
    case "valeur_absolue":
      return `|${q(v)}|`;
    case "racine_carree":
      return `\\sqrt{${q(v)}}`;
    case "racine_cubique":
      return `\\sqrt[3]{${q(v)}}`;
    case "inverse":
      return `\\dfrac{1}{${q(v)}}`;
  }
}

/** Coefficient devant « · valeur » : « », « - », « 3\\cdot ». */
function coefCdot(c: number): string {
  return c === 1 ? "" : c === -1 ? "-" : `${c}\\cdot `;
}

const NOM_BASE: Record<FamilleReference, string> = {
  carre: "le carré",
  cube: "le cube",
  racine_carree: "la racine carrée",
  racine_cubique: "la racine cubique",
  inverse: "l'inverse",
  valeur_absolue: "la valeur absolue",
};

function kValeur(e: N1): number {
  return e.k.num / e.k.den;
}

/** Terme ajouté à la fonction de référence (« + \frac{1}{2} », « + 3x - 2 »). */
function termeAjoute(e: Instance): string {
  if (e.niveau === "niveau1") return plusQ(kValeur(e));
  const s = somme([
    [e.c, "x"],
    [e.d, ""],
  ]);
  return s.startsWith("-") ? s : `+${s}`;
}

// ---------------------------------------------------------------------------------------------
// Étapes communes : CE, domaine, ordonnée à l'origine
// ---------------------------------------------------------------------------------------------

function etapeCE(e: Instance): EtapeCorrection[] {
  const L = lettre(e, "ce");
  const { famille, a, b } = e;
  const p1 = formatP1Latex(a, b);
  const conditions = ceAttendues(e);
  let lignes: LigneCalcul[];
  if (famille === "racine_carree" || famille === "inverse") {
    const rel = famille === "inverse" ? "\\neq" : "\\geq";
    const relFinal = famille === "inverse" ? "\\neq" : a > 0 ? "\\geq" : "\\leq";
    lignes = [ligne(`${p1}${rel} 0`, famille === "inverse" ? "le dénominateur ne peut pas être nul" : "le radicande est positif ou nul")];
    if (b !== 0) lignes.push(ligne(`${a === 1 ? "" : a === -1 ? "-" : a}x${rel} ${-b}`, b > 0 ? `on soustrait ${b}` : `on ajoute ${-b}`));
    if (a !== 1) lignes.push(ligne(`x${relFinal} ${formatValeurExacteLatex(-b / a)}`, famille === "racine_carree" && a < 0 ? `on divise par ${nombreTexte(a)} < 0 : le sens de l'inégalité s'inverse` : `on divise par ${nombreTexte(a)}`));
  } else {
    lignes = [ligne("x\\in\\mathbb{R}", `${NOM_BASE[famille]} existe pour tout réel : aucune condition`)];
  }
  return [
    utilise(L, [texte(`Seuls un dénominateur (non nul) et une racine carrée (radicande positif ou nul) imposent une condition d'existence ; le carré, le cube, la racine cubique et la valeur absolue n'en imposent aucune ${COURS_ALGEBRE}.`)]),
    calcul(L, lignes),
    resultat(L, conditions.length === 0 ? [texte("Aucune condition d'existence.")] : [latex(formatCEAttenduesLatex(conditions) as string)]),
    ...(famille === "racine_carree" && a < 0 ? [piege(L, [texte("a est négatif : en divisant l'inégalité par a, son sens s'inverse — le domaine est une demi-droite tournée vers la gauche.")])] : []),
    ...(famille === "cube" || famille === "racine_cubique" ? [piege(L, [texte(`${famille === "cube" ? "Le cube" : "La racine cubique"} n'impose aucune condition : ne pas exclure de valeur du domaine.`)])] : []),
  ];
}

function etapeDomaine(e: Instance): EtapeCorrection[] {
  const L = lettre(e, "domaine");
  const { famille, a, b } = e;
  const p = -b / a;
  const lignes: LigneCalcul[] =
    famille === "racine_carree"
      ? [ligne(`\\mathrm{dom}\\,f=\\{x\\in\\mathbb{R}\\mid x${a > 0 ? "\\geq" : "\\leq"} ${formatValeurExacteLatex(p)}\\}`, "les réels qui respectent la CE"), ligne(`=${formatDomaineAttenduLatex(domaineAttendu(e))}`, "borne incluse : le radicande peut valoir 0")]
      : famille === "inverse"
        ? [ligne(`\\mathrm{dom}\\,f=${formatDomaineAttenduLatex(domaineAttendu(e))}`, "on retire la valeur qui annule le dénominateur")]
        : [ligne("\\mathrm{dom}\\,f=\\mathbb{R}", "aucune condition d'existence")];
  return [
    utilise(L, [texte("Le domaine de définition est l'ensemble des réels qui respectent les conditions d'existence.")]),
    calcul(L, lignes),
    resultat(L, [latex(domaineLatex(e))]),
    ...(famille === "inverse" ? [piege(L, [texte("La valeur qui annule le dénominateur est exclue du domaine : elle ne peut être ni l'abscisse d'un point du graphique, ni un zéro.")])] : []),
  ];
}

function etapeOrdonnee(e: Instance): EtapeCorrection[] {
  const L = lettre(e, "ordonnee");
  const { famille, a, b } = e;
  const k = e.niveau === "niveau1" ? kValeur(e) : e.d;
  const plusK = plusQ(k);
  const lignes: LigneCalcul[] = [];
  const existe = existeOrdonneeNiveau1(e);
  if (!existe) {
    lignes.push(
      ligne(`${a}\\cdot 0${plusQ(b)}=${b}`, famille === "inverse" ? "le dénominateur s'annule en x = 0" : "le radicande est négatif en x = 0"),
      ligne("0\\notin\\mathrm{dom}\\,f", "f(0) n'existe pas"),
    );
  } else {
    const ordonnee = formatOrdonneeExacteLatex(e)!;
    const cx = e.niveau === "niveau2" ? `${plusQ(e.c)}\\cdot 0` : "";
    lignes.push(ligne(`f(0)=${formatBaseLatex(famille, `${a}\\cdot 0${plusQ(b)}`)}${cx}${plusK}`, "on remplace x par 0"));
    lignes.push(ligne(`=${baseNombreLatex(famille, b)}${plusK}`, "le terme en x s'annule"));
    const vb = baseEn(famille, b);
    if (vb !== null) lignes.push(ligne(`=${vb}${plusK}`, `on calcule ${NOM_BASE[famille]}`));
    lignes.push(ligne(`=${ordonnee}`));
  }
  return [
    utilise(L, [texte("L'ordonnée à l'origine est "), latex("f(0)"), texte(", si 0 appartient au domaine.")]),
    calcul(L, sansDoublons(lignes)),
    resultat(L, existe ? [latex(`f(0) = ${formatOrdonneeExacteLatex(e)}`)] : [texte("Pas d'ordonnée à l'origine : "), latex("0 \\notin \\mathrm{dom}\\,f"), texte(".")]),
    ...(!existe ? [piege(L, [texte("Ne pas calculer f(0) sans vérifier d'abord que 0 appartient au domaine.")])] : []),
  ];
}

// ---------------------------------------------------------------------------------------------
// Niveau 1
// ---------------------------------------------------------------------------------------------

function valeurEn(e: N1, t: number): { latex: string; brut: string; num: number } | null {
  const v = baseEn(e.famille, e.a * t + e.b);
  if (v === null) return null;
  const num = baseNum(e.famille, e.a * t + e.b) + kValeur(e);
  return { brut: `${formatBaseLatex(e.famille, `${e.a}\\cdot ${qp(t)}${plusQ(e.b)}`)}${plusQ(kValeur(e))}`, latex: `${v}${plusQ(kValeur(e))}`, num };
}

function etapeParite(e: N1): EtapeCorrection[] {
  const L = lettre(e, "parite");
  const { famille, a, b } = e;
  const k = kValeur(e);
  const kT = plusQ(k);
  const parite = pariteAttendue(e);
  let lignes: LigneCalcul[];
  if (famille === "racine_carree") {
    const p = -b / a;
    const t = a > 0 ? Math.abs(p) + 1 : -(Math.abs(p) + 1);
    lignes = [ligne(`${q(t)}\\in\\mathrm{dom}\\,f`, `le radicande vaut ${nombreTexte(a * t + b)}, positif`), ligne(`${q(-t)}\\notin\\mathrm{dom}\\,f`, `le radicande vaut ${nombreTexte(-a * t + b)}, négatif : le domaine n'est pas symétrique par rapport à 0`)];
  } else if (famille === "inverse" && b !== 0) {
    const p = -b / a;
    lignes = [ligne(`${q(-p)}\\in\\mathrm{dom}\\,f`, "le dénominateur ne s'annule pas"), ligne(`${q(p)}\\notin\\mathrm{dom}\\,f`, "valeur interdite : le domaine n'est pas symétrique par rapport à 0")];
  } else if (b !== 0) {
    // Contre-exemple numérique : f(−t) ≠ f(t) et f(−t) ≠ −f(t).
    let t = 1;
    for (; t <= 4; t++) {
      const v1 = valeurEn(e, t)!;
      const v2 = valeurEn(e, -t)!;
      if (Math.abs(v1.num - v2.num) > 1e-9 && Math.abs(v1.num + v2.num) > 1e-9) break;
    }
    const v1 = valeurEn(e, t)!;
    const v2 = valeurEn(e, -t)!;
    lignes = [
      ligne(`f(${t})=${v1.brut}`),
      ligne(`=${v1.latex}`),
      ...(rationnel(v1.num) !== null && q(v1.num) !== v1.latex ? [ligne(`=${q(v1.num)}`)] : []),
      ligne(`f(-${t})=${v2.brut}`),
      ligne(`=${v2.latex}`),
      ...(rationnel(v2.num) !== null && q(v2.num) !== v2.latex ? [ligne(`=${q(v2.num)}`)] : []),
      ligne(`f(-${t})\\neq f(${t})`, [texte("et "), latex(`f(-${t})\\neq -f(${t})`), texte(" : un contre-exemple suffit")]),
    ];
  } else {
    const fx = `${formatBaseLatex(famille, formatP1Latex(a, 0))}`;
    const fMoinsX = `${formatBaseLatex(famille, formatP1Latex(-a, 0))}`;
    if (famille === "carre" || famille === "valeur_absolue") {
      lignes = [ligne(`f(-x)=${fMoinsX}${kT}`, "on remplace x par −x"), ligne(`=${fx}${kT}`, famille === "carre" ? "(−u)² = u²" : "|−u| = |u|"), ligne("=f(x)")];
    } else if (k === 0) {
      lignes = [ligne(`f(-x)=${fMoinsX}`, "on remplace x par −x"), ligne(`=-${fx}`, `${NOM_BASE[famille]} est impaire`), ligne("=-f(x)")];
    } else {
      lignes = [
        ligne(`f(-x)=${fMoinsX}${kT}`, "on remplace x par −x"),
        ligne(`=-${fx}${kT}`, `${NOM_BASE[famille]} est impaire`),
        ligne(`-f(x)=-${fx}${plusQ(-k)}`, [texte("diffère de "), latex("f(-x)"), texte(" par la constante, et "), latex("f(-x)\\neq f(x)"), texte(" aussi")]),
      ];
    }
  }
  return [
    utilise(L, [texte("f est paire si son domaine est symétrique par rapport à 0 et "), latex("f(-x)=f(x)"), texte(" ; impaire si "), latex("f(-x)=-f(x)"), texte(`. Un seul contre-exemple suffit pour conclure « ni l'une ni l'autre » ${COURS_ALGEBRE}.`)]),
    calcul(L, lignes),
    resultat(L, [texte(parite === "ni" ? "f n'est ni paire ni impaire." : `f est ${formatPariteLabel(parite)}.`)]),
    ...(b === 0 && famille !== "carre" && famille !== "valeur_absolue" && famille !== "racine_carree" && k !== 0 ? [piege(L, [texte("La fonction de référence est impaire, mais la constante ajoutée détruit cette imparité.")])] : []),
    ...((famille === "carre" || famille === "valeur_absolue") && b !== 0 ? [piege(L, [texte("La fonction de référence est paire, mais le décalage dans la parenthèse déplace l'axe de symétrie : f n'est pas paire.")])] : []),
  ];
}

function etapeIsolementN1(e: N1): EtapeCorrection[] {
  const L = lettre(e, "isolement");
  const k = kValeur(e);
  return [
    utilise(L, [texte("On résout f(x) = 0 : la constante passe dans l'autre membre, avec le signe opposé.")]),
    calcul(L, [ligne(formatEquationRechercheZerosLatex(e), "f(x) = 0"), ligne(formatEquationIsoleeLatex(e), k > 0 ? `on soustrait ${nombreTexte(k)} aux deux membres` : `on ajoute ${nombreTexte(-k)} aux deux membres`)]),
    resultat(L, [latex(formatEquationIsoleeLatex(e))]),
    piege(L, [texte("La constante change de signe en passant dans l'autre membre.")]),
  ];
}

function etapeIntermediaireN1(e: N1): EtapeCorrection[] {
  const L = lettre(e, "intermediaire");
  const { famille, a, b } = e;
  const K = -kValeur(e);
  const p1 = formatP1Latex(a, b);
  const Kl = q(K);
  let lignes: LigneCalcul[];
  let propriete: string;
  switch (famille) {
    case "carre":
      propriete = "u^2 = K \\;(K>0) \\iff u = \\sqrt{K} \\text{ ou } u = -\\sqrt{K}";
      lignes = [ligne(`\\sqrt{${Kl}}=${racineCarreeLatex(K)}`, "racine carrée du membre de droite"), ligne(`${p1}=${racineCarreeLatex(K)}`, "première équation"), ligne(`${p1}=-${racineCarreeLatex(K)}`, "ou seconde équation")];
      break;
    case "valeur_absolue":
      propriete = "|u| = K \\;(K>0) \\iff u = K \\text{ ou } -u = K";
      lignes = [ligne(`${p1}=${Kl}`, "première équation"), ligne(`${formatP1Latex(-a, -b)}=${Kl}`, "ou seconde équation : −u = K")];
      break;
    case "inverse":
      propriete = "\\dfrac{1}{u} = K \\iff 1 = K \\cdot u";
      lignes = [ligne(formatEquationDebarrasseeLatex(e), "on multiplie les deux membres par le dénominateur, non nul (CE)")];
      break;
    case "racine_carree":
      propriete = "\\sqrt{u} = K \\;(K \\geq 0) \\iff u = K^2";
      lignes = [ligne(`${p1}=${qp(K)}^2`, "on élève les deux membres au carré"), ligne(`=${q(K * K)}`)];
      break;
    case "racine_cubique":
      propriete = "\\sqrt[3]{u} = K \\iff u = K^3";
      lignes = [ligne(`${p1}=${qp(K)}^3`, "on élève les deux membres au cube"), ligne(`=${q(K ** 3)}`)];
      break;
    case "cube":
      propriete = "u^3 = K \\iff u = \\sqrt[3]{K}";
      lignes = [ligne(`${p1}=\\sqrt[3]{${Kl}}`, "on prend la racine cubique des deux membres"), ligne(`=${racineCubiqueLatex(K)}`)];
      break;
  }
  return [
    utilise(L, [latex(propriete), texte(` ${COURS_ALGEBRE}.`)]),
    calcul(L, sansDoublons(lignes)),
    resultat(L, [latex(necessiteSeparation(e) ? formatEquationsSepareesLatex(e) : formatEquationDebarrasseeLatex(e))]),
    ...((famille === "carre" || famille === "valeur_absolue") && zerosNiveau1(e).length === 2
      ? [piege(L, [texte(`${famille === "carre" ? "Un carré" : "Une valeur absolue"} égal à un nombre positif donne deux équations : ne pas oublier celle avec le signe moins.`)])]
      : []),
  ];
}

function etapeZerosN1(e: N1): EtapeCorrection[] {
  const L = lettre(e, "zeros");
  const { famille, a, b } = e;
  const K = -kValeur(e);
  const zeros = zerosNiveau1(e);
  if (zeros.length === 0) {
    return [
      utilise(L, [texte(`Un carré, une valeur absolue ou une racine carrée n'est jamais négatif ${COURS_ALGEBRE}.`)]),
      calcul(L, [ligne(`${formatEquationIsoleeLatex(e)}`, "équation isolée"), ligne(`${q(K)}<0`, `${NOM_BASE[famille]} ne peut pas valoir un nombre négatif : aucune solution`)]),
      resultat(L, [texte("Aucun zéro.")]),
      piege(L, [texte("Ne pas « résoudre » quand même l'équation isolée : elle n'a aucune solution, il n'y a rien à calculer.")]),
    ];
  }
  // Valeur V de chaque équation du premier degré a·x + b = V.
  const valeurs: number[] =
    famille === "carre"
      ? [Math.sqrt(K), -Math.sqrt(K)]
      : famille === "valeur_absolue"
        ? [K, -K]
        : famille === "inverse"
          ? [1 / K]
          : famille === "racine_carree"
            ? [K * K]
            : famille === "racine_cubique"
              ? [K ** 3]
              : [Math.cbrt(K)];
  const lignes: LigneCalcul[] = [];
  if (famille === "inverse") lignes.push(ligne(formatEquationDebarrasseeLatex(e), "équation obtenue"), ligne(`${formatP1Latex(a, b)}=\\dfrac{1}{${q(K)}}`, `on divise par ${nombreTexte(K)}`));
  for (const V of valeurs) {
    const exact = rationnel(V) !== null;
    if (!exact && famille === "carre") {
      // V irrationnel (√K non rationnel) : on garde l'écriture exacte.
      const r = V > 0 ? racineCarreeLatex(K) : `-${racineCarreeLatex(K)}`;
      lignes.push(ligne(`${formatP1Latex(a, b)}=${r}`), ligne(`${a === 1 ? "" : a === -1 ? "-" : a}x=${r}${plusQ(-b)}`, `on ${b > 0 ? "soustrait" : "ajoute"} ${nombreTexte(Math.abs(b))}`));
      continue;
    }
    lignes.push(...lignesPremierDegre(a, b, V, "x", famille !== "inverse"));
  }
  const z = zeros[0]!;
  return [
    utilise(L, [texte("On résout chaque équation du premier degré : on soustrait b, puis on divise par a.")]),
    calcul(L, lignes),
    resultat(L, [latex(termesZerosExactsLatex(e, zeros)!.join(" \\text{ ; } "))]),
    verification(L, [texte("On remplace x par "), latex(formatValeurExacteLatex(z)), texte(" dans f :")], [ligne(`f\\left(${formatValeurExacteLatex(z)}\\right)=${formatBaseLatex(famille, q(a * z + b))}${plusQ(-K)}`, "on calcule d'abord ax + b"), ligne("=0", "✓")]),
  ];
}

function correctionNiveau1(e: N1): EtapeCorrection[] {
  return [
    ...etapeCE(e),
    ...etapeDomaine(e),
    ...etapeOrdonnee(e),
    ...etapeParite(e),
    ...etapeIsolementN1(e),
    ...(equationIsoleeAdmetSolution(e) ? etapeIntermediaireN1(e) : []),
    ...etapeZerosN1(e),
  ];
}

// ---------------------------------------------------------------------------------------------
// Niveau 2
// ---------------------------------------------------------------------------------------------

function moinsCxD(e: N2): string {
  return somme([
    [-e.c, "x"],
    [-e.d, ""],
  ]);
}

function cxD(e: N2): string {
  return somme([
    [e.c, "x"],
    [e.d, ""],
  ]);
}

function etapeIsolementN2(e: N2): EtapeCorrection[] {
  const L = lettre(e, "isolement");
  const { famille, a, b } = e;
  const depart = formatEquationRechercheZerosLatex(e);
  let lignes: LigneCalcul[];
  if (famille === "carre") {
    lignes = [
      ligne(depart, "f(x) = 0"),
      ligne(`${somme([[a * a, "x^2"], [2 * a * b, "x"], [b * b, ""]])}${termeAjoute(e)}=0`, "(u + v)² = u² + 2uv + v²"),
      ligne(formatEquationDeveloppeeLatex(e), "on regroupe les termes semblables"),
    ];
  } else if (famille === "cube") {
    lignes = [
      ligne(depart, "f(x) = 0"),
      ligne(`${somme([[a ** 3, "x^3"], [3 * a * a * b, "x^2"], [3 * a * b * b, "x"], [b ** 3, ""]])}${termeAjoute(e)}=0`, "(u + v)³ = u³ + 3u²v + 3uv² + v³"),
      ligne(formatEquationDeveloppeeLatex(e), "on regroupe les termes semblables"),
    ];
  } else {
    lignes = [ligne(depart, "f(x) = 0"), ligne(formatEquationIsoleeLatex(e), `on fait passer ${cxD(e).replace(/-/g, "−")} dans l'autre membre`)];
  }
  return [
    utilise(L, [texte(famille === "carre" || famille === "cube" ? `On résout f(x) = 0 : on développe ${famille === "carre" ? "le carré" : "le cube"} avec l'identité remarquable, puis on regroupe tous les termes dans le même membre.` : "On résout f(x) = 0 : on isole la fonction de référence, le terme en x et la constante passent dans l'autre membre avec le signe opposé.")]),
    calcul(L, lignes),
    resultat(L, [latex(formatEquationIsoleeLatex(e))]),
    piege(
      L,
      famille === "carre"
        ? [texte("En développant le carré, ne pas oublier le double produit.")]
        : famille === "cube"
          ? [latex("(u+v)^3 = u^3 + 3u^2v + 3uv^2 + v^3"), texte(" : les deux termes du milieu sont souvent oubliés.")]
          : [texte("Les deux termes cx et d changent de signe en passant dans l'autre membre.")],
    ),
  ];
}

function lignesInegalite(coef: number, constante: number, variableLatex: string): LigneCalcul[] {
  // coef·x + constante ≥ 0
  const lignes: LigneCalcul[] = [ligne(`${variableLatex}\\geq 0`)];
  if (constante !== 0) lignes.push(ligne(`${coef === 1 ? "" : coef === -1 ? "-" : coef}x\\geq ${-constante}`, constante > 0 ? `on soustrait ${constante}` : `on ajoute ${-constante}`));
  if (coef !== 1) lignes.push(ligne(`x${coef > 0 ? "\\geq" : "\\leq"} ${formatValeurExacteLatex(-constante / coef)}`, coef < 0 ? `on divise par ${nombreTexte(coef)} < 0 : le sens s'inverse` : `on divise par ${nombreTexte(coef)}`));
  return lignes;
}

function etapeValidite(e: N2): EtapeCorrection[] {
  const L = lettre(e, "validite");
  if (e.famille === "racine_carree") {
    return [
      utilise(L, [texte("Une racine carrée est positive ou nulle : le membre de droite doit l'être aussi (condition de validité, différente du domaine) "), texte(`${COURS_ALGEBRE}.`)]),
      calcul(L, lignesInegalite(-e.c, -e.d, moinsCxD(e))),
      resultat(L, [latex(formatConditionLatex(e.conditionValidite))]),
    ];
  }
  if (e.famille === "valeur_absolue") {
    return [
      utilise(L, [texte("On distingue deux cas selon le signe de l'intérieur de la valeur absolue : "), latex("|A| = A"), texte(" si "), latex("A \\geq 0"), texte(", "), latex("|A| = -A"), texte(` sinon ${COURS_ALGEBRE}.`)]),
      calcul(L, lignesInegalite(e.a, e.b, formatP1Latex(e.a, e.b))),
      resultat(L, [latex(formatConditionLatex(e.conditionValidite))]),
    ];
  }
  return [];
}

function etapeRegroupe(e: N2): EtapeCorrection[] {
  const L = lettre(e, "regroupe");
  const { famille, a, b, c, d } = e;
  const p1 = formatP1Latex(a, b);
  let lignes: LigneCalcul[];
  let methode: string;
  if (famille === "inverse") {
    methode = "On multiplie les deux membres par le dénominateur (non nul grâce à la CE), on développe, puis on regroupe tous les termes dans le même membre.";
    lignes = [
      ligne(`1=(${moinsCxD(e)})(${p1})`, "on multiplie par le dénominateur"),
      ligne(`1=${polynome([-a * c, -(a * d + b * c), -b * d])}`, "on développe"),
      ligne(formatEquationDeveloppeeLatex(e), "on regroupe tout dans le membre de gauche"),
    ];
  } else if (famille === "racine_carree") {
    methode = "Les deux membres étant positifs (condition de validité), on les élève au carré, on développe, puis on regroupe.";
    lignes = [
      ligne(`${p1}=(${moinsCxD(e)})^2`, "on élève les deux membres au carré"),
      ligne(`${p1}=${polynome([c * c, 2 * c * d, d * d])}`, "(u + v)² = u² + 2uv + v²"),
      ligne(formatEquationDeveloppeeLatex(e), "on regroupe tout dans le même membre"),
    ];
  } else {
    methode = "On élève les deux membres au cube (sans condition : le cube est une bijection), on développe, puis on regroupe.";
    lignes = [
      ligne(`${p1}=(${moinsCxD(e)})^3`, "on élève les deux membres au cube"),
      ligne(`${p1}=${polynome([-(c ** 3), -3 * c * c * d, -3 * c * d * d, -(d ** 3)])}`, "on développe (−u)³ = −u³"),
      ligne(formatEquationDeveloppeeLatex(e), "on regroupe tout dans le même membre"),
    ];
  }
  return [
    utilise(L, [texte(`${methode.replace(/\.$/, "")} ${COURS_ALGEBRE}.`)]),
    calcul(L, lignes),
    resultat(L, [latex(formatEquationDeveloppeeLatex(e))]),
    piege(
      L,
      famille === "inverse"
        ? [texte("Multiplier par le dénominateur n'est permis que parce qu'il est non nul (CE) : ne pas l'oublier dans le domaine.")]
        : famille === "racine_carree"
          ? [texte("On élève au carré tout le membre de droite (le binôme), pas chacun de ses termes.")]
          : [texte("Élever au cube le membre de droite tout entier (le binôme), pas chacun de ses termes séparément.")],
    ),
  ];
}

function etapeBranches(e: N2): EtapeCorrection[] {
  if (e.famille !== "valeur_absolue") return [];
  const L = lettre(e, "branches");
  const { a, b, c, d } = e;
  const p1 = formatP1Latex(a, b);
  return [
    utilise(L, [texte("1re branche ("), latex(formatConditionLatex(e.conditionValidite)), texte(") : "), latex("|A| = A"), texte(" ; 2e branche ("), latex(formatConditionNegeeLatex(e.conditionValidite)), texte(") : "), latex("|A| = -A"), texte(".")]),
    calcul(L, [ligne(`${p1}=${moinsCxD(e)}`, "1re branche : |A| = A"), ligne(`${somme([[a + c, "x"]])}=${q(-d - b)}`, "termes en x à gauche, constantes à droite"), ...(a + c === 1 ? [] : [ligne(`x=${formatFractionLatex(e.racineBranche1)}`, `on divise par ${nombreTexte(a + c)}`)])], [], "1re branche"),
    calcul(L, [ligne(`-(${p1})=${moinsCxD(e)}`, "2e branche : |A| = −A"), ligne(`${p1}=${cxD(e)}`, "on multiplie par −1"), ligne(`${somme([[a - c, "x"]])}=${q(d - b)}`, "termes en x à gauche, constantes à droite"), ...(a - c === 1 ? [] : [ligne(`x=${formatFractionLatex(e.racineBranche2)}`, `on divise par ${nombreTexte(a - c)}`)])], [], "2e branche"),
    resultat(L, [latex(`x = ${formatFractionLatex(e.racineBranche1)}`), texte(" (1re branche) ; "), latex(`x = ${formatFractionLatex(e.racineBranche2)}`), texte(" (2e branche)")]),
  ];
}

/** Résolution d'une équation du second degré entière Ax² + Bx + C = 0 (méthode rapide ou Δ). */
function lignesSecondDegre(A: number, B: number, C: number, categorie: string): LigneCalcul[] {
  const delta = B * B - 4 * A * C;
  const eq = `${polynome([A, B, C])}=0`;
  if (categorie === "mise_en_evidence" && C === 0) {
    return [ligne(eq), ligne(`x(${polynome([A, B])})=0`, "on met x en évidence"), ligne("x=0", "produit nul : un facteur est nul"), ...lignesPremierDegre(A, B, 0)];
  }
  if (categorie === "binome_conjugue" && B === 0) {
    const r = -C / A;
    return [ligne(eq), ligne(`x^2=${q(r)}`, "on isole x²"), ligne(`x=-${racineCarreeLatex(r)}`, "deux nombres ont ce carré"), ligne(`x=${racineCarreeLatex(r)}`)];
  }
  if (categorie === "produit_remarquable" && delta === 0) {
    const r = -B / (2 * A);
    return [ligne(eq), ligne(`${A === 1 ? "" : A === -1 ? "-" : A}(x${r > 0 ? "-" : "+"}${q(Math.abs(r))})^2=0`, "carré parfait"), ligne(`x=${q(r)}`, "racine double")];
  }
  const lignes: LigneCalcul[] = [ligne(eq), ligne(`\\Delta=${qp(B)}^2-4\\cdot ${qp(A)}\\cdot ${qp(C)}`, "Δ = b² − 4ac"), ligne(`=${delta}`)];
  if (delta < 0) {
    lignes.push(ligne(`\\Delta=${delta}<0`, "aucune solution réelle"));
    return lignes;
  }
  if (delta === 0) {
    lignes.push(ligne(`x=\\dfrac{${-B}}{${2 * A}}`, "Δ = 0 : une racine double"), ligne(`=${q(-B / (2 * A))}`));
    return lignes;
  }
  const exactes = racinesExactesQuadratiqueLatex(A, B, C);
  const s = Math.sqrt(delta);
  const rac = Number.isInteger(s) ? String(s) : `\\sqrt{${delta}}`;
  lignes.push(ligne(`x_1=\\dfrac{${-B}-${rac}}{${2 * A}}`, "x = (−b ± √Δ) / 2a"), ligne(`=${exactes[A > 0 ? 0 : 1]!.latex}`));
  lignes.push(ligne(`x_2=\\dfrac{${-B}+${rac}}{${2 * A}}`), ligne(`=${exactes[A > 0 ? 1 : 0]!.latex}`));
  return lignes;
}

/** Vérification d'un zéro rationnel du niveau 2 : on remplace x dans f, de l'intérieur vers l'extérieur. */
function verificationN2(e: N2, z: number): EtapeCorrection[] {
  if (rationnel(z) === null) return [];
  const u = e.a * z + e.b;
  const vb = baseEn(e.famille, u);
  if (vb === null) return [];
  const terme = `${e.c > 0 ? "+" : "-"}${Math.abs(e.c) === 1 ? "" : `${Math.abs(e.c)}\\cdot `}${qp(z)}`;
  return [
    verification(lettre(e, "zeros"), [texte("On remplace x par "), latex(formatValeurExacteLatex(z)), texte(" dans f :")], [
      ligne(`f\\left(${formatValeurExacteLatex(z)}\\right)=${baseNombreLatex(e.famille, u)}${terme}${plusQ(e.d)}`, "on calcule d'abord ax + b"),
      ligne(`=${vb}${plusQ(e.c * z)}${plusQ(e.d)}`),
      ligne("=0", "✓"),
    ]),
  ];
}

function etapeZerosN2(e: N2): EtapeCorrection[] {
  const L = lettre(e, "zeros");
  const zeros = zerosAttendus(e);
  const zerosFragments = (z: number[]): FragmentConsigne[] => (z.length === 0 ? [texte("Aucun zéro.")] : [latex(termesZerosExactsLatex(e, z)!.join(" \\text{ ; } "))]);
  if (e.famille === "valeur_absolue") {
    return [
      utilise(L, [texte("Les zéros de f sont les racines des branches qui respectent leur condition (étape précédente).")]),
      calcul(L, zeros.length === 0 ? [ligne("S=\\varnothing", "aucune racine ne respecte la condition de sa branche")] : zeros.map((z) => ligne(`x=${formatValeurExacteLatex(z)}`, "racine dont la branche est retenue"))),
      resultat(L, zerosFragments(zeros)),
      ...(zeros.length > 0 ? verificationN2(e, zeros[0]!) : []),
    ];
  }
  if (e.famille === "cube" || e.famille === "racine_cubique") {
    const f = e.factorisationP3;
    const [A3, B3, C3, D3] = e.famille === "cube" ? [e.a ** 3, 3 * e.a * e.a * e.b, 3 * e.a * e.b * e.b + e.c, e.b ** 3 + e.d] : [e.c ** 3, 3 * e.c * e.c * e.d, 3 * e.c * e.d * e.d + e.a, e.d ** 3 + e.b];
    const lignes: LigneCalcul[] = [ligne(`${polynome([A3, B3, C3, D3])}=0`, "équation obtenue")];
    if (f.type === "avecX") {
      const { A, B, C } = f.quadratique;
      lignes.push(ligne(`x(${polynome([A, B, C])})=0`, "pas de terme constant : on met x en évidence"), ligne("x=0", "produit nul : premier facteur"));
      lignes.push(...lignesSecondDegre(A, B, C, "cas_general"));
    } else {
      const { A, B } = f.lineaire;
      lignes.push(
        ligne(`x^2(${polynome([A, B])})+(${polynome([A, B])})=0`, "on groupe les termes deux à deux"),
        ligne(`(x^2+1)(${polynome([A, B])})=0`, "on met le facteur commun en évidence"),
        ligne("x^2+1\\neq 0", "x² + 1 est toujours strictement positif"),
        ...lignesPremierDegre(A, B, 0),
      );
    }
    return [
      utilise(L, [texte(f.type === "avecX" ? "On met x en évidence, puis on applique la règle du produit nul ; le facteur du second degré se résout avec Δ." : "On factorise par groupement ; le facteur x² + 1 n'est jamais nul, seul l'autre facteur peut s'annuler.")]),
      calcul(L, lignes),
      resultat(L, zerosFragments(zeros)),
      ...(zeros.length > 0 ? verificationN2(e, zeros[zeros.length - 1]!) : []),
    ];
  }
  // carre, inverse, racine_carree : équation du second degré entière.
  const quad = e as Extract<N2, { zeros: unknown }>;
  const { a: A, b: B, c: C } = quad.zeros.enonce;
  const candidats = quad.famille === "racine_carree" ? racinesAValiderRacineCarree(quad) : zeros;
  return [
    utilise(L, [texte(quad.zeros.categorie === "cas_general" || quad.zeros.categorie === "irreductible" ? "On résout l'équation du second degré avec le discriminant Δ = b² − 4ac." : "On résout l'équation du second degré par une méthode rapide (mise en évidence, différence de deux carrés ou carré parfait), sans discriminant.")]),
    calcul(L, lignesSecondDegre(A, B, C, quad.zeros.categorie)),
    resultat(L, e.famille === "racine_carree" ? (candidats.length === 0 ? [texte("Aucune solution candidate.")] : [texte("Solutions candidates : "), latex(termesZerosExactsLatex(e, candidats)!.join(" \\text{ ; } "))]) : zerosFragments(zeros)),
    ...(e.famille !== "racine_carree" && zeros.length > 0 ? verificationN2(e, zeros[0]!) : []),
  ];
}

function etapeValidation(e: N2): EtapeCorrection[] {
  const L = lettre(e, "validation");
  if (e.famille === "racine_carree") {
    const candidats = racinesAValiderRacineCarree(e);
    const lignes: LigneCalcul[] = candidats.map((r) => {
      const v = -e.c * r - e.d;
      const ok = racineRespecteCondition(e, r);
      return ligne(`${coefCdot(-e.c)}${qp(r)}${plusQ(-e.d)}=${q(v)}`, `${ok ? "positif ou nul" : "négatif"} en x = ${nombreTexte(r)} : candidate ${ok ? "retenue" : "rejetée"}`);
    });
    const zeros = zerosAttendus(e);
    return [
      utilise(L, [texte("Élever au carré peut ajouter des solutions étrangères : chaque candidate doit rendre le membre de droite positif ou nul (condition "), latex(formatConditionLatex(e.conditionValidite)), texte(").")]),
      calcul(L, lignes.length > 0 ? lignes : [ligne("S=\\varnothing", "aucune candidate")]),
      resultat(L, zeros.length === 0 ? [texte("Aucun zéro.")] : [latex(termesZerosExactsLatex(e, zeros)!.join(" \\text{ ; } "))]),
      piege(L, [texte("Élever au carré peut faire apparaître des solutions étrangères : chaque candidate doit être confrontée à la condition de validité.")]),
    ];
  }
  if (e.famille === "valeur_absolue") {
    const lignes: LigneCalcul[] = ([0, 1] as const).map((i) => {
      const x = i === 0 ? e.racineBranche1.num / e.racineBranche1.den : e.racineBranche2.num / e.racineBranche2.den;
      const v = e.a * x + e.b;
      const ok = brancheEstValide(e, i);
      return ligne(`${coefCdot(e.a)}${qp(x)}${plusQ(e.b)}=${q(v)}`, `x = ${nombreTexte(x)} (${i === 0 ? "1re" : "2e"} branche, condition ${i === 0 ? "A ≥ 0" : "A < 0"}) : ${ok ? "retenue" : "rejetée"}`);
    });
    return [
      utilise(L, [texte("Chaque racine doit respecter la condition de sa branche : "), latex(formatConditionLatex(e.conditionValidite)), texte(" pour la 1re, "), latex(formatConditionNegeeLatex(e.conditionValidite)), texte(" pour la 2e.")]),
      calcul(L, lignes, [texte("On calcule l'intérieur A de la valeur absolue en chaque racine :")]),
      resultat(L, [texte(`1re branche : ${brancheEstValide(e, 0) ? "retenue" : "rejetée"} ; 2e branche : ${brancheEstValide(e, 1) ? "retenue" : "rejetée"}.`)]),
      piege(L, [texte("Chaque racine doit respecter la condition de sa branche, pas celle de l'autre.")]),
    ];
  }
  return [];
}

function correctionNiveau2(e: N2): EtapeCorrection[] {
  const etapes = etapesCaracteristiquesAlgebriques(e);
  const par: Record<EtapeGen13, () => EtapeCorrection[]> = {
    ce: () => etapeCE(e),
    domaine: () => etapeDomaine(e),
    ordonnee: () => etapeOrdonnee(e),
    parite: () => [],
    isolement: () => etapeIsolementN2(e),
    intermediaire: () => [],
    validite: () => etapeValidite(e),
    regroupe: () => etapeRegroupe(e),
    branches: () => etapeBranches(e),
    zeros: () => etapeZerosN2(e),
    validation: () => etapeValidation(e),
  };
  return etapes.flatMap((et) => par[et]());
}

export function correctionDetailleeCaracteristiquesAlgebriques(e: Instance): EtapeCorrection[] {
  return e.niveau === "niveau1" ? correctionNiveau1(e) : correctionNiveau2(e);
}
