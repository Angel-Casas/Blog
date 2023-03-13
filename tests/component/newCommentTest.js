describe('New Comment Component test', function() {
    it('Checks if the Comment component has been mounted', async (browser) => {
        browser
            .url('http://localhost:8080')
            .waitForElementVisible('.postPreviewBox')
            .click('.postPreviewBox')
            .end();
        // expect(component).to.be.present;
    });
});

describe('Main page', function() {
    it('Checks if there is a random post', async (browser) => {
        let url;
        browser
            .url('http://localhost:8080')
            .waitForElementVisible('.postPreview')
            .getAttribute(
                '.postPreview > a',
                'href',
                result => { url = result.value; }
            )
            .click('postPreview > a')
            .waitForElementvisible('#Entry', 5000)
            .perform(() => browser.assert.urlEquals(url))
            .end();
    })
});