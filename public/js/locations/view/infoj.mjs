export default _xyz => location => {

  if (!location.infoj && location.infoj.length < 1) return;

  location.geometries = location.geometries.filter(geom => {
    _xyz.map.removeLayer(geom)
  });
    
  location.tables = location.tables.filter(table => {
    _xyz.dataview.removeTab(table)
  });

  location.geometryCollection = location.geometryCollection.filter(geom => {
    _xyz.map.removeLayer(geom)
  });

  const listview = _xyz.utils.wire()`<div style="display: grid; grid-gap: 4px; grid-template-columns: 1fr 150px;" class="location-view-grid">`;

  // Create object to hold view groups.
  location.groups = {};

  // Iterate through info fields and add to info table.
  for (const entry of location.infoj) {

    if (location.view && location.view.classList.contains('disabled')) break

    if (!entry.edit && entry.value === null) continue

    entry.listview = listview;

    if (document.body.dataset.viewmode === 'report') entry.edit = null;

    entry.location = location;

    // Determine the user-friendly string representation of the value
    entry.displayValue =
      entry.type === 'numeric' ? parseFloat(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 2 }) :
        entry.type === 'integer' ? parseInt(entry.value).toLocaleString('en-GB', { maximumFractionDigits: 0 }) :
          entry.type === 'date' ? _xyz.utils.formatDate(entry.value) :
            entry.type === 'datetime' ? _xyz.utils.formatDateTime(entry.value) :
              entry.value;

    // Add pre- or suffix if specified
    if(entry.prefix) entry.displayValue = entry.prefix + entry.displayValue;
    if(entry.suffix) entry.displayValue = entry.displayValue + entry.suffix;

    // Create a new info group.
    if (entry.type === 'group') {

      location.groups[entry.label] = entry;

      _xyz.locations.view.group(entry);
            
     listview.appendChild(location.groups[entry.label].div);
      
      continue
    }

    if (entry.type === 'dataview') {

      entry.dataview =  _xyz.utils.wire()`<div style="grid-column: 1 / span 2; width: 100%;">`;

      _xyz.locations.view.dataview(entry);

      entry.target_id ? (document.getElementById(entry.target_id) ? document.getElementById(entry.target_id).appendChild(entry.dataview) : listview.appendChild(entry.dataview)) : listview.appendChild(entry.dataview);

      //listview.appendChild(entry.dataview);
      
      continue
    }

    // Create entry.row inside previously created group.
    if (entry.group && location.groups[entry.group] && location.groups[entry.group].div) location.groups[entry.group].div.style.display = 'grid';
    

    // Create new table cell for the entry label and append to table.
    if (entry.label) {

      entry.label_div = _xyz.utils.wire()`
      <div class="${'label lv-' + (entry.level || 0) + ' ' + (entry.class || '')}" style="grid-column: 1;"
      title="${entry.title || null}">${entry.label}`;

      entry.group ? location.groups[entry.group].div.appendChild(entry.label_div) : entry.listview.appendChild(entry.label_div);

    }

    // display layer name in location view
    if(entry.type === 'key') {

      listview.appendChild(_xyz.utils.wire()`<div class="label lv-0" style="grid-column: 2;">
        <span title="Source layer" class="${entry.class || ''}"
        style="${'float: right; padding: 3px; cursor: help; border-radius: 2px; background-color: ' + (_xyz.utils.Chroma(location.style.strokeColor).alpha(0.3)) + ';'}"
        >${location.layer.name}
        `);

      continue
    }

    if (entry.script) {
      window[entry.script](_xyz, entry);
      continue
    }


    if (entry.type === 'label') {
      entry.label_div.style.gridColumn = "1 / span 2";
      continue
    }

    if (entry.type === 'streetview') {
      _xyz.locations.view.streetview(entry);
      continue
    }

    if (entry.type === 'report') {
      _xyz.locations.view.report(entry);
      continue
    }

    if (entry.type === 'images') {
      _xyz.locations.view.images(entry);
      continue
    }

    if (entry.custom && _xyz.locations.custom[entry.custom]) {
      _xyz.locations.custom[entry.custom](entry);
      continue
    }

    if (entry.type === 'documents') {
      _xyz.locations.view.documents(entry);
      continue
    }

    if (entry.type === 'geometry') {
      _xyz.locations.view.geometry(entry);
      continue
    }

    if (entry.type === 'meta') {
      _xyz.locations.view.meta(entry);
      continue
    }

    if (entry.type === 'boolean') {
      _xyz.locations.view.boolean(entry);    
      continue
    }

    if (entry.type === 'dashboard') {
      _xyz.locations.view.dashboard(entry);
      continue
    }

    // Remove empty row which is not editable.
    if (!entry.edit && !entry.displayValue) continue

    // Create val table cell in a new line.
    if (!entry.inline && !(entry.type === 'integer' ^ entry.type === 'numeric' ^ entry.type === 'date')) {

      if(entry.label_div) entry.label_div.style.gridColumn = "1 / span 2";

      // Create new row and append to table.
      entry.val = _xyz.utils.wire()`<div class="val" style="grid-column: 1 / span 2;">`;

      entry.listview.appendChild(entry.val);

    // Else create val table cell inline.
    } else {

      // Append val table cell to the same row as the label table cell.
      entry.val = _xyz.utils.wire()`<div class="val num" style="grid-column: 2;">`;
      
      entry.group ? location.groups[entry.group].div.appendChild(entry.val) : entry.listview.appendChild(entry.val);

    }

    // Create controls for editable fields.
    if (entry.edit && !entry.fieldfx) {
      _xyz.locations.view.edit.input(entry);
      continue
    }

    if (entry.type === 'html') {

      // Directly set the HTML if raw HTML was specified
      entry.val.style="grid-column: 1 / span 2;";
      entry.val.innerHTML = entry.value;
      continue

    } else {

      // otherwise use the displayValue
      entry.val.textContent = entry.displayValue;
      continue
    }

  };

  return listview;

};