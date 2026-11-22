import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  CriteresDifficulte,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleePositionsPlans } from "./corrigeDetaille";
import type { ExercicePositionsPlans } from "../../core/positionsPlans.types";
import { figurePositionsPlansSvg } from "../../ui/figurePositionsPlans";
import {
  consigneGlobale,
  droitePaire,
  enonce,
  LIBELLES_ISSUE,
  nomPlan,
  pointsDeLaPaire,
} from "../../ui/formatPositionsPlans";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExercicePositionsPlans } from "./index";
import { profilPositionsPlans } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen101 (« Positions de deux plans et de trois
 * plans »).
 *
 * Énoncé papier = le texte (solide, milieux nommés, plans), la figure (les plans dessinés par le
 * triangle de leurs trois points, jamais par leur section complète : deux plans confondus se
 * trahiraient) et la consigne globale, NEUTRE (« détermine la position… ; s'ils sont sécants,
 * construis… ») — elle ne dit jamais le verdict. Les deux écrans d'apprentissage (décider, puis
 * justifier ou construire) deviennent les étapes a et b du corrigé. La réponse graphique (droite
 * d'intersection, points construits, sections complètes) va dans le corrigé (`figureHtml`), jamais
 * dans l'énoncé.
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatPositionsPlans.ts`,
 * `ui/figurePositionsPlans.ts`). Séries équilibrées : `profil.ts`.
 */

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function enteteHtml(e: ExercicePositionsPlans): string {
  return `<p class="paragraphe">${echapper(enonce(e))}</p>${figurePositionsPlansSvg(e, { mode: "papier" })}`;
}

/** Consignes des étapes (titres « Étape n — … » du corrigé), rédigées pour le papier. */
function consignesEtapes(e: ExercicePositionsPlans): string[] {
  if (e.variante === "deux-plans") {
    const b =
      e.position === "secants"
        ? "Trouve deux points distincts communs aux deux plans, puis leur droite d'intersection."
        : `Justifie que les plans sont ${e.position === "paralleles" ? "parallèles" : "confondus"}.`;
    return [`Détermine la position relative des plans ${nomPlan(e, 0)} et ${nomPlan(e, 1)}.`, b];
  }
  return [
    `Détermine si les plans ${nomPlan(e, 0)}, ${nomPlan(e, 1)} et ${nomPlan(e, 2)} ont un seul point commun, une droite commune ou aucun point commun.`,
    "Justifie : droite d'intersection de deux des plans et sa position par rapport au troisième, ou deux plans parallèles.",
  ];
}

function construireEnonce(e: ExercicePositionsPlans): SectionExercice {
  return {
    enteteFragments: [texte(enonce(e))],
    enteteHtml: enteteHtml(e),
    questions: consignesEtapes(e).map((c) => ({ consigne: [texte(c)] })),
  };
}

function enoncePapier(e: ExercicePositionsPlans): EnoncePapier {
  return {
    section: { enteteFragments: [], enteteHtml: enteteHtml(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [["a", "b"]],
  };
}

function valide(e: ExercicePositionsPlans): string {
  return e.justifications.find((j) => j.valide)!.texte;
}

function reponseBreve(e: ExercicePositionsPlans): FragmentConsigne[] {
  if (e.variante === "deux-plans") {
    if (e.position === "secants") {
      const paire = e.paireAttendue!;
      const points = pointsDeLaPaire(e, paire)
        .filter((p) => p.candidat.construction)
        .map((p) => `${p.nom} = ${p.candidat.libelle}`);
      return [texte(`Sécants, suivant la droite ${droitePaire(e, paire)}${points.length ? ` (${points.join(" ; ")})` : ""}.`)];
    }
    return [texte(`${e.position === "paralleles" ? "Parallèles" : "Confondus"} : ${valide(e)}`)];
  }
  return [texte(`${LIBELLES_ISSUE[e.issue]} ${valide(e)}`)];
}

function construireCorrection(e: ExercicePositionsPlans): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExercicePositionsPlans): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  let criteres: CritereBareme[];
  let erreurs: ErreurFrequente[];
  if (e.variante === "deux-plans") {
    criteres = [c("a", "Position relative correcte (parallèles, confondus ou sécants)", 1.5)];
    if (e.position === "secants") {
      criteres.push(c("b", "Deux points communs distincts, chacun justifié (point des deux plans, ou intersection de deux droites d'une même face)", 1.5), c("b", "Droite d'intersection tracée et nommée", 1));
      erreurs = [err("Point « construit » avec deux droites gauches (elles se croisent seulement sur le dessin)", "0 pt sur ce point"), err("Plans déclarés parallèles parce que les triangles ne se touchent pas", "0 pt sur a)")];
    } else if (e.position === "paralleles") {
      criteres.push(c("b", "Deux droites sécantes du premier plan, chacune parallèle à une droite du second", 2.5));
      erreurs = [err("Deux droites parallèles entre elles (une seule direction) utilisées pour le critère", "moitié des points de b)"), err("« Les triangles ne se touchent pas » comme seule justification", "0 pt sur b)")];
    } else {
      criteres.push(c("b", "Trois points non alignés du second plan, chacun reconnu dans le premier", 2.5));
      erreurs = [err("Seulement deux points communs cités", "moitié des points de b)"), err("Plans déclarés sécants parce que leurs noms n'ont aucune lettre commune", "0 pt sur a)")];
    }
  } else {
    criteres = [c("a", "Issue correcte (un point, une droite, aucun point)", 1.5), c("b", "Droite d'intersection de deux plans correcte (ou deux plans parallèles reconnus)", 1.5), c("b", "Position de cette droite par rapport au troisième plan, et conclusion", 1)];
    erreurs = [
      err("Droite d'intersection prise dans un seul des deux plans", "0 pt sur la droite d'intersection"),
      err("Trois plans sécants deux à deux déclarés sécants en un point sans vérification (Toblerone oublié)", "0 pt sur a)"),
    ];
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Toute justification équivalente : d'autres points communs, d'autres droites parallèles ou une autre paire de plans, pourvu que le raisonnement soit exact.")]],
  };
}

/** Niveau CONSTANT dans un verdict (position des deux plans, issue des trois plans) : deux écrans de
 * raisonnement, sans charge (le nombre de lignes dépend du verdict), méthode 1 (choisir la propriété
 * du cours : trois points communs, point commun, critère de parallélisme, droite d'intersection),
 * aucun piège dans les données, aucun nombre. */
function criteresDifficulte(e: ExercicePositionsPlans): CriteresDifficulte {
  return { ...etapesDuCorrige(correctionDetailleePositionsPlans(e)), sansCharge: true, methode: 1, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationPositionsPlans: AdaptateurFeuilleExercices<ExercicePositionsPlans> = {
  profilInstance: profilPositionsPlans,
  titreDocument: "Positions de deux plans et de trois plans — Évaluation",
  nomFichierBase: "positions-deux-trois-plans",
  genererInstance: genererExercicePositionsPlans,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: (e) => correctionDetailleePositionsPlans(e),
  bareme,
  enoncePapier,
};
