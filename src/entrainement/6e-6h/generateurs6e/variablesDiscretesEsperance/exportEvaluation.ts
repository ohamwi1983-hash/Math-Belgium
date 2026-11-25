import type { ExerciceVariablesDiscretesEsperance } from "../../core6e/variablesDiscretesEsperance.types";
import type { AdaptateurFeuilleExercices, BaremeExercice, CriteresDifficulte, FragmentConsigne, ProfilInstance } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { FORMAT_6GEN49, predicatFragments } from "../../ui6e/formatVariablesDiscretesEsperance";
import { phasesPourExercice } from "../../moteur6e/typesVariablesDiscretesEsperance";
import type { PhaseVariablesDiscretesEsperance } from "../../moteur6e/typesVariablesDiscretesEsperance";
import { probabiliteEvenementA } from "../../moteur6e/verificationVariablesDiscretesEsperance";
import { versNombre } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { decimalExact } from "../../ui6e/corrigeCombinatoire";
import { ar, dl, frag } from "../../ui6e/corrigeVariablesAleatoires";
import { fractionLatex } from "../../ui6e/fragmentsCombinatoire";
import { construireAdaptateurCombinatoire, lettresEcrans } from "../adaptateurCombinatoire";
import { correctionDetailleeVariablesDiscretes } from "./corrigeDetaille";
import { esperanceB, loiB } from "./familleB";
import { esperanceBruteC, esperanceNetteC } from "./familleC";
import { CATALOGUE_VARIANTES, construireAvecVarianteId, genererExerciceVariablesDiscretesEsperance } from "./index";

/**
 * Adaptateur papier de `6gen49` (variables discrètes et espérance, 6e ch. 8, § 1) — refonte du lot E de
 * l'audit : A = la loi dans un tableau AFFICHÉ (rien n'est coupé), les deux événements et la question ;
 * B, C = la situation en prose (plus de « calcule son espérance E(X) = Σ xᵢpᵢ », plus de « formule
 * hypergéométrique ») ; C « imposer » a deux VRAIES questions (mise équitable ; mise fixée). Les écrans
 * deviennent les étapes du corrigé.
 *
 * Profil (règle du 24/11) : tout se calcule à la main (fractions sur 20, petites combinaisons), aucune
 * réponse donnée directement par la calculatrice (construire la loi, décider) → pas de `calcul`. Aucun
 * cas particulier : les verdicts (contraires, favorable / défavorable / équitable) ne sont jamais dans le
 * profil ; niveau et durée constants dans chaque variante, quel que soit le verdict.
 */

type E = ExerciceVariablesDiscretesEsperance;
const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

function proba(r: Rationnel): string {
  const d = decimalExact(r);
  if (d && d.decimales <= 4) return d.latex;
  return `${fractionLatex(r)}\\approx ${ar(versNombre(r), 3)}`;
}
function valeur(r: Rationnel): string {
  const d = decimalExact(r);
  if (d && d.decimales <= 4) return d.latex;
  return `${fractionLatex(r)}\\approx ${ar(versNombre(r), 2)}`;
}
const eurosTexte = (x: number) => `${x.toFixed(Number.isInteger(x) ? 0 : 2).replace(".", ",")} €`;

export function tableauLoiA(e: E & { famille: "A" }): string {
  return `\\begin{array}{c|${"c".repeat(e.xs.length)}}x_i&${e.xs.join("&")}\\\\\\hline P(X=x_i)&${e.poids.map((p) => dl(p / 20)).join("&")}\\end{array}`;
}

export function situationPapier49(e: E): FragmentConsigne[] {
  if (e.famille === "A") return [t("La loi de probabilité d'une variable aléatoire "), l("X"), t(" est donnée par le tableau suivant :"), l(tableauLoiA(e))];
  if (e.famille === "B") return [t(`${e.texte} On note `), l("X"), t(` ${e.definitionX}.`)];
  if (e.sousType === "verifier") return [t(`${e.texte} La mise est de ${eurosTexte(e.mise)}.`)];
  return [t(e.texte)];
}

export const CONSIGNE_B_49 = "Détermine la loi de $X$, puis calcule son espérance $E(X)$. Probabilités en valeur exacte ; espérance exacte ou arrondie au centième.";
export const CONSIGNE_CV_49 = "On note $X$ le gain net du joueur (montant reçu moins la mise). Ce jeu est-il favorable au joueur, défavorable ou équitable ? Justifie par un calcul.";

function questions(e: E): { consigne: FragmentConsigne[]; etapes: string[] }[] {
  const lettres = lettresEcrans(phasesPourExercice, e);
  if (e.famille === "A")
    return [
      {
        consigne: [t("On considère les événements "), l("E_1"), t(" : « "), ...predicatFragments(e.e1), t(" » et "), l("E_2"), t(" : « "), ...predicatFragments(e.e2), t(" ». Calcule "), l("P(E_1)"), t(" et "), l("P(E_2)"), t(", puis dis si "), l("E_1"), t(" et "), l("E_2"), t(" sont contraires. Justifie.")],
        etapes: lettres,
      },
    ];
  if (e.famille === "B") return [{ consigne: frag(CONSIGNE_B_49), etapes: lettres }];
  if (e.sousType === "verifier") return [{ consigne: frag(CONSIGNE_CV_49), etapes: lettres }];
  return [
    { consigne: [t("Quelle mise rend ce jeu équitable ? Justifie par un calcul.")], etapes: ["a", "b"] },
    { consigne: [t(`L'organisateur fixe finalement la mise à ${eurosTexte(e.mise)}. Pour le joueur, le jeu est-il alors favorable, défavorable ou équitable ? Justifie.`)], etapes: ["c"] },
  ];
}

function statut(x: number): string {
  return x > 1e-9 ? "favorable au joueur" : x < -1e-9 ? "défavorable au joueur" : "équitable";
}

function reponseBreve(e: E): FragmentConsigne[] {
  if (e.famille === "A")
    return [l(`P(E_1)=${dl(versNombre(probabiliteEvenementA(e, e.indices1)))}`), t(" ; "), l(`P(E_2)=${dl(versNombre(probabiliteEvenementA(e, e.indices2)))}`), t(e.contraires ? " ; contraires." : " ; pas contraires.")];
  if (e.famille === "B")
    return [t("Loi : "), ...loiB(e).flatMap((x, i) => [...(i > 0 ? [t(" ; ")] : []), l(`P(X=${x.valeur})=${proba(x.p)}`)]), t(" ; "), l(`E(X)=${valeur(esperanceB(e))}`)];
  const en = versNombre(esperanceNetteC(e));
  if (e.sousType === "verifier") return [l(`E(X)=${dl(en)}`), t(` € : jeu ${statut(en)}.`)];
  return [t("a) "), l(`m=${dl(versNombre(esperanceBruteC(e)))}`), t(` € ; b) jeu ${statut(en)}.`)];
}

function criteres(e: E): CriteresDifficulte {
  // A : lire le tableau (méthode 0) ; piège dans les données constant (symboles stricts / larges, et
  // une somme égale à 1 qui ne prouve rien), étapes sans charge : même niveau pour « contraires » ou non.
  // B : regrouper les issues ou reconnaître le tirage sans remise (méthode 1). C : espérance d'un gain
  // net puis décision (méthode 1) ; sans charge : le verdict ne change pas le niveau.
  const base = etapesDuCorrige(correctionDetailleeVariablesDiscretes(e), []);
  if (e.famille === "A") return { ...base, methode: 0, piege: 1, nombres: 0, sansCharge: true };
  if (e.famille === "B") return { ...base, methode: 1, piege: 0 };
  return { ...base, methode: 1, piege: 0, nombres: 0, sansCharge: true };
}

function bareme(e: E): BaremeExercice {
  if (e.famille === "A")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [l(`P(E_1)=${dl(versNombre(probabiliteEvenementA(e, e.indices1)))}`)], points: 1 },
        { sousQuestion: "b", critere: [l(`P(E_2)=${dl(versNombre(probabiliteEvenementA(e, e.indices2)))}`)], points: 1 },
        { sousQuestion: "c", critere: [t(e.contraires ? "Contraires, justifié (aucune valeur commune, toutes les valeurs couvertes)" : "Pas contraires, justifié par une valeur commune ou une valeur oubliée")], points: 2 },
      ],
      erreursFrequentes: [
        { description: [t("Symbole strict lu comme large (ou l'inverse)")], cout: "0 pt sur l'étape concernée" },
        { description: [t("Conclusion tirée de la seule somme "), l("P(E_1)+P(E_2)")], cout: "0 pt sur l'étape 3" },
      ],
      reponsesAcceptees: [[t("Les probabilités en fraction ou en décimal")]],
    };
  if (e.famille === "B")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t(e.sousType === "hypergeometrique" ? "Loi hypergéométrique : chaque probabilité calculée" : "Loi : issues regroupées par valeur, probabilités exactes")], points: 2.5 },
        { sousQuestion: "b", critere: [l(`E(X)=${valeur(esperanceB(e))}`)], points: 1.5 },
      ],
      erreursFrequentes: [{ description: [t("Moyenne simple des valeurs pour l'espérance")], cout: "0 pt sur l'étape 2" }, ...(e.sousType === "contexteDirect" ? [{ description: [t("Issues de même valeur non regroupées (valeur répétée dans la loi)")], cout: "moitié des points de l'étape 1" }] : [])],
      reponsesAcceptees: [[t("Les probabilités en fraction ou en décimal ; l'espérance exacte ou arrondie au centième")]],
    };
  const eg = versNombre(esperanceBruteC(e));
  const en = versNombre(esperanceNetteC(e));
  if (e.sousType === "verifier")
    return {
      reponseFinale: reponseBreve(e),
      criteres: [
        { sousQuestion: "a", critere: [t("Espérance du gain net : "), l(`E(X)=${dl(en)}`)], points: 3 },
        { sousQuestion: "b", critere: [t(`Conclusion par le signe : jeu ${statut(en)}`)], points: 1 },
      ],
      erreursFrequentes: [{ description: [t("Mise oubliée (espérance du montant reçu)")], cout: "1,5 pt sur l'étape 1" }],
      reponsesAcceptees: [[t("Un calcul par la loi du gain net (montant reçu moins la mise pour chaque issue)")]],
    };
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Espérance du montant reçu : "), l(`E(G)=${dl(eg)}`)], points: 1.5 },
      { sousQuestion: "b", critere: [t("Mise équitable : "), l(`m=${dl(eg)}`)], points: 1 },
      { sousQuestion: "c", critere: [t(`Mise fixée comparée : jeu ${statut(en)}`)], points: 1.5 },
    ],
    erreursFrequentes: [{ description: [t("Plus grand gain ou moyenne simple des montants pris pour la mise")], cout: "0 pt sur les étapes 1 et 2" }],
    reponsesAcceptees: [[t("La conclusion par le signe de "), l("E(G)-m"), t(" calculé avec la mise fixée")]],
  };
}

export function profilVariablesDiscretes(_e: E): ProfilInstance {
  return { casParticulier: null };
}

export const adaptateurEvaluationVariablesDiscretesEsperance: AdaptateurFeuilleExercices<E> = construireAdaptateurCombinatoire<E, PhaseVariablesDiscretesEsperance>({
  titreDocument: "Variables aléatoires discrètes et espérance — Évaluation",
  nomFichierBase: "variables-discretes-esperance",
  genererInstance: genererExerciceVariablesDiscretesEsperance,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVarianteId,
  format: FORMAT_6GEN49,
  phases: phasesPourExercice,
  situation: situationPapier49,
  questions,
  reponseBreve,
  correction: correctionDetailleeVariablesDiscretes,
  bareme,
  criteres,
  profil: profilVariablesDiscretes,
});
