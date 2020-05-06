export default _xyz => {

  return {
    fetchWS: fetchWS,
    setWS: setWS,
    admin: admin,
  };

  async function fetchWS() {

    const promise = await fetch(
      _xyz.host +
      '/workspace/get?' +
      _xyz.utils.paramString({
        token: _xyz.token
      }));

    // Assign workspace.
    const workspace = await promise.json();

    _xyz.workspace.locales = workspace.locales;
  };

  function setWS(callback) {

    // XHR to retrieve workspace from host backend.
    const xhr = new XMLHttpRequest();

    xhr.open('GET', _xyz.host + '/workspace/get?' + _xyz.utils.paramString({
      token: _xyz.token
    }));
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.responseType = 'json';
    xhr.onload = e => {

      if (e.target.status !== 200) return console.error('Failed to retrieve workspace from XYZ host!');

      _xyz.workspace.locales = e.target.response.locales;

      loadLocale(callback);
    };

    xhr.send();
  };

  function loadLocale(callback) {

    _xyz.locale = _xyz.locale || (_xyz.hooks && _xyz.hooks.current.locale) || Object.keys(_xyz.workspace.locales)[0];

    // Assigne workspace locales from locales list and input params.
    _xyz.workspace.locale = Object.assign({ key: _xyz.locale }, _xyz.workspace.locales[_xyz.locale]);

    loadScripts(callback)
  };

  function loadScripts(callback) {

    if (!_xyz.workspace.locale.scripts) return loadLayers(callback);

    Promise.all(_xyz.workspace.locale.scripts.map(script => _xyz.utils.loadScript(script + '&token=' + _xyz.token)))
      .then(() => loadLayers(callback));
  }

  function loadLayers(callback){

    Object.keys(_xyz.workspace.locale.layers)
    .filter(key => key.indexOf('__') === -1)
    .forEach(key => {
      _xyz.layers.list[key] = _xyz.layers.decorate(_xyz.workspace.locale.layers[key]);
    });

    callback && callback(_xyz);
  }



  function admin() {

    const workspace = document.getElementById('workspace');

    workspace.style.display = 'block';

    const btnCloseWS = document.getElementById('btnCloseWS');

    btnCloseWS.onclick = () => {
      workspace.style.display = 'none';
      document.getElementById('codemirror').innerHTML = '';
    };

    const codeMirror = CodeMirror(document.getElementById('codemirror'), {
      value: '{}',
      lineNumbers: true,
      mode: 'application/json',
      gutters: ['CodeMirror-lint-markers'],
      lint: true,
      lineWrapping: true,
      autofocus: true,
    });


    const fileInput = document.getElementById('fileInputWS');

    fileInput.addEventListener('change', function () {

      let reader = new FileReader();
      reader.onload = function () {
        try {
          fileInput.value = null;
          codeMirror.setValue(this.result);
          codeMirror.refresh();

        } catch (err) {
          alert('Failed to parse JSON');
        }
      };
      reader.readAsText(this.files[0]);

    });


    const btnFile = document.getElementById('btnFileWS');

    btnFile.onclick = () => fileInput.click();


    const btnUpload = document.getElementById('btnUploadWS');

    btnUpload.onclick = () => {

      const xhr = new XMLHttpRequest();
      xhr.open('POST', document.head.dataset.dir + '/workspace/check?token=' + document.body.dataset.token);
      xhr.setRequestHeader('Content-Type', 'application/json');
      xhr.responseType = 'json';
      xhr.onload = e => {

        if (e.target.status !== 200) alert('I am not here. This is not happening.');

        if (confirm(e.target.response.join('\r\n'))) {

          const xhr = new XMLHttpRequest();
          xhr.open('POST', document.head.dataset.dir + '/workspace/set?token=' + document.body.dataset.token);
          xhr.setRequestHeader('Content-Type', 'application/json');
          xhr.responseType = 'json';
          xhr.onload = e => {

            if (e.target.status !== 200) alert('I am not here. This is not happening.');

            const locale = _xyz.hooks.current.locale;

            _xyz.hooks.removeAll();

            setWS(() => {
              _xyz.hooks.removeAll();

              _xyz.hooks.set({ locale: locale });

              _xyz.workspace.loadLocale();

              mask.remove();
            });

            mask.remove();
          };

          xhr.send(JSON.stringify({ settings: codeMirror.getValue() }));

        } else {

          mask.remove();

        }

      };

      const mask = _xyz.utils.wire()`
      <div id="desktop_mask" style><p class="primary-colour">Updating Workspace</p>`

      document.body.appendChild(mask);

      xhr.send(JSON.stringify({ settings: codeMirror.getValue() }));

    };

    // Load workspace in codemirror.
    const xhr = new XMLHttpRequest();
    xhr.open('GET', document.head.dataset.dir + '/workspace/get?token=' + document.body.dataset.token);
    xhr.responseType = 'json';
    xhr.onload = e => {
      codeMirror.setValue(JSON.stringify(e.target.response, null, '  '));
      codeMirror.refresh();
    };
    xhr.send();

  }

};