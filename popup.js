!function(__window__){
    const toggleEl = document.getElementById('toggle')
    const updateToggleEl = (enabled) => {
        if(enabled){
            toggleEl.textContent = 'Disable'
        }else{
            toggleEl.textContent = 'Enable'
        }
    } 
    const state = chrome.runtime.sendMessage({
        type: 'getState'
    }, function(state){
        updateToggleEl(state.enabled)
    })
    toggleEl.onclick = (e) => {
        chrome.runtime.sendMessage({
            type: 'toggle-extension'
        }, function(enabled){
            updateToggleEl(enabled)
            __window__.close()
        })
    }
}(window)