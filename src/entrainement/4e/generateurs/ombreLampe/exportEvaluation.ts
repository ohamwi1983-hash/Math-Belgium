import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CritereBareme, EnoncePapier, ErreurFrequente, EtapeCorrection, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import type { ExerciceOmbreLampe } from "../../core/ombreLampe.types";
import { contexte, elementsConclusion, elementsScene, solidePourAffichage, texteConclusion } from "../../ui/formatOmbreLampe";
import type { ElementsCroquis } from "../../ui/formatOmbreLampe";
import { calculerEchelleProjection, HAUTEUR_SVG, LARGEUR_SVG, projeter3DVersPixel } from "../../ui/solide3DSketch";
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

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function figureSvg(e: ExerciceOmbreLampe, elements: ElementsCroquis, legende: string): string {
  const echelle = calculerEchelleProjection(solidePourAffichage(e));
  const traits = elements.segments
    .map((s) => {
      const p1 = projeter3DVersPixel(s.a, echelle);
      const p2 = projeter3DVersPixel(s.b, echelle);
      const pointille = s.pointille ? ` stroke-dasharray="5 4"` : "";
      return `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="${s.couleur}" stroke-width="1.8"${pointille}/>`;
    })
    .join("");
  const points = elements.points
    .map((pt) => {
      const p = projeter3DVersPixel(pt.position, echelle);
      const l = pt.decalageLabel ? { x: p.x + pt.decalageLabel.x, y: p.y + pt.decalageLabel.y + 4 } : { x: p.x, y: p.y - 8 };
      const rayon = Math.min(pt.rayon ?? 3.5, 3.5);
      return (
        `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${rayon}" fill="${pt.couleur}"/>` +
        `<text x="${l.x.toFixed(1)}" y="${l.y.toFixed(1)}" font-size="13" font-weight="700" text-anchor="middle" fill="${pt.couleur}" stroke="#ffffff" stroke-width="3" paint-order="stroke">${echapper(pt.label)}</text>`
      );
    })
    .join("");
  const svg = `<svg width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" viewBox="0 0 ${LARGEUR_SVG} ${HAUTEUR_SVG}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${echapper(legende)}">
<rect x="0" y="0" width="${LARGEUR_SVG}" height="${HAUTEUR_SVG}" fill="#ffffff"/>
${traits}
${points}
</svg>`;
  return `<div style="text-align:center;margin:0.6em 0;page-break-inside:avoid;break-inside:avoid;">${svg}</div>`;
}

const figureEnonce = (e: ExerciceOmbreLampe) => figureSvg(e, elementsScene(e), "Scène en perspective cavalière — ombre à la lampe");
const figureCorrigee = (e: ExerciceOmbreLampe) => figureSvg(e, elementsConclusion(e), "Construction complète — ombre à la lampe");

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

const METHODE_RAYON = "Les rayons d'une lampe partent tous de la lampe L : ils ne sont pas parallèles. L'ombre d'un point est sur le rayon issu de L qui passe par ce point.";
const METHODE_TRACE = "Le rayon qui passe par le sommet d'un objet vertical reste dans le plan vertical qui contient l'objet et le mât de la lampe : sur le sol, l'ombre est sur la droite qui joint le pied L₀ de la lampe au pied de l'objet, du côté opposé à la lampe.";

function correctionDetaillee(e: ExerciceOmbreLampe): EtapeCorrection[] {
  const figure = figureCorrigee(e);
  const conclusion = [texte(texteConclusion(e))];
  if (e.variante === "poteau") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte(`${METHODE_RAYON} ${METHODE_TRACE}`)] },
      { label: "Construction", sousQuestion: "a", fragments: [texte("On trace la droite qui part de L₀ et passe par le pied de A ; l'ombre est sur la demi-droite issue du pied de A, du côté opposé à L₀. L'ombre de E vérifie la même règle.")] },
      { label: "Construction", sousQuestion: "b", fragments: [texte("A′ est l'intersection de cette demi-droite et du rayon issu de L qui passe par le sommet de A. L'ombre du poteau est le segment qui joint le pied de A à A′.")] },
      { label: "Conclusion", sousQuestion: "b", fragments: conclusion, figureHtml: figure },
      { label: "Piège", sousQuestion: "a", fragments: [texte("Tracer l'ombre de A parallèle à celle de E, comme au soleil : avec une lampe, les ombres ne sont pas parallèles, leurs droites se coupent au pied L₀ de la lampe.")] },
    ];
  }
  if (e.variante === "cube") {
    const [s1, s2] = e.projetes;
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte(`${METHODE_RAYON} ${METHODE_TRACE} Le pied d'un sommet du haut est le sommet du bas situé juste en dessous.`)] },
      { label: "Construction", sousQuestion: "a", fragments: [texte(`${s1.id}′ est l'intersection du rayon issu de L qui passe par ${s1.id} et de la trace au sol qui part de L₀ et passe par ${s1.idPied}.`)] },
      { label: "Construction", sousQuestion: "b", fragments: [texte(`De même, ${s2.id}′ est l'intersection du rayon issu de L qui passe par ${s2.id} et de la trace au sol qui part de L₀ et passe par ${s2.idPied}. On construit ainsi les ombres des autres sommets du haut, puis on relie la base et ces ombres par le contour extérieur.`)] },
      { label: "Conclusion", sousQuestion: "b", fragments: conclusion, figureHtml: figure },
      { label: "Piège", sousQuestion: "b", fragments: [texte(`Tracer le rayon issu de ${s2.id} parallèle à celui de ${s1.id}, comme au soleil, ou faire passer la trace au sol par le pied d'un autre sommet : chaque trace part de L₀ et passe par le pied du sommet concerné.`)] },
    ];
  }
  if (e.variante === "mur") {
    return [
      { label: "Méthode", sousQuestion: "a", fragments: [texte(METHODE_TRACE)] },
      { label: "Construction", sousQuestion: "a", fragments: [texte("On prolonge la droite qui joint L₀ au pied de A, au-delà du pied de A, jusqu'au pied du mur : c'est le point M. Sur le sol, l'ombre va du pied de A à M.")] },
      { label: "Méthode", sousQuestion: "b", fragments: [texte("Le plan vertical qui contient le poteau et la lampe coupe le mur vertical suivant une droite verticale qui part de M : l'ombre monte sur cette verticale.")] },
      { label: "Construction", sousQuestion: "b", fragments: [texte("A′ est l'intersection de la verticale du mur issue de M et du rayon issu de L qui passe par le sommet de A.")] },
      { label: "Conclusion", sousQuestion: "b", fragments: conclusion, figureHtml: figure },
      { label: "Piège", sousQuestion: "b", fragments: [texte("Continuer l'ombre sur le sol au-delà du mur, ou la faire monter en biais : sur le mur, l'ombre monte verticalement à partir de M et s'arrête sur le rayon issu de L.")] },
    ];
  }
  return [
    { label: "Méthode", sousQuestion: "a", fragments: [texte(`${METHODE_TRACE} Le pied de la lampe est donc sur le prolongement de chaque ombre, au-delà du pied de son poteau.`)] },
    { label: "Construction", sousQuestion: "a", fragments: [texte("On prolonge l'ombre de A au-delà du pied de A, et l'ombre de B au-delà du pied de B : ces deux droites se coupent en L₀.")] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("Chaque rayon part de la lampe, passe par le sommet d'un poteau et arrive à l'ombre de ce sommet : la lampe est sur la droite qui joint A′ au sommet de A, sur celle qui joint B′ au sommet de B, et à la verticale de L₀.")] },
    { label: "Construction", sousQuestion: "b", fragments: [texte("On prolonge ces deux rayons au-delà des sommets : ils se coupent en L, sur la verticale issue de L₀ (ce qui permet de vérifier la construction).")] },
    { label: "Conclusion", sousQuestion: "b", fragments: conclusion, figureHtml: figure },
    { label: "Piège", sousQuestion: "a", fragments: [texte("Prolonger les ombres à partir de leurs extrémités A′ et B′ dans le mauvais sens, ou confondre le pied de la lampe (sur le sol) avec la lampe elle-même.")] },
  ];
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

function difficulte(e: ExerciceOmbreLampe): 1 | 2 | 3 {
  if (e.variante === "poteau") return 1;
  if (e.variante === "lampe") return 3;
  return 2;
}

export const adaptateurEvaluationOmbreLampe: AdaptateurFeuilleExercices<ExerciceOmbreLampe> = {
  titreDocument: "Ombre à la lampe — projection centrale — Évaluation",
  nomFichierBase: "ombre-lampe",
  genererInstance: genererExerciceOmbreLampe,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 7,
  profilInstance: profilOmbreLampe,
};
