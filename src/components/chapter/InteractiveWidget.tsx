import { useEffect, useRef, useState } from 'react'
import type { InteractiveWidgetTag } from '../../content/types'

/** Charge (à la demande, `import()` dynamique) le module qui enregistre le Web Component
 * correspondant — l'ordre interne de chaque module gère lui-même ses propres dépendances
 * (un widget dépendant d'un module partagé doit l'importer avant son propre fichier), voir
 * `src/interactive/register-*.js`. */
const REGISTER: Record<InteractiveWidgetTag, () => Promise<unknown>> = {
  'parabole-widget': () => import('../../interactive/register-parabole-widget.js'),
  'transformations-widget': () => import('../../interactive/register-transformations-widget.js'),
  'archimede-widget': () => import('../../interactive/register-archimede-widget.js'),
  'sinusoide-widget': () => import('../../interactive/register-sinusoide-widget.js'),
  'cercle-trigo-widget': () => import('../../interactive/register-cercle-trigo-widget.js'),
  'exponentielle-widget': () => import('../../interactive/register-exponentielle-widget.js'),
  'tangente-exponentielle-widget': () => import('../../interactive/register-tangente-exponentielle-widget.js'),
  'reciproque-miroir-widget': () => import('../../interactive/register-reciproque-miroir-widget.js'),
  'cyclometrique-miroir-widget': () => import('../../interactive/register-cyclometrique-miroir-widget.js'),
  'cyclometrique-tangente-widget': () => import('../../interactive/register-cyclometrique-tangente-widget.js'),
  'droite-horizontale-widget': () => import('../../interactive/register-droite-horizontale-widget.js'),
  'machine-reciproque-widget': () => import('../../interactive/register-machine-reciproque-widget.js'),
  'pentes-inverses-widget': () => import('../../interactive/register-pentes-inverses-widget.js'),
  'arc-de-trig-widget': () => import('../../interactive/register-arc-de-trig-widget.js'),
  'equation-ce-widget': () => import('../../interactive/register-equation-ce-widget.js'),
  'transformees-arc-widget': () => import('../../interactive/register-transformees-arc-widget.js'),
  'angle-de-vue-widget': () => import('../../interactive/register-angle-de-vue-widget.js'),
  'refraction-widget': () => import('../../interactive/register-refraction-widget.js'),
  'discriminant-racines-widget': () => import('../../interactive/register-discriminant-racines-widget.js'),
  'signe-trinome-widget': () => import('../../interactive/register-signe-trinome-widget.js'),
  'signe-produit-widget': () => import('../../interactive/register-signe-produit-widget.js'),
  'composition-machine-widget': () => import('../../interactive/register-composition-machine-widget.js'),
  'domaine-composee-widget': () => import('../../interactive/register-domaine-composee-widget.js'),
  'parite-derivee-widget': () => import('../../interactive/register-parite-derivee-widget.js'),
  'inequation-exponentielle-widget': () => import('../../interactive/register-inequation-exponentielle-widget.js'),
  'croissance-saturation-widget': () => import('../../interactive/register-croissance-saturation-widget.js'),
  'log-exp-miroir-widget': () => import('../../interactive/register-log-exp-miroir-widget.js'),
  'inequation-logarithmique-widget': () => import('../../interactive/register-inequation-logarithmique-widget.js'),
  'parametres-graphiques-widget': () => import('../../interactive/register-parametres-graphiques-widget.js'),
  'extremums-sinusoide-widget': () => import('../../interactive/register-extremums-sinusoide-widget.js'),
  'modele-sinusoidal-widget': () => import('../../interactive/register-modele-sinusoidal-widget.js'),
  'equation-trig-widget': () => import('../../interactive/register-equation-trig-widget.js'),
  'secteur-segment-widget': () => import('../../interactive/register-secteur-segment-widget.js'),
  'suite-recurrente-affine-widget': () => import('../../interactive/register-suite-recurrente-affine-widget.js'),
  'convergence-suite-widget': () => import('../../interactive/register-convergence-suite-widget.js'),
  'comparaison-suites-widget': () => import('../../interactive/register-comparaison-suites-widget.js'),
  'stabilisation-frequences-widget': () => import('../../interactive/register-stabilisation-frequences-widget.js'),
  'deux-des-widget': () => import('../../interactive/register-deux-des-widget.js'),
  'arbre-tirages-widget': () => import('../../interactive/register-arbre-tirages-widget.js'),
  'derangements-widget': () => import('../../interactive/register-derangements-widget.js'),
  'anniversaires-widget': () => import('../../interactive/register-anniversaires-widget.js'),
  'fiabilite-montage-widget': () => import('../../interactive/register-fiabilite-montage-widget.js'),
  'monty-hall-widget': () => import('../../interactive/register-monty-hall-widget.js'),
  'detecteur-domaine-widget': () => import('../../interactive/register-detecteur-domaine-widget.js'),
  'constructeur-composees-widget': () => import('../../interactive/register-constructeur-composees-widget.js'),
  'simplification-piege-widget': () => import('../../interactive/register-simplification-piege-widget.js'),
  'composition-graphique-widget': () => import('../../interactive/register-composition-graphique-widget.js'),
  'bidon-optimal-widget': () => import('../../interactive/register-bidon-optimal-widget.js'),
  'seuil-rentabilite-widget': () => import('../../interactive/register-seuil-rentabilite-widget.js'),
  'radian-enroule-widget': () => import('../../interactive/register-radian-enroule-widget.js'),
  'lentille-essuie-glace-widget': () => import('../../interactive/register-lentille-essuie-glace-widget.js'),
  'courbe-mystere-widget': () => import('../../interactive/register-courbe-mystere-widget.js'),
  'substitution-cos-widget': () => import('../../interactive/register-substitution-cos-widget.js'),
  'intersections-trig-widget': () => import('../../interactive/register-intersections-trig-widget.js'),
  'seuil-grande-roue-widget': () => import('../../interactive/register-seuil-grande-roue-widget.js'),
  'duree-jour-latitude-widget': () => import('../../interactive/register-duree-jour-latitude-widget.js'),
  'triangle-rapport-affixes-widget': () => import('../../interactive/register-triangle-rapport-affixes-widget.js'),
  'operations-plan-complexe-widget': () => import('../../interactive/register-operations-plan-complexe-widget.js'),
  'racine-carree-complexe-widget': () => import('../../interactive/register-racine-carree-complexe-widget.js'),
  'racines-qui-se-rencontrent-widget': () => import('../../interactive/register-racines-qui-se-rencontrent-widget.js'),
  'euler-cercle-widget': () => import('../../interactive/register-euler-cercle-widget.js'),
  'spirale-puissances-widget': () => import('../../interactive/register-spirale-puissances-widget.js'),
  'lieux-complexes-widget': () => import('../../interactive/register-lieux-complexes-widget.js'),
  'secante-tangente-widget': () => import('../../interactive/register-secante-tangente-widget.js'),
  'zoom-tangente-widget': () => import('../../interactive/register-zoom-tangente-widget.js'),
  'f-fprime-fseconde-widget': () => import('../../interactive/register-f-fprime-fseconde-widget.js'),
  'boite-carton-widget': () => import('../../interactive/register-boite-carton-widget.js'),
  'canette-optimale-widget': () => import('../../interactive/register-canette-optimale-widget.js'),
  'dichotomie-widget': () => import('../../interactive/register-dichotomie-widget.js'),
  'mobile-piste-widget': () => import('../../interactive/register-mobile-piste-widget.js'),
  'section-cube-widget': () => import('../../interactive/register-section-cube-widget.js'),
  'trois-plans-widget': () => import('../../interactive/register-trois-plans-widget.js'),
  'ombre-soleil-lampe-widget': () => import('../../interactive/register-ombre-soleil-lampe-widget.js'),
  'point-de-fuite-widget': () => import('../../interactive/register-point-de-fuite-widget.js'),
  'fenetre-durer-widget': () => import('../../interactive/register-fenetre-durer-widget.js'),
  'positions-cube-widget': () => import('../../interactive/register-positions-cube-widget.js'),
  'livre-plans-widget': () => import('../../interactive/register-livre-plans-widget.js'),
  'deux-plans-cube-widget': () => import('../../interactive/register-deux-plans-cube-widget.js'),
  'droite-temoin-widget': () => import('../../interactive/register-droite-temoin-widget.js'),
  'plan-auxiliaire-widget': () => import('../../interactive/register-plan-auxiliaire-widget.js'),
  'cavaliere-reglage-widget': () => import('../../interactive/register-cavaliere-reglage-widget.js'),
  'parabole-foyer-widget': () => import('../../interactive/register-parabole-foyer-widget.js'),
  'cercle-equation-widget': () => import('../../interactive/register-cercle-equation-widget.js'),
  'droite-cercle-widget': () => import('../../interactive/register-droite-cercle-widget.js'),
  'relations-droites-widget': () => import('../../interactive/register-relations-droites-widget.js'),
  'distance-droite-widget': () => import('../../interactive/register-distance-droite-widget.js'),
  'droite-formes-widget': () => import('../../interactive/register-droite-formes-widget.js'),
  'pente-angle-widget': () => import('../../interactive/register-pente-angle-widget.js'),
  'decomposition-vecteur-widget': () => import('../../interactive/register-decomposition-vecteur-widget.js'),
  'chasles-defi-widget': () => import('../../interactive/register-chasles-defi-widget.js'),
  'distance-triangle-widget': () => import('../../interactive/register-distance-triangle-widget.js'),
  'vecteur-directeur-widget': () => import('../../interactive/register-vecteur-directeur-widget.js'),
  'somme-vecteurs-widget': () => import('../../interactive/register-somme-vecteurs-widget.js'),
  'multiplication-k-widget': () => import('../../interactive/register-multiplication-k-widget.js'),
  'egalite-parallelogramme-widget': () => import('../../interactive/register-egalite-parallelogramme-widget.js'),
  'angles-associes-widget': () => import('../../interactive/register-angles-associes-widget.js'),
  'cercle-explorateur-widget': () => import('../../interactive/register-cercle-explorateur-widget.js'),
  'valeurs-remarquables-widget': () => import('../../interactive/register-valeurs-remarquables-widget.js'),
  'triangle-deformable-widget': () => import('../../interactive/register-triangle-deformable-widget.js'),
  'triangulation-widget': () => import('../../interactive/register-triangulation-widget.js'),
  'roue-hauteur-widget': () => import('../../interactive/register-roue-hauteur-widget.js'),
  'quelle-loi-widget': () => import('../../interactive/register-quelle-loi-widget.js'),
  'optimisation-enclos-widget': () => import('../../interactive/register-optimisation-enclos-widget.js'),
  'trois-formes-widget': () => import('../../interactive/register-trois-formes-widget.js'),
  'parabole-par-points-widget': () => import('../../interactive/register-parabole-par-points-widget.js'),
  'differences-secondes-widget': () => import('../../interactive/register-differences-secondes-widget.js'),
  'galilee-trajectoire-widget': () => import('../../interactive/register-galilee-trajectoire-widget.js'),
  'viete-racines-widget': () => import('../../interactive/register-viete-racines-widget.js'),
  'parametre-m-widget': () => import('../../interactive/register-parametre-m-widget.js'),
  'methodes-resolution-widget': () => import('../../interactive/register-methodes-resolution-widget.js'),
  'bicarree-widget': () => import('../../interactive/register-bicarree-widget.js'),
  'parabole-droite-widget': () => import('../../interactive/register-parabole-droite-widget.js'),
  'seuil-ballon-widget': () => import('../../interactive/register-seuil-ballon-widget.js'),
  'completer-le-carre-widget': () => import('../../interactive/register-completer-le-carre-widget.js'),
  'simplification-trou-widget': () => import('../../interactive/register-simplification-trou-widget.js'),
  'racine-etrangere-rationnelle-widget': () => import('../../interactive/register-racine-etrangere-rationnelle-widget.js'),
  'fonction-aire-widget': () => import('../../interactive/register-fonction-aire-widget.js'),
  'aire-signee-widget': () => import('../../interactive/register-aire-signee-widget.js'),
  'rectangle-valeur-moyenne-widget': () => import('../../interactive/register-rectangle-valeur-moyenne-widget.js'),
  'solide-revolution-widget': () => import('../../interactive/register-solide-revolution-widget.js'),
  'distance-deplacement-widget': () => import('../../interactive/register-distance-deplacement-widget.js'),
  'longueur-polygonale-widget': () => import('../../interactive/register-longueur-polygonale-widget.js'),
  'ipp-choix-widget': () => import('../../interactive/register-ipp-choix-widget.js'),
  'regle-a-calcul-widget': () => import('../../interactive/register-regle-a-calcul-widget.js'),
  'solution-parasite-log-widget': () => import('../../interactive/register-solution-parasite-log-widget.js'),
  'f-et-fprime-widget': () => import('../../interactive/register-f-et-fprime-widget.js'),
  'echelle-semi-log-widget': () => import('../../interactive/register-echelle-semi-log-widget.js'),
  'croissance-comparee-log-widget': () => import('../../interactive/register-croissance-comparee-log-widget.js'),
  'rapports-differences-widget': () => import('../../interactive/register-rapports-differences-widget.js'),
  'f-fprime-exponentielle-widget': () => import('../../interactive/register-f-fprime-exponentielle-widget.js'),
  'vers-e-widget': () => import('../../interactive/register-vers-e-widget.js'),
  'rattrapage-exponentielle-widget': () => import('../../interactive/register-rattrapage-exponentielle-widget.js'),
  'datation-carbone14-widget': () => import('../../interactive/register-datation-carbone14-widget.js'),
  'chainette-widget': () => import('../../interactive/register-chainette-widget.js'),
  'gauss-double-echelle-widget': () => import('../../interactive/register-gauss-double-echelle-widget.js'),
  'arithmetique-ou-geometrique-widget': () => import('../../interactive/register-arithmetique-ou-geometrique-widget.js'),
  'somme-infinie-zenon-widget': () => import('../../interactive/register-somme-infinie-zenon-widget.js'),
  'echiquier-widget': () => import('../../interactive/register-echiquier-widget.js'),
  'fibonacci-nombre-d-or-widget': () => import('../../interactive/register-fibonacci-nombre-d-or-widget.js'),
  'angle-d-or-widget': () => import('../../interactive/register-angle-d-or-widget.js'),
  'transformation-8-parametres-widget': () => import('../../interactive/register-transformation-8-parametres-widget.js'),
  'familles-parite-widget': () => import('../../interactive/register-familles-parite-widget.js'),
  'pas-a-pas-transformations-widget': () => import('../../interactive/register-pas-a-pas-transformations-widget.js'),
  'lire-courbe-widget': () => import('../../interactive/register-lire-courbe-widget.js'),
  'combien-zeros-widget': () => import('../../interactive/register-combien-zeros-widget.js'),
  'solution-etrangere-widget': () => import('../../interactive/register-solution-etrangere-widget.js'),
  'inverse-monotonie-widget': () => import('../../interactive/register-inverse-monotonie-widget.js'),
  'seuil-cumule-widget': () => import('../../interactive/register-seuil-cumule-widget.js'),
  'choix-classes-widget': () => import('../../interactive/register-choix-classes-widget.js'),
  'deux-courbes-cumulees-widget': () => import('../../interactive/register-deux-courbes-cumulees-widget.js'),
  'frontiere-classe-widget': () => import('../../interactive/register-frontiere-classe-widget.js'),
  'dispersion-comparee-widget': () => import('../../interactive/register-dispersion-comparee-widget.js'),
  'valeur-aberrante-widget': () => import('../../interactive/register-valeur-aberrante-widget.js'),
  'boite-moustaches-vivante-widget': () => import('../../interactive/register-boite-moustaches-vivante-widget.js'),
  'tchebychev-garantie-widget': () => import('../../interactive/register-tchebychev-garantie-widget.js'),
  'point-vide-ou-asymptote-widget': () => import('../../interactive/register-point-vide-ou-asymptote-widget.js'),
  'degre-asymptote-widget': () => import('../../interactive/register-degre-asymptote-widget.js'),
  'plancher-plafond-widget': () => import('../../interactive/register-plancher-plafond-widget.js'),
  'aussi-pres-que-tu-veux-widget': () => import('../../interactive/register-aussi-pres-que-tu-veux-widget.js'),
  'terme-dominant-widget': () => import('../../interactive/register-terme-dominant-widget.js'),
  'infini-moins-infini-widget': () => import('../../interactive/register-infini-moins-infini-widget.js'),
  'cote-asymptote-widget': () => import('../../interactive/register-cote-asymptote-widget.js'),
  'zoom-arriere-asymptote-widget': () => import('../../interactive/register-zoom-arriere-asymptote-widget.js'),
  'cuve-eau-salee-widget': () => import('../../interactive/register-cuve-eau-salee-widget.js'),
  'recoupement-widget': () => import('../../interactive/register-recoupement-widget.js'),
  'famille-primitives-widget': () => import('../../interactive/register-famille-primitives-widget.js'),
  'condition-initiale-widget': () => import('../../interactive/register-condition-initiale-widget.js'),
  'sommes-riemann-widget': () => import('../../interactive/register-sommes-riemann-widget.js'),
  'identite-signe-widget': () => import('../../interactive/register-identite-signe-widget.js'),
  'equation-trig-cas-limite-widget': () => import('../../interactive/register-equation-trig-cas-limite-widget.js'),
  'triangle-cas-ambigu-widget': () => import('../../interactive/register-triangle-cas-ambigu-widget.js'),
  'point-critique-signe-widget': () => import('../../interactive/register-point-critique-signe-widget.js'),
  'extrema-bornes-widget': () => import('../../interactive/register-extrema-bornes-widget.js'),
  'recette-benefice-widget': () => import('../../interactive/register-recette-benefice-widget.js'),
  'racines-niemes-widget': () => import('../../interactive/register-racines-niemes-widget.js'),
  'produit-modules-arguments-widget': () => import('../../interactive/register-produit-modules-arguments-widget.js'),
  'transformation-az-b-widget': () => import('../../interactive/register-transformation-az-b-widget.js'),
  'test-colinearite-widget': () => import('../../interactive/register-test-colinearite-widget.js'),
  'milieu-piege-widget': () => import('../../interactive/register-milieu-piege-widget.js'),
  'resultante-vecteurs-widget': () => import('../../interactive/register-resultante-vecteurs-widget.js'),
  'traversee-riviere-widget': () => import('../../interactive/register-traversee-riviere-widget.js'),
  'equilibre-forces-widget': () => import('../../interactive/register-equilibre-forces-widget.js'),
  'arrivee-moins-depart-widget': () => import('../../interactive/register-arrivee-moins-depart-widget.js'),
  'longueur-direction-sens-widget': () => import('../../interactive/register-longueur-direction-sens-widget.js'),
  'carte-tresor-widget': () => import('../../interactive/register-carte-tresor-widget.js'),
  'lieu-trace-widget': () => import('../../interactive/register-lieu-trace-widget.js'),
  'deux-mobiles-widget': () => import('../../interactive/register-deux-mobiles-widget.js'),
  'reflexion-viser-widget': () => import('../../interactive/register-reflexion-viser-widget.js'),
  'droites-remarquables-widget': () => import('../../interactive/register-droites-remarquables-widget.js'),
  'deux-cercles-widget': () => import('../../interactive/register-deux-cercles-widget.js'),
  'venn-double-entree-widget': () => import('../../interactive/register-venn-double-entree-widget.js'),
  'bayes-test-medical-widget': () => import('../../interactive/register-bayes-test-medical-widget.js'),
  'binomiale-positions-widget': () => import('../../interactive/register-binomiale-positions-widget.js'),
  'composer-en-un-point-widget': () => import('../../interactive/register-composer-en-un-point-widget.js'),
  'projections-domaine-image-widget': () => import('../../interactive/register-projections-domaine-image-widget.js'),
  'image-inter-domaine-widget': () => import('../../interactive/register-image-inter-domaine-widget.js'),
  'commutent-affines-widget': () => import('../../interactive/register-commutent-affines-widget.js'),
}

/**
 * Monte un Web Component autonome (Shadow DOM) porté depuis l'artifact d'origine. Le composant
 * gère entièrement son propre état interne (React ne fait que le poser dans le DOM une fois) —
 * jamais capturé par l'export HTML (A4) (voir `.no-export` sur le conteneur appelant : un Shadow
 * DOM n'est de toute façon pas repris par un `cloneNode`/`outerHTML` classique).
 */
export function InteractiveWidget({ tag, figuresTactiles, panneau }: { tag: InteractiveWidgetTag; figuresTactiles?: boolean; panneau?: boolean }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    let cancelled = false
    setReady(false)
    REGISTER[tag]().then(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [tag])

  useEffect(() => {
    const host = hostRef.current
    if (!ready || !host) return
    const el = document.createElement(tag)
    host.replaceChildren(el)
    const retirerEpingle = epinglerFigure(el, !!panneau)
    const retirerTactile = figuresTactiles ? figuresSansDefilement(el) : undefined
    return () => {
      retirerEpingle()
      retirerTactile?.()
    }
  }, [ready, tag, figuresTactiles, panneau])

  return <div ref={hostRef} className="widget-host" />
}

/**
 * Atelier ouvert en plein écran (panneau du parcours de chapitre, voir `PanneauModal`) : sur
 * téléphone, le doigt qui déplace une flèche ou un point d'une figure ne doit pas faire défiler le
 * panneau. `touch-action: none` est posé sur les figures SVG DANS le Shadow DOM du widget (feuille
 * adoptée, qui survit à un widget qui réécrit son `innerHTML`) — aucun fichier de widget modifié.
 * Le panneau défile toujours en glissant ailleurs (réglages, marges).
 */
function figuresSansDefilement(el: HTMLElement): () => void {
  let essais = 0
  let minuterie = 0
  const appliquer = () => {
    const sr = el.shadowRoot
    if (!sr) {
      if (essais++ < 20) minuterie = window.setTimeout(appliquer, 50)
      return
    }
    const regle = 'svg { touch-action: none; }'
    if ('adoptedStyleSheets' in sr && typeof CSSStyleSheet !== 'undefined' && 'replaceSync' in CSSStyleSheet.prototype) {
      const feuille = new CSSStyleSheet()
      feuille.replaceSync(regle)
      sr.adoptedStyleSheets = [...sr.adoptedStyleSheets, feuille]
    } else {
      const style = document.createElement('style')
      style.textContent = regle
      sr.appendChild(style)
    }
  }
  appliquer()
  return () => window.clearTimeout(minuterie)
}

/**
 * Garde le dessin d'un atelier à l'écran pendant qu'on manipule ses réglages (retour utilisateur :
 * dans la plupart des ateliers, curseurs et boutons sont trop loin du graphe — en les manipulant, on
 * ne voit plus le dessin). Plutôt que de remanier ~120 widgets un par un, la plus grande figure SVG
 * du Shadow DOM est rendue `position: sticky`. L'élément épinglé est le plus grand ancêtre de la
 * figure qui ne contient encore aucun contrôle (input/button/select) : son parent contient les
 * réglages, c'est donc lui qui borne l'épinglage (le dessin ne sort jamais de son atelier). Un
 * `MutationObserver` ré-applique le réglage quand un widget reconstruit son DOM.
 *
 * Dans la page (`panneau` faux) :
 * - `top` : la figure reste collée en haut de l'écran quand on descend vers des réglages placés EN
 *   DESSOUS (sous l'en-tête collant mobile, ~50 px) ;
 * - `bottom` : elle remonte se coller en bas de l'écran quand les réglages sont AU-DESSUS d'elle.
 *
 * Dans le panneau plein écran (`panneau`, voir `PanneauModal`) — retour utilisateur : la figure
 * couvrait une ligne de réglages ou une consigne de l'atelier. Le collage en BAS remontait la figure
 * par-dessus ce qui la précède dès l'ouverture (consigne, curseurs placés au-dessus d'elle), sans
 * rien qui signale qu'il y a quelque chose dessous. D'où, dans le panneau :
 * - rien n'est épinglé si l'atelier entier tient sous l'en-tête du panneau (rien ne peut alors
 *   passer sous la figure) ;
 * - sinon, collage en HAUT seulement, juste sous l'en-tête du panneau : à l'ouverture la figure est
 *   à sa place, rien n'est couvert ; en descendant, les réglages défilent SOUS la figure et chacun
 *   arrive entièrement visible sous elle avant de passer dessous.
 *
 * Une figure plus haute que 55 % de la zone visible (deux panneaux empilés sur téléphone) est
 * réduite : par `zoom`, ou, si la figure est fluide (`svg` à `width: 100%`, que `zoom` ne réduit
 * pas : l'élément réduit dispose d'autant plus de largeur), en bornant sa largeur. Rien n'est
 * épinglé au-delà de 90 % de la zone visible.
 */
const ATTR = 'data-figure-epinglee'
const STYLES_POSES = ['position', 'top', 'bottom', 'z-index', 'background-color', 'zoom', 'max-width', 'margin-left', 'margin-right']
const STYLES_TAILLE = ['zoom', 'max-width', 'margin-left', 'margin-right']

function epinglerFigure(el: HTMLElement, panneau: boolean): () => void {
  let raf = 0
  let observer: MutationObserver | null = null
  let attente = 0

  const fondOpaque = (depart: Element): string => {
    let n: Node | null = depart
    while (n) {
      if (n instanceof Element) {
        const bg = getComputedStyle(n).backgroundColor
        if (bg && bg !== 'transparent' && !/rgba\([^)]*,\s*0\)$/.test(bg)) return bg
      }
      n = n instanceof ShadowRoot ? n.host : n.parentNode
    }
    return 'var(--surface, #fff)'
  }

  const nettoyer = (sr: ShadowRoot) => {
    sr.querySelectorAll(`[${ATTR}]`).forEach((n) => {
      const h = n as HTMLElement
      h.removeAttribute(ATTR)
      for (const p of STYLES_POSES) h.style.removeProperty(p)
    })
  }

  const appliquer = () => {
    raf = 0
    const sr = el.shadowRoot
    if (!sr) return
    // Mesurer à la taille naturelle : on retire une éventuelle réduction posée au passage précédent.
    sr.querySelectorAll(`[${ATTR}]`).forEach((n) => {
      for (const p of STYLES_TAILLE) (n as HTMLElement).style.removeProperty(p)
    })
    const svgs = [...sr.querySelectorAll('svg')].filter((s) => {
      const r = s.getBoundingClientRect()
      return r.width > 120 && r.height > 80
    })
    if (!svgs.length) return nettoyer(sr)
    svgs.sort((a, b) => {
      const ra = a.getBoundingClientRect()
      const rb = b.getBoundingClientRect()
      return rb.width * rb.height - ra.width * ra.height
    })
    let cible: Element = svgs[0]
    for (;;) {
      const parent: Element | null = cible.parentElement
      if (!parent || parent.querySelector('input,button,select,textarea')) break
      cible = parent
    }
    const hFig = cible.getBoundingClientRect().height
    const hAtelier = el.getBoundingClientRect().height
    // Zone où la figure reste visible : l'écran (dans la page), ou la partie du panneau plein écran
    // située sous son en-tête collant (le panneau est le conteneur qui défile).
    const boite = panneau ? el.closest('dialog') : null
    const haut = boite
      ? (boite.querySelector<HTMLElement>('.panneau-entete')?.offsetHeight ?? 0)
      : window.matchMedia('(max-width: 759.98px)').matches
        ? 50
        : 12
    const hZone = boite ? boite.clientHeight - haut : window.innerHeight
    const deja = sr.querySelector(`[${ATTR}]`)
    if (cible === sr.firstElementChild && !sr.firstElementChild?.nextElementSibling) {
      if (deja) nettoyer(sr)
      return
    }
    // Panneau : figure et réglages tiennent ensemble sous l'en-tête (16 px : marge du panneau).
    const tient = boite ? hAtelier <= hZone - 16 : hAtelier < 0.9 * hZone
    if (hFig > 0.9 * hZone || tient) {
      if (deja) nettoyer(sr)
      return
    }
    if (deja && deja !== cible) nettoyer(sr)
    const h = cible as HTMLElement
    h.setAttribute(ATTR, '')
    h.style.position = 'sticky'
    h.style.zIndex = '3'
    h.style.backgroundColor = fondOpaque(h.parentElement ?? el)
    if (getComputedStyle(h).display === 'inline') h.style.display = 'block'
    // Figure double (deux panneaux empilés sur téléphone) : on la réduit pour qu'elle laisse au
    // moins 45 % de la zone aux réglages. `zoom` (et non `transform`) réduit aussi la place occupée.
    const plafond = 0.55 * hZone
    let echelle = 1
    if (hFig > plafond) {
      echelle = plafond / hFig
      h.style.setProperty('zoom', echelle.toFixed(3))
      if (h.getBoundingClientRect().height > plafond * 1.05) {
        // Figure fluide : `zoom` ne la réduit pas, on borne sa largeur (la hauteur suit).
        h.style.removeProperty('zoom')
        echelle = 1
        h.style.maxWidth = `${Math.floor((h.getBoundingClientRect().width * plafond) / hFig)}px`
        h.style.marginLeft = 'auto'
        h.style.marginRight = 'auto'
      }
    }
    // `zoom` s'applique aussi aux décalages de l'élément : 50px sous zoom 0,7 ne font que 35px à
    // l'écran (la figure passerait sous l'en-tête) — on compense.
    h.style.top = `${(haut / echelle).toFixed(1)}px`
    if (panneau) h.style.removeProperty('bottom')
    else h.style.bottom = `${(8 / echelle).toFixed(1)}px`
  }

  const planifier = () => {
    if (!raf) raf = requestAnimationFrame(appliquer)
  }
  // Pendant une manipulation, beaucoup de widgets reconstruisent le contenu de leur SVG à chaque
  // mouvement de curseur : inutile de tout remesurer tant que l'élément épinglé est toujours là.
  const surMutation = () => {
    const deja = el.shadowRoot?.querySelector(`[${ATTR}]`)
    if (deja && deja.isConnected) return
    planifier()
  }

  const brancher = () => {
    const sr = el.shadowRoot
    if (!sr) {
      // Certains widgets attachent leur Shadow DOM un peu après l'insertion.
      if (attente++ < 20) window.setTimeout(brancher, 50)
      return
    }
    observer = new MutationObserver(surMutation)
    observer.observe(sr, { childList: true, subtree: true })
    planifier()
  }

  brancher()
  window.addEventListener('resize', planifier)
  return () => {
    observer?.disconnect()
    window.removeEventListener('resize', planifier)
    if (raf) cancelAnimationFrame(raf)
  }
}
