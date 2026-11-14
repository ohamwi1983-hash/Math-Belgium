import type { ExerciceAiresFormesReelles } from "../../core6e/airesFormesReelles.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { aireCourbe, arcExercice, bornesArc, coefArc, coefficientsVitrail, litresPeinture, nombrePots, phasesExercice, valeurTotal } from "../../moteur6e/modeleAiresFormesReelles";
import type { PhaseFormesReelles } from "../../moteur6e/modeleAiresFormesReelles";
import {
  aideNiveau1,
  blocDonnees,
  bornesVitrailTex,
  calculIntegraleTex,
  consigneEcran,
  consigneGenerale,
  eurosLatex as eurosTex,
  formatReponseAttenduePhaseLatex,
  polyTex,
  representer,
} from "../../ui6e/formatAiresFormesReelles";
import { figureCorrigeSvg, schemaEnonceSvg } from "../../ui6e/figureAiresFormesReelles";
import { profilAiresFormesReelles } from "./profilEvaluation";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceAiresFormesReelles } from "./index";
import type { IdVarianteAiresFormesReelles } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceAiresFormesReelles>` de `6gen81` « Aires de formes
 * réelles » — méthode de `.claude/rules/feuilles-evaluations.md`.
 *
 * - Énoncé papier : la situation, les formules données, le schéma coté (`enteteHtml`, repère
 *   superposé seulement si la fonction est donnée) et une consigne globale (modéliser, précision).
 *   Les VRAIES questions du problème restent en a) b) c) : aire (mur : surface à peindre ; parcelle :
 *   aire en m²), puis peinture / coût / volume / valeur. Les étapes de guidage (bornes, aire de la
 *   partie courbe) passent au corrigé (« Étape n — … »).
 * - Corrigé : valeurs tirées des MÊMES fonctions que l'écran (`formatReponseAttenduePhaseLatex`,
 *   `calculIntegraleTex`), une ligne « Piège » ciblée par étape, la figure du corrigé (repère,
 *   fonction, aire colorée) sous la conclusion de l'étape « aire ».
 * - Version aménagée : même énoncé (le pipeline ne change que la mise en page).
 */

type E = ExerciceAiresFormesReelles;

const f = (valeur: string): FragmentConsigne => latex(valeur);
const t = (valeur: string): FragmentConsigne => texte(valeur);
const LETTRES = "abcde";

function lettre(e: E, phase: PhaseFormesReelles): string {
  return LETTRES[phasesExercice(e).indexOf(phase)];
}

/** Donnée (cote, prix, contenance) : décimal. */
function r(v: number, _e: E): string {
  return representer(v, false).tex;
}

/** Résultat (aire, coefficient) : fraction dans le régime exact. */
function rc(v: number, e: E): string {
  return representer(v, e.calcul === "exacte").tex;
}

function liste(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [f(x)] : [t(" ; "), f(x)]));
}

// ============================================================================
// Énoncé papier.
// ============================================================================

function consigneGlobale(e: E): FragmentConsigne[] {
  const precision = " Donne les aires sous forme exacte ou arrondies au centième.";
  switch (e.situation) {
    case "mur":
      return [t(e.modele === "retrouver" ? " Modélise le bord du fronton par une parabole, dans un repère de ton choix (axe des abscisses le long du bord supérieur du rectangle, unité 1 m)." + precision : precision)];
    case "vitrail":
      return [t(precision)];
    case "section": {
      const u = e.contexte === "gouttiere" ? "cm" : "m";
      const base = e.contexte === "gouttiere" ? "du bord supérieur" : "du sol";
      return [t(e.modele === "retrouver" ? ` Modélise l'arc par une parabole, dans un repère de ton choix (axe des abscisses le long ${base}, unité 1 ${u}).${precision}` : precision)];
    }
    case "parcelle":
      return [t(e.modele === "retrouver" ? " Modélise la berge par une parabole dans ce repère." + precision : precision)];
  }
}

function entete(e: E): FragmentConsigne[] {
  const formules = blocDonnees(e);
  const donnees: FragmentConsigne[] = formules.length === 0 ? [] : [t(" On donne : "), ...liste(formules), t(".")];
  return [...consigneGenerale(e), ...donnees, ...consigneGlobale(e)];
}

const q = (...fragments: FragmentConsigne[]): QuestionExercice => ({ consigne: fragments });

/** Vraies questions du problème et étapes qu'elles couvrent. */
function questionsPapier(e: E): { questions: QuestionExercice[]; etapes: string[][] } {
  switch (e.situation) {
    case "mur":
      return {
        questions: [q(t("Calcule l'aire du mur à peindre, en m².")), q(t("Combien de litres de peinture faut-il pour les deux couches ? Combien de pots faut-il acheter ?")), q(t("Quel est le coût de la peinture ?"))],
        etapes: [["a", "b", "c"], ["d"], ["e"]],
      };
    case "vitrail":
      return { questions: [q(t("Calcule l'aire de la lentille de verre rouge, en dm².")), q(t("Calcule le coût total du verre du vitrail, au centime près."))], etapes: [["a", "b"], ["c", "d"]] };
    case "section": {
      const aire = e.contexte === "gouttiere" ? "cm²" : "m²";
      const volume = e.contexte === "canal" ? "le volume d'eau contenu dans le canal plein, en m³" : e.contexte === "tunnel" ? "le volume de terre à évacuer, en m³" : "le volume d'eau contenu dans la gouttière pleine, en litres";
      return { questions: [q(t(`Calcule l'aire de la section, en ${aire}.`)), q(t(`Calcule ${volume}.`))], etapes: [["a", "b"], ["c"]] };
    }
    case "parcelle":
      return { questions: [q(t("Calcule l'aire de la parcelle, en m².")), q(t("Quelle est la valeur de la parcelle, arrondie à l'euro ?"))], etapes: [["a", "b", "c"], ["d"]] };
  }
}

function reponseBreve(e: E): FragmentConsigne[] {
  const { etapes } = questionsPapier(e);
  const phases = phasesExercice(e);
  return etapes.flatMap((lettres, i) => {
    const derniere = phases[LETTRES.indexOf(lettres[lettres.length - 1])];
    return [...(i > 0 ? [t(" ; ")] : []), t(`${LETTRES[i]}) `), ...liste(formatReponseAttenduePhaseLatex(e, derniere))];
  });
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: entete(e), enteteHtml: schemaEnonceSvg(e), questions: phasesExercice(e).map((phase) => ({ consigne: consigneEcran(e, phase) })) };
}

function construireCorrection(e: E): BlocCorrection[] {
  return phasesExercice(e).map((phase) => ({ type: "paragraphe", fragments: [t(`${lettre(e, phase)}) `), ...liste(formatReponseAttenduePhaseLatex(e, phase))] }));
}

function enoncePapier(e: E): EnoncePapier {
  const { questions, etapes } = questionsPapier(e);
  return { section: { enteteFragments: entete(e), enteteHtml: schemaEnonceSvg(e), questions }, etapesParQuestion: etapes, reponseBreve: reponseBreve(e) };
}

// ============================================================================
// Corrigé détaillé.
// ============================================================================

function lignesModeliser(e: E): { methode: FragmentConsigne[]; calcul: FragmentConsigne[] | null; piege: FragmentConsigne[] | null } {
  if (e.situation === "vitrail") {
    const { f: cf, g: cg } = coefficientsVitrail(e);
    const h = polyTex(cf.map((v, i) => v - cg[i]), e.calcul === "exacte").tex;
    const [x1, x2] = bornesVitrailTex(e);
    return {
      methode: [t("Les arcs se rejoignent là où "), f("f(x)=g(x)"), t(" : on passe tout dans le même membre et on résout l'équation du second degré.")],
      calcul: [f(`${h}=0`), t(" ⟺ "), f(`(x-${r(e.m, e)})^2=${r(e.s, e)}`), t(", donc "), f(`x_1=${x1}`), t(" et "), f(`x_2=${x2}`), t(".")],
      piege: [t("Prendre comme bornes les bords du vitrail ("), f(`0`), t(" et "), f(r(e.W, e)), t(") : la lentille s'arrête aux points où les arcs se rejoignent.")],
    };
  }
  if (e.situation === "parcelle") {
    if (e.modele === "retrouver") {
      const y0 = e.alpha * e.m * e.m + e.k;
      const a = representer(e.alpha, e.calcul === "exacte");
      return {
        methode: [t("Avec une unité de 10 m, le sommet de la parabole est "), f(`(${r(e.m, e)}\\,;\\,${r(e.k, e)})`), t(" et la berge passe par "), f(`(0\\,;\\,${r(y0, e)})`), t(" : forme canonique, puis le point du pont donne le coefficient.")],
        calcul: [f(`f(x)=c(x-${r(e.m, e)})^2+${r(e.k, e)}`), t(" ; "), f(`f(0)=${r(y0, e)}`), t(" ⟹ "), f(`c=\\dfrac{${r(y0, e)}-${r(e.k, e)}}{${r(e.m * e.m, e)}}${a.exact ? "=" : "\\approx"}${a.tex}`), t(". Les clôtures sont en "), f(`x=${r(e.a, e)}`), t(" et "), f(`x=${r(e.b, e)}`), t(".")],
        piege: [t("Garder les distances en mètres (par exemple "), f(`x=${r(10 * e.b, e)}`), t(" au lieu de "), f(`x=${r(e.b, e)}`), t(") alors que l'unité du repère vaut 10 m.")],
      };
    }
    return {
      methode: [t("Une unité du repère vaut 10 m : on divise par 10 les distances des clôtures au pont.")],
      calcul: [f(`a=\\dfrac{${r(10 * e.a, e)}}{10}=${r(e.a, e)}`), t(" et "), f(`b=\\dfrac{${r(10 * e.b, e)}}{10}=${r(e.b, e)}`), t(".")],
      piege: [t("Intégrer de "), f(r(10 * e.a, e)), t(" à "), f(r(10 * e.b, e)), t(" : les bornes s'expriment dans les unités du repère.")],
    };
  }
  const arc = arcExercice(e);
  const [p, qq] = bornesArc(arc, e.repere);
  const sommet = arc.sens * arc.fleche;
  if (e.modele === "retrouver") {
    const c = representer(coefArc(arc), e.calcul === "exacte");
    const egal = c.exact ? "=" : "\\approx";
    const origine = e.repere === "pied" ? "au pied gauche de l'arc" : "au milieu de la base de l'arc";
    const calcul: FragmentConsigne[] =
      e.repere === "pied"
        ? [f(`f(x)=c\\,x\\,(x-${r(arc.largeur, e)})`), t(" ; "), f(`f(${r(arc.largeur / 2, e)})=${r(sommet, e)}`), t(" ⟹ "), f(`c\\times ${r(arc.largeur / 2, e)}\\times(${r(-arc.largeur / 2, e)})=${r(sommet, e)}`), t(" ⟹ "), f(`c${egal}${c.tex}`), t(".")]
        : [f(`f(x)=${r(sommet, e)}+c\\,x^2`), t(" ; "), f(`f(${r(arc.largeur / 2, e)})=0`), t(" ⟹ "), f(`c=\\dfrac{${r(-sommet, e)}}{${r((arc.largeur / 2) ** 2, e)}}${egal}${c.tex}`), t(".")];
    return {
      methode: [
        t(`Repère choisi : origine ${origine}, axe des abscisses le long de la base. Les pieds de l'arc sont en `),
        f(`x=${r(p, e)}`),
        t(" et "),
        f(`x=${r(qq, e)}`),
        t(", le sommet est "),
        f(`(${r((p + qq) / 2, e)}\\,;\\,${r(sommet, e)})`),
        t(". Tout autre choix d'origine sur cet axe convient : la parabole est seulement translatée, l'aire ne change pas."),
      ],
      calcul,
      piege: [t("Écrire la parabole sans qu'elle s'annule aux deux pieds (par exemple avec la flèche comme coefficient de "), f("x^2"), t(") : on vérifie toujours que "), f(`f(${r(p, e)})=f(${r(qq, e)})=0`), t(".")],
    };
  }
  return {
    methode: [t("Les bornes sont les abscisses des pieds de l'arc, là où la courbe coupe l'axe des abscisses : on résout "), f("f(x)=0"), t(".")],
    calcul: [f(`${blocDonnees(e)[0].replace("f(x)=", "")}=0`), t(" ⟺ "), f(`x=${r(p, e)}`), t(" ou "), f(`x=${r(qq, e)}`), t(".")],
    piege: null,
  };
}

function lignesAire(e: E): { methode: FragmentConsigne[]; piege: FragmentConsigne[] | null } {
  const aide = aideNiveau1(e, "aire");
  const methode: FragmentConsigne[] = [t(aide.texte.replace(/ :$/, " : ")), ...(aide.latex ? [f(aide.latex)] : []), t(".")];
  let piege: FragmentConsigne[] | null = null;
  if (e.situation === "section" && e.contexte !== "tunnel") piege = [t("Donner l'intégrale négative comme aire : sous l'axe des abscisses, l'aire est l'opposé de l'intégrale.")];
  else if (e.situation === "vitrail") piege = [t("Intégrer "), f("f-g"), t(" sur toute la largeur du vitrail : hors de la lentille, "), f("f-g"), t(" est négative et la valeur n'a plus de sens.")];
  else if (e.situation === "mur") {
    piege = [
      t("Mélanger deux repères, par exemple intégrer de "),
      f(e.repere === "pied" ? r(-e.L / 2, e) : "0"),
      t(" à "),
      f(r(e.repere === "pied" ? e.L / 2 : e.L, e)),
      t(" : les bornes et l'équation de l'arc doivent venir du même repère."),
    ];
  }
  return { methode, piege };
}

function correctionDetaillee(e: E): EtapeCorrection[] {
  const lignes: EtapeCorrection[] = [];
  for (const phase of phasesExercice(e)) {
    const sq = lettre(e, phase);
    const conclusion = (fr: FragmentConsigne[], figure?: string): EtapeCorrection => ({ label: "Conclusion", sousQuestion: sq, fragments: fr, ...(figure ? { figureHtml: figure } : {}) });
    const reponse = liste(formatReponseAttenduePhaseLatex(e, phase));
    switch (phase) {
      case "modeliser": {
        const m = lignesModeliser(e);
        lignes.push({ label: "Méthode", sousQuestion: sq, fragments: m.methode });
        if (m.calcul) lignes.push({ label: "Calcul", sousQuestion: sq, fragments: m.calcul });
        lignes.push(conclusion(reponse));
        if (m.piege) lignes.push({ label: "Piège", sousQuestion: sq, fragments: m.piege });
        break;
      }
      case "aire": {
        const a = lignesAire(e);
        lignes.push({ label: "Méthode", sousQuestion: sq, fragments: a.methode });
        lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(calculIntegraleTex(e))] });
        lignes.push(conclusion(reponse, figureCorrigeSvg(e)));
        if (a.piege) lignes.push({ label: "Piège", sousQuestion: sq, fragments: a.piege });
        break;
      }
      case "total": {
        const aire = aireCourbe(e);
        if (e.situation === "mur") {
          lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Le mur est formé du rectangle et de la partie arrondie.")] });
          lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`S=${r(e.L, e)}\\times ${r(e.h, e)}+${rc(aire, e)}`)] });
          lignes.push(conclusion(reponse));
          lignes.push({ label: "Piège", sousQuestion: sq, fragments: [t("Oublier la partie rectangulaire : l'intégrale ne donne que l'aire du fronton.")] });
        } else if (e.situation === "vitrail") {
          lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Le verre clair occupe tout le vitrail, sauf la lentille rouge.")] });
          lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`\\mathcal{A}_{\\text{clair}}=${r(e.W, e)}\\times ${r(e.H, e)}-${rc(aire, e)}`)] });
          lignes.push(conclusion(reponse));
        } else {
          lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Une unité d'aire est un carré de 10 m de côté : "), f("1\\text{ u.a.}=100\\text{ m}^2"), t(".")] });
          lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`\\mathcal{A}=100\\times ${rc(aire, e)}`)] });
          lignes.push(conclusion(reponse));
          lignes.push({ label: "Piège", sousQuestion: sq, fragments: [t("Multiplier par 10 au lieu de 100 : les deux dimensions sont multipliées par 10.")] });
        }
        break;
      }
      case "peinture": {
        if (e.situation !== "mur") break;
        const litres = litresPeinture(e);
        lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Deux couches couvrent deux fois la surface ; un pot entamé s'achète entier.")] });
        lignes.push({
          label: "Calcul",
          sousQuestion: sq,
          fragments: [f(`\\dfrac{2\\times ${rc(valeurTotal(e), e)}}{${r(e.rendement, e)}}${Math.abs(litres * 100 - Math.round(litres * 100)) < 1e-6 ? "=" : "\\approx"}${representer(Math.round(litres * 100) / 100, false).tex}\\text{ L}`), t(" ; "), f(`\\dfrac{${representer(Math.round(litres * 100) / 100, false).tex}}{${r(e.contenance, e)}}${Math.abs((litres / e.contenance) * 100 - Math.round((litres / e.contenance) * 100)) < 1e-6 ? "=" : "\\approx "}${representer(Math.round((litres / e.contenance) * 100) / 100, false).tex}`), t(", donc "), f(`${nombrePots(e)}`), t(nombrePots(e) > 1 ? " pots." : " pot.")],
        });
        lignes.push(conclusion(reponse));
        lignes.push({ label: "Piège", sousQuestion: sq, fragments: [t(`Arrondir le nombre de pots au plus proche ou vers le bas (${nombrePots(e) - 1} pot${nombrePots(e) - 1 > 1 ? "s" : ""}) : il manquerait de la peinture.`)] });
        break;
      }
      case "cout": {
        if (e.situation === "mur") lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`${nombrePots(e)}\\times ${eurosTex(e.prixPot)}`)] });
        else if (e.situation === "vitrail") {
          lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Les prix sont au m² : "), f("1\\text{ dm}^2=0{,}01\\text{ m}^2"), t(".")] });
          lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`\\dfrac{${rc(aireCourbe(e), e)}}{100}\\times ${eurosTex(e.prixColore)}+\\dfrac{${rc(valeurTotal(e), e)}}{100}\\times ${eurosTex(e.prixClair)}`)] });
        } else if (e.situation === "parcelle") lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`${rc(valeurTotal(e), e)}\\times ${eurosTex(e.prix)}`)] });
        lignes.push(conclusion(reponse));
        if (e.situation === "vitrail") lignes.push({ label: "Piège", sousQuestion: sq, fragments: [t("Multiplier des dm² par un prix au m² : le coût serait cent fois trop grand.")] });
        break;
      }
      case "volume": {
        if (e.situation !== "section") break;
        const aire = rc(aireCourbe(e), e);
        if (e.contexte === "gouttiere") {
          lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Volume d'un prisme droit : aire de la section × longueur, dans la même unité (cm), puis "), f("1\\text{ L}=1000\\text{ cm}^3"), t(".")] });
          lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`\\dfrac{${aire}\\times ${r(100 * e.longueur, e)}}{1000}`)] });
        } else {
          lignes.push({ label: "Méthode", sousQuestion: sq, fragments: [t("Volume d'un prisme droit : aire de la section × longueur.")] });
          lignes.push({ label: "Calcul", sousQuestion: sq, fragments: [f(`${aire}\\times ${r(e.longueur, e)}`)] });
        }
        lignes.push(conclusion(reponse));
        lignes.push({
          label: "Piège",
          sousQuestion: sq,
          fragments: e.contexte === "gouttiere" ? [t("Multiplier des cm² par une longueur en mètres : convertis la longueur en cm avant de multiplier.")] : [t("Oublier de multiplier par la longueur : l'aire de la section n'est pas un volume.")],
        });
        break;
      }
    }
  }
  return lignes;
}

// ============================================================================
// Barème (poids, somme 4).
// ============================================================================

const POIDS: Record<E["situation"], Partial<Record<PhaseFormesReelles, number>>> = {
  mur: { modeliser: 1, aire: 1, total: 0.5, peinture: 1, cout: 0.5 },
  vitrail: { modeliser: 1, aire: 1, total: 0.5, cout: 1.5 },
  section: { modeliser: 1, aire: 1.5, volume: 1.5 },
  parcelle: { modeliser: 1, aire: 1, total: 1, cout: 1 },
};

function critere(e: E, phase: PhaseFormesReelles): FragmentConsigne[] {
  const reponse = liste(formatReponseAttenduePhaseLatex(e, phase));
  if (phase === "modeliser") return e.situation === "vitrail" ? [t("Intersections : "), ...reponse] : e.modele === "retrouver" ? [t("Modèle et bornes : "), ...reponse] : [t("Bornes : "), ...reponse];
  if (phase === "aire") return [t("Intégrale correcte et aire : "), ...reponse];
  return reponse;
}

function erreurs(e: E): ErreurFrequente[] {
  switch (e.situation) {
    case "mur":
      return [
        { description: [t("Oubli de la partie rectangulaire")], cout: "−0,5 et suite cohérente" },
        { description: [t("Nombre de pots arrondi vers le bas")], cout: "−0,5" },
        { description: [t("Une seule couche comptée")], cout: "−0,5" },
      ];
    case "vitrail":
      return [
        { description: [t("Bornes prises aux bords du vitrail")], cout: "0 pt sur les étapes 1 et 2" },
        { description: [t("Aires en dm² multipliées par un prix au m²")], cout: "−1" },
      ];
    case "section":
      return [
        { description: [t("Aire négative (intégrale non corrigée de son signe)")], cout: "−0,5" },
        { description: e.contexte === "gouttiere" ? [t("Conversion cm³ → L ou longueur en m oubliée")] : [t("Oubli de la multiplication par la longueur")], cout: "−1" },
      ];
    case "parcelle":
      return [
        { description: [t("Bornes en mètres au lieu des unités du repère")], cout: "0 pt sur les étapes 1 et 2" },
        { description: [t("Conversion 1 u.a. = 10 m²")], cout: "−1" },
      ];
  }
}

function bareme(e: E): BaremeExercice {
  const criteres: CritereBareme[] = phasesExercice(e).map((phase) => ({ sousQuestion: lettre(e, phase), critere: critere(e, phase), points: POIDS[e.situation][phase] ?? 0 }));
  const acceptees: FragmentConsigne[][] = [[t("Valeurs exactes ou arrondies au centième ; une erreur de calcul n'est pénalisée qu'une fois (suite cohérente)")]];
  if ((e.situation === "mur" || e.situation === "section") && e.modele === "retrouver") acceptees.push([t("Tout repère dont l'axe des abscisses suit la base de l'arc (équation translatée, mêmes aires)")]);
  return { reponseFinale: reponseBreve(e), criteres, erreursFrequentes: erreurs(e), reponsesAcceptees: acceptees };
}

function difficulte(e: E): 1 | 2 | 3 {
  if (e.situation === "vitrail") return 3;
  return e.modele === "retrouver" ? 3 : 2;
}

export const adaptateurEvaluationAiresFormesReelles: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Aires de formes réelles — Évaluation",
  nomFichierBase: "aires-formes-reelles",
  genererInstance: genererExerciceAiresFormesReelles,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdVarianteAiresFormesReelles),
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 15,
  profilInstance: profilAiresFormesReelles,
};

