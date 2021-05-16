function getFullControlTree(node, recDepth) {
    recDepth++;
    let result = [];
    const control = sap.ui.getCore().byId(node.id);
    if (control !== undefined) {
        result.push({
            recDepth: recDepth,
            id: control.getId(),
            domId: node.id,
            name: control.getMetadata().getName()
        });
    } else {
        result.push({
            recDepth: recDepth,
            error: 'Control is undefined'
        });
    }
    let children = node.children;
    let numOfChildren = children.length;
    for (let i = 0; i < numOfChildren; i++) {
        result.push(...getFullControlTree(children[i], recDepth));
    }
    return result;
}

function test() {
    let recDepth = 0;
    let controlTree = getFullControlTree(window.document.body, recDepth);
    return controlTree;
}
