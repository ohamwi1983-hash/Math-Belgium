import type { ExerciceAnalyseFonction } from "../../core/analyseFonction.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { PhaseAnalyseFonction } from "../../moteur/typesAnalyseFonction";
import { formatFonctionOrdreLatex } from "../../ui/formatAnalyseFonction";
import { lignesFactorisation, lignesProduitNul, finaliserCorrige } from "../../ui/corrigeSecondDegre1";
import {
  COURS_DEBUT,
  COURS_ETUDIER,
  carreLatex,
  facteurLatex,
  lignesAbscisseSommet,
  lignesOrdonneeSommet,
  lignesValeur,
  nb,
  pointLatex,
  q,
  trinomeLatex,
  valeurTrinome,
} from "../../ui/corrigeParabole";

/**
 * Corrigé détaillé « comme au tableau » de gen7 (« Analyse d'une fonction du second degré »,
 * `AppAnalyseFonction.tsx`) — règle `.claude/rules/feuilles-evaluations.md`. Une étape (lettre) par
 * ÉCRAN, dans l'ordre réel des écrans (`phasesAnalyseFonction`, même séquence que la barre de
 * progression) : coefficients, allure, axe et sommet, image, méthode, factorisation, racines,
 * tableau — sans les deux écrans de factorisation pour une fonction non factorisable. Aucun « Δ » ni
 * « discriminant » (pas encore vus au chapitre 1) : la méthode se décide par les raccourcis du cours
 * (c = 0, b = 0 avec a·c < 0, b² = 4ac), sinon par la position du sommet. Partagé par l'adaptateur
 * papier et l'appli (corrigé de l'étape ratée).
 */

type E = ExerciceAnalyseFonction;

const ORDRE: PhaseAnalyseFonction[] = ["coefficients", "allure", "axeSommet", "domaineImage", "racinesReconnaissance", "racinesChamp1", "racinesChamp2", "tableauSignes"];

/** Écrans de l'instance, dans l'ordre (lettres a, b, c…). */
export function phasesAnalyseFonction(e: E): PhaseAnalyseFonction[] {
  return e.exercice.categorie === "irreductible" ? ORDRE.filter((p) => p !== "racinesChamp1" && p !== "racinesChamp2") : ORDRE;
}

export function lettrePhaseAnalyseFonction(e: E, phase: PhaseAnalyseFonction): string {
  return "abcdefgh"[phasesAnalyseFonction(e).indexOf(phase)] ?? "a";
}

/** Écrans de pure lecture (critère du niveau) : coefficients lus, signes de a et de a·b, image lue
 * sur le sommet, zéros lus sur la forme factorisée. */
export function lettresLectureAnalyseFonction(e: E): string[] {
  const lecture: PhaseAnalyseFonction[] = ["coefficients", "allure", "domaineImage", "racinesChamp2"];
  return lecture.filter((p) => phasesAnalyseFonction(e).includes(p)).map((p) => lettrePhaseAnalyseFonction(e, p));
}

/** Consigne de chaque écran (titres « Étape n — … » du corrigé). */
export function consigneEtapeAnalyseFonction(phase: PhaseAnalyseFonction): FragmentConsigne[] {
  switch (phase) {
    case "coefficients":
      return [texte("Identifie les coefficients a, b et c.")];
    case "allure":
      return [texte("Donne le signe de a, puis celui du produit "), latex("a\\cdot b"), texte(".")];
    case "axeSommet":
      return [texte("Donne l'axe de symétrie et les coordonnées du sommet (valeurs exactes).")];
    case "domaineImage":
      return [texte("Donne l'image de f (son domaine est "), latex("\\mathbb{R}"), texte(").")];
    case "racinesReconnaissance":
      return [texte("Quelle est la méthode la plus rapide pour trouver les zéros de f ?")];
    case "racinesChamp1":
      return [texte("Factorise "), latex("f(x)"), texte(".")];
    case "racinesChamp2":
      return [texte("Donne les zéros (racines) de f.")];
    case "tableauSignes":
      return [texte("Complète le tableau de signes et de variation de f.")];
  }
}

function coefs(e: E) {
  return e.exercice.enonce;
}

export function imageLatex(e: E): string {
  const y = q(e.yS);
  return coefs(e).a > 0 ? `\\operatorname{im} f=\\left[${y}\\,;\\,{+\\infty}\\right[` : `\\operatorname{im} f=\\left]{-\\infty}\\,;\\,${y}\\right]`;
}

/** Zéros distincts, dans l'ordre croissant (vide si non factorisable). */
export function zerosAnalyseFonction(e: E): number[] {
  if (e.exercice.categorie === "irreductible") return [];
  const [r1, r2] = [...e.exercice.solution.racines].sort((x, y) => x - y);
  return r1 === r2 ? [r1!] : [r1!, r2!];
}

export function formeFactoriseeAnalyseFonction(e: E): string {
  return (e.exercice.solution.formeFactorisee ?? "").replace(/\s+/g, "");
}

/** Texte d'une cellule du tableau (« − » typographique, fraction « p/q »). */
function nombreTexte(v: number): string {
  return nb(v);
}

/** Tableau de signes et de variation (HTML autonome, styles en ligne) — mêmes colonnes que l'écran
 * (`EtapeTableauSigneVariation`) : −∞ et +∞ dans leurs colonnes, puis l'alternance intervalle /
 * valeur de `grilleSigneVariation`. */
export function tableauSigneVariationHtml(e: E): string {
  const { colonnesValeurs, ligneSigne, ligneVariation } = e.grilleSigneVariation;
  const ligneX = ligneSigne.map((_, i) => (i % 2 === 1 ? nombreTexte(colonnesValeurs[(i - 1) / 2]!) : ""));
  const cellule = (contenu: string, entete = false) =>
    `<td style="border:1px solid #444;padding:4px 8px;text-align:center;min-width:28px;${entete ? "font-weight:600;text-align:left;white-space:nowrap;" : ""}">${contenu}</td>`;
  const rangee = (titre: string, valeurs: string[]) => `<tr>${cellule(titre, true)}${valeurs.map((v) => cellule(v.replace("-", "−"))).join("")}</tr>`;
  return (
    `<table style="border-collapse:collapse;margin:6px 0;font-size:14px">` +
    rangee("x", ["−∞", ...ligneX, "+∞"]) +
    rangee("signe de f(x)", ["", ...ligneSigne, ""]) +
    rangee("variation de f", ["", ...ligneVariation, ""]) +
    `</table>`
  );
}

// ---------------------------------------------------------------------------------------------
// Étapes
// ---------------------------------------------------------------------------------------------

function etapeCoefficients(e: E, l: string): EtapeCorrection[] {
  const { a, b, c } = coefs(e);
  const ecrite = formatFonctionOrdreLatex(e.exercice.enonce, e.ordreTermes).replace(/\s+/g, "");
  const rangee = `f(x)=${trinomeLatex(a, b, c)}`;
  const lignes: LigneCalcul[] = [ligne(ecrite)];
  if (rangee !== ecrite) lignes.push(ligne(`=${trinomeLatex(a, b, c)}`, "on range les termes : x², puis x, puis la constante"));
  lignes.push(
    ligne(`a=${q(a)}`, "coefficient de x²"),
    ligne(`b=${q(b)}`, b === 0 ? "pas de terme en x" : "coefficient de x"),
    ligne(`c=${q(c)}`, c === 0 ? "pas de terme constant" : "terme constant"),
  );
  const etapes: EtapeCorrection[] = [
    utilise(l, [
      texte("Une fonction du second degré s'écrit "),
      latex("f(x)=ax^2+bx+c"),
      texte(` : a est le coefficient de x², b celui de x, c le terme constant, quel que soit l'ordre d'écriture des termes ${COURS_DEBUT}.`),
    ]),
    calcul(l, lignes),
    resultat(l, [latex(`a=${q(a)}`), texte(", "), latex(`b=${q(b)}`), texte(", "), latex(`c=${q(c)}`)]),
  ];
  if (e.ordreTermes[0] !== "a") etapes.push(piege(l, [texte("a n'est pas le premier nombre écrit : c'est le coefficient de "), latex("x^2"), texte(", et le signe placé devant le terme en fait partie.")]));
  else if (b === 0 || c === 0) etapes.push(piege(l, [texte("Un terme absent a un coefficient nul : ici "), latex(b === 0 ? "b=0" : "c=0"), texte(".")]));
  else etapes.push(piege(l, [texte("Le signe placé devant un terme fait partie de son coefficient : "), latex(`${b < 0 ? "b" : "c"}=${q(b < 0 ? b : c)}`), texte(".")]));
  return etapes;
}

function etapeAllure(e: E, l: string): EtapeCorrection[] {
  const { a, b } = coefs(e);
  const ab = a * b;
  const lignesAB: LigneCalcul[] =
    b === 0
      ? [ligne(`a\\cdot b=${facteurLatex(a)}\\cdot 0`, "b = 0"), ligne("=0", "l'axe de symétrie est l'axe Oy")]
      : [
          ligne(`a\\cdot b=${facteurLatex(a)}\\cdot ${facteurLatex(b)}`),
          ligne(`=${q(ab)}${ab > 0 ? ">0" : "<0"}`, ab > 0 ? "a et b de même signe : axe à gauche de Oy" : "a et b de signes contraires : axe à droite de Oy"),
        ];
  return [
    utilise(l, [
      texte("Le signe de a donne l'ouverture : "),
      latex("a>0"),
      texte(", parabole tournée vers le haut (le sommet est un minimum) ; "),
      latex("a<0"),
      texte(", tournée vers le bas (maximum). Comme "),
      latex("x_S=-\\dfrac{b}{2a}"),
      texte(", le signe de "),
      latex("a\\cdot b"),
      texte(" situe l'axe : positif, à gauche de Oy ; négatif, à droite ; nul, sur Oy "),
      texte(`${COURS_ETUDIER}.`),
    ]),
    calcul(l, [ligne(`a=${q(a)}${a > 0 ? ">0" : "<0"}`, a > 0 ? "parabole tournée vers le haut" : "parabole tournée vers le bas"), ...lignesAB]),
    resultat(l, [latex(a > 0 ? "a>0" : "a<0"), texte(" et "), latex(`a\\cdot b${ab > 0 ? ">0" : ab < 0 ? "<0" : "=0"}`)]),
    piege(l, [texte("Le signe de b seul ne situe pas l'axe : c'est le signe du produit "), latex("a\\cdot b"), texte(" qui compte.")]),
  ];
}

function etapeAxeSommet(e: E, l: string): EtapeCorrection[] {
  const { a, b, c } = coefs(e);
  const { xS, yS } = e;
  const etapes: EtapeCorrection[] = [
    utilise(l, [
      texte("L'abscisse du sommet est "),
      latex("x_S=-\\dfrac{b}{2a}"),
      texte(" ; l'axe de symétrie est la droite verticale "),
      latex("x=x_S"),
      texte(" ; l'ordonnée s'obtient en remplaçant x par "),
      latex("x_S"),
      texte(" : "),
      latex("y_S=f(x_S)"),
      texte(` ${COURS_ETUDIER}.`),
    ]),
    calcul(l, [...lignesAbscisseSommet(a, b), ...lignesOrdonneeSommet(a, b, c, xS)]),
    resultat(l, [texte("Axe de symétrie "), latex(`x=${q(xS)}`), texte(", sommet "), latex(pointLatex("S", xS, yS))]),
    verification(l, [texte("Par symétrie, deux points à la même distance de l'axe ont la même image : "), latex(`f\\left(${q(xS - 1)}\\right)=f\\left(${q(xS + 1)}\\right)=${q(valeurTrinome(a, b, c, xS + 1))}`), texte(" ✓")]),
  ];
  if (b !== 0) etapes.push(piege(l, [texte("Ne pas oublier le « − » de la formule : "), latex(`-\\dfrac{${q(b)}}{2\\cdot ${facteurLatex(a)}}`), texte(` donne ${nb(xS)}, pas ${nb(-xS)}.`)]));
  else etapes.push(piege(l, [texte("b = 0 : le sommet est sur l'axe Oy, son ordonnée est c.")]));
  return etapes;
}

function etapeImage(e: E, l: string): EtapeCorrection[] {
  const { a } = coefs(e);
  return [
    utilise(l, [
      texte("Le domaine d'une fonction du second degré est toujours "),
      latex("\\mathbb{R}"),
      texte(". L'image dépend du sommet et du signe de a : "),
      latex("a>0"),
      texte(", "),
      latex("y_S"),
      texte(" est le minimum et "),
      latex("\\operatorname{im} f=[y_S\\,;\\,{+\\infty}["),
      texte(" ; "),
      latex("a<0"),
      texte(", maximum et "),
      latex("\\operatorname{im} f=]{-\\infty}\\,;\\,y_S]"),
      texte(` ${COURS_ETUDIER}.`),
    ]),
    calcul(l, [
      ligne(`a=${q(a)}${a > 0 ? ">0" : "<0"}`, a > 0 ? "tournée vers le haut : le sommet est le point le plus bas" : "tournée vers le bas : le sommet est le point le plus haut"),
      ligne(`y_S=${q(e.yS)}`, a > 0 ? "minimum de f (ordonnée du sommet, étape précédente)" : "maximum de f (ordonnée du sommet, étape précédente)"),
    ]),
    resultat(l, [latex(imageLatex(e))]),
    piege(l, [texte("L'image se lit sur l'ordonnée du sommet, pas sur son abscisse ; le crochet est fermé du côté du sommet (valeur atteinte).")]),
  ];
}

const LIBELLE_METHODE: Record<string, string> = {
  mise_en_evidence: "mise en évidence de x",
  binome_conjugue: "différence de deux carrés (binôme conjugué)",
  produit_remarquable: "carré parfait (produit remarquable)",
  irreductible: "aucune factorisation, f n'a pas de zéro (non factorisable)",
};

function ligneC(c: number): LigneCalcul {
  return ligne(`c=${q(c)}\\neq 0`, "x n'est pas facteur commun : pas de mise en évidence");
}

function lignesCarreParfait(a: number, b: number, c: number, egal: boolean): LigneCalcul[] {
  return [
    ligne(`b^2=${carreLatex(b)}=${q(b * b)}`),
    ligne(`4ac=4\\cdot ${facteurLatex(a)}\\cdot ${facteurLatex(c)}=${q(4 * a * c)}`),
    egal ? ligne("b^2=4ac", [texte("carré parfait : f(x) s'écrit "), latex("a(x-r)^2")]) : ligne("b^2\\neq 4ac", "pas un carré parfait"),
  ];
}

function etapeMethode(e: E, l: string): EtapeCorrection[] {
  const { a, b, c } = coefs(e);
  const cat = e.exercice.categorie;
  let lignes: LigneCalcul[];
  let piegeTexte: FragmentConsigne[];
  switch (cat) {
    case "mise_en_evidence":
      lignes = [ligne("c=0", "pas de terme constant : x est facteur commun aux deux termes")];
      piegeTexte = [texte("Ne jamais diviser par x : on perdrait le zéro "), latex("x=0"), texte(".")];
      break;
    case "binome_conjugue":
      lignes = [ligneC(c), ligne("b=0", "pas de terme en x"), ligne(`a\\cdot c=${facteurLatex(a)}\\cdot ${facteurLatex(c)}=${q(a * c)}<0`, "a et c de signes opposés : différence de deux carrés")];
      piegeTexte = [texte("b = 0 ne suffit pas : il faut aussi a et c de signes opposés pour écrire une différence de deux carrés.")];
      break;
    case "produit_remarquable":
      lignes = [ligneC(c), ligne(`b=${q(b)}\\neq 0`, "pas une différence de deux carrés"), ...lignesCarreParfait(a, b, c, true)];
      piegeTexte = [texte("Un carré parfait se vérifie par "), latex("b^2=4ac"), texte(", pas seulement à l'œil.")];
      break;
    default: {
      const sommet = e.yS > 0 ? "au-dessus" : "en dessous";
      lignes = [
        ligneC(c),
        ...(b === 0
          ? [ligne("b=0", "pas de terme en x"), ligne(`a\\cdot c=${facteurLatex(a)}\\cdot ${facteurLatex(c)}=${q(a * c)}>0`, "a et c de même signe : ce n'est pas une différence de deux carrés")]
          : [ligne(`b=${q(b)}\\neq 0`, "pas une différence de deux carrés"), ...lignesCarreParfait(a, b, c, false)]),
        ligne(`y_S=${q(e.yS)}${e.yS > 0 ? ">0" : "<0"}`, `le sommet, trouvé plus haut, est ${sommet} de l'axe Ox`),
        ligne(`a=${q(a)}${a > 0 ? ">0" : "<0"}`, a > 0 ? [texte("tournée vers le haut : "), latex("f(x)\\geq y_S>0"), texte(" pour tout x")] : [texte("tournée vers le bas : "), latex("f(x)\\leq y_S<0"), texte(" pour tout x")]),
      ];
      piegeTexte = b === 0 ? [texte("b = 0 avec a et c de même signe : ce n'est pas une différence de deux carrés, il n'y a pas de zéro.")] : [texte("Aucun raccourci ne s'applique : c'est la position du sommet (du côté où la parabole s'ouvre) qui montre que f ne s'annule jamais.")];
    }
  }
  return [
    utilise(l, [
      texte("On cherche les zéros sans formule générale, en testant les raccourcis dans l'ordre : "),
      latex("c=0"),
      texte(" → mise en évidence de x ; "),
      latex("b=0"),
      texte(" avec a et c de signes opposés → différence de deux carrés ; "),
      latex("b^2=4ac"),
      texte(" → carré parfait. Sinon, la position du sommet tranche : un sommet situé du côté où la parabole s'ouvre (au-dessus de Ox si "),
      latex("a>0"),
      texte(", en dessous si "),
      latex("a<0"),
      texte(`) signifie que la courbe ne coupe jamais l'axe Ox ${COURS_ETUDIER}.`),
    ]),
    calcul(l, lignes),
    resultat(l, [texte(`Méthode : ${LIBELLE_METHODE[cat] ?? ""}.`)]),
    piege(l, piegeTexte),
  ];
}

function etapeFactorisation(e: E, l: string): EtapeCorrection[] {
  const forme = formeFactoriseeAnalyseFonction(e);
  const { a, b, c } = coefs(e);
  const cat = e.exercice.categorie;
  const cours: FragmentConsigne[] =
    cat === "mise_en_evidence"
      ? [texte("Pas de terme constant : on met en évidence le facteur commun "), latex("ax"), texte(", ce qui donne la forme "), latex("ax(x-r)")]
      : cat === "binome_conjugue"
        ? [texte("Différence de deux carrés "), latex("A^2-B^2=(A-B)(A+B)"), texte(", après avoir mis a en évidence")]
        : [texte("Carré parfait "), latex("A^2\\pm 2AB+B^2=(A\\pm B)^2"), texte(", après avoir mis a en évidence")];
  const etapes: EtapeCorrection[] = [
    utilise(l, [...cours, texte(` ${COURS_ETUDIER}.`)]),
    calcul(l, lignesFactorisation(e.exercice, { nom: "f" }, forme, trinomeLatex(a, b, c))),
    resultat(l, [latex(`f(x)=${forme}`)]),
    verification(l, [texte("On redéveloppe la forme factorisée : on retrouve "), latex(`${forme}=${trinomeLatex(a, b, c)}`), texte(" ✓")]),
  ];
  if (a !== 1) etapes.push(piege(l, [texte("Le coefficient "), latex(`a=${q(a)}`), texte(" ne disparaît pas : il reste devant le produit.")]));
  else etapes.push(piege(l, [texte("Contrôler les signes dans chaque facteur en redéveloppant.")]));
  return etapes;
}

function etapeZeros(e: E, l: string): EtapeCorrection[] {
  const forme = formeFactoriseeAnalyseFonction(e);
  const { a, b, c } = coefs(e);
  const zeros = zerosAnalyseFonction(e);
  const res: FragmentConsigne[] =
    zeros.length === 1
      ? [texte("Un seul zéro (zéro double) : "), latex(`x=${q(zeros[0]!)}`)]
      : [texte("Deux zéros : "), latex(`x=${q(zeros[0]!)}`), texte(" et "), latex(`x=${q(zeros[1]!)}`)];
  const r = zeros[zeros.length - 1]!;
  return [
    utilise(l, [texte(`Un produit est nul si et seulement si l'un de ses facteurs est nul : on égale chaque facteur contenant x à 0 ${COURS_ETUDIER}.`)]),
    calcul(l, lignesProduitNul(forme), [texte("Sur "), latex(`f(x)=${forme}`), texte(" :")]),
    resultat(l, res),
    verification(l, [texte("On remplace x par un zéro dans f(x) : on doit trouver 0."), texte("")], lignesValeur(a, b, c, r, `f\\left(${q(r)}\\right)`)),
    piege(l, zeros.length === 1 ? [texte("Un carré nul n'a qu'une solution : le zéro est double, il ne faut pas l'écrire deux fois.")] : [texte("Le facteur numérique a ne donne pas de zéro : seuls les facteurs qui contiennent x s'annulent.")]),
  ];
}

function etapeTableau(e: E, l: string): EtapeCorrection[] {
  const { a } = coefs(e);
  const zeros = zerosAnalyseFonction(e);
  const lignes: LigneCalcul[] = [ligne(`a=${q(a)}${a > 0 ? ">0" : "<0"}`, zeros.length === 0 ? "aucun zéro : f garde le signe de a partout" : "signe de f(x) à l'extérieur des zéros")];
  if (zeros.length === 2) {
    lignes.push(ligne(`x_1=${q(zeros[0]!)}`, "premier zéro : f(x) = 0"), ligne(`x_2=${q(zeros[1]!)}`, "second zéro : entre les deux, signe opposé à celui de a"));
  } else if (zeros.length === 1) {
    lignes.push(ligne(`x_1=${q(zeros[0]!)}`, "zéro double : f s'annule sans changer de signe"));
  } else {
    lignes.push(ligne(`y_S=${q(e.yS)}`, "le sommet est du même côté de Ox que l'ouverture : jamais 0"));
  }
  lignes.push(ligne(`x_S=${q(e.xS)}`, a > 0 ? "f décroît jusqu'au sommet (minimum), puis croît" : "f croît jusqu'au sommet (maximum), puis décroît"));
  const t = zeros.length === 2 ? e.xS : zeros.length === 1 ? zeros[0]! + 1 : e.xS;
  const vt = valeurTrinome(a, coefs(e).b, coefs(e).c, t);
  return [
    utilise(l, [
      texte("Signe : à l'extérieur des zéros, f(x) a le signe de a ; entre deux zéros, le signe opposé ; sans zéro, le signe de a partout. Variation : f change de sens au sommet, "),
      texte(a > 0 ? "décroissante puis croissante si " : "croissante puis décroissante si "),
      latex(a > 0 ? "a>0" : "a<0"),
      texte(` ${COURS_ETUDIER}.`),
    ]),
    calcul(l, lignes),
    { ...resultat(l, [texte("Tableau de signes et de variation de f :")]), figureHtml: tableauSigneVariationHtml(e) },
    verification(l, [
      texte(zeros.length === 2 ? "Valeur test entre les zéros : " : "Valeur test : "),
      latex(`f\\left(${q(t)}\\right)=${q(vt)}${vt > 0 ? ">0" : "<0"}`),
      texte(zeros.length === 2 ? " : signe opposé à a entre les zéros ✓" : " : signe de a ✓"),
    ]),
    piege(
      l,
      zeros.length === 2
        ? [texte("Entre les zéros, le signe est l'opposé de celui de a (et non celui de a).")]
        : zeros.length === 1
          ? [texte("Zéro double : le signe ne change pas en traversant le zéro, f s'y annule seulement.")]
          : [texte("Sans zéro, f ne change jamais de signe : la ligne des signes n'a aucun 0.")],
    ),
  ];
}

export function correctionDetailleeAnalyseFonction(e: E): EtapeCorrection[] {
  const L = (p: PhaseAnalyseFonction) => lettrePhaseAnalyseFonction(e, p);
  const etapes: EtapeCorrection[] = [...etapeCoefficients(e, L("coefficients")), ...etapeAllure(e, L("allure")), ...etapeAxeSommet(e, L("axeSommet")), ...etapeImage(e, L("domaineImage")), ...etapeMethode(e, L("racinesReconnaissance"))];
  if (e.exercice.categorie !== "irreductible") etapes.push(...etapeFactorisation(e, L("racinesChamp1")), ...etapeZeros(e, L("racinesChamp2")));
  etapes.push(...etapeTableau(e, L("tableauSignes")));
  return finaliserCorrige(etapes);
}
