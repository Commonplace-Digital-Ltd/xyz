import polyCategorized from './polyCategorized.mjs'

import polyGraduated from './polyGraduated.mjs'

import clusterCategorized from './clusterCategorized.mjs'

import clusterGraduated from './clusterGraduated.mjs'

import grid from './grid.mjs'

import basic from './basic.mjs'

export default _xyz => {

  const legends = {

    polyCategorized: polyCategorized(_xyz),

    polyGraduated: polyGraduated(_xyz),
  
    clusterCategorized: clusterCategorized(_xyz),
  
    clusterGraduated: clusterGraduated(_xyz),
  
    grid: grid(_xyz),

    basic: basic(_xyz),

  }

  return layer => {

    layer.style.legend = _xyz.utils.html.node`<div class="legend">`

    if (layer.format === 'grid') return legends.grid(layer)

    if (layer.style.theme.type === 'basic') return legends.basic(layer)

    layer.filter = layer.filter || {}

    if (layer.format === 'mvt' && layer.style.theme.type === 'categorized') return legends.polyCategorized(layer)
  
    if (layer.format === 'mvt' && layer.style.theme.type === 'graduated') return legends.polyGraduated(layer)
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'categorized') return legends.clusterCategorized(layer)
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'competition') return legends.clusterCategorized(layer)
  
    if (layer.format === 'cluster' && layer.style.theme.type === 'graduated') return legends.clusterGraduated(layer)

  }

}