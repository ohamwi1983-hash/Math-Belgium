import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceEquationCercleDeveloppee } from "../../core/equationCercleDeveloppee.types";
import { q, qp, sansDoublons, somme } from "../../ui/corrigeChapitre3";
import { COURS_CERCLE, baseCarre, carreBinome, estFraction, lignesCompleterCarre, lignesRacine, finaliserAnalytique2 } from "../../ui/corrigeAnalytique2";
import { formatCentreAttenduLatex, formatCompletionLatex, formatEquationDeveloppeeLatex, formatRayonAttenduLatex, formatRegroupementLatex } from "../../ui/formatEquationCercleDeveloppee";

/**
 * Corrigé détaillé « comme au tableau » de gen50 « Centre et rayon d'un cercle depuis l'équation
 * développée » — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN
 * (regroupement → complétion → centre et rayon) ; partagé par l'adaptateur papier et l'appli
 * (`AppEquationCercleDeveloppee.tsx`). Méthode du cours (§ 8) : diviser par le coefficient commun,
 * regrouper, compléter chaque carré (une parenthèse à la fois), constantes au second membre ; rayon
 * exact pas à pas (racine d'un quotient, carré extrait). Notation de l'écran : rayon r.
 */

type E = ExerciceEquationCercleDeveloppee;

export function correctionDetailleeEquationCercleDeveloppee(e: E): EtapeCorrection[] {
  return finaliserAnalytique2(etapesEquationCercleDeveloppee(e));
}

function etapesEquationCercleDeveloppee(e: E): EtapeCorrection[] {
  const { k, bx, by, c, centre, rayonCarre } = e;
  const px = bx / k;
  const py = by / k;
  const Q = c / k;
  const equationDivisee = `${somme([
    [1, "x^2"],
    [1, "y^2"],
    [px, "x"],
    [py, "y"],
  ])}=${q(Q)}`;

  // a) Division et regroupement
  const lignesA: LigneCalcul[] = [ligne(formatEquationDeveloppeeLatex(e).replace(/\s+/g, ""), "l'équation donnée")];
  if (k !== 1) lignesA.push(ligne(equationDivisee, `on divise chaque terme des deux membres par ${k}`));
  lignesA.push(ligne(`(${somme([[1, "x^2"], [px, "x"]])})+(${somme([[1, "y^2"], [py, "y"]])})=${q(Q)}`, "on regroupe les termes en x et les termes en y"));

  // b) Complétion des carrés
  const ax = (px * px) / 4;
  const ay = (py * py) / 4;
  const sommeConstantes = `${q(Q)}+${q(ax)}+${q(ay)}`;
  // Ligne « on remplace » avec des fractions : trop longue pour la colonne de gauche (le bloc défilait
  // à 390 px) — mise entre accolades, elle occupe toute la largeur (même convention que gen95).
  const remplace = `${carreBinome(centre.x, "x")}-${q(ax)}+${carreBinome(centre.y, "y")}-${q(ay)}=${q(Q)}`;
  const lignesB: LigneCalcul[] = [
    ...lignesCompleterCarre(px, "x"),
    ...lignesCompleterCarre(py, "y"),
    ligne(estFraction(ax) || estFraction(ay) ? `{${remplace}}` : remplace, "on remplace chaque parenthèse"),
    ligne(
      estFraction(ax) && estFraction(ay) ? `{${carreBinome(centre.x, "x")}+${carreBinome(centre.y, "y")}=${sommeConstantes}}` : `${carreBinome(centre.x, "x")}+${carreBinome(centre.y, "y")}=${sommeConstantes}`,
      "les constantes passent dans le second membre",
    ),
  ];
  if (estFraction(ax) || estFraction(ay)) {
    lignesB.push(ligne(`=\\dfrac{${q(4 * Q)}+${q(4 * ax)}+${q(4 * ay)}}{4}`, "même dénominateur 4"));
    lignesB.push(ligne(`=\\dfrac{${q(4 * rayonCarre)}}{4}`));
  }
  lignesB.push(ligne(`=${q(rayonCarre)}`));

  // c) Centre et rayon
  const lignesC: LigneCalcul[] = [
    ligne(`x_0=${q(centre.x)}`, [latex(`${carreBinome(centre.x, "x")}`), texte(" : on lit "), latex("(x-x_0)^2"), texte(centre.x < 0 ? ", le signe change" : "")]),
    ligne(`y_0=${q(centre.y)}`, [latex(`${carreBinome(centre.y, "y")}`), texte(" : on lit "), latex("(y-y_0)^2"), texte(centre.y < 0 ? ", le signe change" : "")]),
    ligne(`r^2=${q(rayonCarre)}`, "le second membre"),
    ...lignesRacine("r", rayonCarre, "un rayon est positif"),
  ];

  const negatif = centre.x < 0 ? { v: "x" as const, c: centre.x } : centre.y < 0 ? { v: "y" as const, c: centre.y } : null;
  const etapesAB: EtapeCorrection[] = [
    utilise("a", [
      texte(k === 1 ? "Les termes en x et les termes en y sont regroupés dans deux parenthèses, la constante reste dans le second membre " : `x² et y² ont le même coefficient ${k} : on divise les deux membres par ${k}, puis on regroupe les termes en x et les termes en y `),
      texte(COURS_CERCLE + "."),
    ]),
    calcul("a", sansDoublons(lignesA)),
    resultat("a", [texte("Équation regroupée : "), latex(formatRegroupementLatex(e)), texte(".")]),
    piege("a", [texte(k === 1 ? "La constante reste dans le second membre avec son signe : elle ne change pas de membre ici." : `On divise tous les termes par ${k}, le second membre compris : sinon le centre et le rayon sont faux.`)]),

    utilise("b", [texte("Compléter le carré dans chaque parenthèse : "), latex("x^2+px=\\left(x+\\dfrac{p}{2}\\right)^2-\\left(\\dfrac{p}{2}\\right)^2"), texte(`, puis faire passer les constantes dans le second membre ${COURS_CERCLE}.`)]),
    calcul("b", sansDoublons(lignesB)),
    resultat("b", [texte("Forme complétée : "), latex(formatCompletionLatex(e)), texte(".")]),
    piege("b", [texte("Le carré ajouté dans la parenthèse doit être retranché aussitôt (ou ajouté au second membre) : sinon l'équation change.")]),
  ];
  if (e.variante === "est_ce_un_cercle") return [...etapesAB, ...etapesNature(e)];
  return [
    ...etapesAB,
    utilise("c", [texte("Par comparaison avec "), latex("(x-x_0)^2+(y-y_0)^2=r^2"), texte(` : le centre est (x₀ ; y₀) et le second membre est r², positif ${COURS_CERCLE}.`)]),
    calcul("c", sansDoublons(lignesC)),
    resultat("c", [texte("Cercle de centre "), latex(`C${formatCentreAttenduLatex(e)}`), texte(" et de rayon "), latex(`r=${formatRayonAttenduLatex(e)}`), texte(".")]),
    verification("c", [texte("Centre et rayon redonnent l'équation divisée "), latex(equationDivisee), texte(" : ")], verifCoefficients(centre, rayonCarre, px, py, Q)),
    piege(
      "c",
      negatif
        ? [texte("Attention aux signes : "), latex(carreBinome(negatif.c, negatif.v)), texte(" correspond à "), latex(`${negatif.v}_0=${q(negatif.c)}`), texte(". Et le second membre vaut "), latex("r^2"), texte(", pas r.")]
        : [texte("Le second membre de la forme complétée vaut "), latex("r^2"), texte(" : il faut encore en prendre la racine carrée pour obtenir le rayon.")],
    ),
  ];
}

/** Variante « Est-ce un cercle ? » (audit 4e ch. 7, G12) : c) le signe du second membre décide. */
function etapesNature(e: E): EtapeCorrection[] {
  const { centre, rayonCarre } = e;
  const binomes = `${carreBinome(centre.x, "x")}+${carreBinome(centre.y, "y")}`;
  const utiliseC = utilise("c", [
    texte("Une somme de deux carrés est toujours positive ou nulle, et elle n'est nulle que si les deux carrés le sont. Second membre strictement positif : cercle de rayon sa racine ; nul : un seul point ; négatif : aucun point " + COURS_CERCLE + "."),
  ]);
  if (rayonCarre > 1e-9) {
    return [
      utiliseC,
      calcul("c", [
        ligne(`${q(rayonCarre)}>0`, "le second membre est strictement positif : c'est un cercle"),
        ligne(`x_0=${q(centre.x)}`, [latex(carreBinome(centre.x, "x")), texte(" : on lit "), latex("(x-x_0)^2"), texte(centre.x < 0 ? ", le signe change" : "")]),
        ligne(`y_0=${q(centre.y)}`, [latex(carreBinome(centre.y, "y")), texte(" : on lit "), latex("(y-y_0)^2"), texte(centre.y < 0 ? ", le signe change" : "")]),
        ligne(`r^2=${q(rayonCarre)}`, "le second membre"),
        ...lignesRacine("r", rayonCarre, "un rayon est positif"),
      ]),
      resultat("c", [texte("C'est un cercle, de centre "), latex(`C${formatCentreAttenduLatex(e)}`), texte(" et de rayon "), latex(`r=${formatRayonAttenduLatex(e)}`), texte(".")]),
      piege("c", [texte("Avant de prendre la racine, on vérifie le signe du second membre : c'est lui qui dit si l'équation est celle d'un cercle.")]),
    ];
  }
  if (Math.abs(rayonCarre) <= 1e-9) {
    return [
      utiliseC,
      calcul("c", [
        ligne(`${binomes}=0`, "le second membre est nul"),
        ligne(`${carreBinome(centre.x, "x")}=0 \\text{ et } ${carreBinome(centre.y, "y")}=0`, "deux carrés de somme nulle sont nuls tous les deux"),
        ligne(`x=${q(centre.x)} \\text{ et } y=${q(centre.y)}`),
      ]),
      resultat("c", [texte("Ce n'est pas un cercle : seul le point "), latex(formatCentreAttenduLatex(e)), texte(" vérifie l'équation.")]),
      piege("c", [texte("Un second membre nul ne donne pas un cercle de rayon 0 à tracer : l'ensemble se réduit à un point.")]),
    ];
  }
  return [
    utiliseC,
    calcul("c", [
      ligne(`${binomes}=${q(rayonCarre)}`, "le second membre est négatif"),
      ligne(`${binomes}\\geq 0`, "une somme de deux carrés est positive ou nulle"),
    ]),
    resultat("c", [texte("Ce n'est pas un cercle : aucun point ne vérifie l'équation (une somme de carrés ne vaut jamais "), latex(q(rayonCarre)), texte(").")]),
    piege("c", [texte("On ne prend pas la racine d'un nombre négatif : il n'y a ni rayon ni cercle.")]),
  ];
}

/** −2x₀, −2y₀ et x₀² + y₀² − r² comparés aux coefficients de l'équation divisée. */
function verifCoefficients(c: { x: number; y: number }, r2: number, px: number, py: number, Q: number): LigneCalcul[] {
  return [
    ligne(`-2x_0=-2\\cdot ${qp(c.x)}`, ""),
    ligne(`=${q(-2 * c.x)}`, [texte("c'est le coefficient de x, "), latex(q(px))]),
    ligne(`-2y_0=-2\\cdot ${qp(c.y)}`),
    ligne(`=${q(-2 * c.y)}`, [texte("c'est le coefficient de y, "), latex(q(py))]),
    ligne(`x_0^2+y_0^2-r^2=${baseCarre(c.x)}^2+${baseCarre(c.y)}^2-${q(r2)}`),
    ligne(`=${q(c.x * c.x + c.y * c.y - r2)}`, [texte("c'est la constante ramenée au premier membre, "), latex(`-${qp(Q)}`)]),
  ];
}

