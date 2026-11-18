import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceChoisirModele, FamilleModele } from "./types";
import { evaluerModele, expressionModeleLatex, INFOS_CONTEXTE, modeleLatex, nombreLatex, nombreTexte } from "./modele";
import { ecartsLecture, REFERENCE_LATEX, reponseUtilisationLatex, transformationsLatex } from "./textes";
import { construireFigureModele, PALETTE_PAPIER } from "./figure";
import { COURS_FAMILLES, COURS_TRANSFORMATIONS } from "../../ui/corrigeChapitre3";

/**
 * Corrigé détaillé « comme au tableau » de gen69 (choisir le bon modèle) — règle
 * `.claude/rules/feuilles-evaluations.md`. Cinq étapes = cinq écrans : a) famille, b) lecture des
 * transformations (point caractéristique, puis facteur à l'aide d'un point marqué), c) modèle,
 * d) utilisation (prédire ou résoudre), e) sens d'un paramètre. Valeurs tirées des fonctions de
 * l'écran (`modele.ts`, `textes.ts`) ; partagé par l'adaptateur papier et l'appli.
 */

type E = ExerciceChoisirModele;
const n = nombreLatex;
const np = (v: number) => (v < 0 ? `(${n(v)})` : n(v));

const NOM_REFERENCE: Record<FamilleModele, string> = {
  carre: "la fonction carré",
  cube: "la fonction cube",
  racine_carree: "la fonction racine carrée",
  racine_cubique: "la fonction racine cubique",
  inverse: "la fonction inverse",
  valeur_absolue: "la fonction valeur absolue",
};

/** g(u) écrit pour un nombre u. */
function gLatex(famille: FamilleModele, u: string): string {
  switch (famille) {
    case "carre":
      return `${u}^2`;
    case "cube":
      return `${u}^3`;
    case "racine_carree":
      return `\\sqrt{${u}}`;
    case "racine_cubique":
      return `\\sqrt[3]{${u}}`;
    case "inverse":
      return `\\dfrac{1}{${u}}`;
    case "valeur_absolue":
      return `|${u}|`;
  }
}

function g(famille: FamilleModele, u: number): number {
  return evaluerModele({ famille, th: 0, tv: 0, a: 1 }, u);
}

function etapeFamille(e: E): EtapeCorrection[] {
  const { variable: v, fonction: f } = INFOS_CONTEXTE[e.contexte];
  const autres = e.points.filter((p) => p.x !== e.th);
  let lignes: LigneCalcul[];
  if (e.famille === "racine_carree" || e.famille === "racine_cubique") {
    const nature = e.famille === "racine_carree" ? "carré parfait" : "cube parfait";
    lignes = autres.flatMap((p) => {
      const dx = p.x - e.th;
      const r = e.famille === "racine_carree" ? Math.round(Math.sqrt(dx)) : Math.round(Math.cbrt(dx));
      return [ligne(`${n(p.x)}-${np(e.th)}=${n(dx)}`, `écart horizontal au point de départ : ${nature} (${nombreTexte(r)}${e.famille === "racine_carree" ? "²" : "³"})`)];
    });
  } else if (e.famille === "inverse") {
    lignes = [ligne(`${v}=${n(e.th)}`, "asymptote verticale"), ligne(`${f}=${n(e.tv)}`, "asymptote horizontale : une branche d'hyperbole")];
  } else if (e.famille === "cube") {
    lignes = [ligne(`\\text{centre}=(${n(e.th)}\\,;\\,${n(e.tv)})`, "replat au centre de la courbe en S")];
  } else {
    lignes = [ligne(`${v}=${n(e.th)}`, e.famille === "carre" ? "axe de symétrie vertical ; creux arrondi : une parabole" : "axe de symétrie vertical ; une pointe : un V")];
  }
  return [
    utilise("a", [texte(`Chaque fonction de référence a une allure propre (axe ou centre de symétrie, pointe ou creux, demi-branche, asymptotes) ; pour une demi-branche, les écarts horizontaux depuis le point de départ trahissent la racine carrée (1, 4, 9…) ou cubique (1, 8, 27…) ${COURS_FAMILLES}.`)]),
    calcul("a", lignes, [texte("Ce qu'on lit sur la courbe :")]),
    resultat("a", [texte(`La courbe est issue de ${NOM_REFERENCE[e.famille]} `), latex(REFERENCE_LATEX[e.famille]), texte(".")]),
  ];
}

function etapeTransformations(e: E): EtapeCorrection[] {
  const p = e.points[e.indexLecture]!;
  const { dx, dy, ref } = ecartsLecture(e);
  const refLatex = e.famille === "inverse" ? `\\dfrac{1}{${n(dx)}}` : n(ref);
  const facteur = Math.abs(e.a);
  const refAbs = e.famille === "inverse" ? `\\dfrac{1}{${n(Math.abs(dx))}}` : n(Math.abs(ref));
  return [
    utilise("b", [
      texte("Le point caractéristique donne TH (abscisse) et TV (ordonnée) : seules les translations le déplacent. Pour un même écart horizontal, "),
      latex("\\text{facteur}=\\dfrac{\\text{écart vertical sur la courbe}}{\\text{écart vertical de la référence}}"),
      texte(` ; si la courbe descend là où la référence monte, il y a une symétrie d'axe horizontal ${COURS_TRANSFORMATIONS}.`),
    ]),
    {
      ...calcul(
        "b",
        [
          ligne(`(\\text{TH}\\,;\\,\\text{TV})=(${n(e.th)}\\,;\\,${n(e.tv)})`, "point caractéristique lu sur le graphique"),
          ligne(`\\Delta x=${n(p.x)}-${np(e.th)}`, [texte("point marqué "), latex(`(${n(p.x)}\\,;\\,${n(p.y)})`), texte(" : écart horizontal")]),
          ligne(`=${n(dx)}`),
          ligne(`\\Delta y=${n(p.y)}-${np(e.tv)}`, "écart vertical sur la courbe"),
          ligne(`=${n(dy)}`),
          ligne(`g(${n(dx)})=${gLatex(e.famille, np(dx))}`, "écart vertical de la référence pour le même écart horizontal"),
          ...(e.famille === "inverse" ? [] : [ligne(`=${refLatex}`)]),
          ligne(`\\text{facteur}=${n(Math.abs(dy))}\\div ${refAbs}`),
          ligne(`=${n(facteur)}`, e.a < 0 ? "et la courbe descend là où la référence monte : symétrie" : "sans symétrie"),
        ],
      ),
      figureHtml: construireFigureModele(e, { palette: PALETTE_PAPIER, annoter: true, classe: "figure-corrige" }),
    },
    resultat("b", [latex(transformationsLatex(e))]),
    piege("b", [texte("Le facteur se calcule avec les écarts au point caractéristique, pas avec les coordonnées du point marqué.")]),
  ];
}

function etapeModele(e: E): EtapeCorrection[] {
  const info = INFOS_CONTEXTE[e.contexte];
  const v = info.variable;
  const p = e.points[e.indexLecture]!;
  const piegeTh: FragmentConsigne[] =
    e.th !== 0
      ? [texte("Le point caractéristique est en "), latex(`${v} = ${n(e.th)}`), texte(" : la translation s'écrit "), latex(`(${v}-${n(e.th)})`), texte(", avec un signe « − », et non "), latex(`(${v}+${n(e.th)})`), texte(".")]
      : [texte("Le point caractéristique ne bouge qu'avec les translations : un étirement ne le déplace pas.")];
  return [
    utilise("c", [texte("Le modèle s'écrit "), latex(`${info.fonction}(${v})=a\\cdot g(${v}-\\text{TH})+\\text{TV}`), texte(`, où a est le facteur (négatif s'il y a une symétrie), dans la variable ${v} de la situation ${COURS_TRANSFORMATIONS}.`)]),
    calcul("c", [
      ligne(`${info.fonction}(${v})=a\\cdot g(${v}-\\text{TH})+\\text{TV}`, "forme du modèle"),
      ligne(modeleLatex(e), [texte("avec "), latex(`a=${n(e.a)}`), texte(", "), latex(`\\text{TH}=${n(e.th)}`), texte(", "), latex(`\\text{TV}=${n(e.tv)}`)]),
    ]),
    resultat("c", [latex(modeleLatex(e))]),
    verification("c", [texte("Le point marqué doit vérifier le modèle :")], [ligne(`${info.fonction}(${n(p.x)})=${expressionModeleLatex(e, np(p.x))}`), ligne(`=${n(p.y)}`, "ordonnée du point marqué ✓")]),
    piege("c", piegeTh),
  ];
}

function etapeUtilisation(e: E): EtapeCorrection[] {
  const info = INFOS_CONTEXTE[e.contexte];
  const v = info.variable;
  const q = e.question4;
  const arg = e.th === 0 ? v : `${v}-${n(e.th)}`;
  const lignes: LigneCalcul[] = [];
  if (q.type === "predire") {
    const u = q.x - e.th;
    const gu = g(e.famille, u);
    lignes.push(ligne(`${info.fonction}(${n(q.x)})=${expressionModeleLatex(e, np(q.x))}`, `on remplace ${v} par ${nombreTexte(q.x)}`));
    const coef = e.a === 1 ? "" : e.a === -1 ? "-" : `${n(e.a)}\\cdot `;
    const plus = e.tv === 0 ? "" : e.tv > 0 ? `+${n(e.tv)}` : `-${n(-e.tv)}`;
    if (e.th !== 0) lignes.push(ligne(`=${e.famille === "inverse" ? `${e.a < 0 ? "-" : ""}\\dfrac{${n(Math.abs(e.a))}}{${n(u)}}` : `${coef}${gLatex(e.famille, np(u))}`}${plus}`, "on calcule l'intérieur d'abord"));
    if (e.famille !== "inverse") lignes.push(ligne(`=${coef}${np(gu)}${plus}`, "fonction de référence"));
    lignes.push(ligne(`=${n(q.y)}`));
  } else {
    lignes.push(ligne(`${expressionModeleLatex(e)}=${n(q.y)}`, "on pose l'équation"));
    const K = q.y - e.tv;
    if (e.famille === "inverse") {
      const A = Math.abs(e.a);
      if (e.tv !== 0) lignes.push(ligne(`\\dfrac{${n(A)}}{${arg}}=${n(q.y)}${e.tv > 0 ? "-" : "+"}${n(Math.abs(e.tv))}`, "on enlève la translation verticale"), ligne(`=${n(K)}`));
      lignes.push(ligne(`${arg}=\\dfrac{${n(A)}}{${n(K)}}`, "le dénominateur vaut le numérateur divisé par ce nombre"));
      lignes.push(ligne(`=${n(A / K)}`));
      if (e.th !== 0) lignes.push(ligne(`${v}=${n(A / K + e.th)}`, `on ajoute ${nombreTexte(e.th)}`));
    } else {
      const iso = K / e.a;
      const corps = gLatex(e.famille, e.th === 0 || (e.famille !== "carre" && e.famille !== "cube") ? arg : `(${arg})`);
      const coef = e.a === 1 ? "" : e.a === -1 ? "-" : `${n(e.a)}`;
      if (e.tv !== 0) lignes.push(ligne(`${coef}${corps}=${n(q.y)}${e.tv > 0 ? "-" : "+"}${n(Math.abs(e.tv))}`, "on enlève la translation verticale"), ligne(`=${n(K)}`));
      if (e.a !== 1) lignes.push(ligne(`${corps}=\\dfrac{${n(K)}}{${n(e.a)}}`, `on divise par ${nombreTexte(e.a)}`), ligne(`=${n(iso)}`));
      const finir = (val: number, justif: string) => {
        if (e.th === 0) lignes.push(ligne(`${v}=${n(val)}`, justif));
        else lignes.push(ligne(`${arg}=${n(val)}`, justif), ligne(`${v}=${n(val + e.th)}`, `on ajoute ${nombreTexte(e.th)}`));
      };
      switch (e.famille) {
        case "carre":
        case "valeur_absolue": {
          const r = e.famille === "carre" ? Math.sqrt(iso) : iso;
          const candidats = [-r, r];
          for (const c of candidats) {
            const garde = q.solutions.some((s) => Math.abs(s - (c + e.th)) < 1e-9);
            finir(c, `${e.famille === "carre" ? "deux nombres ont ce carré" : "deux nombres ont cette valeur absolue"}${garde ? "" : " ; hors du domaine de la situation, rejeté"}`);
          }
          break;
        }
        case "racine_carree":
          finir(iso * iso, "on élève les deux membres au carré");
          break;
        case "racine_cubique":
          finir(iso ** 3, "on élève les deux membres au cube");
          break;
        case "cube":
          finir(Math.cbrt(iso), "on prend la racine cubique des deux membres");
          break;
      }
    }
  }
  return [
    utilise("d", [texte(q.type === "predire" ? `On remplace ${v} par la valeur donnée dans le modèle, puis on calcule de l'intérieur vers l'extérieur.` : "On pose l'équation, on isole la fonction de référence (on enlève la translation verticale, puis on divise par le facteur), puis on la « défait ».")]),
    calcul("d", lignes),
    resultat("d", [latex(reponseUtilisationLatex(e))]),
    ...(q.type === "resoudre" && q.solutions.length === 2 ? [piege("d", [texte("L'équation a deux solutions : il faut donner les deux.")])] : []),
  ];
}

function lignesSens(e: E): LigneCalcul[] {
  const info = INFOS_CONTEXTE[e.contexte];
  const v = info.variable;
  const f = info.fonction;
  const valeur = (x: number, justif: string): LigneCalcul[] => [ligne(`${f}(${n(x)})=${expressionModeleLatex(e, np(x))}`, justif), ligne(`=${n(evaluerModele(e, x))}`)];
  switch (`${e.contexte}:${e.parametre5}`) {
    case "pont:th":
    case "toboggan:th":
    case "chauffage:th":
      return [ligne(`${v}-${n(e.th)}=0`, "la parenthèse s'annule"), ligne(`${v}=${n(e.th)}`, "abscisse du point caractéristique (unité de l'axe horizontal)")];
    case "pont:tv":
    case "chauffage:tv":
    case "toboggan:tv":
      return valeur(e.th, "au point caractéristique, la fonction de référence vaut 0");
    case "jet:th":
      return [ligne(`${v}-${n(e.th)}\\geq 0`, "la racine n'existe que si l'intérieur est positif"), ligne(`${v}\\geq ${n(e.th)}`, "en dessous de cette pression, pas de jet")];
    case "jet:a":
      return valeur(e.th + 1, "1 bar au-dessus de la pression minimale");
    case "glacon:tv":
      return [ligne(`${f}(${v})-\\sqrt[3]{${v}}=${n(e.tv)}`, "côté de la boîte moins côté du glaçon (en cm)")];
    case "gaz:a":
      return [...valeur(1, "pour un volume de 1 L"), ligne(`${f}\\times ${v}=${n(Math.abs(e.a))}`, "le produit P × V est constant")];
    case "velo:tv":
      return [ligne(`${f}(${v})-\\dfrac{${n(Math.abs(e.a))}}{${v}}=${n(e.tv)}`, "durée totale moins temps passé à rouler : les pauses (en h)")];
    case "velo:a":
      return [ligne(`${n(Math.abs(e.a))}=\\text{vitesse}\\times\\text{temps de roulage}`, "distance = vitesse × temps : le circuit, en km")];
    case "chauffage:a":
      return [...valeur(e.th + 1, "un degré d'écart avec le minimum"), ligne(`${f}(${n(e.th + 1)})-${f}(${n(e.th)})=${n(evaluerModele(e, e.th + 1))}-${np(e.tv)}`), ligne(`=${n(Math.abs(e.a))}`, "pente de la branche, en kWh par degré")];
  }
  return [ligne(modeleLatex(e))];
}

export function correctionDetailleeChoisirModele(e: E): EtapeCorrection[] {
  const bonne = e.options5.find((o) => o.correcte)?.fragments ?? [];
  return [
    ...etapeFamille(e),
    ...etapeTransformations(e),
    ...etapeModele(e),
    ...etapeUtilisation(e),
    utilise("e", [texte("TH s'exprime dans l'unité de l'axe horizontal, TV et le facteur dans celle de l'axe vertical ; on calcule le modèle là où le paramètre intervient seul.")]),
    calcul("e", lignesSens(e)),
    resultat("e", bonne),
    piege("e", [texte("Un paramètre s'interprète avec l'unité de son axe : TH en unités horizontales, TV et le facteur en unités verticales.")]),
  ];
}
