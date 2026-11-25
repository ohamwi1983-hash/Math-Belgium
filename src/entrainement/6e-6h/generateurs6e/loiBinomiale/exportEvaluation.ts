import type { ExerciceLoiBinomiale } from "../../core6e/loiBinomiale.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN50 } from "../../ui6e/formatLoiBinomiale";
import { phasesPourExercice } from "../../moteur6e/typesLoiBinomiale";
import type { PhaseLoiBinomiale } from "../../moteur6e/typesLoiBinomiale";
import { esperanceEtVariance } from "../../moteur6e/verificationLoiBinomiale";
import { decimalExact } from "../../ui6e/corrigeCombinatoire";
import { BIN, dl, frag } from "../../ui6e/corrigeVariablesAleatoires";
import { fractionLatex } from "../../ui6e/fragmentsCombinatoire";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { LIBELLES_CONDITION } from "./contextes";
import { correctionDetailleeLoiBinomiale, pLatexA, phasesPapierLoiBinomiale, suiteSigma } from "./corrigeDetaille";
import { loiBinomialeExacte } from "./familleB";
import { uniteC } from "./familleC";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceLoiBinomiale } from "./index";

/**
 * Adaptateur papier de `6gen50` (loi binomiale, 6e ch. 8, § 2) — refonte du lot E de l'audit :
 * situation en prose + consigne globale ; les écrans deviennent les étapes du corrigé (l'écran
 * « diagramme », propre à l'appli, n'est pas imprimé). A : « X suit-elle une loi binomiale ? Justifie »
 * (les conditions sont justifiées dans le corrigé, plus jamais « les 4 conditions suivantes » absentes) ;
 * B : loi complète, E, V, σ (σ exacte ou arrondie : faisable sans calculatrice) ; C : plus petit n.
 *
 * Profil (règle du 24/11, Casio Graph Math+) : aucune réponse donnée directement par la calculatrice —
 * reconnaître le schéma (A), construire la loi puis E, V, σ (B), modéliser et résoudre l'inéquation (C) :
 * pas de `exacte`. C exige le logarithme → `calcul: 'calculatrice'` et `calculatriceIndispensable`.
 * Aucun cas particulier (les variantes « aucun / tous succès » sont retirées, décision 3 : 6gen48) ; le
 * verdict de A n'est jamais dans le profil ; niveau et durée constants pour les deux verdicts.
 */

type E = ExerciceLoiBinomiale;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function dec(x: { n: bigint; d: bigint }): string {
  return decimalExact(x)?.latex ?? fractionLatex(x);
}

export function situationPapier50(e: E): FragmentConsigne[] {
  if (e.famille === "A") return frag(e.texte);
  if (e.famille === "B") return [...frag(e.texte), t(" On admet que "), l("X"), t(" suit une loi binomiale.")];
  return [...frag(e.texte), t(` Combien de ${uniteC(e)} faut-il au minimum pour que la probabilité qu'${e.evenement} dépasse `), l(dl(e.seuil)), t(" ?")];
}

export const CONSIGNE_A_50 = "La variable $X$ suit-elle une loi binomiale ? Justifie. Si oui, donne ses paramètres $n$ et $p$ ; sinon, indique la condition qui n'est pas respectée.";
export const CONSIGNE_B_50 = "Détermine la loi de $X$ (probabilités en valeur exacte), puis calcule $E(X)$, $V(X)$ et l'écart-type $\\sigma(X)$ (valeur exacte ou arrondie au centième).";
export const CONSIGNE_C_50 = "Réponds en justifiant par un calcul.";

function questions(e: E): { consigne: FragmentConsigne[]; etapes: string[] }[] {
  const consigne = e.famille === "A" ? CONSIGNE_A_50 : e.famille === "B" ? CONSIGNE_B_50 : CONSIGNE_C_50;
  return [{ consigne: frag(consigne), etapes: lettresEcrans(phasesPapierLoiBinomiale, e) }];
}

/** Condition non respectée, X en KaTeX. */
function conditionTexte(e: E & { famille: "A" }): string {
  const c = LIBELLES_CONDITION[e.condition ?? "nombre"];
  return c.startsWith("X ") ? c.replace(/^X /, "$X$ ") : c[0].toLowerCase() + c.slice(1);
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.famille === "A") return e.binomiale ? [t("Oui : "), l(`X\\sim${BIN(e.n, pLatexA(e))}`)] : frag(`Non : ${conditionTexte(e)}`);
  if (e.famille === "B") {
    const { E: esp, V } = esperanceEtVariance(e.n, e.p);
    return [
      t("Loi : "),
      // Un fragment par valeur : la liste passe à la ligne entre deux termes (« Je vérifie », grille).
      ...loiBinomialeExacte(e.n, e.p).flatMap((r, k) => [...(k > 0 ? [t(" ; ")] : []), l(`P(X=${k})=${dec(r)}`)]),
      t(" ; "),
      l(`E(X)=${dl(esp)}`),
      t(", "),
      l(`V(X)=${dl(V)}`),
      t(", "),
      l(`\\sigma(X)=\\sqrt{${dl(V)}}${suiteSigma(V)}`),
    ];
  }
  return [l(`n=${e.valeurN}`), t(` ${uniteC(e)}`)];
}

function criteres(e: E): CriteresDifficulte {
  // A : reconnaître le schéma de Bernoulli parmi les modèles du cours (méthode 1) ; deux étapes, sans
  // charge, pour les DEUX verdicts (le niveau imprimé ne trahit pas la réponse). B : la loi est donnée
  // (« on admet »), formules imposées (méthode 0). C : modéliser « au moins un » puis le logarithme
  // (méthode 1), valeur approchée (nombres 1).
  const base = etapesDuCorrige(correctionDetailleeLoiBinomiale(e), []);
  if (e.famille === "A") return { ...base, methode: 1, piege: 0, nombres: 0, sansCharge: true };
  if (e.famille === "B") return { ...base, methode: 0, piege: 0 };
  return { ...base, methode: 1, piege: 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  if (e.famille === "A")
    return {
      reponseFinale: reponseBreve(e),
      criteres: e.binomiale
        ? [
            { sousQuestion: "a", critere: frag("Conditions vérifiées sur la situation (nombre d'épreuves fixé, indépendance, deux issues, $X$ compte les succès)"), points: 2.5 },
            { sousQuestion: "b", critere: [t("Paramètres : "), l(`n=${e.n}`), t(", "), l(`p=${pLatexA(e)}`)], points: 1.5 },
          ]
        : [
            { sousQuestion: "a", critere: [t("Conclusion « pas une loi binomiale », justifiée sur la situation")], points: 2.5 },
            { sousQuestion: "b", critere: frag(`Condition non respectée : ${conditionTexte(e)}`), points: 1.5 },
          ],
      erreursFrequentes: [{ description: [t("Verdict donné sans aucune justification sur la situation")], cout: "moitié des points de l'étape 1" }],
      reponsesAcceptees: [[t("Une justification équivalente de chaque condition, avec les mots de la situation")]],
    };
  if (e.famille === "B") {
    const { E: esp, V } = esperanceEtVariance(e.n, e.p);
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Loi : chaque "), l("P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}"), t(" calculé, somme 1")], points: 2 },
        { sousQuestion: "b", critere: [l(`E(X)=${dl(esp)}`), t(" et "), l(`V(X)=${dl(V)}`)], points: 1 },
        { sousQuestion: "c", critere: [l(`\\sigma(X)=\\sqrt{${dl(V)}}${suiteSigma(V)}`)], points: 1 },
      ],
      erreursFrequentes: [
        { description: [t("Coefficient "), l("C_n^k"), t(" oublié")], cout: "moitié des points de l'étape 1" },
        { description: [l("V(X)=n\\,p"), t(" (facteur "), l("1-p"), t(" oublié)")], cout: "moitié des points de l'étape 2" },
        { description: [t("Variance donnée pour l'écart-type")], cout: "0 pt sur l'étape 3" },
      ],
      reponsesAcceptees: [[t("Probabilités en décimal exact ou en fraction ; "), l(`\\sqrt{${dl(V)}}`), t(" ou un arrondi correct au centième")]],
    };
  }
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Inéquation : "), l(`1-${dl(1 - e.p)}^{n}>${dl(e.seuil)}`)], points: 1 },
      { sousQuestion: "b", critere: [t("Résolution par le logarithme, sens changé (division par un logarithme négatif)")], points: 2 },
      { sousQuestion: "c", critere: [t("Plus petit entier : "), l(`n=${e.valeurN}`)], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t("Sens de l'inégalité gardé après la division par "), l(`\\ln(${dl(1 - e.p)})`)], cout: "1 pt sur l'étape 2" },
      { description: [t("Entier précédent donné (arrondi au plus proche)")], cout: "0 pt sur l'étape 3" },
    ],
    reponsesAcceptees: [[t("Une recherche par essais à la calculatrice, si les deux entiers voisins sont contrôlés")]],
  };
}

export function profilLoiBinomiale(e: E): ProfilInstance {
  return e.famille === "C" ? { casParticulier: null, calcul: "calculatrice" } : { casParticulier: null };
}

export const adaptateurEvaluationLoiBinomiale: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseLoiBinomiale>({
  titreDocument: "Loi binomiale — Évaluation",
  nomFichierBase: "loi-binomiale",
  genererInstance: genererExerciceLoiBinomiale,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN50,
  phases: phasesPourExercice,
  phasesPapier: phasesPapierLoiBinomiale,
  situation: situationPapier50,
  questions,
  reponseBreve,
  correction: correctionDetailleeLoiBinomiale,
  bareme,
  criteres,
  profil: profilLoiBinomiale,
  calculatriceIndispensable: ["C_trouverN"],
});
