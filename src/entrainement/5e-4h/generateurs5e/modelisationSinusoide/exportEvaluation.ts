import type { ExerciceModelisationSinusoide, QuestionPhase2, TechniquePhase1 } from "../../core5e/modelisationSinusoide.types";
import type { PhaseModelisationSinusoide } from "../../moteur5e/typesModelisationSinusoide";
import { ordreComplet } from "../../moteur5e/typesModelisationSinusoide";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  QuestionExercice,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { LIBELLE_PHASE, consignePhase, formatTermesDonneesConstructionLatex, formatTermesReponseAttendueModelisationSinusoide, nombreLatex, texteAideNiveau2 } from "../../ui5e/formatModelisationSinusoide";
import { CATALOGUE_TECHNIQUES, construireAvecTechnique, genererExerciceModelisationSinusoide } from "./index";
import { profilModelisationSinusoide, LIBELLE_CAS_MODELISATION } from "../profilsEvaluationTrigonometrie";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceModelisationSinusoide>` pour 5gen13 (Modéliser une
 * fonction sinusoïdale en contexte) — feuille d'exercices et évaluation (méthode : `.claude/rules/
 * feuilles-evaluations.md`). Les 4 techniques de construction (grande roue, max/min + extremum,
 * deux points, fonction donnée) et les 3 questions de seconde partie (équation, extremums,
 * inéquation) sont couvertes, tirées comme dans l'appli (`genererExerciceModelisationSinusoide`).
 *
 * - `construireEnonce` : une question PAR ÉCRAN réellement traversé (`ordreComplet`) — les étapes
 *   d'apprentissage, reprises en titres du corrigé.
 * - `enoncePapier` : un vrai problème — énoncé et données, puis au plus deux VRAIES questions :
 *   a) construire le modèle, b) l'exploiter (équation, extremums ou inéquation sur une fenêtre).
 * Toutes les valeurs viennent de l'instance, avec les fonctions de l'écran interactif
 * (`formatTermesReponseAttendueModelisationSinusoide`, `texteAideNiveau2`).
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

const PHASES_CONSTRUCTION = new Set<PhaseModelisationSinusoide>(["amplitude", "decalage", "pulsation", "phi", "systeme", "resolution", "fonctionFinale"]);

function estConstruction(phase: PhaseModelisationSinusoide): boolean {
  return PHASES_CONSTRUCTION.has(phase);
}

/** Les consignes d'écran portent des précisions de saisie (« arrondi au centième accepté si
 * besoin », « utilise « k » comme entier libre », « écris « phi » ») : inutiles en titre d'étape
 * du corrigé. */
function consigneEtape(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): string {
  return consignePhase(exercice, phase)
    .replace(/\s*\(utilise « k » comme entier libre, arrondi au centième accepté si besoin\)/g, " (k entier)")
    .replace(/\s*\(utilise « k » comme entier libre\)/g, " (k entier)")
    .replace(/\s*\(arrondi au centième accepté si besoin\)/g, "")
    .replace(/ ; arrondi au centième accepté si besoin\)/g, ")")
    .replace(/\s*\(écris « phi »\)/g, "")
    .replace("Écris f(t) = A·sin(ωt+φ)+b en remplaçant", "Écris f(t) en remplaçant");
}

function construireEnonceModelisationSinusoide(exercice: ExerciceModelisationSinusoide): SectionExercice {
  return {
    enteteFragments: enteteFragments(exercice),
    questions: ordreComplet(exercice).map((phase): QuestionExercice => ({ consigne: [texte(consigneEtape(exercice, phase))] })),
  };
}

// ============================================================================
// Énoncé papier : énoncé + données, a) construire le modèle, b) l'exploiter.
// ============================================================================

const MODELE = "f(t)=A\\sin(\\omega t+\\varphi)+b";

function introduction(technique: TechniquePhase1): FragmentConsigne[] {
  switch (technique) {
    case "b1":
      return [
        texte("Une nacelle tourne sur une grande roue de rayon R ; le point le plus bas de la roue est à hₛₒₗ du sol, et la roue fait un tour complet en T secondes. On modélise la hauteur de la nacelle (en m) en fonction du temps t (en s) par "),
        latex(MODELE),
        texte(", avec "),
        latex("A>0"),
        texte(" et "),
        latex("\\omega>0"),
        texte("."),
      ];
    case "b2":
      return [
        texte("Une grandeur varie selon le modèle "),
        latex(MODELE),
        texte(", avec "),
        latex("A>0"),
        texte(" et "),
        latex("\\omega>0"),
        texte(". On connaît son maximum, son minimum, sa période T et un instant t₀ où elle atteint un extremum."),
      ];
    case "b3":
      return [
        texte("Une grandeur suit le modèle "),
        latex(MODELE),
        texte(", avec "),
        latex("\\omega>0"),
        texte(" ; A et b sont connus. On connaît deux points de la courbe, situés sur une même montée : en chacun d'eux, l'argument ωt + φ est compris entre −π/2 et π/2."),
      ];
    case "donnee":
      return [];
  }
}

function enteteFragments(exercice: ExerciceModelisationSinusoide): FragmentConsigne[] {
  const donnees = formatTermesDonneesConstructionLatex(exercice);
  if (exercice.phase1.technique === "donnee") return [texte("On considère la fonction "), latex(donnees.join(",\\quad ")), texte(", avec t ≥ 0.")];
  return [...introduction(exercice.phase1.technique), texte(" Données : "), latex(donnees.join(",\\quad ")), texte(".")];
}

function questionConstruction(technique: TechniquePhase1): FragmentConsigne[] {
  switch (technique) {
    case "b1":
      return [texte("Détermine A, b et ω (valeur exacte), puis écris f(t). Si les données ne permettent pas de calculer φ, laisse-le sous forme littérale.")];
    case "b2":
      return [texte("Détermine A, b, ω et φ (valeurs exactes), puis écris f(t).")];
    case "b3":
      return [texte("Détermine ω et φ (garde au moins 4 décimales), puis écris f(t).")];
    case "donnee":
      return [];
  }
}

function fenetreLatex(q: QuestionPhase2): string {
  return `t\\in[0\\,;\\,${nombreLatex(q.fenetre, 2)}]`;
}

function questionExploitation(q: QuestionPhase2): FragmentConsigne[] {
  switch (q.type) {
    case "resoudre":
      return [texte("Résous l'équation "), latex(`f(t)=${nombreLatex(q.k, 2)}`), texte(" pour "), latex(fenetreLatex(q)), texte(" (solutions arrondies au centième).")];
    case "extremum":
      return [texte("Détermine les instants "), latex(fenetreLatex(q)), texte(" où f atteint un maximum ou un minimum (arrondis au centième).")];
    case "inequation":
      return [
        texte("Résous l'inéquation "),
        latex(`f(t)${q.sens === "ge" ? "\\geqslant" : "\\leqslant"}${nombreLatex(q.k, 2)}`),
        texte(" pour "),
        latex(fenetreLatex(q)),
        texte(" (bornes arrondies au centième)."),
      ];
  }
}

function lettresDes(exercice: ExerciceModelisationSinusoide, filtre: (p: PhaseModelisationSinusoide) => boolean): string[] {
  return ordreComplet(exercice)
    .map((p, i) => (filtre(p) ? LETTRES[i] : null))
    .filter((l): l is string => l !== null);
}

function enoncePapierModelisationSinusoide(exercice: ExerciceModelisationSinusoide): EnoncePapier {
  const questions: QuestionExercice[] = [];
  const etapesParQuestion: string[][] = [];
  const construction = questionConstruction(exercice.phase1.technique);
  if (construction.length > 0) {
    questions.push({ consigne: construction });
    etapesParQuestion.push(lettresDes(exercice, estConstruction));
  }
  if (exercice.phase2 !== null) {
    questions.push({ consigne: questionExploitation(exercice.phase2) });
    etapesParQuestion.push(lettresDes(exercice, (p) => !estConstruction(p)));
  }
  return { section: { enteteFragments: enteteFragments(exercice), questions }, etapesParQuestion, reponseBreve: reponseBreveModelisationSinusoide(exercice) };
}

// ============================================================================
// Réponse brève, corrigé détaillé, barème.
// ============================================================================

function joindre(termes: string[], separateur = " ; "): FragmentConsigne[] {
  return termes.flatMap((t, i) => (i === 0 ? [latex(t)] : [texte(separateur), latex(t)]));
}

function reponseExploitation(q: QuestionPhase2): FragmentConsigne[] {
  switch (q.type) {
    case "resoudre":
      return q.aucuneSolution || q.solutions.length === 0 ? [texte("aucune solution")] : joindre(q.solutions.map((s) => `t\\approx ${nombreLatex(s, 2)}`));
    case "extremum":
      return joindre(q.solutions.map((s) => `t\\approx ${nombreLatex(s, 2)}`));
    case "inequation":
      if (q.casSpecial === "toujoursVrai") return [texte("toujours vraie : "), latex(fenetreLatex(q))];
      if (q.casSpecial === "toujoursFaux") return [texte("aucune solution")];
      return joindre(q.intervalles.map((iv) => `[${nombreLatex(iv.inf, 2)}\\,;\\,${nombreLatex(iv.sup, 2)}]`), " ∪ ");
  }
}

/** Réponse de la construction : f(t) ; pour B2, précédée de ω et φ en valeur exacte (demandées
 * exactes, alors que f(t) les écrit en décimal). */
function reponseConstruction(exercice: ExerciceModelisationSinusoide): FragmentConsigne[] {
  if (exercice.phase1.technique === "donnee") return [];
  const exacts = exercice.phase1.technique === "b2" ? [...formatTermesReponseAttendueModelisationSinusoide(exercice, "pulsation"), ...formatTermesReponseAttendueModelisationSinusoide(exercice, "phi")] : [];
  return joindre([...exacts, ...formatTermesReponseAttendueModelisationSinusoide(exercice, "fonctionFinale")]);
}

function reponseBreveModelisationSinusoide(exercice: ExerciceModelisationSinusoide): FragmentConsigne[] {
  const construction = reponseConstruction(exercice);
  if (exercice.phase2 === null) return construction;
  const exploitation = reponseExploitation(exercice.phase2);
  if (construction.length === 0) return exploitation;
  return [texte("a) "), ...construction, texte(" ; b) "), ...exploitation];
}

function methode(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): FragmentConsigne[] {
  const d = exercice.phase1;
  const q = exercice.phase2;
  switch (phase) {
    case "amplitude":
      return d.technique === "b1"
        ? [texte("L'amplitude est le rayon de la roue : "), latex("A=R")]
        : [texte("La moitié de l'écart entre maximum et minimum : "), latex("A=\\dfrac{\\max-\\min}{2}")];
    case "decalage":
      return d.technique === "b1"
        ? [texte("La hauteur de l'axe de la roue : "), latex("b=R+h_{sol}")]
        : [texte("La position d'équilibre, à mi-hauteur : "), latex("b=\\dfrac{\\max+\\min}{2}")];
    case "pulsation":
      return [texte("Une période complète correspond à un tour : "), latex("\\omega=\\dfrac{2\\pi}{T}")];
    case "phi": {
      const max = d.technique === "b2" && d.estMax;
      return [texte(`En t₀, f atteint son ${max ? "maximum" : "minimum"} : l'argument du sinus vaut `), latex(max ? "\\dfrac{\\pi}{2}" : "\\dfrac{3\\pi}{2}"), texte(", d'où "), latex(`\\omega t_0+\\varphi=${max ? "\\dfrac{\\pi}{2}" : "\\dfrac{3\\pi}{2}"}`), texte(".")];
    }
    case "systeme":
      return [texte("En chaque point, on isole le sinus puis on prend l'arcsin (argument entre −π/2 et π/2) : "), latex("\\omega t_i+\\varphi=\\arcsin\\!\\left(\\dfrac{f_i-b}{A}\\right)")];
    case "resolution":
      return [texte("On soustrait les deux équations pour éliminer φ, puis on les additionne pour trouver φ.")];
    case "fonctionFinale":
      return d.technique === "b1" ? [texte("Aucune donnée ne fixe φ : il reste sous forme littérale.")] : [texte("On remplace A, ω, φ et b dans le modèle.")];
    case "argumentResoudre":
      if (q !== null && q.type === "resoudre" && q.aucuneSolution) return [texte("On pose u = ωt + φ et "), latex("m=\\dfrac{y_0-b}{A}"), texte(" : ici |m| > 1, et un sinus reste entre −1 et 1.")];
      return [texte("On pose u = ωt + φ et "), latex("m=\\dfrac{y_0-b}{A}"), texte(" : "), latex("\\sin u=m\\iff u=\\arcsin m+2k\\pi\\ \\text{ou}\\ u=\\pi-\\arcsin m+2k\\pi")];
    case "isolerTResoudre":
    case "isolerTExtremum":
    case "isolerTInequation":
      return [texte("On isole t : "), latex("t=\\dfrac{u-\\varphi}{\\omega}"), texte(" — on divise chaque terme (constante et période) par ω.")];
    case "solutionsResoudre":
    case "solutionsExtremum":
      return [texte("On donne à k les valeurs entières qui placent t dans la fenêtre.")];
    case "poserExtremum":
      return [texte("Un maximum ou un minimum correspond à "), latex("\\sin u=\\pm1\\iff u=\\dfrac{\\pi}{2}+k\\pi"), texte(" (une seule série, de période π).")];
    case "isolerSinInequation":
      return [texte("On isole le sinus : "), latex(q !== null && q.type === "inequation" && q.sens === "le" ? "\\sin u\\leqslant m" : "\\sin u\\geqslant m"), texte(" avec "), latex("m=\\dfrac{y_0-b}{A}"), texte(" ; si |m| > 1, l'inéquation est toujours vraie ou toujours fausse.")];
    case "resoudreUInequation":
      return q !== null && q.type === "inequation" && q.sens === "le"
        ? [latex("\\sin u\\leqslant m\\iff u\\in[\\pi-\\arcsin m\\,;\\,2\\pi+\\arcsin m]+2k\\pi")]
        : [latex("\\sin u\\geqslant m\\iff u\\in[\\arcsin m\\,;\\,\\pi-\\arcsin m]+2k\\pi")];
    case "listerIntervallesInequation":
      return [texte("Les bornes se répètent tous les "), latex("\\dfrac{2\\pi}{\\omega}"), texte(" ; on garde les morceaux contenus dans la fenêtre.")];
  }
}

/** Calcul substitué (aide de niveau 2 de l'écran), seulement là où il apporte une valeur de
 * l'instance — pas pour les formules générales déjà données en méthode. */
const PHASES_AVEC_CALCUL = new Set<PhaseModelisationSinusoide>(["amplitude", "decalage", "pulsation", "phi", "systeme", "argumentResoudre", "isolerSinInequation"]);

function piege(exercice: ExerciceModelisationSinusoide, phase: PhaseModelisationSinusoide): string | null {
  const d = exercice.phase1;
  if (phase === "fonctionFinale" && d.technique === "b1") return "N'invente pas de valeur pour φ : rien dans l'énoncé ne fixe la position de la nacelle à t = 0.";
  if (phase === "phi" && d.technique === "b2" && !d.estMax) return "Au minimum, l'argument vaut 3π/2, pas π/2.";
  if (phase === "poserExtremum") return "Maximums ET minimums : la série a une période π, pas 2π.";
  if (phase === "argumentResoudre" && exercice.phase2 !== null && exercice.phase2.type === "resoudre" && !exercice.phase2.aucuneSolution) return "Deux séries de solutions : n'oublie pas u = π − arcsin m + 2kπ.";
  if (phase === "resoudreUInequation") return "Choisis le bon arc du cercle : pour ≥, celui qui contient π/2 ; pour ≤, l'arc complémentaire.";
  return null;
}

function correctionDetailleeModelisationSinusoide(exercice: ExerciceModelisationSinusoide): EtapeCorrection[] {
  return ordreComplet(exercice).flatMap((phase, i) => {
    const sousQuestion = LETTRES[i];
    const etapes: EtapeCorrection[] = [{ label: "Méthode", sousQuestion, fragments: methode(exercice, phase) }];
    const calcul = PHASES_AVEC_CALCUL.has(phase) ? texteAideNiveau2(exercice, phase) : "";
    if (calcul) etapes.push({ label: "Calcul", sousQuestion, fragments: [latex(calcul)] });
    const reponse = formatTermesReponseAttendueModelisationSinusoide(exercice, phase);
    if (reponse.length > 0) etapes.push({ label: "Conclusion", sousQuestion, fragments: joindre(reponse) });
    const p = piege(exercice, phase);
    if (p !== null) etapes.push({ label: "Piège", sousQuestion, fragments: [texte(p)] });
    return etapes;
  });
}

function baremeModelisationSinusoide(exercice: ExerciceModelisationSinusoide): BaremeExercice {
  // Un poids égal par étape (au plus 8 étapes : aucune ne tombe à 0 point une fois le total
  // ramené au demi-point) — chaque question pèse ainsi son nombre d'étapes.
  const criteres = ordreComplet(exercice).map((phase, i) => ({
    sousQuestion: LETTRES[i],
    critere: [texte(`${LIBELLE_PHASE[phase]} : `), ...joindre(formatTermesReponseAttendueModelisationSinusoide(exercice, phase))],
    points: 1,
  }));

  const d = exercice.phase1;
  const q = exercice.phase2;
  const erreurs: ErreurFrequente[] = [];
  if (d.technique === "b1") erreurs.push({ description: [texte("Valeur numérique inventée pour φ")], cout: "0 pt sur l'étape" });
  if (d.technique === "b1" || d.technique === "b2") erreurs.push({ description: [texte("ω = 2πT ou ω = T/(2π) au lieu de 2π/T")], cout: "0 pt sur l'étape, suite notée sans double pénalité" });
  if (d.technique === "b2" && !d.estMax) erreurs.push({ description: [texte("Argument π/2 utilisé pour un minimum (au lieu de 3π/2)")], cout: "0 pt sur l'étape" });
  if (d.technique === "b3") erreurs.push({ description: [texte("Calculatrice en degrés pour arcsin")], cout: "0 pt sur l'étape" });
  if (q !== null && q.type === "resoudre" && !q.aucuneSolution) erreurs.push({ description: [texte("Une seule des deux séries de solutions")], cout: "moitié des points de la question b)" });
  if (q !== null && q.type === "extremum") erreurs.push({ description: [texte("Seulement les maximums, ou période 2π au lieu de π")], cout: "moitié des points de la question b)" });
  if (q !== null && q.type === "inequation" && q.casSpecial === null) erreurs.push({ description: [texte("Arc complémentaire choisi (sens de l'inégalité inversé)")], cout: "0 pt sur l'étape" });

  const acceptees: FragmentConsigne[][] = [[texte("Valeurs qui diffèrent de quelques centièmes quand ω et φ ont été arrondis en cours de calcul")]];
  if (d.technique === "b2") acceptees.push([texte("φ à un multiple de 2π près")]);
  if (q !== null && q.type === "inequation") acceptees.push([texte("Bornes de l'intervalle en u écrites à 2π près (par exemple "), latex("[-\\pi-\\arcsin m\\,;\\,\\arcsin m]"), texte(")")]);

  const reponse = reponseBreveModelisationSinusoide(exercice);
  return { reponseFinale: reponse, criteres, erreursFrequentes: erreurs, reponsesAcceptees: acceptees };
}

function difficulteModelisationSinusoide(exercice: ExerciceModelisationSinusoide): 1 | 2 | 3 {
  const { technique } = exercice.phase1;
  const q = exercice.phase2;
  if (technique === "b3" && q !== null) return 3;
  if (technique === "b2") return 3;
  if (q !== null && q.type !== "extremum") return 3;
  return 2;
}

function construireCorrectionModelisationSinusoide(exercice: ExerciceModelisationSinusoide): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreveModelisationSinusoide(exercice) }];
}

export const adaptateurEvaluationModelisationSinusoide: AdaptateurFeuilleExercices<ExerciceModelisationSinusoide> = {
  // Toutes les instances exigent une calculatrice (valeurs décimales) : avertissement du panneau.
  calculatriceIndispensable: true,
  profilInstance: profilModelisationSinusoide,
  libelleCasParticulier: LIBELLE_CAS_MODELISATION,
  titreDocument: "Modéliser une fonction sinusoïdale en contexte — Évaluation",
  nomFichierBase: "modelisation-sinusoide",
  genererInstance: genererExerciceModelisationSinusoide,
  catalogueVariantes: CATALOGUE_TECHNIQUES,
  genererInstanceAvecVariante: (id) => construireAvecTechnique(id as TechniquePhase1),
  construireEnonce: construireEnonceModelisationSinusoide,
  construireCorrection: construireCorrectionModelisationSinusoide,
  difficulte: difficulteModelisationSinusoide,
  reponseBreve: reponseBreveModelisationSinusoide,
  correctionDetaillee: correctionDetailleeModelisationSinusoide,
  bareme: baremeModelisationSinusoide,
  enoncePapier: enoncePapierModelisationSinusoide,
  dureeMinutes: 12,
};
