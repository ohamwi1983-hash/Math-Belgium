import type { ExerciceASR, ModeleASR, PhaseASR } from "../core6e/avecSansRemise";
import { loi, PHASES_ASR, probaJuste } from "../core6e/avecSansRemise";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { egalDecL, fr, frL, frVal } from "./nombresCombinatoireLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationAvecSansRemise";
import { correctionDetailleeASR } from "../generateurs6e/avecSansRemise/corrigeDetaille";

/**
 * Couche C — textes de `6gen108` « Avec ou sans remise ? Choisir le modèle » : situation, question,
 * options, consignes, champs, aides à deux niveaux (règle du cours, puis posée pour l'instance — jamais
 * le résultat), réponses. Source unique de l'écran, du papier et du corrigé. Notation du cours :
 * 𝓑(n ; p), Cₙᵏ, P(X = k).
 */

type E = ExerciceASR;
type P = PhaseASR;
const t = tx;
const l = lx;

/** Variante de tournure (sans aléa supplémentaire : le `?code=` reste valable). */
const tournure = (e: E) => (e.N + e.K + e.n) % 2;

interface NomSucces {
  sing: string;
  plur: string;
  fem: boolean;
}
function succes(e: E): NomSucces {
  switch (e.variante) {
    case "urne":
      return { sing: "boule rouge", plur: "boules rouges", fem: true };
    case "cartes":
      return e.sorte === 0 ? { sing: "as", plur: "as", fem: false } : { sing: "cœur", plur: "cœurs", fem: false };
    case "lot":
      return { sing: "pièce défectueuse", plur: "pièces défectueuses", fem: true };
    case "classe":
      return e.modele === "binomiale" ? { sing: "jour sans devoir", plur: "jours sans devoir", fem: false } : { sing: "élève sans devoir", plur: "élèves sans devoir", fem: false };
  }
}

export function situation(e: E): Frag[] {
  const bin = e.modele === "binomiale";
  switch (e.variante) {
    case "urne":
      return [
        t("Une urne contient "), l(`${e.N}`), t(" boules : "), l(`${e.K}`), t(" rouges et "), l(`${e.N - e.K}`), t(" blanches. "),
        ...(bin
          ? [t("On tire successivement "), l(`${e.n}`), t(" boules, en remettant chaque fois la boule tirée dans l'urne avant le tirage suivant.")]
          : tournure(e) === 0
            ? [t("On tire simultanément "), l(`${e.n}`), t(" boules.")]
            : [t("On tire successivement "), l(`${e.n}`), t(" boules, sans remettre dans l'urne les boules déjà tirées.")]),
        t(" On note "), l("X"), t(" le nombre de boules rouges tirées."),
      ];
    case "cartes": {
      const sorte = e.sorte === 0 ? "as" : "cœurs";
      return [
        t("Un jeu de "), l("32"), t(" cartes contient "), l(`${e.K}`), t(` ${sorte}. `),
        ...(bin
          ? [t("On tire une carte au hasard, on la regarde, puis on la remet dans le jeu et on mélange ; on recommence jusqu'à avoir fait "), l(`${e.n}`), t(" tirages.")]
          : tournure(e) === 0
            ? [t("On distribue au hasard "), l(`${e.n}`), t(" cartes à un joueur.")]
            : [t("On tire simultanément "), l(`${e.n}`), t(" cartes du jeu.")]),
        t(" On note "), l("X"), t(` le nombre de ${sorte} obtenus.`),
      ];
    }
    case "lot":
      return [
        t("Un lot de "), l(`${e.N}`), t(" pièces contient "), l(`${e.K}`), t(" pièces défectueuses. "),
        ...(bin
          ? [t("Un contrôleur prélève une pièce au hasard, la teste, puis la remet dans le lot ; il répète l'opération "), l(`${e.n}`), t(" fois. On note "), l("X"), t(" le nombre de tests qui tombent sur une pièce défectueuse.")]
          : [t("Un contrôleur prélève au hasard "), l(`${e.n}`), t(" pièces du lot, qu'il met de côté pour les tester. On note "), l("X"), t(" le nombre de pièces défectueuses parmi elles.")]),
      ];
    case "classe":
      return [
        t("Dans une classe de "), l(`${e.N}`), t(" élèves, "), l(`${e.K}`), t(" n'ont pas fait leur devoir. "),
        ...(bin
          ? [t("Pendant "), l(`${e.n}`), t(" jours, le professeur interroge chaque jour un élève tiré au sort dans toute la classe (le même élève peut être interrogé plusieurs fois ; les devoirs ne changent pas). On note "), l("X"), t(" le nombre de jours où l'élève interrogé n'a pas fait son devoir.")]
          : [t("Le professeur tire au sort "), l(`${e.n}`), t(" élèves différents et vérifie leur devoir. On note "), l("X"), t(" le nombre d'élèves tirés qui n'ont pas fait leur devoir.")]),
      ];
  }
}

/** « P(X\ge 1) » ; « P(X=2) ». */
export function evenementL(e: E): string {
  return e.evenement === "exactement" ? `P(X=${e.j})` : e.evenement === "auMoinsUn" ? "P(X\\ge 1)" : "P(X\\le 1)";
}

/** « au moins une boule rouge », « exactement 2 as ». */
export function evenementMots(e: E): Frag[] {
  const s = succes(e);
  const un = s.fem ? "une" : "un";
  if (e.evenement === "auMoinsUn") return [t(`au moins ${un} ${s.sing}`)];
  if (e.evenement === "auPlusUn") return [t(`au plus ${un} ${s.sing}`)];
  return e.j === 1 ? [t(`exactement ${un} ${s.sing}`)] : [t("exactement "), l(`${e.j}`), t(` ${s.plur}`)];
}

export const PRECISION = "Donne la valeur exacte ou arrondie au dix-millième.";

export function question(e: E): Frag[] {
  return [t("Calcule "), l(evenementL(e)), t(", la probabilité d'obtenir "), ...evenementMots(e), t(". "), t(PRECISION)];
}

export const CONSIGNE_PAPIER = "Justifie le modèle de probabilité choisi.";

export const consigneGenerale = (e: E): Frag[] => [...situation(e), t(" "), ...question(e)];
export const phases = (): P[] => PHASES_ASR;

export function libelle(_e: E, p: P): string {
  return p === "modele" ? "Modèle" : p === "parametres" ? "Paramètres" : "Probabilité";
}

export function texteModele(m: ModeleASR): Frag[] {
  return m === "binomiale"
    ? [t("Loi binomiale "), l("\\mathcal{B}(n\\,;p)"), t(" : les tirages sont identiques et indépendants, la probabilité d'un succès ne change pas d'un tirage à l'autre.")]
    : [t("Loi hypergéométrique : les éléments tirés ne sont pas remis, la composition de la population change d'un tirage à l'autre.")];
}

export function consigne(e: E, p: P): Frag[] {
  if (p === "modele") return [t("Quelle loi de probabilité suit "), l("X"), t(" ?")];
  if (p === "parametres") return e.modele === "binomiale" ? [t("Donne les paramètres de cette loi binomiale : le nombre de tirages "), l("n"), t(" et la probabilité "), l("p"), t(" d'un succès.")] : [t("Donne les paramètres de cette loi hypergéométrique : la taille "), l("N"), t(" de la population, le nombre "), l("K"), t(" de succès qu'elle contient et le nombre "), l("n"), t(" d'éléments tirés.")];
  return [t("Calcule "), l(evenementL(e)), t(". "), t(PRECISION)];
}

export function options(e: E): OptionEcran[] {
  return e.options.map((m) => ({ id: m, fragments: texteModele(m) }));
}

export function champs(e: E, p: P): ChampEcran[] {
  if (p === "parametres")
    return e.modele === "binomiale"
      ? [
          { label: "Nombre de tirages n", labelLatex: "n=", placeholder: "entier" },
          { label: "Probabilité d'un succès p", labelLatex: "p=", placeholder: "fraction ou décimal" },
        ]
      : [
          { label: "Taille de la population N", labelLatex: "N=", placeholder: "entier" },
          { label: "Succès dans la population K", labelLatex: "K=", placeholder: "entier" },
          { label: "Éléments tirés n", labelLatex: "n=", placeholder: "entier" },
        ];
  return [{ label: "Probabilité", labelLatex: "P=", placeholder: "fraction, ou quatre décimales" }];
}

export const nomModele = (m: ModeleASR) => (m === "binomiale" ? "loi binomiale" : "loi hypergéométrique");

/** Valeur exacte et approchée : « \dfrac{3844}{4845}\approx 0{,}7934 ». */
export function valeurL(x: ReturnType<typeof probaJuste>): string {
  const v = frVal(x);
  return x.d === 1 ? `${x.n}` : `${frL(x)}${egalDecL(v)}`;
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "modele") return e.modele === "binomiale" ? [t("Loi binomiale (tirages avec remise, indépendants)")] : [t("Loi hypergéométrique (tirages sans remise)")];
  if (p === "parametres") return e.modele === "binomiale" ? [l(`n=${e.n}`), t(" et "), l(`p=${frL(fr(e.K, e.N))}`)] : [l(`N=${e.N}`), t(", "), l(`K=${e.K}`), t(" et "), l(`n=${e.n}`)];
  return [l(`${evenementL(e)}=${valeurL(probaJuste(e))}`)];
}

export const recap = reponse;

export function aide1(e: E, p: P): AideEcran {
  if (p === "modele") return { texte: [t("Relis comment se font les tirages (cours, §§ 5 et 6) : un élément tiré revient-il dans la population avant le tirage suivant ? Si oui, chaque tirage se fait dans les mêmes conditions.")] };
  if (p === "parametres") return e.modele === "binomiale" ? { texte: [t("Loi binomiale : "), l("n"), t(" = nombre de répétitions, "), l("p"), t(" = probabilité d'un succès à chaque tirage (succès : un élément de la sorte comptée par "), l("X"), t(").")] } : { texte: [t("Loi hypergéométrique : "), l("N"), t(" = nombre d'éléments de la population, "), l("K"), t(" = nombre de succès parmi eux, "), l("n"), t(" = nombre d'éléments tirés.")] };
  const formule = e.modele === "binomiale" ? "P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}" : "P(X=k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}";
  if (e.evenement === "exactement") return { texte: [t("Formule du cours :")], latex: formule };
  if (e.evenement === "auMoinsUn") return { texte: [t("« Au moins un » : passe par l'événement contraire, "), l("P(X\\ge 1)=1-P(X=0)"), t(", avec la formule du cours :")], latex: formule };
  return { texte: [t("« Au plus un » : deux cas disjoints, "), l("P(X\\le 1)=P(X=0)+P(X=1)"), t(", avec la formule du cours :")], latex: formule };
}

export function aide2(e: E, p: P): AideEcran | null {
  if (p === "modele") return { texte: [t("Ici, après le premier tirage, reste-t-il "), l(`${e.N}`), t(" éléments dont "), l(`${e.K}`), t(" succès, ou un de moins ? La probabilité d'un succès au deuxième tirage est-elle encore "), l(frL(fr(e.K, e.N))), t(" ?")] };
  if (p === "parametres") return { texte: [t("Relève dans l'énoncé : le nombre total d'éléments, combien sont des succès, et combien de tirages sont faits.")] };
  const terme = (k: number) => (e.modele === "binomiale" ? `C_{${e.n}}^{${k}}\\left(${frL(fr(e.K, e.N))}\\right)^{${k}}\\left(${frL(fr(e.N - e.K, e.N))}\\right)^{${e.n - k}}` : `\\dfrac{C_{${e.K}}^{${k}}\\,C_{${e.N - e.K}}^{${e.n - k}}}{C_{${e.N}}^{${e.n}}}`);
  if (e.evenement === "exactement") return { texte: [t("Ici :")], latex: `P(X=${e.j})=${terme(e.j)}` };
  if (e.evenement === "auMoinsUn") return { texte: [t("Ici :")], latex: `P(X\\ge 1)=1-${terme(0)}` };
  return { texte: [t("Ici, additionne :")], latex: `P(X=0)=${terme(0)}\\quad P(X=1)=${terme(1)}` };
}

export function explicationChoix(e: E, p: P): string {
  if (p !== "modele") return "";
  return e.modele === "binomiale" ? "Chaque élément tiré est remis : les tirages se font toujours dans les mêmes conditions, ils sont indépendants." : "Les éléments tirés ne sont pas remis (ou sont tirés ensemble) : la composition change d'un tirage à l'autre.";
}

/** Valeur exacte d'un terme P(X = i) (corrigé, messages). */
export const terme = (e: E, i: number) => loi(e, e.modele, i);

/** `6gen108` sur le socle d'écrans partagé : modèle (choix fermé jugé ✗ / ✓), paramètres (deux ou trois
 * champs), probabilité (un champ, trois tentatives). */
export const DEFINITION_ASR: DefinitionEcrans<E, P> = {
  phases,
  estChoix: (_e, p) => p === "modele",
  mode: (e, p) => (p === "modele" ? { type: "choix", options: options(e) } : { type: "champs", champs: champs(e, p) }),
  libelle,
  consigneGenerale,
  consigne,
  approchee,
  aide1,
  aide2,
  aidesChoixDeuxNiveaux: true,
  diagnostiquer,
  piege,
  piegeChoixRevele: true,
  bonneOption: (e) => e.modele,
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeASR,
};
