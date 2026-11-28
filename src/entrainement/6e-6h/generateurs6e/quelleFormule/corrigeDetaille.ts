import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice100 } from "../../core6e/quelleFormule";
import { REPONSES_100, estCollier, phases100, valeur100 } from "../../core6e/quelleFormule";
import { AL, CL, GL, arr, comb, fact, mil, multinomialeLatex, produitDecroissant } from "../../ui6e/nombresCombinatoireLotH";
import { formuleType, nomType, raisons100, reponse100 } from "../../ui6e/formatQuelleFormule";

/**
 * Corrigé détaillé « comme au tableau » de `6gen100`, une lettre par écran : les trois questions du
 * cours (décisions justifiées par le contexte), le type lu dans le tableau, puis le calcul (formule,
 * substitution, simplification, résultat) avec une vérification et le piège du type. Même source
 * que l'écran (`raisons100`, `reponse100`).
 */

type E = Exercice100;
const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;

function lignesCalcul(e: E): LigneCalcul[] {
  const { n, p } = e;
  const v = valeur100(e);
  switch (e.type) {
    case "arrangement":
      return [ligne(`${AL(n, p)}=\\dfrac{${n}!}{(${n}-${p})!}`, "définition"), ligne(`=${produitDecroissant(n, p)}`, `on simplifie par ${n - p}!`), ligne(`=${mil(v)}`)];
    case "combinaison":
      return [
        ligne(`${CL(n, p)}=\\dfrac{${AL(n, p)}}{${p}!}`, "l'ordre ne compte pas"),
        ligne(`=\\dfrac{${produitDecroissant(n, p)}}{${produitDecroissant(p, p)}}`),
        ligne(`=\\dfrac{${mil(arr(n, p))}}{${fact(p)}}`),
        ligne(`=${mil(v)}`),
      ];
    case "permutation":
      return [ligne(`P_{${n}}=${n}!`), ligne(`=${produitDecroissant(n, n)}`), ligne(`=${mil(v)}`)];
    case "arrRep":
      return [ligne(`B_{${n}}^{${p}}=${n}^{${p}}`, `${n} choix pour chacune des ${p} positions`), ligne(`=${mil(v)}`)];
    case "combRep":
      return [
        ligne(`${GL(n, p)}=${CL(n + p - 1, p)}`, "définition"),
        ligne(`=\\dfrac{${produitDecroissant(n + p - 1, p)}}{${produitDecroissant(p, p)}}`),
        ligne(`=\\dfrac{${mil(arr(n + p - 1, p))}}{${fact(p)}}`),
        ligne(`=${mil(v)}`),
      ];
    case "permRep": {
      const ef = (e.effectifs ?? []).filter((x) => x > 1);
      const den = ef.reduce((a, x) => a * fact(x), 1);
      return [
        ligne(`N=${multinomialeLatex(n, e.effectifs ?? [])}`, "n! divisé par les factorielles des répétitions"),
        ligne(`=\\dfrac{${mil(fact(n))}}{${ef.map((x) => fact(x)).join("\\times ")}}`),
        ...(ef.length > 1 ? [ligne(`=\\dfrac{${mil(fact(n))}}{${mil(den)}}`)] : []),
        ligne(`=${mil(v)}`),
      ];
    }
    case "circulaire":
      return estCollier(e)
        ? [ligne(`N=\\dfrac{(${n}-1)!}{2}`, "rotations, puis retournement"), ligne(`=\\dfrac{${n - 1}!}{2}=\\dfrac{${mil(fact(n - 1))}}{2}`), ligne(`=${mil(v)}`)]
        : [ligne(`N=(${n}-1)!`, "on fixe une place : les rotations disparaissent"), ligne(`=${n - 1}!=${produitDecroissant(n - 1, n - 1)}`), ligne(`=${mil(v)}`)];
  }
}

function verificationCalcul(e: E): Frag[] {
  const { n, p } = e;
  switch (e.type) {
    case "arrangement":
      return [l(`${AL(n, p)}=${CL(n, p)}\\times ${p}!=${mil(comb(n, p))}\\times ${fact(p)}=${mil(arr(n, p))}`), t(" (un groupe, puis son ordre).")];
    case "combinaison":
      return [t("Par la symétrie : "), l(`${CL(n, p)}=${CL(n, n - p)}`), t(" ; et "), l(`${CL(n, p)}\\times ${p}!=${AL(n, p)}=${mil(arr(n, p))}`), t(".")];
    case "permutation":
      return [l(`P_{${n}}=${AL(n, n)}`), t(" : un arrangement de tous les éléments.")];
    case "arrRep":
      return [t("Plus grand que "), l(`${AL(n, p)}=${mil(arr(n, p))}`), t(", qui interdit la répétition : normal.")];
    case "combRep":
      return [t("Plus grand que "), l(`${CL(n, p)}=${mil(comb(n, p))}`), t(" (sans répétition) et plus petit que "), l(`${n}^{${p}}=${mil(n ** p)}`), t(" (ordre compté) : normal.")];
    case "permRep":
      return [t("Plus petit que "), l(`${n}!=${mil(fact(n))}`), t(", qui compterait comme différents des éléments identiques : normal.")];
    case "circulaire":
      return [l(`${n}!\\div ${n}=${mil(fact(n - 1))}`), t(` : les ${n} rotations d'une disposition alignée donnent la même disposition en cercle${estCollier(e) ? ", puis le retournement divise encore par 2" : ""}.`)];
  }
}

function piegeType(e: E): Frag[] {
  switch (e.type) {
    case "arrangement":
      return [t("Prendre "), l(`${CL(e.n, e.p)}`), t(" : une combinaison oublie que l'ordre compte.")];
    case "combinaison":
      return [t("Prendre "), l(`${AL(e.n, e.p)}`), t(" : chaque groupe serait compté une fois par ordre.")];
    case "permutation":
      return [t("Prendre "), l("(n-1)!"), t(" : réservé aux dispositions en cercle.")];
    case "arrRep":
      return [t("Prendre "), l(AL(e.n, e.p)), t(" (pas de répétition) ou inverser base et exposant ("), l(`${e.p}^{${e.n}}`), t(").")];
    case "combRep":
      return [t("Prendre "), l(CL(e.n, e.p)), t(" : la répétition est permise.")];
    case "permRep":
      return [t("Prendre "), l(`${e.n}!`), t(" : permuter deux éléments identiques ne donne rien de nouveau.")];
    case "circulaire":
      return estCollier(e) ? [t("Oublier la division par 2 : un bracelet peut être retourné.")] : [t("Prendre "), l(`${e.n}!`), t(" : en cercle, tourner la disposition ne change rien.")];
  }
}

export function correctionDetaillee100(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  const r = raisons100(e);
  const rep = REPONSES_100[e.type];
  phases100(e).forEach((ph, i) => {
    const sq = lettreEtape(i);
    if (ph === "ordre") out.push(utilise(sq, fr([t("Question 1 du cours (point 1) : si on échange deux éléments choisis, le résultat change-t-il ?")])), resultat(sq, fr([t(r.ordre)])));
    else if (ph === "repetition") out.push(utilise(sq, fr([t("Question 2 du cours (point 1) : un même élément peut-il être choisi, ou apparaître, plusieurs fois ?")])), resultat(sq, fr([t(r.repetition)])));
    else if (ph === "tous") out.push(utilise(sq, fr([t("Question 3 du cours (point 1), posée car l'ordre compte : place-t-on tous les éléments disponibles ?")])), resultat(sq, fr([t(r.tous)])));
    else if (ph === "type") {
      const oui = (b: boolean | null) => (b ? "oui" : "non");
      out.push(
        utilise(sq, fr([t("Tableau des groupements (cours, point 1) : ordre, répétition, tous utilisés donnent la ligne ; en cercle, seules les positions relatives comptent.")])),
        resultat(
          sq,
          fr([
            t(`Ordre ${oui(rep.ordre)}, répétition ${oui(rep.repetition)}${rep.tous === null ? "" : `, tous ${oui(rep.tous)}`}${e.type === "circulaire" ? ", en cercle" : e.contexte === "groupes" ? ", groupes nommés" : ""} : ${nomType(e.type)}, `),
            l(formuleType(e.type)),
            t("."),
          ]),
        ),
      );
    } else {
      out.push(
        utilise(sq, fr([t(`${nomType(e.type)} (cours, point ${e.type === "permRep" ? 2 : 1}) : `), l(formuleType(e.type)), t(estCollier(e) ? ", divisé par 2 pour un collier." : ".")])),
        calcul(sq, lignesCalcul(e)),
        resultat(sq, fr(reponse100(e, "calcul"))),
        verification(sq, fr(verificationCalcul(e))),
        piege(sq, fr(piegeType(e))),
      );
    }
  });
  return out;
}
