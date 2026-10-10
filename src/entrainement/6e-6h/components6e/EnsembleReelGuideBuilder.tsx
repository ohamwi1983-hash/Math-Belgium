import { useState } from "react";
import type { EnsembleReelGuide, FormeEnsembleReel, MorceauIntervalle } from "../core6e/ensembleReel.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { Katex } from "../components/Katex";

/**
 * Construction GUIDÉE d'un ensemble de ℝ (forme + pièces structurées, jamais de LaTeX libre à
 * parser) — réplique le PRINCIPE déjà établi par `components5e/EnsembleReelGuideBuilder.tsx`
 * (5gen1), jamais importé (chaque chantier reste indépendant, voir CLAUDE.md). Diverge sur un
 * point : ce composant n'a PAS son propre bouton "Valider" (contrairement à 5gen1, où l'ensemble
 * EST toute la réponse de l'écran) — `6gen1` a besoin de DEUX champs `EnsembleReelGuide`
 * (domaine ET image) combinés derrière UN SEUL bouton "Valider" sur l'écran 1 : ce composant
 * remonte donc sa valeur courante en continu via `onChange` (`null` tant que la saisie guidée
 * n'est pas complète), laissant le parent décider quand la combinaison des deux champs est prête.
 *
 * **Alignement style 4e** (`promptalignementstyle4epour6e.md`, points 3/4/8) — corrige 2 écarts
 * trouvés à l'audit : les toggles `-∞`/`valeur` et `valeur`/`+∞` de chaque morceau étaient rendus
 * via un `<select>` HTML (jamais légitime pour une réponse élève, réservé à un panneau dev), et les
 * boutons de retrait de ligne affichaient le mot "Retirer" au lieu d'une croix rouge — corrigés en
 * répliquant FIDÈLEMENT (mêmes classes CSS, même mécanique à 3 états) le pattern déjà établi côté
 * 4e par `MorceauIntervalleInput`/`ListeMorceauxInput` (`src/ui/morceauIntervalle.ts`) : crochet
 * gauche/droit `null` tant que non cliqué activement par l'élève (jamais présélectionné), bouton
 * "?" avant le premier clic, alternance `[`↔`]` (gauche) / `]`↔`[` (droit) ensuite, `-∞`/`+∞` en
 * vrais boutons `.toggle-active` plutôt qu'un menu déroulant, retrait de ligne via
 * `.liste-morceaux-retirer` (`×`).
 *
 * Champs de borne sans `placeholder` visuel (`aria-label` gardé) — même correction ligne-unique
 * ~380px que `MorceauFractionInput.tsx`/`MorceauIntervalleInput.tsx` (4e), répliquée ici à la main
 * plutôt que réutilisée (chaque chantier reste indépendant), voir le commentaire au-dessus de
 * `.morceau-row .morceau-input` dans `App.css`.
 *
 * **Correctifs transversaux (audit capture d'écran 6gen1, en réalité un défaut du composant
 * PARTAGÉ, donc valable pour tout appelant 6e — voir `docs/historique-6e.md`)** :
 * 1. Prévisualisation en direct de l'intervalle en cours de construction — existait déjà côté 5e
 *    (`components5e/EnsembleReelGuideBuilder.tsx::formatTermesApercuEnsemble`), absente ici jusqu'à
 *    ce correctif. Réplique le même principe "bloc fitter" (`.apercu-box`/`.apercu-box-termes`,
 *    déjà partagées globalement) : un fragment KaTeX par morceau plutôt qu'un unique bloc `\cup`-
 *    joint non wrappable. Le préfixe (`label`, ex. "domf=", "x\\in", libellé d'image/surjectivité...)
 *    est un PROP fourni par chaque appelant — jamais figé sur "domf=" ici, puisque ce composant sert
 *    des questions très différentes (domaine, CE, image, intervalle d'injectivité...).
 * 2. Valeur par défaut : `MORCEAU_VIDE` avait `infMode: "-inf"`/`supMode: "+inf"` — un premier
 *    morceau "Union d'intervalle(s)" apparaissait donc déjà rempli `]-∞;+∞[` au lieu de vide
 *    (`?` des deux côtés, aucune borne). Corrigé en `"nombre"`/`""` des deux côtés, comme
 *    `etatMorceauFractionInitial()` (référence 5e, `ui/morceauFraction.ts`) — aucune présélection.
 */
type CrochetGauche = "[" | "]";
type CrochetDroit = "]" | "[";

interface EtatMorceauSaisie {
  crochetGauche: CrochetGauche | null;
  infMode: "-inf" | "nombre";
  infValeur: string;
  crochetDroit: CrochetDroit | null;
  supMode: "+inf" | "nombre";
  supValeur: string;
}

// Correctif 2 (voir en-tête) : "nombre"/"" des deux côtés, jamais "-inf"/"+inf" — un morceau neuf
// n'a RIEN de présélectionné (ni borne infinie, ni crochet), l'élève construit depuis zéro.
const MORCEAU_VIDE: EtatMorceauSaisie = {
  crochetGauche: null,
  infMode: "nombre",
  infValeur: "",
  crochetDroit: null,
  supMode: "nombre",
  supValeur: "",
};

/** Notation francophone à crochets inversés : à gauche, fermé="[", ouvert="]" ; premier clic
 * choisit "[" (fermé), puis alterne — même règle que `toggleCrochetGauche` (4e). */
function toggleCrochetGauche(actuel: CrochetGauche | null): CrochetGauche {
  if (actuel === null) return "[";
  return actuel === "[" ? "]" : "[";
}

/** À droite, fermé="]", ouvert="[" ; premier clic choisit "]" (fermé), puis alterne. */
function toggleCrochetDroit(actuel: CrochetDroit | null): CrochetDroit {
  if (actuel === null) return "]";
  return actuel === "]" ? "[" : "]";
}

/** "-∞" est toujours ouvert à gauche, donc toujours "]" en notation francophone (verrouillé). */
function crochetGaucheEffectif(m: EtatMorceauSaisie): CrochetGauche | null {
  return m.infMode === "-inf" ? "]" : m.crochetGauche;
}

/** "+∞" est toujours ouvert à droite, donc toujours "[" en notation francophone (verrouillé). */
function crochetDroitEffectif(m: EtatMorceauSaisie): CrochetDroit | null {
  return m.supMode === "+inf" ? "[" : m.crochetDroit;
}

function morceauValide(m: EtatMorceauSaisie, parseurNombre: (texte: string) => number | null): MorceauIntervalle | null {
  const inf = m.infMode === "-inf" ? null : parseurNombre(m.infValeur);
  const sup = m.supMode === "+inf" ? null : parseurNombre(m.supValeur);
  if (m.infMode === "nombre" && inf === null) return null;
  if (m.supMode === "nombre" && sup === null) return null;
  const crochetGauche = crochetGaucheEffectif(m);
  const crochetDroit = crochetDroitEffectif(m);
  if (crochetGauche === null || crochetDroit === null) return null;
  return { inf, sup, infInclus: crochetGauche === "[", supInclus: crochetDroit === "]" };
}

const PLACEHOLDER = "\\_";

function formatValeurApercu(valeur: string): string {
  const texte = valeur.trim();
  return texte === "" ? PLACEHOLDER : texte;
}

function formatMorceauApercu(m: EtatMorceauSaisie): string {
  const gauche = crochetGaucheEffectif(m) ?? "?";
  const droite = crochetDroitEffectif(m) ?? "?";
  const inf = m.infMode === "-inf" ? "-\\infty" : formatValeurApercu(m.infValeur);
  const sup = m.supMode === "+inf" ? "+\\infty" : formatValeurApercu(m.supValeur);
  return `${gauche}${inf}\\,;\\,${sup}${droite}`;
}

/** Fragments de la prévisualisation en direct — un fragment par morceau dès que l'union en compte
 * plusieurs (bloc fitter, voir `.apercu-box-termes`), jamais un unique bloc `\cup`-joint non
 * wrappable. `null` tant qu'aucune forme n'est encore choisie (rien à prévisualiser). */
function formatTermesApercu(forme: FormeEnsembleReel | null, points: string[], morceaux: EtatMorceauSaisie[]): string[] | null {
  if (forme === null) return null;
  if (forme === "reel") return ["\\mathbb{R}"];
  if (forme === "prive_points") return [`\\mathbb{R} \\setminus \\{${points.map(formatValeurApercu).join("\\,;\\,")}\\}`];
  if (morceaux.length <= 1) return [morceaux.length === 0 ? PLACEHOLDER : formatMorceauApercu(morceaux[0])];
  return morceaux.map((m, i) => formatMorceauApercu(m) + (i < morceaux.length - 1 ? " \\cup" : ""));
}

interface Props {
  onChange: (ensemble: EnsembleReelGuide | null) => void;
  /** Préfixe LaTeX de la prévisualisation en direct (ex. `"domf="`, `"x\\in"`, `"\\text{Im}(f)="`,
   * l'intitulé approprié pour un intervalle de surjectivité...) — fourni par CHAQUE appelant, adapté
   * à ce que représente concrètement l'intervalle demandé à cet écran précis (voir en-tête de
   * fichier, correctif 1 — jamais figé sur "domf=" au niveau du composant partagé). */
  label: string;
  disabled?: boolean;
  /** `true` après une tentative de validation restée incorrecte pour CE champ précisément (jamais
   * un état global de l'écran) — surligne en rouge les champs texte libres actuellement visibles
   * (valeur exclue, bornes), même convention que `.is-erronee` partout ailleurs sur la plateforme
   * (voir CLAUDE.md, "Retour visuel rouge"). */
  erronee?: boolean;
  /** Analyseur utilisé pour chaque valeur libre (borne, point exclu). Défaut :
   * `parserNombreOuFraction` (entier/décimal/fraction "p/q" — comportement historique, inchangé
   * pour tous les appelants existants). Un appelant dont les réponses attendues peuvent porter des
   * constantes symboliques (`pi`, `sqrt`, `atan`...) passe explicitement un analyseur plus général
   * (ex. `evaluerValeurCyclometrique`, déjà partagé 6gen2/6gen3/6gen4) — jamais réimplémenté ici. */
  parseurNombre?: (texte: string) => number | null;
}

export function EnsembleReelGuideBuilder({ onChange, label, disabled = false, erronee = false, parseurNombre = parserNombreOuFraction }: Props) {
  const [forme, setForme] = useState<FormeEnsembleReel | null>(null);
  const [points, setPoints] = useState<string[]>([""]);
  const [morceaux, setMorceaux] = useState<EtatMorceauSaisie[]>([{ ...MORCEAU_VIDE }]);

  function emettre(nouvelleForme: FormeEnsembleReel | null, nouveauxPoints: string[], nouveauxMorceaux: EtatMorceauSaisie[]) {
    const pv = nouveauxPoints.map((p) => parseurNombre(p));
    const mv = nouveauxMorceaux.map((m) => morceauValide(m, parseurNombre));
    if (nouvelleForme === "reel") return onChange({ forme: "reel", points: [], morceaux: [] });
    if (nouvelleForme === "prive_points") {
      if (nouveauxPoints.length === 0 || pv.some((v) => v === null)) return onChange(null);
      return onChange({ forme: "prive_points", points: pv as number[], morceaux: [] });
    }
    if (nouvelleForme === "intervalles") {
      if (nouveauxMorceaux.length === 0 || mv.some((m) => m === null)) return onChange(null);
      return onChange({ forme: "intervalles", points: [], morceaux: mv as MorceauIntervalle[] });
    }
    onChange(null);
  }

  function choisirForme(nouvelleForme: FormeEnsembleReel) {
    setForme(nouvelleForme);
    emettre(nouvelleForme, points, morceaux);
  }

  function majPoints(nouveauxPoints: string[]) {
    setPoints(nouveauxPoints);
    emettre(forme, nouveauxPoints, morceaux);
  }

  function majMorceaux(nouveauxMorceaux: EtatMorceauSaisie[]) {
    setMorceaux(nouveauxMorceaux);
    emettre(forme, points, nouveauxMorceaux);
  }

  function majMorceau(index: number, patch: Partial<EtatMorceauSaisie>) {
    majMorceaux(morceaux.map((v, j) => (j === index ? { ...v, ...patch } : v)));
  }

  const termesApercu = formatTermesApercu(forme, points, morceaux);

  return (
    <div className="ensemble-reel-builder">
      {termesApercu !== null && (
        <div className="apercu-box apercu-box-termes">
          <Katex expression={label} />
          {termesApercu.map((t, i) => (
            <Katex key={i} expression={t} />
          ))}
        </div>
      )}

      <div className="options-grid-compact">
        <button type="button" className={`btn ${forme === "reel" ? "toggle-active" : ""}`} disabled={disabled} onClick={() => choisirForme("reel")}>
          ℝ (tout)
        </button>
        <button type="button" className={`btn ${forme === "prive_points" ? "toggle-active" : ""}`} disabled={disabled} onClick={() => choisirForme("prive_points")}>
          ℝ (sauf)
        </button>
        <button type="button" className={`btn ${forme === "intervalles" ? "toggle-active" : ""}`} disabled={disabled} onClick={() => choisirForme("intervalles")}>
          Intervalle(s)
        </button>
      </div>

      {forme === "prive_points" && (
        <div className="liste-morceaux contenu-conditionnel">
          {points.map((p, i) => (
            <div key={i} className="liste-morceaux-ligne">
              <input
                type="text"
                className={`text-input${erronee ? " is-erronee" : ""}`}
                placeholder="valeur exclue"
                value={p}
                disabled={disabled}
                onChange={(e) => majPoints(points.map((v, j) => (j === i ? e.target.value : v)))}
              />
              {points.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer le point ${i + 1}`}
                  disabled={disabled}
                  onClick={() => majPoints(points.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" disabled={disabled} onClick={() => majPoints([...points, ""])}>
            + Ajouter un point
          </button>
        </div>
      )}

      {forme === "intervalles" && (
        <div className="liste-morceaux contenu-conditionnel">
          {morceaux.map((m, i) => (
            <div key={i} className="liste-morceaux-ligne">
              <div className="morceau-row">
                <button
                  type="button"
                  className="btn bracket-btn"
                  disabled={disabled || m.infMode === "-inf"}
                  aria-label="Crochet gauche"
                  onClick={() => majMorceau(i, { crochetGauche: toggleCrochetGauche(m.crochetGauche) })}
                >
                  {crochetGaucheEffectif(m) ?? "?"}
                </button>
                <input
                  type="text"
                  className={`text-input morceau-input${erronee ? " is-erronee" : ""}`}
                  value={m.infMode === "-inf" ? "" : m.infValeur}
                  disabled={disabled || m.infMode === "-inf"}
                  aria-label="Borne gauche"
                  onChange={(e) => majMorceau(i, { infMode: "nombre", infValeur: e.target.value })}
                />
                <button
                  type="button"
                  className={m.infMode === "-inf" ? "btn toggle-active" : "btn"}
                  disabled={disabled}
                  onClick={() => majMorceau(i, m.infMode === "-inf" ? { infMode: "nombre", infValeur: "" } : { infMode: "-inf", infValeur: "" })}
                >
                  -∞
                </button>
                <span className="morceau-separateur">;</span>
                <button
                  type="button"
                  className={m.supMode === "+inf" ? "btn toggle-active" : "btn"}
                  disabled={disabled}
                  onClick={() => majMorceau(i, m.supMode === "+inf" ? { supMode: "nombre", supValeur: "" } : { supMode: "+inf", supValeur: "" })}
                >
                  +∞
                </button>
                <input
                  type="text"
                  className={`text-input morceau-input${erronee ? " is-erronee" : ""}`}
                  value={m.supMode === "+inf" ? "" : m.supValeur}
                  disabled={disabled || m.supMode === "+inf"}
                  aria-label="Borne droite"
                  onChange={(e) => majMorceau(i, { supMode: "nombre", supValeur: e.target.value })}
                />
                <button
                  type="button"
                  className="btn bracket-btn"
                  disabled={disabled || m.supMode === "+inf"}
                  aria-label="Crochet droit"
                  onClick={() => majMorceau(i, { crochetDroit: toggleCrochetDroit(m.crochetDroit) })}
                >
                  {crochetDroitEffectif(m) ?? "?"}
                </button>
              </div>
              {morceaux.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer le morceau ${i + 1}`}
                  disabled={disabled}
                  onClick={() => majMorceaux(morceaux.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" disabled={disabled} onClick={() => majMorceaux([...morceaux, { ...MORCEAU_VIDE }])}>
            + Ajouter un morceau
          </button>
        </div>
      )}
    </div>
  );
}
