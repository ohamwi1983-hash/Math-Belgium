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
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import { construireSvgFonction } from "../../../export/svgGraph";
import type {
  ConditionPortrait,
  ExerciceCourbe,
  ExerciceDeduction,
  ExerciceExpression,
  ExercicePortraitRobot,
  FonctionTransformee,
} from "../../core/portraitRobotFonction.types";
import {
  asymptoteHorizontale,
  domaineFonction,
  evaluerFonction,
  imageFonction,
  sensSur,
} from "../../moteur/modelePortraitRobot";
import {
  LETTRES_COURBES,
  NOMS_FAMILLES,
  avecMajuscule,
  conditionFragments,
  consigneGenerale,
  consignesEcrans,
  donneesDeductionFragments,
  ensembleLatex,
  expressionLatex,
  formeAvecALatex,
  gaucheDroiteImages,
  gaucheDroiteValeur,
  imageLatex,
  indicesCourbesEcartees,
  intervalleLatex,
  justificationComparaison,
  justificationValeur,
  justificationVariations,
  libelleSens,
  methodeCondition,
  nombreLatex,
  pointLatex,
  referenceLatex,
  verdictLatex,
} from "../../ui/formatPortraitRobot";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePortraitRobot, sensSymetrique, valeurOpposee } from ".";
import { LIBELLE_CAS_PORTRAIT_ROBOT, profilPortraitRobot } from "./profil";

/**
 * Adaptateur de feuilles d'exercices / évaluations de gen71 (« Le portrait-robot d'une fonction »,
 * 4e, chapitre 3, processus 3 TRANSFÉRER). Contrat complet de `.claude/rules/feuilles-evaluations.md` :
 * - énoncé papier = les données + les VRAIES questions (A : trouver une expression et justifier ;
 *   B : la valeur et les deux comparaisons, « justifie » ; C : les 4 courbes en figure, « laquelle ?
 *   justifie en écartant les autres ») — les écrans de guidage passent au corrigé (« Étape n ») ;
 * - aucune place de réponse, version aménagée = même énoncé ;
 * - tous les textes viennent de `ui/formatPortraitRobot.ts`, la source de l'écran.
 */

// ---------------------------------------------------------------------------------------------
// Figures
// ---------------------------------------------------------------------------------------------

const FENETRE = { xMin: -6, xMax: 6, yMin: -6, yMax: 6 };
const LARGEUR = 220;
const MARGE = 10; // `export/svgGraph.ts` : marge intérieure du tracé

function evaluateurCoupe(f: FonctionTransformee, yMin: number, yMax: number) {
  const marge = yMax - yMin;
  return (x: number) => {
    const y = evaluerFonction(f, x);
    return y === null || y < yMin - marge || y > yMax + marge ? null : y;
  };
}

/** Courbe de f dans une fenêtre donnée, asymptotes en pointillé, point de départ de la racine. */
function svgFonction(f: FonctionTransformee, fenetre: typeof FENETRE, options: { lettre?: string; estCorrect?: boolean } = {}): string {
  const asymptoteH = asymptoteHorizontale(f);
  const svg = construireSvgFonction(evaluateurCoupe(f, fenetre.yMin, fenetre.yMax), fenetre, {
    lettre: options.lettre,
    estCorrect: options.estCorrect,
    largeur: LARGEUR,
    hauteur: LARGEUR,
    divisionsX: fenetre.xMax - fenetre.xMin,
    divisionsY: fenetre.yMax - fenetre.yMin,
    courbesSecondaires: asymptoteH !== null ? [{ evaluer: () => asymptoteH, couleur: "#8a8f98", pointilles: true }] : [],
    points: f.famille === "racine_carree" ? [{ x: f.h, y: f.k }] : [],
  });
  if (f.famille !== "inverse") return svg;
  const px = MARGE + ((f.h - fenetre.xMin) / (fenetre.xMax - fenetre.xMin)) * (LARGEUR - 2 * MARGE);
  const ligne = `<line x1="${px.toFixed(1)}" y1="${MARGE}" x2="${px.toFixed(1)}" y2="${LARGEUR - MARGE}" stroke="#8a8f98" stroke-width="1.6" stroke-dasharray="6 4"/>`;
  return svg.replace("</svg>", `${ligne}</svg>`);
}

function grilleCourbes(e: ExerciceCourbe, corrige = false): string {
  const figures = e.courbes.map((f, i) => svgFonction(f, FENETRE, { lettre: LETTRES_COURBES[i], estCorrect: corrige && i === e.indexCorrect })).join("");
  return `<div class="grille-graphes-cyclo">${figures}</div>`;
}

/** Graphique de la fonction trouvée (corrigé de la famille A), centré sur (TH ; TV). */
function figureExpression(e: ExerciceExpression): string {
  const { h, k } = e.cible;
  return svgFonction(e.cible, { xMin: h - 6, xMax: h + 6, yMin: k - 6, yMax: k + 6 });
}

function listeHtml(items: FragmentConsigne[][]): string {
  return `<ul class="paragraphe">${items.map((f) => `<li>${fragmentsVersHtml([...f, texte(".")])}</li>`).join("")}</ul>`;
}

function conditionsAvecMajuscule(conditions: ConditionPortrait[]): FragmentConsigne[][] {
  return conditions.map((c) => avecMajuscule(conditionFragments(c)));
}

// ---------------------------------------------------------------------------------------------
// Énoncés
// ---------------------------------------------------------------------------------------------

function donneesHtml(e: ExercicePortraitRobot): string {
  if (e.famille === "deduction") return listeHtml(donneesDeductionFragments(e).map(avecMajuscule));
  if (e.famille === "expression") return listeHtml(conditionsAvecMajuscule(e.conditions));
  return listeHtml(conditionsAvecMajuscule(e.conditions)) + grilleCourbes(e);
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExercicePortraitRobot): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(e.famille))],
    enteteHtml: donneesHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExercicePortraitRobot): EnoncePapier {
  if (e.famille === "expression") {
    return {
      section: {
        enteteFragments: [texte(consigneGenerale(e.famille))],
        enteteHtml: donneesHtml(e),
        questions: [{ consigne: [texte("Trouve une expression de f et justifie ta démarche.")] }],
      },
      etapesParQuestion: [["a", "b", "c", "d"]],
    };
  }
  if (e.famille === "deduction") {
    const [g1, d1] = gaucheDroiteImages(e.comparaisonImages);
    const [g2, d2] = gaucheDroiteValeur(e, e.comparaisonValeur);
    return {
      section: {
        enteteFragments: [texte(consigneGenerale(e.famille))],
        enteteHtml: donneesHtml(e),
        questions: [
          { consigne: [texte("Que vaut "), latex(imageLatex(-e.p)), texte(" ? Justifie.")] },
          { consigne: [texte("Peut-on comparer "), latex(g1), texte(" et "), latex(d1), texte(" ? Si oui, compare-les. Justifie.")] },
          { consigne: [texte("Peut-on comparer "), latex(g2), texte(" et "), latex(d2), texte(" ? Si oui, compare-les. Justifie.")] },
        ],
      },
      etapesParQuestion: [["a"], ["b", "c"], ["d"]],
      reponseBreve: reponseBreve(e),
    };
  }
  return {
    section: {
      enteteFragments: [texte("Une seule des quatre courbes ci-dessous respecte toutes les conditions suivantes.")],
      enteteHtml: donneesHtml(e),
      questions: [{ consigne: [texte("Laquelle ? Justifie en indiquant, pour chacune des trois autres courbes, la condition qu'elle ne respecte pas.")] }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

// ---------------------------------------------------------------------------------------------
// Réponse brève, corrigé court
// ---------------------------------------------------------------------------------------------

function reponseBreve(e: ExercicePortraitRobot): FragmentConsigne[] {
  if (e.famille === "expression") return [latex(`f(x) = ${expressionLatex(e.cible)}`)];
  if (e.famille === "deduction") {
    const [g1, d1] = gaucheDroiteImages(e.comparaisonImages);
    const [g2, d2] = gaucheDroiteValeur(e, e.comparaisonValeur);
    return [
      texte("a) "),
      latex(`${imageLatex(-e.p)} = ${nombreLatex(valeurOpposee(e))}`),
      texte(" ; b) "),
      ...verdictCourt(e.comparaisonImages.verdict, g1, d1),
      texte(" ; c) "),
      ...verdictCourt(e.comparaisonValeur.verdict, g2, d2),
    ];
  }
  return [texte(`Courbe ${LETTRES_COURBES[e.indexCorrect]}`)];
}

function verdictCourt(verdict: ExerciceDeduction["comparaisonImages"]["verdict"], g: string, d: string): FragmentConsigne[] {
  return verdict === "indetermine" ? [texte("on ne peut pas savoir")] : [latex(`${g} ${verdict === "inferieur" ? "<" : ">"} ${d}`)];
}

function construireCorrection(e: ExercicePortraitRobot): BlocCorrection[] {
  const blocs: BlocCorrection[] = correctionDetaillee(e)
    .filter((etape) => etape.label === "Conclusion")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
  if (e.famille === "courbe") blocs.unshift({ type: "html", html: grilleCourbes(e, true) });
  if (e.famille === "expression") blocs.push({ type: "html", html: figureExpression(e) });
  return blocs;
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

function methodeFamille(e: ExerciceExpression): FragmentConsigne[] {
  const c = e.cible;
  const points = e.conditions.filter((cd): cd is Extract<ConditionPortrait, { type: "point" }> => cd.type === "point" && cd.forme === "point");
  if (e.groupe === "asymptotes") {
    return [texte("Un domaine privé d'un nombre et une asymptote horizontale : seule la fonction inverse a ces deux caractéristiques.")];
  }
  if (e.groupe === "racine") {
    return [texte("Un domaine de la forme "), latex(ensembleLatex(domaineFonction(c))), texte(" : seule la racine carrée a un domaine limité d'un seul côté.")];
  }
  // Le point le plus proche d'abord : « à 1 unité…, à 2 unités… ».
  const [p1, p2] = [...points].sort((u, v) => Math.abs(u.x - c.h) - Math.abs(v.x - c.h)) as [Extract<ConditionPortrait, { type: "point" }>, Extract<ConditionPortrait, { type: "point" }>];
  const ecart = (p: { x: number; y: number }) => nombreLatex(Math.abs(p.x - c.h));
  const unites = (p: { x: number; y: number }) => (Math.abs(p.x - c.h) === 1 ? " unité" : " unités");
  const variation = (p: { x: number; y: number }) => nombreLatex(Math.abs(p.y - c.k));
  if (e.groupe === "extremum") {
    return [
      texte("Domaine "),
      latex("\\mathbb{R}"),
      texte(" et un extremum : carré ou valeur absolue. À "),
      latex(ecart(p1)),
      texte(`${unites(p1)} de l'abscisse de l'extremum, f s'en écarte de `),
      latex(variation(p1)),
      texte(" ; à "),
      latex(ecart(p2)),
      texte(`${unites(p2)}, de `),
      latex(variation(p2)),
      texte(c.famille === "carre" ? " : l'écart est multiplié par le carré de la distance, c'est la fonction carré." : " : l'écart est proportionnel à la distance, c'est la fonction valeur absolue."),
    ];
  }
  return [
    texte("Domaine et ensemble image "),
    latex("\\mathbb{R}"),
    texte(" avec un centre de symétrie : cube ou racine cubique. À "),
    latex(ecart(p1)),
    texte(`${unites(p1)} du centre, f s'en écarte de `),
    latex(variation(p1)),
    texte(" ; à "),
    latex(ecart(p2)),
    texte(`${unites(p2)}, de `),
    latex(variation(p2)),
    texte(c.famille === "cube" ? " : l'écart est multiplié par le cube de la distance, c'est la fonction cube." : " : il faut aller 8 fois plus loin pour un écart double, c'est la fonction racine cubique."),
  ];
}

function lectureTranslations(e: ExerciceExpression): FragmentConsigne[] {
  const c = e.cible;
  const tv = [latex(`\\text{TH} = ${nombreLatex(c.h)}`), texte(" et "), latex(`\\text{TV} = ${nombreLatex(c.k)}`)];
  if (e.groupe === "asymptotes") return [texte("Le nombre exclu du domaine donne l'asymptote verticale "), latex(`x = ${nombreLatex(c.h)}`), texte(", l'asymptote horizontale est "), latex(`y = ${nombreLatex(c.k)}`), texte(" : "), ...tv, texte(".")];
  if (e.groupe === "racine") return [texte("Le point de départ "), latex(pointLatex(c.h, c.k)), texte(" (borne du domaine et sa valeur) est l'image de "), latex("(0 \\,;\\, 0)"), texte(" : "), ...tv, texte(".")];
  if (e.groupe === "extremum") return [texte("Le sommet "), latex(pointLatex(c.h, c.k)), texte(c.h === 0 && e.conditions.some((cd) => cd.type === "parite") ? " (f paire : l'extremum est atteint en 0) est l'image de " : " est l'image de "), latex("(0 \\,;\\, 0)"), texte(" : "), ...tv, texte(".")];
  return [texte("Le centre de symétrie "), latex(pointLatex(c.h, c.k)), texte(c.h === 0 && c.k === 0 && e.conditions.some((cd) => cd.type === "parite") ? " (f impaire : c'est l'origine) est l'image de " : " est l'image de "), latex("(0 \\,;\\, 0)"), texte(" : "), ...tv, texte(".")];
}

function calculA(e: ExerciceExpression): FragmentConsigne[] {
  const c = e.cible;
  const point = e.conditions.find((cd): cd is Extract<ConditionPortrait, { type: "point" }> => cd.type === "point" && !(cd.x === c.h && cd.y === c.k))!;
  const u = point.x - c.h;
  const gu = c.famille === "carre" ? u * u : c.famille === "cube" ? u * u * u : c.famille === "racine_carree" ? Math.sqrt(u) : c.famille === "racine_cubique" ? Math.round(Math.cbrt(u)) : c.famille === "valeur_absolue" ? Math.abs(u) : 1 / u;
  const membreDroit = c.famille === "inverse" ? `\\dfrac{a}{${nombreLatex(u)}}` : `a \\cdot ${nombreLatex(Math.round(gu))}`;
  return [
    texte("Avec "),
    latex(`f(x) = ${formeAvecALatex(c)}`),
    texte(" et le point "),
    latex(pointLatex(point.x, point.y)),
    texte(" : "),
    latex(`${nombreLatex(point.y)} = ${membreDroit}${c.k === 0 ? "" : c.k > 0 ? ` + ${nombreLatex(c.k)}` : ` - ${nombreLatex(-c.k)}`}`),
    texte(", d'où "),
    latex(`a = ${nombreLatex(c.a)}`),
    texte("."),
  ];
}

function piegeExpression(e: ExerciceExpression): FragmentConsigne[] {
  const c = e.cible;
  if (e.groupe === "asymptotes") return [texte("Signe de TH : le nombre exclu "), latex(`x = ${nombreLatex(c.h)}`), texte(" donne "), latex(c.h === 0 ? "x" : c.h > 0 ? `x - ${nombreLatex(c.h)}` : `x + ${nombreLatex(-c.h)}`), texte(" au dénominateur, pas le nombre opposé.")];
  if (e.groupe === "racine") return [texte("Le point de départ donne TH et TV, mais pas a : sans le second point, on écrirait "), latex(`\\sqrt{${c.h === 0 ? "x" : c.h > 0 ? `x - ${nombreLatex(c.h)}` : `x + ${nombreLatex(-c.h)}`}}`), texte(" sans facteur.")];
  if (e.groupe === "extremum") return [texte("Un extremum et le domaine "), latex("\\mathbb{R}"), texte(" ne suffisent pas à distinguer "), latex("x^2"), texte(" de "), latex("|x|"), texte(" : c'est la comparaison des deux points qui tranche.")];
  return [texte("Un centre de symétrie ne suffit pas à distinguer "), latex("x^3"), texte(" de "), latex("\\sqrt[3]{x}"), texte(" : c'est la comparaison des deux points qui tranche.")];
}

function correctionExpression(e: ExerciceExpression): EtapeCorrection[] {
  const c = e.cible;
  const x0 = e.controle.x;
  return [
    { label: "Méthode", sousQuestion: "a", fragments: methodeFamille(e) },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`f est obtenue à partir de la fonction ${NOMS_FAMILLES[c.famille]} `), latex(`x \\mapsto ${referenceLatex(c.famille)}`), texte(".")] },
    { label: "Lecture", sousQuestion: "b", fragments: lectureTranslations(e) },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(`\\text{TH} = ${nombreLatex(c.h)}`), texte(" ; "), latex(`\\text{TV} = ${nombreLatex(c.k)}`)] },
    { label: "Calcul", sousQuestion: "c", fragments: calculA(e) },
    { label: "Conclusion", sousQuestion: "c", fragments: [latex(`f(x) = ${expressionLatex(c)}`)], figureHtml: figureExpression(e) },
    { label: "Calcul", sousQuestion: "d", fragments: [latex(`f(${nombreLatex(x0)}) = ${nombreLatex(e.controle.y)}`), texte(" : le point "), latex(pointLatex(x0, e.controle.y)), texte(" appartient au graphique de f.")] },
    { label: "Conclusion", sousQuestion: "d", fragments: [texte("Chaque caractéristique de l'énoncé se vérifie sur l'expression trouvée : elle convient, et c'est la seule.")] },
    { label: "Piège", sousQuestion: "c", fragments: piegeExpression(e) },
  ];
}

function correctionDeduction(e: ExerciceDeduction): EtapeCorrection[] {
  const [g1, d1] = gaucheDroiteImages(e.comparaisonImages);
  const [g2, d2] = gaucheDroiteValeur(e, e.comparaisonValeur);
  const ci = e.comparaisonImages;
  const cv = e.comparaisonValeur;
  const piege: FragmentConsigne[] =
    ci.verdict === "indetermine" || cv.verdict === "indetermine"
      ? [texte("La parité ne renseigne que sur le symétrique de "), latex(intervalleLatex(0, e.m)), texte(" : hors de "), latex(`[-${nombreLatex(e.m)} \\,;\\, ${nombreLatex(e.m)}]`), texte(", aucune comparaison n'est possible.")]
      : e.parite === "paire"
        ? [texte("Une fonction paire INVERSE le sens de variation : sur "), latex(`[-${nombreLatex(e.m)} \\,;\\, 0]`), texte(`, f est ${libelleSens(sensSymetrique(e))}.`)]
        : [texte("Une fonction impaire GARDE le sens de variation : ne pas l'inverser comme pour une fonction paire.")];
  return [
    { label: "Justification", sousQuestion: "a", fragments: justificationValeur(e) },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(`${imageLatex(-e.p)} = ${nombreLatex(valeurOpposee(e))}`)] },
    { label: "Justification", sousQuestion: "b", fragments: justificationVariations(e) },
    { label: "Conclusion", sousQuestion: "b", fragments: [texte(`f est ${libelleSens(sensSymetrique(e))} sur `), latex(`[-${nombreLatex(e.m)} \\,;\\, 0]`), texte(".")] },
    { label: "Justification", sousQuestion: "c", fragments: justificationComparaison(e, ci.x1, ci.x2, ci.verdict) },
    { label: "Conclusion", sousQuestion: "c", fragments: verdictLatex(ci.verdict, g1, d1) },
    { label: "Justification", sousQuestion: "d", fragments: [texte("On compare à "), latex(`f(${nombreLatex(e.p)}) = ${nombreLatex(e.v)}`), texte(". "), ...justificationComparaison(e, cv.x, e.p, cv.verdict)] },
    { label: "Conclusion", sousQuestion: "d", fragments: verdictLatex(cv.verdict, g2, d2) },
    { label: "Piège", sousQuestion: ci.verdict === "indetermine" ? "c" : cv.verdict === "indetermine" ? "d" : "b", fragments: piege },
  ];
}

/** Ce que la courbe montre réellement pour la condition qu'elle viole. */
function lectureViolation(condition: ConditionPortrait, f: FonctionTransformee): FragmentConsigne[] {
  switch (condition.type) {
    case "domaine":
      return [texte("son domaine est "), latex(ensembleLatex(domaineFonction(f)))];
    case "image":
      return [texte("son ensemble image est "), latex(ensembleLatex(imageFonction(f)))];
    case "asymptoteH": {
      const k = asymptoteHorizontale(f);
      return k === null ? [texte("elle n'a pas d'asymptote horizontale")] : [texte("son asymptote horizontale est la droite "), latex(`y = ${nombreLatex(k)}`)];
    }
    case "point": {
      const y = evaluerFonction(f, condition.x);
      if (y === null) return [texte("elle n'existe pas en "), latex(`x = ${nombreLatex(condition.x)}`)];
      return [texte(`en `), latex(`x = ${nombreLatex(condition.x)}`), texte(`, elle passe ${y > condition.y ? "au-dessus" : "en dessous"} du point `), latex(pointLatex(condition.x, condition.y))];
    }
    case "monotonie": {
      const sens = sensSur(f, condition.u, condition.v);
      return sens
        ? [texte(`sur `), latex(intervalleLatex(condition.u, condition.v)), texte(`, elle est ${libelleSens(sens)}`)]
        : [texte("elle change de sens de variation en "), latex(`x = ${nombreLatex(f.h)}`), texte(", à l'intérieur de "), latex(intervalleLatex(condition.u, condition.v))];
    }
    case "parite":
      return [texte(`elle n'est pas symétrique par rapport à ${condition.parite === "paire" ? "l'axe des ordonnées" : "l'origine"}`)];
    case "extremum":
    case "centre":
      return [texte("elle ne présente pas cette caractéristique")];
  }
}

function correctionCourbe(e: ExerciceCourbe): EtapeCorrection[] {
  const lettreCorrecte = LETTRES_COURBES[e.indexCorrect]!;
  const etapes: EtapeCorrection[] = [
    {
      label: "Méthode",
      sousQuestion: "a",
      fragments: [texte("On teste chaque condition sur chaque courbe ; une seule condition non respectée suffit à écarter une courbe. " + avecMajusculeTexte(e.conditions.map((c) => methodeCondition(c.type)).join(" ; ")) + ".")],
      figureHtml: grilleCourbes(e, true),
    },
    { label: "Conclusion", sousQuestion: "a", fragments: [texte(`La courbe ${lettreCorrecte} respecte les trois conditions : c'est la courbe de f.`)] },
  ];
  indicesCourbesEcartees(e).forEach((i, n) => {
    const lettre = LETTRES_COURBES[i]!;
    const condition = e.conditions[e.violations[i]!]!;
    const sq = "bcd"[n]!;
    etapes.push({ label: "Lecture", sousQuestion: sq, fragments: [texte(`Courbe ${lettre} : `), ...lectureViolation(condition, e.courbes[i]!), texte(".")] });
    etapes.push({ label: "Conclusion", sousQuestion: sq, fragments: [texte(`La courbe ${lettre} ne respecte pas la condition : `), ...conditionFragments(condition), texte(".")] });
  });
  etapes.push({
    label: "Piège",
    sousQuestion: "b",
    fragments: [texte("Une courbe écartée respecte souvent les autres conditions : il faut toutes les tester, et une seule condition non respectée suffit pour l'écarter.")],
  });
  return etapes;
}

function avecMajusculeTexte(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function correctionDetaillee(e: ExercicePortraitRobot): EtapeCorrection[] {
  if (e.famille === "expression") return correctionExpression(e);
  if (e.famille === "deduction") return correctionDeduction(e);
  return correctionCourbe(e);
}

// ---------------------------------------------------------------------------------------------
// Barème (poids, somme 4, aucun critère < 0,5)
// ---------------------------------------------------------------------------------------------

function bareme(e: ExercicePortraitRobot): BaremeExercice {
  if (e.famille === "expression") {
    const criteres: CritereBareme[] = [
      { sousQuestion: "a", critere: [texte("Fonction de référence identifiée et justifiée par les caractéristiques")], points: 1 },
      { sousQuestion: "b", critere: [texte("Translations TH et TV lues dans les caractéristiques")], points: 1 },
      { sousQuestion: "c", critere: [texte("Coefficient a calculé à l'aide d'un point, expression complète de f")], points: 1.5 },
      { sousQuestion: "d", critere: [texte("Expression vérifiée sur les caractéristiques données")], points: 0.5 },
    ];
    const erreurs: ErreurFrequente[] = [
      { description: [texte("Signe de TH inversé (ex. "), latex("x + h"), texte(" au lieu de "), latex("x - h"), texte(")")], cout: "0 pt sur b)" },
      { description: [texte("Facteur a oublié (expression sans étirement)")], cout: "0,5 pt sur c)" },
    ];
    if (e.groupe === "extremum" || e.groupe === "symetrie") erreurs.unshift({ description: [texte("Famille choisie sans comparer les deux points (carré / valeur absolue, cube / racine cubique)")], cout: "0 pt sur a) et c)" });
    return {
      reponseFinale: reponseBreve(e),
      criteres,
      erreursFrequentes: erreurs,
      reponsesAcceptees: [[texte("Toute expression équivalente (ex. facteur distribué, ou réécrit à l'intérieur de la racine)")]],
    };
  }
  if (e.famille === "deduction") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Valeur déduite de la parité, justifiée")], points: 1 },
        { sousQuestion: "b", critere: [texte("Sens de variation sur le symétrique de l'intervalle")], points: 0.5 },
        { sousQuestion: "c", critere: [texte("Première comparaison (ou impossibilité) justifiée")], points: 1.25 },
        { sousQuestion: "d", critere: [texte("Seconde comparaison (ou impossibilité) justifiée")], points: 1.25 },
      ],
      erreursFrequentes: [
        { description: [texte(e.parite === "paire" ? "Garder le même sens de variation sur le symétrique (une fonction paire l'inverse)" : "Inverser le sens de variation (une fonction impaire le garde)")], cout: "0 pt sur b) et c)" },
        { description: [texte("Conclure une comparaison avec un nombre hors de "), latex(`[-${nombreLatex(e.m)} \\,;\\, ${nombreLatex(e.m)}]`)], cout: "0 pt sur la comparaison concernée" },
        { description: [texte("Verdict sans justification")], cout: "moitié des points de la comparaison" },
      ],
      reponsesAcceptees: [[texte("Justification appuyée sur un croquis symétrique cohérent avec les données")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Bonne courbe choisie")], points: 1 },
      ...indicesCourbesEcartees(e).map((i, n) => ({ sousQuestion: "bcd"[n]!, critere: [texte(`Courbe ${LETTRES_COURBES[i]} écartée par la condition qu'elle ne respecte pas`)], points: 1 })),
    ],
    erreursFrequentes: [
      { description: [texte("Courbe écartée sans citer de condition précise")], cout: "0 pt sur la courbe concernée" },
      { description: [texte("Condition citée que la courbe respecte en réalité")], cout: "0 pt sur la courbe concernée" },
    ],
    reponsesAcceptees: [],
  };
}

function difficulte(e: ExercicePortraitRobot): 1 | 2 | 3 {
  if (e.famille === "expression") return e.groupe === "extremum" || e.groupe === "symetrie" ? 3 : 2;
  if (e.famille === "deduction") return e.parite === "impaire" || e.comparaisonImages.verdict === "indetermine" || e.comparaisonValeur.verdict === "indetermine" ? 3 : 2;
  return e.conditions.some((c) => c.type === "monotonie" || c.type === "parite") ? 3 : 2;
}

export const adaptateurEvaluationPortraitRobotFonction: AdaptateurFeuilleExercices<ExercicePortraitRobot> = {
  profilInstance: profilPortraitRobot,
  libelleCasParticulier: LIBELLE_CAS_PORTRAIT_ROBOT,
  titreDocument: "Le portrait-robot d'une fonction — Évaluation",
  nomFichierBase: "portrait-robot-fonction",
  genererInstance: genererExercicePortraitRobot,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 10,
};
