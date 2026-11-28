import type { FragmentConsigne, LigneCalcul } from "../../export/genererFeuilleExercices";
import { decouperLigneCalcul, latex, texte } from "../../export/corrigeTableau";

const t = texte;

/**
 * Briques communes des corrigés détaillés « comme au tableau » du chapitre 4 de 6e (« Intégrales et
 * primitives »), seconde moitié des générateurs : 6gen77–84 (règle `.claude/rules/feuilles-evaluations.md`,
 * « Corrigé détaillé — comme au tableau »). SANS dépendance à `docx` : importé par les adaptateurs
 * papier ET par les générateurs interactifs (étape échouée).
 */

/** Renvois aux sections du chapitre « Intégrales et primitives » (numéros `number` du contenu). */
export const COURS_PRIMITIVES = "(cours, point 1)";
export const COURS_CONDITION_INITIALE = "(cours, point 2)";
export const COURS_INTEGRALES = "(cours, point 3)";
export const COURS_AIRES = "(cours, point 4)";
export const COURS_VOLUMES = "(cours, point 5)";
export const COURS_PROBLEMES = "(cours, point 7)";

/** Formules séparées par un texte (« ; » par défaut) : listes de résultats d'une étape. */
export function listeFormules(formules: string[], separateur = " ; "): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(separateur), latex(x)]));
}

/** Formules énumérées « A, B et C ». */
export function listeEt(formules: string[]): FragmentConsigne[] {
  return formules.flatMap((x, i) => (i === 0 ? [latex(x)] : [texte(i === formules.length - 1 ? " et " : ", "), latex(x)]));
}

/** Intégrale en style texte (pour une ligne de calcul qui en additionne plusieurs, sans `\displaystyle`). */
export function integraleTexte(borneInf: number | string, borneSup: number | string, integrande = "f(x)", variable = "x"): string {
  return `\\int_{${borneInf}}^{${borneSup}} ${integrande}\\,d${variable}`;
}

/** Primitive évaluée entre deux bornes : `\left[F(x)\right]_{a}^{b}`. */
export function crochet(primitive: string, borneInf: number | string, borneSup: number | string): string {
  return `\\left[${primitive}\\right]_{${borneInf}}^{${borneSup}}`;
}

/** Nombre entre parenthèses s'il commence par un signe moins (dans une somme ou un produit). */
export function parSigne(x: string): string {
  return x.trim().startsWith("-") ? `(${x})` : x;
}

/** Texte : « − » typographique à la place du trait d'union devant un nombre ou une lettre. */
export function moinsTexte(x: number | string): string {
  return `${x}`.replace(/-/g, "−");
}

/** Somme de termes LaTeX déjà écrits : « a+b-c » (un terme qui commence par « - » est soustrait). */
export function sommeTermes(termes: string[]): string {
  return termes
    .filter((t) => t !== "")
    .map((t, i) => (i === 0 ? t : t.startsWith("-") ? t : `+${t}`))
    .join("");
}

// ============================================================================
// Justification rédigée → lignes de calcul (6gen79, 6gen84).
// ============================================================================

const CONNECTEURS = /^(et|donc|soit|ou|c'est-à-dire|ainsi|alors|avec|comme)$/i;

/** Nettoie les fragments qui précèdent une relation pour en faire une justification. */
function nettoyer(fr: FragmentConsigne[]): FragmentConsigne[] | undefined {
  const res = fr.map((x) => ({ ...x }));
  // début : ponctuation et connecteurs
  while (res.length && res[0]!.type === "texte") {
    const v = res[0]!.valeur.replace(/^[\s,;:.]+/, "");
    if (v === "") res.shift();
    else {
      res[0] = { type: "texte", valeur: v };
      break;
    }
  }
  // fin : ponctuation et connecteurs finaux (« , donc », « c'est-à-dire »)
  while (res.length && res[res.length - 1]!.type === "texte") {
    let v = res[res.length - 1]!.valeur.replace(/[\s,;:.]+$/, "");
    v = v.replace(/[\s,;:]*\b(donc|soit|c'est-à-dire|et|alors)$/i, "").replace(/[\s,;:]+$/, "");
    if (v === "") res.pop();
    else {
      res[res.length - 1] = { type: "texte", valeur: v };
      break;
    }
  }
  if (res.length === 0) return undefined;
  if (res.length === 1 && res[0]!.type === "texte" && CONNECTEURS.test(res[0]!.valeur.trim())) return undefined;
  if (res.length === 1 && res[0]!.type === "texte") {
    const v = res[0]!.valeur.trim();
    return [{ type: "texte", valeur: v.charAt(0).toLowerCase() + v.slice(1) }];
  }
  return res;
}

/** Complète la justification de la dernière ligne. */
function ajouterALaFin(lignes: LigneCalcul[], fr: FragmentConsigne[]): void {
  const der = lignes[lignes.length - 1]!;
  const avant: FragmentConsigne[] = der.justification === undefined ? [] : typeof der.justification === "string" ? [t(der.justification)] : der.justification;
  lignes[lignes.length - 1] = { latex: der.latex, justification: [...avant, ...(avant.length ? [t(", ")] : []), ...fr] };
}

/** Éclate une justification rédigée : chaque formule qui porte une relation devient une ligne. */
export function lignesDepuisJustification(justification: FragmentConsigne[]): LigneCalcul[] {
  const lignes: LigneCalcul[] = [];
  let tampon: FragmentConsigne[] = [];
  for (const x of justification) {
    if (x.type === "latex" && decouperLigneCalcul(x.valeur).droite !== null) {
      // « pour x ≤ 0 et … », « sur [0 ; 3] et … » juste après une relation : la condition appartient à la ligne précédente
      if (lignes.length && tampon[0]?.type === "texte") {
        const m = /^\s*((?:pour|sur) [^.,;]*?)(\.\s+|\s+et\s+|[,;]\s*|\.?\s*$)/.exec(tampon[0].valeur);
        const surFormule = /^\s*sur\s*$/.test(tampon[0].valeur) && tampon[1]?.type === "latex";
        if (surFormule) {
          ajouterALaFin(lignes, [t("sur "), tampon[1]!]);
          tampon = tampon.slice(2);
          if (tampon[0]?.type === "texte") tampon[0] = t(tampon[0].valeur.replace(/^\s*(et|,|;|\.)\s*/, ""));
        } else if (m) {
          ajouterALaFin(lignes, [t(m[1]!)]);
          const reste = tampon[0].valeur.slice(m[0].length);
          tampon = reste ? [t(reste), ...tampon.slice(1)] : tampon.slice(1);
        }
      }
      // « … car A = B », « définie pour x < 0 » : la formule justifie la ligne précédente
      const texteTampon = tampon.filter((y) => y.type === "texte").map((y) => y.valeur).join("");
      if (lignes.length && /\b(car|puisque|pour|sur)\s*$/.test(texteTampon)) {
        const avant = tampon.map((y) => (y.type === "texte" ? { ...y, valeur: y.valeur.replace(/^[\s,;:.]+/, "") } : y)).filter((y) => !(y.type === "texte" && y.valeur === ""));
        ajouterALaFin(lignes, [...avant, x]);
        tampon = [];
        continue;
      }
      const j = nettoyer(tampon);
      lignes.push(j ? { latex: x.valeur, justification: j } : { latex: x.valeur });
      tampon = [];
    } else tampon.push(x);
  }
  // texte final : sans la ponctuation seule ni une unité (« u.a. », « m/s ») qui suit le résultat
  const fin = nettoyer(tampon.filter((x) => !(x.type === "texte" && /^[\s.]*$|^\s*(u\.a|u\.v|m\/s|cm|mm|L)\.?\s*$/.test(x.valeur))));
  if (fin && lignes.length) ajouterALaFin(lignes, fin);
  return lignes;
}
