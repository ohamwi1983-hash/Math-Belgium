/**
 * Lecture d'une combinaison de vecteurs nommés par DEUX POINTS (gen130 « Chasles sans figure ») :
 * « AB − CB + 2CD », « 2(AB + BC) − AC », « 2/3 AB », « AB/2 », « 0 », « vec(AB) », « \vec{AB} »,
 * « →AB ». Les points sont des lettres majuscules (une minuscule est relue en majuscule). Signes
 * « − – — » lus comme « - », multiplication « * », « × », « · » ou implicite.
 *
 * Le calcul se fait sur les POINTS : un vecteur XY vaut Y − X (relation de Chasles), donc deux
 * expressions sont égales pour TOUS les points exactement quand elles donnent les mêmes
 * coefficients de points. Une hypothèse (I milieu de [AB] : I = ½A + ½B) se traite en remplaçant le
 * point par sa combinaison avant de comparer.
 *
 * `null` = illisible (syntaxe, vecteur à une ou trois lettres) : jamais une tentative comptée. Un
 * point qui n'appartient pas à l'exercice est LISIBLE (réponse fausse ciblée).
 */

export interface TermeVecteur {
  /** Coefficient (signe compris). */
  k: number;
  /** Origine et extrémité ; « 0 » pour le vecteur nul (`de === vers === ""`). */
  de: string;
  vers: string;
}

export type CoefficientsPoints = Record<string, number>;

type Jeton = { t: "nb"; v: number } | { t: "vec"; de: string; vers: string } | { t: "zero" } | { t: "op"; v: "+" | "-" | "*" | "/" | "(" | ")" };

/** Nettoyage : notations de vecteur retirées, signes et multiplications normalisés. */
function normaliser(saisie: string): string {
  return saisie
    .replace(/[−–—]/g, "-")
    .replace(/[×·⋅]/g, "*")
    .replace(/\\vec\s*\{\s*([^{}]*)\}/g, "$1")
    .replace(/\\overrightarrow\s*\{\s*([^{}]*)\}/g, "$1")
    .replace(/\\vec\s*([A-Za-z0-9]{1,2})/g, "$1")
    .replace(/vec\s*\(\s*([^()]*)\)/gi, "$1")
    .replace(/vec\s*\{\s*([^{}]*)\}/gi, "$1")
    .replace(/\bvec\s*/gi, "")
    .replace(/[→⃗]/g, "")
    .replace(/\\[dt]?frac\{(\d+)\}\{(\d+)\}/g, "($1/$2)")
    .replace(/\\cdot/g, "*")
    .replace(/,/g, ".")
    .replace(/\s+/g, "");
}

function jetons(s: string): Jeton[] | null {
  const sortie: Jeton[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i]!;
    if (/[0-9.]/.test(c)) {
      let j = i;
      while (j < s.length && /[0-9.]/.test(s[j]!)) j++;
      const texte = s.slice(i, j);
      if (!/^\d+(\.\d+)?$|^\.\d+$/.test(texte)) return null;
      const v = Number(texte);
      // « 0 » seul (pas suivi d'un vecteur ni d'une parenthèse) = vecteur nul.
      const suivant = s[j];
      if (v === 0 && (suivant === undefined || /[+\-)]/.test(suivant)) && (sortie.length === 0 || sortie[sortie.length - 1]!.t === "op")) {
        const prec = sortie[sortie.length - 1];
        if (!prec || (prec.t === "op" && (prec.v === "+" || prec.v === "-" || prec.v === "("))) {
          sortie.push({ t: "zero" });
          i = j;
          continue;
        }
      }
      sortie.push({ t: "nb", v });
      i = j;
      continue;
    }
    if (/[A-Za-z]/.test(c)) {
      let j = i;
      while (j < s.length && /[A-Za-z]/.test(s[j]!)) j++;
      const lettres = s.slice(i, j).toUpperCase();
      if (lettres.length !== 2) return null;
      sortie.push({ t: "vec", de: lettres[0]!, vers: lettres[1]! });
      i = j;
      continue;
    }
    if ("+-*/()".includes(c)) {
      sortie.push({ t: "op", v: c as "+" });
      i++;
      continue;
    }
    return null;
  }
  return sortie;
}

/** Analyse descendante : somme de termes ; terme = facteurs (nombres, fractions, vecteur ou
 * parenthèse) ; au plus UN vecteur (ou une parenthèse vectorielle) par terme. */
class Analyseur {
  private p = 0;
  private readonly js: Jeton[];
  constructor(js: Jeton[]) {
    this.js = js;
  }

  fini(): boolean {
    return this.p >= this.js.length;
  }

  private voir(): Jeton | undefined {
    return this.js[this.p];
  }

  private estOp(v: string): boolean {
    const j = this.voir();
    return !!j && j.t === "op" && j.v === v;
  }

  somme(): TermeVecteur[] | null {
    const resultat: TermeVecteur[] = [];
    let signe = 1;
    if (this.estOp("+")) this.p++;
    else if (this.estOp("-")) {
      signe = -1;
      this.p++;
    }
    for (;;) {
      const t = this.terme();
      if (!t) return null;
      for (const x of t) resultat.push({ ...x, k: x.k * signe });
      if (this.estOp("+")) {
        signe = 1;
        this.p++;
      } else if (this.estOp("-")) {
        signe = -1;
        this.p++;
      } else return resultat;
    }
  }

  /** Un nombre (éventuellement « a/b »). */
  private nombre(): number | null {
    const j = this.voir();
    if (!j || j.t !== "nb") return null;
    this.p++;
    let v = j.v;
    if (this.estOp("/")) {
      const k = this.js[this.p + 1];
      if (k && k.t === "nb") {
        this.p += 2;
        if (k.v === 0) return null;
        v /= k.v;
      }
    }
    return v;
  }

  private terme(): TermeVecteur[] | null {
    let coef = 1;
    let vecteurs: TermeVecteur[] | null = null;
    let auMoinsUn = false;
    for (;;) {
      const j = this.voir();
      if (!j) break;
      if (j.t === "nb") {
        const v = this.nombre();
        if (v === null) return null;
        coef *= v;
      } else if (j.t === "vec" || j.t === "zero") {
        if (vecteurs) return null; // deux vecteurs multipliés : illisible
        this.p++;
        vecteurs = j.t === "vec" ? [{ k: 1, de: j.de, vers: j.vers }] : [{ k: 1, de: "", vers: "" }];
      } else if (j.t === "op" && j.v === "(") {
        this.p++;
        // Parenthèse : un nombre « (2/3) » ou une somme vectorielle « (AB + BC) ».
        const debut = this.p;
        const v = this.nombre();
        if (v !== null && this.estOp(")")) {
          this.p++;
          coef *= v;
        } else {
          this.p = debut;
          if (vecteurs) return null;
          const s = this.somme();
          if (!s || !this.estOp(")")) return null;
          this.p++;
          vecteurs = s;
        }
      } else if (j.t === "op" && j.v === "*") {
        if (!auMoinsUn) return null;
        this.p++;
        continue;
      } else if (j.t === "op" && j.v === "/") {
        // « AB/2 » : division d'un facteur déjà lu.
        const k = this.js[this.p + 1];
        if (!auMoinsUn || !k || k.t !== "nb" || k.v === 0) return null;
        this.p += 2;
        coef /= k.v;
      } else break;
      auMoinsUn = true;
    }
    if (!vecteurs) return null; // un nombre seul n'est pas un vecteur
    return vecteurs.map((x) => ({ ...x, k: x.k * coef }));
  }
}

/** Termes écrits (dans l'ordre), ou `null` si la saisie est illisible. */
export function lireTermes(saisie: string): TermeVecteur[] | null {
  const s = normaliser(saisie);
  if (s === "") return null;
  const js = jetons(s);
  if (!js || js.length === 0) return null;
  const a = new Analyseur(js);
  const r = a.somme();
  if (!r || !a.fini()) return null;
  return r;
}

/** Coefficients de points : XY vaut Y − X. */
export function coefficientsPoints(termes: TermeVecteur[]): CoefficientsPoints {
  const c: CoefficientsPoints = {};
  for (const t of termes) {
    if (t.de === "" && t.vers === "") continue;
    c[t.vers] = (c[t.vers] ?? 0) + t.k;
    c[t.de] = (c[t.de] ?? 0) - t.k;
  }
  return c;
}

/** Remplace des points par une combinaison d'autres points (hypothèses : milieu, point défini). */
export function substituer(c: CoefficientsPoints, hypotheses: Record<string, CoefficientsPoints>): CoefficientsPoints {
  const r: CoefficientsPoints = {};
  for (const [p, k] of Object.entries(c)) {
    const h = hypotheses[p];
    if (h) for (const [q, w] of Object.entries(h)) r[q] = (r[q] ?? 0) + k * w;
    else r[p] = (r[p] ?? 0) + k;
  }
  return r;
}

export function egales(a: CoefficientsPoints, b: CoefficientsPoints): boolean {
  const cles = new Set([...Object.keys(a), ...Object.keys(b)]);
  for (const p of cles) if (Math.abs((a[p] ?? 0) - (b[p] ?? 0)) > 1e-9) return false;
  return true;
}

export const estNulle = (c: CoefficientsPoints) => egales(c, {});

/** Termes regroupés : même vecteur nommé additionné, vecteur nul et coefficients nuls retirés ;
 * XX (vecteur nul écrit avec deux fois le même point) aussi retiré. */
export function termesReduits(termes: TermeVecteur[]): TermeVecteur[] {
  const m = new Map<string, TermeVecteur>();
  for (const t of termes) {
    if (t.de === t.vers) continue;
    const cle = `${t.de}${t.vers}`;
    const x = m.get(cle);
    if (x) x.k += t.k;
    else m.set(cle, { ...t });
  }
  return [...m.values()].filter((t) => Math.abs(t.k) > 1e-12);
}

/** Points cités par l'expression. */
export function pointsCites(termes: TermeVecteur[]): string[] {
  return [...new Set(termes.flatMap((t) => (t.de === "" ? [] : [t.de, t.vers])))];
}

// ---------------------------------------------------------------------------------------------
// Écritures LaTeX
// ---------------------------------------------------------------------------------------------

function coefL(k: number): string {
  const a = Math.abs(k);
  if (Math.abs(a - 1) < 1e-12) return "";
  if (Number.isInteger(a)) return String(a);
  for (let d = 2; d <= 60; d++) {
    const n = a * d;
    if (Math.abs(n - Math.round(n)) < 1e-9) return `\\dfrac{${Math.round(n)}}{${d}}`;
  }
  return String(Math.round(a * 1000) / 1000).replace(".", "{,}");
}

/** « 2\vec{AB}-\vec{CB} », « \vec{0} ». */
export function termesLatex(termes: TermeVecteur[]): string {
  if (termes.length === 0) return "\\vec{0}";
  return termes
    .map((t, i) => {
      const corps = t.de === "" ? "\\vec{0}" : `\\vec{${t.de}${t.vers}}`;
      const signe = t.k < 0 ? "-" : i === 0 ? "" : "+";
      return `${signe}${coefL(t.k)}${corps}`;
    })
    .join("");
}

/** Aperçu KaTeX d'une saisie (null si illisible). */
export function saisieLatex(saisie: string): string | null {
  const t = lireTermes(saisie);
  return t ? termesLatex(t) : null;
}
