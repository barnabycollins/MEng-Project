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

function exportListToCsvFile(data: any[], name="data") {
    if (data[0] instanceof Array) {
        data = data.map(array => array.join(","));
    }
    let dataStr = data.join("\n");
    let dataUri = 'data:application/csv;charset=utf-8,'+ encodeURIComponent(dataStr);

    let exportFileDefaultName = `${name}.csv`;

    let linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    linkElement.remove();
}

function exportObjectToCsvFile(data: {[key:string]: number[]}, name="data") {
    let csvArray: any[][] = [];
    const keys = Object.keys(data);
    csvArray.push(keys);
    for (let i = 0; i < data[keys[0]].length; i++) {
        csvArray.push(keys.map(key => data[key][i]));
    }

    exportListToCsvFile(csvArray, name);
}

export {exportToJsonFile, exportListToCsvFile, exportObjectToCsvFile};