import type { ExerciceOptimisationDistance, MotifSigne } from "../core5e/optimisationDistance";
import { modele, racineKxL, VITESSES } from "../core5e/optimisationDistance";
import type { AideEcran, ChampEcran, Frag, OptionEcran } from "./ecransTrigo.types";
import { lx, tx } from "./ecransTrigo.types";
import { nbL, nbT } from "./nombresTrigo";

/**
 * Couche C — textes de `5gen71` « Optimisation : distance et temps minimaux » : énoncé, consignes,
 * champs, options du signe, aides à deux niveaux (jamais la réponse), réponses, figure de l'énoncé.
 * Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceOptimisationDistance;
export type PhaseOptimisationDistance = "modele" | "derivee" | "critique" | "signe" | "optimum";
export const PHASES: PhaseOptimisationDistance[] = ["modele", "derivee", "critique", "signe", "optimum"];

const dL = (x: number) => nbL(x, 4);
const dT = (x: number) => nbT(x, 4);

/** Énoncé (sans consigne d'écran). */
export function consigneGenerale(e: E): Frag[] {
  const d = e.d;
  switch (e.variante) {
    case "pointRacine":
      return [tx("On considère la courbe d'équation "), lx(`y=${racineKxL(d.k)}`), tx(" (pour "), lx("x\\geq 0"), tx(") et le point "), lx(`A(${d.a}\\,;0)`), tx(". Le point "), lx(`M\\left(x\\,;${racineKxL(d.k)}\\right)`), tx(" parcourt la courbe. On cherche le point M le plus proche de A.")];
    case "pointHyperbole":
      return [tx("On considère la courbe d'équation "), lx(`y=\\dfrac{${d.k}}{x}`), tx(" pour "), lx("x>0"), tx(" et l'origine O du repère. Le point "), lx(`M\\left(x\\,;\\dfrac{${d.k}}{x}\\right)`), tx(" parcourt la courbe. On cherche le point M le plus proche de O.")];
    case "sauveteur": {
      const V = VITESSES[d.s]!;
      return [
        tx(`Un sauveteur, au bord de l'eau en A, voit un nageur en difficulté en N, à ${d.h} m d'un rivage rectiligne. Le point H du rivage le plus proche de N est à ${d.L} m de A. Le sauveteur court le long du rivage à ${dT(V.v1)} m/s jusqu'à un point M de [AH], avec AM = x (en m), puis nage en ligne droite de M à N à ${dT(V.v2)} m/s. Où doit-il entrer dans l'eau pour rejoindre le nageur le plus vite possible ?`),
      ];
    }
    case "cable":
      return [
        tx(`Deux maisons A et B sont du même côté d'une rivière rectiligne, à ${d.a} m et à ${d.b} m de la rive. Leurs projections H et K sur la rive sont distantes de ${d.L} m. On relie A à B par un câble qui passe par une pompe placée en un point M de [HK], avec HM = x (en m). Où placer M pour que le câble soit le plus court possible ?`),
      ];
  }
}

/** Fin de l'énoncé papier : la consigne globale (résultat attendu, précision, justification). */
export function consignePapier(e: E): string {
  switch (e.variante) {
    case "pointRacine":
      return "Détermine le point M de la courbe le plus proche de A et la distance minimale AM (valeur exacte). Justifie par l'étude de la dérivée sur le domaine.";
    case "pointHyperbole":
      return "Détermine le point M de la courbe le plus proche de O et la distance minimale OM (valeur exacte). Justifie par l'étude de la dérivée sur le domaine.";
    case "sauveteur":
      return "Détermine la position de M et le temps minimal, arrondi au dixième de seconde. Justifie par l'étude de la dérivée sur le domaine réaliste.";
    case "cable":
      return "Détermine la position de M et la longueur minimale du câble (valeur exacte). Justifie par l'étude de la dérivée sur le domaine réaliste.";
  }
}

export function libelle(e: E, p: PhaseOptimisationDistance): string {
  const n = modele(e).nomT;
  return p === "modele" ? `Fonction ${n}(x)` : p === "derivee" ? `Dérivée ${n}′(x)` : p === "critique" ? "Zéro de la dérivée" : p === "signe" ? `Signe de ${n}′` : "Optimum";
}

function nomQuantite(e: E): string {
  return e.variante === "sauveteur" ? "le temps" : e.variante === "cable" ? "la longueur du câble" : "la distance";
}

export function consigne(e: E, p: PhaseOptimisationDistance): Frag[] {
  const m = modele(e);
  const N = m.nomL;
  switch (p) {
    case "modele":
      if (e.variante === "pointRacine") return [tx("Exprime le carré de la distance "), lx("D(x)=AM^2"), tx(" en fonction de x.")];
      if (e.variante === "pointHyperbole") return [tx("Exprime le carré de la distance "), lx("D(x)=OM^2"), tx(" en fonction de x.")];
      if (e.variante === "sauveteur") return [tx("Exprime la durée "), lx("T(x)"), tx(" du trajet A → M → N (en s) en fonction de x.")];
      return [tx("Exprime la longueur "), lx("\\ell(x)=AM+MB"), tx(" du câble (en m) en fonction de x.")];
    case "derivee":
      return [tx("Calcule la dérivée "), lx(`${N}'(x)`), tx(".")];
    case "critique":
      return e.variante === "pointHyperbole" ? [tx("Résous "), lx(`${N}'(x)=0`), tx(" pour "), lx("x>0"), tx(".")] : [tx("Résous "), lx(`${N}'(x)=0`), tx(".")];
    case "signe":
      return [tx("Le domaine réaliste est "), lx(`x\\in ${m.domaineL}`), tx(". Quel est le signe de "), lx(`${N}'`), tx(" sur ce domaine ?")];
    case "optimum":
      if (e.variante === "sauveteur") return [tx("Donne la valeur de x qui rend le temps minimal, et ce temps minimal (en s, arrondi au dixième).")];
      if (e.variante === "cable") return [tx("Donne la valeur de x qui rend le câble le plus court, et sa longueur minimale (en m, valeur exacte).")];
      return [tx(`Donne l'abscisse de M qui rend ${nomQuantite(e)} minimale, et cette distance minimale (valeur exacte).`)];
  }
}

export const MOTIFS: MotifSigne[] = ["neg-pos", "pos", "neg", "pos-neg"];

export function fragmentsMotif(e: E, id: MotifSigne): Frag[] {
  const N = modele(e).nomL;
  switch (id) {
    case "neg-pos":
      return [lx(`${N}'<0`), tx(" puis "), lx(`${N}'>0`), tx(" : elle s'annule en "), lx("x_0"), tx(" en changeant de signe")];
    case "pos":
      return [lx(`${N}'>0`), tx(" sur tout le domaine")];
    case "neg":
      return [lx(`${N}'<0`), tx(" sur tout le domaine")];
    case "pos-neg":
      return [lx(`${N}'>0`), tx(" puis "), lx(`${N}'<0`), tx(" : elle s'annule en "), lx("x_0"), tx(" en changeant de signe")];
  }
}

export function optionsSigne(e: E): OptionEcran[] {
  return MOTIFS.map((id) => ({ id, fragments: fragmentsMotif(e, id) }));
}

export function champs(e: E, p: PhaseOptimisationDistance): ChampEcran[] {
  const m = modele(e);
  const N = m.nomL;
  if (p === "modele") return [{ label: `${m.nomT}(x)`, labelLatex: `${N}(x)=`, placeholder: e.variante === "sauveteur" ? "ex. : x/5 + racine((40 − x)^2 + 9^2)/2" : "ex. : (x − 1)^2 + 2x", apercu: true }];
  if (p === "derivee") return [{ label: `${m.nomT}′(x)`, labelLatex: `${N}'(x)=`, placeholder: "expression en x", apercu: true }];
  if (p === "critique") return [{ label: "x₀", labelLatex: "x_0=", placeholder: "ex. : 5/2 ou √3", raccourcis: [{ libelle: "√", texte: "√" }, { libelle: "−", texte: "−" }], ...(m.uniteX ? { unite: m.uniteX } : {}) }];
  return [
    { label: "Valeur de x", labelLatex: m.labelX, placeholder: "ex. : 3", raccourcis: [{ libelle: "√", texte: "√" }], ...(m.uniteX ? { unite: m.uniteX } : {}) },
    { label: "Valeur minimale", labelLatex: m.labelVal, placeholder: m.valExacte ? "valeur exacte, ex. : 2√3" : "ex. : 24,6", raccourcis: m.valExacte ? [{ libelle: "√", texte: "√" }] : undefined, ...(m.uniteVal ? { unite: m.uniteVal } : {}) },
  ];
}

const avecUnite = (v: string, u?: string): Frag[] => (u ? [lx(v), tx(` ${u}`)] : [lx(v)]);

export function reponse(e: E, p: PhaseOptimisationDistance): Frag[] {
  const m = modele(e);
  const N = m.nomL;
  switch (p) {
    case "modele":
      return [lx(`${N}(x)=${m.fL}`)];
    case "derivee":
      return [lx(`${N}'(x)=${m.fpL}`)];
    case "critique":
      return avecUnite(`x_0=${m.x0L}`, m.uniteX);
    case "signe":
      return fragmentsMotif(e, m.motif);
    case "optimum":
      return [...avecUnite(`${m.labelX}${m.xOptL}`, m.uniteX), tx(" et "), ...avecUnite(`${m.labelVal}${m.valOptL}`, m.uniteVal)];
  }
}

export const recap = reponse;

export function messageIllisible(_e: E, p: PhaseOptimisationDistance): string {
  if (p === "modele" || p === "derivee") return "Expression non reconnue : écris-la avec x, par exemple (x − 3)^2 + 2x ou racine(x^2 + 9). Cette saisie ne compte pas comme une tentative.";
  return "Nombre non reconnu : écris un nombre (5, −1/2, 2,4) ou une racine (2√3). Cette saisie ne compte pas comme une tentative.";
}

export const MESSAGE_APPROCHEE = "C'est une valeur approchée : donne la valeur exacte (fraction ou racine, par exemple √7/2). Cette saisie ne compte pas comme une tentative.";

export function aide1(e: E, p: PhaseOptimisationDistance): AideEcran {
  const m = modele(e);
  const N = m.nomL;
  switch (p) {
    case "modele":
      if (e.variante === "sauveteur") return { texte: [tx("À vitesse constante, la durée d'un trajet est la distance divisée par la vitesse :")], latex: "t=\\dfrac{d}{v}" };
      if (e.variante === "cable") return { texte: [tx("Chaque morceau du câble est l'hypoténuse d'un triangle rectangle (Pythagore) :")], latex: "AM=\\sqrt{HM^2+HA^2}" };
      return { texte: [tx("Distance de deux points : on minimise son carré (même point optimal, plus simple à dériver) :")], latex: "AM^2=(x_M-x_A)^2+(y_M-y_A)^2" };
    case "derivee":
      if (e.variante === "pointRacine") return { texte: [tx("Dérive terme à terme ; pour le carré :")], latex: "\\left((x-a)^2\\right)'=2(x-a)" };
      if (e.variante === "pointHyperbole") return { texte: [tx("Écris le second terme avec une puissance de x :")], latex: "\\left(\\dfrac{1}{x^2}\\right)'=-\\dfrac{2}{x^3}" };
      return { texte: [tx("Dérivée d'une racine (règle de la chaîne) :")], latex: "\\left(\\sqrt{u}\\right)'=\\dfrac{u'}{2\\sqrt{u}}" };
    case "critique":
      return { texte: [tx("Pose la dérivée égale à 0, puis isole x pas à pas :")], latex: `${N}'(x)=0` };
    case "signe":
      return { texte: [tx("La dérivée ne s'annule qu'en "), lx("x_0"), tx(" : elle garde un signe constant de chaque côté. Regarde si "), lx("x_0"), tx(" est dans le domaine, puis teste une valeur.")] };
    case "optimum":
      return { texte: [tx("Le minimum est en "), lx("x_0"), tx(" si la dérivée y passe de − à + dans le domaine ; sinon, il est à la borne où la fonction est la plus petite.")] };
  }
}

export function aide2(e: E, p: PhaseOptimisationDistance): AideEcran | null {
  const m = modele(e);
  const d = e.d;
  const N = m.nomL;
  switch (p) {
    case "modele":
      if (e.variante === "pointRacine") return { texte: [tx("Ici "), lx(`M\\left(x\\,;${racineKxL(d.k)}\\right)`), tx(" et "), lx(`A(${d.a}\\,;0)`), tx(" : remplace, puis simplifie le carré de la racine.")] };
      if (e.variante === "pointHyperbole") return { texte: [tx("Ici "), lx(`M\\left(x\\,;\\dfrac{${d.k}}{x}\\right)`), tx(" et "), lx("O(0\\,;0)"), tx(" : remplace, puis élève la fraction au carré.")] };
      if (e.variante === "sauveteur") return { texte: [tx(`Deux morceaux : AM = x sur le sable, puis MN dans l'eau. Dans le triangle MHN rectangle en H, MH = ${d.L} − x et HN = ${d.h} :`)], latex: "MN=\\sqrt{MH^2+HN^2}" };
      return { texte: [tx(`Dans AHM, HA = ${d.a} et HM = x ; dans MKB, MK = ${d.L} − x et KB = ${d.b}. Additionne les deux longueurs.`)] };
    case "derivee":
      if (e.variante === "pointRacine") return { texte: [tx("La dérivée de "), lx(`${d.k === 1 ? "" : d.k}x`), tx(" est une constante ; développe ensuite "), lx(`2(x${d.a < 0 ? `+${-d.a}` : `-${d.a}`})`), tx(".")] };
      if (e.variante === "pointHyperbole") return { texte: [tx("Le second terme vaut "), lx(`${d.k * d.k}\\cdot\\dfrac{1}{x^2}`), tx(" : multiplie sa dérivée par "), lx(`${d.k * d.k}`), tx(".")] };
      if (e.variante === "sauveteur") return { texte: [tx("Pour la racine, "), lx(`u=(${d.L}-x)^2+${d.h}^2`), tx(" et "), lx(`u'=2(${d.L}-x)\\cdot(-1)`), tx(" : n'oublie pas le facteur −1, puis divise par "), lx(dL(VITESSES[d.s]!.v2)), tx(".")] };
      return { texte: [tx("Premier terme : "), lx(`u=x^2+${d.a}^2`), tx(", "), lx("u'=2x"), tx(". Second terme : "), lx(`u=(${d.L}-x)^2+${d.b}^2`), tx(", "), lx(`u'=2(${d.L}-x)\\cdot(-1)`), tx(".")] };
    case "critique":
      if (e.variante === "pointRacine") return { texte: [tx("C'est une équation du premier degré :")], latex: `${m.fpL}=0` };
      if (e.variante === "pointHyperbole") return { texte: [tx("Multiplie les deux membres par "), lx("x^3"), tx(" (non nul) :")], latex: `2x^4=${2 * d.k * d.k}` };
      if (e.variante === "sauveteur") {
        const V = VITESSES[d.s]!;
        return { texte: [tx(`Pose z = ${d.L} − x (la distance MH), puis élève au carré :`)], latex: `${dL(V.v1)}\\,z=${dL(V.v2)}\\sqrt{z^2+${d.h}^2}` };
      }
      return { texte: [tx("Élève au carré et fais le produit en croix : les termes en "), lx(`x^2(${d.L}-x)^2`), tx(" s'éliminent, il reste :")], latex: `${d.b * d.b}x^2=${d.a * d.a}(${d.L}-x)^2` };
    case "signe":
      return { texte: [tx("Compare "), lx(`x_0=${m.x0L}`), tx(" au domaine "), lx(m.domaineL), tx(", puis calcule le signe de "), lx(`${N}'(0)`), tx(e.variante === "pointHyperbole" ? " — en remplaçant 0 par un petit nombre positif, 0 étant exclu." : ".")] };
    case "optimum":
      if (e.variante === "sauveteur") return { texte: [tx("Calcule T à l'endroit trouvé (calculatrice), puis arrondis au dixième.")] };
      if (e.variante === "cable") return { texte: [tx("Calcule AM et MB à l'endroit trouvé (Pythagore), puis additionne.")] };
      return { texte: [tx("Calcule D à l'endroit trouvé : c'est le carré de la distance, prends ensuite sa racine.")] };
  }
}

// ============================================================================
// Figure de l'énoncé (SVG autonome, sans id, fond blanc ; jamais la position optimale).
// ============================================================================

const f1 = (x: number) => (Math.round(x * 10) / 10).toString();
const ENCRE = "#212529";
const ACCENT = "#b65c1f";
const BLEU = "#1d5b8f";
const POLICE = 'font-family="Helvetica, Arial, sans-serif"';
const txt = (x: number, y: number, t: string, opts = "") => `<text x="${f1(x)}" y="${f1(y)}" font-size="13" fill="${ENCRE}" ${POLICE} ${opts}>${t}</text>`;

function figureCourbe(e: E): string {
  const d = e.d;
  const m = modele(e);
  const racine = e.variante === "pointRacine";
  const yA = 0;
  const xA = racine ? d.a : 0;
  const xm = racine ? Math.max(1.5, m.x0 + 1.8, d.a + 1.5) : Math.sqrt(d.k) * 1.9;
  const xmin = racine ? Math.min(-1, d.a - 1) : -0.6;
  const xmax = racine ? Math.max(xm + 1.5, d.a + 1.5, 5) : Math.max(xm + 1.2, 4);
  const f = (x: number) => (racine ? Math.sqrt(d.k * x) : d.k / x);
  const ymax = racine ? Math.ceil(f(xmax)) + 0.8 : Math.max(4, Math.sqrt(d.k) * 2 + 0.5);
  const ymin = -0.8;
  const W = 300;
  const c = (W - 30) / (xmax - xmin);
  const H = Math.round((ymax - ymin) * c + 30);
  const sx = (x: number) => 15 + (x - xmin) * c;
  const sy = (y: number) => 15 + (ymax - y) * c;
  const o: string[] = [`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`];
  o.push(`<line x1="${f1(sx(xmin))}" y1="${f1(sy(0))}" x2="${f1(sx(xmax))}" y2="${f1(sy(0))}" stroke="${ENCRE}" stroke-width="1.3"/>`);
  o.push(`<path d="M ${f1(sx(xmax) + 6)},${f1(sy(0))} l -8,-4 l 0,8 z" fill="${ENCRE}"/>`);
  o.push(`<line x1="${f1(sx(0))}" y1="${f1(sy(ymin))}" x2="${f1(sx(0))}" y2="${f1(sy(ymax))}" stroke="${ENCRE}" stroke-width="1.3"/>`);
  o.push(`<path d="M ${f1(sx(0))},${f1(sy(ymax) - 6)} l -4,8 l 8,0 z" fill="${ENCRE}"/>`);
  o.push(txt(sx(xmax) - 8, sy(0) - 6, "x", 'font-style="italic"'), txt(sx(0) + 6, sy(ymax) + 10, "y", 'font-style="italic"'));
  o.push(txt(sx(0) - 12, sy(0) + 15, "O"));
  for (let k = Math.ceil(xmin); k <= xmax - 0.5; k++) if (k !== 0) o.push(`<line x1="${f1(sx(k))}" y1="${f1(sy(0) - 3)}" x2="${f1(sx(k))}" y2="${f1(sy(0) + 3)}" stroke="${ENCRE}"/>`);
  for (let k = 1; k <= ymax - 0.5; k++) o.push(`<line x1="${f1(sx(0) - 3)}" y1="${f1(sy(k))}" x2="${f1(sx(0) + 3)}" y2="${f1(sy(k))}" stroke="${ENCRE}"/>`);
  o.push(txt(sx(1) - 3, sy(0) + 15, "1", 'font-size="11"'), txt(sx(0) - 11, sy(1) + 4, "1", 'font-size="11"'));
  const pts: string[] = [];
  const x0 = racine ? 0 : Math.max(0.05, d.k / ymax);
  for (let i = 0; i <= 120; i++) {
    const x = x0 + ((xmax - x0) * i) / 120;
    pts.push(`${i ? "L" : "M"} ${f1(sx(x))},${f1(sy(f(x)))}`);
  }
  o.push(`<path d="${pts.join(" ")}" fill="none" stroke="${BLEU}" stroke-width="2.2"/>`);
  const ym = f(xm);
  o.push(`<line x1="${f1(sx(xA))}" y1="${f1(sy(yA))}" x2="${f1(sx(xm))}" y2="${f1(sy(ym))}" stroke="${ACCENT}" stroke-width="1.8" stroke-dasharray="6 4"/>`);
  o.push(`<circle cx="${f1(sx(xm))}" cy="${f1(sy(ym))}" r="3.5" fill="${ACCENT}"/>`, txt(sx(xm) + 6, sy(ym) - 6, "M", 'font-weight="bold"'));
  if (racine) o.push(`<circle cx="${f1(sx(xA))}" cy="${f1(sy(yA))}" r="3.5" fill="${ENCRE}"/>`, txt(sx(xA) - 5, sy(yA) + 16, "A", 'font-weight="bold"'));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${o.join("")}</svg>`;
}

function figureSauveteur(e: E): string {
  const d = e.d;
  const W = 320;
  const ech = 240 / Math.max(d.L, 1);
  const prof = Math.min(110, Math.max(40, d.h * ech));
  const H = Math.round(60 + prof + 30);
  const yr = 50;
  const xA = 30;
  const xH = xA + Math.min(260, Math.max(60, d.L * ech));
  const xM = xA + 0.42 * (xH - xA);
  const yN = yr + prof;
  const o: string[] = [`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`];
  o.push(`<rect x="0" y="0" width="${W}" height="${yr}" fill="#f3e7c9"/>`, `<rect x="0" y="${yr}" width="${W}" height="${H - yr}" fill="#dcecf8"/>`);
  o.push(txt(8, 18, "sable", 'font-size="11" font-style="italic"'), txt(8, H - 8, "mer", 'font-size="11" font-style="italic"'));
  o.push(`<line x1="0" y1="${yr}" x2="${W}" y2="${yr}" stroke="${ENCRE}" stroke-width="1.4"/>`);
  o.push(`<line x1="${f1(xH)}" y1="${yr}" x2="${f1(xH)}" y2="${f1(yN)}" stroke="${ENCRE}" stroke-width="1" stroke-dasharray="3 3"/>`);
  o.push(`<line x1="${f1(xA)}" y1="${yr}" x2="${f1(xM)}" y2="${yr}" stroke="${ACCENT}" stroke-width="3"/>`);
  o.push(`<line x1="${f1(xM)}" y1="${yr}" x2="${f1(xH)}" y2="${f1(yN)}" stroke="${BLEU}" stroke-width="2.2" stroke-dasharray="6 4"/>`);
  for (const [x, y, l, dy] of [[xA, yr, "A", -8], [xM, yr, "M", -8], [xH, yr, "H", -8], [xH, yN, "N", 16]] as [number, number, string, number][]) {
    o.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="3.5" fill="${ENCRE}"/>`, txt(x - 4, y + dy, l, 'font-weight="bold"'));
  }
  o.push(`<line x1="${f1(xA)}" y1="26" x2="${f1(xH)}" y2="26" stroke="${ENCRE}" stroke-width="0.8"/>`, `<line x1="${f1(xA)}" y1="22" x2="${f1(xA)}" y2="30" stroke="${ENCRE}" stroke-width="0.8"/>`, `<line x1="${f1(xH)}" y1="22" x2="${f1(xH)}" y2="30" stroke="${ENCRE}" stroke-width="0.8"/>`);
  o.push(txt((xA + xM) / 2 - 4, yr + 16, "x", 'font-style="italic"'));
  o.push(txt(xH + 6, (yr + yN) / 2 + 4, `${d.h} m`, 'font-size="12"'));
  o.push(txt((xA + xH) / 2 - 22, 17, `AH = ${d.L} m`, 'font-size="12"'));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${o.join("")}</svg>`;
}

function figureCable(e: E): string {
  const d = e.d;
  const W = 320;
  const ech = Math.min(240 / d.L, 110 / Math.max(d.a, d.b));
  const yr = 30 + Math.max(d.a, d.b) * ech;
  const H = Math.round(yr + 45);
  const xH = 40;
  const xK = xH + d.L * ech;
  const yA = yr - d.a * ech;
  const yB = yr - d.b * ech;
  const xM = xH + 0.3 * (xK - xH);
  const o: string[] = [`<rect x="0" y="0" width="${W}" height="${H}" fill="#ffffff"/>`, `<rect x="0" y="${f1(yr)}" width="${W}" height="${f1(H - yr)}" fill="#dcecf8"/>`];
  o.push(txt(8, H - 8, "rivière", 'font-size="11" font-style="italic"'));
  o.push(`<line x1="0" y1="${f1(yr)}" x2="${W}" y2="${f1(yr)}" stroke="${ENCRE}" stroke-width="1.4"/>`);
  o.push(`<line x1="${f1(xH)}" y1="${f1(yA)}" x2="${f1(xH)}" y2="${f1(yr)}" stroke="${ENCRE}" stroke-dasharray="3 3"/>`, `<line x1="${f1(xK)}" y1="${f1(yB)}" x2="${f1(xK)}" y2="${f1(yr)}" stroke="${ENCRE}" stroke-dasharray="3 3"/>`);
  o.push(`<polyline points="${f1(xH)},${f1(yA)} ${f1(xM)},${f1(yr)} ${f1(xK)},${f1(yB)}" fill="none" stroke="${ACCENT}" stroke-width="2.2"/>`);
  for (const [x, y, l, dx, dy] of [[xH, yA, "A", -14, 4], [xK, yB, "B", 7, 4], [xH, yr, "H", -5, 17], [xM, yr, "M", -5, 17], [xK, yr, "K", -5, 17]] as [number, number, string, number, number][]) {
    o.push(`<circle cx="${f1(x)}" cy="${f1(y)}" r="3.5" fill="${ENCRE}"/>`, txt(x + dx, y + dy, l, 'font-weight="bold"'));
  }
  o.push(txt(xH - 36, (yA + yr) / 2 + 4, `${d.a} m`, 'font-size="12"'), txt(xK + 6, (yB + yr) / 2 + 4, `${d.b} m`, 'font-size="12"'));
  o.push(txt((xH + xM) / 2 - 3, yr - 5, "x", 'font-style="italic"'));
  o.push(txt((xH + xK) / 2 - 22, H - 8, `HK = ${d.L} m`, 'font-size="12"'));
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${o.join("")}</svg>`;
}

export function figureEnonce(e: E): string {
  if (e.variante === "sauveteur") return figureSauveteur(e);
  if (e.variante === "cable") return figureCable(e);
  return figureCourbe(e);
}
