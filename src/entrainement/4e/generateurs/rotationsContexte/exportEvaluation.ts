import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceRotationsContexte } from "../../core/rotationsContexte.types";
import {
  calculExact,
  grandeurRetour,
  hauteurDirecte,
  solutionsTheta,
} from "../../moteur/modeleRotationsContexte";
import {
  CONSIGNE_GENERALE,
  consignesEcrans,
  contexteTexte,
  egalOuApprox,
  hauteurExacteLatex,
  nombreFixeLatex,
  precisionPapier,
  questionTexte,
  reference,
  retoursLatex,
} from "../../ui/formatRotationsContexte";
import { figureRotationsContexteSvg } from "../../ui/figureRotationsContexte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceRotationsContexte } from "./index";
import { LIBELLE_CAS_ROTATIONS_CONTEXTE, profilRotationsContexte } from "./profil";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { thetaBrut } from "../../moteur/modeleRotationsContexte";
import { correctionDetailleeRotationsContexte, LETTRES_LECTURE_ROTATIONS } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen79. Énoncé papier = la situation, son schéma
 * (cercle trigonométrique superposé, sans réponse) et la question du contexte avec sa précision ;
 * les quatre écrans d'apprentissage (repérage, angle / équation, position / solutions, réponse /
 * retour au contexte) deviennent les étapes a, b, c, d du corrigé, dont la dernière porte le schéma
 * corrigé (`figureHtml`). Calculatrice interdite (profil `exacte`) : la précision papier demande la
 * valeur exacte. Séries équilibrées : `profil.ts`.
 */

function enonceTexte(e: ExerciceRotationsContexte): string {
  return `${contexteTexte(e)} ${questionTexte(e)}`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceRotationsContexte): SectionExercice {
  return {
    enteteFragments: [texte(`${CONSIGNE_GENERALE} ${enonceTexte(e)}`)],
    enteteHtml: figureRotationsContexteSvg(e, "enonce"),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceRotationsContexte): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(`${enonceTexte(e)} ${precisionPapier(e, calculExact(e))}`)],
      enteteHtml: figureRotationsContexteSvg(e, "enonce"),
      questions: [],
    },
  };
}

function reponseBreve(e: ExerciceRotationsContexte): FragmentConsigne[] {
  if (e.sens === "direct") {
    const H = hauteurDirecte(e);
    if (calculExact(e) && !Number.isInteger(H * 100)) return [texte("Hauteur : "), latex(`${hauteurExacteLatex(e)} \\approx ${nombreFixeLatex(H, 2)}\\text{ ${e.unite}}`)];
    return [texte("Hauteur : "), latex(`${egalOuApprox(H, 2).replace(/^=\s*/, "")}\\text{ ${e.unite}}`)];
  }
  return [latex(retoursLatex(e))];
}

function construireCorrection(e: ExerciceRotationsContexte): BlocCorrection[] {
  return correctionDetailleeRotationsContexte(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceRotationsContexte): BaremeExercice {
  if (e.sens === "direct") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("Position de départ et sens de rotation reportés sur le cercle trigonométrique")], points: 0.5 },
        { sousQuestion: "b", critere: [texte("Angle trigonométrique θ (θ₀ ± α, réduit à [0° ; 360°[)")], points: 1 },
        { sousQuestion: "c", critere: [texte("Coordonnées (r cos θ ; r sin θ) avec les bons signes")], points: 1.5 },
        { sousQuestion: "d", critere: [texte(`Hauteur au-dessus ${reference(e)} : h + y, avec l'unité`)], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("α pris directement comme angle trigonométrique (origine ou sens du contexte ignorés)")], cout: "0 pt sur b), suite corrigée sans double sanction" },
        { description: [texte("Mauvais signe de sin θ (quadrant mal identifié)")], cout: "0,5 pt sur c)" },
        { description: [texte("Hauteur donnée par rapport au centre (h oublié)")], cout: "0,5 pt sur d)" },
      ],
      reponsesAcceptees: [[texte("Valeur exacte ou valeur approchée au centième")], [texte("θ non réduit mais correct à 360° près, si la suite est juste (0,5 pt retiré sur b)")]],
    };
  }
  const unique = solutionsTheta(e).length === 1;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Position de départ et sens de rotation reportés sur le cercle trigonométrique")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Mise en équation h + r sin θ = H, puis valeur de sin θ")], points: 1 },
      { sousQuestion: "c", critere: [texte(unique ? "Solution unique de sin θ = ±1 dans [0° ; 360°[" : "Les deux solutions de sin θ = k dans [0° ; 360°[")], points: 1.5 },
      { sousQuestion: "d", critere: [texte(`Retour au contexte (${grandeurRetour(e.situation) === "angle" ? "angles de rotation depuis le départ" : grandeurRetour(e.situation) === "minutes" ? "minutes après midi" : "instants"}), avec l'unité`)], points: 1 },
    ],
    erreursFrequentes: [
      unique
        ? { description: [texte("Une seconde solution ajoutée à tort")], cout: "0,5 pt sur c)" }
        : { description: [texte("Une seule solution donnée (la seconde, 180° − θ₁, oubliée)")], cout: "0,75 pt sur c)" },
      { description: [texte("Angles θ donnés comme réponse, sans les recompter depuis le départ")], cout: "0 pt sur d)" },
      { description: [texte("Sens de rotation inversé dans la conversion")], cout: "0,5 pt sur d)" },
    ],
    reponsesAcceptees: [[texte("Écart dû à un arrondi au dixième de degré des angles θ")]],
  };
}

/** Niveau (grille commune) : écran de lecture a (départ et sens lus sur le schéma) ; méthode 2 —
 * l'énoncé papier ne donne aucun modèle, l'élève superpose lui-même le cercle trigonométrique
 * (θ = θ départ ± α, h + r sin θ) ; piège dans les données : sens horaire, angle à ramener dans
 * [0° ; 360°[ (direct) ou solution unique (inverse). Nombres : calculatrice (profil). */
function criteresDifficulte(e: ExerciceRotationsContexte): CriteresDifficulte {
  // Sens inverse : « deux / une seule solution » est un VERDICT (audit 4e ch. 5, lot D) — la solution
  // unique sortait toujours au niveau 5 et en 11 min : niveau ET durée constants (5, 12 min), comme gen74.
  if (e.sens === "inverse") return { etapesTransformation: 3, etapesLecture: 1, sansCharge: true, methode: 2, piege: 0, nombres: 1 };
  const brut = thetaBrut(e);
  const piege = e.rotation === -1 || brut < 0 || brut >= 360;
  return {
    ...etapesDuCorrige(correctionDetailleeRotationsContexte(e), LETTRES_LECTURE_ROTATIONS),
    methode: 2,
    piege: piege ? 1 : 0,
  };
}

export const adaptateurEvaluationRotationsContexte: AdaptateurFeuilleExercices<ExerciceRotationsContexte> = {
  profilInstance: profilRotationsContexte,
  libelleCasParticulier: LIBELLE_CAS_ROTATIONS_CONTEXTE,
  titreDocument: "Le cercle dans le réel : rotations en contexte — Évaluation",
  nomFichierBase: "rotations-contexte",
  genererInstance: genererExerciceRotationsContexte,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeRotationsContexte,
  bareme,
  enoncePapier,
};
