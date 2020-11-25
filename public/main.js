// const form = document.querySelector("form");

// function appendNewDream(dream) {
//   const newListItem = document.createElement("li");
//   newListItem.innerText = dream;
//   dreamsList.appendChild(newListItem);
// }

fetch("/meetings")
  .then(response => response.json())
  .then(meetings => {
    document.getElementById("meetings").innerHTML = meetings
  });

const loginHandler = () => {
  const email = document.getElementById("email");
  fetch('/login?email=' + email).then(async (response) => {
    if (response) document.getElementById("resPreview").innerHTML = await response.text()
    else {
      form.submit()
    }
  })
}