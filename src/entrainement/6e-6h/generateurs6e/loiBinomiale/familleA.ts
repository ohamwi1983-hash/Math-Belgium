import type { ExerciceLoiBinomialeA } from "../../core6e/loiBinomiale.types";
import { tirerEntier, tirerParmi } from "./aleatoire";
import { CONTEXTES_A_BINOMIAUX, CONTEXTES_A_NON_BINOMIAUX, virgule } from "./contextes";

/**
 * 6gen50, famille A (audit, G8) : reconnaître un schéma de Bernoulli. Avant, les 4 conditions étaient
 * TOUJOURS vraies (verdict constant). Le verdict « binomiale ? » est tiré d'abord (50 / 50), puis le
 * contexte ; un contexte non binomial fait échouer UNE condition. n et p varient (plus de n = 8,
 * p = 0,2 figés au sélecteur).
 */

export function construireFamilleA(): ExerciceLoiBinomialeA {
  const binomiale = Math.random() < 0.5;
  const n = tirerEntier(5, 20);
  if (!binomiale) {
    const c = tirerParmi(CONTEXTES_A_NON_BINOMIAUX);
    return { famille: "A", texte: c.texte(Math.min(n, 8)), binomiale: false, n: 0, pNum: 0, pDen: 1, condition: c.condition };
  }
  const c = tirerParmi(CONTEXTES_A_BINOMIAUX);
  const p = tirerParmi(c.p);
  const pTexte = c.ecriture === "pourcent" ? `${p.num} %` : c.ecriture === "decimal" ? virgule(p.num / p.den) : "";
  return { famille: "A", texte: c.texte(n, pTexte), binomiale: true, n, pNum: p.num, pDen: p.den, condition: null };
}
