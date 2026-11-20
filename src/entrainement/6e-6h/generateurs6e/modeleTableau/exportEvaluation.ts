import type { AdaptateurFeuilleExercices, BaremeExercice, BlocCorrection, CriteresDifficulte, EnoncePapier, FragmentConsigne, ProfilInstance, SectionExercice } from "../../../export/genererFeuilleExercices";
import { etapesDuCorrige } from "../../../export/niveauDifficulte";
import { latex, texte } from "../../../export/corrigeTableau";
import type { ExerciceModeleTableau } from "../../core6e/modeleTableau.types";
import type { TableauDonnees } from "../../ui6e/ecransExp.types";
import { consigne, consigneGenerale, ctx, PHASES, reponse, situation, tableau } from "../../ui6e/formatModeleTableau";
import { CATALOGUE_VARIANTES, construireAvecVariante, genererExerciceModeleTableau } from "./index";
import { correctionDetailleeModeleTableau } from "./corrigeDetaille";

/**
 * Adaptateur papier de 6gen147 « Modèle exponentiel lu dans un tableau ». Énoncé papier : la
 * situation, le tableau des mesures et deux VRAIES questions — a) le modèle (exponentiel ou
 * linéaire, justifié, et ses paramètres : étapes a, b, c), b) la prévision (étape d). Le verdict
 * (exponentiel / linéaire) est tiré 50/50 dans chaque variante : jamais une `forme`, jamais un cas
 * particulier. Calculatrice indispensable (rapports, puissances).
 */

type E = ExerciceModeleTableau;
const t = texte;
const f = latex;

const echapper = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Tableau des mesures (deux lignes : t, puis la grandeur). */
export function tableauHtml(tab: TableauDonnees): string {
  const cell = "border:1px solid #444;padding:3px 8px;text-align:center;font-size:12px;white-space:nowrap";
  const th = `${cell};background:#f2f2f2;font-weight:600`;
  const ent = (i: number) => tab.entetes[i].map((x) => echapper(x.valeur)).join("");
  const corps = tab.entetes.map((_, i) => `<tr><th style="${th}">${ent(i)}</th>${tab.lignes.map((l) => `<td style="${cell}">${echapper(l[i])}</td>`).join("")}</tr>`).join("");
  return `<table style="border-collapse:collapse;margin:6px auto">${corps}</table>`;
}

function construireEnonce(e: E): SectionExercice {
  return { enteteFragments: consigneGenerale(e), enteteHtml: tableauHtml(tableau(e)), questions: PHASES.map((p) => ({ consigne: consigne(e, p) })) };
}

function reponseBreve(e: E): FragmentConsigne[] {
  return [t("a) "), ...reponse(e, "verdict"), t(" : "), ...reponse(e, "parametres").slice(-1), t(" ; b) "), ...reponse(e, "prevision")];
}

function enoncePapier(e: E): EnoncePapier {
  const c = ctx(e);
  return {
    section: {
      enteteFragments: situation(e),
      enteteHtml: tableauHtml(tableau(e)),
      questions: [
        { consigne: [t("Ces mesures suivent-elles un modèle exponentiel "), f("f(t)=b\\cdot a^{t}"), t(" ou un modèle linéaire "), f("f(t)=m\\,t+p"), t(" ? Justifie, puis détermine ce modèle (paramètres exacts).")] },
        { consigne: [t("Prévois "), f(c.lettre), t(" pour "), f(`t=${e.T}`), t(c.entier ? " (arrondi à l'unité)." : " (arrondi au centième).")] },
      ],
    },
    etapesParQuestion: [["a", "b", "c"], ["d"]],
    reponseBreve: reponseBreve(e),
  };
}

function construireCorrection(e: E): BlocCorrection[] {
  return PHASES.map((p, i) => ({ type: "paragraphe", fragments: [t(`${"abcd"[i]}) `), ...reponse(e, p)] }));
}

function criteresDifficulte(e: E): CriteresDifficulte {
  // Modèle à choisir parmi ceux du cours (méthode 1) ; piège dans les données : mesures espacées de
  // deux unités (le rapport vaut a², la différence 2m) ; calculatrice (nombres 1).
  return { ...etapesDuCorrige(correctionDetailleeModeleTableau(e)), methode: 1, piege: e.h === 2 ? 1 : 0, nombres: 1 };
}

function bareme(e: E): BaremeExercice {
  const expo = e.genre === "exponentiel";
  return {
    reponseFinale: reponseBreve(e),
    criteres: [
      { sousQuestion: "a", critere: [t("Rapports successifs calculés : "), ...reponse(e, "rapports")], points: 0.75 },
      { sousQuestion: "b", critere: [t("Verdict justifié (rapports ou différences constants) : "), ...reponse(e, "verdict")], points: 0.75 },
      { sousQuestion: "c", critere: [t("Paramètres exacts : "), ...reponse(e, "parametres")], points: 1.5 },
      { sousQuestion: "d", critere: [t("Prévision : "), ...reponse(e, "prevision")], points: 1 },
    ],
    erreursFrequentes: [
      { description: [t(expo ? "Différences calculées au lieu de rapports : modèle déclaré linéaire" : "Modèle déclaré exponentiel parce que les mesures varient vite")], cout: "0 pt sur le verdict, suite notée sans double pénalité" },
      ...(e.h === 2 ? [{ description: [t(expo ? "Rapport sur deux unités pris pour " : "Différence sur deux unités prise pour "), f(expo ? "a" : "m")], cout: "−0,75" }] : []),
      { description: [t("Paramètres arrondis, ou arrondi en cours de calcul de la prévision")], cout: "−0,5" },
    ],
    reponsesAcceptees: [[t("Paramètres sous forme décimale ou fractionnaire ; rapports exacts ou arrondis au centième")]],
  };
}

/** Pas de cas particulier ; verdict libre ; calculatrice indispensable. */
export function profilModeleTableau(e: E): ProfilInstance {
  return { casParticulier: null, calcul: "calculatrice", forme: e.variante };
}

export const adaptateurEvaluationModeleTableau: AdaptateurFeuilleExercices<E> = {
  titreDocument: "Modèle exponentiel lu dans un tableau — Évaluation",
  nomFichierBase: "modele-exponentiel-tableau",
  genererInstance: genererExerciceModeleTableau,
  catalogueVariantes: CATALOGUE_VARIANTES,
  genererInstanceAvecVariante: construireAvecVariante,
  construireEnonce,
  construireCorrection,
  criteresDifficulte,
  reponseBreve,
  correctionDetaillee: correctionDetailleeModeleTableau,
  bareme,
  enoncePapier,
  profilInstance: profilModeleTableau,
  calculatriceIndispensable: true,
};
