function pgcd(a: number, b: number): number {
  return b === 0 ? a : pgcd(b, a % b);
}

const DENOMINATEUR_MAX = 100;

/**
 * Rend un nombre rationnel sous forme de fraction irréductible "p/q", ou l'entier simple s'il est
 * entier (jamais "n/1") — point 2, prompt-4-modifications-analyse-fonction.md. `valeur` est un
 * float mais toujours issu d'un calcul exact sur des entiers (xS=-b/(2a), yS=(4ac-b²)/(4a)), donc
 * un dénominateur borné suffit à le retrouver exactement (recherche du plus petit q tel que
 * valeur·q soit (quasi) entier, puis réduction par PGCD).
 */
export function formatFractionIrreductible(valeur: number, denominateurMax = DENOMINATEUR_MAX): string {
  if (Number.isInteger(valeur)) return String(valeur);

  for (let q = 2; q <= denominateurMax; q++) {
    const p = valeur * q;
    if (Math.abs(p - Math.round(p)) < 1e-9) {
      const numerateur = Math.round(p);
      const diviseur = pgcd(Math.abs(numerateur), q);
      const n = numerateur / diviseur;
      const d = q / diviseur;
      return d === 1 ? String(n) : `${n}/${d}`;
    }
  }
  return String(valeur);
}
