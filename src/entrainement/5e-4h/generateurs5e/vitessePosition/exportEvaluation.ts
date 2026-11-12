import type { ExerciceVitessePosition } from "../../core5e/vitessePosition.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneEcranRiche, formatReponseAttenduePhaseLatex, phraseEnonce, texteAideNiveau1 } from "../../ui5e/formatVitessePosition";
import type { EcranVitessePosition } from "../../moteur5e/typesVitessePosition";
import { ordreEcransVitessePosition } from "../../moteur5e/typesVitessePosition";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVitessePosition, valeurVitesseExacte } from "./index";
import { PARAMETRES_VITESSE_POSITION, profilVitessePosition } from "../profilsEvaluationDerivees34-35";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceVitessePosition>` pour 5gen35 (« Vitesse et
 * position ») — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = le récit (s(t), distances — la distance TOTALE est dite explicitement en
 * variante B) et les VRAIES questions du problème :
 * - A : a) accélération ; b) temps pour parcourir D (avec justification du rejet) ; c) vitesse
 *   atteinte, en m/s puis en km/h.
 * - B : a) accélération ; b) temps pour atteindre D₁ (justification) ; c) vitesse atteinte à ce
 *   repère ; d) durée du parcours complet (second segment à vitesse constante).
 * Les écrans du générateur (`ordreEcransVitessePosition` : dérivée, accélération, résolution, rejet,
 * vitesse atteinte, conversion — ou second segment et temps total en B) deviennent les étapes du
 * corrigé (« Étape n — consigne »), chaque question papier couvrant ses étapes (`etapesParQuestion`).
 *
 * Valeurs : `formatReponseAttenduePhaseLatex`, `consigneEcranRiche`, `texteAideNiveau1` (écran) et
 * les champs de l'instance (`tCible`, `racineRejetee`, `D2`…) — jamais recalculées autrement.
 *
 * `regroupable` : non — plusieurs questions par instance, consignes dépendantes des valeurs tirées.
 */

const LETTRES = "abcdefgh";

function fragmentsRiches(source: string): FragmentConsigne[] {
  return source
    .split("$")
    .map((morceau, i) => (i % 2 === 1 ? latex(morceau) : texte(morceau.replace(/ \?/g, "\u00a0?"))))
    .filter((f) => f.valeur !== "");
}

function lettreDe(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string {
  return LETTRES[ordreEcransVitessePosition(exercice).indexOf(ecran)];
}

/** « du sprinteur », « de la cycliste », « du tram ». */
function deSujet(sujet: string): string {
  if (sujet.startsWith("le ")) return `du ${sujet.slice(3)}`;
  if (sujet.startsWith("les ")) return `des ${sujet.slice(4)}`;
  return `de ${sujet}`;
}

/** Consigne d'étape = celle de l'écran, sans ses tournures propres à la saisie. */
function consigneEtape(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): FragmentConsigne[] {
  const brute = consigneEcranRiche(exercice, ecran)
    .replace(/ Une seule tentative\.$/, "");
  return fragmentsRiches(brute);
}

function entete(exercice: ExerciceVitessePosition): FragmentConsigne[] {
  return fragmentsRiches(phraseEnonce(exercice));
}

function construireEnonceVitessePosition(exercice: ExerciceVitessePosition): SectionExercice {
  return { enteteFragments: entete(exercice), questions: ordreEcransVitessePosition(exercice).map((ecran) => ({ consigne: consigneEtape(exercice, ecran) })) };
}

function questionsPapier(exercice: ExerciceVitessePosition): { questions: QuestionExercice[]; etapes: string[][] } {
  const l = (ecran: EcranVitessePosition) => lettreDe(exercice, ecran);
  const acceleration: QuestionExercice = { consigne: [texte(`Détermine l'accélération ${deSujet(exercice.contexte.sujet)} pendant la phase d'accélération, en m/s².`)] };
  const temps = (distance: number): QuestionExercice => ({
    consigne: [texte(`Au bout de combien de secondes la distance parcourue atteint-elle ${distance} m ? Justifie le choix de la solution retenue.`)],
  });
  if (exercice.variante === "A") {
    return {
      questions: [acceleration, temps(exercice.D), { consigne: [texte("Quelle est la vitesse atteinte à cet instant, en m/s puis en km/h ?")] }],
      etapes: [
        [l("derivee"), l("acceleration")],
        [l("resoudre"), l("rejet")],
        [l("vitessePointe"), l("conversion")],
      ],
    };
  }
  return {
    questions: [
      acceleration,
      temps(exercice.distanceCible),
      { consigne: [texte("Quelle est la vitesse atteinte à cet instant, en m/s ?")] },
      { consigne: [texte(`Combien de temps dure le parcours complet de ${exercice.D} m ? Arrondis au dixième de seconde.`)] },
    ],
    etapes: [[l("derivee"), l("acceleration")], [l("resoudre"), l("rejet")], [l("vitessePointe")], [l("segmentConstant"), l("tempsTotal")]],
  };
}

function enoncePapierVitessePosition(exercice: ExerciceVitessePosition): EnoncePapier {
  const { questions, etapes } = questionsPapier(exercice);
  return { section: { enteteFragments: entete(exercice), questions }, etapesParQuestion: etapes, reponseBreve: reponseBreveVitessePosition(exercice) };
}

function reponse(exercice: ExerciceVitessePosition, ecran: EcranVitessePosition): string {
  return formatReponseAttenduePhaseLatex(exercice, ecran)[0];
}

function reponseBreveVitessePosition(exercice: ExerciceVitessePosition): FragmentConsigne[] {
  const debut: FragmentConsigne[] = [
    texte("a) "),
    latex(`a=${exercice.a}\\text{ m/s}^2`),
    texte(" ; b) "),
    latex(`t=${exercice.tCible}\\text{ s}`),
    texte(" ; c) "),
    latex(reponse(exercice, "vitessePointe")),
  ];
  if (exercice.variante === "A") return [...debut, texte(", soit "), latex(reponse(exercice, "conversion"))];
  return [...debut, texte(" ; d) "), latex(reponse(exercice, "tempsTotal"))];
}

/** Équation s(t) = d ramenée à la forme t² + Bt + C = 0 (coefficients entiers), puis résolue. Les
 * deux solutions sont celles de l'instance (`tCible`, `racineRejetee`) : le discriminant affiché vaut
 * (tCible − racineRejetee)², le carré de leur écart (équation unitaire). */
function resolutionLatex(exercice: ExerciceVitessePosition): string {
  const d = exercice.distanceCible;
  const B = exercice.a === 2 ? exercice.b : 2 * exercice.b;
  const C = exercice.a === 2 ? -d : -2 * d;
  const terme = (k: number) => (k === 0 ? "" : k === 1 ? "+t" : `+${k}t`);
  const gauche = `${exercice.a === 2 ? "t^2" : "\\dfrac{1}{2}t^2"}${terme(exercice.b)}=${d}`;
  const solutions = `t=${exercice.tCible} \\text{ ou } t=${exercice.racineRejetee}`;
  if (B === 0) return exercice.a === 2 ? `${gauche} \\iff ${solutions}` : `${gauche} \\iff t^2=${-C} \\iff ${solutions}`;
  const forme = `t^2${terme(B)}-${-C}=0`;
  const delta = B * B - 4 * C;
  const racine = exercice.tCible - exercice.racineRejetee;
  return `${gauche} \\iff ${forme} ;\\ \\Delta=${B}^2+4\\cdot${-C}=${delta}=${racine}^2 ;\\ t=\\dfrac{-${B}\\pm${racine}}{2} \\text{, donc } ${solutions}`;
}

function aide(ecran: EcranVitessePosition): FragmentConsigne[] {
  const a = texteAideNiveau1(ecran);
  return [...fragmentsRiches(a.texte), ...(a.latex ? [texte(" "), latex(a.latex)] : [])];
}

function correctionDetailleeVitessePosition(exercice: ExerciceVitessePosition): EtapeCorrection[] {
  const l = (ecran: EcranVitessePosition) => lettreDe(exercice, ecran);
  const lignes: EtapeCorrection[] = [
    { label: "Méthode", sousQuestion: l("derivee"), fragments: aide("derivee") },
    { label: "Calcul", sousQuestion: l("derivee"), fragments: [latex(reponse(exercice, "derivee")), texte(" (en m/s).")] },
    { label: "Calcul", sousQuestion: l("acceleration"), fragments: [latex(reponse(exercice, "acceleration")), texte(".")] },
    { label: "Méthode", sousQuestion: l("resoudre"), fragments: aide("resoudre") },
    { label: "Calcul", sousQuestion: l("resoudre"), fragments: [latex(resolutionLatex(exercice)), texte(".")] },
    { label: "Justification", sousQuestion: l("rejet"), fragments: [latex(`t=${exercice.racineRejetee}<0`), texte(" : le temps est compté à partir du départ, donc cette solution n'a pas de sens ici. On retient "), latex(`t=${exercice.tCible}\\text{ s}`), texte(".")] },
    { label: "Calcul", sousQuestion: l("vitessePointe"), fragments: [latex(`v(${exercice.tCible})=${formatVitesse(exercice)}=${valeurVitesseExacte(exercice, exercice.tCible)}\\text{ m/s}`), texte(".")] },
    { label: "Piège", sousQuestion: l("vitessePointe"), fragments: [texte("Évaluer s au lieu de v, ou calculer une vitesse moyenne (distance ÷ durée) : la vitesse atteinte est la vitesse instantanée "), latex(`v(${exercice.tCible})`), texte(".")] },
  ];
  if (exercice.variante === "A") {
    lignes.push({ label: "Calcul", sousQuestion: l("conversion"), fragments: [latex(reponse(exercice, "conversion")), texte(" (1 m/s = 3,6 km/h).")] });
    return lignes;
  }
  lignes.push(
    { label: "Méthode", sousQuestion: l("segmentConstant"), fragments: aide("segmentConstant") },
    { label: "Calcul", sousQuestion: l("segmentConstant"), fragments: [latex(`D_2=${exercice.D}-${exercice.distanceCible}=${exercice.D2}\\text{ m}`), texte(" ; "), latex(reponse(exercice, "segmentConstant")), texte(".")] },
    { label: "Piège", sousQuestion: l("segmentConstant"), fragments: [texte("Utiliser encore "), latex("s(t)"), texte(" sur le second segment : la vitesse y est constante, le modèle du premier segment ne s'applique plus.")] },
    { label: "Calcul", sousQuestion: l("tempsTotal"), fragments: [latex(`t_{\\text{total}}=${exercice.tCible}+t_2`), texte(", donc "), latex(reponse(exercice, "tempsTotal")), texte(".")] },
  );
  return lignes;
}

/** a·t₀ + b substitué, ex. « 2\cdot6+2 ». */
function formatVitesse(exercice: ExerciceVitessePosition): string {
  const produit = exercice.a === 1 ? `${exercice.tCible}` : `${exercice.a}\\cdot${exercice.tCible}`;
  return exercice.b === 0 ? produit : `${produit}+${exercice.b}`;
}

function baremeVitessePosition(exercice: ExerciceVitessePosition): BaremeExercice {
  const l = (ecran: EcranVitessePosition) => lettreDe(exercice, ecran);
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const communs = [
    c(l("derivee"), "Vitesse v(t) = s′(t)", 0.5),
    c(l("acceleration"), "Accélération a(t) = v′(t), avec l'unité", 0.5),
  ];
  const criteres =
    exercice.variante === "A"
      ? [
          ...communs,
          c(l("resoudre"), "Équation du second degré posée et résolue (deux solutions)", 1.5),
          c(l("rejet"), "Rejet de la solution négative, justifié", 0.5),
          c(l("vitessePointe"), "Vitesse atteinte v(t) en m/s", 0.5),
          c(l("conversion"), "Conversion en km/h", 0.5),
        ]
      : [
          ...communs,
          c(l("resoudre"), "Équation du second degré posée et résolue (deux solutions)", 1),
          c(l("rejet"), "Rejet de la solution négative, justifié", 0.5),
          c(l("vitessePointe"), "Vitesse atteinte v(t) en m/s", 0.5),
          c(l("segmentConstant"), "Durée du second segment, à vitesse constante", 0.5),
          c(l("tempsTotal"), "Durée totale du parcours", 0.5),
        ];
  return {
    reponseFinale: reponseBreveVitessePosition(exercice),
    criteres,
    erreursFrequentes: [
      { description: [texte("Garder la solution négative, ou la rejeter sans justification")], cout: "0 pt sur la justification" },
      { description: [texte("Évaluer s au lieu de v à l'instant trouvé")], cout: "0 pt sur la vitesse" },
      ...(exercice.variante === "B" ? [{ description: [texte("Appliquer encore s(t) sur le second segment")], cout: "0 pt sur la durée du second segment" }] : []),
    ],
    reponsesAcceptees: exercice.variante === "B" ? [[texte("Durées arrondies au dixième de seconde")]] : [[texte("Vitesse en km/h écrite avec une virgule ou un point décimal")]],
  };
}

function difficulteVitessePosition(exercice: ExerciceVitessePosition): 1 | 2 | 3 {
  return exercice.variante === "B" ? 3 : 2;
}

/** Ancien corrigé (repli, documents Word) : les étapes du corrigé détaillé, en paragraphes. */
function construireCorrectionVitessePosition(exercice: ExerciceVitessePosition): BlocCorrection[] {
  return correctionDetailleeVitessePosition(exercice)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationVitessePosition: AdaptateurFeuilleExercices<ExerciceVitessePosition> = {
  titreDocument: "Vitesse et position — Évaluation",
  nomFichierBase: "vitesse-position",
  genererInstance: genererExerciceVitessePosition,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: (id) => construireAvecVarianteId(id),
  construireEnonce: construireEnonceVitessePosition,
  construireCorrection: construireCorrectionVitessePosition,
  difficulte: difficulteVitessePosition,
  reponseBreve: reponseBreveVitessePosition,
  correctionDetaillee: correctionDetailleeVitessePosition,
  bareme: baremeVitessePosition,
  enoncePapier: enoncePapierVitessePosition,
  dureeMinutes: 12,
  profilInstance: profilVitessePosition,
  parametresAuChoix: PARAMETRES_VITESSE_POSITION,
};
