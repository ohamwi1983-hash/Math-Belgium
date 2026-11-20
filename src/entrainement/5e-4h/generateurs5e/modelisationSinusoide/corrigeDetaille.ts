import type { ExerciceModelisationSinusoide, QuestionInequation, QuestionResoudre } from "../../core5e/modelisationSinusoide.types";
import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { ordreComplet, type PhaseModelisationSinusoide } from "../../moteur5e/typesModelisationSinusoide";
import { formatTermesReponseAttendueModelisationSinusoide, nombreLatex } from "../../ui5e/formatModelisationSinusoide";
import { COURS_MODELISER, dec, EPi, eSub, eMul, exprLatex, finaliserCorrige, kDansIntervalle, listeLatex, q, somme } from "../../ui5e/corrigeTrigonometrie2";

/**
 * Corrigé détaillé « comme au tableau » de 5gen13 (modéliser une fonction sinusoïdale en contexte)
 * — règle `.claude/rules/feuilles-evaluations.md`. Une lettre par ÉCRAN (`ordreComplet` : 0 à 5
 * écrans de construction selon la technique, puis 0 à 4 écrans d'exploitation). Valeurs exactes
 * quand elles le sont (A, b, ω = 2π/T, φ de B2 en fractions de π), sinon lettres ω, φ, α (= arcsin m),
 * α₁, α₂ gardées jusqu'à la dernière ligne, qui arrondit À PARTIR DES VALEURS NON ARRONDIES — jamais
 * « valeurs arrondies substituées = résultat ». Solutions et intervalles de la fenêtre un par un
 * (valeur de k). Résultats = `formatTermesReponseAttendueModelisationSinusoide` (écran).
 * Écran de pure lecture : « amplitude » de la grande roue (A = R, `lettresLectureModelisation`).
 */

type E = ExerciceModelisationSinusoide;
const LETTRES = "abcdefghijklmnopqrstuvwxyz";

function reponse(e: E, phase: PhaseModelisationSinusoide, sep = " ; ") {
  return listeLatex(formatTermesReponseAttendueModelisationSinusoide(e, phase), sep);
}

function n4(v: number): string {
  return nombreLatex(v, 4);
}

/** « ≈ » si la valeur n'est pas exacte au dix-millième. */
function relation4(v: number): string {
  return Math.abs(v * 1e4 - Math.round(v * 1e4)) < 1e-7 ? "=" : "\\approx ";
}

/** Coefficient entier devant ω : « 3\omega », « \omega », « -4\omega » (0 → vide). */
function coefOmega(t: number): string {
  return t === 0 ? "" : t === 1 ? "\\omega" : t === -1 ? "-\\omega" : `${t}\\omega`;
}

/** Fraction (y₀ − b)/A avec les nombres : « \dfrac{12{,}35-7}{11} ». */
function fractionM(y0: number, b: number, A: number, decimales = 2): string {
  const num = b === 0 ? nombreLatex(y0, decimales) : `${nombreLatex(y0, decimales)}${b > 0 ? "-" : "+"}${Math.abs(b)}`;
  return `\\dfrac{${num}}{${A}}`;
}

/** m = (k − b)/A, une ligne exacte (« = 0{,}47 ») ou approchée (« ≈ 0{,}4864 »). */
function ligneM(m: number, suffixe = "", justification = "on note m cette valeur"): LigneCalcul {
  return ligne(`${relation4(m)}${n4(m)}${suffixe}`, justification);
}

/** Valeur exacte en π (B1, B2) : « \dfrac{\pi}{20} ». */
function omegaPi(N: number): string {
  return exprLatex(EPi(2, N));
}

// ---------------------------------------------------------------------------------------------
// Construction (phase 1)
// ---------------------------------------------------------------------------------------------

function etapesAmplitude(e: E, sq: string): EtapeCorrection[] {
  const d = e.phase1;
  if (d.technique === "b1") {
    return [
      utilise(sq, [texte(`La nacelle monte d'un rayon au-dessus de l'axe de la roue et descend d'un rayon en dessous : l'amplitude est le rayon ${COURS_MODELISER}.`)]),
      calcul(sq, [ligne("A=R", "amplitude = rayon de la roue"), ligne(`=${d.rayon}`, "R lu dans les données")]),
      resultat(sq, reponse(e, "amplitude")),
    ];
  }
  if (d.technique !== "b2") return [];
  return [
    utilise(sq, [texte(`L'amplitude est la moitié de l'écart entre le maximum et le minimum ${COURS_MODELISER} : `), latex("A=\\dfrac{\\max-\\min}{2}"), texte(".")]),
    calcul(sq, [
      ligne("A=\\dfrac{\\max-\\min}{2}", "moitié de l'écart"),
      ligne(`=\\dfrac{${d.max}-${d.min < 0 ? `(${d.min})` : d.min}}{2}`, "on remplace"),
      ligne(`=\\dfrac{${d.max - d.min}}{2}`),
      ligne(`=${d.fonction.A}`),
    ]),
    resultat(sq, reponse(e, "amplitude")),
  ];
}

function etapesDecalage(e: E, sq: string): EtapeCorrection[] {
  const d = e.phase1;
  if (d.technique === "b1") {
    return [
      utilise(sq, [texte(`Le décalage vertical est la hauteur de l'axe de la roue : le point le plus bas, plus un rayon ${COURS_MODELISER}.`)]),
      calcul(sq, [ligne("b=R+h_{sol}", "hauteur de l'axe"), ligne(`=${d.rayon}+${d.hauteurSol}`, "on remplace"), ligne(`=${d.fonction.b}`)]),
      resultat(sq, reponse(e, "decalage")),
      verification(sq, [texte("Le point le plus bas est un rayon sous l'axe :")], [ligne(`b-A=${d.fonction.b}-${d.rayon}`), ligne(`=${d.hauteurSol}`, "c'est bien la hauteur du point le plus bas")]),
    ];
  }
  if (d.technique !== "b2") return [];
  return [
    utilise(sq, [texte(`Le décalage vertical est la position d'équilibre, à mi-hauteur entre le maximum et le minimum ${COURS_MODELISER} : `), latex("b=\\dfrac{\\max+\\min}{2}"), texte(".")]),
    calcul(sq, [
      ligne("b=\\dfrac{\\max+\\min}{2}", "milieu du maximum et du minimum"),
      ligne(`=\\dfrac{${d.max}+${d.min < 0 ? `(${d.min})` : d.min}}{2}`, "on remplace"),
      ligne(`=\\dfrac{${d.max + d.min}}{2}`),
      ligne(`=${d.fonction.b}`),
    ]),
    resultat(sq, reponse(e, "decalage")),
    verification(sq, [texte("Le maximum est à A au-dessus de la position d'équilibre :")], [ligne(`b+A=${d.fonction.b}+${d.fonction.A}`), ligne(`=${d.max}`, "c'est bien le maximum donné")]),
  ];
}

function etapesPulsation(e: E, sq: string): EtapeCorrection[] {
  const d = e.phase1;
  if (d.technique !== "b1" && d.technique !== "b2") return [];
  const N = d.technique === "b1" ? d.dureeTour : d.periode;
  const lignes: LigneCalcul[] = [ligne("\\omega=\\dfrac{2\\pi}{T}", "une période = un tour complet"), ligne(`=\\dfrac{2\\pi}{${N}}`, d.technique === "b1" ? "durée d'un tour" : "période donnée")];
  const exact = omegaPi(N);
  if (exact !== `\\dfrac{2\\pi}{${N}}`) lignes.push(ligne(`=${exact}`, "on simplifie"));
  lignes.push(ligne(`\\approx ${n4(d.fonction.omega)}`));
  return [
    utilise(sq, [texte(`La pulsation se déduit de la période ${COURS_MODELISER} : `), latex("\\omega=\\dfrac{2\\pi}{T}"), texte(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "pulsation")),
  ];
}

function etapesPhi(e: E, sq: string): EtapeCorrection[] {
  const d = e.phase1;
  if (d.technique !== "b2") return [];
  const cible = d.estMax ? EPi(1, 2) : EPi(3, 2);
  const omega = EPi(2, d.periode);
  const produit = eMul(omega, q(d.t0));
  const phi = eSub(cible, produit);
  const lignes: LigneCalcul[] = [
    ligne(`\\omega t_0+\\varphi=${exprLatex(cible)}`, `en t₀ = ${d.t0}, f est ${d.estMax ? "maximale : sin vaut 1" : "minimale : sin vaut −1"}`),
    ligne(`\\varphi=${exprLatex(cible)}-\\omega t_0`, "on isole φ"),
    ligne(`=${exprLatex(cible)}-${omegaPi(d.periode)}\\cdot ${d.t0}`, `ω (étape précédente) et t₀ = ${d.t0}`),
  ];
  if (d.t0 > 1) lignes.push(ligne(`=${somme([exprLatex(cible), `-${exprLatex(produit)}`])}`));
  lignes.push(ligne(`=${exprLatex(phi)}`), ligne(`\\approx ${n4(d.fonction.phi as number)}`));
  return [
    utilise(sq, [
      texte(`En un maximum, sin(ωt + φ) = 1, donc l'argument vaut `),
      latex("\\dfrac{\\pi}{2}"),
      texte(" ; en un minimum, sin(ωt + φ) = −1 et l'argument vaut "),
      latex("\\dfrac{3\\pi}{2}"),
      texte(` (à 2π près) ${COURS_MODELISER}.`),
    ]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "phi")),
    verification(sq, [texte("En t₀, l'argument redonne la valeur visée :")], [ligne(`\\omega t_0+\\varphi=${omegaPi(d.periode)}\\cdot ${d.t0}+${exprLatex(phi).startsWith("-") ? `\\left(${exprLatex(phi)}\\right)` : exprLatex(phi)}`), ligne(`=${exprLatex(cible)}`)]),
    ...(d.estMax ? [] : [piege(sq, [texte("Au minimum, l'argument vaut 3π/2, pas π/2.")])]),
  ];
}

function etapesSysteme(e: E, sq: string): EtapeCorrection[] {
  const d = e.phase1;
  if (d.technique !== "b3") return [];
  const bloc = (t: number, v: number, alpha: number, i: number): EtapeCorrection => {
    const arg = somme([coefOmega(t), "\\varphi"]);
    const indice = i === 1 ? "₁" : "₂";
    return calcul(
      sq,
      [
        ligne(`${d.A}\\sin(${arg})${d.b === 0 ? "" : d.b > 0 ? `+${d.b}` : `${d.b}`}=${n4(v)}`, `f(t${indice}) = f${indice}`),
        ligne(`\\sin(${arg})=${fractionM(v, d.b, d.A, 4)}`, "on retranche b puis on divise par A"),
        ligne(`${arg}=\\arcsin${fractionM(v, d.b, d.A, 4)}`, "l'argument est entre −π/2 et π/2"),
        ligne(`\\approx ${n4(alpha)}`, `calculatrice, en radians : valeur notée α${indice}`),
      ],
      [],
      `Point ${i}`,
    );
  };
  return [
    utilise(sq, [texte(`En chaque point, on isole le sinus, puis on prend l'arcsin : l'argument est entre −π/2 et π/2 ${COURS_MODELISER}. On obtient deux équations du premier degré en ω et φ.`)]),
    bloc(d.t1, d.v1, d.alpha1, 1),
    bloc(d.t2, d.v2, d.alpha2, 2),
    resultat(sq, reponse(e, "systeme")),
  ];
}

function etapesResolution(e: E, sq: string): EtapeCorrection[] {
  const d = e.phase1;
  if (d.technique !== "b3") return [];
  const a1 = somme([coefOmega(d.t1), "\\varphi"]);
  const a2 = somme([coefOmega(d.t2), "\\varphi"]);
  const diff = d.t1 - d.t2;
  const sum = d.t1 + d.t2;
  return [
    utilise(sq, [texte(`On soustrait les deux équations membre à membre : φ s'élimine et on obtient ω ; on les additionne pour obtenir φ ${COURS_MODELISER}.`)]),
    calcul(
      sq,
      [
        ligne(`(${a1})-(${a2})=\\alpha_1-\\alpha_2`, "on soustrait membre à membre"),
        ligne(`${coefOmega(diff)}=\\alpha_1-\\alpha_2`, "φ s'élimine"),
        ...(diff === 1 ? [] : [ligne(diff === -1 ? "\\omega=\\alpha_2-\\alpha_1" : `\\omega=\\dfrac{\\alpha_1-\\alpha_2}{${diff}}`, diff === -1 ? "on change les signes" : `on divise par ${String(diff).replace("-", "−")}`)]),
        ligne(`\\approx ${n4(d.fonction.omega)}`, "α₁ et α₂ non arrondis"),
      ],
      [],
      "Pulsation ω",
    ),
    calcul(
      sq,
      [
        ligne(`(${a1})+(${a2})=\\alpha_1+\\alpha_2`, "on additionne membre à membre"),
        ligne(`${somme([coefOmega(sum), "2\\varphi"])}=\\alpha_1+\\alpha_2`, "on réduit"),
        ligne(`\\varphi=\\dfrac{\\alpha_1+\\alpha_2-${coefOmega(sum)}}{2}`, "on isole φ"),
        ligne(`\\approx ${n4(d.fonction.phi as number)}`, "ω non arrondi"),
      ],
      [],
      "Phase φ",
    ),
    resultat(sq, reponse(e, "resolution")),
  ];
}

function etapesFonction(e: E, sq: string): EtapeCorrection[] {
  const d = e.phase1;
  const finale = formatTermesReponseAttendueModelisationSinusoide(e, "fonctionFinale")[0] ?? "";
  const rhs = finale.replace(/^f\(t\)\s*(=|\\approx)\s*/, "");
  const lignes: LigneCalcul[] = [ligne("f(t)=A\\sin(\\omega t+\\varphi)+b", "modèle")];
  if (d.technique === "b1") lignes.push(ligne(`=${rhs}`, "A, ω et b remplacés ; φ reste littéral"));
  else if (d.technique === "b2") {
    const phi = eSub(d.estMax ? EPi(1, 2) : EPi(3, 2), eMul(EPi(2, d.periode), q(d.t0)));
    const phiL = exprLatex(phi);
    lignes.push(
      ligne(`=${d.fonction.A}\\sin\\left(${omegaPi(d.periode)}t${phiL.startsWith("-") ? phiL : phiL === "0" ? "" : `+${phiL}`}\\right)${d.fonction.b === 0 ? "" : d.fonction.b > 0 ? `+${d.fonction.b}` : d.fonction.b}`, "valeurs exactes"),
      ligne(`\\approx ${rhs}`, "ω et φ arrondis au cent-millième"),
    );
  } else if (d.technique === "b3") {
    lignes.push(ligne(`=${d.A}\\sin(\\omega t+\\varphi)${d.b === 0 ? "" : d.b > 0 ? `+${d.b}` : d.b}`, "A et b donnés"), ligne(`\\approx ${rhs}`, "ω et φ de l'étape précédente"));
  }
  return [
    utilise(sq, d.technique === "b1" ? [texte(`On remplace A, ω et b dans le modèle ; aucune donnée ne fixe la position de la nacelle à t = 0 : φ reste sous forme littérale ${COURS_MODELISER}.`)] : [texte(`On remplace A, ω, φ et b dans le modèle ${COURS_MODELISER}.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "fonctionFinale")),
    ...(d.technique === "b1" ? [piege(sq, [texte("N'invente pas de valeur pour φ : rien dans l'énoncé ne fixe la position de la nacelle à t = 0.")])] : []),
  ];
}

// ---------------------------------------------------------------------------------------------
// Exploitation (phase 2)
// ---------------------------------------------------------------------------------------------

const A_SIN = (e: E) => `${e.phase1.fonction.A}\\sin u${e.phase1.fonction.b === 0 ? "" : e.phase1.fonction.b > 0 ? `+${e.phase1.fonction.b}` : e.phase1.fonction.b}`;

function etapesArgumentResoudre(e: E, q2: QuestionResoudre, sq: string): EtapeCorrection[] {
  const { A, b } = e.phase1.fonction;
  const m = (q2.k - b) / A;
  const lignes: LigneCalcul[] = [ligne(`${A_SIN(e)}=${nombreLatex(q2.k, 2)}`, "f(t) = y₀ avec u = ωt + φ"), ligne(`\\sin u=${fractionM(q2.k, b, A)}`, "on retranche b puis on divise par A")];
  if (q2.aucuneSolution) {
    lignes.push(ligneM(m, m > 0 ? ">1" : "<-1", "un sinus est toujours compris entre −1 et 1 : aucune solution"));
    return [
      utilise(sq, [texte(`On pose u = ωt + φ et on isole le sinus ${COURS_MODELISER} ; un sinus reste toujours entre −1 et 1.`)]),
      calcul(sq, lignes),
      resultat(sq, reponse(e, "argumentResoudre")),
    ];
  }
  const alpha = Math.asin(m);
  lignes.push(
    ligneM(m),
    ligne(`\\alpha=\\arcsin m\\approx ${n4(alpha)}`, "calculatrice, en radians"),
    ligne("u=\\alpha+2k\\pi", "première série"),
    ligne(`\\approx ${n4(alpha)}+2k\\pi`),
    ligne("u=\\pi-\\alpha+2k\\pi", "angle supplémentaire : même sinus"),
    ligne(`\\approx ${n4(Math.PI - alpha)}+2k\\pi`),
  );
  return [
    utilise(sq, [texte(`On pose u = ωt + φ et on isole le sinus ; puis deux angles supplémentaires ont le même sinus ${COURS_MODELISER} : `), latex("\\sin u=m\\iff u=\\arcsin m+2k\\pi\\ \\text{ou}\\ u=\\pi-\\arcsin m+2k\\pi"), texte(".")]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "argumentResoudre")),
    piege(sq, [texte("Deux séries de solutions : n'oublie pas u = π − arcsin m + 2kπ.")]),
  ];
}

/** Isoler t dans « ωt + φ = U + k·P » (U symbolique : α, π − α, π/2). */
function lignesIsolerT(U: string, P: string, Pfois: string, c: number, p: number): LigneCalcul[] {
  return [
    ligne(`\\omega t+\\varphi=${U}+${P}`, "u = ωt + φ"),
    ligne(`\\omega t=${U}-\\varphi+${P}`, "on retranche φ"),
    ligne(`t=\\dfrac{1}{\\omega}\\left(${U}-\\varphi+${P}\\right)`, "on divise par ω"),
    ligne(`=\\dfrac{1}{\\omega}\\left(${U}-\\varphi\\right)+${Pfois}k`, "chaque terme divisé par ω, la période aussi"),
    ligne(`\\approx ${dec(c, 4)}+${dec(p, 4)}k`, "ω et φ non arrondis"),
  ];
}

function etapesIsolerT(e: E, sq: string, series: { U: string; c: number }[], P: string, Pfois: string, p: number, phase: PhaseModelisationSinusoide): EtapeCorrection[] {
  return [
    utilise(sq, [texte(`Dans chaque série, on remplace u par ωt + φ, on retranche φ, puis on divise tout par ω — la constante et la période ${COURS_MODELISER}.`)]),
    ...series.map((s, i) => calcul(sq, lignesIsolerT(s.U, P, Pfois, s.c, p), [], series.length > 1 ? `${i === 0 ? "1ʳᵉ" : "2ᵉ"} série` : "Calcul")),
    resultat(sq, reponse(e, phase)),
    piege(sq, [texte("La période se divise aussi par ω : diviser seulement la constante donne de fausses solutions.")]),
  ];
}

function lignesSolutionsT(U: string, P: (k: string) => string, c: number, p: number, fenetre: number, vues: number[]): LigneCalcul[] {
  const ks = kDansIntervalle(c, p, fenetre, true);
  const kmin = ks.length ? ks[0]! : Math.ceil(-c / p);
  const kmax = ks.length ? ks[ks.length - 1]! : kmin - 1;
  const lignes: LigneCalcul[] = [];
  for (let k = kmin - 1; k <= kmax + 1; k++) {
    const t = c + k * p;
    const kTexte = k < 0 ? `(${k})` : `${k}`;
    const expr = k === 0 ? `\\dfrac{1}{\\omega}\\left(${U}-\\varphi\\right)` : `\\dfrac{1}{\\omega}\\left(${U}-\\varphi+${P(kTexte)}\\right)`;
    const chaine = `t=${expr}\\approx ${dec(t, 2)}`;
    if (k < kmin) lignes.push(ligne(`${chaine}<0`, `k = ${k} : hors de la fenêtre`));
    else if (k > kmax) lignes.push(ligne(`${chaine}>${nombreLatex(fenetre, 2)}`, `k = ${k} : hors de la fenêtre`));
    else {
      const doublon = vues.some((v) => Math.abs(v - t) < 1e-6);
      lignes.push(ligne(chaine, `k = ${k}${doublon ? " : déjà obtenue" : ""}`));
      if (!doublon) vues.push(t);
    }
  }
  return lignes;
}

function etapesSolutions(e: E, sq: string, series: { U: string; c: number }[], P: (k: string) => string, p: number, fenetre: number, phase: PhaseModelisationSinusoide): EtapeCorrection[] {
  const vues: number[] = [];
  return [
    utilise(sq, [texte(`On donne à k des valeurs entières successives dans chaque série et on garde les instants de la fenêtre [0 ; ${nombreLatex(fenetre, 2).replace("{,}", ",")}] (bornes comprises).`)]),
    ...series.map((s, i) => calcul(sq, lignesSolutionsT(s.U, P, s.c, p, fenetre, vues), [], series.length > 1 ? `${i === 0 ? "1ʳᵉ" : "2ᵉ"} série` : "Calcul")),
    resultat(sq, reponse(e, phase)),
  ];
}

function etapesPoserExtremum(e: E, sq: string): EtapeCorrection[] {
  return [
    utilise(sq, [texte("Un maximum correspond à sin u = 1, un minimum à sin u = −1 ; réunies, les deux séries donnent un extremum tous les π "), texte(COURS_MODELISER), texte(".")]),
    calcul(sq, [
      ligne("u=\\dfrac{\\pi}{2}+2k\\pi", "maximums : sin u = 1"),
      ligne("u=-\\dfrac{\\pi}{2}+2k\\pi", "minimums : sin u = −1"),
      ligne("u=\\dfrac{\\pi}{2}+k\\pi", "les deux séries réunies : période π"),
    ]),
    resultat(sq, reponse(e, "poserExtremum")),
    piege(sq, [texte("Maximums et minimums réunis : la série a une période π, pas 2π.")]),
  ];
}

function etapesIsolerSin(e: E, q3: QuestionInequation, sq: string): EtapeCorrection[] {
  const { A, b } = e.phase1.fonction;
  const ge = q3.sens === "ge";
  const rel = ge ? "\\geq" : "\\leq";
  const lignes: LigneCalcul[] = [ligne(`${A_SIN(e)}${rel} ${nombreLatex(q3.k, 2)}`, `f(t) ${ge ? "≥" : "≤"} y₀ avec u = ωt + φ`), ligne(`\\sin u${rel} ${fractionM(q3.k, b, A)}`, "on retranche b, puis on divise par A > 0 : le sens ne change pas")];
  const m = q3.m;
  let justification = "on note m cette valeur";
  let suffixe = "";
  if (q3.casSpecial !== null) {
    suffixe = m > 1 ? ">1" : "<-1";
    const toujours = q3.casSpecial === "toujoursVrai";
    justification = `${m > 1 ? "sin u ≤ 1 < m" : "sin u ≥ −1 > m"} : l'inéquation est ${toujours ? "toujours vraie" : "jamais vraie"}`;
  }
  lignes.push(ligne(`m=${fractionM(q3.k, b, A)}`, "valeur visée pour le sinus"), ligneM(m, suffixe, justification));
  return [
    utilise(sq, [texte(`On pose u = ωt + φ et on isole le sinus ${COURS_MODELISER} ; comme sin u reste entre −1 et 1, si |m| > 1 l'inéquation est toujours vraie ou jamais vraie.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "isolerSinInequation")),
  ];
}

function bornesU(q3: QuestionInequation): { g: string; d: string } {
  return q3.sens === "ge" ? { g: "\\alpha", d: "\\pi-\\alpha" } : { g: "\\pi-\\alpha", d: "2\\pi+\\alpha" };
}

function etapesResoudreU(e: E, q3: QuestionInequation, sq: string): EtapeCorrection[] {
  const alpha = Math.asin(q3.m);
  const { g, d } = bornesU(q3);
  const lignes: LigneCalcul[] = [ligne(`\\alpha=\\arcsin m\\approx ${n4(alpha)}`, "calculatrice, en radians")];
  lignes.push(ligne(`u\\in[${g}\\,;\\,${d}]`, q3.sens === "ge" ? "sin u ≥ m sur l'arc qui contient π/2" : "sin u ≤ m sur l'arc complémentaire, d'un seul tenant"));
  if (q3.sens === "le") lignes.push(ligne(`\\pi-\\alpha\\approx ${n4(q3.borneInfU)}`, "borne de gauche"));
  lignes.push(ligne(`${d}\\approx ${n4(q3.borneSupU)}`, "borne de droite"));
  return [
    utilise(sq, [texte(`Sur le cercle trigonométrique, ${q3.sens === "ge" ? "sin u ≥ m sur l'arc qui contient π/2, de arcsin m à π − arcsin m" : "sin u ≤ m sur l'arc complémentaire, de π − arcsin m à 2π + arcsin m"} ${COURS_MODELISER}.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "resoudreUInequation")),
    piege(sq, [texte("Choisis le bon arc du cercle : pour ≥, celui qui contient π/2 ; pour ≤, l'arc complémentaire.")]),
  ];
}

function etapesIsolerTInequation(e: E, q3: QuestionInequation, sq: string): EtapeCorrection[] {
  const { g, d } = bornesU(q3);
  return [
    utilise(sq, [texte(`Sur chaque borne, t = (u − φ)/ω : on retranche φ, puis on divise par ω > 0 (l'ordre des bornes est conservé) ${COURS_MODELISER}.`)]),
    calcul(sq, [
      ligne(`t_g=\\dfrac{${g}-\\varphi}{\\omega}`, "borne de gauche"),
      ligne(`\\approx ${n4(q3.borneInfT)}`, "ω et φ non arrondis"),
      ligne(`t_d=\\dfrac{${d}-\\varphi}{\\omega}`, "borne de droite"),
      ligne(`\\approx ${n4(q3.borneSupT)}`),
    ]),
    resultat(sq, reponse(e, "isolerTInequation")),
  ];
}

function etapesListerIntervalles(e: E, q3: QuestionInequation, sq: string): EtapeCorrection[] {
  const omega = e.phase1.fonction.omega;
  const T = (2 * Math.PI) / omega;
  const lignes: LigneCalcul[] = [ligne("T=\\dfrac{2\\pi}{\\omega}", "les bornes se répètent à chaque période"), ligne(`\\approx ${n4(T)}`)];
  for (let k = -200; k <= 200; k++) {
    const g = q3.borneInfT + k * T;
    const d = q3.borneSupT + k * T;
    if (Math.max(0, g) > Math.min(q3.fenetre, d)) continue;
    const kT = k === 0 ? "" : k === 1 ? "+T" : k === -1 ? "-T" : `${k > 0 ? "+" : ""}${k}T`;
    const coupe = g < 0 || d > q3.fenetre;
    const garde = `[${dec(Math.max(0, g), 2)}\\,;\\,${dec(Math.min(q3.fenetre, d), 2)}]`;
    lignes.push(
      ligne(
        `[t_g${kT}\\,;\\,t_d${kT}]\\approx[${dec(g, 2)}\\,;\\,${dec(d, 2)}]`,
        coupe ? [texte(`k = ${String(k).replace("-", "−")} : on garde la partie dans la fenêtre, `), latex(garde)] : `k = ${k} : dans la fenêtre`,
      ),
    );
  }
  return [
    utilise(sq, [texte(`On ajoute à l'intervalle [t_g ; t_d] des multiples de la période T = 2π/ω et on garde ce qui tombe dans la fenêtre [0 ; ${nombreLatex(q3.fenetre, 2).replace("{,}", ",")}] ${COURS_MODELISER}.`)]),
    calcul(sq, lignes),
    resultat(sq, reponse(e, "listerIntervallesInequation", " ∪ ")),
  ];
}

// ---------------------------------------------------------------------------------------------

function etapesPhase(e: E, phase: PhaseModelisationSinusoide, sq: string): EtapeCorrection[] {
  const q2 = e.phase2;
  const f = e.phase1.fonction;
  const phi = f.phi ?? 0;
  const omega = f.omega;
  switch (phase) {
    case "amplitude":
      return etapesAmplitude(e, sq);
    case "decalage":
      return etapesDecalage(e, sq);
    case "pulsation":
      return etapesPulsation(e, sq);
    case "phi":
      return etapesPhi(e, sq);
    case "systeme":
      return etapesSysteme(e, sq);
    case "resolution":
      return etapesResolution(e, sq);
    case "fonctionFinale":
      return etapesFonction(e, sq);
    case "argumentResoudre":
      return q2?.type === "resoudre" ? etapesArgumentResoudre(e, q2, sq) : [];
    case "isolerTResoudre":
    case "solutionsResoudre": {
      if (q2?.type !== "resoudre") return [];
      const alpha = Math.asin((q2.k - f.b) / f.A);
      const series = [
        { U: "\\alpha", c: (alpha - phi) / omega },
        { U: "\\pi-\\alpha", c: (Math.PI - alpha - phi) / omega },
      ];
      const p = (2 * Math.PI) / omega;
      return phase === "isolerTResoudre"
        ? etapesIsolerT(e, sq, series, "2k\\pi", "\\dfrac{2\\pi}{\\omega}", p, phase)
        : etapesSolutions(e, sq, series, (k) => `2\\pi\\cdot ${k}`, p, q2.fenetre, phase);
    }
    case "poserExtremum":
      return etapesPoserExtremum(e, sq);
    case "isolerTExtremum":
    case "solutionsExtremum": {
      if (q2?.type !== "extremum") return [];
      const series = [{ U: "\\dfrac{\\pi}{2}", c: (Math.PI / 2 - phi) / omega }];
      const p = Math.PI / omega;
      return phase === "isolerTExtremum"
        ? etapesIsolerT(e, sq, series, "k\\pi", "\\dfrac{\\pi}{\\omega}", p, phase)
        : etapesSolutions(e, sq, series, (k) => `\\pi\\cdot ${k}`, p, q2.fenetre, phase);
    }
    case "isolerSinInequation":
      return q2?.type === "inequation" ? etapesIsolerSin(e, q2, sq) : [];
    case "resoudreUInequation":
      return q2?.type === "inequation" ? etapesResoudreU(e, q2, sq) : [];
    case "isolerTInequation":
      return q2?.type === "inequation" ? etapesIsolerTInequation(e, q2, sq) : [];
    case "listerIntervallesInequation":
      return q2?.type === "inequation" ? etapesListerIntervalles(e, q2, sq) : [];
  }
}

export function correctionDetailleeModelisationSinusoide(e: E): EtapeCorrection[] {
  return finaliserCorrige(ordreComplet(e).flatMap((phase, i) => etapesPhase(e, phase, LETTRES[i]!)));
}

/** Écrans de pure lecture : « amplitude » de la grande roue (A = R, lu dans les données). */
export function lettresLectureModelisation(e: E): string[] {
  return e.phase1.technique === "b1" ? ordreComplet(e).map((p, i) => (p === "amplitude" ? LETTRES[i]! : null)).filter((l): l is string => l !== null) : [];
}

/** Écrans « solutions » / « intervalles » : étapes sans charge (même calcul répété pour chaque k). */
export function lettresSansChargeModelisation(e: E): string[] {
  return ordreComplet(e)
    .map((p, i) => (p === "solutionsResoudre" || p === "solutionsExtremum" || p === "listerIntervallesInequation" ? LETTRES[i]! : null))
    .filter((l): l is string => l !== null);
}

