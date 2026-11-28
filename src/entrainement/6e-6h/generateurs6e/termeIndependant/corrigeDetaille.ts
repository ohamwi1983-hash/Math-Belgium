import type { EtapeCorrection, FragmentConsigne, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import type { ExerciceTI } from "../../core6e/termeIndependant";
import { exposant, kFractionL, kIndependant, pq, termeIndependant } from "../../core6e/termeIndependant";
import { exposantL, premierL, reponse, secondL, termeGeneralL } from "../../ui6e/formatTermeIndependant";
import { C, cL, entL } from "../../ui6e/nombresCombinatoireLotH2";
import type { Frag } from "../../../5e-4h/ui5e/ecransTrigo.types";

/**
 * Corrigé détaillé « comme au tableau » de `6gen107`, partagé par l'appli et le papier — une lettre
 * par écran : a) terme général et exposant de x (règles des puissances, une transformation par
 * ligne) ; b) équation « exposant = 0 », k entier ou non ; c) valeur du terme (ou 0), vérifiée en
 * remettant k dans l'exposant (ou en encadrant k entre deux entiers voisins).
 */

type E = ExerciceTI;
const t = texte;
const f = latex;
const fr = (x: Frag[]) => x as unknown as FragmentConsigne[];

const puissX = (k: number) => (k === 1 ? "x" : `x^{${k}}`);
const par = (b: number) => (b < 0 ? `(${b})` : `${b}`);

function lignesK(e: E): LigneCalcul[] {
  const { c, pente } = exposant(e);
  const k = kIndependant(e);
  const brut = `\\dfrac{${c}}{${-pente}}`;
  const reduit = kFractionL(e);
  const nonEntier = k === null ? `pas un entier : ${c} n'est pas divisible par ${-pente}` : undefined;
  const lignes = [ligne(`${exposantL(e)}=0`), ligne(`${-pente}k=${c}`, "on fait passer le terme en k de l'autre côté")];
  if (reduit === brut) lignes.push(ligne(`k=${brut}`, nonEntier));
  else lignes.push(ligne(`k=${brut}`), ligne(`=${reduit}`, nonEntier ?? "on simplifie"));
  return lignes;
}

export function correctionDetailleeTI(e: E): EtapeCorrection[] {
  const { p, q } = pq(e);
  const n = e.n;
  const { c, pente } = exposant(e);
  const k = kIndependant(e);
  const a = e.a;
  const coefA = a === 1 ? "" : `${a}^{${n}-k}\\,`;
  const etapes: EtapeCorrection[] = [
    utilise("a", [t("Terme général du binôme de Newton (cours, point 3) : "), f("T_{k+1}=C_n^k\\,a^{n-k}\\,b^{k}"), t(", avec ici "), f(`a=${premierL(e)}`), t(" et "), f(`b=${secondL(e)}`), t(" ; puis "), f("\\dfrac{1}{x^q}=x^{-q}"), t(" et "), f("x^r\\cdot x^s=x^{r+s}"), t(".")]),
    calcul("a", [
      ligne(termeGeneralL(e)),
      ligne(`=C_{${n}}^{k}\\,${coefA}${p === 1 ? `x^{${n}-k}` : `x^{${p}(${n}-k)}`}\\cdot ${par(e.b)}^{k}\\,x^{-${q === 1 ? "" : q}k}`, "on sépare nombres et puissances de x"),
      ligne(`=C_{${n}}^{k}\\,${coefA}${par(e.b)}^{k}\\,x^{${exposantL(e)}}`, "on additionne les exposants"),
    ]),
    resultat("a", [t("Exposant de "), f("x"), t(" dans "), f("T_{k+1}"), t(" : "), ...fr(reponse(e, "exposant"))]),
    piege("a", [t("Oublier le signe « − » de l'exposant : "), f(`\\left(\\dfrac{1}{${puissX(q)}}\\right)^{k}=x^{-${q === 1 ? "" : q}k}`), t(".")]),
    utilise("b", [t("Le terme est indépendant de "), f("x"), t(" quand l'exposant de "), f("x"), t(" est nul ; "), f("k"), t(" est un rang, donc un entier de "), f("0"), t(" à "), f(`${n}`), t(".")]),
    calcul("b", lignesK(e)),
    resultat("b", fr(reponse(e, "k"))),
  ];
  if (k === null) {
    const k0 = Math.floor(c / -pente);
    etapes.push(
      utilise("c", [t("Aucun entier "), f("k"), t(" n'annule l'exposant : aucun terme du développement n'est constant.")]),
      resultat("c", fr(reponse(e, "terme"))),
      verification("c", [t("Les deux rangs les plus proches donnent des exposants non nuls :")], [ligne(`${c}-${-pente}\\cdot ${k0}=${c + pente * k0}`, [t("pour "), f(`k=${k0}`)]), ligne(`${c}-${-pente}\\cdot ${k0 + 1}=${c + pente * (k0 + 1)}`, [t("pour "), f(`k=${k0 + 1}`)])]),
      piege("c", [t("Arrondir "), f("k"), t(" à l'entier le plus proche : l'exposant de ce terme n'est pas nul, il contient encore "), f("x"), t(".")]),
    );
    return etapes;
  }
  const T = termeIndependant(e);
  etapes.push(
    utilise("c", [t("On remplace "), f("k"), t(" par "), f(`${k}`), t(" dans la partie numérique de "), f("T_{k+1}"), t(" : c'est le terme de rang "), f(`${k + 1}`), t(".")]),
    calcul("c", [
      ligne(`T_{${k + 1}}=${cL(n, k)}\\cdot ${a}^{${n - k}}\\cdot ${par(e.b)}^{${k}}`),
      ligne(`=${entL(C(n, k))}\\cdot ${entL(a ** (n - k))}\\cdot ${par(e.b ** k)}`, e.b < 0 ? (k % 2 === 1 ? "exposant impair : négatif" : "exposant pair : positif") : undefined),
      ligne(`=${entL(T)}`),
    ]),
    resultat("c", fr(reponse(e, "terme"))),
    verification("c", [t("Avec "), f(`k=${k}`), t(", l'exposant de "), f("x"), t(" est bien nul :")], [ligne(`${c}-${-pente}\\cdot ${k}=0`)]),
    piege("c", [t("Écrire "), f(`T_{${k}}`), t(" ou prendre "), f(`${par(e.b)}^{${k + 1}}`), t(" : le terme de rang "), f("k+1"), t(" porte "), f("b^{k}"), t(".")]),
  );
  return etapes;
}
