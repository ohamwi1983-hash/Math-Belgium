import { useState } from "react";
import { Mafs, Plot, Point } from "mafs";
import "mafs/core.css";
import {
  EPAISSEUR_TRAIT_ACCENTUE,
  EPAISSEUR_TRAIT_STANDARD,
  RATIO_GRAPHE,
  ZOOM_MAX,
  ZOOM_MIN,
  calculerViewBoxMultiple,
  evaluerCourbe,
} from "../ui/mafsTransformation";
import type { ParametresCourbe } from "../ui/mafsTransformation";
import { formatIndicateurPasGrille } from "../ui/indicateurPasGrille";
import { DomaineTraceX, GrilleAdaptative } from "./mafsGraphPartage";
import { useLargeurConteneur } from "./useLargeurConteneur";
import { Katex } from "./Katex";

/** Une courbe déjà confirmée à une étape précédente — chacune porte sa PROPRE couleur et sa propre
 * légende (l'expression mathématique réelle de la fonction, ex. "f(x)=(x-3)^2"), plutôt qu'un texte
 * générique unique ("déjà confirmé") : généralisation demandée par le prompt de refonte, appliquée
 * partout où la trace cumulative est utilisée dans ce générateur. */
export interface CourbeConfirmee {
  parametres: ParametresCourbe;
  couleur: string;
  labelLatex: string;
}

interface Props {
  /** Courbes déjà confirmées aux étapes précédentes (section 3 de la spec) — 0 à 2 selon la phase
   * en cours (aucune à l'étape TH, une à l'étape EV/CV/SOX, deux à l'étape TV). Toujours dérivées
   * des vraies valeurs confirmées de l'exercice, jamais d'une saisie résiduelle de l'élève. */
  confirmees: CourbeConfirmee[];
  /** Courbe en cours de construction — pilotée en direct par le(s) curseur(s) de l'étape courante. */
  live: ParametresCourbe;
}

const COULEUR_LIVE = "#1971c2";

const LARGEUR_PAR_DEFAUT = 420;
const LARGEUR_MIN = 240;
const LARGEUR_MAX = 480;

/**
 * Graphe Mafs pour "Forme canonique et transformations" — reprend tel quel le graphe adaptatif au
 * zoom de "Transformations graphiques" (`GrilleAdaptative`, `useLargeurConteneur`,
 * `calculerViewBoxMultiple`, mêmes bornes de zoom) mais généralisé à N courbes simultanées : chaque
 * courbe déjà confirmée est affichée dans sa propre couleur (orange à l'étape EV/CV/SOX, orange +
 * vert à l'étape TV — voir les écrans appelants), la courbe en cours de construction reste bleue,
 * trait plein — pour que l'élève voie la construction se superposer progressivement (section 3 de
 * la spec), pas seulement un avant/après isolé à chaque écran. Chaque légende de courbe confirmée
 * affiche désormais son expression mathématique réelle (rendue en KaTeX), jamais un texte
 * générique — seule la légende de la courbe "en cours" reste un texte descriptif générique.
 */
export function MafsGraphFormeCanoniqueTransformations({ confirmees, live }: Props) {
  const [wrapperRef, largeurMesuree] = useLargeurConteneur<HTMLDivElement>();
  const largeur = Math.min(LARGEUR_MAX, Math.max(LARGEUR_MIN, largeurMesuree || LARGEUR_PAR_DEFAUT));
  const hauteur = largeur / RATIO_GRAPHE;

  const viewBox = calculerViewBoxMultiple([...confirmees.map((c) => c.parametres), live]);
  const [pas, setPas] = useState<{ x: number; y: number } | null>(null);

  return (
    <div className="mafs-graph" ref={wrapperRef} data-testid="mafs-graph-forme-canonique">
      <Mafs
        width={largeur}
        height={hauteur}
        viewBox={{ x: viewBox.x, y: viewBox.y, padding: 0 }}
        pan={true}
        zoom={{ min: ZOOM_MIN, max: ZOOM_MAX }}
      >
        <GrilleAdaptative largeur={largeur} hauteur={hauteur} onPasChange={(x, y) => setPas({ x, y })} />
        {confirmees.map((courbe, index) => (
          <g key={index}>
            <DomaineTraceX largeur={largeur}>
              {(domaine) => <Plot.OfX y={(x) => evaluerCourbe(courbe.parametres, x)} domain={domaine} color={courbe.couleur} weight={EPAISSEUR_TRAIT_STANDARD} />}
            </DomaineTraceX>
            <Point x={courbe.parametres.p} y={courbe.parametres.q} color={courbe.couleur} />
          </g>
        ))}
        <DomaineTraceX largeur={largeur}>
          {(domaine) => <Plot.OfX y={(x) => evaluerCourbe(live, x)} domain={domaine} color={COULEUR_LIVE} weight={EPAISSEUR_TRAIT_ACCENTUE} />}
        </DomaineTraceX>
        <Point x={live.p} y={live.q} color={COULEUR_LIVE} />
      </Mafs>
      {pas && <p className="mafs-graph-pas">{formatIndicateurPasGrille(pas.x, pas.y)}</p>}
      <div className="mafs-graph-legende">
        <span className="mafs-graph-legende-item">
          <span className="mafs-graph-swatch mafs-graph-swatch-actuelle" /> étape actuelle
        </span>
        {confirmees.map((courbe, index) => (
          <span className="mafs-graph-legende-item" key={index}>
            <span className="mafs-graph-swatch" style={{ background: courbe.couleur }} />
            <Katex expression={courbe.labelLatex} />
          </span>
        ))}
      </div>
    </div>
  );
}
