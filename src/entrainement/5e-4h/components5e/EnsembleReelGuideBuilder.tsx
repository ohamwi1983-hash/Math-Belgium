import { useState } from "react";
import type { ReactNode } from "react";
import type { EnsembleReelGuide, FormeEnsemble, MorceauEnsemble } from "../core5e/domaineDefinition.types";
import type { Morceau } from "../core/inequation.types";
import { parserNombreOuFraction } from "../moteur/verificationAnalyseFonction";
import { verifierEnsembleReelGuide } from "../moteur5e/verificationDomaineDefinition";
import { Katex } from "../components/Katex";
import { ListeMorceauxFractionInput } from "../components/ListeMorceauxFractionInput";
import { ValidationEcran } from "../../components/ValidationEcran";
import type { ValidationEtapeProps } from "../../components/ValidationEcran";
import type { EtatListeMorceauxFraction } from "../ui/listeMorceauxFraction";
import { construireListeFraction, etatListeFractionInitiale } from "../ui/listeMorceauxFraction";
import type { EtatMorceauFraction } from "../ui/morceauFraction";
import { crochetDroitEffectifFraction, crochetGaucheEffectifFraction } from "../ui/morceauFraction";

/**
 * Construction GUIDÉE d'un ensemble de R (forme + pièces structurées, jamais de LaTeX libre à
 * parser — voir CLAUDE.md section 5gen1). Réutilisé à la fois par l'écran "résolution" (une seule
 * condition, familles rationnelle/irrationnelleSimple/racineImpaireDenominateur/le radicande de
 * racineSurFraction) et par l'écran "domf" final (toutes familles) — les deux posent la même
 * question de forme, seule la SOURCE diffère (voir la note de tête de
 * `core5e/domaineDefinition.types.ts::EnsembleReelGuide`).
 *
 * Réutilise DIRECTEMENT les composants/primitives 4e du même écran ("Caractéristiques algébriques
 * d'une fonction de référence", niveau 1 — `components/EtapeDomaineNiveau1.tsx`), jamais une
 * réimplémentation partielle : `.options-grid` + `.btn.toggle-active` pour le choix de forme,
 * `.liste-morceaux*` pour la liste de points exclus, et surtout `ListeMorceauxFractionInput`/
 * `MorceauFractionInput` (`ui/listeMorceauxFraction.ts`/`ui/morceauFraction.ts`, variante
 * fraction-compatible de la construction d'intervalle du gen6 4e "Inéquations rationnelles") pour
 * les unions d'intervalles — boutons crochet "?"/"["/"]", boutons "-∞"/"+∞" en `.toggle-active`,
 * jamais de `<select>`. Import cross-chantier de petites primitives pures, même principe déjà
 * établi ailleurs dans ce fichier (`parserNombreOuFraction`) — voir CLAUDE.md, "décision 'import
 * direct cross-chantier'". Seul le contenu logique (`EnsembleReelGuide`/`MorceauEnsemble`, jamais
 * `SolutionEnsemble`/`Morceau` bruts) et l'aperçu LaTeX en temps réel (`prefixApercu`) restent
 * propres à 5gen1.
 */
const PLACEHOLDER = "\\_";

function formatValeurApercu(valeur: string): string {
  const texte = valeur.trim();
  return texte === "" ? PLACEHOLDER : texte;
}

function formatMorceauApercu(m: EtatMorceauFraction): string {
  const gauche = crochetGaucheEffectifFraction(m) ?? "?";
  const droite = crochetDroitEffectifFraction(m) ?? "?";
  const inf = m.borneGaucheMode === "-inf" ? "-\\infty" : formatValeurApercu(m.borneGaucheValeur);
  const sup = m.borneDroiteMode === "+inf" ? "+\\infty" : formatValeurApercu(m.borneDroiteValeur);
  return `${gauche}${inf}\\,;\\,${sup}${droite}`;
}

function formatApercuEnsemble(forme: FormeEnsemble | null, points: string[], morceaux: EtatListeMorceauxFraction): string | null {
  if (forme === null) return null;
  if (forme === "reel") return "\\mathbb{R}";
  if (forme === "prive_points") return `\\mathbb{R} \\setminus \\{${points.map(formatValeurApercu).join("\\,;\\,")}\\}`;
  return morceaux.map(formatMorceauApercu).join(" \\cup ");
}

/** Version "bloc fitter" (point 1.3) de l'aperçu — un fragment par morceau, jamais un unique bloc
 * `\cup`-joint non-wrappable dès que l'union compte plusieurs morceaux (même principe que
 * `formatTermesEnsembleReelLatex`, `ui5e/formatDomaineDefinition.ts`). */
function formatTermesApercuEnsemble(forme: FormeEnsemble | null, points: string[], morceaux: EtatListeMorceauxFraction): string[] | null {
  if (forme !== "intervalles" || morceaux.length <= 1) {
    const apercu = formatApercuEnsemble(forme, points, morceaux);
    return apercu === null ? null : [apercu];
  }
  return morceaux.map((m, i) => formatMorceauApercu(m) + (i < morceaux.length - 1 ? " \\cup" : ""));
}

/** `Morceau` (contrat 4e, crochets francophones) → `MorceauEnsemble` (contrat propre à 5gen1) —
 * même convention de crochets que le reste de la plateforme : "[" à gauche = inclus, "]" à droite
 * = inclus (voir `core/inequation.types.ts::Crochet`). */
function morceauEnsembleDepuisMorceau(m: Morceau): MorceauEnsemble {
  return {
    inf: typeof m.borneGauche === "number" ? m.borneGauche : null,
    sup: typeof m.borneDroite === "number" ? m.borneDroite : null,
    infInclus: m.crochetGauche === "[",
    supInclus: m.crochetDroit === "]",
  };
}

interface Props {
  onValider: (ensemble: EnsembleReelGuide) => void;
  /** Préfixe LaTeX de l'aperçu live — `"CE : x\\in"` pour la résolution d'une condition seule,
   * `"domf ="` pour le domf final (voir la note de tête du fichier). */
  prefixApercu: string;
  disabled?: boolean;
  /** Contenu additionnel rendu juste AVANT le bouton "Valider" — ex. le bouton "Aide (pénalisante)"
   * (point 1.6, doit apparaître au-dessus de "Valider", jamais après). Absent par défaut. */
  contenuAvantValider?: ReactNode;
  /** Cible attendue de CET appel du builder (A.2, highlight rouge après tentative ratée) —
   * optionnelle : un appelant qui ne la fournit pas ne déclenche jamais de highlight (comportement
   * historique inchangé). Ne concerne que le sous-formulaire "prive_points" (seule saisie libre de
   * ce composant — "intervalles" délègue au widget 4e partagé `ListeMorceauxFractionInput`, hors
   * périmètre A.2, jamais touché ici). */
  attendu?: EnsembleReelGuide;
  /** Vrai dès qu'au moins une tentative a échoué sur cet écran — même convention `apresEchec` que
   * le reste de la plateforme. Optionnel, comme `attendu`. */
  apresEchec?: boolean;
  /** Présent une fois l'écran terminé (bonne réponse, ou tentatives épuisées) — gèle le formulaire,
   * remplace "Valider" par le bloc `ValidationEcran` (convention CLAUDE.md, "validation/
   * invalidation avant de passer à l'écran suivant"). */
  validation?: ValidationEtapeProps | null;
  /** Bouton « ∅ » (ensemble vide) — 5gen3, où le domaine d'une composée peut être vide (cas
   * particulier du cours). Toujours proposé sur les écrans concernés, jamais seulement quand la
   * réponse est vide (il ne doit rien trahir). Absent par défaut (comportement inchangé ailleurs). */
  avecVide?: boolean;
}

/** Audit 5e ch. 1 (lot B) : « Valider » n'est plus grisé sans explication — une saisie incomplète ou
 * illisible affiche un message et n'est JAMAIS transmise (aucune tentative consommée). */
const FIN_SANS_TENTATIVE = " Cette saisie ne compte pas comme une tentative.";
function messageIncomplet(forme: FormeEnsemble | "vide" | null, points: string[], morceaux: EtatListeMorceauxFraction): string {
  if (forme === null) return "Choisis d'abord la forme de l'ensemble (ℝ, ℝ privé de valeurs, ou intervalle(s))." + FIN_SANS_TENTATIVE;
  if (forme === "prive_points") {
    if (points.some((p) => p.trim() === "")) return "Écris chaque valeur exclue (ou retire la ligne vide avec ×)." + FIN_SANS_TENTATIVE;
    return "Valeur non reconnue : écris chaque nombre, par exemple −3, 5/2 ou 2,5." + FIN_SANS_TENTATIVE;
  }
  const crochetManquant = morceaux.some((m) => crochetGaucheEffectifFraction(m) === null || crochetDroitEffectifFraction(m) === null);
  const borneVide = morceaux.some((m) => (m.borneGaucheMode === "nombre" && m.borneGaucheValeur.trim() === "") || (m.borneDroiteMode === "nombre" && m.borneDroiteValeur.trim() === ""));
  if (borneVide) return "Écris chaque borne (un nombre), ou choisis −∞ / +∞." + FIN_SANS_TENTATIVE;
  if (crochetManquant) return "Choisis chaque crochet (« [ » ou « ] ») avant de valider." + FIN_SANS_TENTATIVE;
  return "Borne non reconnue : écris chaque borne comme un nombre, par exemple −3, 5/2 ou 2,5." + FIN_SANS_TENTATIVE;
}

export function EnsembleReelGuideBuilder({ onValider, prefixApercu, disabled: disabledProp = false, contenuAvantValider, attendu, apresEchec = false, validation, avecVide = false }: Props) {
  const disabled = disabledProp || !!validation;
  const [forme, setForme] = useState<FormeEnsemble | "vide" | null>(null);
  const [points, setPoints] = useState<string[]>([""]);
  const [morceaux, setMorceaux] = useState<EtatListeMorceauxFraction>(etatListeFractionInitiale());
  const [message, setMessage] = useState<string | null>(null);

  function choisirForme(nouvelleForme: FormeEnsemble | "vide") {
    setForme(nouvelleForme);
    setPoints([""]);
    setMorceaux(etatListeFractionInitiale());
    setMessage(null);
  }

  const pointsValides = points.map((p) => parserNombreOuFraction(p));
  const listeIntervalles = construireListeFraction(morceaux);
  /** Les points du sous-formulaire "prive_points" forment UNE seule réponse (l'ensemble exclu),
   * jamais des réponses indépendantes — même flag partagé par toute la liste, même convention que
   * "sommetErronee" (2 champs x/y, une seule notion) dans le pattern de référence 4e
   * (`EtapeCaracteristiquesEquationParaboleDeveloppee.tsx`). */
  const saisieActuellePoints: EnsembleReelGuide | null = pointsValides.every((v) => v !== null)
    ? { forme: "prive_points", points: pointsValides as number[], morceaux: [] }
    : null;
  const pointsErronee =
    apresEchec && attendu !== undefined && forme === "prive_points" && (saisieActuellePoints === null || !verifierEnsembleReelGuide(saisieActuellePoints, attendu));
  const complet =
    forme === "reel" ||
    forme === "vide" ||
    (forme === "prive_points" && points.length > 0 && pointsValides.every((v) => v !== null)) ||
    (forme === "intervalles" && listeIntervalles !== null);

  function valider() {
    if (forme === null || !complet) {
      setMessage(messageIncomplet(forme, points, morceaux));
      return;
    }
    setMessage(null);
    if (forme === "reel") return onValider({ forme: "reel", points: [], morceaux: [] });
    // Ensemble vide : une réunion de ZÉRO intervalle (forme canonique déjà reconnue par
    // `verifierEnsembleReelGuide`, rendue « ∅ » par `formatEnsembleReelLatex`).
    if (forme === "vide") return onValider({ forme: "intervalles", points: [], morceaux: [] });
    if (forme === "prive_points") return onValider({ forme: "prive_points", points: pointsValides as number[], morceaux: [] });
    onValider({ forme: "intervalles", points: [], morceaux: (listeIntervalles as Morceau[]).map(morceauEnsembleDepuisMorceau) });
  }

  const termesApercu = forme === "vide" ? ["\\varnothing"] : formatTermesApercuEnsemble(forme, points, morceaux);

  return (
    <div className="ensemble-reel-builder">
      {termesApercu !== null && (
        <div className="apercu-box apercu-box-termes">
          <Katex expression={prefixApercu} />
          {termesApercu.map((t, i) => (
            <Katex key={i} expression={t} />
          ))}
        </div>
      )}

      <div className="options-grid">
        <button type="button" className={forme === "reel" ? "btn toggle-active" : "btn"} disabled={disabled} onClick={() => choisirForme("reel")}>
          ℝ (tout)
        </button>
        <button type="button" className={forme === "prive_points" ? "btn toggle-active" : "btn"} disabled={disabled} onClick={() => choisirForme("prive_points")}>
          ℝ (sauf)
        </button>
        <button type="button" className={forme === "intervalles" ? "btn toggle-active" : "btn"} disabled={disabled} onClick={() => choisirForme("intervalles")}>
          Intervalle(s)
        </button>
        {avecVide && (
          <button type="button" className={forme === "vide" ? "btn toggle-active" : "btn"} disabled={disabled} onClick={() => choisirForme("vide")}>
            ∅ (vide)
          </button>
        )}
      </div>

      {forme === "prive_points" && (
        <div className="liste-morceaux contenu-conditionnel">
          {points.map((p, i) => (
            <div key={i} className="liste-morceaux-ligne">
              <input
                type="text"
                className={`text-input${pointsErronee ? " is-erronee" : ""}`}
                placeholder="valeur exclue"
                value={p}
                disabled={disabled}
                onChange={(e) => {
                  setMessage(null);
                  setPoints((arr) => arr.map((v, j) => (j === i ? e.target.value : v)));
                }}
              />
              {points.length > 1 && (
                <button
                  type="button"
                  className="btn liste-morceaux-retirer"
                  aria-label={`Retirer le point ${i + 1}`}
                  disabled={disabled}
                  onClick={() => setPoints((arr) => arr.filter((_, j) => j !== i))}
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button type="button" className="btn liste-morceaux-ajouter" disabled={disabled} onClick={() => setPoints((arr) => [...arr, ""])}>
            + Ajouter un point
          </button>
        </div>
      )}

      {forme === "intervalles" && (
        <div className="contenu-conditionnel">
          <ListeMorceauxFractionInput
            etat={morceaux}
            onChange={(e) => {
              setMessage(null);
              setMorceaux(e);
            }}
          />
        </div>
      )}

      {!validation && (
        <>
          {contenuAvantValider}
          <button type="button" className="btn btn-primary" disabled={disabled} onClick={valider}>
            Valider
          </button>
          {message && (
            <p className="alert-error" role="alert">
              {message}
            </p>
          )}
        </>
      )}
      {validation && <ValidationEcran {...validation} />}
    </div>
  );
}
