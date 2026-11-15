import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { texte } from "../../../export/fragmentsDocx";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceCirculaire, ExerciceDiagrammesTrompeurs, ExerciceTrompeurBarres, ExerciceTrompeurCirculaire } from "../../core/diagrammesTrompeurs.types";
import { angleSecteur, evolutionAffichee, evolutionReelle, pourcentageGroupe, pourcentageSecteur, sommeParts, totalBatons, totalReponses } from "../../moteur/modeleDiagrammesTrompeurs";
import { figureBarresSvg, figureBatonsSvg, figureCirculaireSvg, figurePictogrammesSvg, figureTotalFauxSvg } from "../../ui/figureDiagrammesTrompeurs";
import {
  NOMS_MANIPULATIONS,
  calculChamp,
  consigneGenerale,
  ecransExercice,
  enonceExercice,
  explicationManipulation,
  piege,
  questionEvolution,
  questionGroupe,
  questionReponses,
  type EcranChamps,
} from "../../ui/formatDiagrammesTrompeurs";
import { nombreAffiche as nb } from "../../ui/formatNombreDiagrammes";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDiagrammesTrompeurs } from "./index";
import { profilDiagrammesTrompeurs } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen111 (« Diagrammes et graphiques trompeurs »).
 *
 * Énoncé papier = le texte, le tableau ou la figure, et la consigne globale. Les écrans d'APPRENTISSAGE
 * (fréquences puis angles ; effectifs lus, effectif total, pourcentage ; vraies valeurs puis
 * évolution) deviennent les étapes a, b, c du corrigé. Seul un graphique trompeur garde deux VRAIES
 * questions : a) expliquer la manipulation, b) corriger la conclusion chiffrée (étapes b et c).
 * Le diagramme circulaire à construire (sens direct) est une réponse GRAPHIQUE : il figure dans le
 * corrigé (`figureHtml`), jamais dans l'énoncé.
 *
 * Toutes les valeurs viennent des mêmes fonctions que l'écran (`ui/formatDiagrammesTrompeurs.ts`,
 * `moteur/modeleDiagrammesTrompeurs.ts`). Séries équilibrées : `profil.ts`.
 */

const TD = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:center"';
const TH = 'style="border:1px solid #b9bec7;padding:3px 10px;text-align:left;font-weight:600"';

function echapper(t: string): string {
  return t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

/** Tableau des effectifs (sens direct), catégories en colonnes. */
function tableauHtml(e: ExerciceCirculaire): string {
  const ligne = (tete: string, cellules: string[]) => `<tr><th ${TH}>${echapper(tete)}</th>${cellules.map((c) => `<td ${TD}>${echapper(c)}</td>`).join("")}</tr>`;
  return `<table style="border-collapse:collapse;margin:6px 0">${ligne(e.contexte.colonne, [...e.secteurs.map((s) => s.nom), "Total"])}${ligne("Effectif", [...e.secteurs.map((s) => nb(s.effectif)), nb(e.n)])}</table>`;
}

function figureEnonce(e: ExerciceDiagrammesTrompeurs): string {
  switch (e.sousType) {
    case "direct":
      return tableauHtml(e as ExerciceCirculaire);
    case "inverse":
      return figureCirculaireSvg(e as ExerciceCirculaire, "angles");
    case "circulaire":
      return figureCirculaireSvg(e as ExerciceCirculaire, "pourcentages");
    case "batons":
      return figureBatonsSvg(e);
    case "total-faux":
      return figureTotalFauxSvg(e);
    case "pictogrammes":
      return figurePictogrammesSvg(e);
    default:
      return figureBarresSvg(e);
  }
}

function enteteHtml(e: ExerciceDiagrammesTrompeurs): string {
  return `<p class="paragraphe">${fragmentsVersHtml(enonceExercice(e))}</p>${figureEnonce(e)}`;
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDiagrammesTrompeurs): SectionExercice {
  return {
    enteteFragments: [texte(consigneGenerale(e))],
    enteteHtml: enteteHtml(e),
    questions: ecransExercice(e).map((ec) => ({ consigne: ec.consigne })),
  };
}

const LETTRES = ["a", "b", "c"];

function estTrompeur(e: ExerciceDiagrammesTrompeurs): e is ExerciceTrompeurBarres | ExerciceTrompeurCirculaire {
  return e.variante === "trompeur";
}

function consignePapier(e: ExerciceDiagrammesTrompeurs): string {
  switch (e.sousType) {
    case "direct":
      return "Calcule la fréquence (en %) et l'angle du secteur de chaque catégorie, puis construis le diagramme circulaire de cette série.";
    case "inverse":
      return "Calcule la fréquence (en %), puis l'effectif de chaque catégorie.";
    case "circulaire": {
      const c = e as ExerciceCirculaire;
      return `Calcule le pourcentage de la part « ${c.secteurs[c.inconnu!]!.nom} », puis l'effectif de chaque catégorie.`;
    }
    case "batons":
      return `À l'aide du diagramme, détermine l'effectif de chaque valeur et l'effectif total. ${questionGroupe(e)}`;
    default:
      return "";
  }
}

function enoncePapier(e: ExerciceDiagrammesTrompeurs): EnoncePapier {
  const section: SectionExercice = { enteteFragments: [], enteteHtml: enteteHtml(e), questions: [] };
  if (estTrompeur(e)) {
    const nature = e.sousType === "total-faux" ? "diagramme" : "graphique";
    section.questions = [
      { consigne: [texte(`Explique en quoi ce ${nature} est trompeur.`)] },
      { consigne: [texte(e.sousType === "total-faux" ? questionReponses(e) : `${questionEvolution(e)} Lis les valeurs utiles sur l'axe vertical.`)] },
    ];
    return { section, etapesParQuestion: [["a"], ["b", "c"]], reponseBreve: reponseBreveTrompeur(e, true) };
  }
  const n = ecransExercice(e).length;
  section.questions = [{ consigne: [texte(consignePapier(e))] }];
  return { section, etapesParQuestion: [LETTRES.slice(0, n)] };
}

function reponseBreveTrompeur(e: ExerciceTrompeurBarres | ExerciceTrompeurCirculaire, lettres: boolean): FragmentConsigne[] {
  const a = lettres ? "a) " : "";
  const b = lettres ? " ; b) " : " ; ";
  if (e.sousType === "total-faux") return [texte(`${a}${NOMS_MANIPULATIONS[e.sousType]} (total ${nb(sommeParts(e))} %)${b}${nb(totalReponses(e))} réponses`)];
  return [texte(`${a}${NOMS_MANIPULATIONS[e.sousType]}${b}évolution réelle : +${nb(evolutionReelle(e))} % (et non +${nb(evolutionAffichee(e))} %)`)];
}

function reponseBreve(e: ExerciceDiagrammesTrompeurs): FragmentConsigne[] {
  switch (e.sousType) {
    case "direct": {
      const c = e as ExerciceCirculaire;
      return [texte(c.secteurs.map((s, i) => `${s.nom} : ${nb(pourcentageSecteur(c, i))} % (${nb(angleSecteur(c, i))}°)`).join(" ; "))];
    }
    case "inverse": {
      const c = e as ExerciceCirculaire;
      return [texte(c.secteurs.map((s, i) => `${s.nom} : ${nb(pourcentageSecteur(c, i))} % (${nb(s.effectif)})`).join(" ; "))];
    }
    case "circulaire": {
      const c = e as ExerciceCirculaire;
      return [texte(`Part « ${c.secteurs[c.inconnu!]!.nom} » : ${nb(pourcentageSecteur(c, c.inconnu!))} % ; effectifs : ${c.secteurs.map((s) => `${s.nom} ${nb(s.effectif)}`).join(", ")}`)];
    }
    case "batons":
      return [texte(`n = ${nb(totalBatons(e))} ; ${nb(pourcentageGroupe(e))} %`)];
    default:
      return reponseBreveTrompeur(e as ExerciceTrompeurBarres | ExerciceTrompeurCirculaire, false);
  }
}

/** Méthode d'un écran à champs : la première aide (phrase + formule), la même qu'à l'écran. */
function methode(ec: EcranChamps): FragmentConsigne[] {
  return ec.aides[0]!;
}

function correctionDetaillee(e: ExerciceDiagrammesTrompeurs): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  ecransExercice(e).forEach((ec, k) => {
    const lettre = LETTRES[k]!;
    if (ec.genre === "choix") {
      etapes.push({ label: "Constat", sousQuestion: lettre, fragments: explicationManipulation(e as ExerciceTrompeurBarres | ExerciceTrompeurCirculaire) });
      etapes.push({ label: "Conclusion", sousQuestion: lettre, fragments: [texte(`La manipulation : ${NOMS_MANIPULATIONS[ec.attendue]}.`)] });
      return;
    }
    if (e.sousType === "batons" && k === 0) {
      etapes.push({ label: "Lecture", sousQuestion: lettre, fragments: [texte(`Effectifs lus : ${e.valeurs.map((v) => `${nb(v.x)} → ${v.effectif}`).join(" ; ")}.`)], figureHtml: figureBatonsSvg(e, "corrige") });
      return;
    }
    const lecture = estTrompeur(e) && k === 1 && e.sousType !== "total-faux";
    if (!lecture && ec.champs.length > 0 && !(e.sousType === "batons" && k === 1)) etapes.push({ label: "Méthode", sousQuestion: lettre, fragments: methode(ec) });
    ec.champs.forEach((_, i) => {
      etapes.push({ label: lecture ? "Lecture" : "Calcul", sousQuestion: lettre, fragments: calculChamp(e, k, i) });
    });
  });
  if (e.sousType === "direct") {
    etapes.push({
      label: "Construction",
      sousQuestion: "b",
      fragments: [texte("Au rapporteur, un secteur par catégorie, d'angle calculé ci-dessus ; on vérifie que les angles totalisent 360°.")],
      figureHtml: figureCirculaireSvg(e as ExerciceCirculaire, "corrige"),
    });
  }
  etapes.push({ label: "Piège", sousQuestion: LETTRES[ecransExercice(e).length - 1], fragments: piege(e) });
  return etapes;
}

function construireCorrection(e: ExerciceDiagrammesTrompeurs): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: ExerciceDiagrammesTrompeurs): BaremeExercice {
  const c = (sousQuestion: string, critere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(critere)], points });
  const err = (description: string, cout: string): ErreurFrequente => ({ description: [texte(description)], cout });
  let criteres: CritereBareme[];
  let erreurs: ErreurFrequente[];
  switch (e.sousType) {
    case "direct":
      criteres = [c("a", "Fréquences correctes (total 100 %)", 1.5), c("b", "Angles corrects (total 360°)", 1.5), c("b", "Diagramme construit avec les bons angles", 1)];
      erreurs = [err("Angle pris égal à la fréquence (25 % → 25°)", "0 pt sur b)"), err("Secteurs tracés à vue, sans rapporteur", "moitié des points de la construction")];
      break;
    case "inverse":
      criteres = [c("a", "Fréquences correctes (angle ÷ 360 × 100)", 2), c("b", "Effectifs corrects (fréquence × effectif total)", 2)];
      erreurs = [err("Angle divisé par 100 au lieu de 360", "0 pt sur a)"), err("Pourcentage appliqué sans être divisé par 100", "moitié des points de b)")];
      break;
    case "circulaire":
      criteres = [c("a", "Pourcentage effacé (100 − somme des autres)", 1.5), c("b", "Effectifs corrects", 2.5)];
      erreurs = [err("Pourcentage effacé deviné à l'œil sans calcul", "0 pt sur a)"), err("Effectifs non contrôlés (leur total ≠ effectif total)", "−0,5")];
      break;
    case "batons":
      criteres = [c("a", "Effectifs lus correctement", 1), c("b", "Effectif total", 1), c("c", "Pourcentage du groupe (bonnes valeurs incluses)", 2)];
      erreurs = [err("Valeur seuil incluse ou exclue à tort", "moitié des points de c)"), err("Pourcentage calculé sur un effectif total faux", "−1")];
      break;
    case "total-faux":
      criteres = [c("a", "Manipulation identifiée et expliquée", 1.5), c("b", "Somme des pourcentages", 1), c("c", "Nombre total de réponses", 1.5)];
      erreurs = [err("« Le diagramme est faux » sans dire pourquoi", "moitié des points de a)"), err("Nombre de réponses confondu avec le nombre de personnes", "0 pt sur c)")];
      break;
    default:
      criteres = [c("a", "Manipulation identifiée et expliquée", 1.5), c("b", "Vraies valeurs lues sur l'axe", 1), c("c", "Évolution réelle en %", 1.5)];
      erreurs = [
        err("Valeurs obtenues en comptant les carreaux depuis le bas", "0 pt sur b)"),
        err("Évolution calculée par rapport à la valeur d'arrivée", "moitié des points de c)"),
        err("Slogan recopié sans calcul", "0 pt sur c)"),
      ];
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [[texte("Pourcentages avec ou sans le signe % ; valeurs exactes uniquement (aucun arrondi n'est nécessaire).")]],
  };
}

function difficulte(e: ExerciceDiagrammesTrompeurs): 1 | 2 | 3 {
  if (e.variante === "trompeur") return 3;
  return e.sousType === "circulaire" ? 1 : 2;
}

export const adaptateurEvaluationDiagrammesTrompeurs: AdaptateurFeuilleExercices<ExerciceDiagrammesTrompeurs> = {
  profilInstance: profilDiagrammesTrompeurs,
  titreDocument: "Diagrammes et graphiques trompeurs — Évaluation",
  nomFichierBase: "diagrammes-graphiques-trompeurs",
  genererInstance: genererExerciceDiagrammesTrompeurs,
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
};
