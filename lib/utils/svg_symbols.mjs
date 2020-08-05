export default marker => {

  if (marker.svg) return marker.svg;

  const markers = {
    dot: dot(marker),
    target: target(marker),
    triangle: triangle(marker),
    square: square(marker),
    semiCircle: semiCircle(marker),
    markerLetter: markerLetter(marker),
    markerColor: markerColor(marker),
    geo: geolocation(),
    circle: circle(marker)
  };

  if (!marker.type) return dot({ color: '#666' });

  return markers[marker.type];
};

import { wire } from 'hyperhtml/esm';
import chroma from 'chroma-js';
import {render, html, svg} from 'uhtml';

const xmlSerializer = new XMLSerializer();

function dot(style) {

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  svg.appendChild(wire(null, 'svg')`
  <circle cx=14 cy=14 r=10 fill=${chroma(style.fillColor || '#fff').darken()}>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=12 cy=12 r=10 fill=${style.fillColor || '#fff'}>`);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function target(style) {

  const r = 10;

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  let shade = wire(null, 'svg')`
  <circle cx=14 cy=14 fill='#333' opacity=0.4>`;

  shade.setAttribute('r', r);

  svg.appendChild(shade);

  let main = wire(null, 'svg')`<circle cx=12 cy=12 fill=${style.fillColor || '#FFF'}>`;

  main.setAttribute('r', r);

  svg.appendChild(main);

  if (!style.layers) return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  Object.entries(style.layers).forEach(layer => {

    const _layer = wire(null, 'svg')`<circle cx=12 cy=12 fill=${layer[1]}>`;

    _layer.setAttribute('r', parseFloat(layer[0]) * r);

    svg.appendChild(_layer);
  });

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function triangle(style) {

  let
    r = 12,
    scale = 0.6;

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  // triangle path
  let t = 'M0,-19.618873042551414L16.990442448471224,9.809436521275707L-16.990442448471224,9.809436521275707Z';

  let shade = wire(null, 'svg')`<path fill='#333' opacity=0.4>`;

  shade.setAttribute('d', t);
  shade.setAttribute('transform', `translate(${r + 40} ${r + 20}) scale(${scale}, ${scale})`);

  svg.appendChild(shade);

  let path = wire(null, 'svg')`<path fill=${style.fillColor || '#FFF'}>`;

  path.setAttribute('d', t);
  path.setAttribute('transform', `translate(${r} ${r}) scale(${scale}, ${scale})`);
  svg.appendChild(path);
  
  if(!style.layers) return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  Object.entries(style.layers).map(layer => {

    const _layer = wire(null, 'svg')`<path fill=${layer[1]}>`;

    _layer.setAttribute('d', t);
    _layer.setAttribute('transform', `translate(${r} ${r}) scale(${layer[0]*scale}, ${layer[0]*scale})`);
      
    svg.appendChild(_layer);
  });

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  }

function square(style) {

  let
    v = 24,
    a = 20,
    o = 1;

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  let shade = wire(null, 'svg')`<rect fill='#333' opacity=0.3 >`;

  shade.setAttribute('width', a);
  shade.setAttribute('height', a);
  shade.setAttribute('x', (v - a) / 2 + o);
  shade.setAttribute('y', (v - a) / 2 + o);

  svg.appendChild(shade);

  let path = wire(null, 'svg')`<rect fill=${style.fillColor || '#FFF'}>`;

  path.setAttribute('width', a);
  path.setAttribute('height', a);
  path.setAttribute('x', (v - a) / 2);
  path.setAttribute('y', (v - a) / 2);

  svg.appendChild(path);

  if (!style.layers) return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

  Object.entries(style.layers).map(layer => {

    const _layer = wire(null, 'svg')`<rect fill=${layer[1]}>`;

    _layer.setAttribute('width', layer[0] * a);
    _layer.setAttribute('height', layer[0] * a);
    _layer.setAttribute('x', (v - layer[0] * a) / 2);
    _layer.setAttribute('y', (v - layer[0] * a) / 2);
        
    svg.appendChild(_layer);
  });

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function semiCircle(style){

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>
    <defs>
      <clipPath id="cut-off-shade">
        <rect x="0" y="0" width="24" height="18"/>
      </clipPath>
      <clipPath id="cut-off">
        <rect x="0" y="0" width="24" height="17"/>
      </clipPath>
    </defs>
    <circle cx="13" cy="18" r="10" fill="#333" opacity="0.3" clip-path="url(#cut-off-shade)"/>
  </svg>`;

  svg.appendChild(wire(null, 'svg')`
  <circle cx=12 cy=17 r=10 fill=${style.fillColor} clip-path='url(#cut-off)'>`);

  if(style.layers){
    Object.entries(style.layers).map(layer => {
      const arc = wire(null, 'svg')`<circle cx=12 cy=17 fill=${layer[1]} clip-path='url(#cut-off)'>`;
      arc.setAttribute('r', parseInt(parseFloat(layer[0]) * 10));
      svg.appendChild(arc);
    });
  }

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function markerLetter(style) {

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  svg.appendChild(wire(null, 'svg')`
  <path style="opacity: 0.5;" fill=${style.color}
    d="M 10.786 1 C 6.296 1 2.704 4.592 2.704 9.082 C 2.704 10.878 3.153 12.224 4.276 14.245 C 6.52 18.061 10.786 23 10.786 23 C 10.786 23 15.051 18.061 17.296 14.245 C 18.418 12.224 18.867 10.878 18.867 9.082 C 18.867 4.592 15.276 1 10.786 1 Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <path fill=${style.color}
    d="M 9.214 1 C 4.724 1 1.133 4.592 1.133 9.082 C 1.133 10.429 1.582 12.224 2.704 14.245 C 4.949 18.061 9.214 23 9.214 23 C 9.214 23 13.48 18.061 15.724 14.245 C 16.847 12.224 17.296 10.878 17.296 9.082 C 17.296 4.592 13.704 1 9.214 1 Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=9.214285714285715 cy=8.632653061224485 r=5.612244897959183 opacity=0.8 fill="rgb(255, 255, 255)"/>`);

  svg.appendChild(wire(null, 'svg')`
  <text x=9 y=11.5 style="text-anchor: middle; font-weight: 600; font-size: 10px; font-family: sans-serif; fill: rgb(85, 85, 85);">
    ${style.letter}`);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function markerColor(style) {

  const svg = wire()`
  <svg width=1000 height=1000 viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'>`;

  svg.appendChild(wire(null, 'svg')`
  <path style="opacity: 0.5;" fill=${style.colorMarker}
    d="M570,20C370,20,210,180,210,380C210,460,230,520,280,610C380,780,570,1000,570,1000C570,1000,760,780,860,610C910,520,930,460,930,380C930,180,770,20,570,20Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <path fill=${style.colorMarker}
    d="M500,20C300,20,140,180,140,380C140,440,160,520,210,610C310,780,500,1000,500,1000C500,1000,690,780,790,610C840,520,860,460,860,380C860,180,700,20,500,20Z"/>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=500 cy=360 r=250 opacity=0.8 fill="rgb(255, 255, 255)"/>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=500 cy=360 r=180 opacity=0.8 fill=${style.colorDot}/>`);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function geolocation() {

  const svg = wire()`
  <svg width=1000 height=1000 viewBox='0 0 1000 1000' xmlns='http://www.w3.org/2000/svg'>`;

  const d = 'M500,150L500,0M500,850L500,1000M0,500L150,500M850,500L1000,500';

  svg.appendChild(wire(null, 'svg')`
  <circle cx=500 cy=500 r=350 stroke='#1F964D' opacity=0.8 stroke-width=75 fill=none>`);

  svg.appendChild(wire(null, 'svg')`
  <circle cx=500 cy=500 r=200 fill='#1F964D' opacity=0.8>`);

  let p = wire(null, 'svg')`
  <path stroke='#1F964D' opacity=0.8 stroke-width=75>`;

  p.setAttribute('d', d);

  svg.appendChild(p);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));
}

function circle(style){

  const svg = wire()`
  <svg width=24 height=24 viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'>`;

  const circle = wire(null, 'svg')`
  <circle cx=12 cy=12
  stroke="${style.strokeColor || '#333333'}" 
  stroke-width="${style.strokeWidth || 1}" fill="${style.fillColor || 'none'}">`

  circle.setAttribute('r', style.radius || 10);

  svg.appendChild(circle);

  return 'data:image/svg+xml,' + encodeURIComponent(xmlSerializer.serializeToString(svg));

}