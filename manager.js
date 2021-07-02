if (!chrome.cookies) {
    chrome.cookies = chrome.experimental.cookies;
}

function getSessionCookies() {
    return new Promise(resolve => {
        chrome.cookies.getAll({}, cookies => {
            const sessionsMap = cookies
                .filter(cookie => cookie.domain.includes('discovery'))
                .reduce((map, cookie) => {
                    if(cookie.name === 'SESSION' || cookie.name === 'XSRF-TOKEN') {
                        map[cookie.name] = cookie.value
                    }
                    return map
                }, {})
            resolve(sessionsMap)
        })
    })
}

function selectById(id) {
    return document.getElementById(id)
}

function copy(containerId) {
    const selector = selectById(containerId)
    const range = document.createRange()
    range.selectNode(selector);
    window.getSelection().addRange(range);
    document.execCommand("copy");
}

const XSRF_CELL_ID = 'xsrf-token'
const SESSION_CELL_ID = 'session-token'
const GENERATED_COMMAND_ID = 'generated-command'
document.addEventListener('DOMContentLoaded', function() {
    getSessionCookies().then(map => {
        const xsrf = selectById(XSRF_CELL_ID)
        const session = selectById(SESSION_CELL_ID)
        const generatedEl = selectById(GENERATED_COMMAND_ID)

        const xsrfContent = map['XSRF-TOKEN']
        const sessionContent = map['SESSION']
        xsrf.textContent = xsrfContent
        session.textContent = sessionContent || 'You might need to log in again!'
        generatedEl.textContent = `./start-gateway-proxy.cmd ${sessionContent} ${xsrfContent}`

        selectById('session-copy-btn').addEventListener('click', () => copy(SESSION_CELL_ID))
        selectById('xsrf-copy-btn').addEventListener('click', () => copy(XSRF_CELL_ID))
        selectById('command-copy-btn').addEventListener('click', () => copy(GENERATED_COMMAND_ID))
    })
}, false);
