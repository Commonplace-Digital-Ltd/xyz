import polyStyle from './polyStyle.mjs';

import clusterStyle from './clusterStyle.mjs';

import legend from './legend/_legend.mjs';

export default _xyz => {

  const style = {

    panel: panel,

    legend: legend(_xyz),

    polyStyle: polyStyle(_xyz),

    clusterStyle: clusterStyle(_xyz),

  };

  return style;

  function panel(layer) {

    if (!layer.style) return;

    if (!layer.style.theme && layer.style.hidden) return;
  
    const panel = _xyz.utils.wire()`
    <div class="drawer panel expandable ${layer.style.theme || layer.format === 'grid' ? 'expanded' : ''}">`;
  
    // Panel header
    panel.appendChild(_xyz.utils.wire()`
    <div
      class="header primary-colour"
      onclick=${e => {
        e.stopPropagation();
        _xyz.utils.toggleExpanderParent(e.target, true);
      }}><span>Style</span><button
      class="btn-header xyz-icon icon-expander primary-colour-filter">`);
  
    // Add toggle for label layer.
    layer.style.label && panel.appendChild(_xyz.utils.wire()`
    <label class="input-checkbox" style="margin-bottom: 10px;">
    <input type="checkbox"
      checked=${!!layer.style.label.display}
      onchange=${e => {
        layer.style.label.display = e.target.checked;
        layer.show();
      }}>
    </input>
    <div></div><span>Display Labels.`);
  
    // Add theme control
    if(layer.style.theme && !layer.style.hidden){

      // Assign 'Basic' style entry to themes object.
      const themes = Object.assign({"Basic": null}, layer.style.themes);
  
      panel.appendChild(_xyz.utils.wire()`<div>Select thematic style.`);
  
      panel.appendChild(_xyz.utils.wire()`
      <button class="btn-drop">
      <div
        class="head"
        onclick=${e => {
          e.preventDefault();
          e.target.parentElement.classList.toggle('active');
        }}>
        <span>${Object.keys(themes)[1]}</span>
        <div class="icon"></div>
      </div>
      <ul>
        ${Object.entries(themes).map(
          theme => _xyz.utils.wire()`
          <li onclick=${e=>{
            const drop = e.target.closest('.btn-drop');
            drop.querySelector('span').textContent = theme[0];
            drop.classList.toggle('active');
            layer.style.theme = theme[1];
            applyTheme(layer);
            layer.reload();
          }}>${theme[0]}`)}`);
            
    }

    if (layer.style.theme && layer.style.themes && layer.style.hidden) {
      panel.appendChild(_xyz.utils.wire()`<span style="font-weight: bold;">${Object.keys(layer.style.themes)[0]}`)
    }

    // Allow hide all from legend
    panel.appendChild(_xyz.utils.wire()`
      <div class="switch-all" style="font-size: 90%; display:none;">Click on labels to switch visibity or 
      <a class="primary-colour" style="cursor: pointer;"
      onclick=${e => {
        e.stopPropagation();

        const switches = panel.querySelectorAll('.switch');

        switches.forEach(_switch => _switch.click());

        layer.reload()

    }}>switch all</a>.`);

    layer.style.bringToFront = _xyz.utils.wire()`<button 
      title="Bring layer to front."
      style="margin-top: 5px;"
      class="btn-wide primary-colour"
      onclick=${()=>layer.bringToFront()}>Bring layer to front`;

    // Apply the current theme.
    applyTheme(layer); 
  
    return panel;
  
    function applyTheme(layer) {
      
      // enable or hide 'switch all' filter.
      panel.querySelector('.switch-all').style.display = layer.style.theme && layer.style.theme.type === 'categorized' ? 'block' : 'none';
  
      // Empty legend.
      layer.style.legend && layer.style.legend.remove();

      layer.style.bringToFront.remove();
  
      if (layer.style.theme || layer.format === 'grid') {

        layer.style.bringToFront.disabled = !layer.display;
        panel.appendChild(_xyz.layers.view.style.legend(layer));
        panel.appendChild(layer.style.bringToFront);
        return
      }
  
      layer.style.legend = _xyz.utils.wire()`<div class="legend">`;
  
      layer.style.marker && style.clusterStyle(layer, layer.style.marker, 'Marker');
  
      layer.style.markerMulti && style.clusterStyle(layer, layer.style.markerMulti, 'MultiMarker');
  
      layer.style.default && style.polyStyle(layer, layer.style.default, 'Polygon');
  
      layer.style.highlight && style.polyStyle(layer, layer.style.highlight, 'Highlight');

      panel.appendChild(layer.style.legend);

      layer.style.bringToFront.disabled = !layer.display;

      panel.appendChild(layer.style.bringToFront);
  
    }
  
  }

}