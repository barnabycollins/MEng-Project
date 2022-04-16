// FOR PROGRAMS HANDLING THIS DATA, SEE:
// https://github.com/barnabycollins/MEng-Project-Docs/tree/main/graph-gen

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

async function exportListToCsvFile(data: any[], name="data", ...info: string[]) {
    if (data[0] instanceof Array) {
        data = data.map(array => array.join(","));
    }
    
    let dataStr = data.join("\n");
    let infoStr = "";
    if (info.length > 0) {
        infoStr = `_${info.join("_")}`
    }

    let exportFileDefaultName = `${name}${infoStr}.csv`;

    const auto_download = false;

    const saveButton = document.getElementById("save-btn") as HTMLButtonElement;

    saveButton.addEventListener("click", async () => {
        // @ts-ignore
        const fileHandle: FileSystemFileHandle = await window.showSaveFilePicker({suggestedName: exportFileDefaultName, types: [{description: "CSV File", accept: {"text/csv": [".csv"]}}]});
        // @ts-ignore
        const writable = await fileHandle.createWritable();
    
        await writable.write(dataStr);
        await writable.close();
    });
    saveButton.classList.remove("inactive");

    if (auto_download) {
        let dataUri = 'data:application/csv;charset=utf-8,'+ encodeURIComponent(dataStr);
        let linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        linkElement.remove();
    }
}

function exportObjectToCsvFile(data: {[key:string]: number[]}, name="data", ...info: string[]) {
    let csvArray: any[][] = [];
    const keys = Object.keys(data);
    csvArray.push(keys);
    for (let i = 0; i < data[keys[0]].length; i++) {
        csvArray.push(keys.map(key => data[key][i]));
    }

    exportListToCsvFile(csvArray, name, ...info);
}

export {exportToJsonFile, exportListToCsvFile, exportObjectToCsvFile};