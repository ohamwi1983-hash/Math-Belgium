import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDomaineParImage } from "../../core5e/domaineParImage";
import { contient, ensembleL, qTL } from "../../moteur5e/ensembleSaisi";
import { argumentF, conditionDomF, expressionF, expressionG, reponse, symboleCondition } from "../../ui5e/formatDomaineParImage";
import { q, qDiv, qVal } from "../../ui5e/nombresTrigo";

/**
 * Corrigé détaillé « comme au tableau » de `5gen62`, une lettre par écran : a) Im g (signe d'un
 * carré, d'une valeur absolue, d'une racine, antécédent d'une affine, 1/x ≠ 0) ; b) dom f (condition
 * résolue ligne à ligne, sens changé en multipliant par −1) ; c) Im g ∩ dom f ; d) dom(f∘g) : la
 * condition g(x) ∈ dom f résolue en x, vérifiée sur un x du domaine. Source unique de l'écran et du
 * papier.
 */

type E = ExerciceDomaineParImage;
const t = texte;
const f = latex;
const COURS3 = "(cours, point 3)";
const plusK = (k: number) => (k === 0 ? "" : k > 0 ? `+${k}` : `${k}`);
const ajout = (k: number) => (k > 0 ? `on retranche ${k}` : `on ajoute ${-k}`);
const inverser = (s: string) => ({ "\\geq": "\\leq", "\\leq": "\\geq", ">": "<", "<": ">", "\\neq": "\\neq" } as Record<string, string>)[s];

function etapeImage(e: E): EtapeCorrection[] {
  const sq = "a";
  const g = e.g;
  const k = g.k;
  const L: LigneCalcul[] = [];
  let utilises: ReturnType<typeof t>[] = [];
  switch (g.famille) {
    case "carre":
      L.push(ligne("x^2\\geq 0", "un carré est positif ou nul, pour tout réel x"));
      if (k !== 0) L.push(ligne(`x^2${plusK(k)}\\geq ${k}`, k > 0 ? `on ajoute ${k}` : `on retranche ${-k}`));
      L.push(ligne(`g(0)=${k}`, "valeur atteinte en x = 0 ; au-dessus, toute valeur est atteinte"));
      utilises = [t("Un carré est positif ou nul ; x² prend toutes les valeurs positives (cours, intro).")];
      break;
    case "oppCarre":
      L.push(ligne("x^2\\geq 0", "pour tout réel x"));
      L.push(ligne("-x^2\\leq 0", "on multiplie par −1 : le sens change"));
      if (k !== 0) L.push(ligne(`-x^2${plusK(k)}\\leq ${k}`, k > 0 ? `on ajoute ${k}` : `on retranche ${-k}`));
      L.push(ligne(`g(0)=${k}`, "valeur atteinte en x = 0 ; au-dessous, toute valeur est atteinte"));
      utilises = [t("Un carré est positif ou nul, donc son opposé est négatif ou nul.")];
      break;
    case "absolue":
      L.push(ligne("\\left|x\\right|\\geq 0", "une valeur absolue est positive ou nulle"));
      if (k !== 0) L.push(ligne(`\\left|x\\right|${plusK(k)}\\geq ${k}`, k > 0 ? `on ajoute ${k}` : `on retranche ${-k}`));
      L.push(ligne(`g(0)=${k}`, "valeur atteinte en x = 0 ; au-dessus, toute valeur est atteinte"));
      utilises = [t("Une valeur absolue est positive ou nulle et prend toutes les valeurs positives.")];
      break;
    case "affine": {
      const m = g.m;
      const p = g.k;
      L.push(ligne(`g\\left(\\dfrac{y${p === 0 ? "" : p > 0 ? `-${p}` : `+${-p}`}}{${m}}\\right)=y`, "tout réel y a un antécédent : la pente n'est pas nulle"));
      utilises = [t("Une fonction affine non constante prend toutes les valeurs réelles.")];
      break;
    }
    case "racine":
      L.push(ligne("\\sqrt{x}\\geq 0", "une racine carrée est positive ou nulle, pour x ≥ 0"));
      if (k !== 0) L.push(ligne(`\\sqrt{x}${plusK(k)}\\geq ${k}`, k > 0 ? `on ajoute ${k}` : `on retranche ${-k}`));
      L.push(ligne(`g(0)=${k}`, "valeur atteinte en x = 0 ; au-dessus, toute valeur est atteinte"));
      utilises = [t("Une racine carrée est positive ou nulle et prend toutes les valeurs positives ; dom g = [0 ; +∞[.")];
      break;
    case "inverse":
      L.push(ligne("\\dfrac{1}{x}\\neq 0", "numérateur 1 : le quotient n'est jamais nul"));
      if (k !== 0) L.push(ligne(`\\dfrac{1}{x}${plusK(k)}\\neq ${k}`, k > 0 ? `on ajoute ${k}` : `on retranche ${-k}`));
      L.push(ligne(`g\\left(\\dfrac{1}{y${k === 0 ? "" : k > 0 ? `-${k}` : `+${-k}`}}\\right)=y`, `pour tout réel y ≠ ${k}`.replace("-", "−")));
      utilises = [t("Un quotient de numérateur 1 n'est jamais nul ; toute autre valeur est atteinte ; dom g = ℝ∖{0}.")];
      break;
  }
  return [
    utilise(sq, [t("L'image de g est l'ensemble de toutes les valeurs g(x) quand x parcourt dom g. "), ...utilises]),
    calcul(sq, L),
    resultat(sq, reponse(e, "image")),
    piege(sq, [t("Donner dom g (les nombres de départ) à la place de l'image (les valeurs d'arrivée).")]),
  ];
}

function etapeDomaine(e: E): EtapeCorrection[] {
  const sq = "b";
  const fe = e.f;
  const c = fe.c;
  const L: LigneCalcul[] = [ligne(conditionDomF(fe), fe.famille === "inverse" ? "le dénominateur ne s'annule pas" : fe.famille.startsWith("inverseRacine") ? "racine au dénominateur : radicande > 0" : "radicande positif ou nul")];
  const s = symboleCondition(fe);
  if (fe.famille === "racineMoins" || fe.famille === "inverseRacineMoins") {
    const s0 = fe.famille === "racineMoins" ? "\\geq" : ">";
    if (c !== 0) L.push(ligne(`-x${s0}${-c}`, `on retranche ${c}`.replace("retranche -", "ajoute ")));
    L.push(ligne(`x${s}${c}`, "on multiplie par −1 : le sens change"));
  } else if (c !== 0) L.push(ligne(`x${s}${c}`, c > 0 ? `on ajoute ${c}` : `on retranche ${-c}`));
  return [
    utilise(sq, [t(fe.famille === "inverse" ? "Un dénominateur ne peut pas être nul (cours, point 1)." : fe.famille.startsWith("inverseRacine") ? "Racine au dénominateur : radicande positif ou nul et racine non nulle, donc radicande strictement positif (cours, point 1)." : "Une racine carrée n'existe que pour un radicande positif ou nul (cours, point 1).")]),
    calcul(sq, L),
    resultat(sq, reponse(e, "domaine")),
    piege(sq, fe.famille.startsWith("inverseRacine") ? [t("Garder la borne "), f(`${c}`), t(" : la racine y vaut 0, au dénominateur.")] : fe.famille === "inverse" ? [t("Exclure un intervalle : seule la valeur qui annule le dénominateur est retirée.")] : [t("Ouvrir le crochet en "), f(`${c}`), t(" : "), f("\\sqrt{0}=0"), t(" existe.")]),
  ];
}

function etapeValeurs(e: E): EtapeCorrection[] {
  const sq = "c";
  return [
    utilise(sq, [t("f ne peut recevoir que des nombres de son domaine : on garde les valeurs de g qui sont aussi dans dom f — une intersection "), t(COURS3), t(".")]),
    calcul(sq, [ligne(`\\operatorname{Im} g\\cap\\operatorname{dom} f=${ensembleL(e.imG)}\\cap ${ensembleL(e.domF)}`), ligne(`=${ensembleL(e.valeurs)}`, e.cas === "vide" ? "aucune valeur commune" : e.cas === "inclus" ? "Im g est entièrement dans dom f" : "partie commune des deux ensembles")]),
    resultat(sq, reponse(e, "valeurs")),
    piege(sq, [t("Prendre la réunion des deux ensembles au lieu de leur intersection.")]),
  ];
}

/** Résolution en x de « g(x) ◇ c » (◇ = condition de dom f). */
function lignesCondition(e: E): LigneCalcul[] {
  const g = e.g;
  const c = e.f.c;
  const s = symboleCondition(e.f);
  const L: LigneCalcul[] = [ligne(conditionDomF(e.f, `\\left(${expressionG(g)}\\right)`), "condition 2 : g(x) appartient à dom f"), ligne(`${expressionG(g)}${s}${c}`, "même condition, écrite sur g(x)")];
  const d = c - g.k;
  const kJust = g.k !== 0 ? ajout(g.k) : "";
  switch (g.famille) {
    case "carre":
    case "oppCarre":
    case "absolue": {
      let s2 = s;
      let d2 = d;
      const base = g.famille === "absolue" ? "\\left|x\\right|" : "x^2";
      if (g.famille === "oppCarre") {
        if (g.k !== 0) L.push(ligne(`-x^2${s}${d}`, kJust));
        s2 = inverser(s);
        d2 = -d;
        L.push(ligne(`x^2${s2}${d2}`, "on multiplie par −1 : le sens change"));
      } else if (g.k !== 0) L.push(ligne(`${base}${s}${d}`, kJust));
      if (g.famille !== "absolue" && d2 > 0) L.push(ligne(`\\left|x\\right|${s2}${Math.round(Math.sqrt(d2))}`, "racine carrée des deux membres positifs"));
      return L;
    }
    case "affine": {
      const m = g.m;
      if (g.k !== 0) L.push(ligne(`${m === 1 ? "" : m === -1 ? "-" : m}x${s}${c - g.k}`, kJust));
      if (m !== 1) L.push(ligne(`x${m < 0 ? inverser(s) : s}${qTL(qDiv(q(c - g.k), q(m)))}`, m < 0 ? `on divise par ${m} (négatif) : le sens change`.replace("-", "−") : `on divise par ${m}`));
      return L;
    }
    case "racine":
      if (g.k !== 0) L.push(ligne(`\\sqrt{x}${s}${d}`, kJust));
      if (d >= 0) L.push(ligne(`x${s}${d * d}`, "deux membres positifs : on élève au carré (avec x ≥ 0)"));
      return L;
    case "inverse":
      if (g.k !== 0) L.push(ligne(`\\dfrac{1}{x}${s}${d}`, kJust));
      return L;
  }
}

function justificationFinale(e: E): string {
  if (e.cas === "vide") return "aucun x ne convient";
  switch (e.g.famille) {
    case "carre":
    case "oppCarre":
    case "absolue":
      return "distance de x à 0 ; x et −x ont la même image";
    case "racine":
      return "avec x ≥ 0 (dom g)";
    case "inverse":
      return "1/x selon le signe de x, avec x ≠ 0 (dom g)";
    default:
      return "on écrit l'ensemble des solutions";
  }
}

function etapeComposee(e: E): EtapeCorrection[] {
  const sq = "d";
  const L = [...lignesCondition(e), ligne(`x\\in ${ensembleL(e.domaine)}`, justificationFinale(e))];
  const r: EtapeCorrection[] = [
    utilise(sq, [t("dom(f∘g) : x doit appartenir à dom g, puis g(x) à dom f — la double condition "), t(COURS3), t(".")]),
    calcul(sq, L),
  ];
  r.push(resultat(sq, reponse(e, "composee")));
  if (e.xTest !== null) {
    const x0 = e.xTest;
    const v = gVal(e, x0);
    r.push(verification(sq, [t("Avec "), f(`x=${x0}`), t(", qui est dans le domaine :")], [ligne(`g(${x0})=${substitutionG(e, x0)}`), ligne(`=${qTL(v)}`, "nombre de dom f : f(g(x)) existe"), ligne(`f\\big(g(${x0})\\big)=${expressionF(e.f, qTL(v).startsWith("-") ? `(${qTL(v)})` : qTL(v))}`)]));
  }
  r.push(piege(sq, e.cas === "vide" ? [t("Chercher un domaine non vide : quand l'image de g ne rencontre pas dom f, "), f("\\operatorname{dom}(f\\circ g)=\\varnothing"), t(" est la bonne réponse.")] : [t("Donner les valeurs "), f("g(x)"), t(" au lieu des "), f("x"), t(", ou lire le domaine sur la formule simplifiée.")]));
  return r;
}

/** g(x₀) substitué, sans calculer (« (−2)^2−1 », « −2\\cdot 3+1 », « \\left|−2\\right|+1 »). */
function substitutionG(e: E, x0: number): string {
  const g = e.g;
  const p = x0 < 0 ? `(${x0})` : `${x0}`;
  const k = g.k === 0 ? "" : g.k > 0 ? `+${g.k}` : `${g.k}`;
  switch (g.famille) {
    case "carre":
      return `${p}^2${k}`;
    case "oppCarre":
      return `-${x0 === 0 ? "(0)" : p}^2${k}`;
    case "absolue":
      return `\\left|${x0}\\right|${k}`;
    case "affine":
      return `${g.m}\\cdot ${p}${k}`;
    case "racine":
      return `\\sqrt{${x0}}${k}`;
    case "inverse":
      return `\\dfrac{1}{${x0}}${k}`;
  }
}

/** g(x₀) exact (x₀ entier du domaine). */
export function gVal(e: E, x0: number) {
  const g = e.g;
  switch (g.famille) {
    case "carre":
      return q(x0 * x0 + g.k);
    case "oppCarre":
      return q(-x0 * x0 + g.k);
    case "absolue":
      return q(Math.abs(x0) + g.k);
    case "affine":
      return q(g.m * x0 + g.k);
    case "racine": {
      const r = Math.round(Math.sqrt(x0));
      return q(r * r === x0 ? r + g.k : NaN);
    }
    case "inverse":
      return q(1 + g.k * x0, x0);
  }
}

export function correctionDetailleeDomaineParImage(e: E): EtapeCorrection[] {
  return [...etapeImage(e), ...etapeDomaine(e), ...etapeValeurs(e), ...etapeComposee(e)];
}

/** Contrôle (tests) : g(xTest) est bien dans dom f. */
export const verificationXTest = (e: E) => e.xTest === null || contient(e.domF, qVal(gVal(e, e.xTest)));
void argumentF;
