/**
 * Couche présentation (5e) — découpe une équation LaTeX longue en fragments courts pour affichage
 * dans un conteneur `display:flex; flex-wrap:wrap` (motif "bloc fitter" déjà établi, voir
 * `.equation-box-termes`/`.etat-actuel-box-termes`/`.apercu-box-termes`, App.css). KaTeX ne peut
 * JAMAIS retourner à la ligne à l'intérieur d'un seul élément (`.katex .base{white-space:nowrap}`,
 * confirmé dans node_modules/katex/dist/katex.min.css) — le seul moyen d'obtenir un retour à la
 * ligne est de scinder la chaîne LaTeX en plusieurs `<Katex>` indépendants, laissés wrapper
 * naturellement par CSS selon la largeur d'écran réelle (pas de mesure JS explicite nécessaire).
 *
 * Stratégie en deux temps (promptcorrections5gen578blocfitter.md, section 3) : (1) retour à la
 * ligne juste après le signe "=" ; (2) si besoin, d'autres retours à la ligne, mais UNIQUEMENT à des
 * endroits qui ne compromettent pas la lisibilité — jamais entre une parenthèse et son contenu,
 * jamais un terme final isolé sans lien visuel. Réalisé ici en scindant UNIQUEMENT au niveau
 * d'imbrication 0 (jamais à l'intérieur d'une parenthèse/accolade/crochet, donc jamais entre une
 * parenthèse et son contenu par construction), sur le signe "=" et sur les opérateurs "+"/"-" de
 * plus haut niveau (l'opérateur reste TOUJOURS collé au terme qui le suit, jamais isolé seul).
 * Les fragments restent affichés dans le même conteneur/bloc coloré (`.equation-box`) : un fragment
 * qui wrap sur la ligne suivante reste visuellement rattaché au reste de l'équation (même fond, même
 * boîte), jamais "détaché" comme lorsque le débordement casse la mise en page d'un bloc KaTeX unique.
 *
 * Cas particulier géré séparément : deux groupes `\left(...\right)` JUXTAPOSÉS (multiplication
 * implicite, ex. facteurs d'un produit factorisé "(...)(...) = 0") ne contiennent aucun opérateur
 * de haut niveau entre eux — le scan par profondeur seul ne les scinderait donc jamais, même très
 * longs à eux deux. La frontière littérale `\right)\left(` est un marqueur SANS AMBIGUÏTÉ (jamais
 * produit par une macro à arguments accolés comme `\dfrac{a}{b}`, qui utilise des accolades, pas
 * `\left`/`\right`) : on y scinde toujours, en fin de passe, sur CHAQUE fragment déjà obtenu.
 */
function scinderFacteursJuxtaposes(fragment: string): string[] {
  const marqueur = "\\right)\\left(";
  const parties = fragment.split(marqueur);
  if (parties.length === 1) return [fragment];
  return parties.map((partie, i) => {
    if (i === 0) return `${partie}\\right)`;
    if (i === parties.length - 1) return `\\left(${partie}`;
    return `\\left(${partie}\\right)`;
  });
}

export function decouperEquationLongueLatex(latex: string): string[] {
  const fragments: string[] = [];
  let profondeur = 0;
  let courant = "";

  for (const c of latex) {
    if (c === "(" || c === "{" || c === "[") profondeur++;
    if (c === ")" || c === "}" || c === "]") profondeur--;

    if (profondeur === 0 && c === "=") {
      fragments.push(courant + c);
      courant = "";
      continue;
    }

    if (profondeur === 0 && (c === "+" || c === "-") && courant.trim() !== "") {
      fragments.push(courant);
      courant = c;
      continue;
    }

    courant += c;
  }
  if (courant !== "") fragments.push(courant);

  return fragments.flatMap(scinderFacteursJuxtaposes);
}
