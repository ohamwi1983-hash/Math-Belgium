import type { ExerciceEsperanceA, ExerciceVariablesDiscretesEsperance, PredicatA } from "../core6e/variablesDiscretesEsperance.types";
import { indicesPredicat } from "../generateurs6e/variablesDiscretesEsperance/familleA";
import { esperanceB, loiB } from "../generateurs6e/variablesDiscretesEsperance/familleB";
import { esperanceBruteC, esperanceNetteC } from "../generateurs6e/variablesDiscretesEsperance/familleC";
import { probabiliteEvenementA } from "../moteur6e/verificationVariablesDiscretesEsperance";
import type { PhaseVariablesDiscretesEsperance } from "../moteur6e/typesVariablesDiscretesEsperance";
import { versNombre } from "../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../moteur6e/saisieCombinatoire";
import { vautEnviron } from "../moteur6e/saisieVariablesAleatoires";
import { arrondiLatex, decimalLatex, f, fractionLatex, m, t } from "./fragmentsCombinatoire";
import type { ChampCombi, FormatCombinatoire, FragmentConsigne } from "./fragmentsCombinatoire";

/**
 * Textes de `6gen49` (6e ch. 8, § 1) — audit, lots B et C : virgule décimale partout (plus
 * « 0.21875 »), X toujours défini, aucune donnée découpée en formules centrées (prose avec KaTeX en
 * ligne ; la loi de A est un vrai tableau, `TableauLoi`), aucun exemple de champ, aides à deux niveaux
 * qui ne donnent jamais la réponse (avant : l'aide 2 de C affichait E, réponse de l'écran), conclusion
 * du jeu demandée.
 */

type E = ExerciceVariablesDiscretesEsperance;
type P = PhaseVariablesDiscretesEsperance;

export const ANNONCE_PROBABILITES_49 = "Donne les probabilités sous forme exacte (fraction ou décimal) ou arrondies au millième.";
const ANNONCE_ESPERANCE_49 = "Espérance : valeur exacte ou arrondie au centième.";

/** Condition d'un événement, en fragments (« $X\leq 3$ », « $X$ est pair »). */
export function predicatFragments(p: PredicatA): FragmentConsigne[] {
  switch (p.t) {
    case "le":
      return [m(`X\\leq ${p.k}`)];
    case "lt":
      return [m(`X<${p.k}`)];
    case "ge":
      return [m(`X\\geq ${p.k}`)];
    case "gt":
      return [m(`X>${p.k}`)];
    case "eq":
      return [m(`X=${p.k}`)];
    case "ne":
      return [m(`X\\neq ${p.k}`)];
    case "pair":
      return [m("X"), t(" est pair")];
    case "impair":
      return [m("X"), t(" est impair")];
    case "entre":
      return [m(`${p.a}\\leq X\\leq ${p.b}`)];
    case "hors":
      return [m(`X<${p.a}`), t(" ou "), m(`X>${p.b}`)];
  }
}

function evenementsA(e: ExerciceEsperanceA): FragmentConsigne[] {
  return [t("On considère les événements "), m("E_1"), t(" : « "), ...predicatFragments(e.e1), t(" » et "), m("E_2"), t(" : « "), ...predicatFragments(e.e2), t(" ».")];
}

function probaLatex(r: Rationnel): string {
  const x = versNombre(r);
  const dec = Number(x.toFixed(6));
  if (Math.abs(dec - x) < 1e-12) return decimalLatex(x);
  return `${fractionLatex(r)}\\approx ${arrondiLatex(x, 3)}`;
}

function valeurLatex(r: Rationnel, d = 2): string {
  const x = versNombre(r);
  if (Math.abs(Number(x.toFixed(6)) - x) < 1e-12) return decimalLatex(x);
  return `${fractionLatex(r)}\\approx ${arrondiLatex(x, d)}`;
}

function euros(x: number): string {
  return `${decimalLatex(x)}\\text{ euros}`;
}

function eurosTexte(x: number): string {
  return `${x.toFixed(Number.isInteger(x) ? 0 : 2).replace(".", ",")} €`;
}

function listeValeursLatex(e: ExerciceEsperanceA, indices: number[]): string {
  return `\\{${indices.map((i) => e.xs[i]).join("\\,;\\,")}\\}`;
}

function sommeTermesA(e: ExerciceEsperanceA, indices: number[]): string {
  return indices.map((i) => decimalLatex(e.poids[i] / 20)).join("+");
}

/** Ensembles voisins (symbole large / strict confondu) d'un prédicat, pour un message ciblé. */
function voisinsStrictLarge(p: PredicatA, xs: number[]): number[][] {
  const v: PredicatA[] = [];
  if (p.t === "le") v.push({ t: "lt", k: p.k });
  if (p.t === "lt") v.push({ t: "le", k: p.k });
  if (p.t === "ge") v.push({ t: "gt", k: p.k });
  if (p.t === "gt") v.push({ t: "ge", k: p.k });
  return v.map((q) => indicesPredicat(q, xs));
}

const OPTIONS_STATUT = [
  { valeur: "favorable", label: "favorable au joueur" },
  { valeur: "defavorable", label: "défavorable au joueur" },
  { valeur: "equitable", label: "équitable" },
];

function libelleStatut(s: string): string {
  return s === "favorable" ? "favorable au joueur" : s === "defavorable" ? "défavorable au joueur" : "équitable";
}

export const FORMAT_6GEN49: FormatCombinatoire<E, P> = {
  consigneGenerale(e) {
    if (e.famille === "A") return [t("La loi de probabilité de "), m("X"), t(" est donnée dans le tableau. "), t(ANNONCE_PROBABILITES_49)];
    if (e.famille === "B") return [t("On note "), m("X"), t(` ${e.definitionX}. Construis la loi de `), m("X"), t(", puis calcule son espérance. "), t(ANNONCE_PROBABILITES_49), t(" "), t(ANNONCE_ESPERANCE_49)];
    if (e.sousType === "verifier") return [t("On note "), m("X"), t(" le gain net du joueur (montant reçu moins la mise), en euros. Valeurs exactes ou arrondies au centième.")];
    return [t("On note "), m("G"), t(" le montant reçu par le joueur (avant de retirer la mise), en euros. Valeurs exactes ou arrondies au centième.")];
  },
  donnees(e): FragmentConsigne[][] {
    if (e.famille === "A") return [evenementsA(e)];
    if (e.famille === "B") return [[t(e.texte)]];
    if (e.sousType === "verifier") return [[t(e.texte)], [t(`La mise est de ${eurosTexte(e.mise)}.`)]];
    return [[t(e.texte)]];
  },
  consigneEcran(e, p) {
    switch (p) {
      case "aP1":
        return [t("Calcule "), m("P(E_1)"), t(".")];
      case "aP2":
        return [t("Calcule "), m("P(E_2)"), t(".")];
      case "aContraires":
        return [t("Les événements "), m("E_1"), t(" et "), m("E_2"), t(" sont-ils contraires ?")];
      case "bLoi":
        return [t("Complète la loi de "), m("X"), t(" : donne la probabilité de chaque valeur possible.")];
      case "bEsperance":
        return [t("Calcule l'espérance "), m("E(X)"), t(".")];
      case "cEsperanceNette":
        return [t("Calcule l'espérance "), m("E(X)"), t(" du gain net.")];
      case "cConclusion":
        return [t("Pour le joueur, ce jeu est…")];
      case "cEsperanceBrute":
        return [t("Calcule l'espérance "), m("E(G)"), t(" du montant reçu.")];
      case "cMise":
        return [t("Quelle mise "), m("m"), t(" rend le jeu équitable ?")];
      case "cJugerMise":
        return e.famille === "C" ? [t(`L'organisateur fixe finalement la mise à ${eurosTexte(e.mise)}. Pour le joueur, le jeu est alors…`)] : [];
    }
  },
  champs(e, p): ChampCombi[] {
    switch (p) {
      case "aP1":
        return [{ type: "texte", label: "$P(E_1)$" }];
      case "aP2":
        return [{ type: "texte", label: "$P(E_2)$" }];
      case "aContraires":
        return [
          {
            type: "choix",
            label: "",
            options: [
              { valeur: "oui", label: "Oui, ils sont contraires" },
              { valeur: "non", label: "Non, ils ne sont pas contraires" },
            ],
          },
        ];
      case "bLoi":
        return e.famille === "B" ? loiB(e).map((l) => ({ type: "texte", label: `$P(X=${l.valeur < 0 ? `-${-l.valeur}` : l.valeur})$` })) : [];
      case "bEsperance":
      case "cEsperanceNette":
        return [{ type: "texte", label: "$E(X)$" }];
      case "cEsperanceBrute":
        return [{ type: "texte", label: "$E(G)$" }];
      case "cMise":
        return [{ type: "texte", label: "Mise $m$ (en €)" }];
      case "cConclusion":
      case "cJugerMise":
        return [{ type: "choix", label: "", options: OPTIONS_STATUT }];
    }
  },
  aides(e, p) {
    switch (p) {
      case "aP1":
      case "aP2":
        return [
          { texte: "La probabilité d'un événement est la somme des probabilités des valeurs de $X$ qui le réalisent." },
          { texte: `Repère dans le tableau les valeurs de $X$ qui vérifient la condition de $E_${p === "aP1" ? 1 : 2}$ (attention aux symboles stricts et larges), puis additionne leurs probabilités.` },
        ];
      case "aContraires":
        return [
          { texte: "Deux événements sont contraires si, à la fois, aucune valeur ne leur est commune ET, ensemble, ils couvrent toutes les valeurs de $X$." },
          { texte: "Écris la liste des valeurs de $E_1$, puis celle de $E_2$, et compare-les aux valeurs du tableau. $P(E_1)+P(E_2)=1$ ne suffit pas à conclure." },
        ];
      case "bLoi":
        if (e.famille === "B" && e.sousType === "hypergeometrique")
          return [
            { texte: "Tirage simultané (sans remise) : loi hypergéométrique,", latex: "P(X=k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}" },
            { texte: `Ici $N=${e.N}$, $K=${e.K}$ et $n=${e.n}$ : le dénominateur est $C_{${e.N}}^{${e.n}}$ pour toutes les valeurs.` },
          ];
        return [
          { texte: "Les issues sont équiprobables : $P(X=x)$ = nombre d'issues qui donnent $x$, divisé par le nombre total d'issues." },
          { texte: e.famille === "B" && e.sousType === "contexteDirect" ? `Il y a ${e.total} issues en tout ; plusieurs issues peuvent donner la même valeur de $X$ : regroupe-les.` : "Regroupe les issues qui donnent la même valeur." },
        ];
      case "bEsperance":
        return [
          { texte: "L'espérance est la moyenne des valeurs de $X$ pondérée par leurs probabilités :", latex: "E(X)=\\sum x_i\\,P(X=x_i)" },
          { texte: "Multiplie chaque valeur de la loi (écran précédent) par sa probabilité, puis additionne les produits." },
        ];
      case "cEsperanceNette":
        return [
          { texte: "Pour chaque issue, gain net = montant reçu − mise ; puis :", latex: "E(X)=\\sum x_i\\,P(X=x_i)" },
          { texte: "Plus court : calcule d'abord le montant reçu moyen, puis retire la mise (elle est payée à chaque partie)." },
        ];
      case "cEsperanceBrute":
        return [
          { texte: "Espérance du montant reçu :", latex: "E(G)=\\sum g_i\\,P(G=g_i)" },
          { texte: "Les probabilités viennent des effectifs : nombre d'objets de la catégorie divisé par le total. Une issue qui ne rapporte rien compte pour 0." },
        ];
      case "cMise":
        return [
          { texte: "Le jeu est équitable quand le gain net moyen est nul :", latex: "E(G)-m=0" },
          { texte: "Utilise l'espérance de l'écran précédent." },
        ];
      case "cConclusion":
      case "cJugerMise":
        return [
          { texte: "Un jeu est équitable si l'espérance du gain net est nulle, favorable au joueur si elle est positive, défavorable si elle est négative." },
          { texte: p === "cJugerMise" ? "Compare la mise proposée à la mise équitable de l'écran précédent : une mise plus grande fait baisser le gain net moyen." : "Regarde le signe de $E(X)$ calculée à l'écran précédent." },
        ];
    }
  },
  reponseAttendue(e, p) {
    if (e.famille === "A") {
      if (p === "aP1") return [`P(E_1)=${probaLatex(probabiliteEvenementA(e, e.indices1))}`];
      if (p === "aP2") return [`P(E_2)=${probaLatex(probabiliteEvenementA(e, e.indices2))}`];
      return [e.contraires ? "\\text{oui, contraires}" : "\\text{non, pas contraires}"];
    }
    if (e.famille === "B") {
      if (p === "bLoi") return loiB(e).map((l) => `P(X=${l.valeur})=${probaLatex(l.p)}`);
      return [`E(X)=${valeurLatex(esperanceB(e))}`];
    }
    if (p === "cEsperanceNette") return [`E(X)=${euros(versNombre(esperanceNetteC(e)))}`];
    if (p === "cEsperanceBrute") return [`E(G)=${euros(versNombre(esperanceBruteC(e)))}`];
    if (p === "cMise") return [`m=${euros(versNombre(esperanceBruteC(e)))}`];
    return [`\\text{${libelleStatut(e.statut)}}`];
  },
  explication(e, p) {
    if (e.famille === "A") {
      if (p === "aP1" || p === "aP2") {
        const ind = p === "aP1" ? e.indices1 : e.indices2;
        const nom = p === "aP1" ? "E_1" : "E_2";
        return [f(`$${nom}$ est réalisé pour $X\\in${listeValeursLatex(e, ind)}$ : $P(${nom})=${sommeTermesA(e, ind)}=${probaLatex(probabiliteEvenementA(e, ind))}$.`)];
      }
      const inter = e.indices1.filter((i) => e.indices2.includes(i));
      const union = new Set([...e.indices1, ...e.indices2]);
      const manque = e.xs.filter((_, i) => !union.has(i));
      const lignes = [f(`$E_1$ : $X\\in${listeValeursLatex(e, e.indices1)}$ ; $E_2$ : $X\\in${listeValeursLatex(e, e.indices2)}$.`)];
      if (e.contraires) lignes.push(f("Aucune valeur commune, et ensemble ils couvrent toutes les valeurs de $X$ : ils sont contraires."));
      else {
        if (inter.length > 0) lignes.push(f(`Valeur${inter.length > 1 ? "s" : ""} commune${inter.length > 1 ? "s" : ""} : $${inter.map((i) => e.xs[i]).join("\\,;\\,")}$.`));
        if (manque.length > 0) lignes.push(f(`Valeur${manque.length > 1 ? "s" : ""} couverte${manque.length > 1 ? "s" : ""} par aucun des deux : $${manque.join("\\,;\\,")}$.`));
        lignes.push(f("Ils ne sont donc pas contraires" + (versNombre(probabiliteEvenementA(e, e.indices1)) + versNombre(probabiliteEvenementA(e, e.indices2)) === 1 ? ", même si $P(E_1)+P(E_2)=1$." : ".")));
      }
      return lignes;
    }
    if (e.famille === "B") {
      if (p === "bLoi") {
        if (e.sousType === "hypergeometrique") return loiB(e).map((l) => f(`$P(X=${l.valeur})=\\dfrac{C_{${e.K}}^{${l.valeur}}\\,C_{${e.N - e.K}}^{${e.n - l.valeur}}}{C_{${e.N}}^{${e.n}}}=${probaLatex(l.p)}$`));
        return loiB(e).map((l) => {
          const eff = e.issues.filter((i) => i.valeur === l.valeur).reduce((s, i) => s + i.effectif, 0);
          return f(`$P(X=${l.valeur})=\\dfrac{${eff}}{${e.total}}=${probaLatex(l.p)}$`);
        });
      }
      const termes = loiB(e).map((l) => `${l.valeur < 0 ? `(${l.valeur})` : l.valeur}\\times ${fractionLatex(l.p)}`);
      return [f(`$E(X)=${termes.join("+")}=${valeurLatex(esperanceB(e))}$${e.sousType === "hypergeometrique" ? ` (on retrouve $\\dfrac{nK}{N}=\\dfrac{${e.n}\\times ${e.K}}{${e.N}}$)` : ""}.`)];
    }
    const termesG = e.issues.filter((i) => i.gainBrut !== 0).map((i) => `${i.gainBrut}\\times\\dfrac{${i.effectif}}{${e.total}}`);
    const eg = versNombre(esperanceBruteC(e));
    if (p === "cEsperanceNette") return [f(`$E(\\text{montant reçu})=${termesG.join("+")}=${decimalLatex(eg)}$ ; $E(X)=${decimalLatex(eg)}-${decimalLatex(e.mise)}=${decimalLatex(versNombre(esperanceNetteC(e)))}$ (en €).`)];
    if (p === "cEsperanceBrute") return [f(`$E(G)=${termesG.join("+")}=${decimalLatex(eg)}$ (en €).`)];
    if (p === "cMise") return [f(`$E(G)-m=0$ donne $m=E(G)=${decimalLatex(eg)}$ € : avec cette mise, le gain net moyen est nul.`)];
    const en = versNombre(esperanceNetteC(e));
    if (p === "cConclusion") return [f(`$E(X)=${decimalLatex(en)}$ ${en > 0 ? "> 0 : le joueur gagne en moyenne, le jeu lui est favorable." : en < 0 ? "< 0 : le joueur perd en moyenne, le jeu lui est défavorable." : "= 0 : le jeu est équitable."}`)];
    return [f(`Mise équitable : $${decimalLatex(eg)}$ € ; mise fixée : $${decimalLatex(e.mise)}$ €. Gain net moyen : $${decimalLatex(eg)}-${decimalLatex(e.mise)}=${decimalLatex(en)}$ €, donc le jeu est ${libelleStatut(e.statut)}.`)];
  },
  libellePhase(_e, p) {
    const libelles: Record<P, string> = {
      aP1: "P(E₁)",
      aP2: "P(E₂)",
      aContraires: "Contraires ?",
      bLoi: "Loi de X",
      bEsperance: "Espérance",
      cEsperanceNette: "Espérance du gain net",
      cConclusion: "Conclusion",
      cEsperanceBrute: "Espérance du montant reçu",
      cMise: "Mise équitable",
      cJugerMise: "Mise proposée",
    };
    return libelles[p];
  },
  messageCible(e, p, valeurs) {
    const v = valeurs[0] ?? "";
    if (e.famille === "A" && (p === "aP1" || p === "aP2")) {
      const ind = p === "aP1" ? e.indices1 : e.indices2;
      const pred = p === "aP1" ? e.e1 : e.e2;
      const complement = e.xs.map((_, i) => i).filter((i) => !ind.includes(i));
      if (vautEnviron(v, versNombre(probabiliteEvenementA(e, complement)))) return [t("C'est la probabilité de l'événement contraire : relis la condition.")];
      for (const voisin of voisinsStrictLarge(pred, e.xs)) if (vautEnviron(v, versNombre(probabiliteEvenementA(e, voisin)))) return f("Relis le symbole : « $<$ » et « $>$ » excluent la valeur écrite, « $\\leq$ » et « $\\geq$ » l'incluent.");
      return null;
    }
    if (e.famille === "B" && p === "bEsperance" && e.sousType === "contexteDirect") {
      const moyenneSimple = loiB(e).reduce((s, l) => s + l.valeur, 0) / loiB(e).length;
      if (vautEnviron(v, moyenneSimple)) return [t("C'est la moyenne simple des valeurs : il faut les pondérer par leurs probabilités.")];
      return null;
    }
    if (e.famille === "C") {
      const eg = versNombre(esperanceBruteC(e));
      if (p === "cEsperanceNette" && vautEnviron(v, eg)) return [t("C'est le montant reçu moyen : retire encore la mise.")];
      if (p === "cMise" && vautEnviron(v, -eg)) return [t("Une mise est un montant positif payé par le joueur.")];
    }
    return null;
  },
};
