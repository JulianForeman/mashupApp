var edit = document.getElementById('edit');
var heart = document.getElementById('heart');
var heart_liked = document.getElementById('heartliked');
var drawnimage = document.getElementById('drawnimage');

var drawnimagesource = drawnimage.src.replace("http://localhost:3000/images/", "");

heart.addEventListener('click', () => {

})

edit.addEventListener('click', () => {
  document.location.href = document.location.origin + '/mashup/' + drawnimagesource;
})
