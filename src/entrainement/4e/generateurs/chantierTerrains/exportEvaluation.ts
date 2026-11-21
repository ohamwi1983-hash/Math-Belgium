import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CriteresDifficulte,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { correctionDetailleeChantierTerrains } from "./corrigeDetaille";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceChantierTerrains } from "../../core/chantierTerrains.types";
import { valeurCritere } from "../../moteur/modeleChantierTerrains";
import {
  CONSIGNE_GENERALE,
  consignePapier,
  ecrans,
  nomCritere,
  nombreLatex,
  pointLatex,
  recitFragments,
  vecLatex,
} from "../../ui/formatChantierTerrains";
import { figureChantierSvg } from "../../ui/figureChantierTerrains";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceChantierTerrains } from "./index";
import { profilChantierTerrains } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen88. Énoncé papier = situation, coordonnées,
 * plan (sans codage ni point cherché) et la question du contexte (« Justifie par un calcul
 * vectoriel ») ; les quatre écrans (outil, vecteurs, critère, réponse) deviennent les étapes a, b,
 * c, d du corrigé, dont le plan avec les vecteurs utiles (`figureHtml`). Séries équilibrées :
 * `profil.ts` (le verdict n'y entre jamais).
 */

function donneesHtml(e: ExerciceChantierTerrains): string {
  return `<p class="paragraphe">${fragmentsVersHtml(recitFragments(e))}</p><div class="paragraphe">${figureChantierSvg(e)}</div>`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceChantierTerrains): SectionExercice {
  return {
    enteteFragments: [texte(CONSIGNE_GENERALE)],
    enteteHtml: donneesHtml(e),
    questions: ecrans(e).map((ecran) => ({ consigne: ecran.consigne })),
  };
}

function enoncePapier(e: ExerciceChantierTerrains): EnoncePapier {
  return {
    section: {
      enteteFragments: [texte(CONSIGNE_GENERALE)],
      enteteHtml: donneesHtml(e),
      questions: [{ consigne: consignePapier(e) }],
    },
    etapesParQuestion: [["a", "b", "c", "d"]],
  };
}

function reponseBreve(e: ExerciceChantierTerrains): FragmentConsigne[] {
  if (e.verdict !== null) {
    const v = valeurCritere(e);
    return [texte(`${e.verdict ? "Oui" : "Non"} — ${nomCritere(e)} : `), latex(v === 0 ? "0" : `${nombreLatex(v)} \\neq 0`)];
  }
  return [latex(pointLatex(e.cherche!))];
}

function correctionDetaillee(e: ExerciceChantierTerrains): EtapeCorrection[] {
  return correctionDetailleeChantierTerrains(e);
}

function criteresDifficulte(e: ExerciceChantierTerrains): CriteresDifficulte {
  // Méthode 2 : l’outil vectoriel est caché derrière les mots du chantier (énoncé papier sans méthode). Piège dans les données : piquet (inconnue à garder) et enclos (ordre des sommets) ; jamais le verdict (alignement, équerre, parallèles : piège 0, niveau constant). sansCharge : la longueur ne trahit pas un verdict.
  return { ...etapesDuCorrige(correctionDetailleeChantierTerrains(e)), sansCharge: true, methode: 2, piege: e.situation === "piquet" || e.situation === "enclos" ? 1 : 0, nombres: 0 };
}

function construireCorrection(e: ExerciceChantierTerrains): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: etape.fragments }));
}

function bareme(e: ExerciceChantierTerrains): BaremeExercice {
  const erreurs: ErreurFrequente[] = [{ description: [texte("Composantes calculées « départ moins arrivée » (signes inversés)")], cout: "−0,5 par vecteur" }];
  const acceptees: FragmentConsigne[][] = [];
  if (e.verdict !== null) {
    erreurs.unshift({ description: [texte(e.situation === "equerre" ? "Critère de colinéarité calculé au lieu du produit scalaire" : "Produit scalaire calculé au lieu du critère de colinéarité")], cout: "0 pt sur a), c) et d)" });
    erreurs.push({ description: [texte("Conclusion tirée du dessin, ou résultat non nul jugé « négligeable »")], cout: "0 pt sur d)" });
    acceptees.push([texte("Tout autre couple de vecteurs valable (par exemple "), latex(e.situation === "paralleles" ? `${vecLatex("B", "A")} \\text{ et } ${vecLatex("D", "C")}` : `${vecLatex("B", "A")} \\text{ et } ${vecLatex("B", "C")}`), texte(e.situation === "equerre" ? ")… à condition que l'angle testé soit bien celui en A" : ")")]);
    if (e.situation !== "equerre") acceptees.push([texte("Critère de colinéarité calculé avec les vecteurs dans l'autre ordre (valeur opposée), si la conclusion est juste")]);
  } else if (e.situation === "milieu") {
    erreurs.push({ description: [texte("Composantes de "), latex(vecLatex("A", e.cherche!.nom)), texte(" données comme coordonnées du point")], cout: "0 pt sur d)" });
    acceptees.push([texte("Coordonnées obtenues directement par la moyenne des coordonnées de A et B")]);
  } else if (e.situation === "enclos") {
    erreurs.push({ description: [texte("Égalité "), latex(`${vecLatex("A", "B")} = ${vecLatex("C", "D")}`), texte(" (quadrilatère croisé)")], cout: "0 pt sur c) et d)" });
    acceptees.push([texte("Égalité "), latex(`${vecLatex("A", "D")} = ${vecLatex("B", "C")}`), texte(" ou "), latex(`${vecLatex("B", "A")} = ${vecLatex("C", "D")}`), texte(", qui donnent le même point D")]);
  } else {
    erreurs.push({ description: [texte("Coordonnée inconnue de P remplacée par un nombre au hasard, ou équation mal développée")], cout: "0 pt sur c) et d)" });
    acceptees.push([texte("Équation écrite sous une autre forme équivalente (multipliée par un nombre, critère de colinéarité de "), latex(`${vecLatex("A", "P")} \\text{ et } ${vecLatex("A", "B")}`), texte(")")]);
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Outil vectoriel reconnu derrière les mots du contexte")], points: 0.5 },
      { sousQuestion: "b", critere: [texte("Composantes des vecteurs utiles justes")], points: 1.5 },
      { sousQuestion: "c", critere: [texte(e.verdict !== null ? `${nomCritere(e).charAt(0).toUpperCase()}${nomCritere(e).slice(1)} posé et calculé` : e.situation === "piquet" ? "Condition d'alignement traduite en équation" : e.situation === "enclos" ? "Égalité de vecteurs correcte, composantes de DC" : "Composantes du demi-vecteur")], points: 1 },
      { sousQuestion: "d", critere: [texte(e.verdict !== null ? "Réponse dans le contexte, justifiée par la valeur du critère" : "Coordonnées du point cherché, réponse dans le contexte")], points: 1 },
    ],
    erreursFrequentes: erreurs,
    reponsesAcceptees: acceptees,
  };
}

export const adaptateurEvaluationChantierTerrains: AdaptateurFeuilleExercices<ExerciceChantierTerrains> = {
  profilInstance: profilChantierTerrains,
  titreDocument: "Chantier et terrains — Évaluation",
  nomFichierBase: "chantier-terrains",
  genererInstance: genererExerciceChantierTerrains,
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
