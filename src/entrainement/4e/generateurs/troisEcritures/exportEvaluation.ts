import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, ErreurFrequente, FragmentConsigne, SectionExercice } from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import type { ExerciceTroisEcritures } from "../../core/troisEcritures.types";
import { canoniqueDe, consigneGlobale, developpeeLatex, ecrans, enonceFragments, factoriseeDe, reponseBreveFragments } from "../../ui/formatTroisEcritures";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceTroisEcritures, zeros } from "./index";
import { profilTroisEcritures } from "./profil";
import { correctionDetailleeTroisEcritures } from "./corrigeDetaille";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen126 « Trois écritures d'une parabole ».
 * Énoncé papier = la fonction donnée + la consigne globale (les écrans sont des étapes
 * d'apprentissage : ils vont dans le corrigé, « Étape n — consigne »). Textes, réponses et corrigé
 * viennent des MÊMES fonctions que l'appli (`ui/formatTroisEcritures.ts`, `corrigeDetaille.ts`).
 */

type E = ExerciceTroisEcritures;

const LETTRES = "abc";

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enonceFragments(e), questions: ecrans(e).map((ec) => ({ consigne: ec.consigne })) };
}

function enoncePapier(e: E): EnoncePapier {
  const n = ecrans(e).length;
  return {
    section: { enteteFragments: enonceFragments(e), questions: [{ consigne: [texte(consigneGlobale(e))] }] },
    etapesParQuestion: [LETTRES.slice(0, n).split("")],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return reponseBreveFragments(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return [{ type: "paragraphe", fragments: reponseBreve(e) }];
}

function bareme(e: E): BaremeExercice {
  const z = zeros(e);
  if (e.variante === "depuisCanonique") {
    const criteres =
      z.length === 2
        ? [
            { sousQuestion: "a", critere: [texte("Forme développée juste (carré développé avec le double produit, a distribué, réduite)")], points: 1.5 },
            { sousQuestion: "b", critere: [texte("Zéros trouvés sur la forme canonique (carré isolé, deux racines carrées opposées)")], points: 1.5 },
            { sousQuestion: "c", critere: [texte("Forme factorisée avec a et les deux facteurs (x − x₁), (x − x₂)")], points: 1 },
          ]
        : [
            { sousQuestion: "a", critere: [texte("Forme développée juste (carré développé avec le double produit, a distribué, réduite)")], points: 1.5 },
            { sousQuestion: "b", critere: [texte("Carré isolé égal à un nombre négatif : aucun zéro, donc pas de forme factorisée (justifié)")], points: 2.5 },
          ];
    const erreurs: ErreurFrequente[] = [
      { description: [texte("Carré développé sans le double produit ("), latex("(x-p)^2=x^2-p^2"), texte(" ou "), latex("x^2+p^2"), texte(")")], cout: "0 pt sur a)" },
      { description: [texte("a non multiplié par le terme constant du carré")], cout: "−0,5" },
      z.length === 2
        ? { description: [texte("Une seule racine carrée gardée, ou "), latex("x_S"), texte(" oublié (valeurs de "), latex("x-x_S"), texte(" données comme zéros)")], cout: "moitié des points de b)" }
        : { description: [texte("Racine carrée d'un nombre négatif « calculée », ou conclusion sans justification")], cout: "0 pt sur b)" },
    ];
    if (z.length === 2) erreurs.push({ description: [texte("Facteurs (x + r) au lieu de (x − r), ou a oublié devant le produit")], cout: "0 pt sur c)" });
    return {
      reponseFinale: reponseBreve(e),
      criteres,
      erreursFrequentes: erreurs,
      reponsesAcceptees: [[texte("Toute écriture équivalente de la forme demandée (termes dans un autre ordre, facteurs échangés, constante devant ou derrière)")]],
    };
  }
  if (e.variante === "depuisDeveloppee") {
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [texte("a mis en évidence sur les termes en x² et en x (coefficient de x divisé par a)")], points: 1 },
        { sousQuestion: "b", critere: [texte("Carré complété et a redistribué : forme canonique juste")], points: 2 },
        { sousQuestion: "c", critere: [texte("Sommet lu avec les bons signes")], points: 1 },
      ],
      erreursFrequentes: [
        { description: [texte("Nombre sorti du crochet non multiplié par a (ajouté tel quel à c)")], cout: "moitié des points de b)" },
        { description: [texte("Sommet lu avec le mauvais signe pour x_S ("), latex("(x+p)^2"), texte(" lu "), latex("x_S=p"), texte(")")], cout: "0 pt sur c)" },
        { description: [texte("c mis dans la parenthèse avec les termes en x")], cout: "0 pt sur a)" },
      ],
      reponsesAcceptees: [[texte("Toute écriture équivalente de la forme canonique (constante devant le carré, a écrit en dernier facteur…)")], [texte("Sommet trouvé par "), latex("x_S=-\\dfrac{b}{2a}"), texte(" puis "), latex("y_S=f(x_S)"), texte(", s'il est juste")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Forme développée juste (double distributivité, a distribué, réduite)")], points: 1.5 },
      { sousQuestion: "b", critere: [texte("Sommet : milieu des zéros, puis image")], points: 1.5 },
      { sousQuestion: "c", critere: [texte("Forme canonique avec a et le sommet")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [texte("Zéros lus avec le mauvais signe (milieu de −x₁ et −x₂)")], cout: "moitié des points de b)" },
      { description: [texte("a oublié sur certains termes du développement")], cout: "−0,5" },
      { description: [texte("Signe dans la parenthèse de la forme canonique")], cout: "0 pt sur c)" },
    ],
    reponsesAcceptees: [[texte("Sommet trouvé par "), latex("x_S=-\\dfrac{b}{2a}"), texte(" sur la forme développée, s'il est juste")]],
  };
}

/** Niveau (grille commune). `depuisCanonique` : CONSTANT (3 étapes, méthode 1, sans charge) — le
 * verdict « aucun zéro » retire l'écran de la forme factorisée, et le niveau imprimé sur la feuille
 * ne doit pas le trahir. `depuisDeveloppee` : le sommet est une lecture sur la forme canonique ;
 * méthode imposée (0) ; piège dans les données si a < 0 (signe à gérer en mettant a en évidence).
 * `depuisFactorisee` : méthode 1 (sommet par le milieu des zéros ou par la forme développée). */
function criteresDifficulte(e: E): CriteresDifficulte {
  if (e.variante === "depuisCanonique") return { etapesTransformation: 3, etapesLecture: 0, sansCharge: true, methode: 1, piege: 0, nombres: 0 };
  if (e.variante === "depuisDeveloppee") return { ...etapesDuCorrige(correctionDetailleeTroisEcritures(e), ["c"]), methode: 0, piege: e.a < 0 ? 1 : 0, nombres: 0 };
  return { ...etapesDuCorrige(correctionDetailleeTroisEcritures(e)), methode: 1, piege: 0, nombres: 0 };
}

export const adaptateurEvaluationTroisEcritures: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilTroisEcritures,
  titreDocument: "Trois écritures d'une parabole — Évaluation",
  nomFichierBase: "trois-ecritures-parabole",
  genererInstance: genererExerciceTroisEcritures,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeTroisEcritures,
  bareme,
  enoncePapier,
};

export { canoniqueDe, developpeeLatex, factoriseeDe };
