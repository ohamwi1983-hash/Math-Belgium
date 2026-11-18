import type { ExerciceCaracteristiquesFonction } from "../../core/caracteristiquesFonction.types";
import type { Morceau } from "../../core/inequation.types";
import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import {
  constanceAttendueCaracteristiques,
  croissanceAttendueCaracteristiques,
  decroissanceAttendueCaracteristiques,
  domaineCaracteristiques,
  evaluerCourbeCaracteristiques,
  existeOrdonneeCaracteristiques,
  existeValeurEnVCaracteristiques,
} from "../../moteur/verificationCaracteristiquesFonction";
import { COURS_LECTURE } from "../../ui/corrigeChapitre3";
import { construireGrapheCaracteristiques, formatMorceauLatex, formatMorceauxLatex, formatNombre } from "./figure";

/**
 * Corrigé détaillé « comme au tableau » de gen12 (caractéristiques d'une fonction, lecture
 * graphique) — règle `.claude/rules/feuilles-evaluations.md`. Huit étapes = huit écrans (domaine,
 * zéros, croissance, décroissance, constance, ordonnée à l'origine, valeur en v, asymptotes). Le
 * bloc « Calcul » est la lecture faite au tableau : ce qu'on lit et où, une lecture par ligne.
 * Toutes les valeurs viennent du moteur partagé avec l'écran
 * (`moteur/verificationCaracteristiquesFonction.ts`) ; partagé par l'adaptateur et l'appli.
 */

type E = ExerciceCaracteristiquesFonction;

const n = formatNombre;

function ensembleLatex(morceaux: Morceau[]): string {
  return morceaux.length === 0 ? "\\varnothing" : formatMorceauxLatex(morceaux);
}

function zerosLatex(e: E): string | null {
  const zeros = [...e.zeros].sort((a, b) => a - b);
  return zeros.length === 0 ? null : zeros.map((z) => `x = ${n(z)}`).join(" \\text{ ; } ");
}

function asymptotesLatex(e: E): string {
  return `AV \\equiv x = ${n(e.AV)} \\quad\\text{et}\\quad AH \\equiv y = ${n(e.L)}`;
}

function lignesDomaine(e: E): LigneCalcul[] {
  const lignes: { x: number; l: LigneCalcul }[] = [
    { x: e.AV, l: ligne(`x=${n(e.AV)}`, "asymptote verticale : aucun point de la courbe, exclu") },
    { x: e.c, l: ligne(`x=${n(e.c)}`, "un cercle vide seul, sans point plein à cette abscisse : exclu") },
    ...e.gaps.map((g) => ({ x: g.g1, l: ligne(`x\\in\\,]${n(g.g1)}\\,;\\,${n(g.g2)}[`, "aucun tracé : exclus ; les bornes (points pleins) restent") })),
  ];
  if (e.discontinuite.type === "trou") lignes.push({ x: e.b5, l: ligne(`x=${n(e.b5)}`, "deux cercles vides, aucun point plein : exclu") });
  else lignes.push({ x: e.b5, l: ligne(`f(${n(e.b5)})=${n(evaluerCourbeCaracteristiques(e, e.b5))}`, "un point plein à cette abscisse : elle reste dans le domaine") });
  return lignes.sort((a, b) => a.x - b.x).map((x) => x.l);
}

/** Extrémité d'un intervalle lue sur le graphique : point plein, cercle vide, asymptote ou bord. */
function extremite(e: E, borne: number | "-inf" | "+inf", crochet: string, interieur: 1 | -1): string {
  if (borne === "-inf") return "depuis la gauche du graphique";
  if (borne === "+inf") return "vers la droite du graphique";
  if (borne === e.AV) return `l'asymptote x = ${n(borne).replace("-", "−")}`;
  const y = crochet === "[" && interieur === 1 || crochet === "]" && interieur === -1 ? evaluerCourbeCaracteristiques(e, borne) : NaN;
  const yLu = Number.isFinite(y) ? y : evaluerCourbeCaracteristiques(e, borne + interieur * 1e-9);
  const pt = `(${n(borne)} ; ${n(Math.round(yLu * 1e6) / 1e6)})`.replace(/-/g, "−");
  return Number.isFinite(y) ? `le point ${pt}` : `le cercle vide ${pt}`;
}

/** Une ligne de lecture par intervalle : d'où à où la courbe monte (descend). */
function lignesIntervalles(e: E, morceaux: Morceau[], sens: string): LigneCalcul[] {
  if (morceaux.length === 0) return [ligne("x\\in\\varnothing", `la courbe ne ${sens} nulle part`)];
  return morceaux.map((m) => {
    const de = extremite(e, m.borneGauche, m.crochetGauche, 1);
    const a = extremite(e, m.borneDroite, m.crochetDroit, -1);
    return ligne(`x\\in${formatMorceauLatex(m)}`, `la courbe ${sens} ${de.startsWith("depuis") ? de : `de ${de}`} ${a.startsWith("vers") ? a : `jusqu'à ${a}`}`.replace(/\bde le /g, "du ").replace(/jusqu'à le /g, "jusqu'au "));
  });
}

function lectureValeur(e: E): FragmentConsigne[] {
  const v = n(e.v);
  if (e.v === e.c) return [texte("En "), latex(`x = ${v}`), texte(", la courbe n'a qu'un cercle vide : cette abscisse n'appartient pas au domaine.")];
  switch (e.discontinuite.type) {
    case "pointPlein":
      return [texte("En "), latex(`x = ${v}`), texte(", un cercle vide (fin du morceau de gauche) et un point plein : la valeur est l'ordonnée du point plein.")];
    case "trou":
      return [texte("En "), latex(`x = ${v}`), texte(", les deux marqueurs sont des cercles vides : aucun point de la courbe, la valeur n'existe pas.")];
    case "pointRedefini":
      return [texte("En "), latex(`x = ${v}`), texte(", deux cercles vides et un point plein isolé à une autre hauteur : la valeur est l'ordonnée du point plein isolé.")];
  }
}

export function correctionDetailleeCaracteristiquesFonction(e: E): EtapeCorrection[] {
  const zeros = zerosLatex(e);
  const b5 = n(e.b5);
  const ordonnee = existeOrdonneeCaracteristiques(e);
  const valeur = existeValeurEnVCaracteristiques(e);
  const constance = constanceAttendueCaracteristiques(e);
  return [
    // a) Domaine
    utilise("a", [texte(`Le domaine est l'ensemble des abscisses des points de la courbe : on repère celles où il n'y a aucun point — asymptote verticale, cercle vide sans point plein à la même abscisse, intervalle sans tracé ${COURS_LECTURE}.`)]),
    { ...calcul("a", lignesDomaine(e), [texte("On parcourt l'axe des abscisses de gauche à droite :")]), figureHtml: construireGrapheCaracteristiques(e, true) },
    resultat("a", [latex(`\\mathrm{dom}\\,f = ${ensembleLatex(domaineCaracteristiques(e))}`)]),
    piege(
      "a",
      e.discontinuite.type === "trou"
        ? [texte("En "), latex(`x = ${b5}`), texte(", les deux marqueurs sont vides : cette abscisse est exclue, même sans asymptote.")]
        : [texte("En "), latex(`x = ${b5}`), texte(", le cercle vide ne suffit pas à exclure l'abscisse : un point plein existe à la même abscisse, donc elle appartient au domaine.")],
    ),
    // b) Zéros
    utilise("b", [texte(`Les zéros sont les abscisses des points de la courbe situés sur l'axe des abscisses : `), latex("f(x)=0"), texte(` ${COURS_LECTURE}.`)]),
    calcul("b", zeros ? [...e.zeros].sort((a, b) => a - b).map((z) => ligne(`f(${n(z)})=0`, `la courbe coupe l'axe Ox en x = ${n(z).replace("-", "−")}`)) : [ligne("f(x)\\neq 0", "aucun point de la courbe sur l'axe Ox")]),
    resultat("b", zeros ? [latex(zeros)] : [texte("Aucun zéro : la courbe ne rencontre jamais l'axe des abscisses.")]),
    piege("b", [texte("Un zéro est une abscisse (une valeur de x), pas un point : on n'écrit pas ses deux coordonnées.")]),
    // c) Croissance
    utilise("c", [texte(`f est strictement croissante sur un intervalle où la courbe monte de gauche à droite ; une borne est exclue (crochet ouvert) en un cercle vide ou une asymptote ; deux morceaux séparés par une asymptote, un trou ou un intervalle sans tracé restent deux intervalles distincts ${COURS_LECTURE}.`)]),
    calcul("c", lignesIntervalles(e, croissanceAttendueCaracteristiques(e), "monte")),
    resultat("c", [texte("Strictement croissante sur "), latex(ensembleLatex(croissanceAttendueCaracteristiques(e))), texte(".")]),
    // d) Décroissance
    utilise("d", [texte(`f est strictement décroissante sur un intervalle où la courbe descend de gauche à droite ${COURS_LECTURE}.`)]),
    calcul("d", lignesIntervalles(e, decroissanceAttendueCaracteristiques(e), "descend")),
    resultat("d", [texte("Strictement décroissante sur "), latex(ensembleLatex(decroissanceAttendueCaracteristiques(e))), texte(".")]),
    piege("d", [texte("On ne réunit pas en un seul intervalle deux morceaux séparés par une asymptote, un trou ou un intervalle sans tracé.")]),
    // e) Constance
    utilise("e", [texte(`f est constante sur un intervalle où la courbe est un palier horizontal ; un intervalle sans tracé coupe le palier en plusieurs morceaux ${COURS_LECTURE}.`)]),
    calcul(
      "e",
      constance.map((m) => {
        const g = m.borneGauche as number;
        const d = m.borneDroite as number;
        return ligne(`f(${n(g)})=f(${n(d)})=${n(e.y3)}`, `palier horizontal de x = ${n(g).replace("-", "−")} à x = ${n(d).replace("-", "−")}, à la hauteur ${n(e.y3).replace("-", "−")}`);
      }),
    ),
    resultat("e", [texte("Constante sur "), latex(ensembleLatex(constance)), texte(".")]),
    // f) Ordonnée à l'origine
    utilise("f", [texte(`L'ordonnée à l'origine est l'ordonnée du point de la courbe d'abscisse 0 (sur l'axe Oy), s'il existe ${COURS_LECTURE}.`)]),
    calcul("f", ordonnee ? [ligne(`f(0)=${n(evaluerCourbeCaracteristiques(e, 0))}`, "la courbe coupe l'axe Oy à cette hauteur")] : [ligne("0\\notin\\mathrm{dom}\\,f", "aucun point de la courbe sur l'axe Oy")]),
    resultat("f", ordonnee ? [latex(`f(0) = ${n(evaluerCourbeCaracteristiques(e, 0))}`)] : [texte("0 n'appartient pas au domaine : f n'a pas d'ordonnée à l'origine.")]),
    // g) Valeur en v
    utilise("g", [texte("La valeur en "), latex(`x = ${n(e.v)}`), texte(` est l'ordonnée du point plein de la courbe d'abscisse ${n(e.v).replace("-", "−")} ; un cercle vide n'est pas un point de la courbe ${COURS_LECTURE}.`)]),
    calcul("g", valeur ? [ligne(`f(${n(e.v)})=${n(evaluerCourbeCaracteristiques(e, e.v))}`, "ordonnée du point plein")] : [ligne(`${n(e.v)}\\notin\\mathrm{dom}\\,f`, "seulement des cercles vides à cette abscisse")], lectureValeur(e)),
    resultat("g", valeur ? [latex(`f(${n(e.v)}) = ${n(evaluerCourbeCaracteristiques(e, e.v))}`)] : [latex(`f(${n(e.v)})`), texte(" n'existe pas.")]),
    piege("g", [texte("Ne pas lire la valeur sur un cercle vide : seul un point plein appartient à la courbe.")]),
    // h) Asymptotes
    utilise("h", [texte(`Une asymptote verticale a une équation « x = constante », une asymptote horizontale « y = constante » ${COURS_LECTURE}.`)]),
    calcul("h", [ligne(`x=${n(e.AV)}`, "la courbe longe cette droite verticale sans la toucher"), ligne(`y=${n(e.L)}`, "la courbe se rapproche de cette droite horizontale vers la droite")]),
    resultat("h", [latex(asymptotesLatex(e))]),
    piege("h", [texte("Ne pas inverser : l'asymptote verticale s'écrit "), latex("x = \\ldots"), texte(", l'horizontale "), latex("y = \\ldots"), texte(".")]),
  ];
}
