import Tabulator from 'tabulator-tables';

export default _xyz => {

  return params => {

    const columns = [];

    Object.values(params.layer.infoj).map(entry => {

      if(!entry.type
        || entry.type === 'numeric'
        || entry.type === 'integer'
        || entry.type === 'text'
        || entry.type === 'textarea'){
        entry.title = entry.label;
        columns.push(entry);
      }
            
      if(entry.type === 'date') {
        entry.title = entry.label;
        entry.formatter = _xyz.utils.formatDate;
        columns.push(entry);
      }
            
      if(entry.type === 'datetime') {
        entry.title = entry.label;
        entry.formatter = _xyz.utils.formatDateTime;
        columns.push(entry);
      }

    });

    params.layer.tableView.table = new Tabulator(params.target, {
      columns: columns,
      autoResize: true,
      selectable: true,
      resizableRows: true,
      rowClick: (e, row) => {

        console.log(row);

      }
    });

    _xyz.tableview.updateTable(params.layer);

  };
};