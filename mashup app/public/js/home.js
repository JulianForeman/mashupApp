var feed_container = document.getElementById('homefeed')

feed_container.addEventListener('click', (event) => {
  if (event.target.className == "feed-image") {
    document.location.href = document.location.origin + '/image/' + event.target.parentElement.id;
  }
})
