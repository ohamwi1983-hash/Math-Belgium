import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { latex, ligne, texte } from "../../export/corrigeTableau";

/**
 * Briques partagées des corrigés détaillés « comme au tableau » du chapitre 5 de 4e (« Cercle
 * trigonométrique & triangles quelconques »), seconde moitié — les triangles : gen19, gen58, gen73,
 * gen74, gen75, gen77, gen80, gen81 (règle `.claude/rules/feuilles-evaluations.md`, section
 * « Corrigé détaillé — comme au tableau »). Aucune dépendance à `docx` : importé par les générateurs
 * interactifs (corrigé affiché sous la réponse attendue) ET par les adaptateurs papier.
 *
 * Conventions :
 * - UNE transformation par ligne : la loi écrite avec les noms du triangle, puis isolée (une ligne
 *   par opération), puis substituée, puis la valeur de la calculatrice ;
 * - les angles sont en degrés (`^\circ`), la calculatrice aussi ;
 * - valeur arrondie : le calcul se fait toujours avec la valeur EXACTE gardée en mémoire ; une
 *   valeur intermédiaire réutilisée est écrite arrondie (au centième pour un côté, au dixième de
 *   degré pour un angle, comme les consignes) et la ligne qui la substitue est alors un « ≈ » —
 *   jamais « arrondis substitués = résultat exact » ;
 * - virgule décimale `{,}`, signe « − » typographique dans les textes.
 */

export type Fragments = FragmentConsigne[];

/** Renvois au cours (sections numérotées de `content/chapters/4e/cercle-trigonometrique-triangles.ts`). */
export const COURS_VALEURS_REMARQUABLES = "(cours, § 3)";
export const COURS_ANGLES_ASSOCIES = "(cours, § 4)";
export const COURS_EQUATIONS = "(cours, § 5)";
export const COURS_TRIANGLE = "(cours, § 6)";
export const COURS_TRIANGULATION = "(cours, § 7)";

// ---------------------------------------------------------------------------------------------
// Nombres
// ---------------------------------------------------------------------------------------------

function net(v: number): number {
  const r = Math.round(v * 1e9) / 1e9;
  return Object.is(r, -0) || r === 0 ? 0 : r;
}

/** Arrondi à `d` décimales (bruit flottant neutralisé). */
export function arrondiA(v: number, d: number): number {
  const p = 10 ** d;
  return net(Math.round(v * p + Math.sign(v) * 1e-7) / p);
}

/** Le nombre s'écrit-il exactement avec au plus `d` décimales ? */
export function auPlus(v: number, d: number): boolean {
  return Math.abs(v * 10 ** d - Math.round(v * 10 ** d)) < 1e-6;
}

/** Nombre en LaTeX arrondi à `d` décimales (zéros inutiles retirés) : « 12{,}5 », « -3 », « 12\,500 ». */
export function nb(v: number, d = 6): string {
  const r = arrondiA(v, d);
  const [ent, dec] = String(Math.abs(r)).split(".");
  const groupe = ent!.length > 4 ? ent!.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent!;
  return `${r < 0 ? "-" : ""}${groupe}${dec ? `{,}${dec}` : ""}`;
}

/** Même nombre entre parenthèses s'il est négatif (facteur). */
export function nbp(v: number, d = 6): string {
  return arrondiA(v, d) < 0 ? `(${nb(v, d)})` : nb(v, d);
}

/** Nombre en texte : « 12,5 », « −3 ». */
export function nbTexte(v: number, d = 6): string {
  return nb(v, d).replace("{,}", ",").replace(/\\,/g, " ").replace(/^-/, "−");
}

/** Angle en degrés, arrondi à `d` décimales : « 52{,}3^\circ ». */
export function deg(v: number, d = 1): string {
  return `${nb(v, d)}^\\circ`;
}

/** « = » si la valeur s'écrit exactement avec `d` décimales, sinon « \approx ». */
export function rel(v: number, d: number): "=" | "\\approx" {
  return auPlus(v, d) ? "=" : "\\approx";
}

/** « = 12{,}5 » ou « \approx 12{,}53 » (suivi d'un suffixe : unité, degré). */
export function eg(v: number, d: number, suffixe = ""): string {
  return `${rel(v, d)} ${nb(v, d)}${suffixe}`;
}

/** Relation suivie de la valeur : exacte telle quelle (« = 12{,}5 »), approchée avec tous ses
 * chiffres (« \\approx 75{,}0 ») — le nombre de décimales dit la précision. */
export function apres(r: "=" | "\\approx", v: number, d: number): string {
  return `${r}${r === "=" ? nb(v, d) : nbFixe(v, d)}`;
}

/** Unité de longueur en LaTeX (« \text{ cm} ») ; chaîne vide sans unité. */
export function u(unite: string | undefined): string {
  return unite ? `\\text{ ${unite}}` : "";
}

/** Unité d'aire en LaTeX (« \text{ cm}^2 »). */
export function u2(unite: string | undefined): string {
  return unite ? `\\text{ ${unite}}^2` : "";
}

// ---------------------------------------------------------------------------------------------
// Valeurs substituées : donnée exacte ou valeur gardée en mémoire (écrite arrondie)
// ---------------------------------------------------------------------------------------------

/** Une valeur à substituer : `v` exacte (mémoire de la calculatrice), écrite à `d` décimales ; un
 * angle s'écrit avec `^\circ`. Une donnée de l'énoncé : `d` = 6 (toujours écrite exactement). */
export interface Val {
  v: number;
  d: number;
  angle?: boolean;
}

export function donnee(v: number): Val {
  return { v, d: 6 };
}

export function angleDonne(v: number): Val {
  return { v, d: 6, angle: true };
}

/** Côté calculé, gardé en mémoire, écrit au centième (ou `d`). */
export function coteMemoire(v: number, d = 2): Val {
  return { v, d };
}

/** Angle calculé, gardé en mémoire, écrit au dixième de degré (ou `d`). */
export function angleMemoire(v: number, d = 1): Val {
  return { v, d, angle: true };
}

/** Valeur écrite : exacte telle quelle ; arrondie (mémoire) avec TOUS ses chiffres (« 125{,}0 »,
 * « 7{,}20 ») — le nombre de décimales dit la précision de l'arrondi. */
export function tex(x: Val): string {
  const n = exacte(x) ? nb(x.v, x.d) : nbFixe(x.v, x.d);
  return x.angle ? `${n}^\\circ` : n;
}

/** Nombre arrondi à `d` décimales, zéros finaux gardés : « 7{,}20 ». */
export function nbFixe(v: number, d: number): string {
  const r = arrondiA(v, d);
  return (r < 0 ? "-" : "") + Math.abs(r).toFixed(d).replace(".", "{,}");
}

/** Facteur : entre parenthèses s'il est négatif. */
function texF(x: Val): string {
  return x.v < 0 ? `(${tex(x)})` : tex(x);
}

export function exacte(x: Val): boolean {
  return auPlus(x.v, x.d);
}

/** Relation d'une ligne de substitution : « = » si toutes les valeurs substituées sont écrites
 * exactement, « \approx » dès qu'une valeur gardée en mémoire est écrite arrondie. */
export function relSubst(...vals: Val[]): "=" | "\\approx" {
  return vals.every(exacte) ? "=" : "\\approx";
}

/** Relation d'un résultat qui suit une substitution : « \approx » dès qu'une valeur substituée est
 * arrondie (le résultat vient de la valeur exacte en mémoire), sinon « = » ou « \approx » selon
 * qu'il s'écrit exactement avec `d` décimales. */
export function relApres(vals: Val[], v: number, d: number): "=" | "\\approx" {
  return vals.every(exacte) ? rel(v, d) : "\\approx";
}

/** Justification d'une substitution, avec la mention « mémoire » quand une valeur est arrondie. */
function justifSubst(vals: Val[], base = "on remplace"): string {
  return vals.every(exacte) ? base : `${base} (valeurs exactes gardées en mémoire, écrites arrondies)`;
}

// ---------------------------------------------------------------------------------------------
// Lignes de calcul
// ---------------------------------------------------------------------------------------------

/** X = 180° − Y − Z, puis substitution et valeur. */
export function lignesSommeAngles(o: { inconnu: string; autres: [string, string]; valeurs: [Val, Val]; resultat: number; d?: number }): LigneCalcul[] {
  const d = o.d ?? 1;
  const [y, z] = o.autres;
  const [vy, vz] = o.valeurs;
  return [
    ligne(`${o.inconnu}=180^\\circ-${y}-${z}`, "la somme des angles d'un triangle vaut 180°"),
    ligne(`${relSubst(vy, vz)}180^\\circ-${tex(vy)}-${tex(vz)}`, justifSubst([vy, vz])),
    ligne(`${apres(relApres([vy, vz], o.resultat, d), o.resultat, d)}^\\circ`),
  ];
}

/** Loi des sinus résolue pour un côté : x / sin X = k / sin K, x = k sin X / sin K, valeurs. */
export function lignesLoiSinusCote(o: {
  x: string;
  X: string;
  k: string;
  K: string;
  vk: Val;
  vX: Val;
  vK: Val;
  resultat: number;
  d?: number;
  unite?: string;
}): LigneCalcul[] {
  const d = o.d ?? 2;
  const vals = [o.vk, o.vX, o.vK];
  return [
    ligne(`\\dfrac{${o.x}}{\\sin ${o.X}}=\\dfrac{${o.k}}{\\sin ${o.K}}`, "loi des sinus : chaque côté avec le sinus de l'angle qui lui fait face"),
    ligne(`${o.x}=\\dfrac{${o.k}\\cdot\\sin ${o.X}}{\\sin ${o.K}}`, [texte("on multiplie les deux membres par "), latex(`\\sin ${o.X}`)]),
    ligne(`${relSubst(...vals)}\\dfrac{${tex(o.vk)}\\cdot\\sin ${tex(o.vX)}}{\\sin ${tex(o.vK)}}`, justifSubst(vals, "on remplace, calculatrice en degrés")),
    ligne(`${apres(relApres(vals, o.resultat, d), o.resultat, d)}${u(o.unite)}`),
  ];
}

/** Loi des sinus résolue pour le sinus d'un angle : sin X / x = sin K / k, sin X = x sin K / k, valeurs. */
export function lignesLoiSinusSinus(o: { X: string; x: string; K: string; k: string; vx: Val; vK: Val; vk: Val; sinus: number; d?: number }): LigneCalcul[] {
  const d = o.d ?? 4;
  const vals = [o.vx, o.vK, o.vk];
  return [
    ligne(`\\dfrac{\\sin ${o.X}}{${o.x}}=\\dfrac{\\sin ${o.K}}{${o.k}}`, "loi des sinus, écrite avec les sinus au numérateur"),
    ligne(`\\sin ${o.X}=\\dfrac{${o.x}\\cdot\\sin ${o.K}}{${o.k}}`, [texte("on multiplie les deux membres par "), latex(o.x)]),
    ligne(`${relSubst(...vals)}\\dfrac{${tex(o.vx)}\\cdot\\sin ${tex(o.vK)}}{${tex(o.vk)}}`, justifSubst(vals, "on remplace, calculatrice en degrés")),
    ligne(`${apres(relApres(vals, o.sinus, d), o.sinus, d)}`, "valeur exacte gardée en mémoire"),
  ];
}

/** Angle aigu par la touche sin⁻¹, puis (facultatif) son supplémentaire, de même sinus. */
export function lignesArcsin(o: { X: string; angle: number; d?: number; supplementaire?: { X2: string; angle2: number } }): LigneCalcul[] {
  const d = o.d ?? 1;
  const lignes = [ligne(`${o.X}${apres(rel(o.angle, d), o.angle, d)}^\\circ`, [texte("touche "), latex("\\sin^{-1}"), texte(", calculatrice en degrés : l'angle aigu")])];
  if (o.supplementaire) {
    const { X2, angle2 } = o.supplementaire;
    lignes.push(
      ligne(`${X2}=180^\\circ-${o.X}`, `deux angles supplémentaires ont le même sinus ${COURS_ANGLES_ASSOCIES}`),
      ligne(`${relSubst(angleMemoire(o.angle, d))}180^\\circ-${tex(angleMemoire(o.angle, d))}`, justifSubst([angleMemoire(o.angle, d)])),
      ligne(`${apres(relApres([angleMemoire(o.angle, d)], angle2, d), angle2, d)}^\\circ`),
    );
  }
  return lignes;
}

/** Al-Kashi résolue pour un côté : x² = p² + q² − 2pq cos X, valeurs, carré, racine. */
export function lignesAlKashiCote(o: {
  x: string;
  p: string;
  q: string;
  X: string;
  vp: Val;
  vq: Val;
  vX: Val;
  resultat: number;
  dCarre?: number;
  d?: number;
  unite?: string;
}): LigneCalcul[] {
  const d = o.d ?? 2;
  const dCarre = o.dCarre ?? 2;
  const vals = [o.vp, o.vq, o.vX];
  const carre = o.resultat * o.resultat;
  const lignes: LigneCalcul[] = [
    ligne(`${o.x}^2=${o.p}^2+${o.q}^2-2\\cdot ${o.p}\\cdot ${o.q}\\cdot\\cos ${o.X}`, "loi des cosinus (Al-Kashi), avec l'angle compris entre les deux côtés connus"),
    ligne(`${relSubst(...vals)}${texF(o.vp)}^2+${texF(o.vq)}^2-2\\cdot ${tex(o.vp)}\\cdot ${tex(o.vq)}\\cdot\\cos ${tex(o.vX)}`, justifSubst(vals)),
  ];
  if (exacte(o.vp) && exacte(o.vq)) {
    const deuxPQ = 2 * o.vp.v * o.vq.v;
    lignes.push(ligne(`=${nb(o.vp.v ** 2)}+${nb(o.vq.v ** 2)}-${nb(deuxPQ)}\\cdot\\cos ${tex(o.vX)}`, "on calcule les carrés et le produit"));
  }
  const cosX = Math.cos((o.vX.v * Math.PI) / 180);
  lignes.push(ligne(`${apres(relApres(vals, carre, dCarre), carre, dCarre)}`, cosX < 0 ? "calculatrice en degrés ; le cosinus est négatif, le terme retranché s'ajoute" : "calculatrice en degrés"));
  const rCarre = relApres(vals, carre, dCarre);
  lignes.push(ligne(`${o.x}${rCarre}\\sqrt{${rCarre === "=" ? nb(carre, dCarre) : nbFixe(carre, dCarre)}}`, "une longueur est positive : racine carrée"));
  lignes.push(ligne(`${apres(relApres([...vals, { v: carre, d: dCarre }], o.resultat, d), o.resultat, d)}${u(o.unite)}`));
  return lignes;
}

function pgcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) [a, b] = [b, a % b];
  return a || 1;
}

/** Fraction n/d en LaTeX (signe devant). */
function fractionLatex(n: number, d: number): string {
  return `${n < 0 ? "-" : ""}\\dfrac{${Math.abs(n)}}{${d}}`;
}

/** Al-Kashi résolue pour un angle : x² = p² + q² − 2pq cos X, isolée en cos X (une opération par
 * ligne), valeurs, puis l'angle par la touche cos⁻¹. */
export function lignesAlKashiAngle(o: { X: string; x: string; p: string; q: string; vx: Val; vp: Val; vq: Val; angle: number; dCos?: number; d?: number }): LigneCalcul[] {
  const d = o.d ?? 1;
  const dCos = o.dCos ?? 4;
  const vals = [o.vp, o.vq, o.vx];
  const produit = `2\\cdot ${o.p}\\cdot ${o.q}`;
  const lignes: LigneCalcul[] = [
    ligne(`${o.x}^2=${o.p}^2+${o.q}^2-${produit}\\cdot\\cos ${o.X}`, "loi des cosinus (Al-Kashi), avec le côté opposé à l'angle cherché"),
    ligne(`${produit}\\cdot\\cos ${o.X}=${o.p}^2+${o.q}^2-${o.x}^2`, [texte("on ajoute "), latex(`${produit}\\cdot\\cos ${o.X}`), texte(" et on retranche "), latex(`${o.x}^2`), texte(" aux deux membres")]),
    ligne(`\\cos ${o.X}=\\dfrac{${o.p}^2+${o.q}^2-${o.x}^2}{${produit}}`, [texte("on divise par "), latex(produit)]),
    ligne(`${relSubst(...vals)}\\dfrac{${tex(o.vp)}^2+${tex(o.vq)}^2-${tex(o.vx)}^2}{2\\cdot ${tex(o.vp)}\\cdot ${tex(o.vq)}}`, justifSubst(vals)),
  ];
  const cos = (o.vp.v ** 2 + o.vq.v ** 2 - o.vx.v ** 2) / (2 * o.vp.v * o.vq.v);
  if (vals.every(exacte)) {
    const num = net(o.vp.v ** 2 + o.vq.v ** 2 - o.vx.v ** 2);
    const den = net(2 * o.vp.v * o.vq.v);
    lignes.push(ligne(`=\\dfrac{${nb(o.vp.v ** 2)}+${nb(o.vq.v ** 2)}-${nb(o.vx.v ** 2)}}{${nb(den)}}`, "on calcule les carrés et le produit"));
    lignes.push(ligne(`=${num < 0 ? "-" : ""}\\dfrac{${nb(Math.abs(num))}}{${nb(den)}}`));
    if (Number.isInteger(num) && Number.isInteger(den)) {
      const g = pgcd(num, den);
      if (g > 1 && den / g !== 1) lignes.push(ligne(`=${fractionLatex(num / g, den / g)}`, `on simplifie par ${g}`));
    }
  }
  if (!auPlus(cos, dCos) || !vals.every(exacte)) lignes.push(ligne(`${apres(relApres(vals, cos, dCos), cos, dCos)}`, "valeur exacte gardée en mémoire"));
  else if (!Number.isInteger(cos)) lignes.push(ligne(`=${nb(cos, dCos)}`));
  lignes.push(ligne(`${o.X}${apres(rel(o.angle, d), o.angle, d)}^\\circ`, [texte("touche "), latex("\\cos^{-1}"), texte(", calculatrice en degrés : un seul angle entre 0° et 180° a ce cosinus")]));
  return lignes;
}

/** Aire = ½ · p · q · sin X (angle compris), valeurs. */
export function lignesAire(o: { nom?: string; p: string; q: string; X: string; vp: Val; vq: Val; vX: Val; aire: number; d?: number; unite?: string }): LigneCalcul[] {
  const nom = o.nom ?? "\\mathcal{A}";
  const d = o.d ?? 2;
  const vals = [o.vp, o.vq, o.vX];
  const lignes: LigneCalcul[] = [
    ligne(`${nom}=\\dfrac{1}{2}\\cdot ${o.p}\\cdot ${o.q}\\cdot\\sin ${o.X}`, "aire : demi-produit de deux côtés par le sinus de l'angle compris entre eux"),
    ligne(`${relSubst(...vals)}\\dfrac{1}{2}\\cdot ${tex(o.vp)}\\cdot ${tex(o.vq)}\\cdot\\sin ${tex(o.vX)}`, justifSubst(vals)),
  ];
  if (exacte(o.vp) && exacte(o.vq)) lignes.push(ligne(`${relSubst(o.vX)}${nb((o.vp.v * o.vq.v) / 2)}\\cdot\\sin ${tex(o.vX)}`, "on calcule le demi-produit des côtés"));
  lignes.push(ligne(`${apres(relApres(vals, o.aire, d), o.aire, d)}${u2(o.unite)}`, o.vX.v === 90 ? [latex("\\sin 90^\\circ=1")] : "calculatrice en degrés"));
  return lignes;
}

/** Somme des angles vérifiée : X + Y + Z ≈ a + b + c ≈ 180°. */
export function lignesVerificationSomme(noms: [string, string, string], angles: [Val, Val, Val]): LigneCalcul[] {
  const somme = angles.reduce((s, a) => s + arrondiA(a.v, a.d), 0);
  return [ligne(`${noms.join("+")}${relSubst(...angles)}${angles.map(tex).join("+")}`, "valeurs arrondies au dixième"), ligne(`${apres(rel(somme, 1), somme, 1)}^\\circ`, "à un arrondi près, 180°")];
}

// ---------------------------------------------------------------------------------------------
// Fragments
// ---------------------------------------------------------------------------------------------

/** Fragments « phrase : formule » d'un « Ce qu'on utilise », avec le renvoi au cours. */
export function phraseFormule(phrase: string, formule?: string): Fragments {
  return formule ? [texte(`${phrase} `), latex(formule)] : [texte(phrase)];
}

/** Aide d'écran (phrase terminée par « : », puis la formule) reprise en « Ce qu'on utilise » : une
 * espace entre la phrase et la formule. */
export function fragmentsAide(aide: Fragments): Fragments {
  return aide.flatMap((f, i) => {
    const prec = aide[i - 1];
    return i > 0 && f.type === "latex" && prec?.type === "texte" && !/\s$/.test(prec.valeur) ? [texte(" "), f] : [f];
  });
}

/** Largeur VISIBLE approchée d'une formule (≈ nombre de caractères affichés). */
export function largeurVisible(latexSource: string): number {
  return latexSource
    .replace(/\\dfrac\{([^{}]*)\}\{([^{}]*)\}/g, (_m, a: string, b: string) => (a.length > b.length ? a : b))
    .replace(/\\(times|cdot|leq|geq|approx|le|ge|neq|circ)/g, "x")
    .replace(/\{,\}/g, ",")
    .replace(/\\[,;!]/g, "")
    .replace(/\\[a-zA-Z]+/g, "")
    .replace(/[{}^]/g, "").length;
}

/** Dans un « Résultat », un « Ce qu'on utilise » ou une « Vérification » rédigés (phrase + formules),
 * chaque formule courte qui contient une relation est groupée `{…}` : KaTeX ne la coupe plus à son
 * « = » en fin de ligne. Une formule seule reste inchangée. Même traitement pour les formules des
 * justifications. */
export function finaliserCorrigeTriangles(etapes: EtapeCorrection[]): EtapeCorrection[] {
  const grouper = (f: FragmentConsigne): FragmentConsigne =>
    f.type === "latex" && /[=<>]|\\approx|\\neq|\\geq|\\leq/.test(f.valeur) && largeurVisible(f.valeur) <= 32 && !/^\{.*\}$/.test(f.valeur) ? { ...f, valeur: `{${f.valeur}}` } : f;
  return etapes.map((e) => {
    const calculs = e.calcul?.map((l) => (Array.isArray(l.justification) ? { ...l, justification: l.justification.map(grouper) } : l));
    const redige = e.fragments.some((f) => f.type === "texte" && f.valeur.trim() !== "");
    const fragments = redige && e.type !== "calcul" ? e.fragments.map(grouper) : e.fragments;
    return { ...e, fragments, ...(calculs ? { calcul: calculs } : {}) };
  });
}

/** Résultat formé de plusieurs formules séparées par « ; » (une formule par valeur : la liste ne
 * passe pas à la ligne au milieu d'une formule). */
export function fragmentsListe(formules: string[], separateur = " ; "): Fragments {
  return formules.flatMap((f, i) => (i === 0 ? [latex(f)] : [texte(separateur), latex(f)]));
}
