var edit = document.getElementById('edit');
var heart = document.getElementById('heart');
var heart_liked = document.getElementById('heartliked');
var drawnimage = document.getElementById('drawnimage');
var author_info = document.getElementById('author_info');

var drawnimagesource = drawnimage.src.replace("http://localhost:3000/images/", "");

author_info.addEventListener('click', (event) => {
  if (event.target.className == "authorname") {
    document.location.href = document.location.origin + '/user/' + event.target.id;
  }
})

if (heart)
heart.addEventListener('click', async () => {
  let result = await fetch(document.location.origin + '/api/like/' + parseInt(drawnimagesource));
  let json = await result.json();
  if (json.success == true) {
    heart.className = "hide";
    heartliked.className = "";
  }
});

if (heart_liked)
heart_liked.addEventListener('click', async () => {
  let result = await fetch(document.location.origin + '/api/unlike/' + parseInt(drawnimagesource));
  let json = await result.json();
  if (json.success == true) {
    heart_liked.className = "hide";
    heart.className = ""
  }
});

edit.addEventListener('click', () => {
  document.location.href = document.location.origin + '/mashup/' + drawnimagesource;
});

window.addEventListener('load', async() => {
  let result = await fetch(document.location.origin + '/api/getlike/' + parseInt(drawnimagesource));
  let json = await result.json();
  if (json.success == true) {
    heart.className = "hide";
    heartliked.className = "";
  }
  else{
    heart_liked.className = "hide";
    heart.className = ""
  }
})
