// Reset after 10 minutes

let minutes = 10;
let resetTime = 60 * minutes;

function setIdle(cb, seconds) {
  var timer;
  var interval = seconds * 1000;
  function refresh() {
    clearInterval(timer);
    timer = setTimeout(cb, interval);
  }
  ["mousemove", "mouseover", "click"].forEach((event) =>
    window.addEventListener(event, refresh),
  );
  refresh();
}

setIdle(function () {
  location.href = "https://jackieis.online/localbathhouse";
}, resetTime);
