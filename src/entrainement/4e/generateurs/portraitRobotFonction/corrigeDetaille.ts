import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ConditionPortrait, ExerciceCourbe, ExerciceDeduction, ExerciceExpression, ExercicePortraitRobot, FonctionTransformee, VerdictComparaison } from "../../core/portraitRobotFonction.types";
import { asymptoteHorizontale, centreSymetrie, domaineFonction, ensemblesEgaux, evaluerFonction, extremumFonction, imageFonction, pariteFonction, referenceEn, sensSur } from "../../moteur/modelePortraitRobot";
import {
  LETTRES_COURBES,
  NOMS_FAMILLES,
  conditionFragments,
  ensembleLatex,
  expressionLatex,
  formeAvecALatex,
  formeSubstitueeLatex,
  gaucheDroiteImages,
  gaucheDroiteValeur,
  imageLatex,
  indicesCourbesEcartees,
  intervalleLatex,
  libelleSens,
  nombreLatex,
  pointLatex,
  referenceLatex,
  verdictLatex,
} from "../../ui/formatPortraitRobot";
import { sensSymetrique, valeurOpposee } from ".";
import { COURS_ALGEBRE, COURS_FAMILLES, COURS_TRANSFORMATIONS, nombreTexte, q, sansDoublons } from "../../ui/corrigeChapitre3";
import { figureExpression, grilleCourbes } from "./figures";

/**
 * Corrigé détaillé « comme au tableau » de gen71 (le portrait-robot d'une fonction) — règle
 * `.claude/rules/feuilles-evaluations.md`. Quatre étapes = quatre écrans, pour chaque famille
 * d'exercice : expression (famille, translations, coefficient a, contrôle), déduction (valeur par
 * parité, sens de variation sur le symétrique, deux comparaisons), courbe (la bonne courbe, puis
 * une courbe écartée par écran). Valeurs tirées du modèle partagé avec l'écran
 * (`moteur/modelePortraitRobot.ts`, `ui/formatPortraitRobot.ts`) ; partagé par l'adaptateur et
 * l'appli.
 */

const n = nombreLatex;
const np = (v: number) => (v < 0 ? `(${n(v)})` : n(v));
const nt = (v: number) => nombreTexte(v);
/** Substitution de l'écran (`formeSubstitueeLatex`), sans double parenthèse autour d'un négatif. */
const substitue = (f: FonctionTransformee, x: number, avecA: boolean) => formeSubstitueeLatex(f, x, avecA).replace(/\(\((-[\d{},]+)\)\)/g, "($1)");

/** Valeur de la fonction de référence écrite pour un nombre u (« (−1)^3 », « \sqrt{4} »…). */
function gLatex(f: FonctionTransformee, u: number): string {
  switch (f.famille) {
    case "carre":
      return `${np(u)}^2`;
    case "cube":
      return `${np(u)}^3`;
    case "racine_carree":
      return `\\sqrt{${n(u)}}`;
    case "racine_cubique":
      return `\\sqrt[3]{${n(u)}}`;
    case "valeur_absolue":
      return `|${n(u)}|`;
    case "inverse":
      return `\\dfrac{1}{${n(u)}}`;
  }
}

/** f(x0) calculée de l'intérieur vers l'extérieur. */
function lignesImage(f: FonctionTransformee, x0: number, y0: number): LigneCalcul[] {
  const u = x0 - f.h;
  const plusK = f.k === 0 ? "" : f.k > 0 ? `+${n(f.k)}` : `-${n(-f.k)}`;
  const coef = f.a === 1 ? "" : f.a === -1 ? "-" : `${n(f.a)}\\cdot `;
  const lignes: LigneCalcul[] = [ligne(`f(${n(x0)})=${substitue(f, x0, false)}`, `on remplace x par ${nt(x0)}`)];
  if (f.h !== 0) lignes.push(ligne(`=${coef}${gLatex(f, u)}${plusK}`, "on calcule l'intérieur"));
  const gu = referenceEn(f.famille, u);
  if (gu !== null && f.famille !== "inverse") lignes.push(ligne(`=${coef}${coef === "" ? n(gu) : np(gu)}${plusK}`, "fonction de référence"));
  lignes.push(ligne(`=${n(y0)}`));
  return lignes;
}

// ---------------------------------------------------------------------------------------------
// Famille « expression »
// ---------------------------------------------------------------------------------------------

type Point = Extract<ConditionPortrait, { type: "point" }>;

function lignesFamille(e: ExerciceExpression): LigneCalcul[] {
  const c = e.cible;
  if (e.groupe === "asymptotes") return [ligne(`\\mathrm{dom}\\,f=${ensembleLatex(domaineFonction(c))}`, "un seul nombre exclu du domaine"), ligne(`y=${n(c.k)}`, "et une asymptote horizontale : seule la fonction inverse a ces deux caractéristiques")];
  if (e.groupe === "racine") return [ligne(`\\mathrm{dom}\\,f=${ensembleLatex(domaineFonction(c))}`, "domaine limité d'un seul côté : seule la racine carrée a ce domaine")];
  const points = e.conditions.filter((cd): cd is Point => cd.type === "point" && cd.forme === "point" && !(cd.x === c.h && cd.y === c.k));
  const [p1, p2] = [...points].sort((u, v) => Math.abs(u.x - c.h) - Math.abs(v.x - c.h)) as [Point, Point];
  const d1 = Math.abs(p1.x - c.h);
  const d2 = Math.abs(p2.x - c.h);
  const e1 = Math.abs(p1.y - c.k);
  const e2 = Math.abs(p2.y - c.k);
  const centre = e.groupe === "extremum" ? "de l'extremum" : "du centre";
  const verdict: Record<string, string> = {
    carre: `distance multipliée par ${nt(d2 / d1)}, écart multiplié par ${nt(e2 / e1)} = ${nt(d2 / d1)}² : la fonction carré`,
    valeur_absolue: `distance et écart multipliés par le même nombre ${nt(d2 / d1)} : la fonction valeur absolue`,
    cube: `distance multipliée par ${nt(d2 / d1)}, écart multiplié par ${nt(e2 / e1)} = ${nt(d2 / d1)}³ : la fonction cube`,
    racine_cubique: `distance multipliée par ${nt(d2 / d1)} = ${nt(e2 / e1)}³ pour un écart multiplié par ${nt(e2 / e1)} : la fonction racine cubique`,
  };
  return [
    ligne(`|${n(p1.x)}-${np(c.h)}|=${n(d1)}`, `distance à l'abscisse ${centre} (point ${pointLatexTexte(p1.x, p1.y)})`),
    ligne(`|${n(p1.y)}-${np(c.k)}|=${n(e1)}`, "écart vertical correspondant"),
    ligne(`|${n(p2.x)}-${np(c.h)}|=${n(d2)}`, `point ${pointLatexTexte(p2.x, p2.y)}`),
    ligne(`|${n(p2.y)}-${np(c.k)}|=${n(e2)}`, "écart vertical correspondant"),
    ligne(`\\dfrac{${n(e2)}}{${n(e1)}}=${q(e2 / e1)}`, verdict[c.famille] ?? ""),
  ];
}

function pointLatexTexte(x: number, y: number): string {
  return `(${nt(x)} ; ${nt(y)})`;
}

function lignesTranslations(e: ExerciceExpression): LigneCalcul[] {
  const c = e.cible;
  if (e.groupe === "asymptotes")
    return [ligne(`x=${n(c.h)}`, "le nombre exclu donne l'asymptote verticale, image de x = 0"), ligne(`\\text{TH}=${n(c.h)}`), ligne(`y=${n(c.k)}`, "asymptote horizontale, image de y = 0"), ligne(`\\text{TV}=${n(c.k)}`)];
  const quoi = e.groupe === "racine" ? "point de départ (borne du domaine et sa valeur)" : e.groupe === "extremum" ? "sommet (extremum)" : "centre de symétrie";
  return [ligne(`(\\text{TH}\\,;\\,\\text{TV})=${pointLatex(c.h, c.k)}`, `${quoi} : image du point (0 ; 0)`), ligne(`\\text{TH}=${n(c.h)}`), ligne(`\\text{TV}=${n(c.k)}`)];
}

function lignesCoefficient(e: ExerciceExpression): LigneCalcul[] {
  const c = e.cible;
  const point = e.conditions.find((cd): cd is Point => cd.type === "point" && !(cd.x === c.h && cd.y === c.k))!;
  const u = point.x - c.h;
  const gu = referenceEn(c.famille, u)!;
  const plusK = c.k === 0 ? "" : c.k > 0 ? `+${n(c.k)}` : `-${n(-c.k)}`;
  const terme = c.famille === "inverse" ? `\\dfrac{a}{${n(u)}}` : gu === 1 ? "a" : `a\\cdot ${gu < 0 ? `(${q(gu)})` : q(gu)}`;
  const lignes: LigneCalcul[] = [
    ligne(`${n(point.y)}=${substitue(c, point.x, true)}`, [texte("le point "), latex(pointLatex(point.x, point.y)), texte(" est sur le graphique")]),
    ligne(`${n(point.y)}=${terme}${plusK}`, "on calcule la fonction de référence"),
  ];
  if (c.k !== 0) lignes.push(ligne(`${terme}=${n(point.y)}${c.k > 0 ? "-" : "+"}${n(Math.abs(c.k))}`, "on isole le terme en a"), ligne(`=${q(point.y - c.k)}`));
  const reste = point.y - c.k;
  if (c.famille === "inverse") lignes.push(ligne(`a=${q(reste)}\\cdot ${np(u)}`, `on multiplie par ${nt(u)}`), ligne(`=${q(c.a)}`));
  else if (gu !== 1) lignes.push(ligne(`a=\\dfrac{${q(reste)}}{${q(gu)}}`, `on divise par ${nt(gu)}`), ligne(`=${q(c.a)}`));
  lignes.push(ligne(`f(x)=${expressionLatex(c)}`, "on remplace a, TH et TV"));
  return lignes;
}

function correctionExpression(e: ExerciceExpression): EtapeCorrection[] {
  const c = e.cible;
  const x0 = e.controle.x;
  const piegeC: FragmentConsigne[] =
    e.groupe === "asymptotes"
      ? [texte("Signe de TH : le nombre exclu "), latex(`x = ${n(c.h)}`), texte(" donne "), latex(c.h === 0 ? "x" : c.h > 0 ? `x - ${n(c.h)}` : `x + ${n(-c.h)}`), texte(" au dénominateur, pas le nombre opposé.")]
      : e.groupe === "racine"
        ? [texte("Le point de départ donne TH et TV, mais pas a : il faut le second point pour trouver le facteur.")]
        : [texte("Le facteur a se calcule avec un point autre que le point caractéristique, en tenant compte de TV.")];
  return [
    utilise("a", [texte(`Chaque fonction de référence a un domaine, un ensemble image et des symétries propres ; à distance double du point caractéristique, l'écart vertical est multiplié par 4 pour x², par 2 pour |x|, par 8 pour x³ ${COURS_FAMILLES}.`)]),
    calcul("a", lignesFamille(e)),
    resultat("a", [texte(`f est obtenue à partir de la fonction ${NOMS_FAMILLES[c.famille]} `), latex(`x \\mapsto ${referenceLatex(c.famille)}`), texte(".")]),
    ...(e.groupe === "extremum" || e.groupe === "symetrie"
      ? [piege("a", [texte(e.groupe === "extremum" ? "Un extremum et le domaine ℝ ne suffisent pas à distinguer x² de |x| : c'est la comparaison des deux points qui tranche." : "Un centre de symétrie ne suffit pas à distinguer x³ de ∛x : c'est la comparaison des deux points qui tranche.")])]
      : []),
    utilise("b", [texte(`Le point caractéristique de la fonction de référence (ou son centre, intersection des asymptotes) est amené en (TH ; TV) par les translations ; l'étirement et la symétrie ne le déplacent pas ${COURS_TRANSFORMATIONS}.`)]),
    calcul("b", lignesTranslations(e)),
    resultat("b", [latex(`\\text{TH} = ${n(c.h)}`), texte(" ; "), latex(`\\text{TV} = ${n(c.k)}`)]),
    utilise("c", [texte("On écrit "), latex(`f(x) = ${formeAvecALatex(c)}`), texte(` et on trouve a en remplaçant x et f(x) par les coordonnées d'un point connu ${COURS_TRANSFORMATIONS}.`)]),
    { ...calcul("c", lignesCoefficient(e)), figureHtml: figureExpression(e) },
    resultat("c", [latex(`f(x) = ${expressionLatex(c)}`)]),
    piege("c", piegeC),
    utilise("d", [texte("On remplace x par l'abscisse donnée dans l'expression trouvée et on calcule.")]),
    calcul("d", sansDoublons(lignesImage(c, x0, e.controle.y))),
    resultat("d", [latex(`f(${n(x0)}) = ${n(e.controle.y)}`)]),
    verification("d", [texte("Chaque caractéristique de l'énoncé se vérifie sur l'expression trouvée : le point "), latex(pointLatex(x0, e.controle.y)), texte(" appartient au graphique de f.")]),
  ];
}

// ---------------------------------------------------------------------------------------------
// Famille « déduction »
// ---------------------------------------------------------------------------------------------

function lignesComparaison(e: ExerciceDeduction, x1: number, x2: number, verdict: VerdictComparaison): LigneCalcul[] {
  const m = e.m;
  if (verdict === "indetermine") {
    const dehors = Math.abs(x1) > m ? x1 : x2;
    return [ligne(`|${n(dehors)}|>${n(m)}`, `${nt(dehors)} n'appartient pas à [−${nt(m)} ; ${nt(m)}] : les données ne disent rien de f en dehors de cet intervalle`)];
  }
  const rel = (a: number, b: number, sens: string) => ((a < b) === (sens === "croissante") ? "<" : ">");
  if (e.parite === "paire") {
    const lignes: LigneCalcul[] = [];
    if (x1 < 0) lignes.push(ligne(`f(${n(x1)})=f(${n(-x1)})`, "f paire : f(−x) = f(x)"));
    if (x2 < 0) lignes.push(ligne(`f(${n(x2)})=f(${n(-x2)})`, "f paire"));
    const [a1, a2] = [Math.abs(x1), Math.abs(x2)];
    const [pt, gd] = a1 < a2 ? [a1, a2] : [a2, a1];
    lignes.push(ligne(`0\\leq ${n(pt)}<${n(gd)}\\leq ${n(m)}`, `on range les nombres dans [0 ; ${nt(m)}]`));
    lignes.push(ligne(`f(${n(a1)})${rel(a1, a2, e.sens)} f(${n(a2)})`, `f est ${libelleSens(e.sens)} sur [0 ; ${nt(m)}]`));
    return lignes;
  }
  const [pt, gd] = x1 < x2 ? [x1, x2] : [x2, x1];
  return [
    ligne(`-${n(m)}\\leq ${n(pt)}<${n(gd)}\\leq ${n(m)}`, "on range les nombres"),
    ligne(`f(${n(x1)})${rel(x1, x2, e.sens)} f(${n(x2)})`, `f est ${libelleSens(e.sens)} sur [−${nt(m)} ; ${nt(m)}] tout entier (impaire : même sens de part et d'autre de 0)`),
  ];
}

function correctionDeduction(e: ExerciceDeduction): EtapeCorrection[] {
  const [g1, d1] = gaucheDroiteImages(e.comparaisonImages);
  const [g2, d2] = gaucheDroiteValeur(e, e.comparaisonValeur);
  const ci = e.comparaisonImages;
  const cv = e.comparaisonValeur;
  const p = e.p;
  const m = e.m;
  const croissante = e.sens === "croissante";
  const s1 = croissante ? "<" : ">";
  const lignesSens: LigneCalcul[] =
    e.parite === "paire"
      ? [
          ligne(`-${n(m)}\\leq x_1<x_2\\leq 0`, "deux nombres quelconques de [−m ; 0]"),
          ligne(`0\\leq -x_2<-x_1\\leq ${n(m)}`, "on multiplie par −1 : l'ordre s'inverse"),
          ligne(`f(-x_2)${s1} f(-x_1)`, `f est ${libelleSens(e.sens)} sur [0 ; ${nt(m)}]`),
          ligne(`f(x_2)${s1} f(x_1)`, "f paire : f(−x) = f(x)"),
        ]
      : [
          ligne(`-${n(m)}\\leq x_1<x_2\\leq 0`, "deux nombres quelconques de [−m ; 0]"),
          ligne(`0\\leq -x_2<-x_1\\leq ${n(m)}`, "on multiplie par −1 : l'ordre s'inverse"),
          ligne(`f(-x_2)${s1} f(-x_1)`, `f est ${libelleSens(e.sens)} sur [0 ; ${nt(m)}]`),
          ligne(`-f(x_2)${s1} -f(x_1)`, "f impaire : f(−x) = −f(x)"),
          ligne(`f(x_1)${s1} f(x_2)`, "on multiplie par −1 : l'ordre s'inverse"),
        ];
  const piegeTexte: FragmentConsigne[] =
    ci.verdict === "indetermine" || cv.verdict === "indetermine"
      ? [texte("La parité ne renseigne que sur le symétrique de "), latex(intervalleLatex(0, m)), texte(" : hors de "), latex(`[-${n(m)} \\,;\\, ${n(m)}]`), texte(", aucune comparaison n'est possible.")]
      : e.parite === "paire"
        ? [texte("Une fonction paire inverse le sens de variation : sur "), latex(`[-${n(m)} \\,;\\, 0]`), texte(`, f est ${libelleSens(sensSymetrique(e))}.`)]
        : [texte("Une fonction impaire garde le sens de variation : ne pas l'inverser comme pour une fonction paire.")];
  return [
    utilise("a", [texte(`f paire : f(−x) = f(x) ; f impaire : f(−x) = −f(x) ${COURS_ALGEBRE}.`)]),
    calcul("a", e.parite === "paire" ? [ligne(`f(-${n(p)})=f(${n(p)})`, "f paire"), ligne(`=${n(e.v)}`, "donnée de l'énoncé")] : [ligne(`f(-${n(p)})=-f(${n(p)})`, "f impaire"), ligne(`=-${np(e.v)}`, "donnée de l'énoncé"), ligne(`=${n(valeurOpposee(e))}`)]),
    resultat("a", [latex(`${imageLatex(-p)} = ${n(valeurOpposee(e))}`)]),
    utilise("b", [texte(`Le graphique d'une fonction ${e.parite} est symétrique par rapport à ${e.parite === "paire" ? "l'axe des ordonnées : cette symétrie inverse le sens de variation" : "l'origine : cette symétrie garde le sens de variation"}. On le démontre avec deux nombres de [−m ; 0].`)]),
    calcul("b", lignesSens),
    resultat("b", [texte(`f est ${libelleSens(sensSymetrique(e))} sur `), latex(`[-${n(m)} \\,;\\, 0]`), texte(".")]),
    ...(ci.verdict !== "indetermine" && cv.verdict !== "indetermine" ? [piege("b", piegeTexte)] : []),
    utilise("c", [texte(`On ramène les deux nombres dans un intervalle où le sens de variation est connu (avec la parité), puis on compare ${COURS_ALGEBRE}.`)]),
    calcul("c", lignesComparaison(e, ci.x1, ci.x2, ci.verdict)),
    resultat("c", verdictLatex(ci.verdict, g1, d1)),
    ...(ci.verdict === "indetermine" ? [piege("c", piegeTexte)] : []),
    utilise("d", [texte("On compare à "), latex(`f(${n(p)}) = ${n(e.v)}`), texte(" : comparer f(x) au nombre donné revient à comparer deux images.")]),
    calcul("d", [ligne(`${n(e.v)}=f(${n(p)})`, "donnée de l'énoncé"), ...lignesComparaison(e, cv.x, p, cv.verdict)]),
    resultat("d", verdictLatex(cv.verdict, g2, d2)),
    ...(cv.verdict === "indetermine" && ci.verdict !== "indetermine" ? [piege("d", piegeTexte)] : []),
  ];
}

// ---------------------------------------------------------------------------------------------
// Famille « courbe »
// ---------------------------------------------------------------------------------------------

function ligneCondition(condition: ConditionPortrait, f: FonctionTransformee, nom: string): { ligne: LigneCalcul; ok: boolean } {
  switch (condition.type) {
    case "domaine":
      return { ligne: ligne(`\\mathrm{dom}\\,${nom}=${ensembleLatex(domaineFonction(f))}`, "abscisses au-dessus desquelles la courbe existe"), ok: ensemblesEgaux(domaineFonction(f), condition.ensemble) };
    case "image":
      return { ligne: ligne(`\\mathrm{im}\\,${nom}=${ensembleLatex(imageFonction(f))}`, "hauteurs atteintes par la courbe"), ok: ensemblesEgaux(imageFonction(f), condition.ensemble) };
    case "asymptoteH": {
      const k = asymptoteHorizontale(f);
      return k === null
        ? { ligne: ligne("\\text{nombre d'asymptotes horizontales}=0", "la courbe ne se rapproche d'aucune horizontale"), ok: false }
        : { ligne: ligne(`y=${n(k)}`, "asymptote horizontale (pointillé)"), ok: Math.abs(k - condition.k) < 1e-9 };
    }
    case "point": {
      const y = evaluerFonction(f, condition.x);
      if (y === null) return { ligne: ligne(`${n(condition.x)}\\notin\\mathrm{dom}\\,${nom}`, "la courbe n'existe pas à cette abscisse"), ok: false };
      const ok = Math.abs(y - condition.y) < 1e-9;
      return { ligne: ligne(`${nom}(${n(condition.x)})=${n(y)}`, ok ? `la courbe passe par le point (${nt(condition.x)} ; ${nt(condition.y)})` : `la courbe passe ${y > condition.y ? "au-dessus" : "en dessous"} du point (${nt(condition.x)} ; ${nt(condition.y)})`), ok };
    }
    case "extremum": {
      const ex = extremumFonction(f);
      if (!ex) return { ligne: ligne("\\text{nombre d'extremums}=0", "la courbe monte (ou descend) sans jamais faire demi-tour"), ok: false };
      const ok = ex.nature === condition.nature && Math.abs(ex.valeur - condition.valeur) < 1e-9 && (condition.en === null || Math.abs(ex.en - condition.en) < 1e-9);
      return { ligne: ligne(`\\text{${ex.nature}}=${n(ex.valeur)}`, `atteint en x = ${nt(ex.en)}`), ok };
    }
    case "centre": {
      const c = centreSymetrie(f);
      if (!c) return { ligne: ligne("\\text{nombre de centres de symétrie}=0", "la courbe n'a pas de centre de symétrie"), ok: false };
      return { ligne: ligne(`\\text{centre}=${pointLatex(c.x, c.y)}`, "centre de symétrie de la courbe"), ok: Math.abs(c.x - condition.x) < 1e-9 && Math.abs(c.y - condition.y) < 1e-9 };
    }
    case "parite": {
      const p = pariteFonction(f);
      if (p === "paire") return { ligne: ligne(`${nom}(-x)=${nom}(x)`, "courbe symétrique par rapport à l'axe des ordonnées"), ok: condition.parite === "paire" };
      if (p === "impaire") return { ligne: ligne(`${nom}(-x)=-${nom}(x)`, "courbe symétrique par rapport à l'origine"), ok: condition.parite === "impaire" };
      const y1 = evaluerFonction(f, 1);
      const ym = evaluerFonction(f, -1);
      if (y1 !== null && ym !== null) return { ligne: ligne(`${nom}(-1)=${n(ym)}`, `alors que ${nom.replace(/[_{}]/g, "")}(1) = ${nt(y1)} : ni f(−1) = f(1) ni f(−1) = −f(1), aucune symétrie`), ok: false };
      return { ligne: ligne(`\\mathrm{dom}\\,${nom}=${ensembleLatex(domaineFonction(f))}`, "domaine non symétrique par rapport à 0"), ok: false };
    }
    case "monotonie": {
      const s = sensSur(f, condition.u, condition.v);
      const yu = evaluerFonction(f, condition.u);
      const yv = evaluerFonction(f, condition.v);
      if (!s) return { ligne: ligne(`x=${n(f.h)}`, `la courbe change de sens de variation en cette abscisse, à l'intérieur de [${nt(condition.u)} ; ${nt(condition.v)}]`), ok: false };
      const txt = `sur [${nt(condition.u)} ; ${nt(condition.v)}], la courbe ${s === "croissante" ? "monte" : "descend"}`;
      if (yu === null || yv === null) return { ligne: ligne(`x\\in ${intervalleLatex(condition.u, condition.v)}`, txt), ok: s === condition.sens };
      return { ligne: ligne(`${nom}(${n(condition.u)})=${n(yu)}${s === "croissante" ? "<" : ">"}${n(yv)}=${nom}(${n(condition.v)})`, txt), ok: s === condition.sens };
    }
  }
}

function correctionCourbe(e: ExerciceCourbe): EtapeCorrection[] {
  const lettreCorrecte = LETTRES_COURBES[e.indexCorrect]!;
  const nomC = `f_{${lettreCorrecte}}`;
  const etapes: EtapeCorrection[] = [
    utilise("a", [texte("On teste chaque condition sur chaque courbe ; une seule condition non respectée suffit à écarter une courbe. Sur la bonne courbe, toutes se vérifient.")]),
    { ...calcul("a", e.conditions.map((c) => ligneCondition(c, e.courbes[e.indexCorrect]!, nomC).ligne), [texte(`Courbe ${lettreCorrecte} :`)]), figureHtml: grilleCourbes(e, true) },
    resultat("a", [texte(`La courbe ${lettreCorrecte} respecte les trois conditions : c'est la courbe de f.`)]),
  ];
  indicesCourbesEcartees(e).forEach((i, k) => {
    const lettre = LETTRES_COURBES[i]!;
    const condition = e.conditions[e.violations[i]!]!;
    const sq = "bcd"[k]!;
    etapes.push(utilise(sq, [texte("On confronte la courbe à chaque condition : "), ...conditionFragments(condition), texte(".")]));
    etapes.push(calcul(sq, [ligneCondition(condition, e.courbes[i]!, `f_{${lettre}}`).ligne], [texte(`Courbe ${lettre} :`)]));
    etapes.push(resultat(sq, [texte(`La courbe ${lettre} ne respecte pas la condition : `), ...conditionFragments(condition), texte(".")]));
  });
  etapes.push(piege("b", [texte("Une courbe écartée respecte souvent les autres conditions : il faut toutes les tester, et une seule condition non respectée suffit pour l'écarter.")]));
  return etapes;
}

export function correctionDetailleePortraitRobot(e: ExercicePortraitRobot): EtapeCorrection[] {
  if (e.famille === "expression") return correctionExpression(e);
  if (e.famille === "deduction") return correctionDeduction(e);
  return correctionCourbe(e);
}
