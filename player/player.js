(function(window, videojs, href) {
  // Disable Videojs Logs
  videojs.log.level('off')
  const options ={
    fill: true,
    controls: true,
    autoplay: true
  }
  var player = window.player = videojs('player',{
    ...options,
    plugins: {
      httpSourceSelector: {
        default: 'auto'
      }
    }
  });
  const url = href.split('#')[1]
  player.src(url)
  player.httpSourceSelector();
  player.ready(()=>{
      // Disable dash.js Logs
    if(player.dash && player.dash.mediaPlayer){
      player.dash.mediaPlayer.getDebug().setLogToBrowserConsole(false)
    }
    // Focus Player for hotkeys to work
    player.el().focus()
    // initialize the hotkeys plugin
    player.hotkeys({
      skipInitialFocus: false,
      enableInactiveFocus : true,
      volumeStep: 0.1,
      enableMute: true,
      enableFullscreen: true,
      enableNumbers: true,
      enableVolumeScroll: true,
      enableHoverScroll: true,
      seekStep: 10,

      // Enhance existing simple hotkey with a complex hotkey
      fullscreenKey: function(e) {
        // fullscreen with the F key or Ctrl+Enter
        return ((e.which === 70) || (e.ctrlKey && e.which === 13));
      },
      customKeys: {
        togglePlayKey: {
          key: function(e){
            return (e.key === 'k' || e.key === "K")
          },
          handler: function(player){
            if(player.paused()){
              player.play()
            }else{
              player.pause()
            }
          }
        }
      }
    })
  })
}(window, window.videojs, window.location.href));