import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, CriteresDifficulte, EnoncePapier, ErreurFrequente, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceOmbreLampe } from "../../core/ombreLampe.types";
import { contexte, texteConclusion } from "../../ui/formatOmbreLampe";
import { figureCorrigee, figureEnonce } from "./figure";
import { correctionDetailleeOmbreLampe } from "./corrigeDetaille";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceOmbreLampe } from "./index";
import { profilOmbreLampe } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen106 (« Ombre à la lampe : projection
 * centrale », `AppOmbreLampe.tsx`).
 *
 * **Écran → papier, adaptation « choix » → « tracé »** (comme gen41) : à l'écran, l'élève choisit
 * parmi 4 candidats dessinés ; sur papier, il CONSTRUIT lui-même (rayon issu de la lampe, trace au sol
 * par le pied de la lampe, intersection ; verticale sur le mur ; prolongements des ombres pour
 * retrouver la lampe). L'énoncé montre la scène sans rien de ce qui est à construire (aucun candidat,
 * aucune ombre cherchée) ; la construction complète va dans le corrigé (`figureHtml`).
 *
 * Aucune valeur numérique : la correction désigne les points nommés sur la figure. Même géométrie et
 * mêmes éléments de croquis qu'à l'écran (`ui/formatOmbreLampe.ts`) ; seule la rastérisation en
 * `<svg>` à attributs inline (le document n'a pas accès aux feuilles de style) est écrite ici.
 */

// --- Énoncé ----------------------------------------------------------------------------------------

function nomSolide(e: Extract<ExerciceOmbreLampe, { variante: "cube" }>): string {
  return e.estCube ? "cube" : "pavé";
}

/** Une consigne par écran du générateur (titres « Étape n » du corrigé). */
function consignesEtapes(e: ExerciceOmbreLampe): [string, string] {
  if (e.variante === "poteau") return ["Trace la demi-droite du sol, issue du pied de A, qui porte l'ombre du poteau A.", "Construis l'ombre A′ du sommet de A, puis l'ombre du poteau A."];
  if (e.variante === "cube") {
    const [s1, s2] = e.projetes;
    return [`Construis l'ombre ${s1.id}′ du sommet ${s1.id}.`, `Construis l'ombre ${s2.id}′ du sommet ${s2.id}, puis le contour de l'ombre du ${nomSolide(e)}.`];
  }
  if (e.variante === "mur") return ["Construis le point M où l'ombre du poteau A, sur le sol, atteint le pied du mur.", "Construis l'ombre A′ du sommet de A sur le mur, puis l'ombre du poteau sur le mur."];
  return ["Construis le pied L₀ de la lampe.", "Construis la lampe L."];
}

function consignePapier(e: ExerciceOmbreLampe): string {
  if (e.variante === "poteau") return "Construis l'ombre du poteau A ; nomme A′ l'ombre de son sommet.";
  if (e.variante === "cube") {
    const [s1, s2] = e.projetes;
    return `Construis les ombres ${s1.id}′ et ${s2.id}′ des sommets ${s1.id} et ${s2.id}, puis celles des autres sommets utiles, et trace le contour de l'ombre du ${nomSolide(e)} sur le sol.`;
  }
  if (e.variante === "mur") return "Construis l'ombre du poteau A : sur le sol jusqu'au point M du pied du mur, puis sur le mur ; nomme A′ l'ombre de son sommet.";
  return "Construis le pied L₀ de la lampe, puis la lampe L.";
}

function construireEnonce(e: ExerciceOmbreLampe): SectionExercice {
  return {
    enteteFragments: [texte(contexte(e))],
    enteteHtml: figureEnonce(e),
    questions: consignesEtapes(e).map((c) => ({ consigne: [texte(c)] })),
  };
}

function enoncePapier(e: ExerciceOmbreLampe): EnoncePapier {
  return {
    section: { enteteFragments: [texte(contexte(e))], enteteHtml: figureEnonce(e), questions: [{ consigne: [texte(consignePapier(e))] }] },
    etapesParQuestion: [["a", "b"]],
  };
}

// --- Corrigé ---------------------------------------------------------------------------------------

function reponseBreve(e: ExerciceOmbreLampe): FragmentConsigne[] {
  if (e.variante === "poteau") return [texte("Ombre du poteau A : du pied de A jusqu'à A′, sur la droite qui joint L₀ au pied de A (voir la figure du corrigé).")];
  if (e.variante === "cube") return [texte(`Ombres ${e.projetes.map((s) => `${s.id}′`).join(" et ")}, puis contour de l'ombre du ${nomSolide(e)} : voir la figure du corrigé.`)];
  if (e.variante === "mur") return [texte("Ombre au sol du pied de A jusqu'à M, puis verticale sur le mur de M jusqu'à A′ (voir la figure du corrigé).")];
  return [texte("L₀ : intersection des prolongements des deux ombres ; L : à la verticale de L₀, intersection des rayons (voir la figure du corrigé).")];
}

function correctionDetaillee(e: ExerciceOmbreLampe): EtapeCorrection[] {
  return correctionDetailleeOmbreLampe(e, figureCorrigee(e));
}

function construireCorrection(e: ExerciceOmbreLampe): BlocCorrection[] {
  return [
    { type: "html", html: figureCorrigee(e) },
    { type: "paragraphe", fragments: [texte(texteConclusion(e))] },
  ];
}

function bareme(e: ExerciceOmbreLampe): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  const reponseFinale = reponseBreve(e);
  if (e.variante === "poteau") {
    return {
      reponseFinale,
      criteres: [c("a", "Trace au sol : droite qui joint L₀ au pied de A, du côté opposé à la lampe", 1.5), c("b", "Rayon issu de L qui passe par le sommet de A", 1.5), c("b", "A′ à l'intersection, ombre du poteau tracée", 1)],
      erreursFrequentes: [err("Ombre de A tracée parallèle à celle de E (comme au soleil)", "0 pt sur a)"), err("Trace au sol issue de la lampe L dessinée au lieu de son pied L₀", "0 pt sur a), suite notée sans double pénalité")],
      reponsesAcceptees: [[texte("Construction juste sans tracer les droites en entier, si A′ est bien placé et les tracés visibles")]],
    };
  }
  if (e.variante === "cube") {
    const [s1, s2] = e.projetes;
    return {
      reponseFinale,
      criteres: [c("a", `${s1.id}′ : rayon (L${s1.id}) et trace au sol par L₀ et ${s1.idPied}`, 1.5), c("b", `${s2.id}′ : rayon (L${s2.id}) et trace au sol par L₀ et ${s2.idPied}`, 1.5), c("b", "Ombres des autres sommets utiles et contour de l'ombre tracés", 1)],
      erreursFrequentes: [err("Rayons tracés parallèles entre eux (comme au soleil)", "0 pt sur l'ombre concernée"), err("Trace au sol par le pied d'un autre sommet", "0 pt sur l'ombre concernée")],
    };
  }
  if (e.variante === "mur") {
    return {
      reponseFinale,
      criteres: [c("a", "Trace au sol par L₀ et le pied de A, prolongée jusqu'au pied du mur : M", 1.5), c("b", "Verticale du mur issue de M", 1), c("b", "A′ à l'intersection avec le rayon issu de L, ombre tracée (sol puis mur)", 1.5)],
      erreursFrequentes: [err("Ombre prolongée sur le sol au-delà du mur", "0 pt sur b)"), err("Trace au sol tracée droit vers le mur (perpendiculaire)", "0 pt sur a), suite notée sans double pénalité")],
    };
  }
  return {
    reponseFinale,
    criteres: [c("a", "Prolongements des deux ombres au-delà des pieds des poteaux", 1), c("a", "L₀ à leur intersection", 1), c("b", "Rayons qui joignent A′ au sommet de A et B′ au sommet de B, prolongés", 1), c("b", "L à leur intersection, à la verticale de L₀", 1)],
    erreursFrequentes: [err("Lampe placée au point du dessin où se coupent les prolongements des ombres (confusion entre L₀ et L)", "0 pt sur la position de L₀"), err("Rayons tracés à partir des pieds des poteaux au lieu de leurs sommets", "0 pt sur b)")],
  };
}

/** Niveau (grille commune) : deux constructions qui raisonnent (plan vertical, rayon, intersection) ;
 * méthode 1 pour « lampe » (retrouver la source : raisonnement inverse, non dit par la consigne) et
 * « mur » (changement de surface : intersection de deux plans verticaux), 0 sinon ; aucun piège dans
 * les données, aucun nombre. Constant dans chaque variante. */
function criteresDifficulte(e: ExerciceOmbreLampe): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetaillee(e)), methode: e.variante === "lampe" || e.variante === "mur" ? 1 : 0, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationOmbreLampe: AdaptateurFeuilleExercices<ExerciceOmbreLampe> = {
  titreDocument: "Ombre à la lampe — projection centrale — Évaluation",
  nomFichierBase: "ombre-lampe",
  genererInstance: genererExerciceOmbreLampe,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  profilInstance: profilOmbreLampe,
};
