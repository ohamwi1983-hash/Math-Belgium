import type { ExerciceBinomialeA, ExerciceBinomialeSequenceOrdonnee, StrategieBinomialeA } from "../core6e/binomialeSequenceOrdonnee.types";
import type { PhaseBinomialeSequenceOrdonnee } from "../moteur6e/typesBinomialeSequenceOrdonnee";
import { resultatExact, termesExacts } from "../moteur6e/verificationBinomialeSequenceOrdonnee";
import { arrangementBig, rationnel, versNombre, vaut } from "../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../moteur6e/saisieCombinatoire";
import { arrondiLatex, decimalLatex, decimalesAffichage, f, fractionLatex, milliers, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen48` (6e ch. 7, § 6) — audit, lots B et C : succès nommé (« la flèche atteint la
 * cible »), p en décimal comme dans le cours, virgule décimale (plus « 0.21875 »), fraction exacte en
 * premier, stratégie jamais donnée par une aide (avant : l'aide 2 livrait la stratégie et les termes),
 * placeholders retirés (ils étaient les réponses dans 100 % des exercices B).
 */

type E = ExerciceBinomialeSequenceOrdonnee;
type P = PhaseBinomialeSequenceOrdonnee;

export const ANNONCE_PRECISION_48 = "Donne la valeur exacte (une fraction) ou un arrondi au millième (davantage de décimales pour une très petite probabilité).";

const OPTIONS_STRATEGIE: Record<StrategieBinomialeA, string> = {
  termeUnique: "Un seul terme : $P(X=k)$",
  somme: "Une somme de quelques termes : $P(X=k_1)+P(X=k_2)+\\ldots$",
  complement: "Le complément : $1-\\big(P(X=k_1)+\\ldots\\big)$",
};

function evenementLatex(e: ExerciceBinomialeA): string {
  switch (e.typeQuestion) {
    case "exactement":
      return `X=${e.k}`;
    case "auMoins":
      return `X\\geq ${e.k}`;
    case "auPlus":
      return `X\\leq ${e.k}`;
    case "aucun":
      return "X=0";
    case "tous":
      return `X=${e.n}`;
  }
}

function valeur(r: Rationnel): string {
  const x = versNombre(r);
  return `${fractionLatex(r)}\\approx ${arrondiLatex(x, decimalesAffichage(x))}`;
}

function termeLatex(e: ExerciceBinomialeA, k: number): string {
  return `C_{${e.n}}^{${k}}\\times ${decimalLatex(e.p)}^{${k}}\\times ${decimalLatex(1 - e.p)}^{${e.n - k}}`;
}

function sommeTermes(e: ExerciceBinomialeA): string {
  return e.termesACalculer.map((k) => `P(X=${k})`).join("+");
}

export const FORMAT_6GEN48: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    if (e.famille === "B") return [t("Tirages successifs sans remise d'objets tous différents : la probabilité d'une séquence précise est un produit de fractions. "), t(ANNONCE_PRECISION_48)];
    return [...f("Loi binomiale : $P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}$. "), t(ANNONCE_PRECISION_48)];
  },
  donnees(e): FragmentConsigne[][] {
    if (e.famille === "B") return [[t(e.contexte.texte)], [t(`Il y a ${e.n} objets ; on en tire ${e.k}, et l'on veut obtenir un objet précis à chaque tirage, dans un ordre donné.`)]];
    return [[t(e.contexte.texte)], f(`On note $X$ le nombre de fois où ${e.contexte.labelSucces}. On cherche $P(${evenementLatex(e)})$.`)];
  },
  consigneEcran(e, p) {
    if (e.famille === "B") return p === "bEcran1" ? [t("Quelle est la probabilité de tirer l'objet voulu à chaque tirage (sachant que les précédents ont été réussis) ?")] : [t("Quelle est la probabilité d'obtenir toute la séquence ?")];
    if (p === "aStrategie") return f(`Quelle est la stratégie la plus courte pour calculer $P(${evenementLatex(e)})$ ?`);
    if (p === "aTermes") return f("Quelles valeurs de $k$ faut-il utiliser dans cette stratégie ? Sépare-les par des points-virgules.");
    if (p === "aValeurs") return [t("Calcule chaque terme.")];
    return f(`Déduis-en $P(${evenementLatex(e)})$.`);
  },
  champs(e, p): ChampCombi[] {
    if (e.famille === "B") {
      if (p === "bEcran1") return e.denominateurs.map((_, i) => ({ type: "texte", label: i === 0 ? "1ᵉʳ tirage" : `${i + 1}ᵉ tirage` }));
      return [{ type: "texte", label: "Probabilité de la séquence", apercu: true }];
    }
    if (p === "aStrategie") return [{ type: "choix", label: "", options: (Object.keys(OPTIONS_STRATEGIE) as StrategieBinomialeA[]).map((v) => ({ valeur: v, label: OPTIONS_STRATEGIE[v] })) }];
    if (p === "aTermes") return [{ type: "texte", label: "Valeurs de $k$", placeholder: "a ; b ; c" }];
    if (p === "aValeurs") return e.termesACalculer.map((k) => ({ type: "texte", label: `$P(X=${k})$`, apercu: true }));
    return [{ type: "texte", label: `$P(${evenementLatex(e)})$`, apercu: true }];
  },
  aides(e, p) {
    if (e.famille === "B") {
      if (p === "bEcran1") return [{ texte: "Sans remise, il reste un objet de moins à chaque tirage, et un seul est le bon." }, { texte: `Premier tirage : ${e.n} objets ; deuxième : ${e.n - 1}…` }];
      return [{ texte: "Règle du produit : on multiplie les probabilités des tirages successifs." }, { texte: "Multiplie les fractions de l'écran précédent." }];
    }
    if (p === "aStrategie") return [{ texte: "« Exactement », « aucun », « tous » : un seul terme. « Au moins », « au plus » : une somme, ou 1 moins la somme des termes de l'événement contraire — on choisit le calcul qui a le moins de termes." }, { texte: `$X$ prend les valeurs de 0 à ${e.n} : compte les termes de l'événement, puis ceux de son contraire.` }];
    if (p === "aTermes") return [{ texte: "L'événement contraire de « au moins $k$ » est « au plus $k-1$ » ; celui de « au plus $k$ » est « au moins $k+1$ »." }, { texte: `Liste les valeurs de $X$ (de 0 à ${e.n}) dont tu as besoin pour la stratégie choisie.` }];
    if (p === "aValeurs") return [{ texte: "Pour chaque $k$ :", latex: "P(X=k)=C_n^k\\,p^k\\,(1-p)^{n-k}" }, { texte: `Ici $n=${e.n}$, $p=${decimalLatex(e.p)}$ et $1-p=${decimalLatex(1 - e.p)}$.` }];
    return [{ texte: e.strategie === "complement" ? "Le complément : $P(A)=1-P(\\overline{A})$." : "Les événements $X=k$ sont incompatibles : on additionne leurs probabilités." }, { texte: "Utilise les termes de l'écran précédent." }];
  },
  reponseAttendue(e, p) {
    if (e.famille === "B") {
      if (p === "bEcran1") return [e.denominateurs.map((d) => `\\dfrac{1}{${d}}`).join("\\;;\\;")];
      return [valeur(rationnel(1n, arrangementBig(e.n, e.k)))];
    }
    if (p === "aStrategie") return [e.strategie === "termeUnique" ? "\\text{un seul terme}" : e.strategie === "somme" ? "\\text{une somme}" : "\\text{le complément}"];
    if (p === "aTermes") return [`k\\in\\{${e.termesACalculer.join("\\,;\\,")}\\}`];
    if (p === "aValeurs") return termesExacts(e).map((r, i) => `P(X=${e.termesACalculer[i]})=${valeur(r)}`);
    return [valeur(resultatExact(e))];
  },
  explication(e, p) {
    if (e.famille === "B") {
      if (p === "bEcran1") return [f(`À chaque tirage, un seul objet convient parmi ceux qui restent : $${e.denominateurs.map((d) => `\\dfrac{1}{${d}}`).join(",\\ ")}$.`)];
      return [f(`$${e.denominateurs.map((d) => `\\dfrac{1}{${d}}`).join("\\times ")}=\\dfrac{1}{${milliers(arrangementBig(e.n, e.k))}}$ (et non $\\dfrac{1}{${e.n}^{${e.k}}}$, qui serait avec remise).`)];
    }
    if (p === "aStrategie") {
      const comp = e.n + 1 - e.termesACalculer.length;
      return [f(e.strategie === "termeUnique" ? "L'événement correspond à une seule valeur de $X$ : un seul terme." : e.strategie === "somme" ? `L'événement compte ${e.termesACalculer.length} valeurs de $X$, son contraire ${comp} : la somme est plus courte.` : `L'événement compte ${comp} valeurs de $X$, son contraire seulement ${e.termesACalculer.length} : le complément est plus court.`)];
    }
    if (p === "aTermes") return [f(`$k\\in\\{${e.termesACalculer.join("\\,;\\,")}\\}$${e.strategie === "complement" ? " (valeurs de l'événement contraire)" : ""}.`)];
    if (p === "aValeurs") return termesExacts(e).map((r, i) => f(`$P(X=${e.termesACalculer[i]})=${termeLatex(e, e.termesACalculer[i])}=${valeur(r)}$`));
    return [f(e.strategie === "complement" ? `$P(${evenementLatex(e)})=1-(${sommeTermes(e)})=${valeur(resultatExact(e))}$.` : e.strategie === "somme" ? `$P(${evenementLatex(e)})=${sommeTermes(e)}=${valeur(resultatExact(e))}$.` : `$${valeur(resultatExact(e))}$.`)];
  },
  libellePhase(e, p) {
    if (e.famille === "B") return p === "bEcran1" ? "Chaque tirage" : "Séquence";
    return p === "aStrategie" ? "Stratégie" : p === "aTermes" ? "Valeurs de k" : p === "aValeurs" ? "Termes" : "Résultat";
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[valeurs.length - 1] ?? "";
    if (e.famille === "B") {
      if (p === "bEcran2" && vaut(v, rationnel(1n, BigInt(e.n) ** BigInt(e.k)))) return [t("C'est la probabilité avec remise : sans remise, il reste un objet de moins à chaque tirage.")];
      return null;
    }
    if (p === "aValeurs") {
      for (let i = 0; i < e.termesACalculer.length; i++) {
        const k = e.termesACalculer[i];
        const sansC = rationnel(BigInt(Math.round(e.p * 10)) ** BigInt(k) * BigInt(10 - Math.round(e.p * 10)) ** BigInt(e.n - k), 10n ** BigInt(e.n));
        if (vaut(valeurs[i] ?? "", sansC) && e.termesACalculer.length > 0 && !(k === 0 || k === e.n)) return f("Il manque le coefficient $C_n^k$ : il compte les ordres possibles des succès.");
      }
      return null;
    }
    if (p === "aResultat" && e.strategie === "complement") {
      const somme = termesExacts(e).reduce((a, r) => rationnel(a.n * r.d + r.n * a.d, a.d * r.d), rationnel(0));
      if (vaut(v, somme)) return [t("C'est la probabilité de l'événement contraire : retire-la de 1.")];
    }
    return null;
  },
};
