var ranked_title_container = document.getElementById('ranked_title_filters')
var users_table = document.getElementById('users_ladder')

ranked_title_filters.addEventListener('click', (event) => {
  if (event.target.className == "rank_title") {
    document.location.href = document.location.origin + '/ranked/' + event.target.parentElement.id;
  }
})

users_table.addEventListener('click', (event) => {
  if (event.target.className == "user_container") {
    document.location.href = document.location.origin + '/user/' + event.target.id;
  }
  if (event.target.classList.contains("user")) {
    document.location.href = document.location.origin + '/user/' + event.target.parentElement.id;
  }
})
