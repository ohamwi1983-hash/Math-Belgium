import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceLogarithmesProblemes, ExerciceLogProbA, ExerciceLogProbB, ExerciceLogProbC, ExerciceLogProbE, ExerciceLogProbF } from "../../core6e/logarithmesProblemes.types";
import type { PhaseLogarithmesProblemes } from "../../moteur6e/typesLogarithmesProblemes";
import { aideNiveau1, formatReponseAttenduePhaseLatex, phasesPourExercice } from "../../ui6e/formatLogarithmesProblemes";
import { COURS_PROBLEMES, COURS_PROPRIETES, arrondi, dec, estExact, fragmentsAide, nt, par, sci, vaut } from "../../ui6e/corrigeLogarithmes2";
import { CONTEXTES_A_CROISSANCE, CONTEXTES_A_DECROISSANCE, CONTEXTES_A_TAUX, CONTEXTES_A_TAUX_DECROISSANCE, CONTEXTES_B, CONTEXTES_F } from "./contextes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen22` (logarithmes : problèmes) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran réellement traversé
 * (`phasesPourExercice`, famille E variable par instance) ; chaque étape : Ce qu'on utilise (aide de
 * l'écran + renvoi au cours), Calcul (une transformation par ligne), Résultat (réponse de l'écran,
 * `formatReponseAttenduePhaseLatex`, précédée de ce qu'elle désigne), Vérification quand elle est
 * parlante, Piège. Nombres tirés de l'instance (valeurs affichées à l'élève : seuils, v₂ arrondi,
 * a ≈ 0,667…), jamais recopiés.
 */

type E = ExerciceLogarithmesProblemes;
const t = texte;
const f = latex;
const LETTRES = "abcd";

/** Coefficient devant une lettre : 1 → « », −1 → « - ». */
function coef(x: number, d = 4): string {
  if (x === 1) return "";
  if (x === -1) return "-";
  return dec(x, d);
}

/** Réponse de l'écran (une ou plusieurs formules). */
function rep(e: E, phase: PhaseLogarithmesProblemes): string[] {
  return formatReponseAttenduePhaseLatex(e, phase);
}

function uniteTemps(e: E): string {
  switch (e.famille) {
    case "A":
      if (e.sousType === "resoudreT") return (e.croissance ? CONTEXTES_A_CROISSANCE : CONTEXTES_A_DECROISSANCE).find((c) => c.id === e.contexteId)?.unite ?? "";
      if (e.sousType === "resoudreTaux") return CONTEXTES_A_TAUX.find((c) => c.id === e.contexteId)?.unite ?? "";
      return CONTEXTES_A_TAUX_DECROISSANCE.find((c) => c.id === e.contexteId)?.unite ?? "";
    case "B":
      return CONTEXTES_B.find((c) => c.id === e.contexteId)?.unite ?? "";
    case "C":
      return e.unite;
    case "F":
      return CONTEXTES_F.find((c) => c.id === e.contexteId)?.unite ?? "";
    case "E":
      return "";
  }
}

interface Etape {
  utilise: FragmentConsigne[];
  blocs: { lignes: LigneCalcul[]; intro?: FragmentConsigne[]; label?: string }[];
  resultat: FragmentConsigne[];
  verification?: { texte: FragmentConsigne[]; lignes?: LigneCalcul[] };
  pieges: (string | FragmentConsigne[])[];
}

// ============================================================================
// Famille A.
// ============================================================================

function relA(e: ExerciceLogProbA & { sousType: "resoudreT" }): string {
  return e.sens === ">=" ? "\\geq" : "\\leq";
}

function etapeA(e: ExerciceLogProbA, phase: PhaseLogarithmesProblemes): Etape {
  const aide = fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES);
  if (e.sousType === "resoudreT") {
    const r = dec(e.r, 4);
    const rel = relA(e);
    const q1 = arrondi(e.cible1Affiche / e.Q0, 4);
    const unite = uniteTemps(e);
    if (phase === "aEcran1") {
      return {
        utilise: aide,
        blocs: [
          {
            lignes: [
              ligne(`r=1${e.croissance ? "+" : "-"}\\dfrac{${e.p}}{100}`, `${e.croissance ? "hausse" : "baisse"} de ${nt(e.p)} % par période`),
              ligne(`=${r}`),
              ligne(`Q(t)=${e.Q0}\\cdot ${r}^{\\,t}`, "quantité après t périodes"),
              ligne(`${e.Q0}\\cdot ${r}^{\\,t}${rel}${e.cible1Affiche}`, e.croissance ? "la quantité doit dépasser le seuil" : "la quantité doit tomber sous le seuil"),
            ],
          },
        ],
        resultat: [t("Inéquation : "), f(rep(e, phase)[0]!)],
        pieges: [],
      };
    }
    if (phase === "aEcran2") {
      return {
        utilise: [t("On divise les deux membres par "), f(`Q_0=${e.Q0}`), t(` : c'est un nombre strictement positif, le sens de l'inégalité ne change pas ${COURS_PROBLEMES}.`)],
        blocs: [
          {
            lignes: [
              ligne(`${e.Q0}\\cdot ${r}^{\\,t}${rel}${e.cible1Affiche}`, "étape 1"),
              ligne(`${r}^{\\,t}${rel}\\dfrac{${e.cible1Affiche}}{${e.Q0}}`, `on divise par ${e.Q0} > 0`),
              ligne(`${r}^{\\,t}${rel}${dec(q1, 4)}`, "quotient arrondi au dix-millième"),
            ],
          },
        ],
        resultat: [t("Terme isolé : "), f(rep(e, phase)[0]!)],
        pieges: [],
      };
    }
    // aEcran3 : passage au logarithme, puis arrondi à l'entier supérieur.
    const decroit = e.r < 1;
    const lignesSeuil = (_q: number, cible: number, tExact: number, tRep: number, indice: string): LigneCalcul[] => {
      const qL = `\\dfrac{${cible}}{${e.Q0}}`;
      const relApresLn = rel;
      const relFinal = "\\geq";
      return [
        ligne(`${r}^{\\,t}${rel}${qL}`, indice === "_2" ? [t("on divise "), f(`${e.Q0}\\cdot ${r}^{\\,t}${rel}${cible}`), t(` par ${e.Q0}`)] : "étape 2, quotient non arrondi"),
        ligne(`\\ln\\left(${r}^{\\,t}\\right)${relApresLn}\\ln\\left(${qL}\\right)`, "ln est strictement croissante"),
        ligne(`t\\ln(${r})${relApresLn}\\ln\\left(${qL}\\right)`, "ln(aⁿ) = n ln a"),
        ligne(`t${indice}${relFinal}\\dfrac{\\ln\\left(${qL}\\right)}{\\ln(${r})}`, decroit ? `on divise par ln(${nt(e.r, 4)}) < 0 : le sens change` : `on divise par ln(${nt(e.r, 4)}) > 0`),
        ligne(`\\approx ${dec(tExact, 2)}`),
        ligne(`t${indice}=${tRep}`, `premier entier supérieur ou égal à ${nt(tExact, 2)}`),
      ];
    };
    const blocs: Etape["blocs"] = [
      {
        lignes: lignesSeuil(q1, e.cible1Affiche, e.t1Exact, e.t1Reponse, e.variante === "simple" ? "" : "_1"),
        ...(e.variante === "simple" ? {} : { label: `Seuil ${e.cible1Affiche}` }),
      },
    ];
    if (e.variante === "fenetre") blocs.push({ lignes: lignesSeuil(arrondi(e.cible2Affiche / e.Q0, 4), e.cible2Affiche, e.t2Exact, e.t2Reponse, "_2"), label: `Seuil ${e.cible2Affiche}` });
    const verif = (tRep: number, cible: number): LigneCalcul[] => {
      const apres = e.Q0 * Math.pow(e.r, tRep);
      const avant = e.Q0 * Math.pow(e.r, tRep - 1);
      const relStrict = e.sens === ">=" ? ">" : "<";
      const relNon = e.sens === ">=" ? "<" : ">";
      return [
        ligne(`${e.Q0}\\cdot ${r}^{${tRep}}\\approx ${dec(apres, 0)}`, `après ${tRep} périodes`),
        ligne(`${relStrict}${cible}`, "seuil atteint"),
        ligne(`${e.Q0}\\cdot ${r}^{${tRep - 1}}\\approx ${dec(avant, 0)}`, `après ${tRep - 1} périodes`),
        ligne(`${relNon}${cible}`, "pas encore"),
      ];
    };
    const verifLignes = [...verif(e.t1Reponse, e.cible1Affiche), ...(e.variante === "fenetre" ? verif(e.t2Reponse, e.cible2Affiche) : [])];
    const toutesSures = [e.t1Reponse, ...(e.variante === "fenetre" ? [e.t2Reponse] : [])].every((tr, i) => {
      const cible = i === 0 ? e.cible1Affiche : e.cible2Affiche;
      const apres = e.Q0 * Math.pow(e.r, tr);
      const avant = e.Q0 * Math.pow(e.r, tr - 1);
      const ok = (v: number, atteint: boolean) => (e.sens === ">=" ? (atteint ? Math.round(v) > cible : Math.round(v) < cible) : atteint ? Math.round(v) < cible : Math.round(v) > cible);
      return ok(apres, true) && ok(avant, false);
    });
    return {
      utilise: [t("On applique ln aux deux membres (ln est strictement croissante, le sens est conservé), puis "), f("\\ln\\left(a^{n}\\right)=n\\ln a"), t(` ; on isole t ${COURS_PROPRIETES}. Une période entamée ne compte pas : on arrondit à l'entier supérieur.`)],
      blocs,
      resultat: e.variante === "simple" ? [t(`Nombre entier de périodes (${unite}) : `), f(rep(e, phase)[0]!)] : [t(`Nombres entiers de périodes (${unite}) : `), f(rep(e, phase)[0]!), t(" et "), f(rep(e, phase)[1]!)],
      ...(toutesSures ? { verification: { texte: [t("On calcule la quantité juste après et juste avant :")], lignes: verifLignes } } : {}),
      pieges: [...(decroit ? ["ln(r) < 0 car r < 1 : diviser par ln(r) renverse le sens de l'inégalité."] : []), "Arrondir t à l'entier SUPÉRIEUR : une période entamée ne suffit pas à atteindre le seuil."],
    };
  }
  if (e.sousType === "resoudreTaux") {
    const q = arrondi(e.cibleAffiche / e.Q0, 4);
    if (phase === "aEcran1")
      return {
        utilise: aide,
        blocs: [{ lignes: [ligne(`Q(n)=Q_0\\cdot(1+i)^{n}`, "capital après n années d'intérêts composés"), ligne(`${e.Q0}\\cdot(1+i)^{${e.n}}=${e.cibleAffiche}`, `Q₀ = ${e.Q0}, n = ${e.n}, cible ${e.cibleAffiche}`)] }],
        resultat: [t("Équation : "), f(rep(e, phase)[0]!)],
        pieges: [],
      };
    if (phase === "aEcran2")
      return {
        utilise: fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES),
        blocs: [{ lignes: [ligne(`${e.Q0}\\cdot(1+i)^{${e.n}}=${e.cibleAffiche}`, "étape 1"), ligne(`(1+i)^{${e.n}}=\\dfrac{${e.cibleAffiche}}{${e.Q0}}`, `on divise par ${e.Q0}`), ligne(vaut(e.cibleAffiche / e.Q0, 4), "arrondi au dix-millième")] }],
        resultat: [t("Puissance isolée : "), f(rep(e, phase)[0]!)],
        pieges: [],
      };
    return {
      utilise: [t(`L'inconnue est dans la base : on prend la racine ${e.n}-ième des deux membres (1 + i > 0), comme `), f("x^{n}=c\\iff x=\\sqrt[n]{c}"), t(` pour x > 0 ${COURS_PROBLEMES}.`)],
      blocs: [
        {
          lignes: [
            ligne(`(1+i)^{${e.n}}=${dec(q, 4)}`, "étape 2"),
            ligne(`1+i=\\sqrt[${e.n}]{${dec(q, 4)}}`, `racine ${e.n}-ième, 1 + i > 0`),
            ligne(`i=\\sqrt[${e.n}]{${dec(q, 4)}}-1`, "on retranche 1"),
            ligne(`\\approx ${dec(e.i, 4)}`),
            ligne(`\\approx ${dec(100 * e.i, 2)}\\,\\%`, "en pourcentage"),
          ],
        },
      ],
      resultat: [t("Taux annuel : "), f(rep(e, phase)[0]!)],
      pieges: ["L'inconnue i est dans la base (1 + i) : on prend une racine n-ième, pas un logarithme."],
    };
  }
  // tauxDecroissance
  const reste = arrondi(e.fraction * e.Q0, 2);
  if (phase === "aEcran1")
    return {
      utilise: aide,
      blocs: [
        {
          lignes: [
            ligne(`Q(t)=${e.Q0}\\cdot e^{-kt}`, "décroissance continue"),
            ligne(`Q(${e.h})=${dec(e.fraction, 2)}\\times ${e.Q0}`, `il reste ${nt(100 * e.fraction, 1)} % après ${e.h} h`),
            ligne(`=${dec(reste, 2)}`),
            ligne(`${e.Q0}\\cdot e^{-${e.h}k}=${dec(reste, 2)}`, `on remplace t par ${e.h}`),
          ],
        },
      ],
      resultat: [t("Équation : "), f(rep(e, phase)[0]!)],
      pieges: [],
    };
  if (phase === "aEcran2")
    return {
      utilise: fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES),
      blocs: [{ lignes: [ligne(`${e.Q0}\\cdot e^{-${e.h}k}=${dec(reste, 2)}`, "étape 1"), ligne(`e^{-${e.h}k}=\\dfrac{${dec(reste, 2)}}{${e.Q0}}`, `on divise par ${e.Q0}`), ligne(`=${dec(e.fraction, 2)}`)] }],
      resultat: [t("Exponentielle isolée : "), f(rep(e, phase)[0]!)],
      pieges: [],
    };
  return {
    utilise: [t("ln est la réciproque de exp : "), f("e^{X}=c\\iff X=\\ln c"), t(` pour c > 0 ; puis on isole k ${COURS_PROBLEMES}.`)],
    blocs: [
      {
        lignes: [
          ligne(`e^{-${e.h}k}=${dec(e.fraction, 2)}`, "étape 2"),
          ligne(`-${e.h}k=\\ln(${dec(e.fraction, 2)})`, "on applique ln"),
          ligne(`k=-\\dfrac{\\ln(${dec(e.fraction, 2)})}{${e.h}}`, `on divise par −${e.h}`),
          ligne(`\\approx ${dec(e.k, 4)}`),
        ],
      },
    ],
    resultat: [t("Taux de décroissance : "), f(rep(e, phase)[0]!)],
    verification: { texte: [t("k est bien positif : "), f(`\\ln(${dec(e.fraction, 2)})<0`), t(" car la fraction restante est inférieure à 1.")] },
    pieges: ["ln(fraction) < 0 : en divisant par −h, on obtient k > 0 (attention au signe)."],
  };
}

// ============================================================================
// Famille B.
// ============================================================================

function etapeB(e: ExerciceLogProbB, phase: PhaseLogarithmesProblemes): Etape {
  const aide = fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES);
  const dt = e.t2 - e.t1;
  const r = dec(e.r, 3);
  const v2 = dec(e.v2Affiche, 1);
  const unite = uniteTemps(e);
  switch (phase) {
    case "bEcran1": {
      const lignes: LigneCalcul[] = [
        ligne(`v_2=v_1\\cdot r^{t_2-t_1}`, "modèle exponentiel entre les deux instants"),
        ligne(`${v2}=${e.v1}\\cdot r^{${dt}}`, `Δt = ${e.t2} − ${e.t1} = ${dt}`),
        ligne(`r^{${dt}}=\\dfrac{${v2}}{${e.v1}}`, `on divise par ${e.v1}`),
        ligne(`r=\\left(\\dfrac{${v2}}{${e.v1}}\\right)^{\\frac{1}{${dt}}}`, `racine ${dt}-ième, r > 0`),
        ligne(`\\approx ${dec(e.rAffiche, 3)}`),
      ];
      if (dec(e.rAffiche, 3) !== r) lignes.push(ligne(`\\approx ${dec(e.r, 2)}`, "v₂ est arrondi : on retient le taux au centième"));
      return { utilise: aide, blocs: [{ lignes }], resultat: [t("Taux multiplicateur : "), f(`r\\approx ${rep(e, phase)[0]}`)], pieges: [[t("L'exposant est "), f("\\dfrac{1}{\\Delta t}"), t(" avec "), f("\\Delta t=t_2-t_1"), t(", pas "), f("\\dfrac{1}{t_2}"), t(".")]] };
    }
    case "bEcran2":
      return {
        utilise: [t("Le modèle "), f("Q(t)=Q_0\\cdot r^{t}"), t(" passe par le point connu "), f(`(${e.t1}\\,;\\,${e.v1})`), t(` : on remplace, puis on isole Q₀ ${COURS_PROBLEMES}.`)],
        blocs: [
          {
            lignes: [
              ligne(`${e.v1}=Q_0\\cdot ${r}^{${e.t1}}`, `Q(${e.t1}) = ${e.v1}`),
              ligne(`Q_0=\\dfrac{${e.v1}}{${r}^{${e.t1}}}`, `on divise par ${nt(e.r, 3)}^${e.t1}`.replace(/\^(\d+)/, (_, n) => superscript(n))),
              ligne(`\\approx ${dec(e.Q0, 2)}`),
            ],
          },
        ],
        resultat: [t("Valeur initiale : "), f(`Q_0\\approx ${rep(e, phase)[0]}`)],
        verification: { texte: [t("On recalcule le point connu : "), f(`${dec(e.Q0, 2)}\\cdot ${r}^{${e.t1}}\\approx ${dec(e.Q0 * Math.pow(e.r, e.t1), 0)}`), t(" ✓")] },
        pieges: [],
      };
    case "bEcran3": {
      const n = e.tRef - e.t1;
      return {
        utilise: aide,
        blocs: [
          {
            lignes: [
              ligne(`Q(${e.tRef})=Q_0\\cdot ${r}^{${e.tRef}}`, `on remplace t par ${e.tRef}`),
              ligne(`=\\dfrac{${e.v1}}{${r}^{${e.t1}}}\\cdot ${r}^{${e.tRef}}`, "Q₀ de l'étape 2, sans arrondi"),
              ligne(`=${e.v1}\\cdot ${r}^{${n}}`, `aᵐ / aⁿ = aᵐ⁻ⁿ : ${e.tRef} − ${e.t1} = ${n}`),
              ligne(`\\approx ${dec(e.valeurRef, 2)}`),
            ],
          },
        ],
        resultat: [t(`Valeur au temps ${e.tRef} : `), f(`Q(${e.tRef})\\approx ${rep(e, phase)[0]}`)],
        pieges: [],
      };
    }
    case "bEcran4":
      return {
        utilise: [t(`La grandeur est multipliée par ${e.k} : `), f(`Q_0\\cdot r^{t}=${e.k}\\cdot Q(${e.tRef})`), t(` ; on divise par Q₀, on applique ln (strictement croissante) et `), f("\\ln(ab)=\\ln a+\\ln b"), t(", "), f("\\ln\\left(a^{n}\\right)=n\\ln a"), t(` ${COURS_PROPRIETES}.`)],
        blocs: [
          {
            lignes: [
              ligne(`Q_0\\cdot ${r}^{\\,t}=${e.k}\\cdot Q(${e.tRef})`, `multipliée par ${e.k}`),
              ligne(`${r}^{\\,t}=${e.k}\\cdot ${r}^{${e.tRef}}`, `Q(${e.tRef}) = Q₀ · ${nt(e.r, 3)}${superscript(String(e.tRef))} : on divise par Q₀`),
              ligne(`t\\ln(${r})=\\ln(${e.k})+${e.tRef}\\ln(${r})`, "on applique ln : ln(ab) = ln a + ln b"),
              ligne(`t=${e.tRef}+\\dfrac{\\ln(${e.k})}{\\ln(${r})}`, `on divise par ln(${nt(e.r, 3)}) > 0`),
              ligne(`\\approx ${dec(e.tCible, 2)}`),
            ],
          },
        ],
        resultat: [t(`Instant (en ${unite}) : `), f(`t\\approx ${rep(e, phase)[0]}`)],
        verification: { texte: [t(`Entre ${e.tRef} et `), f(dec(e.tCible, 2)), t(" il s'écoule "), f(`\\dfrac{\\ln(${e.k})}{\\ln(${r})}\\approx ${dec(e.tCible - e.tRef, 2)}`), t(` ${unite} : c'est la durée de multiplication par ${e.k}, qui ne dépend pas du point de départ.`)] },
        pieges: [],
      };
    default:
      return { utilise: aide, blocs: [], resultat: [], pieges: [] };
  }
}

const EXPOSANTS: Record<string, string> = { "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };
function superscript(n: string): string {
  return n.split("").map((c) => EXPOSANTS[c] ?? c).join("");
}

// ============================================================================
// Famille C.
// ============================================================================

function etapeC(e: ExerciceLogProbC, phase: PhaseLogarithmesProblemes): Etape {
  const aide = fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES);
  const lambdaL = sci(e.lambda, 3);
  if (phase === "cEcran1") {
    const lignes =
      e.sens === "versT"
        ? [ligne("T=\\dfrac{\\ln 2}{\\lambda}", "demi-vie"), ligne(`=\\dfrac{\\ln 2}{${lambdaL}}`, "λ donné"), ligne(`\\approx ${dec(e.T, 2)}`)]
        : [ligne("\\lambda=\\dfrac{\\ln 2}{T}", "constante de désintégration"), ligne(`=\\dfrac{\\ln 2}{${dec(e.T, 2)}}`, "T donné"), ligne(`\\approx ${lambdaL}`)];
    return {
      utilise: aide,
      blocs: [{ lignes }],
      resultat: [f(rep(e, phase)[0]!), t(e.sens === "versT" ? ` ${e.unite}` : ` par ${singulier(e.unite)}`)],
      verification: { texte: [t("Au bout d'une demi-vie, "), f("e^{-\\lambda T}=e^{-\\ln 2}=\\dfrac{1}{2}"), t(" : il reste bien la moitié.")] },
      pieges: [],
    };
  }
  if (phase === "cEcran2") {
    const fr = dec(e.fractionEcran2, 3);
    const lignes: LigneCalcul[] = [
      ligne(`N_0\\left(\\dfrac{1}{2}\\right)^{t/T}=${fr}\\,N_0`, `il reste ${nt(100 * e.fractionEcran2, 1)} % de N₀`),
      ligne(`\\left(\\dfrac{1}{2}\\right)^{t/T}=${fr}`, "on divise par N₀"),
      ligne(`\\dfrac{t}{T}\\ln\\left(\\dfrac{1}{2}\\right)=\\ln(${fr})`, "on applique ln : ln(aⁿ) = n ln a"),
      ligne(`t=-\\dfrac{T\\ln(${fr})}{\\ln 2}`, [f("\\ln\\dfrac{1}{2}=-\\ln 2"), t(" : on isole t")]),
    ];
    if (e.sens === "versT") lignes.push(ligne(`=-\\dfrac{\\ln(${fr})}{\\lambda}`, "T = ln 2 / λ, valeur non arrondie"), ligne(`=-\\dfrac{\\ln(${fr})}{${lambdaL}}`));
    else lignes.push(ligne(`=-\\dfrac{${dec(e.T, 2)}\\ln(${fr})}{\\ln 2}`, "T donné"));
    lignes.push(ligne(`\\approx ${dec(e.tEcran2, 2)}`));
    return {
      utilise: aide,
      blocs: [{ lignes }],
      resultat: [t("Durée : "), f(`t\\approx ${rep(e, phase)[0]}`), t(` ${e.unite}`)],
      ...(e.fractionEcran2 === 0.25 ? { verification: { texte: [t("Il reste un quart après deux demi-vies : "), f(`t=2T`), t(".")] } } : {}),
      pieges: [],
    };
  }
  return {
    utilise: [t("Tous les âges calculés sont proportionnels à la demi-vie utilisée : le facteur correctif est le quotient de la nouvelle demi-vie par l'ancienne " + COURS_PROBLEMES + ".")],
    blocs: [{ lignes: [ligne(`\\text{facteur}=\\dfrac{T_2}{T_1}`, "nouvelle valeur sur ancienne"), ligne(`=\\dfrac{${dec(e.T2, 2)}}{${dec(e.T1, 2)}}`), ligne(`\\approx ${dec(e.facteurCorrectif, 3)}`)] }],
    resultat: [t("Facteur correctif : "), f(rep(e, phase)[0]!)],
    verification: { texte: [t(`Une durée de 1000 ${e.unite} calculée avec T₁ devient `), f(`1000\\times ${dec(e.facteurCorrectif, 3)}\\approx ${dec(1000 * e.facteurCorrectif, 0)}`), t(` ${e.unite} avec T₂${e.T2 > e.T1 ? ", plus longue car T₂ > T₁" : ", plus courte car T₂ < T₁"}.`)] },
    pieges: [[t("Le facteur correctif est "), f("\\dfrac{T_2}{T_1}"), t(" (nouvelle valeur sur ancienne), pas "), f("\\dfrac{T_1}{T_2}"), t(".")]],
  };
}

function singulier(unite: string): string {
  return ({ ans: "an", jours: "jour", heures: "heure" } as Record<string, string>)[unite] ?? unite;
}

// ============================================================================
// Famille E.
// ============================================================================

function etapeE(e: ExerciceLogProbE, phase: PhaseLogarithmesProblemes): Etape {
  const aide = fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES);
  const magnitude = e.contexteE === "magnitude";
  // a = 2/3 (Richter) : écrit exactement, sinon 0,667 × n fausserait le centième.
  const aL = magnitude ? "\\dfrac{2}{3}" : dec(e.a, 3);
  const plusB = e.b === 0 ? "" : e.b > 0 ? `+${dec(e.b, 3)}` : `-${dec(-e.b, 3)}`;
  const n = (X: number) => Math.round(Math.log10(X));
  if (phase === "eEcran1") {
    const n1 = n(e.X1);
    const n2 = n(e.X2);
    const L1 = dec(e.L1, 1);
    const L2 = dec(e.L2, 1);
    const aSys = (e.L2 - e.L1) / (n2 - n1);
    const bSys = e.L1 - aSys * n1;
    const lignes: LigneCalcul[] = [
      ligne(`${L1}=a\\cdot ${par(String(n1))}+b`, `point 1 : log(10${superscript(String(n1)).replace("-", "⁻")}) = ${nt(n1)}`),
      ligne(`${L2}=a\\cdot ${par(String(n2))}+b`, `point 2 : log(10${superscript(String(n2)).replace("-", "⁻")}) = ${nt(n2)}`),
      ligne(`${L2}-${par(L1)}=a\\,\\big(${n2}-${par(String(n1))}\\big)`, "on soustrait : b disparaît"),
      ligne(`${dec(e.L2 - e.L1, 1)}=${n2 - n1}a`),
      ligne(`a=\\dfrac{${dec(e.L2 - e.L1, 1)}}{${n2 - n1}}`, `on divise par ${n2 - n1}`),
      ligne(vaut(aSys, 3)),
      ligne(`b=${L1}-${estExact(aSys, 3) ? par(dec(aSys, 3)) : `\\dfrac{${dec(e.L2 - e.L1, 1)}}{${n2 - n1}}`}\\cdot ${par(String(n1))}`, "on remplace a dans l'équation du point 1"),
      ligne(vaut(bSys, 3)),
    ];
    const blocs: Etape["blocs"] = [{ lignes }];
    const arrondis = Math.abs(aSys - e.a) > 1e-9 || Math.abs(bSys - e.b) > 1e-9;
    if (arrondis)
      blocs.push({
        intro: [t("L₁ et L₂ sont arrondis au dixième : le système ne donne a et b qu'à cet arrondi près. On retient les constantes de définition de l'échelle :")],
        label: "Constantes",
        lignes: [ligne(`a=\\dfrac{1}{1{,}5}`, "définition de la magnitude"), ligne(`\\approx ${dec(e.a, 3)}`), ligne(`b=-\\dfrac{4{,}8}{1{,}5}`), ligne(`=${dec(e.b, 3)}`)],
      });
    return {
      utilise: aide,
      blocs,
      resultat: [t("Constantes : "), f(rep(e, phase)[0]!), t(" et "), f(rep(e, phase)[1]!)],
      verification: { texte: [t("Point 2 : "), f(`${par(aL)}\\cdot ${par(String(n2))}${plusB}${vaut(e.a * n2 + e.b, 2)}`), t(Math.abs(e.a * n2 + e.b - e.L2) < 1e-9 ? " = L₂ ✓" : " ≈ L₂ ✓ (L₂ est arrondi)")] },
      pieges: [],
    };
  }
  if (phase === "eEcran2") {
    if (e.sensEcran2 === "versL") {
      const n0 = n(e.X0);
      return {
        utilise: [...aide.slice(0, -1), t(", avec "), f("\\log\\left(10^{n}\\right)=n"), t(` ${COURS_PROPRIETES}.`)],
        blocs: [
          {
            lignes: [
              ligne(`L=${aL}\\cdot\\log\\left(10^{${n0}}\\right)${plusB}`, "on remplace X"),
              ligne(`=${aL}\\cdot ${par(String(n0))}${plusB}`, "log(10ⁿ) = n"),
              ligne(vaut(e.reponseEcran2, 2)),
            ],
          },
        ],
        resultat: [f(rep(e, phase)[0]!)],
        pieges: [],
      };
    }
    const L0 = dec(e.L0Affiche, 1);
    const y = (e.L0Affiche - e.b) / e.a;
    return {
      utilise: [t("On remplace L, on isole "), f("\\log(X)"), t(", puis "), f("\\log(X)=y\\iff X=10^{y}"), t(` ${COURS_PROPRIETES}.`)],
      blocs: [
        {
          lignes: [
            ligne(`${L0}=${aL}\\cdot\\log(X)${plusB}`, "on remplace L"),
            ligne(`\\log(X)=\\dfrac{${L0}${e.b === 0 ? "" : `-${par(dec(e.b, 3))}`}}{${aL}}`, `on divise par ${nt(e.a, 3)}`),
            ligne(vaut(y, 3)),
            ligne(`X=10^{${dec(y, 3)}}`, [f("\\log(X)=y\\iff X=10^{y}")]),
            ligne(`\\approx ${rep(e, phase)[0]!.replace(/^X \\approx /, "")}`),
          ],
        },
      ],
      resultat: [f(rep(e, phase)[0]!)],
      pieges: [],
    };
  }
  if (phase === "eEcran3") {
    if (e.sensEcran3 === "versDeltaL") {
      return {
        utilise: [...aide.slice(0, -1), t(", car "), f("\\log(kX)=\\log k+\\log X"), t(` ${COURS_PROPRIETES}.`)],
        blocs: [
          {
            lignes: [
              ligne(`\\Delta L=a\\log(kX)+b-\\big(a\\log(X)+b\\big)`, "niveau après − niveau avant"),
              ligne(`=a\\log(k)`, "log(kX) = log k + log X"),
              ligne(`=${aL}\\cdot\\log(${e.kEcran3})`, `a = ${nt(e.a, 3)}, k = ${e.kEcran3}`),
              ligne(vaut(e.reponseEcran3, 2)),
            ],
          },
        ],
        resultat: [t("Variation : "), f(rep(e, phase)[0]!)],
        pieges: [[t("Un facteur multiplicatif sur X est un écart additif sur L : "), f("\\Delta L=a\\log(k)"), t(".")]],
      };
    }
    const dL = dec(e.deltaLDonnee, 2);
    const y = e.deltaLDonnee / e.a;
    return {
      utilise: [...aide.slice(0, -1), t(", puis "), f("\\log(k)=y\\iff k=10^{y}"), t(` ${COURS_PROPRIETES}.`)],
      blocs: [
        {
          lignes: [
            ligne(`${dL}=${aL}\\cdot\\log(k)`, "ΔL = a log(k)"),
            magnitude ? ligne(`\\log(k)=\\dfrac{3\\times ${par(dL)}}{2}`, [t("on multiplie par "), f("\\dfrac{3}{2}")]) : ligne(`\\log(k)=\\dfrac{${dL}}{${aL}}`, `on divise par ${nt(e.a, 3)}`),
            ligne(vaut(y, 3)),
            ligne(`k=10^{${dec(y, 3)}}`, [f("\\log(k)=y\\iff k=10^{y}")]),
            ligne(vaut(e.reponseEcran3, 2)),
          ],
        },
      ],
      resultat: [t("Facteur : "), f(rep(e, phase)[0]!)],
      pieges: [[t("Un facteur multiplicatif sur X est un écart additif sur L : "), f("\\Delta L=a\\log(k)"), t(".")]],
    };
  }
  // eEcran4 (décibels : a = 10, b = 0)
  const y1 = e.L1e4 / 10;
  const y2 = e.L2e4 / 10;
  return {
    utilise: fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES),
    blocs: [
      {
        lignes: [
          ligne(`X_1=10^{\\frac{${dec(e.L1e4, 1)}}{10}}`, [f("X=10^{\\frac{L}{10}}"), t(" pour L₁")]),
          ligne(`\\approx ${sci(e.X1e4, 3, true)}`),
          ligne(`X_2=10^{\\frac{${dec(e.L2e4, 1)}}{10}}`, "pour L₂"),
          ligne(`\\approx ${sci(e.X2e4, 3, true)}`),
          ligne(`L_{total}=10\\log(X_1+X_2)`, "on additionne les intensités"),
          ligne(`=10\\log\\left(10^{${dec(y1, 2)}}+10^{${dec(y2, 2)}}\\right)`, "valeurs non arrondies"),
          ligne(`\\approx ${dec(e.Ltotal, 2)}`),
        ],
      },
    ],
    resultat: [t("Niveau des deux sources : "), f(rep(e, phase)[0]!), t(" dB")],
    verification: { texte: [t(`À peine plus que la source la plus forte (${nt(Math.max(e.L1e4, e.L2e4), 1)} dB), et bien moins que `), f(`${dec(e.L1e4, 1)}+${dec(e.L2e4, 1)}=${dec(e.L1e4 + e.L2e4, 1)}`), t(" dB.")] },
    pieges: ["Les niveaux L ne s'additionnent pas : ce sont les intensités X qu'on additionne."],
  };
}

// ============================================================================
// Famille F.
// ============================================================================

function etapeF(e: ExerciceLogProbF, phase: PhaseLogarithmesProblemes): Etape {
  const aide = fragmentsAide(aideNiveau1(e, phase), COURS_PROBLEMES);
  const y0 = dec(e.y0, 1);
  const r = dec(e.r, 4);
  const aL = dec(e.a, 3);
  const unite = uniteTemps(e);
  if (phase === "fEcran1")
    return {
      utilise: aide,
      blocs: [
        {
          lignes: [
            ligne(`y(0)=\\dfrac{${e.k}}{1+a\\,e^{0}}`, "on remplace t par 0"),
            ligne(`=\\dfrac{${e.k}}{1+a}`, "e⁰ = 1"),
            ligne(`\\dfrac{${e.k}}{1+a}=${y0}`, `y(0) = ${nt(e.y0, 1)}`),
            ligne(`1+a=\\dfrac{${e.k}}{${y0}}`, "produit en croix"),
            ligne(`a=\\dfrac{${e.k}}{${y0}}-1`, "on retranche 1"),
            ligne(vaut(e.a, 3)),
          ],
        },
      ],
      resultat: [t("Constante : "), f(`a${estExact(e.a, 3) ? "=" : "\\approx "}${rep(e, phase)[0]}`)],
      verification: { texte: [t("On remplace : "), f(`\\dfrac{${e.k}}{1+${aL}}\\approx ${dec(e.k / (1 + arrondi(e.a, 3)), 1)}`), t(` = y(0) ✓`)] },
      pieges: [],
    };
  if (phase === "fEcran2")
    return {
      utilise: [t("La croissance d'une courbe logistique est maximale à la moitié de la capacité : on résout "), f(`y(t)=\\dfrac{k}{2}`), t(`, puis on applique ln ${COURS_PROBLEMES}.`)],
      blocs: [
        {
          lignes: [
            ligne(`\\dfrac{${e.k}}{1+a\\,e^{-${coef(e.r)}t}}=\\dfrac{${e.k}}{2}`, "la moitié de la capacité"),
            ligne(`1+a\\,e^{-${coef(e.r)}t}=2`, "même numérateur : dénominateurs égaux"),
            ligne(`e^{-${coef(e.r)}t}=\\dfrac{1}{a}`, "on retranche 1, puis on divise par a"),
            ligne(`-${coef(e.r)}t=-\\ln(a)`, [t("on applique ln : "), f("\\ln\\dfrac{1}{a}=-\\ln a")]),
            ligne(`t=\\dfrac{\\ln(a)}{${r}}`, `on divise par −${nt(e.r, 4)}`),
            ligne(`\\approx\\dfrac{\\ln(${aL})}{${r}}`, "a de l'étape 1, arrondi"),
            ligne(`\\approx ${dec(e.t, 2)}`),
          ],
        },
      ],
      resultat: [t(`Croissance maximale (en ${unite}) : `), f(`t\\approx ${rep(e, phase)[0]}`)],
      pieges: [[t("La croissance est maximale pour "), f("y(t)=\\dfrac{k}{2}"), t(" (moitié de la capacité), pas pour "), f("y(t)=k"), t(".")]],
    };
  return {
    utilise: [...aide.slice(0, -1), t(` (r > 0) ${COURS_PROBLEMES}.`)],
    blocs: [
      {
        lignes: [
          ligne(`\\lim_{t\\to+\\infty}e^{-${coef(e.r)}t}=0`, `exposant −${nt(e.r, 4)}t → −∞`),
          ligne(`\\lim_{t\\to+\\infty}y(t)=\\dfrac{${e.k}}{1+${aL}\\times 0}`, "on remplace l'exponentielle par sa limite"),
          ligne(`=${e.k}`),
        ],
      },
    ],
    resultat: [t("Limite : "), f(`\\lim_{t\\to+\\infty}y(t)=${rep(e, phase)[0]}`), t(" : la grandeur plafonne à la capacité k.")],
    pieges: [],
  };
}

// ============================================================================
// Assemblage.
// ============================================================================

function etape(e: E, phase: PhaseLogarithmesProblemes): Etape {
  switch (e.famille) {
    case "A":
      return etapeA(e, phase);
    case "B":
      return etapeB(e, phase);
    case "C":
      return etapeC(e, phase);
    case "E":
      return etapeE(e, phase);
    case "F":
      return etapeF(e, phase);
  }
}

export function correctionDetailleeLogarithmesProblemes(e: E): EtapeCorrection[] {
  return phasesPourExercice(e).flatMap((phase, i): EtapeCorrection[] => {
    const sq = LETTRES[i];
    const x = etape(e, phase);
    return [
      utilise(sq, x.utilise),
      ...x.blocs.map((b) => calcul(sq, b.lignes, b.intro ?? [], b.label ?? "Calcul")),
      resultat(sq, x.resultat),
      ...(x.verification ? [verification(sq, x.verification.texte, x.verification.lignes)] : []),
      ...x.pieges.map((p) => piege(sq, typeof p === "string" ? [t(p)] : p)),
    ];
  });
}

/** Lettre d'étape (« a », « b »…) de l'écran `phase` pour cet exercice (écrans variables en famille E). */
export function lettrePhaseLogarithmesProblemes(e: E, phase: PhaseLogarithmesProblemes): string {
  return LETTRES[Math.max(0, phasesPourExercice(e).indexOf(phase))]!;
}
