import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, decouperLigneCalcul, latex, ligne, piege, resultat, texte, utilise } from "../../../export/corrigeTableau";
import type { ExerciceAiresFormesReelles } from "../../core6e/airesFormesReelles.types";
import { aireCourbe, arcExercice, bornesArc, bornesCorrige, bornesExactes, coefArc, coefficientsExacts, coefficientsVitrail, evaluerExact, fMul, fraction, integraleExacte, integraleSignee, litresPeinture, nombrePots, phasesExercice, primitiveExacte, valeurCout, valeurTotal } from "../../moteur6e/modeleAiresFormesReelles";
import type { PhaseFormesReelles } from "../../moteur6e/modeleAiresFormesReelles";
import { aideNiveau1, blocDonnees, bornesVitrailTex, coefficientParcelleTex, egalExactTex, eurosLatex, formatReponseAttenduePhaseLatex, fractionTex, integrandeCoeffs, polyExactTex, polyTex, representer, totalParcelleExact } from "../../ui6e/formatAiresFormesReelles";
import { figureCorrigeSvg } from "../../ui6e/figureAiresFormesReelles";
import { decimalLatex } from "../../ui6e/nombresExactsIntegrales";
import { COURS_AIRES, listeFormules, moinsTexte } from "../../ui6e/corrigeIntegrales2";
import { crochet, entoure } from "../../ui6e/corrigeIntegrales1";

/**
 * Corrigé détaillé « comme au tableau » de `6gen81` (aires de formes réelles) — règle
 * `.claude/rules/feuilles-evaluations.md`. Une étape par écran (`phasesExercice`) : modéliser
 * (équation de la parabole ou intersections, bornes), aire (primitive entre crochets, F(b) − F(a)),
 * puis l'aire totale, la peinture, le coût ou le volume, une transformation par ligne. Valeurs tirées
 * du moteur (`modeleAiresFormesReelles.ts`) et des réponses de l'écran (`formatReponseAttenduePhaseLatex`).
 */

type E = ExerciceAiresFormesReelles;
const t = texte;
const f = latex;
const LETTRES = "abcde";

function lettre(e: E, phase: PhaseFormesReelles): string {
  return LETTRES[phasesExercice(e).indexOf(phase)]!;
}

/** Donnée (cote, prix) : décimal. */
function r(v: number): string {
  return representer(v, false).tex;
}

/** Résultat : fraction dans le régime exact ; `rel` = « = » ou « \approx ». */
function rc(v: number, e: E): { tex: string; rel: string } {
  const x = representer(v, e.calcul === "exacte");
  return { tex: x.tex, rel: x.exact ? "=" : "\\approx " };
}

/** `rc` d'une valeur EXACTE : décimal exact (comme la réponse de l'écran) ou fraction, toujours « = » (`null` si pas de valeur exacte). */
function rcExact(fr: ReturnType<typeof integraleExacte>): { tex: string; rel: string } | null {
  return fr ? { tex: fractionTex(fr, false), rel: "=" } : null;
}

function aireExacteOuNull(e: E): ReturnType<typeof integraleExacte> {
  const v = integraleExacte(e);
  return v && v.n < 0 ? fMul(fraction(-1), v) : v;
}

/** Dernière ligne d'un calcul exact : la valeur EXACTE réduite (fraction), puis seulement son arrondi
 * (« ≈ … » de la réponse de l'écran) — la ligne suivante part de cette fraction. */
function finExacte(fr: NonNullable<ReturnType<typeof integraleExacte>>, droiteEcran: string): string {
  return droiteEcran.startsWith("\\approx") && fr.d !== 1 ? `=${fractionTex(fr, false)}${droiteEcran}` : droiteEcran;
}

function par(x: string): string {
  return x.startsWith("-") ? `(${x})` : x;
}

/** Membre droit d'une réponse de l'écran (« S=12\text{ m}^2 » → « =12\text{ m}^2 »). */
function droite(reponse: string): string {
  return decouperLigneCalcul(reponse).droite ?? `=${reponse}`;
}

/** Phrase d'aide de l'écran suivie de sa formule et du renvoi au cours. */
function phraseAide(e: E, phase: PhaseFormesReelles, renvoi = ""): FragmentConsigne[] {
  const a = aideNiveau1(e, phase);
  const fin = renvoi ? ` ${renvoi}.` : ".";
  return a.latex ? [t(`${a.texte.replace(/\s*:$/, "")} : `), f(a.latex), t(fin)] : [t(a.texte.replace(/\.$/, "") + fin)];
}

// ============================================================================
// Étape « modéliser ».
// ============================================================================

function lignesModeliser(e: E): { utilise: FragmentConsigne[]; lignes: LigneCalcul[]; piege: FragmentConsigne[] | null } {
  if (e.situation === "vitrail") {
    const { f: cf, g: cg } = coefficientsVitrail(e);
    const h = cf.map((v, i) => v - cg[i]!);
    const exact = e.calcul === "exacte";
    const [x1, x2] = bornesVitrailTex(e);
    return {
      utilise: [t("Les arcs se rejoignent là où "), f("f(x)=g(x)"), t(` : on passe tout dans le même membre et on résout l'équation du second degré ${COURS_AIRES}.`)],
      lignes: [
        ligne("f(x)=g(x)", "points communs aux deux arcs"),
        ligne(`${polyTex(h, exact).tex}=0`, "on passe tout dans le membre de gauche"),
        ligne(`${polyTex(h.map((v) => v / -e.A), exact).tex}=0`, [t("on divise par "), f(r(-e.A))]),
        ligne(`(x-${r(e.m)})^2=${r(e.s)}`, "on reconnaît un carré parfait"),
        ligne(`x_1=${x1}`, "la plus petite solution"),
        ligne(`x_2=${x2}`, "la plus grande"),
      ],
      piege: [t("Prendre comme bornes les bords du vitrail ("), f("0"), t(" et "), f(r(e.W)), t(") : la lentille s'arrête aux points où les arcs se rejoignent.")],
    };
  }
  if (e.situation === "parcelle") {
    const bornes = [ligne(`a=\\dfrac{${r(10 * e.a)}}{10}`, "clôture de gauche : distance au pont en mètres, divisée par 10"), ligne(`=${r(e.a)}`), ligne(`b=\\dfrac{${r(10 * e.b)}}{10}`, "clôture de droite"), ligne(`=${r(e.b)}`)];
    const piegeUnite: FragmentConsigne[] = [t("Garder les distances en mètres (par exemple "), f(`x=${r(10 * e.b)}`), t(" au lieu de "), f(`x=${r(e.b)}`), t(") alors que l'unité du repère vaut 10 m.")];
    if (e.modele === "retrouver") {
      const y0 = e.alpha * e.m * e.m + e.k;
      // Valeur EXACTE de c (fraction), puis sa valeur approchée si elle n'est pas décimale : c'est elle
      // qu'utilise l'intégrale de l'étape suivante.
      const cExact = coefficientsExacts(e)![2];
      const cTex = coefficientParcelleTex(e);
      return {
        utilise: [t("Le sommet de la parabole est le point de la berge le plus éloigné de la route : on part de la forme canonique "), f("f(x)=c(x-m)^2+k"), t(`, puis le point du pied du pont donne c ${COURS_AIRES}.`)],
        lignes: [
          ligne(`f(x)=c(x-${r(e.m)})^2+${r(e.k)}`, [t("sommet "), f(`(${r(e.m)}\\,;\\,${r(e.k)})`), t(" (unité : 10 m)")]),
          ligne(`f(0)=${r(y0)}`, [t("la berge passe par "), f(`(0\\,;\\,${r(y0)})`)]),
          ligne(`c\\times(0-${r(e.m)})^2+${r(e.k)}=${r(y0)}`, "on remplace x par 0"),
          ligne(`c=\\dfrac{${r(y0)}-${r(e.k)}}{${r(e.m * e.m)}}`, "on isole c"),
          ligne(cTex.exact ? `=${cTex.tex}` : `=${fractionTex(cExact, true)}\\approx ${cTex.tex}`),
          ...bornes,
        ],
        piege: piegeUnite,
      };
    }
    return { utilise: [t(`Une unité du repère vaut 10 m : on divise par 10 les distances des clôtures au pont ${COURS_AIRES}.`)], lignes: bornes, piege: piegeUnite };
  }
  const arc = arcExercice(e);
  const [p, q] = bornesArc(arc, e.repere);
  const sommet = arc.sens * arc.fleche;
  const c = rc(coefArc(arc), e);
  const L = arc.largeur;
  if (e.modele === "retrouver") {
    const origine = e.repere === "pied" ? "au pied gauche de l'arc" : "au milieu de la base de l'arc";
    const lignes: LigneCalcul[] =
      e.repere === "pied"
        ? [
            ligne(`f(x)=c\\,x\\,(x-${r(L)})`, `la parabole s'annule aux deux pieds, x = 0 et x = ${r(L).replace("{,}", ",")}`),
            ligne(`f(${r(L / 2)})=${r(sommet)}`, "sommet au milieu de l'arc"),
            ligne(`c\\times ${r(L / 2)}\\times(${r(-L / 2)})=${r(sommet)}`, "on remplace x"),
            ligne(`c=\\dfrac{${r(sommet)}}{${par(r(-(L * L) / 4))}}`, "on isole c"),
            ligne(`${c.rel}${c.tex}`),
          ]
        : [
            ligne(`f(x)=${r(sommet)}+c\\,x^2`, "sommet sur l'axe des ordonnées"),
            ligne(`f(${r(L / 2)})=0`, "la parabole s'annule au pied droit"),
            ligne(`${r(sommet)}+c\\times ${r(L / 2)}^2=0`, "on remplace x"),
            ligne(`c=\\dfrac{${r(-sommet)}}{${r((L / 2) ** 2)}}`, "on isole c"),
            ligne(`${c.rel}${c.tex}`),
          ];
    return {
      utilise: [
        t(`Repère choisi : origine ${origine}, axe des abscisses le long de la base. Les pieds de l'arc sont en `),
        f(`x=${r(p)}`),
        t(" et "),
        f(`x=${r(q)}`),
        t(", le sommet est "),
        f(`(${r((p + q) / 2)}\\,;\\,${r(sommet)})`),
        t(` ${COURS_AIRES}. Tout autre choix d'origine sur cet axe convient : la parabole est seulement translatée, l'aire ne change pas.`),
      ],
      lignes: [...lignes, ligne(`a=${r(p)}`, "pied gauche"), ligne(`b=${r(q)}`, "pied droit")],
      piege: [t("Écrire la parabole sans qu'elle s'annule aux deux pieds (par exemple avec la flèche comme coefficient de "), f("x^2"), t(") : on vérifie toujours que "), f(`f(${r(p)})=f(${r(q)})=0`), t(".")],
    };
  }
  const fx = blocDonnees(e)[0]!.replace("f(x)=", "");
  const lignes: LigneCalcul[] =
    e.repere === "pied"
      ? [ligne(`${fx}=0`, "pieds de l'arc : f(x) = 0"), ligne(`x\\left(${polyTex([-coefArc(arc) * L, coefArc(arc)], e.calcul === "exacte").tex}\\right)=0`, "on met x en évidence")]
      : [ligne(`${fx}=0`, "pieds de l'arc : f(x) = 0"), ligne(`x^2=${r((L / 2) ** 2)}`, "on isole x²")];
  return {
    utilise: [t("Les bornes sont les abscisses des pieds de l'arc, là où la courbe coupe l'axe des abscisses : on résout "), f("f(x)=0"), t(` ${COURS_AIRES}.`)],
    lignes: [...lignes, ligne(`a=${r(p)}`, "première solution"), ligne(`b=${r(q)}`, "seconde solution")],
    piege: null,
  };
}

// ============================================================================
// Étape « aire » : primitive entre crochets, F(b) − F(a).
// ============================================================================

/** Intégrale avec les coefficients EXACTS (mur, section, parcelle) : primitive, F(b) − F(a) en fractions
 * exactes, l'arrondi n'apparaît qu'à la dernière ligne (précision de la consigne). */
function lignesAireExactes(e: E): LigneCalcul[] | null {
  const coeffs = coefficientsExacts(e);
  const bornes = bornesExactes(e);
  const signee = integraleExacte(e);
  if (!coeffs || !bornes || !signee) return null;
  const exacte = e.calcul === "exacte";
  const F = primitiveExacte(coeffs);
  const [a, b] = bornesCorrige(e);
  const aTex = r(a);
  const bTex = r(b);
  const fb = fractionTex(evaluerExact(F, bornes[1]), exacte);
  const fa = fractionTex(evaluerExact(F, bornes[0]), exacte);
  const sous = e.situation === "section" && e.contexte !== "tunnel";
  const lignes: LigneCalcul[] = [
    // f développée, puis F, puis l'intégrale : membres de gauche courts (f(x), F(x), 𝒜), pour que la
    // colonne des membres de droite garde la largeur du corrigé papier (680 px). Sur une seule ligne
    // « ∫ (…) dx = [F(x)]ₐᵇ », la formule passait à la ligne en son milieu (mesuré).
    ligne(`f(x)=${polyExactTex(coeffs, exacte)}`, "forme développée"),
    ligne(`F(x)=${polyExactTex(F, exacte)}`, "une primitive, terme à terme"),
    // Sous l'axe (canal, gouttière) : I est l'intégrale, négative ; l'aire 𝒜 = −I vient au bloc suivant.
    ligne(`${sous ? "I" : "\\mathcal{A}"}=\\int_{${aTex}}^{${bTex}}f(x)\\,dx`, sous ? "intégrale de f, négative sous l'axe" : "aire sous la courbe de f"),
    ligne(`=F(${bTex})-F(${aTex})`, "F(b) − F(a)"),
    ligne(`=${fb}-${par(fa)}`, `valeurs de F en ${moinsTexte(r(b)).replace("{,}", ",")} et en ${moinsTexte(r(a)).replace("{,}", ",")}`),
  ];
  if (!sous) lignes.push(ligne(finExacte(aireExacteOuNull(e)!, droite(formatReponseAttenduePhaseLatex(e, "aire")[0]!))));
  else lignes.push(ligne(finExacte(signee, egalExactTex(signee, 3))));
  return lignes;
}

function lignesAire(e: E): LigneCalcul[] {
  const avecExactes = lignesAireExactes(e);
  if (avecExactes) return avecExactes;
  // Vitrail : bornes x₁, x₂ (irrationnelles en régime calculatrice), aire par la formule du moteur.
  const coeffs = integrandeCoeffs(e);
  const prim = [0, ...coeffs.map((c, i) => c / (i + 1))];
  const exacte = e.calcul === "exacte";
  // Fraction exacte (dénominateur ≤ 10 000, vérifiée) pour chaque coefficient, sinon décimal approché.
  const exactes = (cs: number[]) => cs.every((c) => {
    const x = representer(c, true, 10000);
    const m = /^(-)?(?:\\dfrac\{(\d+)\}\{(\d+)\}|(\d+))$/.exec(x.tex);
    if (!m) return Math.abs(c * 1e4 - Math.round(c * 1e4)) < 1e-9;
    const v = (m[1] ? -1 : 1) * (m[4] ? Number(m[4]) : Number(m[2]) / Number(m[3]));
    return Math.abs(v - c) < 1e-12;
  });
  const pc = exactes(coeffs) ? { tex: polyTex(coeffs, exacte, 10000).tex, exact: true } : { tex: "", exact: false };
  const pp = exactes(prim) ? { tex: polyTex(prim, true, 10000).tex, exact: true } : { tex: "", exact: false };
  // Coefficients non représentables exactement (régime calculatrice) : « \approx » dès la primitive.
  const exact = pc.exact && pp.exact;
  const rel = exact ? "=" : "\\approx ";
  const integrande = exact ? pc.tex : polyTex(coeffs, false, 1000).tex;
  const primitive = exact ? pp.tex : polyTex(prim, false, 1000).tex;
  return [
    ligne(`\\int_{x_1}^{x_2}${entoure(integrande)}dx${rel}${crochet(primitive, "x_1", "x_2")}`, "primitive terme à terme"),
    ligne(droite(formatReponseAttenduePhaseLatex(e, "aire")[0]!)),
  ];
}

function etapeAire(e: E, sq: string): EtapeCorrection[] {
  const sous = e.situation === "section" && e.contexte !== "tunnel";
  const v = integraleSignee(e);
  const vi = rcExact(integraleExacte(e)) ?? rc(v, e);
  const aire = rcExact(aireExacteOuNull(e)) ?? rc(aireCourbe(e), e);
  const blocs: EtapeCorrection[] = [calcul(sq, lignesAire(e), [], "Intégrale")];
  if (sous) blocs.push(calcul(sq, [ligne(`\\mathcal{A}=-${par(vi.tex)}`, "l'arc est sous l'axe : l'aire est l'opposé de l'intégrale"), ligne(`${aire.rel}${aire.tex}`)], [], "Aire"));
  const p: FragmentConsigne[] | null =
    sous
      ? [t("Donner l'intégrale négative comme aire : sous l'axe des abscisses, l'aire est l'opposé de l'intégrale.")]
      : e.situation === "vitrail"
        ? [t("Intégrer "), f("f-g"), t(" sur toute la largeur du vitrail : hors de la lentille, "), f("f-g"), t(" est négative et la valeur n'a plus de sens.")]
        : e.situation === "mur"
          ? [t("Mélanger deux repères, par exemple intégrer de "), f(e.repere === "pied" ? r(-e.L / 2) : "0"), t(" à "), f(r(e.repere === "pied" ? e.L / 2 : e.L)), t(" : les bornes et l'équation de l'arc doivent venir du même repère.")]
          : null;
  return [
    utilise(sq, phraseAide(e, "aire", COURS_AIRES)),
    ...blocs,
    { ...resultat(sq, listeFormules(formatReponseAttenduePhaseLatex(e, "aire"))), figureHtml: figureCorrigeSvg(e) },
    ...(p ? [piege(sq, p)] : []),
  ];
}

// ============================================================================
// Étapes de contexte.
// ============================================================================

/** Dernière ligne d'une chaîne qui a déjà arrondi : seule la valeur approchée de la réponse (« ≈ … »). */
function finApprochee(fin: string, approche: boolean): string {
  if (!approche) return fin;
  return fin.includes("\\approx") ? `\\approx ${fin.split("\\approx").pop()!.trim()}` : fin.replace(/^=/, "\\approx ");
}

function etapeTotal(e: E, sq: string): EtapeCorrection[] {
  const aire = rc(aireCourbe(e), e);
  const fin = finApprochee(droite(formatReponseAttenduePhaseLatex(e, "total")[0]!), aire.rel !== "=");
  let lignes: LigneCalcul[] = [];
  let p: FragmentConsigne[] | null = null;
  if (e.situation === "mur") {
    lignes = [ligne(`S=${r(e.L)}\\times ${r(e.h)}+\\mathcal{A}_{\\text{arc}}`, "rectangle + partie arrondie"), ligne(`${aire.rel}${r(e.L * e.h)}+${aire.tex}`, "aire de l'étape précédente"), ligne(fin)];
    p = [t("Oublier la partie rectangulaire : l'intégrale ne donne que l'aire du fronton.")];
  } else if (e.situation === "vitrail") {
    lignes = [ligne(`\\mathcal{A}_{\\text{clair}}=${r(e.W)}\\times ${r(e.H)}-\\mathcal{A}_{\\text{rouge}}`, "tout le vitrail, sauf la lentille"), ligne(`${aire.rel}${r(e.W * e.H)}-${aire.tex}`, "aire de l'étape précédente"), ligne(fin)];
  } else if (e.situation === "parcelle") {
    // Aire en u.a. EXACTE (fraction de l'étape précédente) : aucun arrondi avant la dernière ligne.
    const exacte = rcExact(aireExacteOuNull(e))!;
    const finEcran = droite(formatReponseAttenduePhaseLatex(e, "total")[0]!);
    lignes = [ligne(`\\mathcal{A}=100\\times\\mathcal{A}_{\\text{u.a.}}`, "1 u.a. = 10 m × 10 m = 100 m²"), ligne(`=100\\times ${exacte.tex}`), ligne(finExacte(totalParcelleExact(e), finEcran))];
    p = [t("Multiplier par 10 au lieu de 100 : les deux dimensions sont multipliées par 10.")];
  }
  return [utilise(sq, phraseAide(e, "total")), calcul(sq, lignes), resultat(sq, listeFormules(formatReponseAttenduePhaseLatex(e, "total"))), ...(p ? [piege(sq, p)] : [])];
}

function etapePeinture(e: Extract<E, { situation: "mur" }>, sq: string): EtapeCorrection[] {
  const S = rc(valeurTotal(e), e);
  const litres = litresPeinture(e);
  const pots = nombrePots(e);
  const relL = Math.abs(litres * 100 - Math.round(litres * 100)) < 1e-6 ? "=" : "\\approx ";
  const q = Math.round(litres * 100) / 100 / e.contenance;
  const relQ = relL === "=" && Math.abs(q * 100 - Math.round(q * 100)) < 1e-6 ? "=" : "\\approx ";
  return [
    utilise(sq, phraseAide(e, "peinture")),
    calcul(sq, [
      ligne(`\\text{peinture}=\\dfrac{2\\times ${S.tex}}{${r(e.rendement)}}`, `deux couches, ${r(e.rendement).replace("{,}", ",")} m² par litre`),
      ligne(`${relL}${decimalLatex(litres, 2)}\\text{ L}`),
      ligne(`\\dfrac{${decimalLatex(litres, 2)}}{${r(e.contenance)}}${relQ}${decimalLatex(q, 2)}`, "nombre de pots nécessaires"),
      ligne(`n=${pots}`, "un pot entamé s'achète entier : arrondi à l'unité supérieure"),
    ]),
    resultat(sq, listeFormules(formatReponseAttenduePhaseLatex(e, "peinture"))),
    piege(sq, [t(`Arrondir le nombre de pots au plus proche ou vers le bas (${pots - 1} pot${pots - 1 > 1 ? "s" : ""}) : il manquerait de la peinture.`)]),
  ];
}

function etapeCout(e: E, sq: string): EtapeCorrection[] {
  const v = valeurCout(e);
  const fin = droite(formatReponseAttenduePhaseLatex(e, "cout")[0]!);
  let lignes: LigneCalcul[] = [];
  let p: FragmentConsigne[] | null = null;
  if (e.situation === "mur") lignes = [ligne(`\\text{coût}=${nombrePots(e)}\\times ${eurosLatex(e.prixPot)}`, "nombre de pots × prix d'un pot"), ligne(fin)];
  else if (e.situation === "vitrail") {
    const rouge = rc(aireCourbe(e), e);
    const clair = rc(valeurTotal(e), e);
    lignes = [
      ligne(`\\text{coût}=\\dfrac{${rouge.tex}}{100}\\times ${eurosLatex(e.prixColore)}+\\dfrac{${clair.tex}}{100}\\times ${eurosLatex(e.prixClair)}`, "aires converties en m² (1 dm² = 0,01 m²)"),
      ligne(fin),
    ];
    p = [t("Multiplier des dm² par un prix au m² : le coût serait cent fois trop grand.")];
  } else if (e.situation === "parcelle") {
    // Aire en m² EXACTE (fraction), valeur exacte : le seul arrondi est celui de la réponse.
    const total = totalParcelleExact(e);
    const valeur = fMul(total, fraction(Math.round(e.prix * 100), 100));
    const entiere = valeur.d === 1;
    lignes = [
      ligne(`\\text{valeur}=${fractionTex(total, false)}\\times ${eurosLatex(e.prix)}`, "aire en m² × prix au m²"),
      ...(entiere ? [] : [ligne(`${100 % valeur.d === 0 ? "=" : "\\approx "}${decimalLatex(v, 2)}`)]),
      ligne(fin, entiere ? undefined : "arrondi à l'euro"),
    ];
  }
  return [utilise(sq, phraseAide(e, "cout")), calcul(sq, lignes), resultat(sq, listeFormules(formatReponseAttenduePhaseLatex(e, "cout"))), ...(p ? [piege(sq, p)] : [])];
}

function etapeVolume(e: Extract<E, { situation: "section" }>, sq: string): EtapeCorrection[] {
  const aire = rc(aireCourbe(e), e);
  const fin = finApprochee(droite(formatReponseAttenduePhaseLatex(e, "volume")[0]!), aire.rel !== "=");
  const lignes: LigneCalcul[] =
    e.contexte === "gouttiere"
      ? [
          ligne(`V=\\mathcal{A}\\times\\ell`, "prisme droit : aire de la section × longueur"),
          ligne(`${aire.rel}${aire.tex}\\times ${r(100 * e.longueur)}\\text{ cm}^3`, `longueur convertie en cm : ${r(e.longueur).replace("{,}", ",")} m = ${r(100 * e.longueur)} cm`),
          // Volume en cm³ écrit au centième : « = » seulement s'il est exact à ce rang (sinon 5488/75 × 940 était
          // « égal » à 68 782,93).
          ligne(`${Math.abs(aireCourbe(e) * 100 * e.longueur * 100 - Math.round(aireCourbe(e) * 100 * e.longueur * 100)) < 1e-6 ? aire.rel : "\\approx "}\\dfrac{${decimalLatex(aireCourbe(e) * 100 * e.longueur, 2)}}{1000}\\text{ L}`, "1 L = 1000 cm³"),
          ligne(fin),
        ]
      : [ligne(`V=\\mathcal{A}\\times\\ell`, "prisme droit : aire de la section × longueur"), ligne(`${aire.rel}${aire.tex}\\times ${r(e.longueur)}`), ligne(fin)];
  return [
    utilise(sq, phraseAide(e, "volume")),
    calcul(sq, lignes),
    resultat(sq, listeFormules(formatReponseAttenduePhaseLatex(e, "volume"))),
    piege(sq, e.contexte === "gouttiere" ? [t("Multiplier des cm² par une longueur en mètres : convertis la longueur en cm avant de multiplier.")] : [t("Oublier de multiplier par la longueur : l'aire de la section n'est pas un volume.")]),
  ];
}

export function correctionDetailleeAiresFormesReelles(e: E): EtapeCorrection[] {
  return phasesExercice(e).flatMap((phase): EtapeCorrection[] => {
    const sq = lettre(e, phase);
    switch (phase) {
      case "modeliser": {
        const m = lignesModeliser(e);
        return [utilise(sq, m.utilise), calcul(sq, m.lignes), resultat(sq, listeFormules(formatReponseAttenduePhaseLatex(e, phase))), ...(m.piege ? [piege(sq, m.piege)] : [])];
      }
      case "aire":
        return etapeAire(e, sq);
      case "total":
        return etapeTotal(e, sq);
      case "peinture":
        return e.situation === "mur" ? etapePeinture(e, sq) : [];
      case "cout":
        return etapeCout(e, sq);
      case "volume":
        return e.situation === "section" ? etapeVolume(e, sq) : [];
    }
  });
}
