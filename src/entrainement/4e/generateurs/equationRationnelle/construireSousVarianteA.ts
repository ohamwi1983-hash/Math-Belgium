import type { Exercice } from "../../core/generateur.types";
import type { ExerciceDeuxFractionsLineaires, FractionAReduire } from "../../core/equationRationnelle.types";
import type { PolynomeLineaire } from "../../core/simplification.types";
import { randomInt, randomNonZeroInt } from "../secondDegre/aleatoire";
import { reduireSiPossible } from "./reductionFraction";

interface Parametres {
  k1: number;
  p1: number;
  k2: number;
  p2: number;
  k4: number;
  p4: number;
  lambda: number;
  racineValide: number;
}

/**
 * Tire k1,p1,k2,p2,k4,p4,λ dans [-plage,plage] (prompt-2-cas3-degre1.md, sous-variante a) et
 * vérifie que la racine valide (k1·p1-λ·k2·p2)/(k1-λ·k2) — solution de P1_1-λ·P1_2=0 — tombe sur
 * un entier différent de p4 (sinon racine double, dégénéré) et de p2 (sinon elle serait elle aussi
 * une racine étrangère, cassant la garantie "un seul rejet"). `p1` est aussi exclu de `p2`
 * (prompt-3-simplifier-et-isolement-flexible.md) : si p1=p2, la fraction gauche P1_1/P1_2
 * s'effondrerait identiquement en une constante k1/k2, réduisant toute l'équation à un test
 * numérique sans x — un cas dégénéré que le reste de l'architecture (bâtie sur une équation
 * quadratique) ne sait pas traiter.
 */
function tirerParametres(plage: number): Parametres | null {
  const k1 = randomNonZeroInt(-4, 4);
  const k2 = randomNonZeroInt(-4, 4);
  const k4 = randomNonZeroInt(-4, 4);
  const lambda = randomNonZeroInt(-4, 4);

  let p1 = randomInt(-plage, plage);
  const p4 = randomInt(-plage, plage);
  let p2 = randomInt(-plage, plage);
  while (p2 === p4) p2 = randomInt(-plage, plage);
  while (p1 === p2) p1 = randomInt(-plage, plage);

  const denominateur = k1 - lambda * k2;
  if (denominateur === 0) return null;

  const numerateur = k1 * p1 - lambda * k2 * p2;
  if (numerateur % denominateur !== 0) return null;

  const racineValide = numerateur / denominateur;
  if (racineValide === p4 || racineValide === p2) return null;

  return { k1, p1, k2, p2, k4, p4, lambda, racineValide };
}

const TENTATIVES_PAR_PLAGE = 300;
const PLAGES = [6, 10, 15];

/**
 * Sous-variante (a) : dénominateurs proportionnels (prompt-2-cas3-degre1.md). P1_4=k4(x-p4)
 * choisi, λ choisi, P1_3=λ·P1_4. P1_1,P1_2 choisis librement (racine de P1_2 ≠ racine de P1_4).
 *
 * `equationIsolee` est désormais toujours **linéaire** (chemin linéaire, prompt-4-chemin-lineaire.md,
 * section 4) : P1_3/P1_4 partage exactement la même racine p4 au numérateur et au dénominateur
 * (P1_3=λ·P1_4), donc cette fraction se réduit intégralement à la constante λ — pas seulement par
 * un facteur numérique comme une réduction ordinaire (voir reductionFraction.ts), mais par
 * annulation complète du facteur (x-p4). Cette fraction est donc désormais **toujours** proposée à
 * l'étape "simplifier" (revirement sur l'exclusion précédente — voir CLAUDE.md), construite
 * directement ici plutôt que via `reduireSiPossible` (qui ne gère que la réduction numérique entre
 * racines distinctes). Une fois réduite à λ, l'équation devient `P1_1 = λ·P1_2`, c'est-à-dire
 * `P1_1 - λ·P1_2 = 0` — un polynôme de degré 1 (a=0), plus jamais quadratique pour cette
 * sous-variante. La racine unique de cette équation linéaire est exactement `racineValide`
 * (déjà la racine du facteur `P1_1-λ·P1_2` dans l'ancienne factorisation quadratique
 * `P1_4·(P1_1-λ·P1_2)=0` — invariante, elle n'a jamais dépendu de p4). `p4` disparaît des racines
 * de `equationIsolee` (annulé par la simplification) mais reste une CE de l'énoncé affiché.
 * `equationIsolee` reste classée `mise_en_evidence_generalisee` (aucune des 4 techniques réelles ne
 * s'applique) — cette catégorie, combinée à `enonce.a===0`, fait sauter à la fois la reconnaissance
 * et la factorisation (nécessiteReconnaissance/nécessiteFactorisation,
 * sessionEquationRationnelle.ts), menant directement de l'isolement aux racines, où l'élève saisit
 * deux fois la même valeur.
 */
export function construireSousVarianteA(): ExerciceDeuxFractionsLineaires {
  for (const plage of PLAGES) {
    for (let i = 0; i < TENTATIVES_PAR_PLAGE; i++) {
      const resultat = tirerParametres(plage);
      if (!resultat) continue;

      const { k1, p1, k2, p2, k4, p4, lambda, racineValide } = resultat;

      const numerateurGauche: PolynomeLineaire = { k: k1, p: p1 };
      const denominateurGauche: PolynomeLineaire = { k: k2, p: p2 };
      const denominateurDroit: PolynomeLineaire = { k: k4, p: p4 };
      const numerateurDroit: PolynomeLineaire = { k: lambda * k4, p: p4 };

      const reductionGauche = reduireSiPossible("gauche", numerateurGauche, denominateurGauche);
      const fractionDroite: FractionAReduire = {
        cote: "droite",
        numerateur: numerateurDroit,
        denominateur: denominateurDroit,
        diviseur: Math.abs(k4),
      };
      const fractionsSimplifiables = reductionGauche.entree
        ? [reductionGauche.entree, fractionDroite]
        : [fractionDroite];

      // P1_1' - λ·P1_2' = (k1'x - k1'p1) - λ(k2'x - k2'p2) = (k1'-λk2')x + (λk2'p2 - k1'p1).
      const b = reductionGauche.kNumerateurEffectif - lambda * reductionGauche.kDenominateurEffectif;
      const c = lambda * reductionGauche.kDenominateurEffectif * p2 - reductionGauche.kNumerateurEffectif * p1;
      const equationIsolee: Exercice = {
        categorie: "mise_en_evidence_generalisee",
        enonce: { a: 0, b, c },
        solution: { racines: [racineValide, racineValide], racinesExactes: true },
        formeAffichage: "canonique",
      };
      const ce = ([p2, p4] as [number, number]).sort((x, y) => x - y);

      return {
        construction: "deux_fractions_lineaires",
        numerateurGauche,
        denominateurGauche,
        numerateurDroit,
        denominateurDroit,
        ce,
        equationIsolee,
        fractionsSimplifiables,
      };
    }
  }

  throw new Error("construireSousVarianteA : aucune combinaison valide trouvée");
}
