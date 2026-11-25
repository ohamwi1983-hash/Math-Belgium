import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceProprietesOptiquesConiques } from "../../core6e/proprietesOptiquesConiques.types";
import type { PhaseProprietesOptiquesConiques } from "../../moteur6e/typesProprietesOptiquesConiques";
import { phasesPourExercice } from "../../moteur6e/typesProprietesOptiquesConiques";
import { latexPoint, latexQ } from "../../moteur6e/algebreLieux";
import { latexConique } from "../../moteur6e/algebreConiques";
import { FORMAT_6GEN63 } from "../../ui6e/formatProprietesOptiquesConiques";
import { fx } from "../../ui6e/corrigeCombinatoire";
import { formatPapier } from "../../ui6e/corrigeLieux";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeProprietesOptiquesConiques, droiteLatex, trajetReflechi } from "./corrigeDetaille";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProprietesOptiquesConiques } from "./index";

/**
 * Adaptateur papier de `6gen63` (propriétés optiques des coniques, 6e ch. 10, § 6, processus 3
 * TRANSFÉRER) — refonte du lot E de l'audit, sur l'adaptateur commun du ch. 7. Énoncé papier = le miroir,
 * le rayon incident (foyer d'où il part, sens, pente ; ou droite parallèle à l'axe) + UNE consigne sans
 * méthode (plus de « par la propriété focale — jamais un calcul de tangente ») : point d'impact, droite du
 * rayon réfléchi et partie parcourue (demi-droite ; pour l'hyperbole, elle s'éloigne de F′). Les écrans
 * deviennent les étapes du corrigé (foyers, impact, propriété, rayon réfléchi), avec la FIGURE du trajet.
 *
 * Profil : `forme` = conique (parabole : rayon issu du foyer ou parallèle à l'axe) ; aucun cas particulier,
 * aucun `calcul` (mettre en équation et choisir le point d'impact : la calculatrice ne le fait pas). Pas de
 * regroupement (contexte propre à chaque instance, comme 6gen57).
 */

type E = ExerciceProprietesOptiquesConiques;
type F = FragmentConsigne[];

const NOM = { ellipse: "l'ellipse", hyperbole: "l'hyperbole", parabole: "la parabole" } as const;

export function situationPapier63(e: E): F {
  const miroir = `Un miroir a la forme de ${NOM[e.famille]} $\\Gamma\\,:\\ ${latexConique(e.conique)}$.`;
  const sens = e.sens > 0 ? "vers les abscisses croissantes" : "vers les abscisses décroissantes";
  if (e.mode === "parallele") return fx(`${miroir} Un rayon lumineux arrive en suivant la droite $y=${latexQ(e.R.y)}$, parallèle à l'axe focal, en venant des abscisses positives.`);
  if (e.famille === "parabole") return fx(`${miroir} Un rayon lumineux part du foyer $F$ de $\\Gamma$ et se dirige ${sens}, en suivant une droite de pente $${latexQ(e.m)}$.`);
  return fx(`${miroir} Un rayon lumineux part du foyer $F$ d'abscisse négative de $\\Gamma$ et se dirige ${sens}, en suivant une droite de pente $${latexQ(e.m)}$.`);
}

export const CONSIGNE_63 = "Détermine le point $R$ où le rayon se réfléchit sur $\\Gamma$, puis une équation de la droite qui porte le rayon réfléchi ; précise la partie de cette droite que parcourt le rayon. Donne des valeurs exactes.";

function reponseBreve(e: E): F {
  return fx(`$R${latexPoint(e.R)}$ ; rayon réfléchi porté par $${droiteLatex(e.reflechi)}$ : ${trajetReflechi(e)}.`);
}

function bareme(e: E): BaremeExercice {
  const l = lettresEcrans(phasesPourExercice, e);
  const c = (i: number, critere: string, points: number) => ({ sousQuestion: l[i], critere: fx(critere), points });
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      c(0, e.Fp ? `Foyers $F${latexPoint(e.F)}$ et $F'${latexPoint(e.Fp)}$` : `Foyer $F${latexPoint(e.F)}$`, 0.75),
      c(1, `Point d'impact $R${latexPoint(e.R)}$${e.autre ? " (l'autre point commun écarté, sens du rayon)" : ""}`, 1.5),
      c(2, "Propriété optique de la conique, citée correctement", 0.5),
      c(3, `Droite du rayon réfléchi $${droiteLatex(e.reflechi)}$ et partie parcourue`, 1.25),
    ],
    erreursFrequentes: [
      ...(e.autre ? [{ description: fx("Point d'impact pris du mauvais côté de $F$ (l'autre point commun)"), cout: "0 pt sur l'étape 2 ; la suite est corrigée avec le point de l'élève" }] : []),
      ...(e.propriete === "semblaVenirDeFp" ? [{ description: fx("Rayon réfléchi dirigé vers $F'$ (segment $[RF']$)"), cout: "0,5 pt sur l'étape 4" }] : []),
      ...(e.famille === "parabole" ? [{ description: fx("Foyer placé à la distance $p$ du sommet au lieu de $\\frac{p}{2}$"), cout: "0 pt sur l'étape 1" }] : [{ description: fx("$c^2=a^2-b^2$ utilisé pour l'hyperbole (ou l'inverse)"), cout: "0 pt sur l'étape 1" }]),
    ],
    reponsesAcceptees: [fx("Toute équation équivalente de la droite ; le trajet décrit en mots ou par une demi-droite"), fx("Si la calculatrice est autorisée, les valeurs décimales exactes sont acceptées.")],
  };
}

function criteres(e: E): CriteresDifficulte {
  // L'écran « propriété » est un rappel du cours (lecture) ; piège : l'autre point commun à écarter.
  return { ...etapesDuCorrige(correctionDetailleeProprietesOptiquesConiques(e), ["c"]), methode: 1, piege: e.autre ? 1 : 0, nombres: 0 };
}

export function profilProprietesOptiquesConiques(e: E): ProfilInstance {
  return { casParticulier: null, forme: e.famille === "parabole" ? `parabole-${e.mode}` : e.famille };
}

export const adaptateurEvaluationProprietesOptiquesConiques: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseProprietesOptiquesConiques>({
  titreDocument: "Propriétés optiques des coniques — Évaluation",
  nomFichierBase: "proprietes-optiques-coniques",
  genererInstance: genererExerciceProprietesOptiquesConiques,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: formatPapier(FORMAT_6GEN63),
  phases: phasesPourExercice,
  situation: situationPapier63,
  questions: (e) => [{ consigne: fx(CONSIGNE_63), etapes: lettresEcrans(phasesPourExercice, e) }],
  reponseBreve,
  correction: correctionDetailleeProprietesOptiquesConiques,
  bareme,
  criteres,
  profil: profilProprietesOptiquesConiques,
});
