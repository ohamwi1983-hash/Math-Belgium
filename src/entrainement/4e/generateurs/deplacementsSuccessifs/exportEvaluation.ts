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
import { correctionDetailleeDeplacementsSuccessifs } from "./corrigeDetaille";
import { fragmentsVersHtml } from "../../../export/genererFeuilleExercicesHtml";
import type { ExerciceDeplacementsSuccessifs } from "../../core/deplacementsSuccessifs.types";
import {
  estDiagonale,
  lettreEcran,
  total,
  vecteurCible,
  vecteurRetour,
  vecteursDeplacements,
} from "../../moteur/modeleDeplacementsSuccessifs";
import {
  colonneLatex,
  consignesEcrans,
  introFragments,
  listeInstructions,
  questionsPapier,
  repereFragments,
  reponseDistanceFragments,
  suiteFragments,
  vecteurTotalLatex,
} from "../../ui/formatDeplacementsSuccessifs";
import { construireFigureDeplacements } from "../../ui/figureDeplacementsSuccessifs";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceDeplacementsSuccessifs } from "./index";
import { LIBELLE_CAS_DEPLACEMENTS_SUCCESSIFS, profilDeplacementsSuccessifs } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen86. Énoncé papier = situation, liste des
 * instructions, repère, carte (sans le trajet) + les VRAIES questions distinctes : a) position
 * d'arrivée, b) distance ou dernier déplacement ou nombre de grands pas, c) retour ou distance. La
 * traduction des instructions (écran 1) devient la première étape du corrigé ; la carte avec le
 * trajet et les vecteurs va dans le corrigé (`figureHtml`).
 */

function enteteHtml(e: ExerciceDeplacementsSuccessifs): string {
  const items = listeInstructions(e)
    .map((f) => `<li>${fragmentsVersHtml(f)}</li>`)
    .join("");
  return (
    `<ul class="paragraphe" style="list-style:none;padding-left:0">${items}</ul>` +
    `<p class="paragraphe">${fragmentsVersHtml(suiteFragments(e))}</p>` +
    `<p class="paragraphe">${fragmentsVersHtml(repereFragments(e))}</p>` +
    construireFigureDeplacements(e, { theme: "papier" })
  );
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: ExerciceDeplacementsSuccessifs): SectionExercice {
  return {
    enteteFragments: introFragments(e),
    enteteHtml: enteteHtml(e),
    questions: consignesEcrans(e).map((consigne) => ({ consigne })),
  };
}

function enoncePapier(e: ExerciceDeplacementsSuccessifs): EnoncePapier {
  const { consignes, etapes } = questionsPapier(e);
  return {
    section: { enteteFragments: introFragments(e), enteteHtml: enteteHtml(e), questions: consignes.map((consigne) => ({ consigne })) },
    etapesParQuestion: etapes,
    reponseBreve: reponseBreve(e),
  };
}

function totalFragments(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  return [latex(`${vecteurTotalLatex(e)} = ${colonneLatex(total(e))}`)];
}

function reponseBreve(e: ExerciceDeplacementsSuccessifs): FragmentConsigne[] {
  const a = [texte("a) "), ...totalFragments(e)];
  if (e.question === "retour") return [...a, texte(" ; b) "), ...reponseDistanceFragments(e), texte(" ; c) "), latex(`\\vec{AD} = ${colonneLatex(vecteurRetour(e))}`)];
  if (e.question === "dernier") return [...a, texte(" ; b) "), latex(`\\vec{PC} = ${colonneLatex(vecteurCible(e))}`), texte(" ; c) "), ...reponseDistanceFragments(e)];
  return [...a, texte(" ; b) "), latex(`k = ${e.k}`), texte(" ; c) "), ...reponseDistanceFragments(e)];
}

// ---------------------------------------------------------------------------------------------
// Corrigé détaillé (une lettre par écran)
// ---------------------------------------------------------------------------------------------

function correctionDetaillee(e: ExerciceDeplacementsSuccessifs): EtapeCorrection[] {
  return correctionDetailleeDeplacementsSuccessifs(e);
}

function criteresDifficulte(e: ExerciceDeplacementsSuccessifs): CriteresDifficulte {
  // Traduction des instructions : lecture. Méthode 1 (modéliser chaque instruction par un vecteur, repère donné) ; piège : un pas en diagonale (deux composantes à la fois). Nombres : détectés (arrondi demandé).
  return { ...etapesDuCorrige(correctionDetailleeDeplacementsSuccessifs(e), [lettreEcran(e, "traduire")]), methode: 1, piege: e.deplacements.some((d) => estDiagonale(d.direction)) ? 1 : 0 };
}

function construireCorrection(e: ExerciceDeplacementsSuccessifs): BlocCorrection[] {
  return correctionDetaillee(e)
    .filter((etape) => etape.type === "resultat")
    .map((etape) => ({ type: "paragraphe", fragments: [texte(`${etape.sousQuestion}) `), ...etape.fragments] }));
}

function bareme(e: ExerciceDeplacementsSuccessifs): BaremeExercice {
  const negatif = vecteursDeplacements(e).some((v) => v.x < 0 || v.y < 0);
  const erreurs: ErreurFrequente[] = [];
  if (negatif) erreurs.push({ description: [texte("Déplacement vers l'ouest ou le sud traduit par une composante positive")], cout: "0,25 pt par vecteur faux ; pas de double sanction sur la suite" });
  erreurs.push({
    description: [texte(e.question === "retour" ? "Distance parcourue (somme des longueurs des étapes) donnée au lieu de la distance à vol d'oiseau" : "Somme des composantes (chemin case par case) donnée au lieu de la distance à vol d'oiseau")],
    cout: "0 pt sur la distance",
  });
  erreurs.push({ description: [texte("Racine carrée oubliée (carré de la distance donné comme distance)")], cout: "moitié des points de la distance" });
  if (e.precision === "exacte") erreurs.push({ description: [texte("Valeur approchée donnée alors que la valeur exacte est demandée")], cout: "−0,5 pt" });
  else erreurs.push({ description: [texte("Arrondi absent ou faux")], cout: "−0,25 pt" });
  if (e.question === "retour") erreurs.push({ description: [texte("Vecteur de retour avec le mauvais signe (le vecteur total recopié)")], cout: "0 pt sur le retour" });
  if (e.question === "dernier") erreurs.push({ description: [texte("Dernier déplacement calculé à l'envers (P moins C) ou coordonnées de C recopiées")], cout: "0 pt sur le dernier déplacement" });

  const lt = lettreEcran(e, "traduire");
  const lT = lettreEcran(e, "total");
  const lD = lettreEcran(e, "distance");
  const criteres =
    e.question === "retour"
      ? [
          { sousQuestion: lt, critere: [texte("Chaque instruction traduite en vecteur (signes compris)")], points: 1 },
          { sousQuestion: lT, critere: [texte("Déplacement total par Chasles (somme des composantes)")], points: 1 },
          { sousQuestion: lD, critere: [texte("Distance à vol d'oiseau : norme du déplacement total, précision demandée, unité")], points: 1.5 },
          { sousQuestion: lettreEcran(e, "retour"), critere: [texte("Vecteur de retour : opposé du déplacement total")], points: 0.5 },
        ]
      : e.question === "dernier"
        ? [
            { sousQuestion: lt, critere: [texte("Chaque instruction traduite en vecteur (signes compris)")], points: 1 },
            { sousQuestion: lT, critere: [texte("Position de P par Chasles (somme des composantes)")], points: 0.75 },
            { sousQuestion: lettreEcran(e, "cible"), critere: [texte("Dernier déplacement : coordonnées de C moins celles de P")], points: 1 },
            { sousQuestion: lD, critere: [texte("Longueur du dernier trajet : norme, précision demandée, unité")], points: 1.25 },
          ]
        : [
            { sousQuestion: lt, critere: [texte("Chaque instruction traduite en vecteur (signes compris)")], points: 0.75 },
            { sousQuestion: lT, critere: [texte("Position du rocher par Chasles")], points: 0.75 },
            { sousQuestion: lettreEcran(e, "cible"), critere: [texte("Vecteur du rocher au trésor")], points: 0.75 },
            { sousQuestion: lettreEcran(e, "k"), critere: [texte("Nombre de grands pas, vérifié sur les deux composantes")], points: 0.75 },
            { sousQuestion: lD, critere: [texte("Distance rocher–trésor : norme, précision demandée, unité")], points: 1 },
          ];
  return {
    reponseFinale: reponseBreve(e),
    criteres,
    erreursFrequentes: erreurs,
    reponsesAcceptees: [
      [texte("Valeur exacte sous une forme équivalente (racine non simplifiée ou simplifiée)")],
      [texte("Résultat juste à partir d'un vecteur faux à l'étape précédente : points de méthode accordés (pas de double sanction)")],
    ],
  };
}

export const adaptateurEvaluationDeplacementsSuccessifs: AdaptateurFeuilleExercices<ExerciceDeplacementsSuccessifs> = {
  profilInstance: profilDeplacementsSuccessifs,
  libelleCasParticulier: LIBELLE_CAS_DEPLACEMENTS_SUCCESSIFS,
  titreDocument: "Carte au trésor et randonnée : déplacements successifs — Évaluation",
  nomFichierBase: "deplacements-successifs",
  genererInstance: genererExerciceDeplacementsSuccessifs,
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
