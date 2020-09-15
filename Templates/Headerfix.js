<script>
document.getElementsByTagName("BODY")[0].onload = function() {adjustHeader()};
document.getElementsByTagName("BODY")[0].onresize = function() {adjustHeader()};
function adjustHeader() {
  var offset = document.getElementById('completeHeader').offsetHeight;
  document.getElementById('scrollpart').style.paddingTop = offset +"px";
  };
  // actually this is not the complete fix as it just positions the whole scrollable part but not
  // the various Fakultäten..  but we should be fine for now
</script>
