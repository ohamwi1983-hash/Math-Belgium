import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceSigneRacines } from "../../core/signeRacines.types";
import { phases } from "../../moteur/modeleSigneRacines";
import { LIBELLES_VERDICTS, TITRES_PHASES, consigneGenerale, consignePhase, equationLatex, reponsePhase } from "../../ui/formatSigneRacines";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceSigneRacines } from "./index";
import { profilSigneRacines } from "./profil";
import { correctionDetailleeSigneRacines } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen114 « Signe des racines sans les calculer ».
 * Énoncé papier = l'équation + la consigne globale ; les écrans (P, Δ, S ou racine évidente et
 * autre racine, verdict) deviennent les étapes du corrigé.
 */

function enonceFragments(e: ExerciceSigneRacines): FragmentConsigne[] {
  return [texte("Équation : "), latex(equationLatex(e)), texte(".")];
}

function construireEnonce(e: ExerciceSigneRacines): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: phases(e).map((ph) => ({ consigne: consignePhase(e, ph) })) };
}

function enoncePapier(e: ExerciceSigneRacines): EnoncePapier {
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(e.variante === "signes" ? "Sans calculer les racines de cette équation, détermine leur signe en justifiant (produit, discriminant, somme)." : consigneGenerale(e))] }] },
    etapesParQuestion: [phases(e).map((_, i) => String.fromCharCode(97 + i))],
  };
}

function reponseBreve(e: ExerciceSigneRacines): FragmentConsigne[] {
  if (e.variante === "racineEvidente") return [...reponsePhase(e, "x1"), texte(" et "), ...reponsePhase(e, "x2"), texte(` : ${LIBELLES_VERDICTS[e.verdict].toLowerCase()}.`)];
  return [texte(`${LIBELLES_VERDICTS[e.verdict]}.`)];
}

/** Niveau CONSTANT dans une variante : le nombre d'écrans (2, 3 ou 4) dépend du verdict et ne doit
 * pas le trahir. Trois étapes de calcul (P, Δ, S ou x₁, P, x₂) ; méthode du cours imposée ; pas de
 * piège dans les données. */
function criteresDifficulte(): CriteresDifficulte {
  return { etapesTransformation: 3, etapesLecture: 0, methode: 0, piege: 0, nombres: 0, sansCharge: true };
}

function construireCorrection(e: ExerciceSigneRacines): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceSigneRacines): BaremeExercice {
  const lettres = phases(e).map((_, i) => String.fromCharCode(97 + i));
  const calculs = lettres.slice(0, -1);
  const poids = 3 / calculs.length;
  return {
    reponseFinale: reponseBreve(e),
    criteres: [...calculs.map((l, i) => ({ sousQuestion: l, critere: [texte(`${TITRES_PHASES[phases(e)[i]!]} : valeur exacte`)], points: Math.round(poids * 2) / 2 })), { sousQuestion: lettres[lettres.length - 1]!, critere: [texte("Signe des racines justifié")], points: 1 }],
    erreursFrequentes: [
      { description: [texte("S = b/a au lieu de −b/a")], cout: "0 pt sur l'étape S" },
      { description: [texte("Δ calculé quand P < 0 (inutile, pas faux)")], cout: "aucun" },
      { description: [texte("Racines calculées par la formule au lieu du raisonnement sur P et S")], cout: "moitié des points" },
    ],
    reponsesAcceptees: [],
  };
}

export const adaptateurEvaluationSigneRacines: AdaptateurFeuilleExercices<ExerciceSigneRacines> = {
  profilInstance: profilSigneRacines,
  titreDocument: "Signe des racines — Évaluation",
  nomFichierBase: "signe-racines",
  genererInstance: genererExerciceSigneRacines,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeSigneRacines,
  bareme,
  enoncePapier,
};
