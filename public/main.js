// const form = document.querySelector("form");

// function appendNewDream(dream) {
//   const newListItem = document.createElement("li");
//   newListItem.innerText = dream;
//   dreamsList.appendChild(newListItem);
// }

var vars = {};
window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function (m, key, value) {
  vars[key] = value || '';
});

if (vars.u !== '') {
  window.localStorage.setItem('u', vars.u)
  fetch("/meetings").then(async (meetings) => {
    document.getElementById("meetings").innerHTML += await meetings.text()
  });
} else {
  vars.u = window.localStorage.getItem('u')
  if(!vars.u) window.location.href = '/'
  else fetch(`/login?email=${vars.u}`,(res) => {
    
  })
}

// Vulnerability. Passwordless access