export default (_xyz, layer) => {

  const header = _xyz.utils.wire()`
    <div class="header"><div>${layer.name || layer.key}`;
   
  header.toggleDisplay = _xyz.utils.wire()`
    <i
    title="Toggle visibility"
    class="material-icons cursor noselect btn_header">
    ${layer.display ? 'layers' : 'layers_clear'}`;

  header.appendChild(header.toggleDisplay);

  header.toggleDisplay.onclick = e => {

    e.stopPropagation();
  
    // Toggle layer display property.
    layer.display = !layer.display;
  
    // Show layer.
    if (layer.display) return layer.show();
  
    // Hide layer.
    layer.remove();
  };


  header.zoomToExtent = _xyz.utils.wire()`
    <i
    title="Zoom to filtered layer extent"
    class="material-icons cursor noselect btn_header">
    fullscreen`;

  header.appendChild(header.zoomToExtent);

  header.zoomToExtent.onclick = e => {
    e.stopPropagation();
    layer.zoomToExtent();
  };


  // Add symbol to layer header.
  if (layer.format === 'cluster' && layer.style.marker) {
  
    header.appendChild(_xyz.utils.wire()`
      <img
      style="float: right"
      src="${_xyz.utils.svg_symbols(layer.style.marker)}">`);
  }

  return header;
  
};