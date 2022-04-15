function exportToJsonFile(jsonData: any): void {
    let dataStr = JSON.stringify(jsonData);
    let dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.json';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
}

function exportListToCsvFile(data: any[]) {
    if (data[0] instanceof Array) {
        data = data.map(array => array.join(","));
    }
    let dataStr = data.join("\n");
    let dataUri = 'data:application/csv;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = 'data.csv';

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
}

export {exportToJsonFile, exportListToCsvFile};