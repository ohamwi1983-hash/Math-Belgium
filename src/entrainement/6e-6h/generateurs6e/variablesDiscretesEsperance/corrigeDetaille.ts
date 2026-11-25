import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import type { ExerciceEsperanceA, ExerciceEsperanceB, ExerciceEsperanceC, ExerciceVariablesDiscretesEsperance } from "../../core6e/variablesDiscretesEsperance.types";
import { probabiliteEvenementA } from "../../moteur6e/verificationVariablesDiscretesEsperance";
import { combinaisonBig, versNombre } from "../../moteur6e/saisieCombinatoire";
import type { Rationnel } from "../../moteur6e/saisieCombinatoire";
import { predicatFragments } from "../../ui6e/formatVariablesDiscretesEsperance";
import { calcul, decimalExact, finaliserCombinatoire, fx, ligne, piege, resultat, utiliseCours, verification } from "../../ui6e/corrigeCombinatoire";
import { COURS_DISCRETES, ar, dl } from "../../ui6e/corrigeVariablesAleatoires";
import { fractionLatex, milliers } from "../../ui6e/fragmentsCombinatoire";
import { esperanceB, loiB } from "./familleB";
import { esperanceBruteC, esperanceNetteC } from "./familleC";

/**
 * Corrigé détaillé « comme au tableau » de `6gen49` (6e ch. 8, § 1), une lettre par écran — même source
 * pour l'écran révélé et pour le papier :
 * - A : a) P(E₁) ; b) P(E₂) (valeurs de X qui réalisent l'événement, somme de leurs probabilités) ;
 *   c) contraires ? (valeur commune, valeur oubliée — P(E₁) + P(E₂) = 1 ne suffit pas) ;
 * - B : a) loi (issues regroupées par valeur, ou formule hypergéométrique) ; b) E(X) ;
 * - C « vérifier » : a) E(G) puis E(X) = E(G) − mise ; b) conclusion par le signe de E(X) ;
 * - C « imposer » : a) E(G) ; b) mise équitable m = E(G) ; c) mise proposée comparée à m.
 */

type E = ExerciceVariablesDiscretesEsperance;

/** Probabilité : décimal exact court, sinon fraction ≈ arrondi au millième. */
function proba(r: Rationnel): string {
  const d = decimalExact(r);
  if (d && d.decimales <= 4) return r.d === 1n ? milliers(r.n) : `${fractionLatex(r)}=${d.latex}`;
  return `${fractionLatex(r)}\\approx ${ar(versNombre(r), 3)}`;
}
/** Valeur (espérance) : exacte si décimale courte, sinon fraction ≈ au centième. */
function valeur(r: Rationnel): string {
  const d = decimalExact(r);
  if (d && d.decimales <= 4) return d.latex;
  return `${fractionLatex(r)}\\approx ${ar(versNombre(r), 2)}`;
}
const par = (x: number) => (x < 0 ? `(${x})` : String(x));

function ensemble(e: ExerciceEsperanceA, ind: number[]): string {
  return `\\{${ind.map((i) => e.xs[i]).join("\\,;")}\\}`;
}

function etapeP(e: ExerciceEsperanceA, lettre: "a" | "b"): EtapeCorrection[] {
  const ind = lettre === "a" ? e.indices1 : e.indices2;
  const pred = lettre === "a" ? e.e1 : e.e2;
  const nom = lettre === "a" ? "E_1" : "E_2";
  const pr = probabiliteEvenementA(e, ind);
  return [
    utiliseCours(lettre, fx("La probabilité d'un événement est la somme des probabilités des valeurs de $X$ qui le réalisent"), COURS_DISCRETES),
    calcul(lettre, [
      ligne(`${nom}\\iff X\\in${ensemble(e, ind)}`, [{ type: "texte", valeur: "valeurs qui vérifient « " }, ...predicatFragments(pred), { type: "texte", valeur: " »" }]),
      ligne(`P(${nom})=${ind.map((i) => dl(e.poids[i] / 20)).join("+")}`, "probabilités lues dans le tableau"),
      ligne(`=${dl(versNombre(pr))}`),
    ]),
    resultat(lettre, fx(`$P(${nom})=${dl(versNombre(pr))}$.`)),
  ];
}

function corrigeA(e: ExerciceEsperanceA): EtapeCorrection[] {
  const inter = e.indices1.filter((i) => e.indices2.includes(i));
  const union = new Set([...e.indices1, ...e.indices2]);
  const manque = e.xs.filter((_, i) => !union.has(i));
  const s = versNombre(probabiliteEvenementA(e, e.indices1)) + versNombre(probabiliteEvenementA(e, e.indices2));
  const lignesC: LigneCalcul[] = [
    ligne(`E_1\\cap E_2=${inter.length ? ensemble(e, inter) : "\\varnothing"}`, inter.length ? "valeurs communes" : "aucune valeur commune"),
    ligne(`E_1\\cup E_2=${union.size === e.xs.length ? `\\{${e.xs.join("\\,;")}\\}` : ensemble(e, [...union].sort((a, b) => a - b))}`, union.size === e.xs.length ? "toutes les valeurs de X" : `il manque ${manque.join(" ; ")}`),
  ];
  return [
    ...etapeP(e, "a"),
    ...etapeP(e, "b"),
    utiliseCours("c", fx("Deux événements sont contraires si, à la fois, ils n'ont aucune valeur commune et, ensemble, ils couvrent toutes les valeurs de $X$"), COURS_DISCRETES),
    calcul("c", lignesC),
    resultat("c", fx(e.contraires ? "Aucune valeur commune et toutes les valeurs couvertes : $E_1$ et $E_2$ sont contraires." : `${inter.length ? "Ils ont une valeur commune" : ""}${inter.length && manque.length ? " et " : ""}${manque.length ? `${inter.length ? "une" : "Une"} valeur n'est couverte par aucun des deux` : ""} : $E_1$ et $E_2$ ne sont pas contraires.`)),
    piege("c", fx(Math.abs(s - 1) < 1e-9 && !e.contraires ? "Ici $P(E_1)+P(E_2)=1$, et pourtant ils ne sont pas contraires : la somme ne suffit pas, il faut comparer les valeurs." : "Conclure avec la seule somme $P(E_1)+P(E_2)$ : elle peut valoir 1 sans que les événements soient contraires.")),
  ];
}

function corrigeB(e: ExerciceEsperanceB): EtapeCorrection[] {
  const loi = loiB(e);
  const esp = esperanceB(e);
  const lignesLoi: LigneCalcul[] =
    e.sousType === "hypergeometrique"
      ? loi.map((l, i) =>
          ligne(
            `P(X=${l.valeur})=\\dfrac{C_{${e.K}}^{${l.valeur}}\\times C_{${e.N - e.K}}^{${e.n - l.valeur}}}{C_{${e.N}}^{${e.n}}}=\\dfrac{${milliers(combinaisonBig(e.K, l.valeur))}\\times ${milliers(combinaisonBig(e.N - e.K, e.n - l.valeur))}}{${milliers(combinaisonBig(e.N, e.n))}}=${proba(l.p)}`,
            i === 0 ? "tirage simultané : loi hypergéométrique" : undefined,
          ),
        )
      : loi.map((l) => {
          const eff = e.issues.filter((i) => i.valeur === l.valeur).reduce((s, i) => s + i.effectif, 0);
          const issues = e.issues.filter((i) => i.valeur === l.valeur);
          return ligne(`P(X=${l.valeur})=\\dfrac{${eff}}{${e.total}}=${proba(l.p)}`, issues.length > 1 ? `${issues.length} issues donnent ${l.valeur} : on les regroupe` : undefined);
        });
  const termes = loi.filter((l) => l.valeur !== 0).map((l) => `${par(l.valeur)}\\times ${fractionLatex(l.p)}`);
  const out: EtapeCorrection[] = [
    utiliseCours(
      "a",
      e.sousType === "hypergeometrique"
        ? fx(`On tire $n=${e.n}$ objets sans remise parmi $N=${e.N}$, dont $K=${e.K}$ « succès » : $P(X=k)=\\dfrac{C_K^k\\,C_{N-K}^{n-k}}{C_N^n}$`)
        : fx(`Les ${e.total} issues sont équiprobables : $P(X=x)$ = nombre d'issues qui donnent $x$, divisé par ${e.total}`),
      COURS_DISCRETES,
    ),
    calcul("a", lignesLoi),
    resultat("a", fx(`Loi de $X$ : ${loi.map((l) => `$P(X=${l.valeur})=${proba(l.p)}$`).join(" ; ")}.`)),
    verification("a", fx("La somme des probabilités vaut 1.")),
    ...(e.sousType === "hypergeometrique" ? [piege("a", fx(`Au dénominateur, $C_{${e.N}}^{${e.n}}$ : le nombre de groupes de ${e.n} objets parmi ${e.N}.`))] : []),
    utiliseCours("b", fx("Espérance : moyenne des valeurs pondérée par leurs probabilités, $E(X)=\\sum x_i\\,P(X=x_i)$"), COURS_DISCRETES),
    calcul("b", [ligne(`E(X)=${termes.join("+")}`, loi.some((x) => x.valeur === 0) ? "valeurs × probabilités (le terme de la valeur 0 est nul)" : "valeurs × probabilités"), ligne(`=${valeur(esp)}`)]),
    resultat("b", fx(`$E(X)=${valeur(esp)}$${e.sousType === "contexteDirect" && e.unite ? ` ${e.unite}` : ""}.`)),
  ];
  if (e.sousType === "hypergeometrique") out.push(verification("b", fx(`On retrouve $\\dfrac{nK}{N}=\\dfrac{${e.n}\\times ${e.K}}{${e.N}}=${valeur(esp)}$.`)));
  else out.push(piege("b", fx("Faire la moyenne simple des valeurs : chacune doit être pondérée par sa probabilité.")));
  return out;
}

function lignesEG(e: ExerciceEsperanceC): LigneCalcul[] {
  const eg = esperanceBruteC(e);
  const termes = e.issues.filter((i) => i.gainBrut !== 0).map((i) => `${i.gainBrut}\\times\\dfrac{${i.effectif}}{${e.total}}`);
  return [ligne(`E(G)=${termes.join("+")}`, "montant reçu × probabilité (une issue qui ne rapporte rien compte pour 0)"), ligne(`=${valeur(eg)}`)];
}

function verdict(x: number): string {
  return x > 1e-9 ? "favorable au joueur" : x < -1e-9 ? "défavorable au joueur" : "équitable";
}

function corrigeC(e: ExerciceEsperanceC): EtapeCorrection[] {
  const eg = esperanceBruteC(e);
  const en = esperanceNetteC(e);
  const egN = versNombre(eg);
  const enN = versNombre(en);
  const mise = dl(e.mise);
  const regle = fx("Un jeu est équitable si l'espérance du gain net est nulle, favorable au joueur si elle est positive, défavorable si elle est négative");
  if (e.sousType === "verifier")
    return [
      utiliseCours("a", fx("Gain net = montant reçu − mise ; la mise est payée à chaque partie : $E(X)=E(G)-\\text{mise}$, avec $G$ le montant reçu"), COURS_DISCRETES),
      calcul("a", [...lignesEG(e), ligne(`E(X)=${valeur(eg)}-${mise}=${dl(enN)}`, "on retire la mise")]),
      resultat("a", fx(`$E(X)=${dl(enN)}$ €.`)),
      piege("a", fx("Oublier de retirer la mise : $E(G)$ est le montant reçu moyen, pas le gain net.")),
      utiliseCours("b", regle, COURS_DISCRETES),
      resultat("b", fx(`$E(X)=${dl(enN)}$ ${enN > 1e-9 ? "> 0" : enN < -1e-9 ? "< 0" : "= 0"} : le jeu est ${verdict(enN)}.`)),
    ];
  return [
    utiliseCours("a", fx("Espérance du montant reçu $G$ : $E(G)=\\sum g_i\\,P(G=g_i)$ (probabilités = effectifs ÷ total)"), COURS_DISCRETES),
    calcul("a", lignesEG(e)),
    resultat("a", fx(`$E(G)=${valeur(eg)}$ €.`)),
    utiliseCours("b", fx("Le jeu est équitable quand le gain net moyen est nul : $E(G)-m=0$"), COURS_DISCRETES),
    calcul("b", [ligne(`E(G)-m=0`, "gain net moyen nul"), ligne(`m=${dl(egN)}`)]),
    resultat("b", fx(`Mise équitable : $m=${dl(egN)}$ €.`)),
    piege("b", fx("Prendre le plus grand gain, ou la moyenne simple des montants, pour la mise équitable.")),
    utiliseCours("c", regle, COURS_DISCRETES),
    calcul("c", [ligne(`E(G)-${mise}=${dl(egN)}-${mise}=${dl(enN)}`, "gain net moyen avec la mise fixée")]),
    resultat("c", fx(`Mise fixée ${e.mise > egN + 1e-9 ? "plus grande que" : e.mise < egN - 1e-9 ? "plus petite que" : "égale à"} la mise équitable : le jeu est ${verdict(enN)}.`)),
  ];
}

export function correctionDetailleeVariablesDiscretes(e: E): EtapeCorrection[] {
  return finaliserCombinatoire(e.famille === "A" ? corrigeA(e) : e.famille === "B" ? corrigeB(e) : corrigeC(e));
}

