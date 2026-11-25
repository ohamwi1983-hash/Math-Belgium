import type { ExerciceCM, ModeleCM, PhaseCM, RaisonCM } from "../core6e/choisirModele";
import { bornesUniforme, lambda, parametres, pBinomiale, phases, probabilite, raisonJuste, zNormale } from "../core6e/choisirModele";
import type { AideEcran, ChampEcran, DefinitionEcrans, Frag, OptionEcran } from "../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../5e-4h/ui5e/ecransTrigo.types";
import { frL } from "./nombresCombinatoireLotH2";
import { BL, nL, NL, p4L, zL } from "./textesLoisLotH2";
import { approchee, diagnostiquer, messageIllisible, piege } from "../moteur6e/verificationChoisirModele";
import { correctionDetailleeCM } from "../generateurs6e/choisirModele/corrigeDetaille";

/**
 * Couche C — textes de `6gen119` « Choisir le modèle » : situations (trois par modèle, la façon dont
 * X est obtenu est dans le texte, jamais le nom de la loi), options, champs, aides à deux niveaux,
 * réponses. Source unique de l'écran, du papier et du corrigé.
 */

type E = ExerciceCM;
type P = PhaseCM;
const t = tx;
const l = lx;

const pc = (x: number) => `${nL(x)}\\,\\%`;

export function situation(e: E): Frag[] {
  const d = e.d;
  const X = l("X");
  switch (e.variante) {
    case "binomiale":
      if (e.ctx === 0) return [t("Un questionnaire comporte "), l(`${d.n}`), t(" questions ; chacune propose quatre réponses dont une seule est juste. Un élève répond au hasard à chaque question, indépendamment des autres. On note "), X, t(" le nombre de bonnes réponses.")];
      if (e.ctx === 1) return [t("On lance "), l(`${d.n}`), t(" fois un dé équilibré à six faces. On note "), X, t(" le nombre de 6 obtenus.")];
      return [t("Un joueur de basket réussit "), l(pc(d.pc!)), t(" de ses lancers francs, et ses lancers sont indépendants. Il en tire "), l(`${d.n}`), t(". On note "), X, t(" le nombre de lancers réussis.")];
    case "hypergeometrique":
      if (e.ctx === 0) return [t("Une urne contient "), l(`${d.N}`), t(" boules, dont "), l(`${d.K}`), t(" rouges. On tire simultanément "), l(`${d.n}`), t(" boules. On note "), X, t(" le nombre de boules rouges tirées.")];
      if (e.ctx === 1) return [t("Un club compte "), l(`${d.N}`), t(" membres, dont "), l(`${d.K}`), t(" femmes. On tire au sort un comité de "), l(`${d.n}`), t(" membres différents. On note "), X, t(" le nombre de femmes du comité.")];
      return [t("Un lot de "), l(`${d.N}`), t(" pièces contient "), l(`${d.K}`), t(" pièces défectueuses. On prélève au hasard "), l(`${d.n}`), t(" pièces, sans les remettre dans le lot. On note "), X, t(" le nombre de pièces défectueuses prélevées.")];
    case "poisson":
      if (e.ctx === 0) return [t("Un standard téléphonique reçoit en moyenne "), l(`${d.r}`), t(" appels par heure ; les appels arrivent au hasard, indépendamment les uns des autres. On note "), X, t(" le nombre d'appels reçus en "), l(`${d.t}`), t(" minutes.")];
      if (e.ctx === 1) return [t("Un livre contient en moyenne "), l(`${d.r}`), t(" fautes de frappe pour "), l("10"), t(" pages, réparties au hasard. On note "), X, t(" le nombre de fautes sur "), ...(d.m === 1 ? [t("une page")] : [l(`${d.m}`), t(" pages")]), t(" prises au hasard.")];
      return [t("Une machine tombe en panne en moyenne "), l(`${d.r}`), t(" fois par an, au hasard et indépendamment d'une panne à l'autre. On note "), X, t(" le nombre de pannes "), t(d.mois === 1 ? "pendant un mois." : "pendant un trimestre (trois mois).")];
    case "normale": {
      const u = e.ctx === 0 ? "g" : e.ctx === 1 ? "cm" : "min";
      const x0 = d.mu! + (d.zc! * d.sigma!) / 100;
      const debut =
        e.ctx === 0
          ? [t("La masse des paquets de farine remplis par une machine fluctue autour de "), l(`${nL(d.mu!)}\\text{ g}`), t(", avec un écart-type de "), l(`${nL(d.sigma!)}\\text{ g}`), t(" ; l'histogramme des masses d'un grand nombre de paquets a la forme d'une cloche symétrique autour de la moyenne.")]
          : e.ctx === 1
            ? [t("La taille des garçons de 16 ans d'un pays a pour moyenne "), l(`${nL(d.mu!)}\\text{ cm}`), t(" et pour écart-type "), l(`${nL(d.sigma!)}\\text{ cm}`), t(" ; leur répartition dessine une courbe en cloche, symétrique autour de la moyenne.")]
            : [t("Sur une année, la durée du trajet d'un élève entre son domicile et l'école a pour moyenne "), l(`${nL(d.mu!)}\\text{ min}`), t(" et pour écart-type "), l(`${nL(d.sigma!)}\\text{ min}`), t(" ; l'histogramme des durées a la forme d'une cloche symétrique.")];
      return [...debut, t(" On note "), X, t(e.ctx === 0 ? " la masse d'un paquet pris au hasard." : e.ctx === 1 ? " la taille d'un garçon pris au hasard." : " la durée d'un trajet pris au hasard."), t(" "), t("On s'intéresse à "), l(`X${d.q === 1 ? "\\ge" : "\\le"} ${nL(x0)}\\text{ ${u}}`), t(".")];
    }
    case "uniforme":
      if (e.ctx === 0) return [t("Un bus passe à un arrêt toutes les "), l(`${d.T}`), t(" minutes, exactement. Un voyageur arrive à l'arrêt à un instant pris au hasard, sans connaître l'horaire. On note "), X, t(" son temps d'attente, en minutes.")];
      if (e.ctx === 1) return [t("Un train est annoncé entre 8 h "), l(`${d.a}`), t(" et 8 h "), l(`${d.b}`), t(" ; il arrive à un instant au hasard de cette plage, aucun instant n'étant plus probable qu'un autre. On note "), X, t(" le nombre de minutes écoulées après 8 h à son arrivée.")];
      return [t("On fait tourner une roue de loterie ; elle s'arrête au hasard, aucune position n'étant privilégiée. On note "), X, t(" l'angle, en degrés, entre la flèche et le repère du départ (de "), l("0"), t(" à "), l("360"), t(").")];
    case "aucune":
      if (e.ctx === 0) return [t("On lance un dé équilibré à six faces jusqu'à obtenir un 6, puis on s'arrête. On note "), X, t(" le nombre de lancers effectués.")];
      if (e.ctx === 1) return [t("On lance deux dés équilibrés à six faces et on additionne les deux résultats. On note "), X, t(" cette somme.")];
      return [t("Une urne contient "), l(`${d.R}`), t(" boules rouges et "), l(`${d.B}`), t(" boules blanches. On tire les boules une à une, sans remise, jusqu'à obtenir une boule rouge. On note "), X, t(" le nombre de tirages effectués.")];
  }
}

/** Événement demandé (« P(X=3) », « P(X\le 1) », « P(12\le X\le 20) »). */
export function evenementL(e: E): string {
  const d = e.d;
  switch (e.variante) {
    case "binomiale":
      return d.q === 1 ? "P(X\\ge 1)" : `P(X=${d.k})`;
    case "hypergeometrique":
      return `P(X=${d.k})`;
    case "poisson":
      return d.q === 1 ? "P(X\\le 1)" : `P(X=${d.k})`;
    case "normale": {
      const x0 = d.mu! + (d.zc! * d.sigma!) / 100;
      return `P(X${d.q === 1 ? "\\ge" : "\\le"} ${nL(x0)})`;
    }
    case "uniforme":
      return d.q === 0 ? `P(${d.c}\\le X\\le ${d.d})` : d.q === 1 ? `P(X\\ge ${d.c})` : `P(X\\le ${d.c})`;
    case "aucune":
      return e.ctx === 1 ? `P(X=${d.s})` : `P(X=${d.k})`;
  }
}

export const PRECISION = "Donne la valeur exacte ou arrondie au dix-millième.";

export function question(e: E): Frag[] {
  return [t("Quelle loi de probabilité suit "), l("X"), t(" ? Justifie ton choix et donne ses paramètres (si "), l("X"), t(" ne suit aucune des lois du cours, explique pourquoi). Calcule ensuite "), l(evenementL(e)), t(". "), t(PRECISION)];
}

export const consigneGenerale = (e: E): Frag[] => [...situation(e), t(" "), ...question(e)];

export function libelle(_e: E, p: P): string {
  return p === "modele" ? "Modèle" : p === "parametres" ? "Paramètres" : p === "raison" ? "Raison" : "Probabilité";
}

export const NOMS_MODELES: Record<ModeleCM, Frag[]> = {
  binomiale: [t("Loi binomiale "), l("\\mathcal{B}(n\\,;p)")],
  hypergeometrique: [t("Loi hypergéométrique")],
  poisson: [t("Loi de Poisson de paramètre "), l("\\lambda")],
  normale: [t("Loi normale "), l("\\mathcal{N}(\\mu\\,;\\sigma)")],
  uniforme: [t("Loi uniforme continue sur "), l("[a\\,;b]")],
  aucune: [t("Aucune de ces lois")],
};

export const TEXTES_RAISONS: Record<RaisonCM, string> = {
  nonFixe: "Le nombre d'épreuves n'est pas fixé à l'avance : on s'arrête au premier succès.",
  pasSucces: "X n'est ni un nombre de succès, ni un comptage d'événements, ni une mesure continue : c'est une somme de deux résultats.",
  peuEpreuves: "Il y a trop peu d'épreuves pour utiliser une loi binomiale.",
  equiprobable: "Toutes les valeurs de X sont également probables : c'est une loi uniforme.",
};

/** Raison en fragments (« X » en KaTeX). */
export function raisonFragments(r: RaisonCM): Frag[] {
  const morceaux = TEXTES_RAISONS[r].split(/\bX\b/);
  return morceaux.flatMap((m, i) => (i === 0 ? (m ? [t(m)] : []) : [l("X"), ...(m ? [t(m)] : [])]));
}

export function consigne(e: E, p: P): Frag[] {
  if (p === "modele") return [t("Quelle loi de probabilité suit "), l("X"), t(" ?")];
  if (p === "raison") return [t("Pourquoi "), l("X"), t(" ne suit-elle aucune des lois du cours ?")];
  if (p === "parametres") {
    const q: Record<ModeleCM, Frag[]> = {
      binomiale: [t("Donne les paramètres : le nombre d'épreuves "), l("n"), t(" et la probabilité "), l("p"), t(" d'un succès.")],
      hypergeometrique: [t("Donne les paramètres : la population "), l("N"), t(", le nombre "), l("K"), t(" de succès qu'elle contient, le nombre "), l("n"), t(" d'éléments tirés.")],
      poisson: [t("Donne le paramètre "), l("\\lambda"), t(", le nombre moyen d'événements sur la durée (ou le nombre de pages) de la question.")],
      normale: [t("Donne les paramètres "), l("\\mu"), t(" et "), l("\\sigma"), t(".")],
      uniforme: [t("Donne les bornes "), l("a"), t(" et "), l("b"), t(" de l'intervalle.")],
      aucune: [],
    };
    return q[e.variante];
  }
  return [t("Calcule "), l(evenementL(e)), t(". "), t(PRECISION)];
}

export function options(e: E, p: P): OptionEcran[] {
  if (p === "modele") return (["binomiale", "hypergeometrique", "poisson", "normale", "uniforme", "aucune"] as ModeleCM[]).map((m) => ({ id: m, fragments: NOMS_MODELES[m] }));
  return e.raisons.map((r) => ({ id: r, fragments: raisonFragments(r) }));
}

export function champs(e: E, p: P): ChampEcran[] {
  if (p === "parametres") {
    const c = (label: string, labelLatex: string, placeholder = "nombre"): ChampEcran => ({ label, labelLatex, placeholder });
    switch (e.variante) {
      case "binomiale":
        return [c("Nombre d'épreuves n", "n=", "entier"), c("Probabilité d'un succès p", "p=", "fraction ou décimal")];
      case "hypergeometrique":
        return [c("Population N", "N=", "entier"), c("Succès dans la population K", "K=", "entier"), c("Éléments tirés n", "n=", "entier")];
      case "poisson":
        return [c("Paramètre λ", "\\lambda=")];
      case "normale":
        return [c("Moyenne μ", "\\mu="), c("Écart-type σ", "\\sigma=")];
      default:
        return [c("Borne a", "a="), c("Borne b", "b=")];
    }
  }
  return [{ label: "Probabilité", labelLatex: "P=", placeholder: "fraction, ou quatre décimales" }];
}

/** Écriture de la loi avec ses paramètres (« \mathcal{B}(10\,;\tfrac14) », « \lambda = 2{,}5 »). */
export function loiL(e: E): string {
  const [x, y, z] = parametres(e);
  switch (e.variante) {
    case "binomiale":
      return `X\\sim${BL(e.d.n!, frL(pBinomiale(e)))}`;
    case "hypergeometrique":
      return `N=${x},\\ K=${y},\\ n=${z}`;
    case "poisson":
      return `\\lambda=${nL(lambda(e))}`;
    case "normale":
      return `X\\sim${NL(x!, y!)}`;
    case "uniforme":
      return `a=${bornesUniforme(e)[0]},\\ b=${bornesUniforme(e)[1]}`;
    case "aucune":
      return "";
  }
}

export function valeurProbaL(e: E): string {
  const p = probabilite(e);
  if (p.exacte && p.exacte.d <= 1e6) {
    const v = p.valeur;
    const ex = frL(p.exacte);
    return p.exacte.d === 1 ? ex : `${ex}\\approx ${p4L(Math.round(v * 1e4) / 1e4)}`;
  }
  return `\\approx ${p4L(Math.round((p.table ?? p.valeur) * 1e4) / 1e4)}`;
}

export function reponse(e: E, p: P): Frag[] {
  if (p === "modele") return NOMS_MODELES[e.variante];
  if (p === "raison") return raisonFragments(raisonJuste(e));
  if (p === "parametres") return [l(loiL(e))];
  const v = valeurProbaL(e);
  return [l(`${evenementL(e)}${v.startsWith("\\approx") ? "" : "="}${v}`)];
}

export const recap = reponse;

const INDICES: Record<ModeleCM, Frag[]> = {
  binomiale: [t("un nombre fixé d'épreuves identiques et indépendantes, deux issues, "), l("X"), t(" = nombre de succès")],
  hypergeometrique: [t("des tirages sans remise (ou simultanés) dans une population qui contient des succès")],
  poisson: [t("un comptage d'événements au hasard sur une durée ou une surface, connu par une moyenne, sans nombre d'épreuves fixé")],
  normale: [t("une mesure continue répartie en cloche autour de sa moyenne")],
  uniforme: [t("une mesure continue dont toutes les valeurs d'un intervalle sont également possibles")],
  aucune: [t("aucune des situations précédentes")],
};

export function aide1(e: E, p: P): AideEcran {
  if (p === "modele")
    return { texte: [t("Indices des lois du chapitre : binomiale = "), ...INDICES.binomiale, t(" ; hypergéométrique = "), ...INDICES.hypergeometrique, t(" ; Poisson = "), ...INDICES.poisson, t(" ; normale = "), ...INDICES.normale, t(" ; uniforme = "), ...INDICES.uniforme, t(".")] };
  if (p === "raison") return { texte: [t("Une loi binomiale exige un nombre d'épreuves fixé à l'avance et "), l("X"), t(" = nombre de succès ; une loi uniforme, des valeurs également probables.")] };
  if (p === "parametres") {
    if (e.variante === "poisson") return { texte: [l("\\lambda"), t(" est le nombre moyen d'événements sur l'échelle de la question : ajuste le taux donné (proportionnalité).")] };
    return { texte: [t("Relève dans l'énoncé les nombres qui définissent la loi choisie.")] };
  }
  const formules: Record<ModeleCM, string> = {
    binomiale: "P(X=k)=C_n^k\\,p^k(1-p)^{n-k}",
    hypergeometrique: "P(X=k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}",
    poisson: "P(X=k)=e^{-\\lambda}\\,\\dfrac{\\lambda^k}{k!}",
    normale: "z=\\dfrac{x-\\mu}{\\sigma}\\qquad P(X\\le x)=\\Phi(z)",
    uniforme: "P(c\\le X\\le d)=\\dfrac{d-c}{b-a}",
    aucune: "P(A\\cap B)=P(A)\\times P(B\\mid A)",
  };
  return { texte: [t("Formule du cours :")], latex: formules[e.variante] };
}

export function aide2(e: E, p: P): AideEcran | null {
  const d = e.d;
  if (p === "modele") return { texte: [t("Ici : le nombre d'épreuves est-il fixé ? Les tirages sont-ils remis ? "), l("X"), t(" compte-t-il des succès, des événements sur une durée, ou mesure-t-il une grandeur continue ?")] };
  if (p === "raison") return { texte: [t("Peut-on dire, avant de commencer, combien d'épreuves il y aura ? "), l("X"), t(" compte-t-il des succès ?")] };
  if (p === "parametres") {
    if (e.variante === "poisson") return { texte: [t("Ici : le taux est donné pour "), t(e.ctx === 0 ? "60 minutes" : e.ctx === 1 ? "10 pages" : "12 mois"), t(" ; la question porte sur "), t(e.ctx === 0 ? `${d.t} minutes` : e.ctx === 1 ? `${d.m} page${d.m! > 1 ? "s" : ""}` : `${d.mois} mois`), t(".")] };
    if (e.variante === "binomiale") return { texte: [t("Le succès est l'issue comptée par "), l("X"), t(" ; "), l("n"), t(" est le nombre de répétitions.")] };
    if (e.variante === "uniforme") return { texte: [t("Quelles sont la plus petite et la plus grande valeur possibles de "), l("X"), t(" ?")] };
    return null;
  }
  switch (e.variante) {
    case "binomiale":
      return d.q === 1 ? { texte: [t("« Au moins un » : passe par le contraire, "), l("P(X\\ge 1)=1-P(X=0)"), t(".")] } : { texte: [t("Ici "), l(`k=${d.k}`), t(".")] };
    case "poisson":
      return d.q === 1 ? { texte: [t("Ici "), l("P(X\\le 1)=P(X=0)+P(X=1)"), t(".")] } : { texte: [t("Ici "), l(`k=${d.k}`), t(".")] };
    case "normale":
      return { texte: [t("Standardise la borne, puis lis la table"), t(d.q === 1 ? " (aire à droite : 1 − Φ)." : ".")] };
    case "uniforme":
      return { texte: [t("Longueur de l'intervalle demandé divisée par la longueur de l'intervalle de "), l("X"), t(".")] };
    case "aucune":
      return e.ctx === 1 ? { texte: [t("Compte les couples de dés (sur "), l("36"), t(") qui donnent la somme demandée.")] } : { texte: [t("Écris la suite des tirages qui donne cette valeur de "), l("X"), t(" et multiplie les probabilités le long du chemin.")] };
    default:
      return null;
  }
}

export function explicationChoix(e: E, p: P): string {
  if (p === "modele") return `Ici : ${INDICES[e.variante].map((f) => f.valeur).join("").replace(/^\s+|\s+$/g, "")}.`;
  if (p === "raison") return TEXTES_RAISONS[raisonJuste(e)];
  return "";
}

export const zNormaleL = (e: E) => zL(zNormale(e));

/** `6gen119` : modèle (six options, choix jugé), paramètres ou raison, probabilité. */
export const DEFINITION_CM: DefinitionEcrans<E, P> = {
  phases,
  estChoix: (_e, p) => p === "modele" || p === "raison",
  mode: (e, p) => (p === "modele" || p === "raison" ? { type: "choix", options: options(e, p) } : { type: "champs", champs: champs(e, p) }),
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
  bonneOption: (e, p) => (p === "modele" ? e.variante : raisonJuste(e)),
  messageIllisible,
  reponseAttendue: reponse,
  recap,
  explicationChoix,
  correction: correctionDetailleeCM,
};
