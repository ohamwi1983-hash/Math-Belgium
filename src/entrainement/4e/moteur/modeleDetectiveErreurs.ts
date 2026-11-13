import type {
  ConfigurationTriangle,
  ExerciceDetectiveErreurs,
  IdDescription,
  IdScenario,
  LigneResolution,
  NatureValeur,
  Sommet,
  SousVariante,
  TypeErreur,
} from "../core/detectiveErreurs.types";

/**
 * Modèle de gen81 (« Le détective d'erreurs ») : résolution pure d'un triangle, ligne par ligne,
 * avec ou sans le défaut du scénario. UNE seule source pour l'écran, les aides, la vérification et
 * l'adaptateur de feuilles.
 *
 * - `copieEleve(e)` : la copie fictive (le défaut est injecté à la ligne fausse, les lignes
 *   suivantes réutilisent les valeurs FAUSSES : la copie reste cohérente avec son erreur) ;
 * - `resolutionCorrecte(e)` : la même résolution, sans défaut (même nombre de lignes, sauf le cas
 *   ambigu, qui ajoute le second triangle).
 *
 * Valeurs gardées en mémoire (jamais d'arrondi intermédiaire) ; les nombres RECOPIÉS dans une
 * formule sont ceux affichés aux lignes précédentes (côtés au centième, angles au dixième, cosinus
 * et sinus au dix-millième). Seule exception, la somme des angles : Ĉ = 180° − Â − B̂ est calculée
 * avec les angles AFFICHÉS, comme le fait un élève (sinon la soustraction affichée pourrait sembler
 * fausse d'un dixième).
 */

const D2R = Math.PI / 180;

export const SCENARIOS: Record<IdScenario, { type: TypeErreur; configuration: ConfigurationTriangle; ligne: number; nombreLignes: number }> = {
  O1: { type: "obtus", configuration: "SAS", ligne: 3, nombreLignes: 5 },
  O2: { type: "obtus", configuration: "SAS", ligne: 5, nombreLignes: 6 },
  O3: { type: "obtus", configuration: "SSS", ligne: 3, nombreLignes: 5 },
  R1: { type: "radians", configuration: "SAS", ligne: 0, nombreLignes: 5 },
  R2: { type: "radians", configuration: "AAS", ligne: 1, nombreLignes: 5 },
  R3: { type: "radians", configuration: "SSS", ligne: 1, nombreLignes: 5 },
  A1: { type: "arrondi", configuration: "SAS", ligne: 1, nombreLignes: 5 },
  A2: { type: "arrondi", configuration: "SAS", ligne: 2, nombreLignes: 5 },
  A3: { type: "arrondi", configuration: "SSS", ligne: 0, nombreLignes: 5 },
  A4: { type: "arrondi", configuration: "AAS", ligne: 1, nombreLignes: 5 },
  C1: { type: "coteOppose", configuration: "AAS", ligne: 1, nombreLignes: 5 },
  C2: { type: "coteOppose", configuration: "AAS", ligne: 2, nombreLignes: 5 },
  C3: { type: "coteOppose", configuration: "AAS", ligne: 3, nombreLignes: 5 },
  K1: { type: "alKashi", configuration: "SAS", ligne: 0, nombreLignes: 5 },
  K2: { type: "alKashi", configuration: "SSS", ligne: 2, nombreLignes: 5 },
  G1: { type: "ambigu", configuration: "SSA", ligne: 1, nombreLignes: 5 },
};

export const SCENARIOS_PAR_TYPE: Record<TypeErreur, IdScenario[]> = {
  obtus: ["O1", "O2", "O3"],
  radians: ["R1", "R2", "R3"],
  arrondi: ["A1", "A2", "A3", "A4"],
  coteOppose: ["C1", "C2", "C3"],
  alKashi: ["K1", "K2"],
  ambigu: ["G1"],
};

export function typeErreur(e: ExerciceDetectiveErreurs): TypeErreur {
  return SCENARIOS[e.scenario].type;
}

export function configuration(e: ExerciceDetectiveErreurs): ConfigurationTriangle {
  return SCENARIOS[e.scenario].configuration;
}

/** Description juste de l'erreur (écran 2). */
export function descriptionCorrecte(e: { scenario: IdScenario; sousVariante: SousVariante }): IdDescription {
  const type = SCENARIOS[e.scenario].type;
  if (type === "alKashi") return e.sousVariante === "signe" ? "signe" : "facteur";
  return type;
}

/** Indice (0 = ligne 1) de la ligne fausse. */
export function indiceLigneFausse(e: ExerciceDetectiveErreurs): number {
  return SCENARIOS[e.scenario].ligne;
}

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

export const DECIMALES: Record<NatureValeur, number> = { cote: 2, carre: 2, angle: 1, trig: 4, aire: 2, aucune: 0 };

export function arrondir(x: number, decimales: number): number {
  const p = 10 ** decimales;
  const r = Math.round(x * p) / p;
  return r === 0 ? 0 : r;
}

function estEntier(x: number): boolean {
  return Math.abs(x - Math.round(x)) < 1e-9;
}

/** Nombre LaTeX à `decimales` décimales (virgule `{,}`) ; un nombre exact à cette précision
 * s'écrit sans zéros inutiles (« 0,5 », « 52 »). */
export function nombreLatex(x: number, decimales: number): string {
  if (estEntier(x)) return String(Math.round(x) === 0 ? 0 : Math.round(x));
  const r = arrondir(x, decimales);
  const texte = Math.abs(x - r) < 1e-9 ? String(r) : r.toFixed(decimales);
  return texte.replace(".", "{,}");
}

/** Facteur dans un produit : un négatif entre parenthèses. */
function facteur(x: number, decimales: number): string {
  const s = nombreLatex(x, decimales);
  return x < 0 ? `(${s})` : s;
}

/** Valeur telle qu'affichée (pour la réutiliser dans une somme d'angles). */
export function valeurAffichee(x: number, nature: NatureValeur): number {
  return estEntier(x) ? Math.round(x) : arrondir(x, DECIMALES[nature]);
}

const UNITE: Record<NatureValeur, string> = { cote: "\\text{ cm}", carre: "", angle: "°", trig: "", aire: "\\text{ cm}^2", aucune: "" };

/** Résultat affiché d'une valeur : « = 52 » si exact à la précision, « ≈ 7,21 cm » sinon. */
function resultat(valeur: number, nature: NatureValeur, decimales = DECIMALES[nature]): { relation: "=" | "\\approx"; resultat: string } {
  const exact = Math.abs(valeur - arrondir(valeur, decimales)) < 1e-9;
  return { relation: exact ? "=" : "\\approx", resultat: `${nombreLatex(valeur, decimales)}${UNITE[nature]}` };
}

function ligne(prefixe: string | null, membres: string[], valeur: number, quantite: string, nature: NatureValeur, decimales?: number, suffixe: string | null = null): LigneResolution {
  return { prefixe, membres, ...resultat(valeur, nature, decimales), suffixe, valeur, quantite, nature };
}

const SIN = (deg: number) => Math.sin(deg * D2R);
const COS = (deg: number) => Math.cos(deg * D2R);
const ASIN = (x: number) => Math.asin(x) / D2R;
const ACOS = (x: number) => Math.acos(x) / D2R;

// ---------------------------------------------------------------------------------------------
// SAS : b, c, Â connus
// ---------------------------------------------------------------------------------------------

function lignesSAS(e: ExerciceDetectiveErreurs, fautive: boolean): LigneResolution[] {
  const { b, c, A } = e.donnees as { b: number; c: number; A: number };
  const f = fautive ? e.scenario : null;
  const lignes: LigneResolution[] = [];

  // 1. a² par Al-Kashi.
  let a2 = b * b + c * c - 2 * b * c * COS(A);
  let litteral = "b^2 + c^2 - 2bc\\cos\\hat{A}";
  let chiffres = `${b}^2 + ${c}^2 - 2 \\cdot ${b} \\cdot ${c} \\cdot \\cos ${A}°`;
  if (f === "R1") a2 = b * b + c * c - 2 * b * c * Math.cos(A);
  if (f === "K1" && e.sousVariante === "signe") {
    a2 = b * b + c * c + 2 * b * c * COS(A);
    litteral = "b^2 + c^2 + 2bc\\cos\\hat{A}";
    chiffres = `${b}^2 + ${c}^2 + 2 \\cdot ${b} \\cdot ${c} \\cdot \\cos ${A}°`;
  }
  if (f === "K1" && e.sousVariante === "facteur") {
    a2 = b * b + c * c - b * c * COS(A);
    litteral = "b^2 + c^2 - bc\\cos\\hat{A}";
    chiffres = `${b}^2 + ${c}^2 - ${b} \\cdot ${c} \\cdot \\cos ${A}°`;
  }
  lignes.push(ligne("Al-Kashi : ", ["a^2", litteral, chiffres], a2, "a^2", "carre"));

  // 2. a.
  const a2D = nombreLatex(a2, 2);
  if (f === "A1") {
    lignes.push(ligne(null, ["a", `\\sqrt{${a2D}}`], Math.round(Math.sqrt(a2)), "a", "cote", 0));
    lignes[1]!.relation = "\\approx";
  } else {
    lignes.push(ligne(null, ["a", `\\sqrt{${a2D}}`], Math.sqrt(a2), "a", "cote"));
  }
  const a = lignes[1]!.valeur!;
  const aD = nombreLatex(a, 2);

  if (e.scenario === "O1") {
    // 3. sin B̂ par la loi des sinus ; 4. B̂ (aigu dans la copie, obtus en réalité).
    const sinB = (b * SIN(A)) / a;
    lignes.push(ligne("Loi des sinus : ", ["\\sin\\hat{B}", "\\dfrac{b\\sin\\hat{A}}{a}", `\\dfrac{${b}\\sin ${A}°}{${aD}}`], sinB, "\\sin\\hat{B}", "trig"));
    const sD = nombreLatex(sinB, 4);
    if (fautive) lignes.push(ligne(null, ["\\hat{B}", `\\sin^{-1}(${sD})`], ASIN(sinB), "\\hat{B}", "angle"));
    else lignes.push(ligne(null, ["\\hat{B}", `180° - \\sin^{-1}(${sD})`], 180 - ASIN(sinB), "\\hat{B}", "angle"));
  } else {
    // 3. cos B̂ par Al-Kashi ; 4. B̂.
    const cosB = (a * a + c * c - b * b) / (2 * a * c);
    const membres = ["\\cos\\hat{B}", "\\dfrac{a^2 + c^2 - b^2}{2ac}", `\\dfrac{${aD}^2 + ${c}^2 - ${b}^2}{2 \\cdot ${aD} \\cdot ${c}}`];
    if (f === "A2") {
      lignes.push(ligne("Al-Kashi : ", membres, arrondir(cosB, 1), "\\cos\\hat{B}", "trig", 1));
      lignes[2]!.relation = "\\approx";
    } else {
      lignes.push(ligne("Al-Kashi : ", membres, cosB, "\\cos\\hat{B}", "trig"));
    }
    const cB = lignes[2]!.valeur!;
    lignes.push(ligne(null, ["\\hat{B}", `\\cos^{-1}(${nombreLatex(cB, f === "A2" ? 1 : 4)})`], ACOS(cB), "\\hat{B}", "angle"));
  }
  const B = lignes[3]!.valeur!;
  const BD = valeurAffichee(B, "angle");

  if (e.scenario === "O2") {
    // 5. sin Ĉ par la loi des sinus ; 6. Ĉ (aigu dans la copie, obtus en réalité).
    const sinC = (c * SIN(A)) / a;
    lignes.push(ligne("Loi des sinus : ", ["\\sin\\hat{C}", "\\dfrac{c\\sin\\hat{A}}{a}", `\\dfrac{${c}\\sin ${A}°}{${aD}}`], sinC, "\\sin\\hat{C}", "trig"));
    const sD = nombreLatex(sinC, 4);
    if (fautive) lignes.push(ligne(null, ["\\hat{C}", `\\sin^{-1}(${sD})`], ASIN(sinC), "\\hat{C}", "angle"));
    else lignes.push(ligne(null, ["\\hat{C}", `180° - \\sin^{-1}(${sD})`], 180 - ASIN(sinC), "\\hat{C}", "angle"));
    return lignes;
  }
  // 5. Ĉ par la somme des angles (angles affichés).
  lignes.push(ligne("Somme des angles : ", ["\\hat{C}", "180° - \\hat{A} - \\hat{B}", `180° - ${A}° - ${nombreLatex(B, 1)}°`], 180 - A - BD, "\\hat{C}", "angle"));
  return lignes;
}

// ---------------------------------------------------------------------------------------------
// SSS : a, b, c connus
// ---------------------------------------------------------------------------------------------

function lignesSSS(e: ExerciceDetectiveErreurs, fautive: boolean): LigneResolution[] {
  const { a, b, c } = e.donnees as { a: number; b: number; c: number };
  const f = fautive ? e.scenario : null;
  const lignes: LigneResolution[] = [];

  // 1. cos Â.
  const cosA = (b * b + c * c - a * a) / (2 * b * c);
  const membres1 = ["\\cos\\hat{A}", "\\dfrac{b^2 + c^2 - a^2}{2bc}", `\\dfrac{${b}^2 + ${c}^2 - ${a}^2}{2 \\cdot ${b} \\cdot ${c}}`];
  if (f === "A3") {
    lignes.push(ligne("Al-Kashi : ", membres1, arrondir(cosA, 1), "\\cos\\hat{A}", "trig", 1));
    lignes[0]!.relation = "\\approx";
  } else {
    lignes.push(ligne("Al-Kashi : ", membres1, cosA, "\\cos\\hat{A}", "trig"));
  }
  const cA = lignes[0]!.valeur!;

  // 2. Â (en radians dans la copie R3 : le nombre lu est pris pour des degrés).
  const cAD = nombreLatex(cA, f === "A3" ? 1 : 4);
  lignes.push(ligne(null, ["\\hat{A}", `\\cos^{-1}(${cAD})`], f === "R3" ? Math.acos(cA) : ACOS(cA), "\\hat{A}", "angle"));
  const A = lignes[1]!.valeur!;
  const AD = valeurAffichee(A, "angle");

  if (e.scenario === "O3") {
    // 3. sin B̂ par la loi des sinus ; 4. B̂ (aigu dans la copie, obtus en réalité).
    const sinB = (b * SIN(A)) / a;
    lignes.push(ligne("Loi des sinus : ", ["\\sin\\hat{B}", "\\dfrac{b\\sin\\hat{A}}{a}", `\\dfrac{${b}\\sin ${nombreLatex(A, 1)}°}{${a}}`], sinB, "\\sin\\hat{B}", "trig"));
    const sD = nombreLatex(sinB, 4);
    if (fautive) lignes.push(ligne(null, ["\\hat{B}", `\\sin^{-1}(${sD})`], ASIN(sinB), "\\hat{B}", "angle"));
    else lignes.push(ligne(null, ["\\hat{B}", `180° - \\sin^{-1}(${sD})`], 180 - ASIN(sinB), "\\hat{B}", "angle"));
  } else {
    // 3. cos B̂ ; 4. B̂.
    let cosB = (a * a + c * c - b * b) / (2 * a * c);
    let litteral = "\\dfrac{a^2 + c^2 - b^2}{2ac}";
    let chiffres = `\\dfrac{${a}^2 + ${c}^2 - ${b}^2}{2 \\cdot ${a} \\cdot ${c}}`;
    if (f === "K2" && e.sousVariante === "signe") {
      cosB = (b * b - a * a - c * c) / (2 * a * c);
      litteral = "\\dfrac{b^2 - a^2 - c^2}{2ac}";
      chiffres = `\\dfrac{${b}^2 - ${a}^2 - ${c}^2}{2 \\cdot ${a} \\cdot ${c}}`;
    }
    if (f === "K2" && e.sousVariante === "facteur") {
      cosB = (a * a + c * c - b * b) / (a * c);
      litteral = "\\dfrac{a^2 + c^2 - b^2}{ac}";
      chiffres = `\\dfrac{${a}^2 + ${c}^2 - ${b}^2}{${a} \\cdot ${c}}`;
    }
    lignes.push(ligne("Al-Kashi : ", ["\\cos\\hat{B}", litteral, chiffres], cosB, "\\cos\\hat{B}", "trig"));
    lignes.push(ligne(null, ["\\hat{B}", `\\cos^{-1}(${nombreLatex(cosB, 4)})`], ACOS(cosB), "\\hat{B}", "angle"));
  }
  const BD = valeurAffichee(lignes[3]!.valeur!, "angle");

  // 5. Ĉ par la somme des angles (angles affichés).
  lignes.push(ligne("Somme des angles : ", ["\\hat{C}", "180° - \\hat{A} - \\hat{B}", `180° - ${nombreLatex(A, 1)}° - ${nombreLatex(lignes[3]!.valeur!, 1)}°`], 180 - AD - BD, "\\hat{C}", "angle"));
  return lignes;
}

// ---------------------------------------------------------------------------------------------
// AAS : Â, B̂, c connus
// ---------------------------------------------------------------------------------------------

const CHAPEAU: Record<Sommet, string> = { A: "\\hat{A}", B: "\\hat{B}", C: "\\hat{C}" };

function lignesAAS(e: ExerciceDetectiveErreurs, fautive: boolean): LigneResolution[] {
  const { A, B, c } = e.donnees as { A: number; B: number; c: number };
  const C = 180 - A - B;
  const angle: Record<Sommet, number> = { A, B, C };
  const f = fautive ? e.scenario : null;
  const X = e.sousVariante as Sommet;
  const lignes: LigneResolution[] = [];

  // 1. Ĉ.
  lignes.push(ligne("Somme des angles : ", ["\\hat{C}", "180° - \\hat{A} - \\hat{B}", `180° - ${A}° - ${B}°`], C, "\\hat{C}", "angle"));

  // 2. Rapport commun k = c / sin Ĉ.
  if (f === "C1") {
    lignes.push(ligne("Loi des sinus : ", ["k", `\\dfrac{c}{\\sin${CHAPEAU[X]}}`, `\\dfrac{${c}}{\\sin ${angle[X]}°}`], c / SIN(angle[X]), "k", "cote"));
  } else {
    const k = f === "R2" ? c / Math.sin(C) : c / SIN(C);
    if (f === "A4") {
      lignes.push(ligne("Loi des sinus : ", ["k", "\\dfrac{c}{\\sin\\hat{C}}", `\\dfrac{${c}}{\\sin ${C}°}`], Math.round(k), "k", "cote", 0));
      lignes[1]!.relation = "\\approx";
    } else {
      lignes.push(ligne("Loi des sinus : ", ["k", "\\dfrac{c}{\\sin\\hat{C}}", `\\dfrac{${c}}{\\sin ${C}°}`], k, "k", "cote"));
    }
  }
  const k = lignes[1]!.valeur!;
  const kD = facteur(k, 2);

  // 3. a = k sin Â ; 4. b = k sin B̂.
  const angleA: Sommet = f === "C2" ? X : "A";
  const angleB: Sommet = f === "C3" ? X : "B";
  lignes.push(ligne(null, ["a", `k\\sin${CHAPEAU[angleA]}`, `${kD} \\cdot \\sin ${angle[angleA]}°`], k * SIN(angle[angleA]), "a", "cote"));
  lignes.push(ligne(null, ["b", `k\\sin${CHAPEAU[angleB]}`, `${kD} \\cdot \\sin ${angle[angleB]}°`], k * SIN(angle[angleB]), "b", "cote"));
  const a = lignes[2]!.valeur!;
  const b = lignes[3]!.valeur!;

  // 5. Aire.
  lignes.push(
    ligne(
      "Aire : ",
      ["\\mathcal{A}", "\\dfrac{1}{2}\\,ab\\sin\\hat{C}", `\\dfrac{1}{2} \\cdot ${facteur(a, 2)} \\cdot ${facteur(b, 2)} \\cdot \\sin ${C}°`],
      0.5 * a * b * SIN(C),
      "\\mathcal{A}",
      "aire",
    ),
  );
  return lignes;
}

// ---------------------------------------------------------------------------------------------
// SSA : Â, a, b connus (cas ambigu, deux triangles)
// ---------------------------------------------------------------------------------------------

export interface SolutionAmbigue {
  sinB: number;
  B1: number;
  B2: number;
  C1: number;
  C2: number;
  c1: number;
  c2: number;
}

export function solutionAmbigue(e: ExerciceDetectiveErreurs): SolutionAmbigue {
  const { A, a, b } = e.donnees as { A: number; a: number; b: number };
  const sinB = (b * SIN(A)) / a;
  const B1 = ASIN(sinB);
  const B2 = 180 - B1;
  // Angles affichés pour la somme (comme l'élève).
  const C1 = 180 - A - valeurAffichee(B1, "angle");
  const C2 = 180 - A - valeurAffichee(B2, "angle");
  return { sinB, B1, B2, C1, C2, c1: (a * SIN(C1)) / SIN(A), c2: (a * SIN(C2)) / SIN(A) };
}

function lignesSSA(e: ExerciceDetectiveErreurs, fautive: boolean): LigneResolution[] {
  const { A, a, b } = e.donnees as { A: number; a: number; b: number };
  const s = solutionAmbigue(e);
  const sD = nombreLatex(s.sinB, 4);
  const B1D = nombreLatex(s.B1, 1);
  const B2D = nombreLatex(s.B2, 1);
  const lignes: LigneResolution[] = [];
  lignes.push(ligne("Loi des sinus : ", ["\\sin\\hat{B}", "\\dfrac{b\\sin\\hat{A}}{a}", `\\dfrac{${b}\\sin ${A}°}{${a}}`], s.sinB, "\\sin\\hat{B}", "trig"));
  const triangle = (indice: string, B: number, C: number, cote: number): LigneResolution[] => [
    ligne("Somme des angles : ", [`\\hat{C}${indice}`, `180° - \\hat{A} - \\hat{B}${indice}`, `180° - ${A}° - ${nombreLatex(B, 1)}°`], C, `\\hat{C}${indice}`, "angle"),
    ligne("Loi des sinus : ", [`c${indice}`, `\\dfrac{a\\sin\\hat{C}${indice}}{\\sin\\hat{A}}`, `\\dfrac{${a}\\sin ${nombreLatex(C, 1)}°}{\\sin ${A}°}`], cote, `c${indice}`, "cote"),
  ];
  if (fautive) {
    lignes.push(ligne(null, ["\\hat{B}", `\\sin^{-1}(${sD})`], s.B1, "\\hat{B}", "angle", undefined, " : c'est le seul angle possible."));
    lignes.push(...triangle("", s.B1, s.C1, s.c1));
    lignes.push({
      prefixe: null,
      membres: [],
      relation: "=",
      resultat: null,
      suffixe: null,
      fragmentsLibres: [
        { type: "texte", valeur: "Conclusion : un seul triangle, avec " },
        { type: "latex", valeur: `\\hat{B} \\approx ${B1D}°` },
        { type: "texte", valeur: ", " },
        { type: "latex", valeur: `\\hat{C} \\approx ${nombreLatex(s.C1, 1)}°` },
        { type: "texte", valeur: " et " },
        { type: "latex", valeur: `c \\approx ${nombreLatex(s.c1, 2)}\\text{ cm}` },
        { type: "texte", valeur: "." },
      ],
      valeur: null,
      quantite: "",
      nature: "aucune",
    });
    return lignes;
  }
  lignes.push({
    prefixe: null,
    membres: [],
    relation: "\\approx",
    resultat: null,
    suffixe: null,
    fragmentsLibres: [
      { type: "latex", valeur: `\\hat{B}_1 = \\sin^{-1}(${sD}) \\approx ${B1D}°` },
      { type: "texte", valeur: " ou " },
      { type: "latex", valeur: `\\hat{B}_2 = 180° - \\hat{B}_1 \\approx ${B2D}°` },
      { type: "texte", valeur: ", qui convient aussi car " },
      { type: "latex", valeur: `\\hat{A} + \\hat{B}_2 \\approx ${nombreLatex(A + valeurAffichee(s.B2, "angle"), 1)}° < 180°` },
      { type: "texte", valeur: "." },
    ],
    valeur: s.B2,
    quantite: "\\hat{B}_2",
    nature: "angle",
  });
  lignes.push(...triangle("_1", s.B1, s.C1, s.c1), ...triangle("_2", s.B2, s.C2, s.c2));
  lignes.push({
    prefixe: null,
    membres: [],
    relation: "=",
    resultat: null,
    suffixe: null,
    fragmentsLibres: [{ type: "texte", valeur: "Conclusion : deux triangles conviennent." }],
    valeur: null,
    quantite: "",
    nature: "aucune",
  });
  return lignes;
}

// ---------------------------------------------------------------------------------------------
// API
// ---------------------------------------------------------------------------------------------

function lignes(e: ExerciceDetectiveErreurs, fautive: boolean): LigneResolution[] {
  switch (configuration(e)) {
    case "SAS":
      return lignesSAS(e, fautive);
    case "SSS":
      return lignesSSS(e, fautive);
    case "AAS":
      return lignesAAS(e, fautive);
    case "SSA":
      return lignesSSA(e, fautive);
  }
}

/** La copie de l'élève fictif (une ligne fausse, la suite cohérente avec elle). */
export function copieEleve(e: ExerciceDetectiveErreurs): LigneResolution[] {
  return lignes(e, true);
}

/** La résolution sans erreur (cas ambigu : avec le second triangle). */
export function resolutionCorrecte(e: ExerciceDetectiveErreurs): LigneResolution[] {
  return lignes(e, false);
}

export interface ValeurAttendue {
  quantite: string;
  valeur: number;
  nature: NatureValeur;
}

/** Champ 1 de l'écran 3 : la bonne valeur de la ligne fausse (cas ambigu : le second angle). */
export function attenduLigne(e: ExerciceDetectiveErreurs): ValeurAttendue {
  const l = resolutionCorrecte(e)[indiceLigneFausse(e)]!;
  return { quantite: l.quantite, valeur: l.valeur!, nature: l.nature };
}

/** Champ 2 de l'écran 3 : le résultat final corrigé (dernière ligne ; cas ambigu : c du second
 * triangle) — `null` quand la ligne fausse est la dernière. */
export function attenduFinal(e: ExerciceDetectiveErreurs): ValeurAttendue | null {
  if (e.scenario === "G1") return { quantite: "c_2", valeur: solutionAmbigue(e).c2, nature: "cote" };
  const n = SCENARIOS[e.scenario].nombreLignes;
  if (indiceLigneFausse(e) === n - 1) return null;
  const l = resolutionCorrecte(e)[n - 1]!;
  return { quantite: l.quantite, valeur: l.valeur!, nature: l.nature };
}

/** Valeur de la copie pour la même grandeur que `attenduFinal` (cas ambigu : sans objet). */
export function finalCopie(e: ExerciceDetectiveErreurs): number | null {
  if (e.scenario === "G1") return null;
  const c = copieEleve(e);
  return c[c.length - 1]!.valeur;
}

/** Tolérance de vérification (± une unité du dernier chiffre demandé, un peu plus pour les
 * grandeurs obtenues au bout d'une chaîne de calculs). */
export const TOLERANCE: Record<NatureValeur, number> = { cote: 0.02, carre: 0.05, angle: 0.1, trig: 0.001, aire: 0.1, aucune: 0 };

export function dansLaTolerance(valeur: number, attendu: number, nature: NatureValeur): boolean {
  return Math.abs(valeur - attendu) <= TOLERANCE[nature] + 1e-9;
}

/** Les trois côtés et les trois angles tels que la copie les donne (configurations à trois angles). */
export function triangleDeLaCopie(e: ExerciceDetectiveErreurs): { cotes: [number, number, number]; angles: [number, number, number] } | null {
  const l = copieEleve(e);
  const d = e.donnees;
  switch (configuration(e)) {
    case "SAS":
      return { cotes: [l[1]!.valeur!, d.b!, d.c!], angles: [d.A!, l[3]!.valeur!, l[l.length - 1]!.valeur!] };
    case "SSS":
      return { cotes: [d.a!, d.b!, d.c!], angles: [l[1]!.valeur!, l[3]!.valeur!, l[4]!.valeur!] };
    case "AAS":
      return { cotes: [l[2]!.valeur!, l[3]!.valeur!, d.c!], angles: [d.A!, d.B!, l[0]!.valeur!] };
    case "SSA":
      return null;
  }
}

export interface Incoherence {
  /** « angle » : un angle négatif ou nul ; « longueur » : un côté négatif ; « somme » : somme ≠ 180° ;
   * « ordre » : un côté plus grand fait face à un angle plus petit. */
  nature: "angle" | "longueur" | "somme" | "ordre";
  i: number;
  j: number;
}

/** Première incohérence VISIBLE de la copie (contrôles du cours), ou `null`. */
export function incoherence(e: ExerciceDetectiveErreurs): Incoherence | null {
  const t = triangleDeLaCopie(e);
  if (!t) return null;
  const { cotes, angles } = t;
  for (let i = 0; i < 3; i++) if (cotes[i]! <= 0) return { nature: "longueur", i, j: i };
  for (let i = 0; i < 3; i++) if (angles[i]! <= 0) return { nature: "angle", i, j: i };
  const somme = angles[0] + angles[1] + angles[2];
  if (Math.abs(somme - 180) > 1) return { nature: "somme", i: 0, j: 0 };
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (cotes[i]! > cotes[j]! * 1.03 && angles[i]! < angles[j]! - 2) return { nature: "ordre", i, j };
    }
  }
  return null;
}
