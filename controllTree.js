const puppeteer = require('puppeteer');
var page;

(async () => {
    const browser = await puppeteer.launch({headless: false});
    page = await browser.newPage();
    await page.goto('https://openui5-testbed.hottek.dev/index.html');
    await page.addScriptTag({path: 'tst.js'});
    await page.waitForNavigation({waitUntil: "networkidle0"});
    let controlTree = await page.evaluate(() => {return test()});
    let reducedControlTree = reduceControlTree(controlTree);
    let actionControls = extractActionControlsFromTree(reducedControlTree);
    await attackControls(actionControls);
    actionControls.forEach(v => console.log(v));
    // await browser.close();
})();

function reduceControlTree(controlTree) {
    let reducedControlTree = [];
    controlTree.forEach(v => {
        if (v.hasOwnProperty('id')) {
            reducedControlTree.push(v);
        }
    });
    return reducedControlTree;
}

function extractActionControlsFromTree(reducedControlTree) {
    let controls = [];
    let pattern = /input|button/i;
    let regex = new RegExp(pattern);
    reducedControlTree.forEach(v => {
        if (regex.test(v.id) || regex.test(v.domId) || regex.test(v.name)) {
            controls.push(v);
        }
    });
    return controls;
}

async function attackControls(actionControls) {
    let buttonPattern = /button/i;
    let inputPattern = /input/i;
    let buttonRegex = new RegExp(buttonPattern);
    let inputRegex = new RegExp(inputPattern);
    for (const v of actionControls) {
        if (buttonRegex.test(v.id) || buttonRegex.test(v.domId) || buttonRegex.test(v.name)) {
            const button = await page.evaluateHandle((v) => document.querySelector('#'+v.domId), v);
            button.click();
        }
        if (inputRegex.test(v.id) || inputRegex.test(v.domId) || inputRegex.test(v.name)) {
            let xssVector = 'alert(1)';
            await page.evaluate(({v, xssVector}) => {
                const input = document.querySelector('#'+v.domId+'-inner');
                input.value = xssVector;
            }, {v, xssVector});
        }
    }
}
