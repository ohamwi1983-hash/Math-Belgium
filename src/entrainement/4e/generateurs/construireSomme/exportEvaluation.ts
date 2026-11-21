import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeConstruireSomme } from "./corrigeDetaille";
import type { ExerciceConstruireSomme } from "../../core/construireSomme.types";
import {
  VEC_U,
  VEC_V,
  coefficientsEffectifs,
  ecrans,
  moins,
  pointFinal,
  vecteurDemandeLatex,
} from "../../moteur/modeleConstruireSomme";
import {
  attenduConstructionLatex,
  colonneLatex,
  consigneGenerale,
  consignesEcrans,
  enonceGlobalPapier,
} from "../../ui/formatConstruireSomme";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceConstruireSomme } from "./index";
import { LIBELLE_CAS_CONSTRUIRE_SOMME, profilConstruireSomme } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen83. Énoncé papier = quadrillage avec les
 * données (vecteurs u et v, point O ; ou points A, B, C) + consigne globale (« Trace … à partir de
 * O », « Place le point M tel que … », « Donne les composantes … »). Les écrans d'apprentissage
 * (étape intermédiaire, résultat) deviennent les étapes du corrigé ; la construction attendue est
 * une FIGURE (`figureHtml`, même quadrillage que l'énoncé) — jamais dans l'énoncé. Séries
 * équilibrées : `profil.ts`.
 */

export { figureConstruireSomme } from "./figure";
import { figureConstruireSomme } from "./figure";

// ---------------------------------------------------------------------------------------------
// Énoncés
// ---------------------------------------------------------------------------------------------

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceConstruireSomme): SectionExercice {
  return {
    enteteFragments: consigneGenerale(e),
    enteteHtml: figureConstruireSomme(e, false),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceConstruireSomme): EnoncePapier {
  return {
    section: {
      enteteFragments: enonceGlobalPapier(e),
      enteteHtml: figureConstruireSomme(e, false),
      questions: [],
    },
  };
}

function reponseBreve(e: ExerciceConstruireSomme): FragmentConsigne[] {
  if (e.variante === "lecture") return [latex(`\\vec{u} = ${colonneLatex(e.u)}`), texte(" ; "), latex(`\\vec{v} = ${colonneLatex(e.v)}`)];
  const final = moins(pointFinal(e), e.O);
  if (e.variante === "point") return [texte("M s'obtient à partir de A : "), latex(`\\vec{AM} = ${colonneLatex(final)}`)];
  return [latex(`${vecteurDemandeLatex(e)} = ${colonneLatex(final)}`), texte(" (tracé à partir de O)")];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé
// ---------------------------------------------------------------------------------------------

const LETTRES = ["a", "b", "c", "d"];

function correctionDetaillee(e: ExerciceConstruireSomme): EtapeCorrection[] {
  return correctionDetailleeConstruireSomme(e);
}

/** Piège dans les DONNÉES : un coefficient effectif négatif (sens à inverser), la relation MA à
 * retourner, la différence à origine commune (sens de la flèche), une composante négative à lire. */
function piegeConstruireSomme(e: ExerciceConstruireSomme): 0 | 1 {
  if (e.variante === "lecture") return e.u.x < 0 || e.u.y < 0 || e.v.x < 0 || e.v.y < 0 ? 1 : 0;
  if (e.methode === "MA" || e.methode === "oppose" || e.methode === "origineCommune") return 1;
  const eff = coefficientsEffectifs(e);
  return eff.k < 0 || eff.l < 0 ? 1 : 0;
}

function criteresDifficulte(e: ExerciceConstruireSomme): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleeConstruireSomme(e), e.variante === "lecture" ? ["a"] : []), methode: 0, piege: piegeConstruireSomme(e), nombres: 0 };
}

function construireCorrection(e: ExerciceConstruireSomme): BlocCorrection[] {
  return [
    { type: "html", html: figureConstruireSomme(e, true) },
    { type: "paragraphe", fragments: reponseBreve(e) },
  ];
}

// ---------------------------------------------------------------------------------------------
// Barème
// ---------------------------------------------------------------------------------------------

function bareme(e: ExerciceConstruireSomme): BaremeExercice {
  const criteres: CritereBareme[] = [];
  const erreurs: ErreurFrequente[] = [];
  const liste = ecrans(e);
  if (e.variante === "lecture") {
    criteres.push({ sousQuestion: "a", critere: [texte("Composantes de "), latex(VEC_U), texte(" : "), latex(colonneLatex(e.u))], points: 2 });
    criteres.push({ sousQuestion: "a", critere: [texte("Composantes de "), latex(VEC_V), texte(" : "), latex(colonneLatex(e.v))], points: 2 });
    erreurs.push({ description: [texte("Signe oublié pour un déplacement vers la gauche ou vers le bas")], cout: "−0,5 par composante" });
    erreurs.push({ description: [texte("Composantes inversées (verticale en haut)")], cout: "−1 par vecteur" });
  } else {
    const poids = liste.length === 2 ? [2, 2] : [1, 1.5, 1.5];
    liste.forEach((ec, i) => {
      const lettre = LETTRES[i]!;
      if (ec.type === "choix") {
        criteres.push({ sousQuestion: lettre, critere: [texte("Relation retournée : "), latex(`\\vec{AM} = ${ec.options[ec.correct]!}`)], points: poids[i]! });
        return;
      }
      if (ec.type !== "construction") return;
      const dernier = i === liste.length - 1;
      criteres.push({
        sousQuestion: lettre,
        critere: dernier
          ? e.variante === "point"
            ? [texte("Point M placé exactement ("), latex(`\\vec{AM} = ${colonneLatex(moins(ec.attendu, e.O))}`), texte(")")]
            : [texte("Vecteur demandé tracé à partir de O, extrémité exacte ("), latex(attenduConstructionLatex(ec)), texte(")")]
          : [texte("Étape intermédiaire : "), latex(ec.vecteurLatex), texte(" tracé à partir de la bonne origine")],
        points: poids[i]!,
      });
    });
    if (e.methode === "triangle" || e.methode === "chaine") erreurs.push({ description: [texte("Vecteurs placés origine contre origine au lieu de bout à bout")], cout: "0 pt sur le résultat" });
    if (e.methode === "parallelogramme") erreurs.push({ description: [texte("Segment joignant les extrémités pris pour la somme (au lieu de la diagonale issue de O)")], cout: "0 pt sur le résultat" });
    if (e.variante === "difference") erreurs.push({ description: [texte("Sens de la différence inversé (flèche vers l'extrémité de v)")], cout: "moitié des points de l'étape" });
    const eff = coefficientsEffectifs(e);
    if (eff.k < 0 || eff.l < 0) erreurs.push({ description: [texte("Coefficient négatif tracé dans le sens du vecteur")], cout: "moitié des points de l'étape" });
    if (e.methode === "MA") erreurs.push({ description: [texte("Relation non retournée (M placé au symétrique par rapport à A)")], cout: "0 pt sur les étapes suivantes" });
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees:
      e.variante === "lecture" ? [[texte("Composantes écrites en ligne entre parenthèses, si l'ordre est juste")]] : [[texte("Autre méthode de construction (triangle ou parallélogramme), si l'extrémité obtenue est exacte")]],
  };
}

export const adaptateurEvaluationConstruireSomme: AdaptateurFeuilleExercices<ExerciceConstruireSomme> = {
  profilInstance: profilConstruireSomme,
  libelleCasParticulier: LIBELLE_CAS_CONSTRUIRE_SOMME,
  titreDocument: "Construire une somme, une différence, un point — Évaluation",
  nomFichierBase: "construire-somme-difference-point",
  genererInstance: genererExerciceConstruireSomme,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
};
