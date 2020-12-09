var feed_container = document.getElementById('feed')

var logout = document.getElementById('logout');

feed_container.addEventListener('click', (event) => {
  if (event.target.className == "feed-image") {
    document.location.href = document.location.origin + '/image/' + event.target.parentElement.id;
  }
})

logout.addEventListener('click', () => {
  document.location.href = document.location.origin + '/logout';
})
