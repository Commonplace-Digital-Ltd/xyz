export default _xyz => function (callback) {

  const layer = this;

  const xhr = new XMLHttpRequest();

   layer.filter && layer.filter.current && Object.keys(layer.filter.current).map(key => {
    if(Object.keys(layer.filter.legend).includes(key)) {
      layer.filter.current[key] = Object.assign({}, layer.filter.legend[key], layer.filter.current[key]);
    }
  });

  const filter = layer.filter && Object.assign({}, layer.filter.legend, layer.filter.current);
 
  xhr.open('GET', _xyz.host +
    '/api/query?' +
    _xyz.utils.paramString({
      template: 'count_locations',
      locale: _xyz.workspace.locale.key,
      layer: layer.key,
      table: layer.tableMin(),
      filter: JSON.stringify(filter),
      token: _xyz.token
    }));

  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.responseType = 'json';
      
  xhr.onload = e => {

    if (e.target.status !== 200) return;

    callback && callback(parseInt(e.target.response.count));

  };

  xhr.send();

};