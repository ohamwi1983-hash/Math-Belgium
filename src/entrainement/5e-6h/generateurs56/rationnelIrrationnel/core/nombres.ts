import { lx, tx } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import type { Frag } from "../../../../5e-4h/ui5e/ecransTrigo.types";
import { decomposer, decompositionTexte, ent, parmi, pgcd, racineL, racineSimplifiee } from "../../communReels/outilsReels";
import type { EnsembleNb, FamilleNombre, LigneSimplification, NombreClasse } from "./types";

/**
 * Gabarits des nombres de `56gen14`, rangés par famille et par ENSEMBLE (verdict) : le générateur tire
 * l'ensemble d'abord, puis un gabarit de cet ensemble dans la famille, puis ses paramètres. Chaque
 * gabarit écrit sa simplification ligne à ligne (corrigé), sa raison, son aide de niveau 2 et son piège.
 * Toutes les valeurs sont recalculées depuis les paramètres tirés.
 */

type Gabarit = () => NombreClasse;
const L = (latex: string, justification?: string): LigneSimplification => (justification ? { latex, justification } : { latex });

const NON_CARRES = [2, 3, 5, 6, 7, 10, 11, 13, 14, 15];
const estCarre = (n: number) => Number.isInteger(Math.sqrt(n));
const dec = (x: number) => `${x}`.replace(".", "{,}");

function nombre(
  famille: FamilleNombre,
  ensemble: EnsembleNb,
  gabarit: string,
  latex: string,
  lignes: LigneSimplification[],
  valeurL: string,
  raison: Frag[],
  aide2: Frag[],
  piege: Frag[],
  deguise: boolean,
): NombreClasse {
  return { famille, ensemble, gabarit, latex, lignes, valeurL, raison, aide2, piege, deguise };
}

const RAISON: Record<EnsembleNb, (v: string) => Frag[]> = {
  N: (v) => [lx(v), tx(" est un naturel : le plus petit ensemble est "), lx("\\mathbb{N}"), tx(".")],
  Z: (v) => [lx(v), tx(" est un entier négatif, pas un naturel : le plus petit ensemble est "), lx("\\mathbb{Z}"), tx(".")],
  Q: (v) => [lx(v), tx(" est un quotient d'entiers qui n'est pas un entier : le plus petit ensemble est "), lx("\\mathbb{Q}"), tx(".")],
  I: (v) => [lx(v), tx(" n'est pas un quotient d'entiers : il est irrationnel, dans "), lx("\\mathbb{R}\\setminus\\mathbb{Q}"), tx(".")],
};

/** Raison d'un irrationnel de la forme a + b·√r (b ≠ 0, √r irrationnel) : par l'absurde. */
function raisonAbsurde(v: string, racine: string, isole: string): Frag[] {
  return [tx("Si "), lx(v), tx(" valait un rationnel q, alors "), lx(`${racine}=${isole}`), tx(" serait rationnel, ce qui est faux : "), lx(v), tx(" est irrationnel, dans "), lx("\\mathbb{R}\\setminus\\mathbb{Q}"), tx(".")];
}

const PIEGE_RACINE_RATIONNELLE: Frag[] = [tx("Conclure « irrationnel » parce qu'il y a une racine : une racine écrite peut se simplifier en un rationnel.")];

// ============================================================================
// Racines carrées et cubiques.
// ============================================================================

const RACINES: Record<EnsembleNb, Gabarit[]> = {
  N: [
    () => {
      const k = ent(4, 15);
      return nombre("racines", "N", "racineCarreParfait", `\\sqrt{${k * k}}`, [L(`\\sqrt{${k * k}}=\\sqrt{${k}^{2}}`, `${k * k} est un carré parfait`), L(`=${k}`)], `${k}`, RAISON.N(`${k}`), [tx("Ici, "), lx(`${k * k}`), tx(" est-il le carré d'un naturel ?")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const s = parmi([2, 3, 5, 6, 7]);
      let u = ent(1, 3);
      let v = ent(1, 3);
      if (u === v) v = u === 1 ? 2 : 1;
      if (u < v) [u, v] = [v, u];
      const a = s * u * u;
      const b = s * v * v;
      const p = a * b;
      const r = s * u * v;
      return nombre("racines", "N", "produitRacines", `\\sqrt{${a}}\\cdot\\sqrt{${b}}`, [L(`\\sqrt{${a}}\\cdot\\sqrt{${b}}=\\sqrt{${a}\\cdot ${b}}`, "√a · √b = √(ab)"), L(`=\\sqrt{${p}}`), L(`=${r}`, `${p} = ${r}², carré parfait`)], `${r}`, RAISON.N(`${r}`), [tx("Ici, écris le produit sous une seule racine : "), lx(`\\sqrt{${a}}\\cdot\\sqrt{${b}}=\\sqrt{${a}\\cdot ${b}}`), tx(".")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const s = parmi([2, 3, 5, 6, 7, 10]);
      const k = ent(2, 6);
      const a = s * k * k;
      return nombre("racines", "N", "quotientRacines", `\\dfrac{\\sqrt{${a}}}{\\sqrt{${s}}}`, [L(`\\dfrac{\\sqrt{${a}}}{\\sqrt{${s}}}=\\sqrt{\\dfrac{${a}}{${s}}}`, "√a / √b = √(a/b)"), L(`=\\sqrt{${k * k}}`), L(`=${k}`)], `${k}`, RAISON.N(`${k}`), [tx("Ici, écris le quotient sous une seule racine et simplifie la fraction.")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const k = ent(2, 6);
      return nombre("racines", "N", "racineCubique", `\\sqrt[3]{${k ** 3}}`, [L(`\\sqrt[3]{${k ** 3}}=\\sqrt[3]{${k}^{3}}`, `${k ** 3} est un cube parfait`), L(`=${k}`)], `${k}`, RAISON.N(`${k}`), [tx("Ici, "), lx(`${k ** 3}`), tx(" est-il le cube d'un naturel ?")], PIEGE_RACINE_RATIONNELLE, true);
    },
  ],
  Z: [
    () => {
      const k = ent(2, 6);
      return nombre("racines", "Z", "racineCubiqueNegative", `\\sqrt[3]{-${k ** 3}}`, [L(`\\sqrt[3]{-${k ** 3}}=\\sqrt[3]{(-${k})^{3}}`, `(−${k})³ = −${k ** 3}`), L(`=-${k}`)], `-${k}`, RAISON.Z(`-${k}`), [tx("Ici, cherche un entier dont le cube vaut "), lx(`-${k ** 3}`), tx(" : une racine cubique existe aussi pour un nombre négatif.")], [tx("Croire qu'une racine cubique d'un négatif n'existe pas, ou oublier le signe : "), lx(`(-${k})^{3}=-${k ** 3}`), tx(".")], true);
    },
    () => {
      const k = ent(3, 12);
      return nombre("racines", "Z", "moinsRacineCarre", `-\\sqrt{${k * k}}`, [L(`-\\sqrt{${k * k}}=-\\sqrt{${k}^{2}}`), L(`=-${k}`)], `-${k}`, RAISON.Z(`-${k}`), [tx("Ici, simplifie d'abord la racine ; le signe « − » est devant elle.")], [tx("Oublier le signe « − » devant la racine : le nombre est négatif.")], true);
    },
    () => {
      const s = parmi([2, 3, 5, 6, 7]);
      const u = ent(2, 4);
      const a = s * u * u;
      const r = s * u;
      return nombre("racines", "Z", "moinsProduitRacines", `-\\sqrt{${a}}\\cdot\\sqrt{${s}}`, [L(`-\\sqrt{${a}}\\cdot\\sqrt{${s}}=-\\sqrt{${a}\\cdot ${s}}`, "√a · √b = √(ab)"), L(`=-\\sqrt{${a * s}}`), L(`=-${r}`, `${a * s} = ${r}²`)], `-${r}`, RAISON.Z(`-${r}`), [tx("Ici, écris le produit sous une seule racine, en gardant le signe « − » devant.")], PIEGE_RACINE_RATIONNELLE, true);
    },
  ],
  Q: [
    () => {
      let a = ent(1, 9);
      let b = ent(2, 9);
      while (pgcd(a, b) !== 1 || b === 1) {
        a = ent(1, 9);
        b = ent(2, 9);
      }
      return nombre("racines", "Q", "racineFraction", `\\sqrt{\\dfrac{${a * a}}{${b * b}}}`, [L(`\\sqrt{\\dfrac{${a * a}}{${b * b}}}=\\dfrac{\\sqrt{${a * a}}}{\\sqrt{${b * b}}}`, "√(a/b) = √a / √b"), L(`=\\dfrac{${a}}{${b}}`)], `\\dfrac{${a}}{${b}}`, RAISON.Q(`\\dfrac{${a}}{${b}}`), [tx("Ici, "), lx(`${a * a}`), tx(" et "), lx(`${b * b}`), tx(" sont-ils des carrés parfaits ?")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      let a = ent(1, 5);
      let b = ent(2, 5);
      while (pgcd(a, b) !== 1) {
        a = ent(1, 5);
        b = ent(2, 5);
      }
      const neg = Math.random() < 0.5;
      const m = neg ? "-" : "";
      return nombre("racines", "Q", "racineCubiqueFraction", `\\sqrt[3]{${m}\\dfrac{${a ** 3}}{${b ** 3}}}`, [L(`\\sqrt[3]{${m}\\dfrac{${a ** 3}}{${b ** 3}}}=\\sqrt[3]{\\left(${m}\\dfrac{${a}}{${b}}\\right)^{3}}`, `${a ** 3} = ${a}³ et ${b ** 3} = ${b}³`), L(`=${m}\\dfrac{${a}}{${b}}`)], `${m}\\dfrac{${a}}{${b}}`, RAISON.Q(`${m}\\dfrac{${a}}{${b}}`), [tx("Ici, "), lx(`${a ** 3}`), tx(" et "), lx(`${b ** 3}`), tx(" sont-ils des cubes parfaits ?")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const s = parmi([2, 3, 5]);
      let u = ent(1, 4);
      let v = ent(2, 4);
      while (pgcd(u, v) !== 1 || v === 1) {
        u = ent(1, 4);
        v = ent(2, 4);
      }
      const a = s * u * u;
      const b = s * v * v;
      return nombre("racines", "Q", "quotientRacinesFraction", `\\dfrac{\\sqrt{${a}}}{\\sqrt{${b}}}`, [L(`\\dfrac{\\sqrt{${a}}}{\\sqrt{${b}}}=\\sqrt{\\dfrac{${a}}{${b}}}`, "√a / √b = √(a/b)"), L(`=\\sqrt{\\dfrac{${u * u}}{${v * v}}}`, `on simplifie par ${s}`), L(`=\\dfrac{${u}}{${v}}`)], `\\dfrac{${u}}{${v}}`, RAISON.Q(`\\dfrac{${u}}{${v}}`), [tx("Ici, écris le quotient sous une seule racine et simplifie la fraction sous la racine.")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      let k = ent(2, 19);
      while (k % 10 === 0) k = ent(2, 19);
      const carre = (k * k) / 100;
      const g = pgcd(k, 10);
      return nombre("racines", "Q", "racineDecimale", `\\sqrt{${dec(carre)}}`, [L(`\\sqrt{${dec(carre)}}=\\sqrt{\\dfrac{${k * k}}{100}}`), L(`=\\dfrac{${k}}{10}`, `${k * k} = ${k}² et 100 = 10²`), L(`=${dec(k / 10)}`)], dec(k / 10), RAISON.Q(g === 1 ? `\\dfrac{${k}}{10}` : `\\dfrac{${k / g}}{${10 / g}}`), [tx("Ici, écris "), lx(dec(carre)), tx(" comme une fraction de dénominateur 100.")], PIEGE_RACINE_RATIONNELLE, true);
    },
  ],
  I: [
    () => {
      let n = ent(6, 99);
      while (estCarre(n)) n = ent(6, 99);
      const { c, r } = racineSimplifiee(n);
      const lignes = c > 1 ? [L(`\\sqrt{${n}}=\\sqrt{${c * c}\\cdot ${r}}`, `${c * c} est un carré`), L(`=${racineL(c, r)}`)] : [L(`\\sqrt{${n}}\\notin\\mathbb{Q}`, `${n} = ${decompositionTexte(decomposer(n))} : aucun exposant pair, pas un carré parfait`)];
      const v = racineL(c, r);
      return nombre("racines", "I", "racineNonCarre", `\\sqrt{${n}}`, lignes, v, c > 1 ? raisonAbsurde(v, `\\sqrt{${r}}`, `\\dfrac{q}{${c}}`) : RAISON.I(v), [tx("Ici, "), lx(`${n}`), tx(" est-il un carré parfait ? Cherche le plus grand carré qui le divise.")], [tx("Croire que "), lx(`\\sqrt{${n}}`), tx(" est rationnel parce qu'on peut le simplifier : la racine de "), lx(`${r}`), tx(" reste.")], false);
    },
    () => {
      let n = ent(2, 99);
      while (Number.isInteger(Math.round(Math.cbrt(n))) && Math.round(Math.cbrt(n)) ** 3 === n) n = ent(2, 99);
      const { c, r } = racineSimplifiee(n, 3);
      const v = racineL(c, r, 3);
      const lignes = c > 1 ? [L(`\\sqrt[3]{${n}}=\\sqrt[3]{${c ** 3}\\cdot ${r}}`, `${c ** 3} est un cube`), L(`=${v}`)] : [L(`\\sqrt[3]{${n}}\\notin\\mathbb{Q}`, `${n} = ${decompositionTexte(decomposer(n))} : aucun exposant multiple de 3, pas un cube parfait`)];
      return nombre("racines", "I", "racineCubiqueNonCube", `\\sqrt[3]{${n}}`, lignes, v, c > 1 ? raisonAbsurde(v, `\\sqrt[3]{${r}}`, `\\dfrac{q}{${c}}`) : RAISON.I(v), [tx("Ici, "), lx(`${n}`), tx(" est-il le cube d'un naturel ?")], [tx("Confondre racine cubique et racine carrée : "), lx(`${n}`), tx(" n'est pas un cube parfait.")], false);
    },
    () => {
      const a = parmi(NON_CARRES);
      const b = parmi([4, 9, 16, 25, 36, 49].filter((x) => pgcd(x, a) === 1));
      const v = `\\dfrac{\\sqrt{${a}}}{${Math.sqrt(b)}}`;
      return nombre("racines", "I", "racineFractionIrr", `\\sqrt{\\dfrac{${a}}{${b}}}`, [L(`\\sqrt{\\dfrac{${a}}{${b}}}=\\dfrac{\\sqrt{${a}}}{\\sqrt{${b}}}`, "√(a/b) = √a / √b"), L(`=${v}`)], v, raisonAbsurde(v, `\\sqrt{${a}}`, `${Math.sqrt(b)}q`), [tx("Ici, sépare la racine du numérateur et celle du dénominateur : lequel des deux est un carré parfait ?")], [tx("Juger sur le dénominateur seul : "), lx(`${b}`), tx(" est un carré, mais "), lx(`${a}`), tx(" ne l'est pas.")], false);
    },
    () => {
      const s = parmi([2, 3, 5, 6, 7]);
      const t = parmi([2, 3, 5, 7].filter((x) => x !== s && pgcd(x, s) === 1));
      const a = s * t;
      const b = s;
      const p = a * b;
      const { c, r } = racineSimplifiee(p);
      const v = racineL(c, r);
      return nombre("racines", "I", "produitRacinesIrr", `\\sqrt{${a}}\\cdot\\sqrt{${b}}`, [L(`\\sqrt{${a}}\\cdot\\sqrt{${b}}=\\sqrt{${p}}`, "√a · √b = √(ab)"), L(`=\\sqrt{${c * c}\\cdot ${r}}`), L(`=${v}`)], v, raisonAbsurde(v, `\\sqrt{${r}}`, `\\dfrac{q}{${c}}`), [tx("Ici, écris le produit sous une seule racine : "), lx(`${p}`), tx(" est-il un carré parfait ?")], [tx("Croire que le produit de deux racines est toujours un entier : "), lx(`${p}`), tx(" n'est pas un carré parfait.")], false);
    },
  ],
};

// ============================================================================
// Fractions, puissances, écritures décimales.
// ============================================================================

const PIEGE_FRACTION_ENTIERE: Frag[] = [tx("S'arrêter à « c'est une fraction, donc ℚ » : une fraction peut être égale à un entier.")];

function fractionPeriodique(): { latex: string; lignes: LigneSimplification[]; valeur: string; n: number; d: number } {
  const p = parmi([1, 2]);
  const bloc = p === 1 ? ent(1, 8) : ent(10, 98);
  const blocTxt = p === 1 ? `${bloc}` : `${bloc}`.padStart(2, "0");
  if (p === 2 && blocTxt[0] === blocTxt[1]) return fractionPeriodique();
  const neuf = p === 1 ? 9 : 99;
  const g = pgcd(bloc, neuf);
  const n = bloc / g;
  const d = neuf / g;
  const x = `0{,}\\overline{${blocTxt}}`;
  const lignes = [L(`x=${x}`), L(`${p === 1 ? "10" : "100"}x=${blocTxt.replace(/^0/, "")}{,}\\overline{${blocTxt}}`, `on décale la virgule de ${p} rang${p > 1 ? "s" : ""}`), L(`${p === 1 ? "10" : "100"}x-x=${bloc}`, "les périodes s'éliminent"), L(`x=\\dfrac{${bloc}}{${neuf}}`), ...(g > 1 ? [L(`=\\dfrac{${n}}{${d}}`, `on simplifie par ${g}`)] : [])];
  return { latex: x, lignes, valeur: `\\dfrac{${n}}{${d}}`, n, d };
}

const ECRITURES: Record<EnsembleNb, Gabarit[]> = {
  N: [
    () => {
      const b = ent(2, 9);
      const k = ent(2, 12);
      const neg = Math.random() < 0.35;
      const lat = neg ? `\\dfrac{-${k * b}}{-${b}}` : `\\dfrac{${k * b}}{${b}}`;
      return nombre("ecritures", "N", "fractionEntiere", lat, [L(`${lat}=${k}`, neg ? `${k * b} = ${k} · ${b} ; deux signes « − » : quotient positif` : `${k * b} = ${k} · ${b}`)], `${k}`, RAISON.N(`${k}`), [tx("Ici, le numérateur est-il un multiple du dénominateur ?")], PIEGE_FRACTION_ENTIERE, true);
    },
    () => {
      const k = ent(2, 3);
      const m = ent(11, 99);
      const c = m / 10;
      const v = m * 10 ** (k - 1);
      return nombre("ecritures", "N", "notationScientifique", `${dec(c)}\\cdot 10^{${k}}`, [L(`${dec(c)}\\cdot 10^{${k}}=${dec(c)}\\cdot ${10 ** k}`), L(`=${v}`, `la virgule avance de ${k} rangs`)], `${v}`, RAISON.N(`${v}`), [tx("Ici, multiplier par "), lx(`10^{${k}}`), tx(" déplace la virgule de "), lx(`${k}`), tx(" rangs vers la droite.")], [tx("Croire qu'un nombre écrit avec une virgule n'est jamais un naturel.")], true);
    },
    () => {
      const a = ent(2, 4);
      const e = a === 2 ? parmi([2, 4, 6]) : 2;
      return nombre("ecritures", "N", "puissancePaire", `(-${a})^{${e}}`, [L(`(-${a})^{${e}}=${a}^{${e}}`, "exposant pair : le signe disparaît"), L(`=${a ** e}`)], `${a ** e}`, RAISON.N(`${a ** e}`), [tx("Ici, l'exposant est pair : quel est le signe du résultat ?")], [tx("Garder le signe « − » : un exposant pair rend la puissance positive.")], true);
    },
    () => {
      const k = ent(1, 8);
      return nombre("ecritures", "N", "periodeNeuf", `${k}{,}\\overline{9}`, [L(`x=${k}{,}\\overline{9}`), L(`10x=${10 * k + 9}{,}\\overline{9}`, "on décale la virgule d'un rang"), L(`10x-x=${9 * k + 9}`, "les périodes s'éliminent"), L(`x=${k + 1}`, `on divise par 9`)], `${k + 1}`, RAISON.N(`${k + 1}`), [tx("Ici, pose "), lx(`x=${k}{,}\\overline{9}`), tx(" et calcule "), lx("10x-x"), tx(".")], [tx("Croire que "), lx(`${k}{,}\\overline{9}`), tx(" est un peu plus petit que "), lx(`${k + 1}`), tx(" : ce sont deux écritures du même nombre.")], true);
    },
  ],
  Z: [
    () => {
      const b = ent(2, 9);
      const k = ent(2, 12);
      const lat = Math.random() < 0.5 ? `-\\dfrac{${k * b}}{${b}}` : `\\dfrac{${k * b}}{-${b}}`;
      return nombre("ecritures", "Z", "fractionEntiereNegative", lat, [L(`${lat}=-${k}`, `${k * b} = ${k} · ${b}`)], `-${k}`, RAISON.Z(`-${k}`), [tx("Ici, le numérateur est-il un multiple du dénominateur ? Attention au signe.")], PIEGE_FRACTION_ENTIERE, true);
    },
    () => {
      const a = ent(2, 3);
      const e = a === 2 ? parmi([3, 5]) : 3;
      return nombre("ecritures", "Z", "puissanceImpaire", `(-${a})^{${e}}`, [L(`(-${a})^{${e}}=-${a}^{${e}}`, "exposant impair : le signe reste"), L(`=-${a ** e}`)], `-${a ** e}`, RAISON.Z(`-${a ** e}`), [tx("Ici, l'exposant est impair : quel est le signe du résultat ?")], [tx("Rendre la puissance positive : avec un exposant impair, le signe « − » reste.")], true);
    },
    () => {
      const k = ent(2, 3);
      const m = ent(11, 99);
      const v = m * 10 ** (k - 1);
      return nombre("ecritures", "Z", "notationScientifiqueNegative", `-${dec(m / 10)}\\cdot 10^{${k}}`, [L(`-${dec(m / 10)}\\cdot 10^{${k}}=-${dec(m / 10)}\\cdot ${10 ** k}`), L(`=-${v}`, `la virgule avance de ${k} rangs`)], `-${v}`, RAISON.Z(`-${v}`), [tx("Ici, déplace la virgule de "), lx(`${k}`), tx(" rangs vers la droite.")], [tx("Croire qu'un nombre écrit avec une virgule n'est jamais un entier.")], true);
    },
  ],
  Q: [
    () => {
      const f = fractionPeriodique();
      return nombre("ecritures", "Q", "periodique", f.latex, f.lignes, f.valeur, RAISON.Q(f.valeur), [tx("Ici, pose "), lx(`x=${f.latex}`), tx(" et décale la virgule d'autant de rangs que la période a de chiffres.")], [tx("Croire qu'une écriture décimale illimitée est irrationnelle : celle-ci est périodique.")], true);
    },
    () => {
      const c = ent(2, 9);
      const k = ent(3, 7);
      return nombre("ecritures", "Q", "puissanceDixNegative", `${c}\\cdot 10^{-${k}}`, [L(`${c}\\cdot 10^{-${k}}=\\dfrac{${c}}{10^{${k}}}`, "10⁻ᵏ = 1 / 10ᵏ"), L(`=\\dfrac{${c}}{${(10 ** k).toLocaleString("fr-FR").replace(/\s/g, "\\,")}}`)], `\\dfrac{${c}}{10^{${k}}}`, RAISON.Q(`\\dfrac{${c}}{10^{${k}}}`), [tx("Ici, un exposant négatif : "), lx(`10^{-${k}}=\\dfrac{1}{10^{${k}}}`), tx(".")], [tx("Confondre un exposant négatif avec un nombre négatif : "), lx(`10^{-${k}}`), tx(" est positif et plus petit que 1.")], false);
    },
    () => {
      const ent1 = ent(1, 30);
      const d = ent(1, 9);
      const n = ent1 * 100 + d;
      const g = pgcd(n, 100);
      return nombre("ecritures", "Q", "decimalLimite", `-${ent1}{,}0${d}`, [L(`-${ent1}{,}0${d}=-\\dfrac{${n}}{100}`, "deux décimales : dénominateur 100"), ...(g > 1 ? [L(`=-\\dfrac{${n / g}}{${100 / g}}`)] : [])], g > 1 ? `-\\dfrac{${n / g}}{${100 / g}}` : `-\\dfrac{${n}}{100}`, RAISON.Q(`-\\dfrac{${n / g}}{${100 / g}}`), [tx("Ici, une écriture décimale limitée s'écrit avec un dénominateur 10, 100, 1 000…")], [tx("Croire qu'un décimal négatif est un entier négatif : "), lx("\\mathbb{Z}"), tx(" ne contient que les nombres sans partie décimale.")], false);
    },
    () => {
      const [n, d] = parmi([[22, 7], [7, 12], [5, 8], [11, 6], [13, 9], [17, 4]] as const);
      const special = n === 22;
      return nombre("ecritures", "Q", "fractionIrreductible", `\\dfrac{${n}}{${d}}`, [L(`${n}=${Math.floor(n / d)}\\cdot ${d}+${n % d}`, `reste non nul : ${d} ne divise pas ${n}, fraction irréductible`)], `\\dfrac{${n}}{${d}}`, RAISON.Q(`\\dfrac{${n}}{${d}}`), [tx("Ici, la fraction se simplifie-t-elle en un entier ?")], special ? [tx("Confondre "), lx("\\dfrac{22}{7}"), tx(" avec "), lx("\\pi"), tx(" : c'est une valeur approchée rationnelle de "), lx("\\pi"), tx(", pas "), lx("\\pi"), tx(".")] : [tx("Croire qu'une fraction est un entier sans vérifier que le dénominateur divise le numérateur.")], special);
    },
    () => {
      const a = parmi([2, 3, 5]);
      const k = a === 2 ? ent(2, 4) : 2;
      return nombre("ecritures", "Q", "exposantNegatif", `${a}^{-${k}}`, [L(`${a}^{-${k}}=\\dfrac{1}{${a}^{${k}}}`, "a⁻ᵏ = 1 / aᵏ"), L(`=\\dfrac{1}{${a ** k}}`)], `\\dfrac{1}{${a ** k}}`, RAISON.Q(`\\dfrac{1}{${a ** k}}`), [tx("Ici, un exposant négatif donne un inverse : "), lx(`${a}^{-${k}}=\\dfrac{1}{${a}^{${k}}}`), tx(".")], [tx("Lire "), lx(`${a}^{-${k}}`), tx(" comme un nombre négatif : c'est un inverse, positif.")], false);
    },
  ],
  I: [
    () => {
      const d = ent(1, 9);
      const lat = `0{,}${d}0${d}00${d}000${d}\\ldots`;
      return nombre("ecritures", "I", "zerosCroissants", lat, [L(`x=${lat}`, `un 0 de plus avant chaque ${d}`)], "x", [tx("Les blocs de 0 s'allongent sans fin : l'écriture est illimitée et non périodique, donc "), lx("x"), tx(" est irrationnel, dans "), lx("\\mathbb{R}\\setminus\\mathbb{Q}"), tx(".")], [tx("Ici, un même bloc de chiffres se répète-t-il indéfiniment ?")], [tx("Croire qu'une écriture régulière est périodique : la règle est régulière, mais aucun bloc ne se répète à l'identique.")], false);
    },
    () => {
      const e0 = ent(0, 3);
      const lat = `${e0}{,}123456789101112\\ldots`;
      return nombre("ecritures", "I", "naturelsALaSuite", lat, [L(`x=${lat}`, "on écrit les naturels à la suite")], "x", [tx("Les naturels écrits à la suite ont de plus en plus de chiffres : aucun bloc ne se répète, l'écriture est illimitée non périodique, donc "), lx("x"), tx(" est irrationnel.")], [tx("Ici, après 9 viennent 10, 11, 12… : un bloc fixe peut-il se répéter ?")], [tx("Croire que « 123456789 » se répète : après 9 vient 10, puis 11…")], false);
    },
    () => {
      const e0 = ent(1, 9);
      const lat = `${e0}{,}1223334444\\ldots`;
      return nombre("ecritures", "I", "blocsCroissants", lat, [L(`x=${lat}`, "un 1, deux 2, trois 3, quatre 4…")], "x", [tx("Chaque chiffre est répété une fois de plus que le précédent : l'écriture est illimitée et non périodique, donc "), lx("x"), tx(" est irrationnel.")], [tx("Ici, la longueur des blocs reste-t-elle la même ?")], [tx("Confondre « régulier » et « périodique » : les blocs s'allongent.")], false);
    },
  ],
};

// ============================================================================
// Expressions avec des racines.
// ============================================================================

function deuxNonCarres(): [number, number] {
  const a = parmi(NON_CARRES);
  let b = parmi(NON_CARRES);
  while (b === a) b = parmi(NON_CARRES);
  return [a, b];
}

const EXPRESSIONS: Record<EnsembleNb, Gabarit[]> = {
  N: [
    () => {
      const a = parmi(NON_CARRES);
      return nombre("expressions", "N", "carreRacine", `\\left(\\sqrt{${a}}\\right)^{2}`, [L(`\\left(\\sqrt{${a}}\\right)^{2}=${a}`, "(√a)² = a pour a ≥ 0")], `${a}`, RAISON.N(`${a}`), [tx("Ici, que donne le carré d'une racine carrée ?")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      let [a, b] = deuxNonCarres();
      if (a < b) [a, b] = [b, a];
      return nombre("expressions", "N", "conjugues", `\\left(\\sqrt{${a}}-\\sqrt{${b}}\\right)\\left(\\sqrt{${a}}+\\sqrt{${b}}\\right)`, [L(`\\left(\\sqrt{${a}}-\\sqrt{${b}}\\right)\\left(\\sqrt{${a}}+\\sqrt{${b}}\\right)=\\left(\\sqrt{${a}}\\right)^{2}-\\left(\\sqrt{${b}}\\right)^{2}`, "(x − y)(x + y) = x² − y²"), L(`=${a}-${b}`), L(`=${a - b}`)], `${a - b}`, RAISON.N(`${a - b}`), [tx("Ici, reconnais un produit remarquable : "), lx("(x-y)(x+y)=x^{2}-y^{2}"), tx(".")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const k = ent(2, 5);
      const a = parmi([2, 3, 5, 6, 7]);
      return nombre("expressions", "N", "carreProduit", `\\left(${k}\\sqrt{${a}}\\right)^{2}`, [L(`\\left(${k}\\sqrt{${a}}\\right)^{2}=${k}^{2}\\cdot\\left(\\sqrt{${a}}\\right)^{2}`, "(xy)² = x²y²"), L(`=${k * k}\\cdot ${a}`), L(`=${k * k * a}`)], `${k * k * a}`, RAISON.N(`${k * k * a}`), [tx("Ici, élève chaque facteur au carré : "), lx("(xy)^{2}=x^{2}y^{2}"), tx(".")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const a = parmi(NON_CARRES);
      return nombre("expressions", "N", "carreSommeMoins", `\\left(1+\\sqrt{${a}}\\right)^{2}-2\\sqrt{${a}}`, [L(`\\left(1+\\sqrt{${a}}\\right)^{2}-2\\sqrt{${a}}=1+2\\sqrt{${a}}+${a}-2\\sqrt{${a}}`, "(x + y)² = x² + 2xy + y²"), L(`=${1 + a}`, "les racines s'éliminent")], `${1 + a}`, RAISON.N(`${1 + a}`), [tx("Ici, développe le carré avec "), lx("(x+y)^{2}=x^{2}+2xy+y^{2}"), tx(", puis réduis.")], PIEGE_RACINE_RATIONNELLE, true);
    },
  ],
  Z: [
    () => {
      const a = parmi([2, 3, 5, 6, 7, 8, 10, 11, 12]);
      return nombre("expressions", "Z", "conjuguesUn", `\\left(1-\\sqrt{${a}}\\right)\\left(1+\\sqrt{${a}}\\right)`, [L(`\\left(1-\\sqrt{${a}}\\right)\\left(1+\\sqrt{${a}}\\right)=1^{2}-\\left(\\sqrt{${a}}\\right)^{2}`, "(x − y)(x + y) = x² − y²"), L(`=1-${a}`), L(`=${1 - a}`)], `${1 - a}`, RAISON.Z(`${1 - a}`), [tx("Ici, reconnais un produit remarquable : "), lx("(x-y)(x+y)=x^{2}-y^{2}"), tx(".")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      let [a, b] = deuxNonCarres();
      if (a > b) [a, b] = [b, a];
      return nombre("expressions", "Z", "conjuguesNegatif", `\\left(\\sqrt{${a}}-\\sqrt{${b}}\\right)\\left(\\sqrt{${a}}+\\sqrt{${b}}\\right)`, [L(`\\left(\\sqrt{${a}}-\\sqrt{${b}}\\right)\\left(\\sqrt{${a}}+\\sqrt{${b}}\\right)=\\left(\\sqrt{${a}}\\right)^{2}-\\left(\\sqrt{${b}}\\right)^{2}`, "(x − y)(x + y) = x² − y²"), L(`=${a}-${b}`), L(`=${a - b}`)], `${a - b}`, RAISON.Z(`${a - b}`), [tx("Ici, reconnais un produit remarquable, puis regarde le signe du résultat.")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const a = parmi([2, 3, 5, 6, 7]);
      const c = ent(3, 5);
      return nombre("expressions", "Z", "conjuguesEntier", `\\left(\\sqrt{${a}}-${c}\\right)\\left(\\sqrt{${a}}+${c}\\right)`, [L(`\\left(\\sqrt{${a}}-${c}\\right)\\left(\\sqrt{${a}}+${c}\\right)=\\left(\\sqrt{${a}}\\right)^{2}-${c}^{2}`, "(x − y)(x + y) = x² − y²"), L(`=${a}-${c * c}`), L(`=${a - c * c}`)], `${a - c * c}`, RAISON.Z(`${a - c * c}`), [tx("Ici, reconnais "), lx("(x-y)(x+y)=x^{2}-y^{2}"), tx(".")], PIEGE_RACINE_RATIONNELLE, true);
    },
  ],
  Q: [
    () => {
      const a = parmi([3, 5, 7, 11, 13]);
      const b = parmi([2, 4, 6].filter((x) => a % x !== 0));
      const g = pgcd(a, b);
      return nombre("expressions", "Q", "carreRacineSurEntier", `\\dfrac{\\left(\\sqrt{${a}}\\right)^{2}}{${b}}`, [L(`\\dfrac{\\left(\\sqrt{${a}}\\right)^{2}}{${b}}=\\dfrac{${a}}{${b}}`, "(√a)² = a"), ...(g > 1 ? [L(`=\\dfrac{${a / g}}{${b / g}}`)] : [])], `\\dfrac{${a / g}}{${b / g}}`, RAISON.Q(`\\dfrac{${a / g}}{${b / g}}`), [tx("Ici, simplifie le numérateur : que vaut le carré d'une racine carrée ?")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const a = parmi([2, 3, 5, 6, 7]);
      const c = parmi([2, 3, 4, 5].filter((x) => pgcd(x * x, a) === 1));
      return nombre("expressions", "Q", "carreQuotient", `\\left(\\dfrac{\\sqrt{${a}}}{${c}}\\right)^{2}`, [L(`\\left(\\dfrac{\\sqrt{${a}}}{${c}}\\right)^{2}=\\dfrac{\\left(\\sqrt{${a}}\\right)^{2}}{${c}^{2}}`, "(x/y)² = x²/y²"), L(`=\\dfrac{${a}}{${c * c}}`)], `\\dfrac{${a}}{${c * c}}`, RAISON.Q(`\\dfrac{${a}}{${c * c}}`), [tx("Ici, élève au carré le numérateur et le dénominateur.")], PIEGE_RACINE_RATIONNELLE, true);
    },
    () => {
      const s = parmi([2, 3, 5]);
      const u = ent(2, 3);
      const p = s * u;
      const c = parmi([3, 5, 7].filter((x) => p % x !== 0));
      return nombre("expressions", "Q", "produitRacinesSurEntier", `\\dfrac{\\sqrt{${s * u * u}}\\cdot\\sqrt{${s}}}{${c}}`, [L(`\\dfrac{\\sqrt{${s * u * u}}\\cdot\\sqrt{${s}}}{${c}}=\\dfrac{\\sqrt{${s * s * u * u}}}{${c}}`, "√a · √b = √(ab)"), L(`=\\dfrac{${p}}{${c}}`, `${s * s * u * u} = ${p}²`)], `\\dfrac{${p}}{${c}}`, RAISON.Q(`\\dfrac{${p}}{${c}}`), [tx("Ici, écris le produit du numérateur sous une seule racine.")], PIEGE_RACINE_RATIONNELLE, true);
    },
  ],
  I: [
    () => {
      const a = parmi(NON_CARRES);
      const k = ent(1, 5);
      const v = `${k}+\\sqrt{${a}}`;
      return nombre("expressions", "I", "entierPlusRacine", v, [L(`\\sqrt{${a}}\\notin\\mathbb{Q}`, `${a} n'est pas un carré parfait`)], v, raisonAbsurde(v, `\\sqrt{${a}}`, `q-${k}`), [tx("Ici, suppose que "), lx(v), tx(" est un rationnel q, et isole la racine.")], [tx("Croire qu'ajouter un entier à un irrationnel peut donner un rationnel.")], false);
    },
    () => {
      const a = parmi([2, 3, 5, 6, 7]);
      const v = `${a + 1}+2\\sqrt{${a}}`;
      return nombre("expressions", "I", "carreSomme", `\\left(\\sqrt{${a}}+1\\right)^{2}`, [L(`\\left(\\sqrt{${a}}+1\\right)^{2}=${a}+2\\sqrt{${a}}+1`, "(x + y)² = x² + 2xy + y²"), L(`=${v}`)], v, raisonAbsurde(v, `\\sqrt{${a}}`, `\\dfrac{q-${a + 1}}{2}`), [tx("Ici, développe avec "), lx("(x+y)^{2}=x^{2}+2xy+y^{2}"), tx(" : le double produit disparaît-il ?")], [tx("Oublier le double produit : "), lx(`\\left(\\sqrt{${a}}+1\\right)^{2}\\neq ${a}+1`), tx(".")], false);
    },
    () => {
      const a = parmi([2, 3, 5, 6, 7]);
      const k = ent(2, 3);
      const v = racineL(k - 1, a);
      return nombre("expressions", "I", "differenceRacines", `\\sqrt{${k * k * a}}-\\sqrt{${a}}`, [L(`\\sqrt{${k * k * a}}-\\sqrt{${a}}=${k}\\sqrt{${a}}-\\sqrt{${a}}`, `√${k * k * a} = √(${k * k} · ${a})`), L(`=${v}`)], v, k - 1 === 1 ? RAISON.I(v) : raisonAbsurde(v, `\\sqrt{${a}}`, `\\dfrac{q}{${k - 1}}`), [tx("Ici, simplifie "), lx(`\\sqrt{${k * k * a}}`), tx(" pour faire apparaître "), lx(`\\sqrt{${a}}`), tx(".")], [tx("Soustraire sous la racine : "), lx(`\\sqrt{${k * k * a}}-\\sqrt{${a}}\\neq\\sqrt{${k * k * a - a}}`), tx(".")], false);
    },
  ],
};

// ============================================================================
// Trigonométrie, π et Φ.
// ============================================================================

const PIEGE_TRIGO: Frag[] = [tx("Juger sur l'écriture « cos » ou « sin » : beaucoup de valeurs remarquables sont rationnelles.")];

function trig(ensemble: EnsembleNb, gabarit: string, lat: string, lignes: LigneSimplification[], v: string, aide: Frag[], piege: Frag[] = PIEGE_TRIGO, raison?: Frag[]): NombreClasse {
  return nombre("constantes", ensemble, gabarit, lat, lignes, v, raison ?? RAISON[ensemble](v), aide, piege, ensemble !== "I");
}

const AIDE_TRIGO: Frag[] = [tx("Ici, remplace chaque valeur trigonométrique par sa valeur exacte, puis calcule.")];

const CONSTANTES: Record<EnsembleNb, Gabarit[]> = {
  N: [
    () =>
      parmi([
        () => trig("N", "tan45", "\\tan 45^\\circ", [L("\\tan 45^\\circ=1", "valeur remarquable")], "1", AIDE_TRIGO),
        () => trig("N", "deuxSin30", "2\\sin 30^\\circ", [L("2\\sin 30^\\circ=2\\cdot\\dfrac{1}{2}", "sin 30° = 1/2"), L("=1")], "1", AIDE_TRIGO),
        () => trig("N", "quatreCos2", "4\\cos^{2} 30^\\circ", [L("4\\cos^{2} 30^\\circ=4\\cdot\\left(\\dfrac{\\sqrt{3}}{2}\\right)^{2}", "cos 30° = √3/2"), L("=4\\cdot\\dfrac{3}{4}"), L("=3")], "3", AIDE_TRIGO),
        () => trig("N", "inverseCos60", "\\dfrac{1}{\\cos 60^\\circ}", [L("\\dfrac{1}{\\cos 60^\\circ}=\\dfrac{1}{\\frac{1}{2}}", "cos 60° = 1/2"), L("=2")], "2", AIDE_TRIGO),
        () => trig("N", "tan2_60", "\\tan^{2} 60^\\circ", [L("\\tan^{2} 60^\\circ=\\left(\\sqrt{3}\\right)^{2}", "tan 60° = √3"), L("=3")], "3", AIDE_TRIGO),
      ])(),
    () => {
      const a = parmi([17, 23, 38, 41, 52, 71]);
      return trig("N", "pythagore", `\\sin^{2} ${a}^\\circ+\\cos^{2} ${a}^\\circ`, [L(`\\sin^{2} ${a}^\\circ+\\cos^{2} ${a}^\\circ=1`, "sin²α + cos²α = 1 pour tout angle α")], "1", [tx("Ici, l'angle n'est pas remarquable : pense à une formule vraie pour tous les angles.")]);
    },
    () =>
      parmi([
        () => nombre("constantes", "N", "phiCarreMoinsPhi", "\\Phi^{2}-\\Phi", [L("\\Phi^{2}-\\Phi=(\\Phi+1)-\\Phi", "Φ² = Φ + 1"), L("=1")], "1", RAISON.N("1"), [tx("Ici, utilise l'équation du nombre d'or : "), lx("\\Phi^{2}=\\Phi+1"), tx(".")], [tx("Croire qu'un calcul avec "), lx("\\Phi"), tx(" (irrationnel) donne toujours un irrationnel.")], true),
        () => nombre("constantes", "N", "phiFoisPhiMoinsUn", "\\Phi\\left(\\Phi-1\\right)", [L("\\Phi\\left(\\Phi-1\\right)=\\Phi^{2}-\\Phi", "on distribue"), L("=(\\Phi+1)-\\Phi", "Φ² = Φ + 1"), L("=1")], "1", RAISON.N("1"), [tx("Ici, distribue, puis utilise "), lx("\\Phi^{2}=\\Phi+1"), tx(".")], [tx("Croire qu'un calcul avec "), lx("\\Phi"), tx(" (irrationnel) donne toujours un irrationnel.")], true),
      ])(),
  ],
  Z: [
    () =>
      parmi([
        () => trig("Z", "cos180", "\\cos 180^\\circ", [L("\\cos 180^\\circ=-1", "valeur remarquable")], "-1", AIDE_TRIGO),
        () => trig("Z", "deuxCos120", "2\\cos 120^\\circ", [L("2\\cos 120^\\circ=2\\cdot\\left(-\\dfrac{1}{2}\\right)", "cos 120° = −1/2"), L("=-1")], "-1", AIDE_TRIGO),
        () => trig("Z", "moinsQuatreSin30", "-4\\sin 30^\\circ", [L("-4\\sin 30^\\circ=-4\\cdot\\dfrac{1}{2}", "sin 30° = 1/2"), L("=-2")], "-2", AIDE_TRIGO),
        () => trig("Z", "sixCos120", "6\\cos 120^\\circ", [L("6\\cos 120^\\circ=6\\cdot\\left(-\\dfrac{1}{2}\\right)", "cos 120° = −1/2"), L("=-3")], "-3", AIDE_TRIGO),
        () => trig("Z", "moinsTan2_60", "-\\tan^{2} 60^\\circ", [L("-\\tan^{2} 60^\\circ=-\\left(\\sqrt{3}\\right)^{2}", "tan 60° = √3"), L("=-3")], "-3", AIDE_TRIGO),
      ])(),
    () =>
      parmi([
        () => nombre("constantes", "Z", "phiMoinsPhiCarre", "\\Phi-\\Phi^{2}", [L("\\Phi-\\Phi^{2}=\\Phi-(\\Phi+1)", "Φ² = Φ + 1"), L("=-1")], "-1", RAISON.Z("-1"), [tx("Ici, utilise l'équation du nombre d'or : "), lx("\\Phi^{2}=\\Phi+1"), tx(".")], [tx("Croire qu'un calcul avec "), lx("\\Phi"), tx(" (irrationnel) donne toujours un irrationnel.")], true),
        () => nombre("constantes", "Z", "unMoinsPhiFoisPhi", "\\left(1-\\Phi\\right)\\Phi", [L("\\left(1-\\Phi\\right)\\Phi=\\Phi-\\Phi^{2}", "on distribue"), L("=\\Phi-(\\Phi+1)", "Φ² = Φ + 1"), L("=-1")], "-1", RAISON.Z("-1"), [tx("Ici, distribue, puis utilise "), lx("\\Phi^{2}=\\Phi+1"), tx(".")], [tx("Croire qu'un calcul avec "), lx("\\Phi"), tx(" (irrationnel) donne toujours un irrationnel.")], true),
      ])(),
  ],
  Q: [
    () =>
      parmi([
        () => trig("Q", "cos60", "\\cos 60^\\circ", [L("\\cos 60^\\circ=\\dfrac{1}{2}", "valeur remarquable")], "\\dfrac{1}{2}", AIDE_TRIGO),
        () => trig("Q", "sin150", "\\sin 150^\\circ", [L("\\sin 150^\\circ=\\sin 30^\\circ", "angles supplémentaires"), L("=\\dfrac{1}{2}")], "\\dfrac{1}{2}", AIDE_TRIGO),
        () => trig("Q", "cos120", "\\cos 120^\\circ", [L("\\cos 120^\\circ=-\\cos 60^\\circ", "angles supplémentaires"), L("=-\\dfrac{1}{2}")], "-\\dfrac{1}{2}", AIDE_TRIGO),
        () => trig("Q", "cos2_45", "\\cos^{2} 45^\\circ", [L("\\cos^{2} 45^\\circ=\\left(\\dfrac{\\sqrt{2}}{2}\\right)^{2}", "cos 45° = √2/2"), L("=\\dfrac{2}{4}"), L("=\\dfrac{1}{2}")], "\\dfrac{1}{2}", AIDE_TRIGO),
        () => trig("Q", "tan2_30", "\\tan^{2} 30^\\circ", [L("\\tan^{2} 30^\\circ=\\left(\\dfrac{\\sqrt{3}}{3}\\right)^{2}", "tan 30° = √3/3"), L("=\\dfrac{3}{9}"), L("=\\dfrac{1}{3}")], "\\dfrac{1}{3}", AIDE_TRIGO),
        () => trig("Q", "sin2_60", "\\sin^{2} 60^\\circ", [L("\\sin^{2} 60^\\circ=\\left(\\dfrac{\\sqrt{3}}{2}\\right)^{2}", "sin 60° = √3/2"), L("=\\dfrac{3}{4}")], "\\dfrac{3}{4}", AIDE_TRIGO),
      ])(),
    () => {
      const c = parmi([3, 5, 7]);
      return trig("Q", "multipleCos60", `${c}\\cos 60^\\circ`, [L(`${c}\\cos 60^\\circ=${c}\\cdot\\dfrac{1}{2}`, "cos 60° = 1/2"), L(`=\\dfrac{${c}}{2}`)], `\\dfrac{${c}}{2}`, AIDE_TRIGO);
    },
    () => nombre("constantes", "Q", "phiDemi", "\\dfrac{\\Phi^{2}-\\Phi}{2}", [L("\\dfrac{\\Phi^{2}-\\Phi}{2}=\\dfrac{(\\Phi+1)-\\Phi}{2}", "Φ² = Φ + 1"), L("=\\dfrac{1}{2}")], "\\dfrac{1}{2}", RAISON.Q("\\dfrac{1}{2}"), [tx("Ici, simplifie le numérateur avec "), lx("\\Phi^{2}=\\Phi+1"), tx(".")], [tx("Croire qu'un calcul avec "), lx("\\Phi"), tx(" (irrationnel) donne toujours un irrationnel.")], true),
  ],
  I: [
    () =>
      parmi([
        () => trig("I", "cos30", "\\cos 30^\\circ", [L("\\cos 30^\\circ=\\dfrac{\\sqrt{3}}{2}", "valeur remarquable")], "\\dfrac{\\sqrt{3}}{2}", AIDE_TRIGO, [tx("Croire que toutes les valeurs remarquables sont rationnelles : "), lx("\\sqrt{3}"), tx(" est irrationnel.")], raisonAbsurde("\\dfrac{\\sqrt{3}}{2}", "\\sqrt{3}", "2q")),
        () => trig("I", "sin45", "\\sin 45^\\circ", [L("\\sin 45^\\circ=\\dfrac{\\sqrt{2}}{2}", "valeur remarquable")], "\\dfrac{\\sqrt{2}}{2}", AIDE_TRIGO, [tx("Croire que toutes les valeurs remarquables sont rationnelles : "), lx("\\sqrt{2}"), tx(" est irrationnel.")], raisonAbsurde("\\dfrac{\\sqrt{2}}{2}", "\\sqrt{2}", "2q")),
        () => trig("I", "tan60", "\\tan 60^\\circ", [L("\\tan 60^\\circ=\\sqrt{3}", "valeur remarquable")], "\\sqrt{3}", AIDE_TRIGO, [tx("Croire que toutes les valeurs remarquables sont rationnelles : "), lx("\\sqrt{3}"), tx(" est irrationnel.")], [lx("\\sqrt{3}"), tx(" est irrationnel, car 3 est premier (cours, point 1) : le plus petit ensemble est "), lx("\\mathbb{R}\\setminus\\mathbb{Q}"), tx(".")]),
        () => trig("I", "tan30", "\\tan 30^\\circ", [L("\\tan 30^\\circ=\\dfrac{\\sqrt{3}}{3}", "valeur remarquable")], "\\dfrac{\\sqrt{3}}{3}", AIDE_TRIGO, [tx("Croire que toutes les valeurs remarquables sont rationnelles : "), lx("\\sqrt{3}"), tx(" est irrationnel.")], raisonAbsurde("\\dfrac{\\sqrt{3}}{3}", "\\sqrt{3}", "3q")),
      ])(),
    () =>
      parmi([
        () => nombre("constantes", "I", "pi", "\\pi", [L("\\pi=3{,}14159265\\ldots", "illimité non périodique")], "\\pi", [lx("\\pi"), tx(" est irrationnel (cours, point 2) : "), lx("3{,}14"), tx(" et "), lx("\\dfrac{22}{7}"), tx(" n'en sont que des valeurs approchées.")], [tx("Ici, la calculatrice n'affiche qu'une valeur approchée : que sais-tu de l'écriture décimale de "), lx("\\pi"), tx(" ?")], [tx("Confondre "), lx("\\pi"), tx(" avec sa valeur approchée "), lx("3{,}14"), tx(" ou "), lx("\\dfrac{22}{7}"), tx(".")], false),
        () => nombre("constantes", "I", "piSurDeux", "\\dfrac{\\pi}{2}", [L("\\pi=3{,}14159265\\ldots", "π est irrationnel")], "\\dfrac{\\pi}{2}", raisonAbsurde("\\dfrac{\\pi}{2}", "\\pi", "2q"), [tx("Ici, suppose que "), lx("\\dfrac{\\pi}{2}"), tx(" vaut un rationnel q : que vaudrait "), lx("\\pi"), tx(" ?")], [tx("Croire qu'une fraction est toujours rationnelle : ici, le numérateur "), lx("\\pi"), tx(" n'est pas un entier.")], false),
      ])(),
    () =>
      parmi([
        () => nombre("constantes", "I", "phi", "\\Phi", [L("\\Phi=\\dfrac{1+\\sqrt{5}}{2}", "nombre d'or")], "\\dfrac{1+\\sqrt{5}}{2}", raisonAbsurde("\\Phi", "\\sqrt{5}", "2q-1"), [tx("Ici, écris "), lx("\\Phi"), tx(" avec "), lx("\\sqrt{5}"), tx(".")], [tx("Confondre "), lx("\\Phi"), tx(" avec sa valeur approchée "), lx("1{,}618"), tx(".")], false),
        () => nombre("constantes", "I", "phiPlusUn", "\\Phi^{2}", [L("\\Phi^{2}=\\Phi+1", "Φ² = Φ + 1"), L("=\\dfrac{3+\\sqrt{5}}{2}")], "\\dfrac{3+\\sqrt{5}}{2}", raisonAbsurde("\\Phi^{2}", "\\sqrt{5}", "2q-3"), [tx("Ici, utilise "), lx("\\Phi^{2}=\\Phi+1"), tx(" puis "), lx("\\Phi=\\dfrac{1+\\sqrt{5}}{2}"), tx(".")], [tx("Croire que le carré d'un irrationnel est toujours rationnel : "), lx("\\Phi^{2}"), tx(" contient encore "), lx("\\sqrt{5}"), tx(".")], false),
      ])(),
  ],
};

export const GABARITS: Record<FamilleNombre, Record<EnsembleNb, Gabarit[]>> = {
  racines: RACINES,
  ecritures: ECRITURES,
  expressions: EXPRESSIONS,
  constantes: CONSTANTES,
};

/** Un nombre de la famille, de l'ensemble imposé (verdict tiré avant). */
export function tirerNombre(famille: FamilleNombre, ensemble: EnsembleNb): NombreClasse {
  return parmi(GABARITS[famille][ensemble])();
}

