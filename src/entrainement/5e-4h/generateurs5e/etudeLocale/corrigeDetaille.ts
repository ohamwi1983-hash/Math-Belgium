import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, ligne, piege, resultat, utilise } from "../../../export/corrigeTableau";
import type { ExerciceEtudeLocale, ExerciceEtudeLocalePolynomiale, ExerciceEtudeLocaleRationnelle, RacineEtudeLocale } from "../../core5e/etudeLocale.types";
import { ordreEcransEtudeLocale, type EcranEtudeLocale } from "../../moteur5e/typesEtudeLocale";
import { tableauFPrimeAttendu, tableauFSecondeAttendu } from "../../moteur5e/verificationEtudeLocale";
import { formatDLatexPublic, formatEnteteColonnesTableau, formatFDeXLatex, formatFPrimeDeXLatex, formatFSecondeDeXLatex, formatRacineLatex, formatReponseAttenduePhaseLatex } from "../../ui5e/formatEtudeLocale";
import { lignesDeriveePoly } from "../../ui5e/corrigeDerivees1";
import {
  COURS_ETUDE,
  COURS_SIGNE,
  centrePlusRacine,
  f,
  finaliser,
  jf,
  lignesSignesZones,
  lignesTrinomeUnitaireNul,
  lignesValeurPoly,
  liste,
  nbT,
  phraseSens,
  polyLatex,
  q,
  qL,
  sansDoublons,
  somme,
  t,
  tableauSignesEtudeLatex,
  xMoins,
  zonesTableau,
  type Fragments,
  type ZoneTableau,
} from "../../ui5e/corrigeDerivees1";

/**
 * Corrigé détaillé « comme au tableau » de 5gen29 (étude locale) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreEcransEtudeLocale`) : domaine
 * (dénominateur = 0, carré isolé), zéros de f′ (trinôme divisé par 3a, ou numérateur du premier degré),
 * signe de f′ (trinôme : signe de a à l'extérieur des racines ; quotient : signe du numérateur), nature de
 * chaque zéro (changement de signe), valeurs de f (substitution ; racines irrationnelles : x², x³ puis
 * chaque terme), puis la même chose pour f″ (concavité, points d'inflexion). Tableaux de signes : MÊME
 * attendu que l'écran (`tableauFPrimeAttendu` / `tableauFSecondeAttendu`). SANS `docx` : importé par
 * l'adaptateur ET par `App5gen29.tsx`.
 */

const LETTRES = "abcdefghijkl";

export function lettreEcranEtudeLocale(e: ExerciceEtudeLocale, ecran: EcranEtudeLocale): string {
  return LETTRES[ordreEcransEtudeLocale(e).indexOf(ecran)] ?? "a";
}

const NATURE: Record<string, string> = { max: "maximum", min: "minimum", ni_lun_ni_lautre: "ni maximum ni minimum" };

// ============================================================================
// Domaine (fonctions rationnelles c / ((x − e)² + k)).
// ============================================================================

function carreXe(e: number): string {
  return e === 0 ? "x^{2}" : `(${xMoins(e)})^{2}`;
}

function lignesDomaine(e: ExerciceEtudeLocaleRationnelle): LigneCalcul[] {
  const D = `${carreXe(e.e)}${e.k > 0 ? `+${e.k}` : `${e.k}`}`;
  const lignes: LigneCalcul[] = [ligne(`${D}=0`, "valeurs qui annulent le dénominateur"), ligne(`\\iff ${carreXe(e.e)}=${-e.k}`, `on isole le carré`)];
  if (e.k > 0) {
    lignes[1] = ligne(`\\iff ${carreXe(e.e)}=${-e.k}`, "impossible : un carré n'est jamais négatif");
    return lignes;
  }
  const m = Math.round(Math.sqrt(-e.k));
  const g = e.e === 0 ? "x" : xMoins(e.e);
  lignes.push(ligne(`\\iff ${g}=-${m}\\text{ ou }${g}=${m}`, `les nombres de carré ${-e.k} sont −${m} et ${m}`));
  if (e.e !== 0) lignes.push(ligne(`\\iff x=${e.e - m}\\text{ ou }x=${e.e + m}`, `on ajoute ${nbT(e.e)}`));
  return lignes;
}

// ============================================================================
// Zéros de f' et de f''.
// ============================================================================

function retire(v: number): string {
  return v < 0 ? `on ajoute ${-v}` : `on retire ${v}`;
}

function lignesZerosFPrime(e: ExerciceEtudeLocale): LigneCalcul[] {
  if (e.type === "polynomiale") {
    const fp = [e.c, 2 * e.b, 3 * e.a];
    const k = 3 * e.a;
    const B = fp[1] / k;
    const C = fp[0] / k;
    return [ligne(`${polyLatex(fp)}=0`, "on cherche les zéros de f′"), ligne(`\\iff ${polyLatex([C, B, 1])}=0`, `on divise par ${nbT(k)}`), ...lignesTrinomeUnitaireNul(B, C).lignes];
  }
  const num = [2 * e.c * e.e, -2 * e.c];
  const lignes: LigneCalcul[] = [ligne(`${polyLatex(num)}=0`, "un quotient est nul si son numérateur l'est (le dénominateur, un carré, ne s'annule pas sur le domaine)")];
  if (e.e !== 0) lignes.push(ligne(`\\iff ${-2 * e.c}x=${-2 * e.c * e.e}`, retire(2 * e.c * e.e)));
  lignes.push(ligne(`\\iff x=${e.e}`, `on divise par ${nbT(-2 * e.c)}`));
  return lignes;
}

function lignesZerosFSeconde(e: ExerciceEtudeLocale): LigneCalcul[] {
  if (e.type === "polynomiale") {
    const x0 = q(-2 * e.b, 6 * e.a);
    return sansDoublons([
      ligne(`${polyLatex([2 * e.b, 6 * e.a])}=0`, "on cherche les zéros de f″"),
      ...(e.b !== 0 ? [ligne(`\\iff ${6 * e.a}x=${-2 * e.b}`, retire(2 * e.b))] : []),
      ligne(`\\iff x=\\dfrac{${-2 * e.b}}{${6 * e.a}}`, `on divise par ${nbT(6 * e.a)}`),
      ligne(`=${qL(x0)}`, "on simplifie"),
    ]).filter((l) => !/\\dfrac\{0\}/.test(l.latex));
  }
  const { c, e: ce, k } = e;
  const r = k / 3;
  const num = [6 * c * ce * ce - 2 * c * k, -12 * c * ce, 6 * c];
  const g = ce === 0 ? "x" : xMoins(ce);
  const lignes: LigneCalcul[] = [
    ligne(`${polyLatex(num)}=0`, "numérateur de f″ nul (le dénominateur ne s'annule pas)"),
    ligne(`\\iff ${polyLatex([ce * ce - r, -2 * ce, 1])}=0`, `on divise par ${nbT(6 * c)}`),
  ];
  if (ce !== 0) lignes.push(ligne(`\\iff ${carreXe(ce)}=${r}`, jf("identité remarquable ", { l: `${polyLatex([ce * ce, -2 * ce, 1])}=(${xMoins(ce)})^2` })));
  else lignes.push(ligne(`\\iff x^{2}=${r}`, `on ajoute ${r}`));
  lignes.push(ligne(`\\iff ${g}=-\\sqrt{${r}}`, `les nombres de carré ${r}`), ligne(`\\text{ou }${g}=\\sqrt{${r}}`));
  if (ce !== 0) lignes.push(ligne(`\\iff x=${centrePlusRacine(ce, 1, r, -1)}`, `on ajoute ${nbT(ce)}`), ligne(`\\text{ou }x=${centrePlusRacine(ce, 1, r, 1)}`));
  return lignes;
}

// ============================================================================
// Signe de f' / f'' (tableaux).
// ============================================================================

function entetes(e: ExerciceEtudeLocale, mode: "fprime" | "fseconde") {
  const attendu = mode === "fprime" ? tableauFPrimeAttendu(e) : tableauFSecondeAttendu(e);
  const ent = formatEnteteColonnesTableau(e, attendu.colonnes, mode);
  return { attendu, ent, zones: zonesTableau(attendu, ent) };
}

function justificationChangement(avant: "+" | "-", apres: "+" | "-", nom: string, mode: "fprime" | "fseconde"): string {
  if (avant === apres) return mode === "fprime" ? `${nom} s'annule sans changer de signe : ni maximum ni minimum` : `${nom} s'annule sans changer de signe : pas de point d'inflexion`;
  if (mode === "fseconde") return `${nom} passe de ${avant === "-" ? "−" : "+"} à ${apres === "-" ? "−" : "+"} : point d'inflexion`;
  return avant === "+" ? `${nom} passe de + à − : f croît puis décroît, maximum` : `${nom} passe de − à + : f décroît puis croît, minimum`;
}

function lignesSigne(e: ExerciceEtudeLocale, mode: "fprime" | "fseconde"): LigneCalcul[] {
  const { zones } = entetes(e, mode);
  const nom = mode === "fprime" ? "f'(x)" : "f''(x)";
  const nomT = mode === "fprime" ? "f′" : "f″";
  const lignes: LigneCalcul[] = [];
  let justif: (z: ZoneTableau, i: number) => string | Fragments;
  if (e.type === "polynomiale" && mode === "fprime") {
    const a3 = 3 * e.a;
    if (e.natureRacines === "double") {
      const r = (e.racinesFPrime[0] as { valeur: { num: number } }).valeur.num;
      lignes.push(ligne(`${nom}=${a3}${carreXe(r)}`, "identité remarquable"));
      justif = () => `un carré est positif : ${nomT} a le signe de ${nbT(a3)}`;
    } else {
      justif = (_z, i) => (i === 1 ? `signe contraire de ${nbT(a3)} entre les racines` : `signe de ${nbT(a3)}, coefficient de x², à l'extérieur des racines`);
    }
  } else if (e.type === "polynomiale") {
    const a6 = 6 * e.a;
    justif = (z) => `${nomT} est du premier degré, de pente ${nbT(a6)} : ${z.signe === "+" ? "positive" : "négative"} ${(a6 > 0) === (z.signe === "+") ? "après" : "avant"} son zéro`;
  } else if (mode === "fprime") {
    justif = () => [t("dénominateur > 0 (un carré) : signe du numérateur "), f(polyLatex([2 * e.c * e.e, -2 * e.c]))];
  } else {
    const a6 = 6 * e.c;
    justif = (_z, i) => (i === 1 ? [t(`dénominateur > 0 ; numérateur du second degré : signe contraire de ${nbT(a6)} entre ses racines`)] : [t(`dénominateur > 0 ; numérateur : signe de ${nbT(a6)} à l'extérieur des racines`)]);
  }
  lignes.push(...lignesSignesZones(zones, nom, justif));
  // Un zéro = la frontière entre deux zones consécutives séparées par une colonne « racine ».
  const racines = mode === "fprime" ? e.racinesFPrime : e.racinesFSeconde;
  const att = mode === "fprime" ? tableauFPrimeAttendu(e) : tableauFSecondeAttendu(e);
  att.colonnes.forEach((col, i) => {
    if (col.type !== "racine") return;
    const avant = att.signes[i - 1] === "-" ? "-" : "+";
    const apres = att.signes[i + 1] === "-" ? "-" : "+";
    lignes.push(ligne(`${mode === "fprime" ? "f'" : "f''"}(${formatRacineLatex(racines[col.index])})=0`, justificationChangement(avant, apres, nomT, mode)));
  });
  return lignes;
}

// ============================================================================
// Valeurs de f.
// ============================================================================

function racineSur(r: RacineEtudeLocale): { e: number; rad: number; s: 1 | -1 } | null {
  return r.exact ? null : { e: r.centre, rad: r.radicande, s: r.signe };
}

/** A + B√r écrit simplement. */
function ab(A: number, B: number, r: number): string {
  const rac = B === 0 ? "" : `${Math.abs(B) === 1 ? "" : Math.abs(B)}\\sqrt{${r}}`;
  if (B === 0) return `${A}`;
  if (A === 0) return `${B < 0 ? "-" : ""}${rac}`;
  return `${A}${B < 0 ? "-" : "+"}${rac}`;
}

/** f(x₀) pour x₀ = e + s√r (polynomiale, racines irrationnelles) : x₀², x₀³, chaque terme, regroupement. */
function lignesValeurIrrationnelle(p: ExerciceEtudeLocalePolynomiale, nom: string, x: { e: number; rad: number; s: 1 | -1 }): LigneCalcul[] {
  const { a, b, c, d } = p;
  const { e, rad: r, s } = x;
  const x0 = centrePlusRacine(e, 1, r, s);
  const A = e * e + r;
  const B = 2 * e * s;
  const P = A * e + B * s * r;
  const Q = A * s + B * e;
  const lignes: LigneCalcul[] = [];
  if (e === 0) {
    lignes.push(ligne(`${nom}^{2}=(${x0})^{2}`, `on remplace ${nom}`), ligne(`=${r}`, jf({ l: `(\\sqrt{${r}})^2=${r}` })));
    lignes.push(ligne(`${nom}^{3}=${r}\\cdot (${x0})`, jf({ l: `x^3=x^2\\cdot x` })), ligne(`=${ab(0, r * s, r)}`));
  } else {
    lignes.push(
      ligne(`${nom}^{2}=(${x0})^{2}`, `on remplace ${nom}`),
      ligne(`=${somme([`${e * e}`, ab(0, 2 * e * s, r), `${r}`])}`, jf("identité remarquable, ", { l: `(\\sqrt{${r}})^2=${r}` })),
      ligne(`=${ab(A, B, r)}`, "on réduit"),
      ligne(`${nom}^{3}=(${ab(A, B, r)})(${x0})`, jf({ l: "x^3=x^2\\cdot x" })),
      ligne(`=${somme([`${A * e}`, ab(0, A * s, r), ab(0, B * e, r), `${B * s * r}`])}`, jf("on distribue, ", { l: `\\sqrt{${r}}\\cdot\\sqrt{${r}}=${r}` })),
      ligne(`=${ab(P, Q, r)}`, "on réduit"),
    );
  }
  const coef = (k: number) => (k === 1 ? "" : k === -1 ? "-" : `${k}`);
  const termes: { k: number; A: number; B: number; v: string }[] = [
    { k: a, A: P, B: Q, v: `${nom}^{3}` },
    { k: b, A, B, v: `${nom}^{2}` },
    { k: c, A: e, B: s, v: nom },
  ].filter((x) => x.k !== 0);
  for (const tm of termes) lignes.push(ligne(`${coef(tm.k)}${tm.v}=${ab(tm.k * tm.A, tm.k * tm.B, r)}`, `on multiplie par ${nbT(tm.k)}`));
  const constante = termes.reduce((acc, tm) => acc + tm.k * tm.A, 0) + d;
  const racine = termes.reduce((acc, tm) => acc + tm.k * tm.B, 0);
  const parts = somme([...termes.map((tm) => `${tm.k * tm.A}`), `${d}`]);
  const partsR = somme(termes.map((tm) => `${tm.k * tm.B}`));
  lignes.push(ligne(`f(${nom})=(${parts})+(${partsR})\\sqrt{${r}}`, d === 0 ? "on additionne les termes, on regroupe" : `on additionne les termes et ${nbT(d)}, on regroupe`));
  lignes.push(ligne(`=${ab(constante, racine, r)}`));
  // Lot C (question 4) : valeur exacte seule (cours, § 5) — plus d'arrondi au centième.
  return sansDoublons(lignes);
}

function lignesValeurRationnelle(p: ExerciceEtudeLocaleRationnelle, r: RacineEtudeLocale): LigneCalcul[] {
  const { c, e, k } = p;
  const kTxt = k > 0 ? `+${k}` : `${k}`;
  const moinsE = e === 0 ? "" : e > 0 ? `-${e}` : `+${-e}`;
  const xL = formatRacineLatex(r);
  if (r.exact) {
    const x = r.valeur.num;
    return sansDoublons([
      ligne(`f(${x})=\\dfrac{${c}}{(${x}${moinsE})^{2}${kTxt}}`, `on remplace x par ${nbT(x)}`),
      ligne(`=\\dfrac{${c}}{${k}}`, "le carré est nul"),
      ligne(`=${qL(q(c, k))}`, "on simplifie"),
    ]);
  }
  const rad = r.radicande;
  const sr = r.signe < 0 ? `-\\sqrt{${rad}}` : `\\sqrt{${rad}}`;
  return sansDoublons([
    ligne(`f(${xL})=\\dfrac{${c}}{(${xL}${moinsE})^{2}${kTxt}}`, "on remplace x"),
    ligne(`=\\dfrac{${c}}{(${sr})^{2}${kTxt}}`, e === 0 ? "" : `on simplifie ${nbT(e)} − ${nbT(e)}`),
    ligne(`=\\dfrac{${c}}{${rad}${kTxt}}`, jf({ l: `(\\sqrt{${rad}})^2=${rad}` })),
    ligne(`=\\dfrac{${c}}{${rad + k}}`),
    ligne(`=${qL(q(c, rad + k))}`, "on simplifie"),
  ]);
}

function lignesValeur(e: ExerciceEtudeLocale, r: RacineEtudeLocale, nom: string): LigneCalcul[] {
  if (e.type !== "polynomiale") return lignesValeurRationnelle(e, r);
  const irr = racineSur(r);
  if (irr) return lignesValeurIrrationnelle(e, nom, irr);
  const v = (r as { valeur: { num: number; den: number } }).valeur;
  return lignesValeurPoly(`f(${formatRacineLatex(r)})`, [e.d, e.c, e.b, e.a], q(v.num, v.den)).lignes;
}

// ============================================================================
// Assemblage.
// ============================================================================

function resultatsNature(e: ExerciceEtudeLocale, mode: "fprime" | "fseconde"): Fragments {
  const lignes = formatReponseAttenduePhaseLatex(e, mode === "fprime" ? "tableauFPrime" : "tableauFSeconde");
  return liste(lignes);
}

const COURS_DERIVEE_ETUDE = "(cours, § 3)";

export function correctionDetailleeEtudeLocale(e: ExerciceEtudeLocale): EtapeCorrection[] {
  const etapes: EtapeCorrection[] = [];
  const L = (x: EcranEtudeLocale) => lettreEcranEtudeLocale(e, x);
  for (const ecran of ordreEcransEtudeLocale(e)) {
    const l = L(ecran);
    switch (ecran) {
      case "domaine": {
        const r = e as ExerciceEtudeLocaleRationnelle;
        etapes.push(
          utilise(l, [t(`f est définie là où son dénominateur ne s'annule pas ${COURS_ETUDE}.`)]),
          calcul(l, lignesDomaine(r)),
          resultat(l, [f(formatReponseAttenduePhaseLatex(e, "domaine")[0])]),
        );
        break;
      }
      case "deriverFPrime":
      case "deriverFSeconde": {
        // Lot C — option « f′ et f″ à calculer ».
        const seconde = ecran === "deriverFSeconde";
        const nom = seconde ? "f''(x)" : "f'(x)";
        const finale = (seconde ? formatFSecondeDeXLatex(e) : formatFPrimeDeXLatex(e)).replace(/^[^=]*=/, "");
        let lignes: LigneCalcul[];
        if (e.type === "polynomiale") {
          const coeffs = seconde ? [e.c, 2 * e.b, 3 * e.a] : [e.d, e.c, e.b, e.a];
          lignes = lignesDeriveePoly(nom, coeffs).lignes;
        } else {
          const D = formatDLatexPublic(e.e, e.k);
          const xe = e.e === 0 ? "x" : `(x${e.e > 0 ? `-${e.e}` : `+${-e.e}`})`;
          lignes = seconde
            ? (() => {
                const u = formatFPrimeDeXLatex(e).replace(/^[^=]*=\\dfrac\{([^}]*)\}.*$/, "$1");
                return [
                  ligne(`D(x)=${D}`, jf("on nomme le dénominateur, de dérivée ", { l: `D'(x)=2${xe}` })),
                  ligne(`${nom}=\\dfrac{${-2 * e.c}\\,D^2-(${u})\\cdot 2D\\cdot D'}{D^4}`, jf("dérivée d'un quotient, avec ", { l: "(D^2)'=2D\\,D'" })),
                  ligne(`=\\dfrac{${-2 * e.c}\\,D-(${u})\\cdot 2\\cdot 2${xe}}{D^3}`, "on simplifie par D"),
                  ligne(`=${finale}`, "on remplace D, on développe et on réduit le numérateur"),
                ];
              })()
            : [
                ligne(`${nom}=\\dfrac{0\\cdot\\left[${D}\\right]-${e.c < 0 ? `(${e.c})` : e.c}\\cdot 2${xe}}{\\left[${D}\\right]^2}`, jf("dérivée d'un quotient ", { l: "\\left(\\frac{u}{v}\\right)'=\\frac{u'v-uv'}{v^2}" }, ", u constant")),
                ligne(`=${finale}`, "on développe le numérateur"),
              ];
        }
        etapes.push(
          utilise(l, [t(seconde ? "On dérive f′(x) " : "On dérive f(x) "), t(e.type === "polynomiale" ? "terme à terme : " : "avec la règle du quotient "), t(`${COURS_DERIVEE_ETUDE}.`)]),
          calcul(l, lignes),
          resultat(l, [f(seconde ? formatFSecondeDeXLatex(e) : formatFPrimeDeXLatex(e))]),
        );
        void formatFDeXLatex;
        break;
      }
      case "resoudreFPrime":
        etapes.push(
          utilise(l, [t("Les points critiques sont les zéros de "), f(formatFPrimeDeXLatex(e).replace(/=.*$/, "")), t(e.type === "polynomiale" ? ` : un trinôme du second degré ${COURS_ETUDE}.` : ` : un quotient est nul quand son numérateur est nul ${COURS_ETUDE}.`)]),
          calcul(l, lignesZerosFPrime(e)),
          resultat(l, [f(formatReponseAttenduePhaseLatex(e, "resoudreFPrime")[0])]),
        );
        break;
      case "tableauFPrime": {
        const { attendu, ent, zones } = entetes(e, "fprime");
        etapes.push(
          utilise(l, [t(`Là où f′ > 0, f est croissante ; là où f′ < 0, décroissante. Un zéro de f′ est un maximum si f′ passe de + à −, un minimum de − à +, ni l'un ni l'autre si f′ garde son signe ${COURS_SIGNE}.`)]),
          calcul(l, lignesSigne(e, "fprime")),
          resultat(l, [f(tableauSignesEtudeLatex(attendu, ent, "fprime"))], "Tableau de signes"),
          resultat(l, [...phraseSens(zones, "fprime"), t(" "), ...resultatsNature(e, "fprime"), t(".")]),
          piege(
            l,
            e.classificationFPrime.includes("ni_lun_ni_lautre")
              ? [t("f′ s'annule sans changer de signe (racine double) : ce point n'est ni un maximum ni un minimum.")]
              : [t("Un zéro de f′ n'est un extremum que si f′ change de signe de part et d'autre : on le vérifie dans le tableau, jamais par principe.")],
          ),
        );
        break;
      }
      case "extremums": {
        etapes.push(utilise(l, [t("La valeur d'un extremum est "), f("f(x_0)"), t(` : on remplace x par son abscisse dans f(x), pas dans f′(x) ${COURS_ETUDE}.`)]));
        const valeurs = formatReponseAttenduePhaseLatex(e, "extremums");
        e.racinesFPrime.forEach((r, i) => {
          if (e.classificationFPrime[i] === "ni_lun_ni_lautre") return;
          const nom = e.racinesFPrime.length > 1 ? `x_${i + 1}` : "x_0";
          etapes.push(calcul(l, lignesValeur(e, r, nom), [t(`${NATURE[e.classificationFPrime[i]]} en `), f(`${r.exact ? "x" : nom}=${formatRacineLatex(r)}`)], `f(${formatRacineLatex(r).replace(/\\sqrt\{(\d+)\}/g, "√$1").replace(/-/g, "−")})`));
        });
        const natures = e.racinesFPrime.map((_, i) => e.classificationFPrime[i]).filter((c) => c !== "ni_lun_ni_lautre");
        etapes.push(resultat(l, valeurs.flatMap((v, i) => [...(i > 0 ? [t(". ")] : []), t(`${NATURE[natures[i]].replace(/^./, (x) => x.toUpperCase())} : `), f(v)])));
        break;
      }
      case "resoudreFSeconde":
        etapes.push(
          utilise(l, [t("Les candidats points d'inflexion sont les zéros de "), f("f''(x)"), t(` (donnée) ${COURS_ETUDE}.`)]),
          calcul(l, lignesZerosFSeconde(e)),
          resultat(l, [f(formatReponseAttenduePhaseLatex(e, "resoudreFSeconde")[0])]),
        );
        break;
      case "tableauFSeconde": {
        const { attendu, ent, zones } = entetes(e, "fseconde");
        etapes.push(
          utilise(l, [t(`Là où f″ > 0, f est convexe (∪) ; là où f″ < 0, concave (∩). Un zéro de f″ est un point d'inflexion si f″ y change de signe ${COURS_SIGNE}.`)]),
          calcul(l, lignesSigne(e, "fseconde")),
          resultat(l, [f(tableauSignesEtudeLatex(attendu, ent, "fseconde"))], "Tableau de signes"),
          resultat(l, [...phraseSens(zones, "fseconde"), t(" "), ...resultatsNature(e, "fseconde"), t(".")]),
          piege(l, [t("f′ renseigne sur les variations, f″ sur la concavité : un zéro de f″ n'est un point d'inflexion que si f″ change de signe.")]),
        );
        break;
      }
      case "inflexions": {
        etapes.push(utilise(l, [t("Ordonnée du point d'inflexion : "), f("f(x_0)"), t(` — on remplace dans f(x), pas dans f″(x) ${COURS_ETUDE}.`)]));
        e.racinesFSeconde.forEach((r, i) => {
          if (e.classificationFSeconde[i] !== "pi") return;
          etapes.push(calcul(l, lignesValeur(e, r, "x_0"), [], `f(${formatRacineLatex(r).replace(/\\sqrt\{(\d+)\}/g, "√$1").replace(/-/g, "−")})`));
        });
        etapes.push(resultat(l, liste(formatReponseAttenduePhaseLatex(e, "inflexions"))));
        break;
      }
    }
  }
  return finaliser(etapes);
}
