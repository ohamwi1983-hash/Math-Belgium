import type {
  AdaptateurFeuilleExercices,
  BaremeExercice,
  BlocCorrection,
  EnoncePapier,
  ErreurFrequente,
  EtapeCorrection,
  FragmentConsigne,
  SectionExercice,
} from "../../../export/genererFeuilleExercices";
import { latex, texte } from "../../../export/fragmentsDocx";
import type { ExerciceAireTriangleSinus } from "../../core/aireTriangleSinus.types";
import { anglesAttendus, calculExact, etapes, sinusAttendu, sinusExact } from "../../moteur/modeleAireTriangleSinus";
import {
  AIRE,
  chapeau,
  consigneEtape,
  consignePapier,
  donneesFragments,
  egalOuEnviron,
  latexAireACD,
  latexAireTotale,
  latexCalculAire,
  latexCalculCote,
  latexCalculSinus,
  latexDemiPerimetre,
  latexDiagonale,
  latexHeron,
  latexOptionFormule,
  n,
  noms,
  radicalLatex,
  reponseAnglesLatex,
  reponseNumeriqueLatex,
} from "../../ui/formatAireTriangleSinus";
import { figureSvgPapier } from "../../ui/figureAireTriangleSinus";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceAireTriangleSinus } from "./index";
import { LIBELLE_CAS_AIRE_TRIANGLE, profilAireTriangleSinus } from "./profil";

/**
 * Adaptateur feuilles d'exercices / évaluations de gen75. Énoncé papier = données + figure à
 * l'échelle (inconnue « ? ») + consigne globale (objectif et précision demandée) ; les écrans du
 * générateur (formule, calculs intermédiaires, nombre d'amplitudes…) deviennent les étapes a, b, c
 * du corrigé. Famille `angle` : pas de figure sur papier (une figure montrerait l'une des deux
 * configurations et ferait oublier l'autre — c'est précisément le piège évalué). Séries
 * équilibrées : `profil.ts`. Toutes les valeurs viennent des fonctions de l'écran
 * (`ui/formatAireTriangleSinus.ts`, `moteur/modeleAireTriangleSinus.ts`).
 */

type E = ExerciceAireTriangleSinus;
const LETTRES = ["a", "b", "c", "d"];

function lettres(e: E): string[] {
  return etapes(e).map((_, i) => LETTRES[i]!);
}

function figure(e: E): string | undefined {
  return e.famille === "angle" ? undefined : figureSvgPapier(e);
}

/** Énoncé STRUCTURÉ (une sous-question par écran) : sert aux titres « Étape n — … » du corrigé. */
function construireEnonce(e: E): SectionExercice {
  return {
    enteteFragments: donneesFragments(e),
    enteteHtml: figure(e),
    questions: etapes(e).map((etape) => ({ consigne: consigneEtape(e, etape) })),
  };
}

function enoncePapier(e: E): EnoncePapier {
  return {
    section: { enteteFragments: donneesFragments(e), enteteHtml: figure(e), questions: [{ consigne: consignePapier(e) }] },
    etapesParQuestion: [lettres(e)],
  };
}

function reponseBreve(e: E): FragmentConsigne[] {
  switch (e.famille) {
    case "aire":
      return [latex(reponseNumeriqueLatex(e, "calculAire"))];
    case "cote":
      return [latex(reponseNumeriqueLatex(e, "calculCote"))];
    case "angle":
      return [latex(reponseAnglesLatex(e))];
    case "quadrilatere":
      return [latex(reponseNumeriqueLatex(e, "aireTotale"))];
    case "heron":
      return [latex(reponseNumeriqueLatex(e, "aireHeron"))];
  }
}

function lignes(e: E): EtapeCorrection[] {
  const L = (label: string, sousQuestion: string, fragments: FragmentConsigne[]): EtapeCorrection => ({ label, sousQuestion, fragments });
  switch (e.famille) {
    case "aire": {
      const { X, seg1, seg2 } = noms(e);
      const ex = sinusExact(e.angle);
      return [
        L("Méthode", "a", [texte(`Deux côtés et l'angle ${X} compris entre eux : `), latex(latexOptionFormule(e, "formuleAire", "correcte"))]),
        L("Calcul", "b", [latex(latexCalculAire(e.cote1, e.cote2, e.angle, AIRE, e))]),
        ex
          ? L("Piège", "b", [texte("Valeur remarquable, sans calculatrice : "), latex(`\\sin ${e.angle}^\\circ = ${radicalLatex(ex)}`), texte(`. L'angle doit être celui compris entre ${seg1} et ${seg2}.`)])
          : L("Piège", "a", [texte(`L'angle doit être celui compris entre ${seg1} et ${seg2} ; calculatrice en mode degrés.`)]),
      ];
    }
    case "cote": {
      const { X, seg1, seg2 } = noms(e);
      return [
        L("Méthode", "a", [texte("Formule de l'aire : "), latex(`${AIRE} = \\dfrac{1}{2} \\cdot ${seg1} \\cdot ${seg2} \\cdot \\sin ${chapeau(X)}`), texte(`, puis on isole ${seg2} : `), latex(latexOptionFormule(e, "formuleCote", "correcte"))]),
        L("Calcul", "b", [latex(latexCalculCote(e))]),
        L("Piège", "a", [texte("En isolant, le ½ devient un facteur 2 au numérateur, et le sinus divise.")]),
      ];
    }
    case "angle": {
      const { X, seg1, seg2 } = noms(e);
      const x = chapeau(X);
      const a = anglesAttendus(e);
      const lignesC: EtapeCorrection[] =
        a.length === 1
          ? [L("Conclusion", "c", [latex(`${x} = 90^\\circ`)])]
          : [
              L("Calcul", "c", e.aire.exacte ? [texte("Valeur remarquable : "), latex(`${x}_1 = ${n(a[0]!, 1)}^\\circ`)] : [texte("Calculatrice en mode degrés : "), latex(`${x}_1 = \\sin^{-1}(${n(sinusAttendu(e), 3)}) ${egalOuEnviron(a[0]!, 1)}^\\circ`)]),
              L("Calcul", "c", [latex(`${x}_2 = 180^\\circ - ${x}_1 ${egalOuEnviron(a[1]!, 1)}^\\circ`)]),
              L("Conclusion", "c", [texte("Deux triangles conviennent : "), latex(reponseAnglesLatex(e)), texte(".")]),
            ];
      return [
        L("Méthode", "a", [texte(`Dans la formule de l'aire, on isole le sinus de l'angle ${X} compris entre ${seg1} et ${seg2} : `), latex(`\\sin ${x} = \\dfrac{2${AIRE}}{${seg1} \\cdot ${seg2}}`)]),
        L("Calcul", "a", [latex(latexCalculSinus(e))]),
        a.length === 1
          ? L("Méthode", "b", [texte("Un sinus égal à 1 ne correspond qu'à l'angle droit : une seule amplitude.")])
          : L("Méthode", "b", [texte("Deux angles supplémentaires ont le même sinus, "), latex("\\sin(180^\\circ - x) = \\sin x"), texte(" : deux amplitudes conviennent, une aiguë et une obtuse.")]),
        ...lignesC,
        L("Piège", "b", [texte("La calculatrice (touche sin⁻¹) ne donne que l'angle aigu : ne pas oublier son supplémentaire.")]),
      ];
    }
    case "quadrilatere":
      return [
        L("Méthode", "a", [texte("La diagonale AC découpe ABCD en deux triangles ABC et ACD : on additionne leurs aires.")]),
        L("Calcul", "a", [latex(latexCalculAire(e.AB, e.BC, e.angleB, `${AIRE}_{ABC}`, e))]),
        e.angleB === 90
          ? L("Méthode", "b", [texte("Pour l'aire de ACD, il faut AC. ABC est rectangle en B : Pythagore.")])
          : L("Méthode", "b", [texte("Pour l'aire de ACD, il faut AC : Al-Kashi dans ABC, "), latex("AC^2 = AB^2 + BC^2 - 2 \\cdot AB \\cdot BC \\cdot \\cos \\widehat{ABC}")]),
        L("Calcul", "b", [latex(latexDiagonale(e))]),
        L("Calcul", "c", [texte("Angle ACD compris entre CA et CD : "), latex(latexAireACD(e))]),
        L("Conclusion", "c", [latex(latexAireTotale(e))]),
        L("Piège", "b", [texte("Al-Kashi : ne pas oublier le terme en cosinus (négatif si l'angle est obtus) ni la racine carrée ; garder AC en mémoire de la calculatrice.")]),
      ];
    case "heron":
      return [
        L("Calcul", "a", [latex(latexDemiPerimetre(e))]),
        L("Méthode", "b", [texte("Formule de Héron : "), latex(`${AIRE} = \\sqrt{p\\,(p-a)(p-b)(p-c)}`)]),
        L("Calcul", "b", [latex(latexHeron(e))]),
        L("Piège", "a", [texte("La formule utilise le DEMI-périmètre p, pas le périmètre.")]),
      ];
  }
}

function correctionDetaillee(e: E): EtapeCorrection[] {
  return lignes(e);
}

function construireCorrection(e: E): BlocCorrection[] {
  return lignes(e)
    .filter((l) => l.label !== "Piège" && l.label !== "Méthode")
    .map((l) => ({ type: "paragraphe", fragments: [texte(`${l.sousQuestion}) `), ...l.fragments] }));
}

function bareme(e: E): BaremeExercice {
  const radians: ErreurFrequente = { description: [texte("Calculatrice en radians")], cout: "−1" };
  const unite: ErreurFrequente = { description: [texte("Unité absente ou aire exprimée en unité de longueur")], cout: "−0,5" };
  const accepte: FragmentConsigne[][] = [[texte("Valeur exacte ou valeur approchée cohérente (arrondi final seulement)")]];
  switch (e.famille) {
    case "aire":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Formule avec deux côtés et l'angle compris")], points: 1.5 },
          { sousQuestion: "b", critere: [texte(calculExact(e) ? "Valeur exacte du sinus et calcul" : "Substitution et calcul (calculatrice en degrés)")], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Résultat avec l'unité d'aire")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Oubli du facteur ½")], cout: "−1" },
          { description: [texte("Angle non compris entre les deux côtés, ou cosinus au lieu du sinus")], cout: "0 pt sur l'étape 2" },
          radians,
          unite,
        ],
        reponsesAcceptees: accepte,
      };
    case "cote":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte(`Formule de l'aire et ${noms(e).seg2} isolé correctement`)], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Substitution et calcul")], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Résultat avec l'unité de longueur")], points: 1 },
        ],
        erreursFrequentes: [
          { description: [texte("Isolement faux (facteur 2 oublié ou sinus au numérateur)")], cout: "0 pt sur l'étape 1" },
          radians,
          { description: [texte("Unité absente")], cout: "−0,5" },
        ],
        reponsesAcceptees: accepte,
      };
    case "angle": {
      const deux = anglesAttendus(e).length === 2;
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Sinus isolé et calculé")], points: 1.5 },
          { sousQuestion: "b", critere: [texte(deux ? "Deux amplitudes reconnues (angles supplémentaires)" : "Une seule amplitude reconnue (sinus égal à 1)")], points: 1 },
          { sousQuestion: "c", critere: [texte(deux ? "Les deux amplitudes justes" : "Amplitude juste")], points: 1.5 },
        ],
        erreursFrequentes: deux
          ? [
              { description: [texte("Seconde amplitude oubliée (seulement l'angle aigu)")], cout: "−1,5" },
              { description: [texte("Complémentaire (90° − angle) au lieu du supplémentaire")], cout: "−1" },
              { description: [texte("Facteur 2 oublié dans le sinus")], cout: "0 pt sur l'étape 1" },
              radians,
            ]
          : [{ description: [texte("Facteur 2 oublié dans le sinus")], cout: "0 pt sur l'étape 1" }],
        reponsesAcceptees: [[texte("Amplitudes arrondies au dixième de degré (ou au degré)")]],
      };
    }
    case "quadrilatere":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Aire du triangle ABC")], points: 1 },
          { sousQuestion: "b", critere: [texte(e.angleB === 90 ? "Diagonale AC par Pythagore" : "Diagonale AC par Al-Kashi")], points: 1.5 },
          { sousQuestion: "c", critere: [texte("Aire de ACD et somme des deux aires")], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [texte("Al-Kashi sans le terme en cosinus, ou avec le mauvais signe")], cout: "0 pt sur l'étape 2" },
          { description: [texte("Racine carrée oubliée (AC² utilisé comme AC)")], cout: "−1" },
          { description: [texte("Une seule des deux aires donnée comme aire de ABCD")], cout: "−1" },
          radians,
        ],
        reponsesAcceptees: [[texte("Résultat calculé avec AC arrondi au centième (écart d'arrondi accepté)")], [texte("Étape 3 juste à partir d'une valeur fausse de AC : points de méthode accordés")]],
      };
    case "heron":
      return {
        reponseFinale: reponseBreve(e),
        criteres: [
          { sousQuestion: "a", critere: [texte("Demi-périmètre")], points: 1 },
          { sousQuestion: "b", critere: [texte("Formule de Héron correctement appliquée")], points: 1.5 },
          { sousQuestion: "b", critere: [texte("Résultat avec l'unité d'aire")], points: 1.5 },
        ],
        erreursFrequentes: [
          { description: [texte("Périmètre utilisé au lieu du demi-périmètre")], cout: "0 pt sur l'étape 2" },
          { description: [texte("Racine carrée oubliée")], cout: "−1" },
          unite,
        ],
        reponsesAcceptees: [[texte("Aire obtenue autrement (un angle par Al-Kashi, puis la formule avec le sinus) : accepter")]],
      };
  }
}

function difficulte(e: E): 1 | 2 | 3 {
  if (e.famille === "aire") return 1;
  if (e.famille === "quadrilatere") return 3;
  return 2;
}

export const adaptateurEvaluationAireTriangleSinus: AdaptateurFeuilleExercices<ExerciceAireTriangleSinus> = {
  profilInstance: profilAireTriangleSinus,
  libelleCasParticulier: LIBELLE_CAS_AIRE_TRIANGLE,
  calculatriceIndispensable: ["quadrilatere"],
  titreDocument: "Aire d'un triangle quelconque — Évaluation",
  nomFichierBase: "aire-triangle-quelconque",
  genererInstance: genererExerciceAireTriangleSinus,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  difficulte,
  reponseBreve,
  correctionDetaillee,
  bareme,
  enoncePapier,
  dureeMinutes: 6,
};

