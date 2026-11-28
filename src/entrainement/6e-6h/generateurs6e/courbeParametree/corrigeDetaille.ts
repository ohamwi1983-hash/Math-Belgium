import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceCP } from "../../core6e/courbeParametree";
import { extremites, identite } from "../../core6e/courbeParametree";
import { listeL, nL } from "../../ui6e/outilsLieuxLotH2";
import { conditionJusteL, equationL, fracL, figureCP, LIBELLES_IDENTITE, LIBELLES_PARTIE, natureCourbe, premiereLigneL } from "../../ui6e/formatCourbeParametree";

/**
 * Corrigé détaillé « comme au tableau » de `6gen129`, une lettre par écran : a) la technique
 * d'élimination ; b) l'élimination, une transformation par ligne, jusqu'à l'équation cartésienne ;
 * c) la partie décrite (valeurs prises par cos t, sin t, t², cos² t sur l'intervalle) ; d) la
 * condition, avec la figure (courbe complète en gris, partie décrite en couleur, extrémités).
 */

type E = ExerciceCP;
const ft = texte;
const L = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });
const fr = (x: unknown) => x as FragmentConsigne[];
const moins = (v: string, c: number) => (c === 0 ? v : `${v}${c > 0 ? "-" : "+"}${nL(Math.abs(c))}`);
const par = (v: string, c: number) => (c === 0 ? v : `(${moins(v, c)})`);
const fois = (k: number) => (k === 1 ? "" : k === -1 ? "-" : nL(k));

function lignesElimination(e: E): LigneCalcul[] {
  switch (e.variante) {
    case "cercle": {
      const fx = e.r === 1 ? par("x", e.a) : `\\left(\\dfrac{${moins("x", e.a)}}{${e.r}}\\right)`;
      const fy = e.r === 1 ? par("y", e.b) : `\\left(\\dfrac{${moins("y", e.b)}}{${e.r}}\\right)`;
      return [
        ligne(premiereLigneL(e), [L("\\cos t"), ft(" et "), L("\\sin t"), ft(" isolés")]),
        ligne(`${fx}^2+${fy}^2=1`, [L("\\cos^2 t+\\sin^2 t=1")]),
        ...(e.r === 1 ? [] : [ligne(equationL(e), `on multiplie par ${e.r * e.r}`)]),
      ];
    }
    case "astroide": {
      const c = Math.round(Math.cbrt(e.r) ** 2);
      return [
        ligne(premiereLigneL(e), "racine cubique"),
        ligne(e.r === 1 ? "x^{2/3}+y^{2/3}=1" : `\\left(\\dfrac{x}{${e.r}}\\right)^{2/3}+\\left(\\dfrac{y}{${e.r}}\\right)^{2/3}=1`, [L("\\cos^2 t+\\sin^2 t=1")]),
        ...(e.r === 1 ? [] : [ligne(`x^{2/3}+y^{2/3}=${e.r}^{2/3}=${c}`, [ft("on multiplie par "), L(`${e.r}^{2/3}`)])]),
      ];
    }
    case "parabole":
      if (e.partie === "entiere") return [ligne(premiereLigneL(e), [ft("on isole "), L("t")]), ligne(equationL(e), "on remplace dans y")];
      if (e.partie === "moitie") return [ligne(premiereLigneL(e), [ft("on isole "), L("t^2")]), ligne(`y=${nL(e.q)}${e.k < 0 ? "-" : "+"}${Math.abs(e.k) === 1 ? "" : nL(Math.abs(e.k))}\\left(t^2\\right)^2`.replace(/^y=0\+/, "y=").replace(/^y=0-/, "y=-"), [L("t^4=\\left(t^2\\right)^2")]), ligne(equationL(e), [ft("on remplace "), L("t^2")])];
      return [
        ligne(premiereLigneL(e), [ft("on isole "), L("\\cos t")]),
        ligne(`\\cos(2t)=2\\cos^2 t-1=2${par("x", e.p)}^2-1`, "formule de duplication"),
        ligne(`y=${nL(e.q)}${e.k < 0 ? "-" : "+"}${Math.abs(e.k) === 1 ? "" : nL(Math.abs(e.k))}\\left(2${par("x", e.p)}^2-1\\right)`.replace(/^y=0\+/, "y=").replace(/^y=0-/, "y=-"), "on remplace dans y"),
        ligne(equationL(e), "on développe"),
      ];
    case "droite": {
      const v = e.partie === "entiere" ? "t" : e.partie === "moitie" ? "t^2" : "\\cos^2 t";
      if (e.partie === "arc") {
        const sy = fracL("y", e.q, e.v);
        const sx = fracL("x", e.p, e.u);
        return [ligne(premiereLigneL(e), [ft("on isole "), L("\\cos^2 t")]), ligne(`\\sin^2 t=${sy}`, [ft("on isole "), L("\\sin^2 t")]), ligne(`${sx}${sy.startsWith("-") ? "" : "+"}${sy}=1`, [L("\\cos^2 t+\\sin^2 t=1")]), ligne(equationL(e), "on multiplie et on regroupe")];
      }
      const sx = fracL("x", e.p, e.u);
      const terme = `${fois(e.v)}${/^[a-z]$/.test(sx) ? sx : `\\left(${sx}\\right)`}`;
      return [ligne(premiereLigneL(e), [ft("on isole "), L(v === "t" ? "t" : "t^2")]), ligne(`y=${e.q ? nL(e.q) : ""}${e.q && !terme.startsWith("-") ? "+" : ""}${terme}`, [ft("on remplace "), L(v), ft(" dans "), L("y")]), ligne(equationL(e), "on multiplie et on regroupe")];
    }
  }
}

function raisonnementPartie(e: E): FragmentConsigne[] {
  const centre = e.variante === "cercle" ? `(${nL(e.a)}\\,;${nL(e.b)})` : "(0\\,;0)";
  if (e.variante === "cercle" || e.variante === "astroide") {
    if (e.partie === "entiere") return [L("t"), ft(" fait un tour complet : le couple "), L("(\\cos t\\,;\\sin t)"), ft(" prend toutes les positions du cercle trigonométrique, chaque point de la courbe est atteint.")];
    if (e.partie === "moitie") {
      const [signe, libre, ou] = [
        ["\\sin t\\geq 0", "\\cos t", "au-dessus du centre"],
        ["\\cos t\\leq 0", "\\sin t", "à gauche du centre"],
        ["\\sin t\\leq 0", "\\cos t", "en dessous du centre"],
        ["\\cos t\\geq 0", "\\sin t", "à droite du centre"],
      ][e.indice]!;
      return [ft("Sur cet intervalle, "), L(signe!), ft(" et "), L(libre!), ft(" prend toutes les valeurs de "), L("-1"), ft(" à "), L("1"), ft(` : seuls les points ${ou} `), L(centre), ft(" sont atteints, une moitié de la courbe.")];
    }
    const signes = ["\\cos t\\geq 0,\\ \\sin t\\geq 0", "\\cos t\\leq 0,\\ \\sin t\\geq 0", "\\cos t\\leq 0,\\ \\sin t\\leq 0", "\\cos t\\geq 0,\\ \\sin t\\leq 0"][e.indice]!;
    return [ft("Sur ce quart de tour, "), L(signes), ft(" : un seul quart de la courbe, autour du centre "), L(centre), ft(".")];
  }
  if (e.variante === "parabole") {
    if (e.partie === "entiere") return [L("t"), ft(" parcourt "), L("\\mathbb{R}"), ft(", donc "), L(`x=${e.p ? `${nL(e.p)}+` : ""}t`), ft(" prend toutes les valeurs réelles : toute la parabole est décrite.")];
    if (e.partie === "moitie") return [L("t^2\\geq 0"), ft(" prend toutes les valeurs positives, donc "), L(e.s > 0 ? `x\\geq ${nL(e.p)}` : `x\\leq ${nL(e.p)}`), ft(" : une seule moitié de la parabole, d'un côté de son axe.")];
    return [L("\\cos t"), ft(" ne prend que les valeurs de "), L("-1"), ft(" à "), L("1"), ft(", donc "), L(`${nL(e.p - 1)}\\leq x\\leq ${nL(e.p + 1)}`), ft(" : un arc de parabole, borné.")];
  }
  if (e.partie === "entiere") return [L("t"), ft(" parcourt "), L("\\mathbb{R}"), ft(" : x prend toutes les valeurs réelles, toute la droite est décrite.")];
  if (e.partie === "moitie") return [L("t^2\\geq 0"), ft(" prend toutes les valeurs positives : M part du point "), L(`(${nL(e.p)}\\,;${nL(e.q)})`), ft(" dans un seul sens, une demi-droite.")];
  return [L("\\cos^2 t"), ft(" ne prend que les valeurs de "), L("0"), ft(" à "), L("1"), ft(" : x reste entre "), L(nL(Math.min(e.p, e.p + e.u))), ft(" et "), L(nL(Math.max(e.p, e.p + e.u))), ft(", un segment.")];
}

export function correctionDetailleeCP(e: E): EtapeCorrection[] {
  const id = identite(e);
  const lib = LIBELLES_IDENTITE[id];
  const fig = figureCP(e, true);
  const etapes: EtapeCorrection[] = [
    utilise("a", [ft("Pour éliminer t, il faut une relation entre les expressions de x et de y qui ne contienne plus t (cours, point 6).")]),
    resultat("a", lib.latex ? [ft(lib.texte), L(lib.latex), ft(".")] : [ft(`${lib.texte}.`)]),
    utilise("b", id === "isoler" ? [ft("On isole le paramètre (ou son carré) dans x, puis on le remplace dans y.")] : [ft("Identité : "), L(lib.latex!), ft(" (cours, point 6).")]),
    calcul("b", lignesElimination(e)),
    resultat("b", [L(equationL(e)), ft(" : "), ...fr(natureCourbe(e)), ft(".")]),
    piege("b", e.variante === "astroide" ? [ft("Écrire "), L("x^{2/3}"), ft(" comme une racine cubique de "), L("x^2"), ft(" : elle a un sens aussi pour x < 0 (la courbe est symétrique).")] : e.variante === "parabole" && e.partie === "arc" ? [ft("Confondre "), L("\\cos(2t)"), ft(" avec "), L("\\cos^2 t"), ft(".")] : [ft("Oublier de diviser (ou de multiplier) tous les termes en isolant le paramètre.")]),
    utilise("c", [ft("La partie décrite dépend des valeurs que prennent les expressions de t sur l'intervalle (cours, point 5 : la restriction).")]),
    calcul("c", [], raisonnementPartie(e), "Raisonnement"),
    { ...resultat("c", [ft(LIBELLES_PARTIE[e.variante][e.partie]), ft(".")]), ...(e.partie === "entiere" ? { figureHtml: fig } : {}) },
  ];
  if (e.partie === "entiere") {
    etapes.push(piege("c", [ft("Restreindre « par réflexe » : ici, chaque point de la courbe est atteint.")]));
    return etapes;
  }
  const ext = extremites(e);
  const motExt = ext.length === 2 ? " ; extrémités " : e.variante === "parabole" ? " ; à partir du sommet " : " ; origine ";
  etapes.push({ ...resultat("d", [L(conditionJusteL(e)), ft(motExt), L(listeL(ext)), ft(".")]), figureHtml: fig });
  etapes.push(piege("d", [ft("Donner toute la courbe d'équation trouvée : le lieu complet n'est atteint que si t prend assez de valeurs.")]));
  return etapes;
}
