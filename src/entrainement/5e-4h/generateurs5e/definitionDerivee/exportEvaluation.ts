import type { ExerciceDefinitionDerivee } from "../../core5e/definitionDerivee.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  CritereBareme,
  EnoncePapier,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import { consigneGenerale, formatFDeXLatex, formatReponseAttendueEcranLatex, nombreTexte, questionSpecifiqueEcran, texteAideNiveau1 } from "../../ui5e/formatDefinitionDerivee";
import { ordreEcrans, type EcranDefinitionDerivee } from "../../moteur5e/typesDefinitionDerivee";
import { CATALOGUE_FAMILLES, construireAvecFamilleId, genererExerciceDefinitionDerivee } from "./index";
import { LIBELLE_CAS_DEFINITION_DERIVEE, profilDefinitionDerivee } from "../profilsEvaluationDerivees25-27";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceDefinitionDerivee>` pour 5gen26 (Calculer f'(a)
 * par la définition) — feuille d'exercices et évaluation (méthode : `.claude/rules/feuilles-evaluations.md`).
 *
 * Énoncé papier = la fonction et la consigne globale « Calcule le nombre dérivé f'(a) à partir de sa
 * définition en termes de limite » (`consigneGenerale`, a substitué). Les écrans du générateur
 * (`ordreEcrans` : développer / taux d'accroissement simplifié / limite — 2 seulement pour une
 * fonction affine, sans écran « taux ») passent dans le corrigé « Étape n — consigne », avec la
 * consigne de l'écran (`questionSpecifiqueEcran`).
 *
 * Valeurs : `formatReponseAttendueEcranLatex` (réponses attendues de l'écran, a substitué) et
 * `texteAideNiveau1` (méthodes) — jamais recalculées ici.
 *
 * `regroupable` : non — la consigne contient la valeur de a tirée.
 */

const LETTRES = "abcdefgh";

function fonctionLatex(exercice: ExerciceDefinitionDerivee): string {
  return formatFDeXLatex(exercice);
}

function entete(exercice: ExerciceDefinitionDerivee): FragmentConsigne[] {
  return [texte("On considère la fonction "), latex(fonctionLatex(exercice)), texte(".")];
}

function consigneEtape(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): FragmentConsigne[] {
  const q = questionSpecifiqueEcran(exercice, ecran);
  return [texte(q.texteAvant), ...(q.latex ? [texte(" "), latex(q.latex)] : []), ...(q.texteApres ? [texte(/^[.,;:]/.test(q.texteApres) ? q.texteApres : ` ${q.texteApres}`)] : [])];
}

function construireEnonceDefinitionDerivee(exercice: ExerciceDefinitionDerivee): SectionExercice {
  return { enteteFragments: entete(exercice), questions: ordreEcrans(exercice).map((ecran) => ({ consigne: consigneEtape(exercice, ecran) })) };
}

function enoncePapierDefinitionDerivee(exercice: ExerciceDefinitionDerivee): EnoncePapier {
  return { section: { enteteFragments: [...entete(exercice), texte(` ${consigneGenerale(exercice)}`)], questions: [] } };
}

function lettre(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): string {
  return LETTRES[ordreEcrans(exercice).indexOf(ecran)] ?? "a";
}

function valeurFinaleLatex(exercice: ExerciceDefinitionDerivee): string {
  return formatReponseAttendueEcranLatex(exercice, "limite")[0];
}

function reponseBreveDefinitionDerivee(exercice: ExerciceDefinitionDerivee): FragmentConsigne[] {
  return [latex(valeurFinaleLatex(exercice))];
}

function methode(exercice: ExerciceDefinitionDerivee, ecran: EcranDefinitionDerivee): FragmentConsigne[] {
  const aide = texteAideNiveau1(exercice, ecran);
  // Le piège de l'aide a sa propre ligne « Piège » : seule la méthode reste ici.
  const coupe = aide.texte.indexOf(" Piège :");
  const methodeSeule = coupe === -1 ? aide.texte : `${aide.texte.slice(0, coupe).replace(/\.$/, "")}${aide.latex ? " :" : "."}`;
  return [texte(methodeSeule), ...(aide.latex ? [texte(" "), latex(aide.latex)] : [])];
}

function piege(exercice: ExerciceDefinitionDerivee): EtapeCorrection {
  const a = nombreTexte(exercice.a);
  switch (exercice.famille) {
    case "affine":
      return { label: "Piège", sousQuestion: lettre(exercice, "limite"), fragments: [texte(`Le terme constant disparaît dans f(${a} + h) − f(${a}) : ne l'ajoute pas au résultat, f'(${a}) vaut le coefficient de x.`)] };
    case "quadratique":
      return { label: "Piège", sousQuestion: "a", fragments: [texte(`En développant le carré de ${a} + h, ne pas oublier le terme croisé (le double produit) ni le signe du coefficient de x².`)] };
    default:
      return {
        label: "Piège",
        sousQuestion: lettre(exercice, "quotient"),
        fragments: [texte(`Mets f(${a} + h) − f(${a}) au même dénominateur avant de diviser par h : sinon le facteur h ne peut pas se simplifier.`)],
      };
  }
}

function correctionDetailleeDefinitionDerivee(exercice: ExerciceDefinitionDerivee): EtapeCorrection[] {
  const a = exercice.a;
  const lignes: EtapeCorrection[] = [
    {
      label: "Définition",
      sousQuestion: "a",
      fragments: [latex(`f'(${a})=\\displaystyle\\lim_{h\\to 0}\\dfrac{f(${a}+h)-f(${a})}{h}`), texte(` : on calcule d'abord f(${nombreTexte(a)}) et f(${nombreTexte(a)} + h).`)],
    },
    { label: "Méthode", sousQuestion: "a", fragments: methode(exercice, "developper") },
    { label: "Calcul", sousQuestion: "a", fragments: [latex(formatReponseAttendueEcranLatex(exercice, "developper").join(" \\quad "))] },
  ];
  if (exercice.famille !== "affine") {
    lignes.push(
      { label: "Méthode", sousQuestion: lettre(exercice, "quotient"), fragments: methode(exercice, "quotient") },
      { label: "Calcul", sousQuestion: lettre(exercice, "quotient"), fragments: [latex(formatReponseAttendueEcranLatex(exercice, "quotient")[0])] },
    );
  }
  const limite = questionSpecifiqueEcran(exercice, "limite").latex ?? "";
  lignes.push(
    { label: "Méthode", sousQuestion: lettre(exercice, "limite"), fragments: methode(exercice, "limite") },
    {
      label: "Conclusion",
      sousQuestion: lettre(exercice, "limite"),
      fragments: [latex(`${limite}=${valeurFinaleLatex(exercice).replace(/^f'\([^)]*\)=/, "")}`), texte(".")],
    },
  );
  const p = piege(exercice);
  const ordre = (l: EtapeCorrection) => LETTRES.indexOf(l.sousQuestion ?? "a");
  // La ligne « Piège » se lit sous l'étape qu'elle concerne.
  const position = lignes.reduce((dernier, l, i) => (ordre(l) <= ordre(p) ? i : dernier), -1);
  lignes.splice(position + 1, 0, p);
  return lignes;
}

function baremeDefinitionDerivee(exercice: ExerciceDefinitionDerivee): BaremeExercice {
  const a = nombreTexte(exercice.a);
  const c = (sousQuestion: string, texteCritere: string, points: number): CritereBareme => ({ sousQuestion, critere: [texte(texteCritere)], points });
  const criteres =
    exercice.famille === "affine"
      ? [
          c("a", `Valeur de f(${a})`, 0.5),
          c("a", `f(${a} + h) développé et réduit`, 1),
          c("b", `Différence f(${a} + h) − f(${a}) et simplification par h`, 1.5),
          c("b", `Passage à la limite : valeur de f'(${a})`, 1),
        ]
      : [
          c("a", `Valeur de f(${a})`, 0.5),
          c("a", exercice.famille === "quadratique" ? `f(${a} + h) développé et réduit` : `f(${a} + h) écrit avec un seul numérateur et un seul dénominateur`, 1),
          c("b", "Taux d'accroissement simplifié (le facteur h a disparu)", 1.5),
          c("c", `Passage à la limite : valeur de f'(${a})`, 1),
        ];
  return {
    reponseFinale: reponseBreveDefinitionDerivee(exercice),
    criteres,
    erreursFrequentes: [
      exercice.famille === "quadratique"
        ? { description: [texte(`Oubli du terme croisé en développant le carré de ${a} + h`)], cout: `0 pt sur f(${a} + h)` }
        : { description: [texte("Remplacer h par 0 avant d'avoir simplifié le facteur h (forme 0/0)")], cout: "0 pt sur la limite" },
      { description: [texte("Résultat donné par les règles de dérivation, sans passer par la définition")], cout: "0 pt sur les étapes de calcul" },
    ],
    reponsesAcceptees: [[texte("f'(a) sous forme de fraction irréductible ou de nombre décimal exact")]],
  };
}

function difficulteDefinitionDerivee(exercice: ExerciceDefinitionDerivee): 1 | 2 | 3 {
  switch (exercice.famille) {
    case "affine":
      return 1;
    case "quadratique":
      return 2;
    case "rationnelleSimple":
      return exercice.expo === 1 ? 2 : 3;
    case "rationnelleLineaire":
      return 3;
  }
}

/** Ancien corrigé (repli, documents Word) : les lignes du corrigé détaillé, sans le piège. */
function construireCorrectionDefinitionDerivee(exercice: ExerciceDefinitionDerivee): BlocCorrection[] {
  return correctionDetailleeDefinitionDerivee(exercice)
    .filter((l) => l.label !== "Piège")
    .map((l) => ({ type: "paragraphe", fragments: l.fragments }));
}

export const adaptateurEvaluationDefinitionDerivee: AdaptateurFeuilleExercices<ExerciceDefinitionDerivee> = {
  titreDocument: "Calculer f'(a) par la définition — Évaluation",
  nomFichierBase: "definition-derivee",
  genererInstance: genererExerciceDefinitionDerivee,
  catalogueVariantes: CATALOGUE_FAMILLES,
  genererInstanceAvecVariante: (id) => construireAvecFamilleId(id),
  construireEnonce: construireEnonceDefinitionDerivee,
  construireCorrection: construireCorrectionDefinitionDerivee,
  difficulte: difficulteDefinitionDerivee,
  reponseBreve: reponseBreveDefinitionDerivee,
  correctionDetaillee: correctionDetailleeDefinitionDerivee,
  bareme: baremeDefinitionDerivee,
  enoncePapier: enoncePapierDefinitionDerivee,
  dureeMinutes: 8,
  profilInstance: profilDefinitionDerivee,
  libelleCasParticulier: LIBELLE_CAS_DEFINITION_DERIVEE,
};
