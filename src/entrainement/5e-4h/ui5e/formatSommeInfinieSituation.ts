import { chiffresPeriodique, divise, donnees, moins, partieFixe, UN, unite, valeur } from "../core5e/sommeInfinieSituation.types";
import type { ExercicePeriodique, ExerciceRebonds, ExerciceSommeInfinie, ExerciceZenon, Frac } from "../core5e/sommeInfinieSituation.types";
import type { PhaseSommeInfinie } from "../moteur5e/typesSommeInfinieSituation";

/**
 * Couche C (5e) — textes de `5gen48` « Somme infinie en situation ». SOURCE UNIQUE des consignes,
 * champs, aides et réponses attendues : l'écran, le récapitulatif et l'adaptateur de feuilles
 * (`generateurs5e/sommeInfinieSituation/exportEvaluation.ts`) en dérivent.
 *
 * Notations du cours (chapitre 3 de 5e, section « Convergence ») : S∞ = u₁/(1 − q), seulement si
 * |q| < 1. Virgule décimale, jamais de prose dans le mode math ; aides = phrase terminée par « : »
 * puis la formule, sans la réponse finale (il reste toujours un calcul).
 */

export type FragmentConsigne = { type: "texte"; valeur: string } | { type: "latex"; valeur: string };

export interface ChampDef {
  label: string;
  labelLatex?: string;
  placeholder: string;
}

export interface AideAvecLatex {
  texte: string;
  latex?: string;
}

const t = (valeur: string): FragmentConsigne => ({ type: "texte", valeur });
const l = (valeur: string): FragmentConsigne => ({ type: "latex", valeur });

// ============================================================================
// Écriture des nombres.
// ============================================================================

/** Écriture décimale d'une fraction dont le dénominateur divise 10⁸, `null` sinon. */
function decimale(f: Frac): string | null {
  for (let d = 0; d <= 8; d++) {
    if ((f.num * 10 ** d) % f.den === 0) {
      const n = Math.abs((f.num * 10 ** d) / f.den);
      const s = String(n).padStart(d + 1, "0");
      const ent = s.slice(0, s.length - d);
      const dec = s.slice(s.length - d);
      const groupe = ent.length >= 5 ? ent.replace(/\B(?=(\d{3})+(?!\d))/g, "\\,") : ent;
      return `${f.num < 0 ? "-" : ""}${groupe}${dec ? `{,}${dec}` : ""}`;
    }
  }
  return null;
}

/** Fraction en LaTeX (entier si dénominateur 1). `petit` : \frac (dans une fraction). */
export function fracLatex(f: Frac, petit = false): string {
  if (f.den === 1) return String(f.num);
  return `${f.num < 0 ? "-" : ""}\\${petit ? "frac" : "dfrac"}{${Math.abs(f.num)}}{${f.den}}`;
}

/** Nombre en LaTeX : écriture décimale si elle est finie et courte (≤ 6 décimales), sinon fraction. */
export function nbLatex(f: Frac, petit = false): string {
  const d = decimale(f);
  if (d !== null && (d.split("{,}")[1] ?? "").length <= 6) return d;
  return fracLatex(f, petit);
}

/** Écriture décimale puis fractionnaire quand elles diffèrent (« 0,03 = 3/100 »). */
function nbEtFraction(f: Frac): string {
  const d = nbLatex(f);
  return f.den === 1 || d.startsWith("\\") || d.startsWith("-\\") ? d : `${d}=${fracLatex(f)}`;
}

function majuscule(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function nbTexte(x: number): string {
  return String(x).replace(".", ",");
}

/** Unité en fin de phrase (« 108 cm. »), ou simple point. */
function finUnite(e: ExerciceSommeInfinie): FragmentConsigne {
  const u = unite(e);
  return t(u ? ` ${u}.` : ".");
}

/** Écriture décimale du nombre périodique : x = 1,2333… */
export function nombrePeriodiqueLatex(e: ExercicePeriodique): string {
  return `${e.entier}{,}${chiffresPeriodique(e)}\\ldots`;
}

// ============================================================================
// Contextes.
// ============================================================================

const FRACTION_MOT: Record<number, string> = { 2: "de la moitié", 3: "du tiers", 4: "du quart", 5: "du cinquième", 10: "du dixième" };

interface Personnages {
  poursuivant: string;
  poursuivantMaj: string;
  poursuivi: string;
  dePoursuivi: string;
  poursuiviMaj: string;
}

function personnages(e: ExerciceZenon): Personnages {
  switch (e.contexte) {
    case "achille":
      return { poursuivant: "Achille", poursuivantMaj: "Achille", poursuivi: "la tortue", dePoursuivi: "de la tortue", poursuiviMaj: "La tortue" };
    case "chien":
      return { poursuivant: "le chien", poursuivantMaj: "Le chien", poursuivi: "le maître", dePoursuivi: "du maître", poursuiviMaj: "Le maître" };
    case "cycliste":
      return { poursuivant: "le cycliste", poursuivantMaj: "Le cycliste", poursuivi: "le piéton", dePoursuivi: "du piéton", poursuiviMaj: "Le piéton" };
  }
}

function objetRebonds(e: ExerciceRebonds): { nom: string; il: string; lache: string } {
  switch (e.objet) {
    case "balle":
      return { nom: "la balle", il: "elle", lache: `On lâche une balle d'une hauteur de ${nbTexte(e.hauteur)} cm.` };
    case "bille":
      return { nom: "la bille", il: "elle", lache: `On lâche une bille en caoutchouc d'une hauteur de ${nbTexte(e.hauteur)} cm.` };
    case "ballon":
      return { nom: "le ballon", il: "il", lache: `On lâche un ballon du haut d'un mur de ${nbTexte(e.hauteur)} m.` };
  }
}

const SOMME = "S_\\infty=u_1+u_2+u_3+\\ldots";

// ============================================================================
// Consigne générale, question finale, écrans.
// ============================================================================

export function consigneGenerale(e: ExerciceSommeInfinie): FragmentConsigne[] {
  switch (e.variante) {
    case "periodique": {
      const ou = e.sousCas === "pur" ? "juste après la virgule" : `après « ${e.entier},${e.avant} »`;
      return [
        t("On considère le nombre "),
        l(`x=${nombrePeriodiqueLatex(e)}`),
        t(`, dont le bloc de chiffres « ${e.periode} » se répète indéfiniment ${ou}. Pour l'écrire sous forme de fraction, on écrit la partie qui se répète comme la somme infinie `),
        l(SOMME),
        t(` d'une suite géométrique (uₙ) : chaque terme est un bloc « ${e.periode} » écrit à sa place, les autres chiffres étant remplacés par des zéros.`),
      ];
    }
    case "rebonds": {
      const o = objetRebonds(e);
      return [
        t(`${o.lache} À chaque rebond, ${o.il} remonte à ${e.pourcent} % de la hauteur d'où ${o.il} vient de tomber. On suppose qu'${o.il} rebondit indéfiniment. On note uₙ la hauteur (en ${e.unite}) atteinte après le n-ième rebond.`),
      ];
    }
    case "zenon": {
      const p = personnages(e);
      const fraction = FRACTION_MOT[e.k];
      const debut =
        e.contexte === "achille"
          ? `Achille poursuit une tortue qui a ${e.avance} m d'avance ; il court ${e.k} fois plus vite qu'elle.`
          : e.contexte === "chien"
            ? `Un chien s'élance pour rejoindre son maître, qui marche ${e.avance} m devant lui ; le chien court ${e.k} fois plus vite que son maître.`
            : `Un cycliste veut rattraper un piéton parti ${e.avance} m devant lui ; il roule ${e.k} fois plus vite que le piéton.`;
      return [
        t(
          `${debut} Comme Zénon, on découpe la poursuite en étapes. Pendant la 1re étape, ${p.poursuivant} parcourt les ${e.avance} m qui le séparent du point de départ ${p.dePoursuivi} ; pendant ce temps, ${p.poursuivi} avance ${fraction} de cette distance. Pendant chaque étape suivante, ${p.poursuivant} parcourt la distance qui reste jusqu'à l'endroit où se trouvait ${p.poursuivi}, et ${p.poursuivi} avance encore ${fraction} de cette distance. On note uₙ la distance (en m) parcourue par ${p.poursuivi} pendant l'étape n.`,
        ),
      ];
    }
    case "figures":
      if (e.sousCas === "triangle") {
        return [
          t(
            `Un triangle équilatéral a une aire de ${e.aire} cm². En joignant les milieux de ses côtés, on le partage en quatre triangles équilatéraux identiques et on colorie celui du centre. On recommence dans le triangle du haut, puis dans le triangle du haut de celui-ci, et ainsi de suite indéfiniment (voir la figure). On note uₙ l'aire (en cm²) du n-ième triangle colorié.`,
          ),
        ];
      }
      return [
        t(`Un hexagone régulier a une aire de ${e.aire} cm². En joignant les milieux de ses côtés, on obtient un nouvel hexagone régulier, dont l'aire vaut les `),
        l("\\dfrac{3}{4}"),
        t(
          " de celle du précédent ; on recommence indéfiniment. On colorie une couronne sur deux : celle comprise entre le 1er et le 2e hexagone, puis celle entre le 3e et le 4e, puis entre le 5e et le 6e, et ainsi de suite (voir la figure). On note uₙ l'aire (en cm²) de la n-ième couronne coloriée.",
        ),
      ];
  }
}

/** La question du problème (dernier écran, et demande de l'énoncé papier). */
export function questionFinale(e: ExerciceSommeInfinie): FragmentConsigne[] {
  switch (e.variante) {
    case "periodique":
      return [t("Écris "), l("x"), t(" sous forme de fraction irréductible.")];
    case "rebonds":
      return [t(`Quelle distance totale (descentes et remontées) ${objetRebonds(e).nom} parcourt-${objetRebonds(e).il} ? Donne-la en ${e.unite}.`)];
    case "zenon": {
      const p = personnages(e);
      return [t(`À quelle distance de son point de départ ${p.poursuivant} rattrape-t-il ${p.poursuivi} ? Donne-la en m.`)];
    }
    case "figures":
      return [t(`Quelle aire du ${e.sousCas === "triangle" ? "grand triangle" : "premier hexagone"} reste non coloriée ? Donne-la en cm².`)];
  }
}

export function libellePhase(phase: PhaseSommeInfinie): string {
  switch (phase) {
    case "premierTerme":
      return "Premier terme";
    case "raison":
      return "Raison";
    case "sommeInfinie":
      return "Somme infinie";
    case "reponse":
      return "Réponse au problème";
  }
}

/** Libellé du récapitulatif, avec l'unité du contexte. */
export function libelleRecap(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): string {
  const u = unite(e);
  if (phase === "raison" || !u) return libellePhase(phase);
  return `${libellePhase(phase)} (${u})`;
}

function premierTermeDecrit(e: ExerciceSommeInfinie): string {
  switch (e.variante) {
    case "periodique":
      return `, le premier bloc « ${e.periode} » écrit à sa place`;
    case "rebonds":
      return `, la hauteur atteinte après le premier rebond (en ${e.unite})`;
    case "zenon":
      return `, la distance parcourue par ${personnages(e).poursuivi} pendant la 1re étape (en m)`;
    case "figures":
      return e.sousCas === "triangle" ? ", l'aire du premier triangle colorié (en cm²)" : ", l'aire de la première couronne coloriée (en cm²)";
  }
}

export function consigneEcran(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): FragmentConsigne[] {
  switch (phase) {
    case "premierTerme":
      return [t("Calcule "), l("u_1"), t(`${premierTermeDecrit(e)}.`)];
    case "raison":
      return [t("Quelle est la raison "), l("q"), t(" de la suite géométrique "), l("(u_n)"), t(" ?")];
    case "sommeInfinie": {
      const u = unite(e);
      return [t("Justifie que la somme infinie "), l(SOMME), t(" existe ("), l("|q|<1"), t(`), puis calcule sa valeur exacte${u ? ` (en ${u})` : ""}.`)];
    }
    case "reponse":
      return questionFinale(e);
  }
}

export function champsEcran(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): ChampDef[] {
  const u = unite(e);
  switch (phase) {
    case "premierTerme":
      return [{ label: "u1", labelLatex: "u_1=", placeholder: u ? `valeur en ${u}` : "ex. 0,05 ou 5/100" }];
    case "raison":
      return [{ label: "q", labelLatex: "q=", placeholder: "ex. 1/10 ou 0,1" }];
    case "sommeInfinie":
      return [{ label: "S∞", labelLatex: "S_\\infty=", placeholder: u ? `valeur exacte en ${u}` : "valeur exacte (fraction)" }];
    case "reponse":
      switch (e.variante) {
        case "periodique":
          return [{ label: "x", labelLatex: "x=", placeholder: "fraction irréductible" }];
        case "rebonds":
        case "zenon":
          return [{ label: `Distance (${u})`, placeholder: `distance en ${u}` }];
        case "figures":
          return [{ label: "Aire non coloriée (cm²)", placeholder: "aire en cm²" }];
      }
  }
}

// ============================================================================
// Réponses attendues.
// ============================================================================

/** Somme infinie « brute » d'un nombre périodique : période / (10^(non périodique) × 99…9). */
function sommeBrutePeriodique(e: ExercicePeriodique): { num: number; den: number } {
  return { num: Number(e.periode), den: 10 ** e.avant.length * (10 ** e.periode.length - 1) };
}

/** Justification de |q| < 1 (fragments, sans point final). */
export function conditionFragments(e: ExerciceSommeInfinie): FragmentConsigne[] {
  return [t("Comme "), l(`|q|=${fracLatex(donnees(e).q)}<1`), t(", la somme infinie existe")];
}

/** S∞ = u₁/(1 − q) substituée puis calculée. */
export function calculSommeLatex(e: ExerciceSommeInfinie): string {
  const d = donnees(e);
  const unMoinsQ = moins(UN, d.q);
  const inverse = divise(UN, unMoinsQ);
  let brute = "";
  if (e.variante === "periodique") {
    const b = sommeBrutePeriodique(e);
    if (b.den !== d.sInfini.den) brute = `=\\dfrac{${b.num}}{${b.den}}`;
  }
  return `S_\\infty=\\dfrac{u_1}{1-q}=\\dfrac{${nbLatex(d.u1, true)}}{1-${fracLatex(d.q, true)}}=\\dfrac{${nbLatex(d.u1, true)}}{${fracLatex(unMoinsQ, true)}}=${nbLatex(d.u1)}\\times ${fracLatex(inverse)}${brute}=${nbLatex(d.sInfini)}`;
}

export function reponseFragments(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): FragmentConsigne[] {
  const d = donnees(e);
  switch (phase) {
    case "premierTerme":
      switch (e.variante) {
        case "periodique":
          return [l(`u_1=${nbEtFraction(d.u1)}`), t(".")];
        case "rebonds":
          return [l(`u_1=\\dfrac{${e.pourcent}}{100}\\times ${nbTexte(e.hauteur).replace(",", "{,}")}=${nbLatex(d.u1)}`), finUnite(e)];
        case "zenon":
          return [l(`u_1=\\dfrac{${e.avance}}{${e.k}}=${nbLatex(d.u1)}`), finUnite(e)];
        case "figures":
          if (e.sousCas === "triangle") return [l(`u_1=\\dfrac{${e.aire}}{4}=${nbLatex(d.u1)}`), finUnite(e)];
          return [l(`u_1=${e.aire}-\\dfrac{3}{4}\\times ${e.aire}=${e.aire}-${(3 * e.aire) / 4}=${nbLatex(d.u1)}`), finUnite(e)];
      }
      return [];
    case "raison":
      switch (e.variante) {
        case "periodique":
          return [l(`q=\\dfrac{u_2}{u_1}=\\dfrac{${nbLatex(d.u2, true)}}{${nbLatex(d.u1, true)}}=${fracLatex(d.q)}`), t(".")];
        case "rebonds":
          return [l(`q=\\dfrac{${e.pourcent}}{100}=${fracLatex(d.q)}`), t(".")];
        case "zenon":
          return [t(`Chaque étape ${personnages(e).dePoursuivi} est ${e.k} fois plus courte que la précédente : `), l(`q=${fracLatex(d.q)}`), t(".")];
        case "figures":
          if (e.sousCas === "triangle") return [t("Chaque triangle colorié a une aire 4 fois plus petite que le précédent : "), l(`q=${fracLatex(d.q)}`), t(".")];
          return [t("Entre deux couronnes coloriées, on passe deux fois à l'hexagone suivant : "), l("q=\\dfrac{3}{4}\\times\\dfrac{3}{4}=\\dfrac{9}{16}"), t(".")];
      }
      return [];
    case "sommeInfinie":
      return [...conditionFragments(e), t(" : "), l(calculSommeLatex(e)), finUnite(e)];
    case "reponse":
      return reponseFinaleFragments(e);
  }
}

function reponseFinaleFragments(e: ExerciceSommeInfinie): FragmentConsigne[] {
  const d = donnees(e);
  switch (e.variante) {
    case "periodique": {
      const fixe = partieFixe(e);
      if (valeur(fixe) === 0) return [l(`x=S_\\infty=${fracLatex(d.reponse)}`), t(".")];
      return [l(`x=${nbLatex(fixe)}+${fracLatex(d.sInfini)}=${fracLatex(fixe)}+${fracLatex(d.sInfini)}=${fracLatex(d.reponse)}`), t(".")];
    }
    case "rebonds":
      return [
        t("Distance totale (une chute, puis chaque remontée et la descente qui la suit) : "),
        l(`${nbTexte(e.hauteur).replace(",", "{,}")}+2\\times ${nbLatex(d.sInfini)}=${nbLatex(d.reponse)}`),
        finUnite(e),
      ];
    case "zenon": {
      const p = personnages(e);
      return [t(`${p.poursuivantMaj} parcourt l'avance de départ plus tout le chemin fait par ${p.poursuivi} : `), l(`${e.avance}+${nbLatex(d.sInfini)}=${nbLatex(d.reponse)}`), finUnite(e)];
    }
    case "figures":
      return [t("Aire non coloriée : "), l(`${e.aire}-${nbLatex(d.sInfini)}=${nbLatex(d.reponse)}`), finUnite(e)];
  }
}

/** Valeur confirmée (récapitulatif « Ce qu'on sait déjà », réponse brève). */
export function reponseRecap(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): string {
  const d = donnees(e);
  switch (phase) {
    case "premierTerme":
      return `u_1=${nbLatex(d.u1)}`;
    case "raison":
      return `q=${fracLatex(d.q)}`;
    case "sommeInfinie":
      return `S_\\infty=${nbLatex(d.sInfini)}`;
    case "reponse":
      return e.variante === "periodique" ? `x=${fracLatex(d.reponse)}` : nbLatex(d.reponse);
  }
}

// ============================================================================
// Aides (deux niveaux, jamais la réponse finale).
// ============================================================================

export function aideNiveau1(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): AideAvecLatex {
  switch (phase) {
    case "premierTerme":
      switch (e.variante) {
        case "periodique":
          return e.sousCas === "pur"
            ? e.entier === 0
              ? { texte: `Découpe les décimales en blocs « ${e.periode} » ; chaque bloc donne un terme :`, latex: `${nombrePeriodiqueLatex(e)}=u_1+u_2+u_3+\\ldots` }
              : { texte: `Sépare la partie entière, puis découpe les décimales en blocs « ${e.periode} » ; chaque bloc donne un terme :`, latex: `${nombrePeriodiqueLatex(e)}=${e.entier}+u_1+u_2+\\ldots` }
            : { texte: `Sépare la partie qui ne se répète pas, puis découpe la suite en blocs « ${e.periode} » ; chaque bloc donne un terme :`, latex: `${nombrePeriodiqueLatex(e)}=${nbLatex(partieFixe(e))}+u_1+u_2+\\ldots` };
        case "rebonds":
          return { texte: `Remonter à ${e.pourcent} % d'une hauteur, c'est la multiplier par :`, latex: `\\dfrac{${e.pourcent}}{100}` };
        case "zenon":
          return { texte: `Pendant la 1re étape, ${personnages(e).poursuivant} parcourt l'avance de départ d₀ ; ${personnages(e).poursuivi} va ${e.k} fois moins vite, donc parcourt ${e.k} fois moins :`, latex: `u_1=\\dfrac{d_0}{${e.k}}` };
        case "figures":
          return e.sousCas === "triangle"
            ? { texte: "Les quatre petits triangles sont identiques : le triangle colorié occupe une part de l'aire du grand triangle égale à :", latex: "\\dfrac{1}{4}" }
            : { texte: "La 1re couronne est ce qui reste du 1er hexagone quand on en retire le 2e :", latex: "u_1=A_1-A_2" };
      }
      return { texte: "" };
    case "raison":
      if (e.variante === "figures" && e.sousCas === "hexagones") return { texte: "D'une couronne coloriée à la suivante, on saute un hexagone : l'aire est multipliée deux fois par le rapport entre deux hexagones consécutifs :", latex: "\\dfrac{3}{4}" };
      return { texte: "La raison est le quotient d'un terme par le terme précédent :", latex: "q=\\dfrac{u_2}{u_1}" };
    case "sommeInfinie":
      return { texte: "Vérifie d'abord la condition sur la raison ; si elle est remplie, applique la formule de la somme infinie :", latex: "|q|<1\\ \\Rightarrow\\ S_\\infty=\\dfrac{u_1}{1-q}" };
    case "reponse":
      switch (e.variante) {
        case "periodique":
          return valeur(partieFixe(e)) === 0
            ? { texte: "Ici, x est exactement la somme infinie : écris-la comme une fraction, puis simplifie-la en divisant le numérateur et le dénominateur par leur PGCD :", latex: "x=S_\\infty" }
            : { texte: "Le nombre est la partie qui ne se répète pas PLUS la somme infinie ; mets tout au même dénominateur, puis simplifie :", latex: `x=${nbLatex(partieFixe(e))}+S_\\infty` };
        case "rebonds":
          return { texte: `${majuscule(objetRebonds(e).nom)} tombe une fois de la hauteur de départ h, puis chaque remontée est suivie d'une descente de même longueur :`, latex: "D=h+2\\,S_\\infty" };
        case "zenon":
          return { texte: `${personnages(e).poursuivantMaj} rejoint ${personnages(e).poursuivi} à l'endroit atteint au bout de toutes les étapes : à l'avance de départ d₀ s'ajoute tout le chemin parcouru par ${personnages(e).poursuivi} :`, latex: "D=d_0+S_\\infty" };
        case "figures":
          return { texte: "L'aire non coloriée est l'aire de la figure de départ moins l'aire coloriée totale :", latex: `${e.aire}-S_\\infty` };
      }
  }
}

export function aideNiveau2(e: ExerciceSommeInfinie, phase: PhaseSommeInfinie): AideAvecLatex {
  const d = donnees(e);
  switch (phase) {
    case "premierTerme":
      switch (e.variante) {
        case "periodique":
          return { texte: "Le deuxième terme, par exemple, vaut :", latex: `u_2=${nbLatex(d.u2)}` };
        case "rebonds":
          return { texte: `La première chute part de ${nbTexte(e.hauteur)} ${e.unite} ; calcule :`, latex: `u_1=\\dfrac{${e.pourcent}}{100}\\times ${nbTexte(e.hauteur).replace(",", "{,}")}` };
        case "zenon":
          return { texte: "Avec les données :", latex: `u_1=\\dfrac{${e.avance}}{${e.k}}` };
        case "figures":
          return e.sousCas === "triangle" ? { texte: "Avec les données :", latex: `u_1=\\dfrac{${e.aire}}{4}` } : { texte: "Avec les données :", latex: `u_1=${e.aire}-\\dfrac{3}{4}\\times ${e.aire}` };
      }
      return { texte: "" };
    case "raison":
      switch (e.variante) {
        case "periodique":
          return { texte: "Avec les deux premiers blocs :", latex: `q=\\dfrac{${nbLatex(d.u2, true)}}{${nbLatex(d.u1, true)}}` };
        case "rebonds":
          return { texte: "Chaque hauteur atteinte est le même pourcentage de la précédente :", latex: `u_2=\\dfrac{${e.pourcent}}{100}\\times u_1` };
        case "zenon":
          return { texte: `La distance que ${personnages(e).poursuivant} parcourt à l'étape 2 est celle que ${personnages(e).poursuivi} a parcourue à l'étape 1 ; ${personnages(e).poursuivi} en fait ${e.k} fois moins :`, latex: `u_2=\\dfrac{u_1}{${e.k}}` };
        case "figures":
          return e.sousCas === "triangle"
            ? { texte: "Le 2e triangle colorié est le triangle central du triangle du haut, lui-même 4 fois plus petit que le grand triangle :", latex: `u_2=\\dfrac{1}{4}\\times\\dfrac{${e.aire}}{4}` }
            : { texte: "Calcule le produit :", latex: "q=\\dfrac{3}{4}\\times\\dfrac{3}{4}" };
      }
      return { texte: "" };
    case "sommeInfinie":
      return { texte: "Ici, la condition est remplie ; remplace u₁ et q dans la formule :", latex: `|q|=${fracLatex(d.q)}<1\\qquad S_\\infty=\\dfrac{${nbLatex(d.u1, true)}}{1-${fracLatex(d.q, true)}}` };
    case "reponse":
      switch (e.variante) {
        case "periodique": {
          const fixe = partieFixe(e);
          if (valeur(fixe) === 0) {
            const b = sommeBrutePeriodique(e);
            return { texte: "Fraction à simplifier :", latex: `x=\\dfrac{${b.num}}{${b.den}}` };
          }
          return { texte: "Avec la partie fixe écrite en fraction :", latex: `x=${fracLatex(fixe)}+${fracLatex(d.sInfini)}` };
        }
        case "rebonds":
          return { texte: "Avec les valeurs trouvées :", latex: `D=${nbTexte(e.hauteur).replace(",", "{,}")}+2\\times ${nbLatex(d.sInfini)}` };
        case "zenon":
          return { texte: "Avec les valeurs trouvées :", latex: `D=${e.avance}+${nbLatex(d.sInfini)}` };
        case "figures":
          return { texte: "Avec la somme trouvée :", latex: `${e.aire}-${nbLatex(d.sInfini)}` };
      }
  }
}


