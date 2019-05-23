export default _xyz => param => {

	const xhr = new XMLHttpRequest();

	xhr.open('GET', _xyz.host + '/api/location/edit/documents/delete?' + _xyz.utils.paramString({
		locale: _xyz.locale,
		layer: param.entry.location.layer,
		table: param.entry.location.table,
		field: param.entry.field,
		id: param.entry.location.id,
		doc_id: param.doc.id,
		doc_src: encodeURIComponent(param.doc.href),
		token: _xyz.token
	}));

	xhr.onload = e => {

		if (e.target.status !== 200) return;
		document.getElementById(doc.id).remove();
	};

	xhr.send();
}