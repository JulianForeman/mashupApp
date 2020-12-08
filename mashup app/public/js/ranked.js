var ranked_title_container = document.getElementById('ranked_title_filters')

ranked_title_filters.addEventListener('click', (event) => {
  if (event.target.className == "rank_title") {
    document.location.href = document.location.origin + '/ranked/' + event.target.parentElement.id;
  }
})
