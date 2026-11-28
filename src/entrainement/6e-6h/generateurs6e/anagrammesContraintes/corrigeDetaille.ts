import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice103, Phase103 } from "../../core6e/anagrammesContraintes";
import { consonnesDe, effectifs, effectifsCollees, nbOccurrences, phases103, sansUne, valeur103, voyellesDe } from "../../core6e/anagrammesContraintes";
import { fact, mil, multinomialeLatex } from "../../ui6e/nombresCombinatoireLotH";
import { descriptionLettres } from "../../core6e/motsLotH";
import { reponse103 } from "../../ui6e/formatAnagrammesContraintes";

/**
 * Corrigé détaillé « comme au tableau » de `6gen103`, une lettre par écran : lettres comptées,
 * n!/(n₁!·n₂!…) évalué ligne à ligne (factorielles, produit du dénominateur, quotient), puis la
 * contrainte (− 1, première lettre fixée, bloc et ordre interne, complément des lettres collées),
 * avec une vérification (proportion de la lettre fixée, total = collés + jamais collés) et le piège.
 */

type E = Exercice103;
const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;

/** n!/(n₁!·n₂!…) calculé : factorielles, dénominateur, quotient. */
function lignesMultinomiale(nom: string, n: number, eff: number[], justif?: string): LigneCalcul[] {
  const rep = eff.filter((x) => x > 1);
  const v = eff.reduce((a, x) => a / fact(x), fact(n));
  if (rep.length === 0) return [ligne(`${nom}=${n}!`, justif), ligne(`=${mil(v)}`)];
  const den = rep.reduce((a, x) => a * fact(x), 1);
  const lignes = [ligne(`${nom}=${multinomialeLatex(n, eff)}`, justif), ligne(`=\\dfrac{${mil(fact(n))}}{${rep.map((x) => fact(x)).join("\\times ")}}`)];
  if (rep.length > 1) lignes.push(ligne(`=\\dfrac{${mil(fact(n))}}{${mil(den)}}`));
  lignes.push(ligne(`=${mil(v)}`));
  return lignes;
}

const COURS = "(cours, point 2)";

function etape(e: E, p: Phase103): { u: Frag[]; lignes: LigneCalcul[]; verif?: Frag[]; piege?: Frag[] } {
  const m = e.mot;
  switch (p) {
    case "total":
      return {
        u: [t(`Permutation avec répétitions ${COURS} : `), l("\\dfrac{n!}{n_1!\\times n_2!\\times\\cdots}"), t(`. Le mot ${m} a ${m.length} lettres : ${descriptionLettres(m)}.`)],
        lignes: lignesMultinomiale("N", m.length, effectifs(m), "lettres identiques interchangeables"),
      };
    case "anagrammes":
      return {
        u: [t(`Anagramme ${COURS} : un mot différent du mot de départ ; le mot ${m} est l'une des permutations comptées.`)],
        lignes: [ligne(`\\text{anagrammes}=${mil(valeur103(e, "total"))}-1`, `on retire ${m}`), ligne(`=${mil(valeur103(e, "anagrammes"))}`)],
        piege: [t(`Répondre ${mil(valeur103(e, "total"))} : ce nombre compte le mot ${m} lui-même.`)],
      };
    case "fixe": {
      const r = sansUne(m, e.lettre!);
      const nX = nbOccurrences(m, e.lettre!);
      return {
        u: [t(`On fixe ${e.lettre} en première place ; on range les ${r.length} lettres restantes : ${descriptionLettres(r)}.`)],
        lignes: lignesMultinomiale("N", r.length, effectifs(r), nX > 1 ? `il reste ${nX - 1} lettre${nX - 1 > 1 ? "s" : ""} ${e.lettre}` : undefined),
        verif: [t(`Proportion : ${nX} lettre${nX > 1 ? "s" : ""} sur ${m.length} sont des ${e.lettre}, donc `), l(`${mil(valeur103(e, "total"))}\\times\\dfrac{${nX}}{${m.length}}=${mil(valeur103(e, "fixe"))}`), t(".")],
        piege: nX > 1 ? [t(`Garder ${nX} lettres ${e.lettre} au dénominateur : l'une d'elles est déjà placée en tête.`)] : [t(`Oublier qu'il ne reste que ${r.length} lettres à ranger.`)],
      };
    }
    case "interne": {
      const v = voyellesDe(m);
      return { u: [t(`Bloc des voyelles : ${[...v].join(", ")} (${descriptionLettres(v)}). On les range entre elles ${COURS}.`)], lignes: lignesMultinomiale("N_1", v.length, effectifs(v)) };
    }
    case "externe": {
      const c = consonnesDe(m);
      return {
        u: [t(`Le bloc compte pour un seul symbole : on range ${c.length + 1} symboles, le bloc et les consonnes ${[...c].join(", ")} (${descriptionLettres(c)}).`)],
        lignes: lignesMultinomiale("N_2", c.length + 1, effectifs(c), "le bloc est un symbole de plus"),
      };
    }
    case "produit":
      return {
        u: [t("Principe multiplicatif (cours, point 1) : l'ordre du bloc parmi les consonnes, puis l'ordre des voyelles dans le bloc.")],
        lignes: [ligne(`N=N_1\\times N_2=${mil(valeur103(e, "interne"))}\\times ${mil(valeur103(e, "externe"))}`), ligne(`=${mil(valeur103(e, "produit"))}`)],
        verif: [t("Moins que les "), l(mil(valeur103({ ...e, variante: "anagrammes" }, "total"))), t(" mots sans contrainte : normal.")],
        piege: [t("Oublier l'ordre des voyelles à l'intérieur du bloc (ne garder que "), l(`N_2=${mil(valeur103(e, "externe"))}`), t(").")],
      };
    case "collees":
      return {
        u: [t(`Les deux lettres ${e.lettre} collées forment un seul symbole « ${e.lettre}${e.lettre} » : il reste ${m.length - 1} symboles à ranger.`)],
        lignes: lignesMultinomiale("N_c", m.length - 1, effectifsCollees(m, e.lettre!), "la paire compte une fois"),
      };
    case "jamais":
      return {
        u: [t("Complément : jamais côte à côte = tous les mots, sauf ceux où les deux lettres sont collées.")],
        lignes: [ligne(`N=${mil(valeur103(e, "total"))}-${mil(valeur103(e, "collees"))}`), ligne(`=${mil(valeur103(e, "jamais"))}`)],
        verif: [l(`${mil(valeur103(e, "jamais"))}+${mil(valeur103(e, "collees"))}=${mil(valeur103(e, "total"))}`), t(" : chaque mot est compté une fois, collé ou non.")],
        piege: [t("Donner le nombre de mots où les lettres sont collées : on demande le contraire.")],
      };
  }
}

export function correctionDetaillee103(e: E): EtapeCorrection[] {
  const out: EtapeCorrection[] = [];
  phases103(e).forEach((p, i) => {
    const sq = lettreEtape(i);
    const x = etape(e, p);
    out.push(utilise(sq, fr(x.u)), calcul(sq, x.lignes), resultat(sq, fr(reponse103(e, p))));
    if (x.verif) out.push(verification(sq, fr(x.verif)));
    if (x.piege) out.push(piege(sq, fr(x.piege)));
  });
  return out;
}
