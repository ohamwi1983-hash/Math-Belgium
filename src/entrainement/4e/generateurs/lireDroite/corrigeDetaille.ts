import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { DroiteTracee, EquationDonnee, ExerciceLireDroite } from "../../core/lireDroite.types";
import { plusQ, q, qp, somme } from "../../ui/corrigeChapitre3";
import { NOMS, coefficients, piegeRole, equationL, expliciteY, figureAssociation, figureImpossible, figureLecture, reponseAssociation, reponseImpossible, reponseLecture } from "../../ui/formatLireDroite";
import { colonne, nombreTexte } from "../../ui/outilsAnalytiqueLotG";

/**
 * Corrigé détaillé « comme au tableau » de gen132 (partagé par l'adaptateur et l'appli, une lettre
 * par écran). a)–d) une droite chacune : p lu sur l'axe Oy, m lu en escalier (ou « tous les points ont
 * la même ordonnée / abscisse »), puis l'équation retenue ramenée à ces caractéristiques (y isolé,
 * vecteur directeur et point de départ d'une paramétrique) ; figure annotée. e) p, m en escalier,
 * vérification par le second nœud. f) g horizontale ou verticale : l'écriture qui n'existe pas.
 */

type E = ExerciceLireDroite;
const LETTRES = "abcdef";
const T = texte;
const L = latex;
const COURS = "(cours, point 1 à point 3)";

const fig = (svg: string) => `<div style="max-width:6.5cm;margin:6px auto">${svg}</div>`;

/** Lecture de la figure : p et m en escalier (oblique), ou la coordonnée constante. */
function lignesFigure(d: DroiteTracee): LigneCalcul[] {
  if (d.type === "horizontale") return [ligne(`y=${q(d.k)}`, `tous les points de la droite ont l'ordonnée ${nombreTexte(d.k)} : droite horizontale`)];
  if (d.type === "verticale") return [ligne(`x=${q(d.k)}`, `tous les points de la droite ont l'abscisse ${nombreTexte(d.k)} : droite verticale`)];
  const sens = d.num > 0 ? "monte" : "descend";
  return [
    ligne(`p=${q(d.p)}`, `la droite coupe l'axe Oy au point (0 ; ${nombreTexte(d.p)})`),
    ligne(`m=${d.den === 1 ? q(d.num) : d.num < 0 ? `\\dfrac{${q(d.num)}}{${d.den}}=${q(d.num / d.den)}` : `\\dfrac{${q(d.num)}}{${d.den}}`}`, `en avançant de ${d.den} carreau${d.den > 1 ? "x" : ""}, la droite ${sens} de ${Math.abs(d.num)}`),
  ];
}

/** L'équation retenue, ramenée aux caractéristiques lues. */
function lignesEquation(eq: EquationDonnee, nom: string): LigneCalcul[] {
  const d = eq.droite;
  const ecrite = equationL(eq);
  if (eq.forme === "parametrique") {
    const lignes: LigneCalcul[] = [ligne(`\\vec{u}=${colonne(eq.dir.x, eq.dir.y)}`, `vecteur directeur de l'équation ${nom}`)];
    if (d.type === "oblique") {
      lignes.push(ligne(`m=\\dfrac{${q(eq.dir.y)}}{${q(eq.dir.x)}}=${q(d.num / d.den)}`, [T("pente "), L("\\dfrac{\\beta}{\\alpha}")]));
      lignes.push(ligne(`${q(d.num / d.den)}\\cdot ${qp(eq.P0.x)}${plusQ(d.p)}=${q(eq.P0.y)}`, [T("le point de départ "), L(`(${q(eq.P0.x)}\\,;\\,${q(eq.P0.y)})`), T(" (t = 0) est sur la droite lue")]));
    } else if (d.type === "horizontale") lignes.push(ligne(`y=${q(d.k)}`, "seconde composante nulle : y ne change pas, pour tout t"));
    else lignes.push(ligne(`x=${q(d.k)}`, "première composante nulle : x ne change pas, pour tout t"));
    return lignes;
  }
  if (eq.forme === "explicite-y" || (eq.forme === "explicite-x" && d.type === "verticale")) {
    return [ligne(ecrite, `équation ${nom} : on lit directement ${d.type === "oblique" ? "m et p" : d.type === "horizontale" ? "y" : "x"}`)];
  }
  if (eq.forme === "implicite") {
    const c = coefficients(d);
    if (d.type === "horizontale") return [ligne(ecrite, `équation ${nom}`), ligne(`y=${q(d.k)}`, "on isole y")];
    if (d.type === "verticale") return [ligne(ecrite, `équation ${nom}`), ligne(`x=${q(d.k)}`, "on isole x")];
    return [
      ligne(ecrite, `équation ${nom}`),
      ...(c.b === 1 ? [] : [ligne(`${c.b === -1 ? "-" : q(c.b)}y=${somme([[-c.a, "x"], [-c.c, ""]])}`, "on isole le terme en y")]),
      ligne(expliciteY(d), c.b === 1 ? "on isole y" : `on divise par ${nombreTexte(c.b)}`),
    ];
  }
  // explicite en x d'une droite oblique : x = ny + q → y isolé.
  return [ligne(ecrite, `équation ${nom}`), ligne(expliciteY(d), "on isole y")];
}

function etapeAssociation(e: E, n: number): EtapeCorrection[] {
  const sq = LETTRES[n]!;
  const i = e.ordre[n]!;
  const eq = e.equations[i]!;
  const nom = NOMS[i]!;
  return [
    utilise(sq, [
      T("Lire une droite "),
      T(COURS),
      T(" : p là où elle coupe l'axe Oy, m « en escalier » ("),
      L("m=\\dfrac{\\Delta y}{\\Delta x}"),
      T(") ; une équation sans y est verticale, sans x horizontale. Pour comparer, on ramène chaque équation à "),
      L("y=mx+p"),
      T(" (ou à "),
      L("x=k"),
      T(", "),
      L("y=k"),
      T(")."),
    ]),
    calcul(sq, [...lignesFigure(eq.droite), ...lignesEquation(eq, nom)]),
    { ...resultat(sq, reponseAssociation(e, n)), figureHtml: fig(figureAssociation(e, n, true)) },
    piege(sq, piegeRole(eq, e.variante === "axe")),
  ];
}

function etapeLecture(e: E): EtapeCorrection[] {
  const { num, den, p } = e.lecture;
  const m = num / den;
  const d: DroiteTracee = { type: "oblique", num, den, p };
  return [
    utilise("e", [T("Sur "), L("y=mx+p"), T(", p se lit là où la droite coupe l'axe Oy, et m en « escalier » : on avance vers la droite et on compte de combien la droite monte ou descend (cours, point 2).")]),
    calcul("e", lignesFigure(d)),
    { ...resultat("e", [...reponseLecture(e), T(", donc "), L(expliciteY(d)), T(".")]), figureHtml: fig(figureLecture(e, true)) },
    verification("e", [T("Le nœud "), L(`(${den}\\,;\\,${q(p + num)})`), T(" de la droite vérifie l'équation :")], [ligne(`${q(m)}\\cdot ${den}${plusQ(p)}=${q(p + num)}`, "le point est bien sur la droite")]),
    piege("e", [T("La pente est la montée divisée par l'avancée, avec son signe ; l'ordonnée à l'origine se lit sur l'axe Oy, pas sur l'axe Ox.")]),
  ];
}

function etapeImpossible(e: E): EtapeCorrection[] {
  const g = e.impossible;
  const v = g.type === "verticale";
  return [
    utilise("f", [T("Une droite verticale n'a pas de pente : pas d'écriture "), L("y=mx+p"), T(". Une droite horizontale n'a pas d'écriture "), L("x=ny+q"), T(". L'implicite et la paramétrique existent toujours (cours, point 1).")]),
    calcul("f", [
      ligne(v ? `x=${q(g.k)}` : `y=${q(g.k)}`, v ? `tous les points de g ont l'abscisse ${nombreTexte(g.k)} : g est verticale` : `tous les points de g ont l'ordonnée ${nombreTexte(g.k)} : g est horizontale`),
      ligne(`\\vec{u}=${v ? colonne(0, 1) : colonne(1, 0)}`, v ? "vecteur directeur vertical : pas de pente" : "vecteur directeur horizontal : y ne change pas"),
    ]),
    { ...resultat("f", [T("Impossible pour g : "), ...reponseImpossible(e), T(".")]), figureHtml: fig(figureImpossible(e, true)) },
    verification("f", [T("Les autres écritures existent : "), L(v ? `x${plusQ(-g.k)}=0` : `y${plusQ(-g.k)}=0`), T(" (implicite), "), L(v ? `x=${q(g.k)}` : `y=${q(g.k)}`), T(v ? " (explicite en x, avec n = 0) et " : " (explicite en y, avec m = 0) et "), L(v ? `\\begin{cases}x=${q(g.k)}\\\\y=t\\end{cases}` : `\\begin{cases}x=t\\\\y=${q(g.k)}\\end{cases}`), T(".")]),
    piege(
      "f",
      v
        ? [T("Une droite verticale s'écrit "), L("x=k"), T(" : c'est "), L("y=mx+p"), T(" qui est impossible, pas "), L("x=ny+q"), T(" (avec n = 0).")]
        : [T("Une droite horizontale s'écrit "), L("y=k"), T(" (avec m = 0) : c'est "), L("x=ny+q"), T(" qui est impossible.")],
    ),
  ];
}

export function correctionDetailleeLireDroite(e: E): EtapeCorrection[] {
  return [...[0, 1, 2, 3].flatMap((n) => etapeAssociation(e, n)), ...etapeLecture(e), ...etapeImpossible(e)];
}
