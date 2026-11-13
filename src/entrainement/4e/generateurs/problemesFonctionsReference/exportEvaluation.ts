import type { ExerciceProblemesFonctionsReference, SensQuestion } from "../../core/problemesFonctionsReference.types";
import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  EtapeCorrection,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte as texteBrut } from "../../../export/fragmentsDocx";
import type { FragmentConsigne } from "../../ui/formatEquationDroite";
import { decrireProbleme, ensembleLatex, morceauLatex, nombreLatex, symboleLatex } from "../../moteur/problemesFonctionsReference";
import {
  aidesDomaine,
  aidesFonction,
  consigneDomaine,
  consigneFonction,
  consigneQuestion,
  dureeTexte,
  enonceFragments,
  fonctionAttendueLatex,
  insecables,
  fonctionLatex,
  optionsInterpretation,
  questionConcrete,
  questionInterpretation,
} from "../../ui/formatProblemesFonctionsReference";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceProblemesFonctionsReference } from "./index";
import { profilProblemesFonctionsReference } from "./profilEvaluation";

/**
 * Adaptateur `AdaptateurFeuilleExercices<ExerciceProblemesFonctionsReference>` de gen68
 * (`AppProblemesFonctionsReference.tsx`, 4e chapitre 3, processus TRANSFÉRER).
 *
 * Étapes de l'appli (lettres du corrigé et du barème) : a) expression de la fonction, b) domaine
 * imposé par le contexte, c) question concrète (inéquation restreinte au domaine), d)
 * interprétation. Sur papier, ce sont TROIS vraies questions d'un problème : 1) écrire la fonction
 * ET son domaine (étapes a et b — le choix du domaine parmi quatre propositions est un guidage
 * d'écran), 2) répondre à la question concrète (étape c), 3) interpréter, en question OUVERTE
 * justifiée (étape d — les quatre propositions de l'écran disparaissent). Version aménagée : même
 * énoncé (le pipeline ne change que la mise en page).
 *
 * Textes, inéquation, domaines, ensemble-solution : MÊMES fonctions que l'appli
 * (`decrireProbleme`, `ui/formatProblemesFonctionsReference.ts`), jamais recalculés à part.
 */

type E = ExerciceProblemesFonctionsReference;

const texte = (valeur: string): FragmentConsigne => texteBrut(insecables(valeur));

const INVERSE: Record<SensQuestion, SensQuestion> = { "<": ">", "≤": "≥", ">": "<", "≥": "≤" };

function enteteFragments(e: E): FragmentConsigne[] {
  return enonceFragments(e);
}

function consignesEcrans(e: E): FragmentConsigne[][] {
  return [consigneFonction(e), consigneDomaine(e), consigneQuestion(e), questionInterpretation(e)];
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: enteteFragments(e), questions: consignesEcrans(e).map((consigne) => ({ consigne })) };
}

function questionsPapier(e: E): FragmentConsigne[][] {
  const d = decrireProbleme(e);
  return [
    [texte("Exprime "), latex(fonctionLatex(e)), texte(" en fonction de "), latex(d.variable), texte(", puis donne le domaine de "), latex(d.nomFonction), texte(" imposé par la situation.")],
    [...questionConcrete(e), texte(" Réponds à l'aide d'une inéquation.")],
    [...questionInterpretation(e), texte(" Justifie.")],
  ];
}

function domaineConclusionLatex(e: E): string {
  const d = decrireProbleme(e);
  return `\\operatorname{dom} ${d.nomFonction} = ${morceauLatex(d.domaineContexte)}`;
}

function solutionLatex(e: E): string {
  return `S = ${ensembleLatex(decrireProbleme(e).solution)}`;
}

/** Résolution de l'inéquation (sans la restriction au domaine), en fragments. */
function resolution(e: E): FragmentConsigne[] {
  const d = decrireProbleme(e);
  const p = e.p;
  const s = symboleLatex(e.sens);
  const inv = symboleLatex(INVERSE[e.sens]);
  const auDessus = e.sens === ">" || e.sens === "≥";
  switch (e.famille) {
    case "trajet": {
      const t = nombreLatex(p.heures! + p.minutes! / 60);
      const borne = Math.round(p.d! / (p.heures! + p.minutes! / 60));
      return [latex(`${d.inequationLatex} \\iff ${p.d} ${s} ${t}\\,v \\iff v ${inv} ${borne}`), texte(" (on multiplie par "), latex("v > 0"), texte(", puis on divise par "), latex(t), texte(").")];
    }
    case "location": {
      const ecart = p.seuil! - p.prixHeure!;
      const borne = p.forfait! / ecart;
      return [
        latex(`${d.inequationLatex} \\iff \\dfrac{${p.forfait}}{x} ${s} ${ecart} \\iff ${p.forfait} ${s} ${ecart}\\,x \\iff x ${inv} ${borne}`),
        texte(" (on multiplie par "),
        latex("x > 0"),
        texte(").")
      ];
    }
    case "potager":
      return [latex(`${d.inequationLatex} \\iff A ${s} ${p.k! * p.k!}`), texte(" (les deux membres sont positifs : on peut les élever au carré).")];
    case "aquarium":
      return [latex(`${d.inequationLatex} \\iff V ${s} ${p.k! ** 3}`), texte(" (la fonction cube est croissante).")];
    case "thermostat": {
      const c = p.consigne!;
      const k = p.k!;
      if (!auDessus) return [latex(`${d.inequationLatex} \\iff -${k} ${s} T - ${c} ${s} ${k} \\iff ${c - k} ${s} T ${s} ${c + k}`)];
      return [latex(`${d.inequationLatex} \\iff T - ${c} ${inv} -${k}`), texte(" ou "), latex(`T - ${c} ${s} ${k}`), texte(", c'est-à-dire "), latex(`T ${inv} ${c - k}`), texte(" ou "), latex(`T ${s} ${c + k}`), texte(".")];
    }
    case "plaque": {
      const k = p.k!;
      if (!auDessus) return [latex(`${d.inequationLatex} \\iff -${k} ${s} c ${s} ${k}`)];
      return [latex(`${d.inequationLatex} \\iff c ${inv} -${k}`), texte(" ou "), latex(`c ${s} ${k}`), texte(".")];
    }
  }
}

function piege(e: E): FragmentConsigne[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [
        texte("La fonction inverse est décroissante sur "),
        latex("]0 \\,;\\, +\\infty["),
        texte(" : une durée plus courte demande une vitesse plus grande, le sens de l'inégalité s'inverse."),
        ...(p.minutes! > 0 ? [texte(` Et ${dureeTexte(e)} = `), latex(nombreLatex(p.heures! + p.minutes! / 60)), texte(" h, pas "), latex(`${p.heures}{,}${String(p.minutes).padStart(2, "0")}`), texte(" h.")] : []),
      ];
    case "location":
      return [texte("Le coût horaire moyen diminue quand la durée augmente : en passant de la comparaison des coûts à celle des durées, le sens de l'inégalité s'inverse.")];
    case "potager":
      return [texte(`Les aires qui dépassent ${p.amax} m² (et l'aire nulle) n'ont pas de sens ici : la réponse reste dans le domaine de la situation.`)];
    case "aquarium":
      return [texte(`Les volumes nuls et ceux qui dépassent ${p.vmax} L n'ont pas de sens ici : la réponse s'arrête au domaine.`)];
    case "thermostat":
      return e.sens === ">" || e.sens === "≥"
        ? [texte("Un écart supérieur à une valeur donne DEUX morceaux, de part et d'autre de la consigne, chacun limité par la plage du thermostat.")]
        : [texte("Un écart inférieur à une valeur donne UN seul intervalle centré sur la consigne.")];
    case "plaque":
      return [texte("Sur "), latex("\\mathbb{R}"), texte(", l'inéquation a aussi des solutions négatives : une longueur négative n'a pas de sens, la situation les élimine.")];
  }
}

function justificationInterpretation(e: E): FragmentConsigne[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [latex(`t(2v) = \\dfrac{${p.d}}{2v} = \\dfrac{1}{2} \\cdot \\dfrac{${p.d}}{v} = \\dfrac{t(v)}{2}`)];
    case "potager":
      return [latex("c(4A) = \\sqrt{4A} = \\sqrt{4} \\cdot \\sqrt{A} = 2\\,c(A)")];
    case "aquarium":
      return [latex("a(8V) = \\sqrt[3]{8V} = \\sqrt[3]{8} \\cdot \\sqrt[3]{V} = 2\\,a(V)")];
    case "thermostat": {
      const c = p.consigne!;
      return [latex(`E(${c - 2}) = |${c - 2} - ${c}| = |-2| = 2`), texte(" et "), latex(`E(${c + 2}) = |${c + 2} - ${c}| = |2| = 2`)];
    }
    case "location":
      return [latex(`C(x) - ${p.prixHeure} = \\dfrac{${p.forfait}}{x} > 0`), texte(", et ce quotient se rapproche de 0 quand "), latex("x"), texte(" devient très grand.")];
    case "plaque":
      return [latex("A(2c) = (2c)^2 = 4c^2 = 4\\,A(c)")];
  }
}

function lignesCorrection(e: E): EtapeCorrection[] {
  const d = decrireProbleme(e);
  const [methodeFonction] = aidesFonction(e);
  const [, raisonDomaine] = aidesDomaine(e);
  return [
    { label: "Méthode", sousQuestion: "a", fragments: methodeFonction! },
    { label: "Conclusion", sousQuestion: "a", fragments: [latex(fonctionAttendueLatex(e))] },
    { label: "Méthode", sousQuestion: "b", fragments: [texte("L'expression existe pour "), latex(`${d.variable} \\in ${d.domaineAlgebriqueLatex}`), texte(", mais la situation restreint ces valeurs. "), ...raisonDomaine!] },
    { label: "Conclusion", sousQuestion: "b", fragments: [latex(domaineConclusionLatex(e))] },
    { label: "Méthode", sousQuestion: "c", fragments: [texte("La question se traduit par l'inéquation "), latex(d.inequationLatex), texte(".")] },
    { label: "Calcul", sousQuestion: "c", fragments: resolution(e) },
    { label: "Piège", sousQuestion: "c", fragments: piege(e) },
    { label: "Conclusion", sousQuestion: "c", fragments: [texte("En ne gardant que les valeurs du domaine "), latex(morceauLatex(d.domaineContexte)), texte(" : "), latex(solutionLatex(e)), texte(".")] },
    { label: "Calcul", sousQuestion: "d", fragments: justificationInterpretation(e) },
    { label: "Conclusion", sousQuestion: "d", fragments: [texte(optionsInterpretation(e)[0]!)] },
  ];
}

function construireCorrection(e: E): BlocCorrection[] {
  return lignesCorrection(e)
    .filter((l) => l.label !== "Piège")
    .map((l): BlocCorrection => ({ type: "paragraphe", fragments: [texte(`${l.sousQuestion}) `), ...l.fragments] }));
}

function reponseBreve(e: E): FragmentConsigne[] {
  const d = decrireProbleme(e);
  return [
    texte("a) "),
    latex(fonctionAttendueLatex(e)),
    texte(" ; b) "),
    latex(morceauLatex(d.domaineContexte)),
    texte(" ; c) "),
    latex(solutionLatex(e)),
    texte(" ; d) "),
    texte(optionsInterpretation(e)[0]!),
  ];
}

function reponseBrevePapier(e: E): FragmentConsigne[] {
  return [
    texte("a) "),
    latex(fonctionAttendueLatex(e)),
    texte(", "),
    latex(domaineConclusionLatex(e)),
    texte(" ; b) "),
    latex(solutionLatex(e)),
    texte(" ; c) "),
    texte(optionsInterpretation(e)[0]!),
  ];
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: enteteFragments(e), questions: questionsPapier(e).map((consigne) => ({ consigne })) },
    etapesParQuestion: [["a", "b"], ["c"], ["d"]],
    reponseBreve: reponseBrevePapier(e),
  };
}

function erreurSpecifique(e: E): { description: FragmentConsigne[]; cout: string }[] {
  const p = e.p;
  switch (e.famille) {
    case "trajet":
      return [
        { description: [texte("Sens de l'inégalité non inversé (la durée diminue quand la vitesse augmente)")], cout: "0 pt sur la résolution" },
        ...(p.minutes! > 0 ? [{ description: [texte(`${dureeTexte(e)} converti en `), latex(`${p.heures}{,}${String(p.minutes).padStart(2, "0")}`), texte(" h")], cout: "0 pt sur l'inéquation" }] : []),
      ];
    case "location":
      return [{ description: [texte("Sens de l'inégalité non inversé en passant à la durée")], cout: "0 pt sur la résolution" }];
    case "thermostat":
      return e.sens === ">" || e.sens === "≥" ? [{ description: [texte("Un seul intervalle au lieu de deux morceaux")], cout: "0 pt sur la résolution" }] : [{ description: [texte("Valeur absolue traitée comme une parenthèse (une seule inégalité)")], cout: "0 pt sur la résolution" }];
    case "plaque":
      return [{ description: [texte("Longueurs négatives gardées dans la réponse")], cout: "0 pt sur la restriction au domaine" }];
    default:
      return [{ description: [texte("Borne de l'ensemble oubliée (domaine non pris en compte)")], cout: "0 pt sur la restriction au domaine" }];
  }
}

function bareme(e: E): BaremeExercice {
  const d = decrireProbleme(e);
  return {
    reponseFinale: reponseBrevePapier(e),
    criteres: [
      { sousQuestion: "a", critere: [texte("Expression de la fonction : "), latex(fonctionAttendueLatex(e))], points: 1 },
      { sousQuestion: "b", critere: [texte("Domaine imposé par la situation : "), latex(morceauLatex(d.domaineContexte))], points: 0.75 },
      { sousQuestion: "c", critere: [texte("Inéquation correcte : "), latex(d.inequationLatex)], points: 0.5 },
      { sousQuestion: "c", critere: [texte("Résolution avec le bon sens de l'inégalité")], points: 0.5 },
      {
        sousQuestion: "c",
        // Thermostat « écart inférieur » : l'intervalle centré tombe déjà dans la plage, la restriction est invisible.
        critere: [texte(e.famille === "thermostat" && (e.sens === "<" || e.sens === "≤") ? "Ensemble-solution : " : "Restriction au domaine : "), latex(solutionLatex(e))],
        points: 0.5,
      },
      { sousQuestion: "d", critere: [texte("Interprétation justifiée : "), texte(optionsInterpretation(e)[0]!)], points: 0.75 },
    ],
    erreursFrequentes: [
      { description: [texte("Domaine algébrique "), latex(d.domaineAlgebriqueLatex), texte(" donné au lieu du domaine de la situation")], cout: "0 pt sur le domaine" },
      ...erreurSpecifique(e),
      { description: [texte("Interprétation sans justification")], cout: "moitié des points de l'interprétation" },
    ],
    reponsesAcceptees: [
      [texte("Expression équivalente de la fonction (autre écriture du même quotient, de la même valeur absolue…)")],
      [texte("Ensemble donné par un encadrement ou des inégalités au lieu d'intervalles")],
    ],
  };
}

/** ★★ : contexte direct (racine, carré, valeur absolue en un seul intervalle) ; ★★★ : sens qui
 * s'inverse avec une fonction décroissante (trajet, location) ou réponse en deux morceaux. */
function difficulte(e: E): 1 | 2 | 3 {
  if (e.famille === "trajet" || e.famille === "location") return 3;
  if (e.famille === "thermostat" && (e.sens === ">" || e.sens === "≥")) return 3;
  return 2;
}

export const adaptateurEvaluationProblemesFonctionsReference: AdaptateurFeuilleExercices<E> = {
  profilInstance: profilProblemesFonctionsReference,
  titreDocument: "Problèmes modélisés par une fonction de référence — Évaluation",
  nomFichierBase: "problemes-fonctions-reference",
  genererInstance: genererExerciceProblemesFonctionsReference,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee: lignesCorrection,
  bareme,
  enoncePapier,
  dureeMinutes: 8,
};
