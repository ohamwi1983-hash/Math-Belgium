import type { EtapeCorrection, FragmentConsigne } from "../../../export/genererFeuilleExercices";
import { calcul, lettreEtape, ligne, piege, resultat, utilise, verification } from "../../../export/corrigeTableau";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";
import { lx, tx } from "../../../5e-4h/ui5e/ecransTrigo.types";
import type { Exercice104 } from "../../core6e/etoilesBarres";
import { barres, pLibre, reponse104, symboles } from "../../core6e/etoilesBarres";
import { CL, GL, comb, fact, mil } from "../../ui6e/nombresCombinatoireLotH";
import { noms, reponse104Frag } from "../../ui6e/formatEtoilesBarres";

/**
 * Corrigé détaillé « comme au tableau » de `6gen104`, une lettre par écran : a) cases et objets
 * (objet obligatoire retiré pour « au moins un »), b) codage en étoiles et barres, c) calcul de
 * Γₙᵖ = C₍ₙ₊ₚ₋₁₎ⁿ⁻¹ (quotient de factorielles simplifié), vérification par la symétrie. Même
 * source que l'écran.
 */

type E = Exercice104;
const fr = (f: Frag[]): FragmentConsigne[] => f as FragmentConsigne[];
const t = tx;
const l = lx;

/** Quotient N!/(k!(N−k)!) simplifié : produit décroissant de k facteurs sur k!. */
function lignesQuotient(N: number, k: number) {
  const facteurs = Array.from({ length: k }, (_, i) => N - i);
  const num = facteurs.reduce((a, b) => a * b, 1);
  const lignes = [ligne(`${CL(N, k)}=\\dfrac{${N}!}{${k}!\\times ${N - k}!}`, "définition")];
  if (k <= 1) {
    lignes.push(ligne(`=${N}`));
    return lignes;
  }
  lignes.push(ligne(`=\\dfrac{${facteurs.join("\\times ")}}{${Array.from({ length: k }, (_, i) => k - i).join("\\times ")}}`, `on simplifie par ${N - k}!`));
  lignes.push(ligne(`=\\dfrac{${mil(num)}}{${fact(k)}}`));
  lignes.push(ligne(`=${mil(comb(N, k))}`));
  return lignes;
}

export function correctionDetaillee104(e: E): EtapeCorrection[] {
  const nm = noms(e);
  const libre = pLibre(e);
  const a = lettreEtape(0);
  const b = lettreEtape(1);
  const c = lettreEtape(2);
  const out: EtapeCorrection[] = [];

  // a) cases et objets
  out.push(
    utilise(
      a,
      fr(
        e.variante === "auMoinsUn"
          ? [t("« Au moins un par case » (cours, § 1) : on donne d'abord un objet à chaque case, puis on répartit librement ceux qui restent.")]
          : [t("Combinaison avec répétition (cours, § 1) : les cases (choix possibles) sont distinctes, les objets sont identiques, une case peut en recevoir plusieurs ou aucun.")],
      ),
    ),
    calcul(
      a,
      e.variante === "auMoinsUn"
        ? [ligne(`n=${e.n}`, `les ${nm.cases}`), ligne(`p=${e.p}-${e.n}=${libre}`, `${nm.objets} restant après en avoir placé un par case`)]
        : [ligne(`n=${e.n}`, `les ${nm.cases} (cases)`), ligne(`p=${e.p}`, `les ${nm.objets} (objets identiques)`)],
    ),
    resultat(a, fr(reponse104Frag(e, "np"))),
  );

  // b) codage
  out.push(
    utilise(b, fr([t("Une répartition se code par une rangée de "), l("p"), t(" étoiles (les objets) et de "), l("n-1"), t(" barres (les séparations entre cases voisines) ; ex. "), l("\\star\\star\\,|\\,|\\,\\star\\star\\star"), t(" pour (2 ; 0 ; 3).")])),
    calcul(b, [ligne(`\\text{symboles}=p+(n-1)=${libre}+${e.n - 1}=${symboles(e)}`), ligne(`\\text{barres}=n-1=${barres(e)}`)]),
    resultat(b, fr(reponse104Frag(e, "codage"))),
  );

  // c) calcul
  const N = symboles(e);
  const k = Math.min(barres(e), libre);
  out.push(
    utilise(c, fr([t("Une répartition = le choix des places des barres parmi les symboles (cours, § 1) : "), l(`${GL("n", "p")}=${CL("n+p-1", "p")}=${CL("n+p-1", "n-1")}`), t(".")])),
    calcul(c, [ligne(`${GL(e.n, libre)}=${CL(N, barres(e))}${k !== barres(e) ? `=${CL(N, k)}` : ""}`, k !== barres(e) ? "symétrie : le plus petit indice" : "places des barres"), ...lignesQuotient(N, k)]),
    resultat(c, fr(reponse104Frag(e, "calcul"))),
    verification(c, fr([t("Par la place des étoiles : "), l(`${CL(N, libre)}=${CL(N, barres(e))}=${mil(reponse104(e))}`), t(" (symétrie, "), l(`${libre}+${barres(e)}=${N}`), t(").")])),
    piege(
      c,
      fr(
        e.variante === "auMoinsUn"
          ? [t("Oublier de retirer un objet par case : "), l(`${CL(e.p + e.n - 1, e.n - 1)}=${mil(comb(e.p + e.n - 1, e.n - 1))}`), t(" compterait aussi les répartitions où une case reste vide.")]
          : [t("Prendre "), l(`${CL(e.n, libre)}`), t(" (sans répétition) ou "), l(`${e.n}^{${libre}}`), t(" (ordre compté) : les objets sont identiques et une même case peut en recevoir plusieurs.")],
      ),
    ),
  );
  return out;
}
