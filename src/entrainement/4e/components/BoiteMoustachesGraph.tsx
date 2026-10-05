import { useState } from "react";
import { Line, Mafs, MovablePoint, Text } from "mafs";
import "mafs/core.css";
import type { CinqNombres, PlageAxe } from "../core/boiteMoustaches.types";
import { EPAISSEUR_TRAIT_ACCENTUE, EPAISSEUR_TRAIT_STANDARD, ZOOM_MAX, ZOOM_MIN, etendreLargeurXPourEtiquettes } from "../ui/mafsTransformation";
import {
  CIBLE_NOMBRE_LIGNES_Y_BOITE,
  DEMI_HAUTEUR_BOITE,
  DEMI_HAUTEUR_MOUSTACHE,
  MANTISSES_GRILLE_BOITE,
  calculerViewBoxBoiteMoustaches,
  cibleNombreLignesXAdaptative,
  ratioGraphe,
  snapHorizontal,
  yLigne,
} from "../ui/boiteMoustachesGraph";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";

const CLES: (keyof CinqNombres)[] = ["min", "q1", "mediane", "q3", "max"];

/** Code couleur des repères (`promptgen36modifications.md`, section 4) — $Q_1$ vert, médiane/$Q_2$
 * violet, $Q_3$ bleu, tout le reste (min/max, moustaches, contour de la boîte) noir/neutre. Mêmes
 * teintes que le reste du projet (`#2f9e44`/`#7048e8`/`#1971c2`, voir "Forme canonique et
 * transformations" et dérivés — jamais réinventées). */
const COULEUR_Q1 = "#2f9e44";
const COULEUR_MEDIANE = "#7048e8";
const COULEUR_Q3 = "#1971c2";
const COULEUR_NEUTRE = "#212529";
const COULEUR_ERRONEE = "#c92a2a";

const COULEUR_PAR_CLE: Record<keyof CinqNombres, string> = {
  min: COULEUR_NEUTRE,
  q1: COULEUR_Q1,
  mediane: COULEUR_MEDIANE,
  q3: COULEUR_Q3,
  max: COULEUR_NEUTRE,
};

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

export interface LigneRenduBoite {
  valeurs: CinqNombres;
  /** "A"/"B" — affiché au-dessus de la boîte, variante "comparaison" uniquement. */
  label?: string;
  /** Présent uniquement sur l'écran "construction" — rend les 5 marqueurs déplaçables par
   * glissement HORIZONTAL cranté (`MovablePoint`/`snapHorizontal`, `boiteMoustachesGraph.ts`). */
  interactif?: {
    erronees?: Partial<Record<keyof CinqNombres, boolean>>;
    onChangerValeur: (cle: keyof CinqNombres, valeur: number) => void;
    /** Pas de crantage du glissement — additif et optionnel, défaut `1` (comportement historique
     * INCHANGÉ pour cet écran lui-même). Introduit pour que "Exercice de synthèse" (chapitre 5)
     * puisse accrocher ses marqueurs à `0,1` sur sa variante `classes` — médiane/Q1/Q3 y sont
     * arrondis à 1 décimale (comme "Médiane" variante classes), jamais forcés à l'entier. */
    pas?: number;
  };
}

interface Props {
  bornePlage: PlageAxe;
  lignes: LigneRenduBoite[];
}

/**
 * Graphe "boîte à moustaches" — rendu **Mafs** (`promptgen36modifications.md`, section 2) : X =
 * échelle réelle des valeurs, Y = simple séparateur de ligne (1 ligne construction/lecture, 2 lignes
 * comparaison — séries A/B partageant le même axe gradué pour une comparaison visuelle directe).
 * Chaque boîte : 2 moustaches + leurs chapeaux + le contour du rectangle en NOIR/neutre, sauf le
 * bord gauche (à $Q_1$, vert), le bord droit (à $Q_3$, bleu) et le trait médian ($Q_2$, violet) —
 * voir le code couleur ci-dessus. Marqueurs (`Point`/`MovablePoint`) rendus UNIQUEMENT quand
 * `ligne.interactif` est fourni (écran "construction") — jamais sur "lecture"/"comparaison", où
 * seule la forme de la boîte est affichée (même principe que l'ancien rendu SVG natif).
 */
export function BoiteMoustachesGraph({ bornePlage, lignes }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const nombreLignes: 1 | 2 = lignes.length === 2 ? 2 : 1;
  const ratio = ratioGraphe(nombreLignes);
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / ratio;
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  const viewBox = calculerViewBoxBoiteMoustaches(bornePlage, nombreLignes);
  const cibleNombreLignesX = cibleNombreLignesXAdaptative(bornePlage);
  const viewBoxEtendu = etendreLargeurXPourEtiquettes(viewBox, cibleNombreLignesX, ratio, MANTISSES_GRILLE_BOITE);

  return (
    <div className="mafs-graph" ref={wrapperRef}>
      <Mafs width={largeur} height={hauteur} viewBox={{ x: viewBoxEtendu.x, y: viewBoxEtendu.y, padding: 0 }} pan={true} zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}>
        <GrilleAdaptative
          largeur={largeur}
          hauteur={hauteur}
          onPasChange={(x, y) => setPas({ x, y })}
          cibleNombreLignes={cibleNombreLignesX}
          cibleNombreLignesY={CIBLE_NOMBRE_LIGNES_Y_BOITE}
          mantissesPersonnalisees={MANTISSES_GRILLE_BOITE}
          masquerEtiquettesY
        />
        {lignes.map((ligne, index) => {
          const y = yLigne(index, nombreLignes);
          const { min, q1, mediane, q3, max } = ligne.valeurs;
          const xParCle: Record<keyof CinqNombres, number> = { min, q1, mediane, q3, max };

          return (
            <g key={`ligne-${index}`}>
              {ligne.label && (
                <Text x={mediane} y={y + DEMI_HAUTEUR_BOITE} attach="n" color={COULEUR_NEUTRE}>
                  {ligne.label}
                </Text>
              )}

              {/* Moustaches + chapeaux — toujours neutres. */}
              <Line.Segment point1={[min, y]} point2={[q1, y]} color={COULEUR_NEUTRE} weight={EPAISSEUR_TRAIT_STANDARD} />
              <Line.Segment point1={[q3, y]} point2={[max, y]} color={COULEUR_NEUTRE} weight={EPAISSEUR_TRAIT_STANDARD} />
              <Line.Segment point1={[min, y - DEMI_HAUTEUR_MOUSTACHE]} point2={[min, y + DEMI_HAUTEUR_MOUSTACHE]} color={COULEUR_NEUTRE} weight={EPAISSEUR_TRAIT_STANDARD} />
              <Line.Segment point1={[max, y - DEMI_HAUTEUR_MOUSTACHE]} point2={[max, y + DEMI_HAUTEUR_MOUSTACHE]} color={COULEUR_NEUTRE} weight={EPAISSEUR_TRAIT_STANDARD} />

              {/* Contour de la boîte — haut/bas neutres, bord gauche (Q1) vert, bord droit (Q3) bleu. */}
              <Line.Segment point1={[q1, y + DEMI_HAUTEUR_BOITE]} point2={[q3, y + DEMI_HAUTEUR_BOITE]} color={COULEUR_NEUTRE} weight={EPAISSEUR_TRAIT_STANDARD} />
              <Line.Segment point1={[q1, y - DEMI_HAUTEUR_BOITE]} point2={[q3, y - DEMI_HAUTEUR_BOITE]} color={COULEUR_NEUTRE} weight={EPAISSEUR_TRAIT_STANDARD} />
              <Line.Segment point1={[q1, y - DEMI_HAUTEUR_BOITE]} point2={[q1, y + DEMI_HAUTEUR_BOITE]} color={COULEUR_Q1} weight={EPAISSEUR_TRAIT_ACCENTUE} />
              <Line.Segment point1={[q3, y - DEMI_HAUTEUR_BOITE]} point2={[q3, y + DEMI_HAUTEUR_BOITE]} color={COULEUR_Q3} weight={EPAISSEUR_TRAIT_ACCENTUE} />

              {/* Médiane — trait violet, plus épais que le reste du contour. */}
              <Line.Segment point1={[mediane, y - DEMI_HAUTEUR_BOITE]} point2={[mediane, y + DEMI_HAUTEUR_BOITE]} color={COULEUR_MEDIANE} weight={EPAISSEUR_TRAIT_ACCENTUE} />

              {ligne.interactif &&
                CLES.map((cle, index) => {
                  const erronee = ligne.interactif?.erronees?.[cle] ?? false;
                  const onChangerValeur = ligne.interactif!.onChangerValeur;
                  const pas = ligne.interactif!.pas ?? 1;
                  const couleur = erronee ? COULEUR_ERRONEE : COULEUR_PAR_CLE[cle];
                  // Alternance haut/bas par index (promptgen36fixmafsechelle.md) — 2 marqueurs
                  // ADJACENTS peuvent être aussi rapprochés que 1 unité de données (ECART_MIN),
                  // bien en-deçà de la largeur pixel d'une étiquette à 6 chiffres (contexte à
                  // grande magnitude, ex. un kilométrage) : un seul côté partagé par les 5
                  // étiquettes les ferait alors chevaucher horizontalement, quelle que soit la
                  // taille de police. Alterner N/S déplace la collision potentielle des paires
                  // ADJACENTES (les plus rapprochées) vers des paires bien plus espacées (min/
                  // médiane/max, qui couvrent ensemble tout l'étendue de la série).
                  const enHaut = index % 2 === 0;
                  return (
                    <g key={`marqueur-${cle}`}>
                      <MovablePoint
                        point={[xParCle[cle], y]}
                        constrain={snapHorizontal(y, bornePlage.min, bornePlage.max, pas)}
                        onMove={([xValeur]) => onChangerValeur(cle, xValeur)}
                        color={couleur}
                      />
                      <Text
                        x={xParCle[cle]}
                        y={enHaut ? y + DEMI_HAUTEUR_BOITE : y - DEMI_HAUTEUR_BOITE}
                        attach={enHaut ? "n" : "s"}
                        attachDistance={6}
                        color={couleur}
                        size={14}
                      >
                        {xParCle[cle]}
                      </Text>
                    </g>
                  );
                })}
            </g>
          );
        })}
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
    </div>
  );
}
