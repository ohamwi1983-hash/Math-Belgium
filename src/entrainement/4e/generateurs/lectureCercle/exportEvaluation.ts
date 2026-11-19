import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/corrigeTableau";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceLectureCercle } from "../../core/lectureCercle.types";
import { position, tanDefinie } from "../../moteur/modeleLectureCercle";
import { consignesEcrans, enonceFragments, figureEnonceSvg, intervalleLatex, reponsesEcrans } from "../../ui/formatLectureCercle";
import { souderPonctuation } from "../../ui/formatDetectiveVecteurs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceLectureCercle } from "./index";
import { LIBELLE_CAS_LECTURE_CERCLE, profilLectureCercle } from "./profil";
import { correctionDetailleeLectureCercle } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen122 « Lire sur le cercle trigonométrique ».
 * Énoncé papier = la figure (cercle dans le quadrillage remarquable, tangente x = 1 graduée, M ;
 * ni (OM) ni T) + UNE consigne globale (lire cos θ et sin θ, en déduire θ, lire tan θ) — les trois
 * écrans deviennent les étapes a, b, c du corrigé (figure avec (OM) et T en c). Les valeurs à lire
 * tombent toutes sur des lignes de la grille (M) ou sur des graduations de la tangente (T).
 */

function figureHtml(e: ExerciceLectureCercle): string {
  return `<div class="paragraphe" style="text-align:center">${figureEnonceSvg(e)}</div>`;
}

function construireEnonce(e: ExerciceLectureCercle): SectionExercice {
  return { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function consignePapier(e: ExerciceLectureCercle): FragmentConsigne[] {
  return souderPonctuation([
    texte("Lis sur la figure les valeurs exactes de "),
    latex("\\cos\\theta"),
    texte(" et de "),
    latex("\\sin\\theta"),
    texte(", déduis-en l'angle "),
    latex("\\theta"),
    texte(e.variante === "degres" ? " en degrés, dans " : " en radians, dans "),
    latex(intervalleLatex(e)),
    texte(", puis lis "),
    latex("\\tan\\theta"),
    texte(" sur la tangente "),
    latex("x=1"),
    texte(" (ou justifie qu'elle n'est pas définie)."),
  ]);
}

function enoncePapier(e: ExerciceLectureCercle): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), enteteHtml: figureHtml(e), questions: [{ consigne: consignePapier(e) }] },
    etapesParQuestion: [["a", "b", "c"]],
  };
}

/** Résultat seul, dans l'ordre de la consigne (sans lettres : l'énoncé papier n'en a pas). */
function reponseBreve(e: ExerciceLectureCercle): FragmentConsigne[] {
  const [a, b, c] = reponsesEcrans(e);
  return souderPonctuation([...a!, texte(" ; "), ...b!, texte(" ; "), ...c!]);
}

/** Niveau : a) et c) sont des écrans de pure lecture (coordonnées, ordonnée de T ou verdict lu sur la
 * figure) ; b) transforme (deux candidats, choix par le quadrant). Méthode imposée. Piège dans les
 * DONNÉES : un signe à trouver (M hors du quadrant I) ou une tangente non définie. Nombres exacts. */
function criteresDifficulte(e: ExerciceLectureCercle): CriteresDifficulte {
  const piege = position(e) !== "I" || !tanDefinie(e) ? 1 : 0;
  return { ...etapesDuCorrige(correctionDetailleeLectureCercle(e), ["a", "c"]), methode: 0, piege, nombres: 0 };
}

function construireCorrection(e: ExerciceLectureCercle): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceLectureCercle): BaremeExercice {
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [latex("\\cos\\theta"), texte(" et "), latex("\\sin\\theta"), texte(" lus, signes compris")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Angle "), latex("\\theta"), texte(" dans l'intervalle demandé (bon candidat, bonne unité)")], points: 1 },
      { sousQuestion: "c", critere: [latex("\\tan\\theta"), texte(" lue sur la tangente (ou « n'est pas définie », justifié)")], points: 1.5 },
    ],
    erreursFrequentes: [
      { description: [latex("\\cos\\theta"), texte(" et "), latex("\\sin\\theta"), texte(" échangés")], cout: "moitié des points de a)" },
      { description: [texte("Signe oublié (graduation lue sur le demi-axe positif)")], cout: "moitié des points de a)" },
      { description: [texte("Angle du premier quadrant, ou autre angle de même cosinus")], cout: "0 pt sur b)" },
      { description: [latex("\\tan\\theta"), texte(" lue sur l'axe vertical (c'est "), latex("\\sin\\theta"), texte(") ou signe de T faux")], cout: "0 pt sur c)" },
    ],
    reponsesAcceptees: [
      [texte("Toute écriture exacte équivalente : "), latex("\\dfrac{1}{\\sqrt{3}}"), texte(" pour "), latex("\\dfrac{\\sqrt{3}}{3}"), texte(", "), latex("\\dfrac{1}{\\sqrt{2}}"), texte(" pour "), latex("\\dfrac{\\sqrt{2}}{2}"), texte(", "), latex("0{,}5"), texte(" pour "), latex("\\dfrac{1}{2}"), texte(".")],
    ],
  };
}

export const adaptateurEvaluationLectureCercle: AdaptateurFeuilleExercices<ExerciceLectureCercle> = {
  profilInstance: profilLectureCercle,
  libelleCasParticulier: LIBELLE_CAS_LECTURE_CERCLE,
  titreDocument: "Lire sur le cercle trigonométrique — Évaluation",
  nomFichierBase: "lire-cercle-trigonometrique",
  genererInstance: genererExerciceLectureCercle,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeLectureCercle,
  bareme,
  enoncePapier,
};
