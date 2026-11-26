import type { EtapeCorrection, LigneCalcul } from "../../../export/genererFeuilleExercices";
import { calcul, latex, ligne, piege, resultat, texte, utilise, verification } from "../../../export/corrigeTableau";
import { q, qL } from "../communReels/outilsReels";
import type { Q } from "../communReels/outilsReels";
import type { ExerciceSansAbs, TermeAbs } from "./core/types";
import { affineL, casesL, interieurL, morceauL, reponse } from "./ui/format";
import { signe } from "./moteur/verification";

/**
 * Corrigé détaillé « comme au tableau » de `56gen19`, une lettre par écran : a) zéros (une équation du
 * premier degré par valeur absolue), rangés ; b), c), d) sur chaque intervalle, chaque valeur absolue
 * remplacée (signe justifié), puis f(x) développée et réduite ; d) se termine par f par morceaux et le
 * contrôle aux bornes (les morceaux voisins se raccordent).
 */

type E = ExerciceSansAbs;
const t = texte;
const f = latex;
const COURS = "(cours, étape 4)";
const LETTRES = ["b", "c", "d"];

function lignesZero(tm: TermeAbs): LigneCalcul[] {
  const L: LigneCalcul[] = [ligne(`${interieurL(tm)}=0`)];
  if (tm.a === 1) {
    if (tm.b !== 0) L.push(ligne(`x=${qL(tm.zero)}`, tm.b > 0 ? `on retranche ${tm.b}` : `on ajoute ${-tm.b}`));
    return L;
  }
  if (tm.b !== 0) L.push(ligne(`${affineL(tm.a, 0)}=${-tm.b}`, tm.b > 0 ? `on retranche ${tm.b}` : `on ajoute ${-tm.b}`));
  L.push(ligne(`x=${qL(tm.zero)}`, `on divise par ${tm.a}`));
  return L;
}

/** « 2\left(-x+3\right) » ou « -\left(2x+1\right) » : le terme α·(±(a x + b)) avant distribution. */
function termeRemplace(tm: TermeAbs, s: number, premier: boolean): string {
  const coef = tm.alpha * s;
  const signeTxt = coef < 0 ? "-" : premier ? "" : "+";
  const abs = Math.abs(coef);
  return `${signeTxt}${abs === 1 ? "" : abs}\\left(${interieurL(tm)}\\right)`;
}

/** Morceau i écrit en x (substitution brute) : « -3\cdot\left(-\dfrac{3}{2}\right)-2 ». */
function substitue(e: E, i: number, x: Q): string {
  const [pente, ord] = e.morceaux[i];
  const xs = x.n < 0 || x.d !== 1 ? `\\left(${qL(x)}\\right)` : qL(x);
  const terme = pente === 0 ? "" : pente === 1 ? xs : pente === -1 ? `-${xs}` : `${pente}\\cdot ${xs}`;
  if (!terme) return `${ord}`;
  return ord === 0 ? terme : `${terme}${ord > 0 ? "+" : "-"}${Math.abs(ord)}`;
}

/** « f(z) = morceau substitué », puis « = valeur » si le morceau n'est pas constant. */
function lignesRaccord(e: E, i: number, z: Q, justification: string): LigneCalcul[] {
  const sub = substitue(e, i, z);
  const v = qL(valeurEn(e, i, z));
  const L = [ligne(`f\\left(${qL(z)}\\right)=${sub}`, justification)];
  if (sub !== v) L.push(ligne(`=${v}`));
  return L;
}

const valeurEn = (e: E, i: number, x: Q): Q => {
  const [pente, ord] = e.morceaux[i];
  return q(pente * x.n + ord * x.d, x.d);
};

export function correctionDetailleeSansAbs(e: E): EtapeCorrection[] {
  const [t1, t2] = e.termes;
  const etapes: EtapeCorrection[] = [
    utilise("a", [t(`Une valeur absolue change d'écriture là où ce qui est entre les barres s'annule ; on range les zéros pour découper la droite ${COURS}.`)]),
    calcul("a", [...lignesZero(t1), ...lignesZero(t2), ligne(`${qL(e.z1)}<${qL(e.z2)}`, "on range les zéros")]),
    resultat("a", reponse(e, "zeros")),
    piege("a", [t("Prendre l'opposé du nombre écrit dans la barre comme zéro sans résoudre (le zéro de "), f(interieurL(t2)), t(" est "), f(qL(t2.zero)), t(").")]),
  ];
  [0, 1, 2].forEach((i) => {
    const sq = LETTRES[i];
    const L: LigneCalcul[] = [];
    for (const tm of [t1, t2]) {
      const s = signe(e, tm, i);
      L.push(ligne(`\\left|${interieurL(tm)}\\right|=${s > 0 ? interieurL(tm) : affineL(-tm.a, -tm.b)}`, [f(`${interieurL(tm)}${s > 0 ? "\\geq" : "<"}0`), t(" sur cet intervalle")]));
    }
    const remplace = `${termeRemplace(t1, signe(e, t1, i), true)}${termeRemplace(t2, signe(e, t2, i), false)}${e.k === 0 ? "" : e.k > 0 ? `+${e.k}` : `${e.k}`}`;
    L.push(ligne(`f(x)=${remplace}`, "on remplace chaque valeur absolue"));
    const d1 = affineL(t1.alpha * signe(e, t1, i) * t1.a, t1.alpha * signe(e, t1, i) * t1.b);
    const d2 = affineL(t2.alpha * signe(e, t2, i) * t2.a, t2.alpha * signe(e, t2, i) * t2.b);
    const developpe = `${d1}${d2.startsWith("-") ? "" : "+"}${d2}${e.k === 0 ? "" : e.k > 0 ? `+${e.k}` : `${e.k}`}`;
    L.push(ligne(`=${developpe}`, "on distribue"));
    L.push(ligne(`=${morceauL(e, i)}`, "on réduit"));
    etapes.push(
      utilise(sq, [t(`Pour ${["x < z₁", "z₁ ≤ x < z₂", "x ≥ z₂"][i]}, on remplace |A| par A si A ≥ 0 et par −A si A < 0 ${COURS}.`)]),
      calcul(sq, L, [t("Sur cet intervalle :")]),
      resultat(sq, reponse(e, (["gauche", "milieu", "droite"] as const)[i])),
    );
    if (i === 2) {
      etapes.push(resultat(sq, [f(casesL(e))], "Conclusion"));
      etapes.push(
        verification(sq, [t("Les morceaux voisins se raccordent aux zéros :")], [
          ...lignesRaccord(e, 0, e.z1, "morceau de gauche en z₁"),
          ...lignesRaccord(e, 1, e.z1, "morceau du milieu en z₁ : même valeur"),
          ...lignesRaccord(e, 1, e.z2, "morceau du milieu en z₂"),
          ...lignesRaccord(e, 2, e.z2, "morceau de droite en z₂ : même valeur"),
        ]),
      );
    }
    etapes.push(piege(sq, [t(i === 1 ? "Se tromper de signe pour une seule des deux expressions : sur l'intervalle du milieu, elles sont de signes contraires." : "Oublier de distribuer le signe « − » devant une parenthèse.")]));
  });
  return etapes;
}
