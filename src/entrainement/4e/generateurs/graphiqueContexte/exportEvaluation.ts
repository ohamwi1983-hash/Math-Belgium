import type { ComparateurGraphique, ExerciceGraphiqueContexte, IdContexteGraphique, QuestionGraphique } from "../../core/graphiqueContexte.types";
import type { Morceau } from "../../core/inequation.types";
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
import { CONSIGNE_TYPE, justificationType, LIBELLE_TYPE, questionTexte } from "../../ui/formatGraphiqueContexte";
import { construireSvgGraphiqueContexte } from "../../ui/svgGraphiqueContexte";
import { profilGraphiqueContexte } from "../profilsEvaluationGraphiqueContexte";
import { formatNombreTexte, TEXTES_CONTEXTES } from "./contextes";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceGraphiqueContexte } from "./index";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceGraphiqueContexte>` pour gen70 (Lire un graphique
 * en contexte, 4e ch. 3, processus TRANSFÉRER).
 *
 * Écran → papier :
 * - l'écran déroule 2 étapes par question (« quelle caractéristique ? », puis la lecture) : ce sont
 *   les étapes a, b (question 1), c, d (question 2)… de `construireEnonce` ;
 * - l'énoncé PAPIER (`enoncePapier`) garde les 4 VRAIES questions a) b) c) d), en langage courant,
 *   sous la situation et le graphique (même figure qu'à l'écran, couleurs fixes) — l'identification
 *   de la caractéristique n'y figure pas : elle passe dans le corrigé (« Méthode ») ;
 * - corrigé détaillé : par question, Méthode (caractéristique et pourquoi), Lecture avec la figure
 *   annotée (pointillés de lecture, intervalles surlignés, crochets pleins/vides), Conclusion avec
 *   l'unité, Piège ciblé.
 * Textes et valeurs : mêmes fonctions que l'écran (`ui/formatGraphiqueContexte.ts`, `contextes.ts`,
 * réponses calculées par le générateur), jamais recalculés ici.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function nombreLatex(v: number): string {
  return formatNombreTexte(v).replace(",", "{,}").replace("−", "-");
}

function borneLatex(b: Morceau["borneGauche"]): string {
  return b === "-inf" ? "-\\infty" : b === "+inf" ? "+\\infty" : nombreLatex(b);
}

function morceauxLatex(morceaux: Morceau[]): string {
  return morceaux.map((m) => `${m.crochetGauche}${borneLatex(m.borneGauche)}\\,;\\,${borneLatex(m.borneDroite)}${m.crochetDroit}`).join(" \\cup ");
}

const CONSIGNE_GLOBALE = "Réponds aux questions en lisant le graphique. Donne chaque réponse avec son unité ; une période se note par un intervalle.";

function svgPapier(e: ExerciceGraphiqueContexte, annotation: QuestionGraphique | null = null): string {
  return construireSvgGraphiqueContexte(e, { theme: "papier", annotation });
}

/** Réponse d'une question (fragments, unité comprise) — partagée par réponse brève, barème, corrigé. */
function reponseFragments(e: ExerciceGraphiqueContexte, q: QuestionGraphique): FragmentConsigne[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [texte(t.valeurY(q.y))];
    case "antecedent":
      return [texte(q.solutions.map(t.valeurX).join(" et "))];
    case "inequation":
      return [latex(morceauxLatex(q.solution)), texte(` (en ${t.uniteX})`)];
    case "extremum":
      return [texte(`${q.nature === "max" ? "maximum" : "minimum"} de ${t.valeurY(q.y)}, atteint ${t.moment(q.x)}`)];
    case "variation":
      return [latex(morceauxLatex(q.intervalles)), texte(` (en ${t.uniteX})`)];
    case "tendance":
      return [texte(t.valeurY(q.L))];
  }
}

function lectureFragments(e: ExerciceGraphiqueContexte, q: QuestionGraphique): FragmentConsigne[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [texte(`On part de ${t.valeurX(q.x)} sur l'axe horizontal, on monte jusqu'à la courbe, puis on lit l'ordonnée du point atteint : ${t.valeurY(q.y)}.`)];
    case "antecedent": {
      const n = q.solutions.length;
      return [
        texte(
          `L'horizontale à la hauteur ${t.valeurY(q.k)} rencontre la courbe en ${n === 1 ? "un seul point" : `${n} points`}, d'abscisse${n > 1 ? "s" : ""} ${q.solutions.map(t.valeurX).join(" et ")}.`,
        ),
      ];
    }
    case "inequation": {
      const dessus = q.comparateur === ">=" || q.comparateur === ">";
      const large = q.comparateur === ">=" || q.comparateur === "<=";
      return [
        texte(
          `On garde les parties de la courbe situées ${dessus ? "au-dessus" : "au-dessous"} de l'horizontale à la hauteur ${t.valeurY(q.k)} (surlignées). « ${libelleComparaison(q.comparateur)} » ${large ? "inclut" : "exclut"} les moments où la grandeur vaut exactement ${t.valeurY(q.k)} : crochets ${large ? "fermés" : "ouverts"} en ces bornes ; une extrémité de la période représentée qui convient reste incluse.`,
        ),
      ];
    }
    case "extremum":
      return [
        texte(`Le point ${q.nature === "max" ? "le plus haut" : "le plus bas"} de la courbe a pour coordonnées `),
        latex(`(${nombreLatex(q.x)}\\,;\\,${nombreLatex(q.y)})`),
        texte(` : abscisse ${t.valeurX(q.x)}, ordonnée ${t.valeurY(q.y)}.`),
      ];
    case "variation":
      return [
        texte(
          `De gauche à droite, la courbe ${q.sens === "croissante" ? "monte" : "descend"} sur les parties surlignées ; leurs bornes sont les abscisses des sommets, des creux${aDesPaliers(e) ? " et des extrémités des paliers" : ""}.`,
        ),
      ];
    case "tendance":
      return [texte(`Vers la droite du graphique, la courbe s'aplatit et se rapproche de l'horizontale à la hauteur ${t.valeurY(q.L)} (pointillé), sans l'atteindre.`)];
  }
}

function libelleComparaison(c: ComparateurGraphique): string {
  return c === ">=" ? "au moins" : c === ">" ? "plus de" : c === "<" ? "moins de" : "au plus";
}

function aDesPaliers(e: ExerciceGraphiqueContexte): boolean {
  if (e.courbe.type !== "lineaire") return false;
  const p = e.courbe.points;
  return p.some((pt, i) => i < p.length - 1 && pt.y === p[i + 1]!.y);
}

function piegeFragments(e: ExerciceGraphiqueContexte, q: QuestionGraphique): FragmentConsigne[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [texte(`Ce n'est pas un antécédent : la valeur connue est sur l'axe horizontal, la réponse se lit sur l'axe vertical et s'écrit avec son unité (${t.uniteY}).`)];
    case "antecedent":
      return q.solutions.length > 1
        ? [texte(`Il y a ${q.solutions.length} antécédents : il faut les donner tous. Ce n'est pas une image : la réponse se lit sur l'axe horizontal (en ${t.uniteX}).`)]
        : [texte(`Ce n'est pas une image : la valeur connue est sur l'axe vertical, la réponse se lit sur l'axe horizontal (en ${t.uniteX}).`)];
    case "inequation": {
      const large = q.comparateur === ">=" || q.comparateur === "<=";
      return [
        texte(
          large
            ? `« ${libelleComparaison(q.comparateur)} » inclut le niveau ${t.valeurY(q.k)} : un crochet ouvert en une borne où la grandeur vaut ${t.valeurY(q.k)} serait faux.`
            : `« ${libelleComparaison(q.comparateur)} » exclut le niveau ${t.valeurY(q.k)} : un crochet fermé en une borne où la grandeur vaut ${t.valeurY(q.k)} serait faux.`,
        ),
      ];
    }
    case "extremum":
      return [
        texte(
          `Deux informations sont demandées : la valeur (${t.valeurY(q.y)}) ET le moment (${t.valeurX(q.x)})${q.x === e.axeX.min || q.x === e.axeX.max ? " — ici atteint à une extrémité de la période représentée" : ""}.`,
        ),
      ];
    case "variation":
      return aDesPaliers(e)
        ? [texte("Un palier (grandeur constante) n'est ni croissant ni décroissant : il ne fait pas partie de la réponse.")]
        : [texte(`Les bornes des intervalles sont des valeurs de l'axe horizontal (en ${t.uniteX}), pas des valeurs de ${t.grandeurY}.`)];
    case "tendance":
      return [texte("La réponse n'est pas la dernière valeur lue sur le graphique, mais la valeur dont la courbe se rapproche (asymptote horizontale).")];
  }
}

function construireEnonceGraphiqueContexte(e: ExerciceGraphiqueContexte): SectionExercice {
  return {
    enteteFragments: [texte(`${TEXTES_CONTEXTES[e.contexte].situation} ${CONSIGNE_GLOBALE}`)],
    enteteHtml: svgPapier(e),
    questions: e.questions.flatMap((q) => [
      { consigne: [texte(`${CONSIGNE_TYPE} (« ${questionTexte(e, q)} »)`)] },
      { consigne: [texte(questionTexte(e, q))] },
    ]),
  };
}

function construireCorrectionGraphiqueContexte(e: ExerciceGraphiqueContexte): BlocCorrection[] {
  return e.questions.flatMap((q, i) => [
    { type: "paragraphe" as const, fragments: [texte(`${LETTRES[2 * i]}) ${LIBELLE_TYPE[q.type]}.`)] },
    { type: "paragraphe" as const, fragments: [texte(`${LETTRES[2 * i + 1]}) `), ...reponseFragments(e, q), texte(".")] },
  ]);
}

function reponseBreveGraphiqueContexte(e: ExerciceGraphiqueContexte): FragmentConsigne[] {
  return e.questions.flatMap((q, i) => [texte(`${i === 0 ? "" : " ; "}${LETTRES[i]}) `), ...reponseFragments(e, q)]);
}

function enoncePapierGraphiqueContexte(e: ExerciceGraphiqueContexte): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`${TEXTES_CONTEXTES[e.contexte].situation} ${CONSIGNE_GLOBALE}`)],
      enteteHtml: svgPapier(e),
      questions: e.questions.map((q) => ({ consigne: [texte(questionTexte(e, q))] })),
    },
    etapesParQuestion: e.questions.map((_, i) => [LETTRES[2 * i]!, LETTRES[2 * i + 1]!]),
    reponseBreve: reponseBreveGraphiqueContexte(e),
  };
}

function correctionDetailleeGraphiqueContexte(e: ExerciceGraphiqueContexte): EtapeCorrection[] {
  return e.questions.flatMap((q, i) => {
    const lType = LETTRES[2 * i]!;
    const lLecture = LETTRES[2 * i + 1]!;
    return [
      { label: "Méthode", sousQuestion: lType, fragments: [texte(`${LIBELLE_TYPE[q.type]}. ${justificationType(e, q)}`)] },
      { label: "Lecture", sousQuestion: lLecture, fragments: lectureFragments(e, q), figureHtml: svgPapier(e, q) },
      { label: "Conclusion", sousQuestion: lLecture, fragments: [...reponseFragments(e, q), texte(".")] },
      { label: "Piège", sousQuestion: lLecture, fragments: piegeFragments(e, q) },
    ];
  });
}

function criteresQuestion(e: ExerciceGraphiqueContexte, q: QuestionGraphique, lettre: string): CritereBareme[] {
  const t = TEXTES_CONTEXTES[e.contexte];
  switch (q.type) {
    case "image":
      return [{ sousQuestion: lettre, critere: [texte(`Valeur lue sur l'axe vertical, avec son unité (${t.uniteY})`)], points: 1 }];
    case "antecedent":
      return q.solutions.length > 1
        ? [
            { sousQuestion: lettre, critere: [texte("Lecture sur l'axe horizontal, avec l'unité")], points: 0.5 },
            { sousQuestion: lettre, critere: [texte(`Les ${q.solutions.length} antécédents, et seulement eux`)], points: 0.5 },
          ]
        : [{ sousQuestion: lettre, critere: [texte("Antécédent lu sur l'axe horizontal, avec l'unité")], points: 1 }];
    case "inequation":
      return [
        { sousQuestion: lettre, critere: [texte("Bornes des intervalles (abscisses où la courbe atteint le niveau, extrémités de la période)")], points: 0.5 },
        { sousQuestion: lettre, critere: [texte("Crochets (niveau inclus ou exclu selon la question)")], points: 0.5 },
      ];
    case "extremum":
      return [
        { sousQuestion: lettre, critere: [texte(`Valeur de l'extremum, avec l'unité (${t.uniteY})`)], points: 0.5 },
        { sousQuestion: lettre, critere: [texte(`Moment où il est atteint (${t.uniteX})`)], points: 0.5 },
      ];
    case "variation":
      return [
        { sousQuestion: lettre, critere: [texte(`Bornes lues sur l'axe horizontal${aDesPaliers(e) ? ", paliers exclus" : ""}`)], points: 0.5 },
        { sousQuestion: lettre, critere: [texte(`Tous les intervalles (${q.intervalles.length}), et seulement eux`)], points: 0.5 },
      ];
    case "tendance":
      return [{ sousQuestion: lettre, critere: [texte(`Valeur limite (asymptote horizontale), avec son unité (${t.uniteY})`)], points: 1 }];
  }
}

function baremeGraphiqueContexte(e: ExerciceGraphiqueContexte): BaremeExercice {
  const criteres = e.questions.flatMap((q, i) => criteresQuestion(e, q, LETTRES[2 * i + 1]!));
  const types = new Set(e.questions.map((q) => q.type));
  const erreurs: ErreurFrequente[] = [];
  if (types.has("image") || types.has("antecedent")) erreurs.push({ description: [texte("Confondre image et antécédent (réponse lue sur le mauvais axe)")], cout: "0 pt sur la question" });
  erreurs.push({ description: [texte("Réponse sans unité")], cout: "−0,5" });
  if (types.has("inequation")) erreurs.push({ description: [texte("Crochet fermé pour « plus de » / « moins de », ou ouvert pour « au moins » / « au plus »")], cout: "−0,5" });
  const ante = e.questions.find((q) => q.type === "antecedent");
  if (ante && ante.type === "antecedent" && ante.solutions.length > 1) erreurs.push({ description: [texte("Oublier un antécédent")], cout: "−0,5" });
  if (types.has("extremum")) erreurs.push({ description: [texte("Donner seulement la valeur de l'extremum, ou seulement le moment")], cout: "−0,5" });
  if (types.has("variation"))
    erreurs.push(
      aDesPaliers(e)
        ? { description: [texte("Inclure un palier dans un intervalle de croissance ou de décroissance")], cout: "−0,5" }
        : { description: [texte("Écrire des valeurs de la grandeur (axe vertical) comme bornes des intervalles")], cout: "0 pt sur la question" },
    );
  if (types.has("tendance")) erreurs.push({ description: [texte("Donner la dernière valeur lue au lieu de la valeur limite")], cout: "0 pt sur la question" });
  return {
    reponseFinale: reponseBreveGraphiqueContexte(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Réponses rédigées en phrase (ex. « il faisait 14 °C à 10 h »)")],
      [texte("Antécédents donnés dans n'importe quel ordre")],
      ...(types.has("variation") ? [[texte("Intervalles de croissance ou de décroissance écrits avec des crochets ouverts")]] : []),
    ],
  };
}

/** ★★ par défaut ; ★★★ dès deux difficultés de lecture : inéquation à plusieurs intervalles ou à
 * niveau exclu, 3 antécédents ou plus, paliers à écarter, asymptote à reconnaître. */
function difficulteGraphiqueContexte(e: ExerciceGraphiqueContexte): 1 | 2 | 3 {
  let pieges = 0;
  for (const q of e.questions) {
    if (q.type === "inequation" && (q.solution.length > 1 || q.comparateur === ">" || q.comparateur === "<")) pieges++;
    if (q.type === "antecedent" && q.solutions.length >= 3) pieges++;
    if (q.type === "variation" && aDesPaliers(e)) pieges++;
    if (q.type === "tendance") pieges++;
  }
  return pieges >= 2 ? 3 : 2;
}

export const adaptateurEvaluationGraphiqueContexte: AdaptateurFeuilleExercices<ExerciceGraphiqueContexte> = {
  titreDocument: "Lire un graphique en contexte — Évaluation",
  nomFichierBase: "graphique-contexte",
  genererInstance: genererExerciceGraphiqueContexte,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id as IdContexteGraphique),
  construireEnonce: construireEnonceGraphiqueContexte,
  construireCorrection: construireCorrectionGraphiqueContexte,
  difficulte: difficulteGraphiqueContexte,
  reponseBreve: reponseBreveGraphiqueContexte,
  correctionDetaillee: correctionDetailleeGraphiqueContexte,
  bareme: baremeGraphiqueContexte,
  enoncePapier: enoncePapierGraphiqueContexte,
  dureeMinutes: 10,
  profilInstance: profilGraphiqueContexte,
};
