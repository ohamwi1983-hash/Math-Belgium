import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceValeurExacte } from "../../core/valeurExacte.types";
import { exactLatex, valeurApprochee } from "../../moteur/corpsValeurExacte";
import { necessiteReduction, valeurFonction } from "../../moteur/modeleValeurExacte";
import { ecransDe, type EcranValeurExacte } from "../../moteur/sessionValeurExacte";
import {
  CONSIGNE_PAPIER,
  aDesProduitsOuCarres,
  consigneEcran,
  expressionLatex,
  fonctionAngleLatex,
  resultatLatex,
} from "../../ui/formatValeurExacte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceValeurExacte } from "./index";
import { LIBELLE_CAS_VALEUR_EXACTE, profilValeurExacte } from "./profil";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeValeurExacte, lettresLectureValeurExacte } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen76. Énoncé papier = « Calcule, sans
 * calculatrice, la valeur exacte de : … » (rien d'autre : les étapes d'apprentissage — réduire,
 * quadrant et signe, angle associé et valeur, calcul final — sont les étapes a, b, c… du corrigé,
 * une par écran, dans l'ordre de l'appli). Séries équilibrées : `profil.ts`.
 */

const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function lettresEcrans(e: ExerciceValeurExacte): { ecran: EcranValeurExacte; lettre: string }[] {
  return ecransDe(e).map((ecran, i) => ({ ecran, lettre: LETTRES[i]! }));
}

function lettreDe(e: ExerciceValeurExacte, type: EcranValeurExacte["type"], terme?: number): string {
  return lettresEcrans(e).find(({ ecran }) => ecran.type === type && (ecran.type === "final" || ecran.terme === terme))!.lettre;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceValeurExacte): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_PAPIER} `), latex(expressionLatex(e))],
    questions: ecransDe(e).map((ecran) => ({
      consigne: ecran.type === "final" ? consigneEcran(e, ecran) : [texte(`Terme ${ecran.terme + 1} — `), ...consigneEcran(e, ecran)],
    })),
  };
}

function enoncePapier(e: ExerciceValeurExacte): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`${CONSIGNE_PAPIER} `), latex(expressionLatex(e))],
      questions: [],
    },
  };
}

function reponseBreve(e: ExerciceValeurExacte): FragmentConsigne[] {
  return [latex(`${expressionLatex(e)} = ${resultatLatex(e)}`)];
}

function construireCorrection(e: ExerciceValeurExacte): BlocCorrection[] {
  return [
    ...e.termes.map((t): BlocCorrection => ({ type: "paragraphe", fragments: [latex(`${fonctionAngleLatex(t.fonction, t.angle)} = ${exactLatex(valeurFonction(t))}`)] })),
    { type: "paragraphe", fragments: reponseBreve(e) },
  ];
}

function bareme(e: ExerciceValeurExacte): BaremeExercice {
  const n = e.termes.length;
  const parTerme = n === 2 ? 1.25 : 1;
  const criteres: CritereBareme[] = e.termes.map((t, i) => ({
    sousQuestion: lettreDe(e, "valeur", i),
    critere: [
      texte(`Valeur exacte de `),
      latex(fonctionAngleLatex(t.fonction, t.angle)),
      texte(necessiteReduction(t) ? " : angle ramené dans [0° ; 360°[, quadrant et signe, angle associé, valeur remarquable" : " : quadrant et signe, angle associé, valeur remarquable"),
    ],
    points: parTerme,
  }));
  criteres.push({ sousQuestion: lettreDe(e, "final"), critere: [texte("Calcul exact de l'expression (priorités, fractions et racines), résultat simplifié")], points: 4 - n * parTerme });
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: [
      { description: [texte("Signe oublié ou faux (le signe vient du quadrant de l'angle)")], cout: "moitié des points du terme concerné" },
      { description: [texte("Sinus et cosinus confondus (valeur de l'autre fonction)")], cout: "0 pt sur le terme concerné" },
      { description: [texte("Valeur décimale approchée au lieu de la valeur exacte")], cout: "moitié des points du calcul final" },
      ...(aDesProduitsOuCarres(e) ? [{ description: [texte("Priorité des opérations non respectée, ou carré d'un nombre négatif écrit négatif")], cout: "moitié des points du calcul final" }] : []),
    ],
    reponsesAcceptees: [[texte("Toute écriture exacte équivalente (dénominateurs non réunis, racine écrite autrement)")]],
  };
}

/** Niveau (grille commune) : écrans de lecture = « quadrant et signe » de chaque terme ; méthode
 * imposée (énoncé : valeur exacte, sans calculatrice) ; piège dans les données : carré d'une valeur
 * négative, ou angle négatif à ramener dans [0° ; 360°[. */
function criteresDifficulte(e: ExerciceValeurExacte): CriteresDifficulte {
  return {
    ...etapesDuCorrige(correctionDetailleeValeurExacte(e), lettresLectureValeurExacte(e)),
    methode: 0,
    piege: e.termes.some((t) => (t.carre && valeurApprochee(valeurFonction(t)) < 0) || t.angle < 0) ? 1 : 0,
  };
}

export const adaptateurEvaluationValeurExacte: AdaptateurFeuilleExercices<ExerciceValeurExacte> = {
  profilInstance: profilValeurExacte,
  libelleCasParticulier: LIBELLE_CAS_VALEUR_EXACTE,
  titreDocument: "Valeur exacte sans calculatrice — Évaluation",
  nomFichierBase: "valeur-exacte-sans-calculatrice",
  genererInstance: genererExerciceValeurExacte,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeValeurExacte,
  bareme,
  enoncePapier,
};
