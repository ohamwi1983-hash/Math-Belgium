import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceAMU } from "../../core6e/auMoinsUnComplement";
import { exactementI, N, resultat as resultatAMU, strategieJuste, termes, valeurImposer } from "../../core6e/auMoinsUnComplement";
import { noms, quantificateur, reponse } from "../../ui6e/formatAuMoinsUnComplement";
import { C, cL, entL } from "../../ui6e/nombresCombinatoireLotH2";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Corrigé détaillé « comme au tableau » de `6gen105`, partagé par l'appli et le papier — une lettre
 * par écran : a) la stratégie (cas possibles, cas demandés, pourquoi la stratégie est la plus
 * directe) ; b) les deux nombres (combinaisons) ; c) le résultat, vérifié par une autre voie (somme
 * des cas pour « au moins un », comparaison au total sinon). Piège ciblé : imposer un élément puis
 * compléter librement (comptes multiples).
 */

type E = ExerciceAMU;
const t = texte;
const fr = (x: Frag[]) => x as unknown as FragmentConsigne[];

/** « C_{13}^{4}=\dfrac{13\cdot12\cdot11\cdot10}{4!}=715 » : produit décroissant sur k!. */
function lignesC(n: number, k: number, justif?: string): LigneCalcul[] {
  const kk = Math.min(k, n - k);
  if (kk <= 1) return [ligne(`${cL(n, k)}=${entL(C(n, k))}`, justif)];
  const num = Array.from({ length: kk }, (_, i) => `${n - i}`).join("\\cdot ");
  return [ligne(`${cL(n, k)}=\\dfrac{${num}}{${kk}!}`, justif ?? (kk !== k ? [texte("symétrie : "), latex(`${cL(n, k)}=${cL(n, n - k)}`)] : undefined)), ligne(`=${entL(C(n, k))}`)];
}

const raisonnement = (fragments: FragmentConsigne[]): EtapeCorrection => ({ label: "Raisonnement", sousQuestion: "a", fragments });

export function correctionDetailleeAMU(e: E): EtapeCorrection[] {
  const n = noms(e);
  const s = strategieJuste(e);
  const [t1, t2] = termes(e);
  const R = resultatAMU(e);
  const m = Math.min(e.a, e.k);
  const casListe = Array.from({ length: m + 1 }, (_, i) => i);
  const cas = casListe.join(", ").replace(/, (\d+)$/, " ou $1");
  const demandes = casListe.filter((i) => (e.evenement === "auMoinsUn" ? i >= 1 : e.evenement === "auPlusUn" ? i <= 1 : i === e.j));
  const exclus = casListe.filter((i) => !demandes.includes(i));
  const etapes: EtapeCorrection[] = [];

  // a) Stratégie.
  etapes.push(
    utilise("a", [t(`Un ${n.groupe} de `), { type: "latex", valeur: `${e.k}` }, t(` ${n.elements} contient ${cas} ${n.cibles} : on veut `), ...fr(quantificateur(e)), t(` (cas ${demandes.join(", ")} ; ${exclus.length ? `exclus : ${exclus.join(", ")}` : "aucun cas exclu"}) (cours, § 2).`)]),
  );
  if (s === "complement")
    etapes.push(raisonnement([t(`Cas demandés : ${demandes.length} nombres à calculer ; cas exclus : un seul (« 0 »). On compte donc tous les ${n.groupes} et on retire ceux qui n'en ont aucun.`)]));
  else if (s === "somme")
    etapes.push(raisonnement([t(`Cas demandés : deux seulement (« 0 » et « 1 ») ; le contraire en compterait ${exclus.length}. On additionne les deux cas, qui ne se chevauchent pas.`)]));
  else etapes.push(raisonnement([t(`Un seul cas est demandé : on choisit les ${n.cibles}, puis les autres ${n.elements} parmi les ${n.autres} — un seul produit.`)]));
  etapes.push(resultat("a", fr(reponse(e, "strategie"))));
  if (s === "complement") etapes.push(piege("a", [t(`Imposer ${n.cibleFem ? "une" : "un"} ${n.cible} puis compléter librement : un ${n.groupe} qui en contient deux est alors compté deux fois.`)]));

  // b) Les deux nombres.
  etapes.push(utilise("b", [t("Combinaisons (cours, § 1) : dans un groupe, l'ordre ne compte pas et il n'y a pas de répétition ; "), { type: "latex", valeur: "C_n^p=\\dfrac{n!}{p!\\,(n-p)!}" }, t(".")]));
  const lb: LigneCalcul[] = [];
  if (s === "complement") {
    lb.push(...lignesC(N(e), e.k, `tous : ${e.k} parmi ${N(e)}`));
    lb.push(...lignesC(e.b, e.k, `sans ${n.cible} : ${e.k} parmi les ${e.b} ${n.autres}`));
  } else if (s === "somme") {
    lb.push(...lignesC(e.b, e.k, `sans ${n.cible} : ${e.k} parmi les ${e.b} ${n.autres}`));
    lb.push(ligne(`${e.a}\\times ${cL(e.b, e.k - 1)}=${e.a}\\times ${entL(C(e.b, e.k - 1))}`, `1 parmi ${e.a}, puis ${e.k - 1} parmi ${e.b}`));
    lb.push(ligne(`=${entL(t2)}`));
  } else {
    lb.push(...lignesC(e.a, e.j, `${e.j} parmi les ${e.a} ${n.cibles}`));
    lb.push(...lignesC(e.b, e.k - e.j, `${e.k - e.j} parmi les ${e.b} ${n.autres}`));
  }
  etapes.push(calcul("b", lb));
  etapes.push(resultat("b", fr(reponse(e, "termes"))));

  // c) Résultat.
  const op = s === "complement" ? "-" : s === "somme" ? "+" : "\\times ";
  etapes.push(
    utilise("c", s === "complement" ? [t("Événement contraire : le nombre cherché est le total moins les groupes sans aucun élément de la sorte demandée.")] : s === "somme" ? [t("Principe d'addition : deux cas disjoints s'additionnent.")] : [t("Principe de multiplication : chaque choix de la première sorte se combine avec chaque choix de l'autre.")]),
  );
  etapes.push(calcul("c", [ligne(`N=${entL(t1)}${op}${entL(t2)}`), ligne(`=${entL(R)}`)]));
  etapes.push(resultat("c", fr(reponse(e, "resultat"))));
  if (s === "complement") {
    const termesCas = demandes.map((i) => `${cL(e.a, i)}${cL(e.b, e.k - i)}`).join("+");
    const valeursCas = demandes.map((i) => entL(exactementI(e, i))).join("+");
    etapes.push(verification("c", [t("En additionnant les cas « exactement 1 », « exactement 2 »… (plus long) :")], [ligne(termesCas), ligne(`=${valeursCas}`), ligne(`=${entL(R)}`)]));
    etapes.push(piege("c", [t("Calculer "), { type: "latex", valeur: `${e.a}\\times ${cL(N(e) - 1, e.k - 1)}=${entL(valeurImposer(e))}` }, t(` (${n.cibleFem ? "une" : "un"} ${n.cible} imposé${n.cibleFem ? "e" : ""}, puis le reste) : ce nombre dépasse le bon résultat, car les groupes à plusieurs ${n.cibles} y sont comptés plusieurs fois.`)]));
  } else {
    etapes.push(verification("c", [t(`Le résultat est bien inférieur au nombre total de ${n.groupes} :`)], [ligne(`${entL(R)}<${cL(N(e), e.k)}=${entL(C(N(e), e.k))}`)]));
    etapes.push(piege("c", s === "somme" ? [t("Additionner aussi les groupes qui en contiennent deux ou plus : « au plus un » s'arrête à un.")] : [t("Additionner les deux nombres : un choix en deux temps se compte par un produit.")]));
  }
  return etapes;
}
