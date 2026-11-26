import { auCentime, dateT, decimalL, deuxDates, entier, eurCentT, eurT, melanger, montantL, nL, parmi, pourcentT, PRENOMS, pronom, tauxEntre } from "../finance/commun";

/**
 * `56gen23` « Quelle formule ? Reconnaître le problème financier » (5e (6h), étape 14, carte en dernier).
 * Un énoncé en contexte ; l'élève reconnaît la famille du problème, la grandeur cherchée et la formule
 * (transformée si nécessaire) — trois choix fermés, une tentative chacun, AUCUN calcul. Le TYPE (neuf
 * types du brief) est le verdict : tiré à parts égales AVANT les nombres, jamais dans la `forme` (groupe
 * à verdict). Les énoncés lèvent toute ambiguïté : « à intérêt simple » / « à intérêts composés » est dit,
 * ou la durée suit la convention du cours (au plus un an : intérêt simple).
 */

export type TypeProbleme =
  | "simple"
  | "ccValeurAcquise"
  | "ccValeurActuelle"
  | "ccTaux"
  | "ccDuree"
  | "tauxEquivalent"
  | "annuitesPlacement"
  | "annuitesValeurActuelle"
  | "mensualite";
export type Famille = "simple" | "composes" | "equivalent" | "annuites";
export type Grandeur = "capital" | "valeurAcquise" | "taux" | "duree" | "versement" | "valeurActuelle";
export type PhaseQuelleFormule = "famille" | "grandeur" | "formule";

export interface Modele {
  /** Énoncé (texte brut, nombres en clair). */
  enonce: string;
  grandeur: Grandeur;
  /** Formule juste (transformée si nécessaire), LaTeX. */
  formule: string;
  /** Formule du cours dont on part, si elle a été transformée (LaTeX). */
  depart?: string;
  /** Indice qui décide de la famille (corrigé). */
  indice: string;
  /** Données (LaTeX, justification). */
  donnees: [string, string][];
  /** Formule avec les données (sans calcul). */
  substitution: string;
}

export interface ExerciceQuelleFormule {
  type: TypeProbleme;
  modele: Modele;
  /** Trois formules leurres (LaTeX) et ordre mélangé des quatre options (rejoué par le `?code=`). */
  leurres: string[];
  ordre: number[];
}

export const FAMILLE_DU_TYPE: Record<TypeProbleme, Famille> = {
  simple: "simple",
  ccValeurAcquise: "composes",
  ccValeurActuelle: "composes",
  ccTaux: "composes",
  ccDuree: "composes",
  tauxEquivalent: "equivalent",
  annuitesPlacement: "annuites",
  annuitesValeurActuelle: "annuites",
  mensualite: "annuites",
};

/** Formules justes de tout le catalogue (réserve de leurres), par famille. */
export const FORMULES: Record<Famille, string[]> = {
  simple: ["C_t=C_0\\,(1+i\\cdot t)", "C_0=\\dfrac{I}{i\\cdot t}", "i=\\dfrac{I}{C_0\\cdot t}", "t=\\dfrac{I}{C_0\\cdot i}"],
  composes: ["C_n=C_0\\,(1+i)^n", "C_0=C_n\\,(1+i)^{-n}", "i=\\sqrt[n]{\\dfrac{C_n}{C_0}}-1", "C_0\\,(1+i)^n\\geq C", "(1+i)^n\\geq 2"],
  equivalent: ["i_{\\text{an}}=(1+i_{\\text{trim}})^4-1", "i_{\\text{mens}}=\\sqrt[12]{1+i_{\\text{an}}}-1"],
  annuites: ["V_n=a\\,\\dfrac{(1+i)^n-1}{i}", "a=\\dfrac{V_n\\cdot i}{(1+i)^n-1}", "V_0=a\\,\\dfrac{1-(1+i)^{-n}}{i}", "m=\\dfrac{C\\cdot i}{1-(1+i)^{-n}}"],
};

/** Formules qui, données en leurre, seraient encore défendables pour ce problème. */
const EQUIVALENTES: Record<string, string[]> = {
  "m=\\dfrac{C\\cdot i}{1-(1+i)^{-n}}": ["V_0=a\\,\\dfrac{1-(1+i)^{-n}}{i}"],
  "V_0=a\\,\\dfrac{1-(1+i)^{-n}}{i}": ["m=\\dfrac{C\\cdot i}{1-(1+i)^{-n}}"],
  "C_0\\,(1+i)^n\\geq C": ["(1+i)^n\\geq 2"],
  "(1+i)^n\\geq 2": ["C_0\\,(1+i)^n\\geq C"],
};

const iL = (p: number) => decimalL(p / 100);

function modeleDe(type: TypeProbleme): Modele {
  const P = parmi(PRENOMS);
  const il = pronom(P);
  const C = parmi([entier(5, 80) * 100, entier(2, 30) * 500]);
  const pA = tauxEntre(1, 5, 0.1);
  const n = entier(3, 15);
  switch (type) {
    case "simple": {
      const sous = parmi(["valeurAcquise", "capital", "taux", "duree"] as const);
      const m = entier(2, 11);
      const I = auCentime((C * pA * m) / 1200);
      if (sous === "valeurAcquise") {
        if (Math.random() < 0.5)
          return { enonce: `${P} place ${eurT(C)} à intérêt simple, au taux annuel de ${pourcentT(pA)}, pendant ${m} mois. Quelle est la valeur acquise au terme du placement ?`, grandeur: "valeurAcquise", formule: "C_t=C_0\\,(1+i\\cdot t)", indice: `un seul capital, placé à intérêt simple (${m} mois)`, donnees: [[`C_0=${montantL(C)}`, "capital placé"], [`i=${iL(pA)}`, "taux annuel"], [`t=\\dfrac{${m}}{12}`, "durée en années"]], substitution: `C_t=${montantL(C)}\\cdot\\left(1+${iL(pA)}\\cdot\\dfrac{${m}}{12}\\right)` };
        const d = deuxDates(40, 300);
        return { enonce: `Un capital de ${eurT(C)} est placé du ${dateT(d.debut)} au ${dateT(d.fin)}, au taux annuel de ${pourcentT(pA)}. De quel montant disposera-t-on à la fin du placement ?`, grandeur: "valeurAcquise", formule: "C_t=C_0\\,(1+i\\cdot t)", indice: "un seul capital, placé moins d'un an : intérêt simple (convention du cours)", donnees: [[`C_0=${montantL(C)}`, "capital placé"], [`i=${iL(pA)}`, "taux annuel"], [`t=\\dfrac{${d.jours}}{365}`, `${d.jours} jours exacts`]], substitution: `C_t=${montantL(C)}\\cdot\\left(1+${iL(pA)}\\cdot\\dfrac{${d.jours}}{365}\\right)` };
      }
      if (sous === "capital")
        return { enonce: `Un placement à intérêt simple de ${m} mois, au taux annuel de ${pourcentT(pA)}, a rapporté ${eurCentT(I)} d'intérêts. Quel capital avait été placé ?`, grandeur: "capital", formule: "C_0=\\dfrac{I}{i\\cdot t}", depart: "I=C_0\\cdot i\\cdot t", indice: `un seul capital, placé à intérêt simple (${m} mois)`, donnees: [[`I=${nL(I, 2, true)}`, "intérêt"], [`i=${iL(pA)}`, "taux annuel"], [`t=\\dfrac{${m}}{12}`, "durée en années"]], substitution: `C_0=\\dfrac{${nL(I, 2, true)}}{${iL(pA)}\\cdot\\dfrac{${m}}{12}}` };
      if (sous === "taux")
        return Math.random() < 0.5
          ? { enonce: `Un capital de ${eurT(C)}, placé pendant ${m} mois, a rapporté ${eurCentT(I)} d'intérêt simple. À quel taux annuel était-il placé ?`, grandeur: "taux", formule: "i=\\dfrac{I}{C_0\\cdot t}", depart: "I=C_0\\cdot i\\cdot t", indice: `un seul capital, intérêt simple (${m} mois)`, donnees: [[`C_0=${montantL(C)}`, "capital placé"], [`I=${nL(I, 2, true)}`, "intérêt"], [`t=\\dfrac{${m}}{12}`, "durée en années"]], substitution: `i=\\dfrac{${nL(I, 2, true)}}{${montantL(C)}\\cdot\\dfrac{${m}}{12}}` }
          : { enonce: `Pour une dépense imprévue, ${P} emprunte ${eurT(C)}. ${m} mois plus tard, ${il} rembourse ${eurCentT(C + I)}, intérêts compris. Quel est le taux annuel d'intérêt simple appliqué ?`, grandeur: "taux", formule: "i=\\dfrac{I}{C_0\\cdot t}", depart: "I=C_0\\cdot i\\cdot t", indice: `un seul capital, intérêt simple (${m} mois)`, donnees: [[`C_0=${montantL(C)}`, "montant emprunté"], [`I=${montantL(C + I)}-${montantL(C)}`, "intérêts payés"], [`t=\\dfrac{${m}}{12}`, "durée en années"]], substitution: `i=\\dfrac{${montantL(C + I)}-${montantL(C)}}{${montantL(C)}\\cdot\\dfrac{${m}}{12}}` };
      return { enonce: `Un capital de ${eurT(C)}, placé à intérêt simple au taux annuel de ${pourcentT(pA)}, a rapporté ${eurCentT(I)}. Pendant combien de temps a-t-il été placé ?`, grandeur: "duree", formule: "t=\\dfrac{I}{C_0\\cdot i}", depart: "I=C_0\\cdot i\\cdot t", indice: "un seul capital, intérêt simple", donnees: [[`C_0=${montantL(C)}`, "capital placé"], [`I=${nL(I, 2, true)}`, "intérêt"], [`i=${iL(pA)}`, "taux annuel"]], substitution: `t=\\dfrac{${nL(I, 2, true)}}{${montantL(C)}\\cdot ${iL(pA)}}` };
    }
    case "ccValeurAcquise":
      return {
        enonce: Math.random() < 0.5 ? `${P} place ${eurT(C)} à intérêts composés, au taux annuel de ${pourcentT(pA)}, pendant ${n} ans. De quel capital disposera-t-${il} au terme du placement ?` : `Un capital de ${eurT(C)} est placé pendant ${n} ans au taux annuel de ${pourcentT(pA)}, les intérêts étant ajoutés au capital à la fin de chaque année. Quelle est sa valeur acquise ?`,
        grandeur: "valeurAcquise",
        formule: "C_n=C_0\\,(1+i)^n",
        indice: `un seul capital, placé ${n} ans avec capitalisation des intérêts : intérêts composés`,
        donnees: [[`C_0=${montantL(C)}`, "capital placé"], [`i=${iL(pA)}`, "taux annuel"], [`n=${n}`, "années"]],
        substitution: `C_{${n}}=${montantL(C)}\\cdot ${decimalL(1 + pA / 100)}^{${n}}`,
      };
    case "ccValeurActuelle": {
      const S = entier(4, 60) * 500;
      return {
        enonce: Math.random() < 0.5 ? `${P} voudrait disposer de ${eurT(S)} dans ${n} ans. Combien doit-${il} placer aujourd'hui, à intérêts composés, au taux annuel de ${pourcentT(pA)} ?` : `Quelle somme faut-il placer aujourd'hui à intérêts composés, au taux annuel de ${pourcentT(pA)}, pour disposer de ${eurT(S)} dans ${n} ans ?`,
        grandeur: "capital",
        formule: "C_0=C_n\\,(1+i)^{-n}",
        depart: "C_n=C_0\\,(1+i)^n",
        indice: "un seul capital, plusieurs années, intérêts composés",
        donnees: [[`C_{${n}}=${montantL(S)}`, "montant voulu"], [`i=${iL(pA)}`, "taux annuel"], [`n=${n}`, "années"]],
        substitution: `C_0=${montantL(S)}\\cdot ${decimalL(1 + pA / 100)}^{-${n}}`,
      };
    }
    case "ccTaux": {
      const Cn = auCentime(C * Math.pow(1 + pA / 100, n));
      return {
        enonce: Math.random() < 0.5 ? `Il y a ${n} ans, ${P} a déposé ${eurT(C)} sur un compte d'épargne à intérêts composés. Aujourd'hui, le capital s'élève à ${eurCentT(Cn)}. Quel était le taux annuel de ce placement ?` : `Un capital de ${eurT(C)}, placé pendant ${n} ans à intérêts composés, a une valeur acquise de ${eurCentT(Cn)}. Quel est le taux annuel du placement ?`,
        grandeur: "taux",
        formule: "i=\\sqrt[n]{\\dfrac{C_n}{C_0}}-1",
        depart: "C_n=C_0\\,(1+i)^n",
        indice: "un seul capital, plusieurs années, intérêts composés",
        donnees: [[`C_0=${montantL(C)}`, "capital placé"], [`C_{${n}}=${nL(Cn, 2, true)}`, "valeur acquise"], [`n=${n}`, "années"]],
        substitution: `i=\\sqrt[${n}]{\\dfrac{${nL(Cn, 2, true)}}{${montantL(C)}}}-1`,
      };
    }
    case "ccDuree": {
      if (Math.random() < 0.5) {
        const S = auCentime(C * (1.2 + 0.6 * Math.random()));
        const Sr = Math.round(S / 100) * 100;
        return { enonce: `Combien d'années faut-il pour qu'un capital de ${eurT(C)}, placé à intérêts composés au taux annuel de ${pourcentT(pA)}, atteigne au moins ${eurT(Sr)} ?`, grandeur: "duree", formule: "C_0\\,(1+i)^n\\geq C", indice: "un seul capital, intérêts composés ; n en exposant : table de la calculatrice", donnees: [[`C_0=${montantL(C)}`, "capital placé"], [`i=${iL(pA)}`, "taux annuel"], [`C=${montantL(Sr)}`, "montant visé"]], substitution: `${montantL(C)}\\cdot ${decimalL(1 + pA / 100)}^{\\,n}\\geq ${montantL(Sr)}` };
      }
      const pD = tauxEntre(1.5, 6, 0.5);
      return { enonce: `Au bout de combien d'années un capital placé à intérêts composés, au taux annuel de ${pourcentT(pD)}, aura-t-il au moins doublé ?`, grandeur: "duree", formule: "(1+i)^n\\geq 2", depart: "C_0\\,(1+i)^n\\geq 2\\,C_0", indice: "un seul capital, intérêts composés ; n en exposant : table de la calculatrice", donnees: [[`i=${iL(pD)}`, "taux annuel"]], substitution: `${decimalL(1 + pD / 100)}^{\\,n}\\geq 2` };
    }
    case "tauxEquivalent":
      if (Math.random() < 0.5) {
        const q = tauxEntre(0.3, 1.6, 0.05);
        return { enonce: `Un capital est placé pendant un an au taux trimestriel de ${pourcentT(q)} (intérêts composés). À quel taux annuel faudrait-il le placer pour obtenir le même montant au bout d'un an ?`, grandeur: "taux", formule: "i_{\\text{an}}=(1+i_{\\text{trim}})^4-1", depart: "(1+i_{\\text{trim}})^4=1+i_{\\text{an}}", indice: "on change la période du taux en gardant la même valeur acquise : taux équivalents", donnees: [[`i_{\\text{trim}}=${iL(q)}`, "taux trimestriel"]], substitution: `i_{\\text{an}}=${decimalL(1 + q / 100)}^4-1` };
      }
      return { enonce: `Quel est le taux mensuel équivalent à un taux annuel de ${pourcentT(pA)} ?`, grandeur: "taux", formule: "i_{\\text{mens}}=\\sqrt[12]{1+i_{\\text{an}}}-1", depart: "(1+i_{\\text{mens}})^{12}=1+i_{\\text{an}}", indice: "on change la période du taux : taux équivalents", donnees: [[`i_{\\text{an}}=${iL(pA)}`, "taux annuel"]], substitution: `i_{\\text{mens}}=\\sqrt[12]{${decimalL(1 + pA / 100)}}-1` };
    case "annuitesPlacement": {
      const a = entier(6, 60) * 50;
      if (Math.random() < 0.5)
        return { enonce: `${P} verse ${eurT(a)} sur un compte d'épargne à la fin de chaque année, pendant ${n} ans, au taux annuel de ${pourcentT(pA)} (intérêts composés). De quel capital disposera-t-${il} juste après son dernier versement ?`, grandeur: "valeurAcquise", formule: "V_n=a\\,\\dfrac{(1+i)^n-1}{i}", indice: `plusieurs versements égaux et réguliers (${n}) : annuités`, donnees: [[`a=${montantL(a)}`, "versement"], [`i=${iL(pA)}`, "taux annuel"], [`n=${n}`, "versements"]], substitution: `V_{${n}}=${montantL(a)}\\cdot\\dfrac{${decimalL(1 + pA / 100)}^{${n}}-1}{${iL(pA)}}` };
      const S = entier(10, 100) * 500;
      return { enonce: `${P} veut constituer un capital de ${eurT(S)} en versant le même montant à la fin de chaque année, pendant ${n} ans, sur un compte rémunéré à ${pourcentT(pA)} par an ; le capital doit être disponible juste après le dernier versement. Quel montant doit-${il} verser chaque année ?`, grandeur: "versement", formule: "a=\\dfrac{V_n\\cdot i}{(1+i)^n-1}", depart: "V_n=a\\,\\dfrac{(1+i)^n-1}{i}", indice: `plusieurs versements égaux et réguliers (${n}) : annuités`, donnees: [[`V_{${n}}=${montantL(S)}`, "capital voulu"], [`i=${iL(pA)}`, "taux annuel"], [`n=${n}`, "versements"]], substitution: `a=\\dfrac{${montantL(S)}\\cdot ${iL(pA)}}{${decimalL(1 + pA / 100)}^{${n}}-1}` };
    }
    case "annuitesValeurActuelle": {
      const a = entier(10, 80) * 50;
      return {
        enonce: `Pour financer des travaux, ${P} peut rembourser ${eurT(a)} par an pendant ${n} ans, le premier remboursement ayant lieu dans un an. Au taux annuel de ${pourcentT(pA)} (intérêts composés), quel montant peut-${il} emprunter aujourd'hui ?`,
        grandeur: "valeurActuelle",
        formule: "V_0=a\\,\\dfrac{1-(1+i)^{-n}}{i}",
        indice: `plusieurs remboursements égaux (${n}), ramenés à aujourd'hui : annuités, valeur actuelle`,
        donnees: [[`a=${montantL(a)}`, "remboursement annuel"], [`i=${iL(pA)}`, "taux annuel"], [`n=${n}`, "remboursements"]],
        substitution: `V_0=${montantL(a)}\\cdot\\dfrac{1-${decimalL(1 + pA / 100)}^{-${n}}}{${iL(pA)}}`,
      };
    }
    case "mensualite": {
      const T = tauxEntre(2, 12, 0.1);
      const nm = parmi([12, 18, 24, 36, 48, 60]);
      return {
        enonce: Math.random() < 0.5 ? `${P} emprunte ${eurT(C)} au TAEG de ${pourcentT(T)}, remboursables en ${nm} mensualités constantes. Quel est le montant de chaque mensualité ?` : `Un prêt à tempérament de ${eurT(C)}, au TAEG de ${pourcentT(T)}, doit être remboursé en ${nm} mois par des mensualités constantes. Que vaut chaque mensualité ?`,
        grandeur: "versement",
        formule: "m=\\dfrac{C\\cdot i}{1-(1+i)^{-n}}",
        depart: "C=m\\,\\dfrac{1-(1+i)^{-n}}{i}",
        indice: `remboursement par ${nm} mensualités égales : annuités (mensualités), avec le taux mensuel équivalent au TAEG`,
        donnees: [[`C=${montantL(C)}`, "montant emprunté"], [`i=\\sqrt[12]{${decimalL(1 + T / 100)}}-1`, "taux mensuel équivalent au TAEG"], [`n=${nm}`, "mensualités"]],
        substitution: `m=\\dfrac{${montantL(C)}\\cdot i}{1-(1+i)^{-${nm}}}`,
      };
    }
  }
}

function construire(type: TypeProbleme): ExerciceQuelleFormule {
  const modele = modeleDe(type);
  const fam = FAMILLE_DU_TYPE[type];
  // Jamais en leurre : la formule de départ (juste avant transformation) ni une formule équivalente.
  const exclues = new Set([modele.formule, modele.depart ?? "", ...(EQUIVALENTES[modele.formule] ?? [])]);
  const memeFamille = melanger(FORMULES[fam].filter((f) => !exclues.has(f)));
  const autres = melanger((Object.keys(FORMULES) as Famille[]).filter((f) => f !== fam).flatMap((f) => FORMULES[f]).filter((f) => !exclues.has(f)));
  const leurres = [...memeFamille.slice(0, 2), ...autres].slice(0, 3);
  return { type, modele, leurres, ordre: melanger([0, 1, 2, 3]) };
}

export const CATALOGUE_VARIANTES: { id: TypeProbleme; label: string }[] = [
  { id: "simple", label: "Intérêt simple" },
  { id: "ccValeurAcquise", label: "Intérêts composés : valeur acquise" },
  { id: "ccValeurActuelle", label: "Intérêts composés : valeur actuelle" },
  { id: "ccTaux", label: "Intérêts composés : taux" },
  { id: "ccDuree", label: "Intérêts composés : durée" },
  { id: "tauxEquivalent", label: "Taux équivalent" },
  { id: "annuitesPlacement", label: "Annuités de placement" },
  { id: "annuitesValeurActuelle", label: "Valeur actuelle d'annuités" },
  { id: "mensualite", label: "Mensualité d'un crédit" },
];

export function construireAvecVarianteId(id: string): ExerciceQuelleFormule {
  const v = CATALOGUE_VARIANTES.find((c) => c.id === id)?.id ?? parmi(CATALOGUE_VARIANTES).id;
  return construire(v);
}

/** Type tiré à parts égales (un neuvième chacun) AVANT les nombres. */
export function genererExerciceQuelleFormule(): ExerciceQuelleFormule {
  return construire(parmi(CATALOGUE_VARIANTES).id);
}
