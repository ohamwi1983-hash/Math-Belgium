import katex from "katex";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceDomaineDefinition, ExerciceFractionSousRacine, SlotCE } from "../../core5e/domaineDefinition.types";
import { phaseApresCE } from "../../moteur5e/typesDomaineDefinition";
import { formatConditionsLatex, formatConditionsToujoursVraiesLatex, formatDomfLatex, formatEnsembleReelLatex, formatResolutionAttendueLatex, formatSlotConditionLatex, formatValeurLatex } from "../../ui5e/formatDomaineDefinition";
import { finaliserCorrige } from "../../ui5e/corrigeTrigonometrie1";
import { COURS_DOMAINE, accoladesLatex, degre, ensFacteur, ensLatex, etListe, jf, lignesCondition, nb, substituer, t, f, valeurPoly, type Fragments, type Rel } from "../../ui5e/corrigeFonctions1";
import { normaliserLimites } from "../../../../lib/notationLog";

/**
 * Corrigé détaillé « comme au tableau » de 5gen1 (domaine de définition) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN, dans l'ordre du moteur
 * (`phaseApresCE`) : a = conditions d'existence, (b = résolution : √N/D et fraction sous racine
 * seulement), dernière = domaine. Chaque condition est résolue en chaîne « ⟺ » (on retire, on
 * divise ; trinôme par Δ et règle du signe), puis l'intersection est écrite. « Résultat » = la
 * réponse de l'écran (`formatConditionsLatex`, `formatResolutionAttendueLatex`, tableau de signes,
 * `formatDomfLatex`). SANS `docx` : importé par l'adaptateur ET par `App5gen1.tsx`.
 */

export interface LettresDomaine {
  ce: string;
  resolution: string | null;
  domaine: string;
}

/** Lettres d'étapes, dans l'ordre des écrans : a = conditions, (b = résolution), dernière = domaine. */
export function lettresDomaine(exercice: ExerciceDomaineDefinition): LettresDomaine {
  const resolutionSeparee = phaseApresCE(exercice) === "resolution";
  return { ce: "a", resolution: resolutionSeparee ? "b" : null, domaine: resolutionSeparee ? "c" : "b" };
}

/** Lettre de l'écran d'une phase du moteur (« ce », « resolution », « domf »). */
export function lettrePhaseDomaine(exercice: ExerciceDomaineDefinition, phase: string): string {
  const l = lettresDomaine(exercice);
  if (phase === "ce") return l.ce;
  if (phase === "resolution") return l.resolution ?? l.domaine;
  return l.domaine;
}

const relSlot = (slot: SlotCE): Rel => (slot.symboleAttendu === "≠" ? "≠" : slot.symboleAttendu === ">" ? ">" : "≥");

/** Facteurs « (x − r) » d'un dénominateur écrit sous forme factorisée (« (x - 2)(x + 3)^2 »). */
function facteursFactorises(latex: string): { latex: string; racine: number }[] | null {
  const l = latex.trim();
  if (!l.startsWith("(") && !/^x(\^2)?\(/.test(l)) return null;
  const facteurs = [...l.matchAll(/\(x\s*([+-])\s*(\d+)\)/g)].map((m) => ({ latex: `x ${m[1]} ${m[2]}`, racine: m[1] === "-" ? Number(m[2]) : -Number(m[2]) }));
  if (/^x(\^2)?\(/.test(l)) facteurs.unshift({ latex: "x", racine: 0 });
  return facteurs.length ? facteurs : null;
}

/** Résolution d'une condition « slot REL 0 » : chaîne « ⟺ » jusqu'à l'ensemble des x qui la vérifient. */
function resolutionSlot(slot: SlotCE): { lignes: LigneCalcul[]; ensemble: ReturnType<typeof lignesCondition>["ensemble"]; racines: number[] } {
  const rel = relSlot(slot);
  const facteurs = rel === "≠" ? facteursFactorises(slot.latex) : null;
  if (facteurs) {
    const racines = [...new Set(facteurs.map((x) => x.racine))].sort((a, b) => a - b);
    const lignes: LigneCalcul[] = facteurs.map((x) => ligne(x.latex === "x" ? "x=0" : `${x.latex}=0\\iff x=${nb(x.racine)}`, "un produit est nul si l'un de ses facteurs est nul"));
    lignes.push(ligne(`${slot.latex}\\neq 0\\iff x\\notin ${accoladesLatex(racines)}`, "on exclut les valeurs qui annulent un facteur"));
    return { lignes, ensemble: { forme: "prive_points", points: racines, morceaux: [] }, racines };
  }
  const justif = rel === "≠" ? "le dénominateur doit être non nul" : rel === ">" ? "radicande strictement positif" : "radicande positif ou nul";
  return lignesCondition(slot.coeffs, slot.latex, rel, justif);
}

// ============================================================================
// Étape a — conditions d'existence.
// ============================================================================

function etapeConditions(e: ExerciceDomaineDefinition, l: string): EtapeCorrection[] {
  if (e.famille === "pasDeCE") {
    const racine = e.raison === "racineImpaire";
    return [
      utilise(l, [t(`Les deux opérations à surveiller sont la division (dénominateur non nul) et la racine d'indice pair (radicande positif ou nul) ; ${racine ? "une racine d'indice impair" : "une valeur absolue"} existe pour tout réel ${COURS_DOMAINE}.`)]),
      calcul(l, [ligne(`${e.argumentLatex}\\in\\mathbb{R}`, racine ? "une racine d'indice impair accepte tout réel, même négatif" : "la valeur absolue de tout réel existe")], [t("Aucune division par une expression en x, aucune racine d'indice pair :")]),
      resultat(l, [t("Aucune condition d'existence.")]),
      piege(l, [t(racine ? "Ne pas écrire de condition « ≥ 0 » : la racine cubique (ou cinquième) d'un nombre négatif existe." : "Ne pas inventer de condition : une valeur absolue est définie pour tout réel.")]),
    ];
  }
  const lignes: LigneCalcul[] = e.slots.map((slot) => {
    const j =
      slot.role === "denominateur"
        ? e.famille === "racineImpaireDenominateur"
          ? "dénominateur non nul (la racine d'indice impair, elle, existe toujours)"
          : "dénominateur non nul"
        : slot.symboleAttendu === ">"
          ? "radicande d'une racine paire, au dénominateur : strictement positif"
          : e.famille === "fractionSousRacine"
            ? "radicande d'une racine paire : positif ou nul"
            : "radicande d'une racine paire : positif ou nul";
    return ligne(formatSlotConditionLatex(slot), j);
  });
  const utiliseFr: Fragments = [t(`Un dénominateur ne vaut jamais 0 ; le radicande d'une racine d'indice pair est positif ou nul — strictement positif si la racine est au dénominateur. Une condition par opération à surveiller ${COURS_DOMAINE}.`)];
  const intro: Fragments =
    e.famille === "fractionSousRacine"
      ? [t("Le quotient sous la racine doit être positif ou nul, ET son dénominateur non nul (deux conditions) :")]
      : e.famille === "racineSurFraction" && e.structure === "racineSurD"
        ? [t("Une racine carrée au numérateur et une division : deux conditions indépendantes.")]
        : [];
  const res: Fragments = e.aucuneCE
    ? [t("Aucune condition qui exclut un réel ("), ...etListe(formatConditionsToujoursVraiesLatex(e)), t(" est toujours vraie, voir l'étape suivante).")]
    : [...etListe(formatConditionsLatex(e)), t(".")];
  const out: EtapeCorrection[] = [utilise(l, utiliseFr), calcul(l, lignes, intro), resultat(l, res)];
  if (e.famille === "racineImpaireDenominateur") out.push(piege(l, [t("La racine d'indice impair n'impose pas de radicande positif : seule la division compte.")]));
  else if (e.famille === "racineSurFraction" && e.structure === "nSurRacineD") out.push(piege(l, [t("La racine est au dénominateur : la condition est stricte ("), f(">0"), t("), car "), f("\\sqrt{0}=0"), t(" annulerait le dénominateur.")]));
  else if (e.famille === "fractionSousRacine") out.push(piege(l, [t("Écrire seulement le quotient positif ou nul ne suffit pas : le dénominateur non nul se pose à part.")]));
  return out;
}

// ============================================================================
// Étape b (√N/D, fraction sous racine) — résolution.
// ============================================================================

const CELLULE = "border:1px solid #555;padding:4px 10px;text-align:center;";
const k = (s: string) => katex.renderToString(normaliserLimites(s), { throwOnError: false });

/** Tableau de signes de N, D et N/D (figure du corrigé, `figureHtml`) — la grille de l'écran. */
export function tableauSignesHtml(e: ExerciceFractionSousRacine): string {
  const g = e.grille;
  const teteValeurs = ["-\\infty", ...e.racines.map(formatValeurLatex), "+\\infty"];
  const tete = [`<th style="${CELLULE}">${k("x")}</th>`];
  teteValeurs.forEach((v, i) => {
    tete.push(`<th style="${CELLULE}">${k(v)}</th>`);
    if (i < teteValeurs.length - 1) tete.push(`<th style="${CELLULE}"></th>`);
  });
  const ligneT = (label: string, valeurs: string[]) => {
    const cellules = [`<td style="${CELLULE}">${k(label)}</td>`, `<td style="${CELLULE}"></td>`];
    valeurs.forEach((v) => cellules.push(`<td style="${CELLULE}">${v === "-" ? "−" : v === "∄" ? "‖" : v}</td>`));
    cellules.push(`<td style="${CELLULE}"></td>`);
    return `<tr>${cellules.join("")}</tr>`;
  };
  return (
    `<table style="border-collapse:collapse;margin:6px auto;">` +
    `<tr>${tete.join("")}</tr>` +
    ligneT(e.numerateurLatex, g.ligneNumerateur) +
    ligneT(e.denominateurLatex, g.ligneDenominateur) +
    ligneT(`\\dfrac{${e.numerateurLatex}}{${e.denominateurLatex}}`, g.ligneQuotient) +
    `</table>`
  );
}

/** Racines d'un facteur (numérateur ou dénominateur) : « P(x) = 0 ⟺ x = r » ou Δ. */
function lignesRacines(p: number[], pLatex: string): LigneCalcul[] {
  if (degre(p) <= 1) {
    const r = lignesCondition(p, pLatex, "=", "on cherche où le facteur s'annule");
    return r.lignes;
  }
  const r = lignesCondition(p, pLatex, "=");
  return r.lignes.slice(0, -1);
}

function etapeResolution(e: ExerciceDomaineDefinition, l: string): EtapeCorrection[] {
  if (e.famille === "racineSurFraction" && e.structure === "racineSurD") {
    const [radicande, denominateur] = e.slots as [SlotCE, SlotCE];
    const n = resolutionSlot(radicande);
    const d = resolutionSlot(denominateur);
    const pieges: EtapeCorrection[] = [];
    if (degre(radicande.coeffs) === 1 && (radicande.coeffs[1] ?? 0) < 0) pieges.push(piege(l, [t("En divisant par le coefficient négatif de x, le sens de l'inégalité change.")]));
    return [
      utilise(l, [t(`On résout chaque condition séparément : une inéquation pour le radicande, une équation à exclure pour le dénominateur ${COURS_DOMAINE}.`)]),
      calcul(l, n.lignes, [], "Radicande"),
      calcul(l, d.lignes, [], "Dénominateur"),
      resultat(l, etListe(formatResolutionAttendueLatex(e) ?? [])),
      ...pieges,
    ];
  }
  if (e.famille === "fractionSousRacine") {
    const lignesN = lignesRacines(e.numerateur, e.numerateurLatex);
    const lignesD = lignesRacines(e.denominateur, e.denominateurLatex);
    return [
      utilise(l, [t(`Signe d'un quotient : tableau de signes du numérateur et du dénominateur ; le quotient n'existe pas là où le dénominateur s'annule ${COURS_DOMAINE}.`)]),
      calcul(l, lignesN, [], "Numérateur"),
      calcul(l, lignesD, e.denominateurSansRacineReelle ? [t("Le dénominateur ne s'annule jamais : il garde le signe de son coefficient de "), f("x^2"), t(".")] : [], "Dénominateur"),
      { ...resultat(l, [t("Tableau de signes du quotient (valeurs remarquables "), ...etListe(e.racines.map((r) => `x=${nb(r)}`)), t(") :")]), figureHtml: tableauSignesHtml(e) },
      verification(l, [t("Une valeur test dans chaque zone donne le signe de chaque facteur ; « ‖ » marque une racine du dénominateur.")]),
    ];
  }
  return [];
}

// ============================================================================
// Dernière étape — domaine.
// ============================================================================

function etapeDomaine(e: ExerciceDomaineDefinition, l: string, avecResolution: boolean): EtapeCorrection[] {
  const res = resultat(l, [f(formatDomfLatex(e.domf))]);
  if (e.famille === "pasDeCE") {
    return [
      utilise(l, [t("Sans condition d'existence, "), f("f(x)"), t(` se calcule pour tout réel ${COURS_DOMAINE}.`)]),
      calcul(l, [ligne(`\\operatorname{dom}f=\\mathbb{R}`, "aucune valeur à exclure")]),
      res,
    ];
  }
  if (avecResolution && e.famille === "racineSurFraction") {
    const d = e.resolutionDenominateur!;
    const dedans = e.exclusionDansIntervalle;
    const lignes = [
      ligne(`\\operatorname{dom}f=${ensFacteur(e.resolutionRadicande)}\\cap(\\mathbb{R}\\setminus\\{${nb(d)}\\})`, "les deux conditions à la fois"),
      ligne(`=${formatEnsembleReelLatex(e.domf)}`, dedans ? jf("on retire ", { l: nb(d) }, ", qui est dans l'intervalle") : jf({ l: nb(d) }, " n'est pas dans l'intervalle : rien à retirer")),
    ];
    return [
      utilise(l, [t(`Le domaine est l'intersection des solutions des deux conditions ${COURS_DOMAINE}.`)]),
      calcul(l, lignes),
      res,
      verification(l, [t("Au dénominateur : "), f(`${substituer(e.slots[1]!.latex, d)}=0`), t(" : la valeur "), f(nb(d)), t(" est bien exclue.")]),
      ...(dedans ? [piege(l, [t("La valeur qui annule le dénominateur reste exclue, même si elle vérifie la condition du radicande.")])] : []),
    ];
  }
  if (avecResolution && e.famille === "fractionSousRacine") {
    const zeroD = e.denominateurSansRacineReelle ? [] : e.racines.filter((r) => Math.abs(valeurPoly(e.denominateur, r)) < 1e-9);
    const q = `\\dfrac{${e.numerateurLatex}}{${e.denominateurLatex}}`;
    const lignes: LigneCalcul[] = [
      ligne(`${q}\\geq 0\\iff x\\in ${ensLatex(e.domf)}`, "colonnes « + » et « 0 » du tableau"),
      zeroD.length ? ligne(`${e.denominateurLatex}\\neq 0\\iff x\\notin ${accoladesLatex(zeroD)}`, "racines du dénominateur") : ligne(`${e.denominateurLatex}\\neq 0\\iff x\\in\\mathbb{R}`, "le dénominateur ne s'annule jamais"),
      ...(zeroD.length
        ? [
            ligne(`\\operatorname{dom}f=${ensFacteur(e.domf)}\\cap(\\mathbb{R}\\setminus${accoladesLatex(zeroD)})`, "les deux conditions à la fois"),
            ligne(`=${ensLatex(e.domf)}`, "les racines du dénominateur sont déjà exclues (‖ dans le tableau)"),
          ]
        : [ligne(`\\operatorname{dom}f=${ensLatex(e.domf)}`, "la seconde condition est toujours vraie")]),
    ];
    return [
      utilise(l, [t(`On garde les zones où le quotient est positif ou nul, sans les valeurs qui annulent le dénominateur ${COURS_DOMAINE}.`)]),
      calcul(l, lignes),
      res,
      piege(l, [t("Les valeurs qui annulent le dénominateur sont exclues (crochet ouvert), celles qui annulent seulement le numérateur sont incluses.")]),
    ];
  }
  if (e.famille === "fractionSousRacine") {
    // Aucune condition qui exclut un réel : numérateur et dénominateur sans racine, de même signe.
    const n = lignesCondition(e.numerateur, e.numerateurLatex, ">");
    const d = lignesCondition(e.denominateur, e.denominateurLatex, ">");
    return [
      utilise(l, [t("Un trinôme sans racine ("), f("\\Delta<0"), t(") garde le signe de son coefficient de "), f("x^2"), t(` ; un quotient de deux nombres positifs est positif ${COURS_DOMAINE}.`)]),
      calcul(l, n.lignes, [], "Numérateur"),
      calcul(l, d.lignes, [], "Dénominateur"),
      calcul(l, [ligne(`\\dfrac{${e.numerateurLatex}}{${e.denominateurLatex}}>0`, "quotient de deux nombres positifs, pour tout réel"), ligne(`\\operatorname{dom}f=\\mathbb{R}`, "les deux conditions sont toujours vraies")], [], "Conclusion"),
      res,
    ];
  }
  // Une seule condition (ou toutes résolues ici) : la résolution EST le domaine.
  const slot = e.slots[0]!;
  const r = resolutionSlot(slot);
  const lignes = [...r.lignes, ligne(`\\operatorname{dom}f=${ensLatex(e.domf)}`, r.racines.length === 0 && relSlot(slot) === "≠" ? "aucune valeur exclue" : "ensemble des x qui vérifient la condition")];
  const out: EtapeCorrection[] = [
    utilise(l, [
      t(
        relSlot(slot) === "≠"
          ? `On cherche les valeurs qui annulent le dénominateur, puis on les exclut ${COURS_DOMAINE}.`
          : degre(slot.coeffs) <= 1
            ? `On résout l'inéquation du premier degré : on isole x, le sens change si on divise par un nombre négatif ${COURS_DOMAINE}.`
            : `Signe d'un trinôme : racines par Δ, puis signe de a à l'extérieur des racines ${COURS_DOMAINE}.`,
      ),
    ]),
    calcul(l, lignes),
    res,
  ];
  // Vérification : une valeur exclue annule le dénominateur ; une borne annule le radicande.
  if (r.racines.length) {
    const v = r.racines[0]!;
    if (relSlot(slot) === "≠") out.push(verification(l, [t("Pour "), f(`x=${nb(v)}`), t(" : "), f(`${substituer(slot.latex, v)}=0`), t(", cette valeur est bien exclue.")]));
    else out.push(verification(l, [t("Pour "), f(`x=${nb(v)}`), t(" : "), f(`${substituer(slot.latex, v)}=0`), t(relSlot(slot) === ">" ? " : la borne est exclue (on diviserait par 0)." : " : la borne est incluse, car la racine carrée de 0 existe.")]));
  }
  if (e.aucuneCE) out.push(piege(l, [t("Ne pas exclure de valeur au hasard : ce dénominateur ne s'annule jamais ("), f("\\Delta<0"), t(").")]));
  else if (degre(slot.coeffs) === 1 && (slot.coeffs[1] ?? 0) < 0 && relSlot(slot) !== "≠") out.push(piege(l, [t("En divisant par le coefficient négatif de x, le sens de l'inégalité change.")]));
  else if (relSlot(slot) === "≥") out.push(piege(l, [t("Le radicande peut valoir 0 : la borne est incluse (crochet fermé).")]));
  else if (relSlot(slot) === ">") out.push(piege(l, [t("Condition stricte : la borne est exclue (crochet ouvert).")]));
  else out.push(piege(l, [t("Toute valeur qui annule le dénominateur est exclue : on écrit ℝ privé de ces valeurs.")]));
  return out;
}

export function correctionDetailleeDomaineDefinition(e: ExerciceDomaineDefinition): EtapeCorrection[] {
  const l = lettresDomaine(e);
  return finaliserCorrige([...etapeConditions(e, l.ce), ...(l.resolution ? etapeResolution(e, l.resolution) : []), ...etapeDomaine(e, l.domaine, l.resolution !== null)]);
}

/** Texte du piège principal (barème : erreur fréquente). */
export function piegeDomaineDefinition(e: ExerciceDomaineDefinition): string {
  switch (e.famille) {
    case "pasDeCE":
      return "Ne pas inventer de condition : une racine d'indice impair et une valeur absolue sont définies pour tout réel.";
    case "rationnelle":
    case "racineImpaireDenominateur":
      if (e.aucuneCE) return "Ne pas exclure de valeur au hasard : ce dénominateur ne s'annule jamais (Δ < 0).";
      return e.famille === "racineImpaireDenominateur"
        ? "Seul le dénominateur compte : la racine d'indice impair n'impose pas de radicande positif."
        : "Toute valeur qui annule le dénominateur est exclue : on écrit ℝ privé de ces valeurs.";
    case "irrationnelleSimple":
      if (degre(e.slots[0].coeffs) === 1 && (e.slots[0].coeffs[1] ?? 0) < 0) return "En divisant par le coefficient négatif de x, le sens de l'inégalité change.";
      return "Le radicande peut valoir 0 : la borne est incluse (≥ 0, crochet fermé).";
    case "racineSurFraction":
      return e.structure === "nSurRacineD"
        ? "La racine est au dénominateur : la condition est stricte (> 0), la borne est exclue."
        : "La valeur qui annule le dénominateur reste exclue, même si elle appartient à l'intervalle du radicande.";
    case "fractionSousRacine":
      return "Les valeurs qui annulent le dénominateur sont exclues (crochet ouvert), celles qui annulent seulement le numérateur sont incluses.";
  }
}
