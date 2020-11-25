// const form = document.querySelector("form");

// function appendNewDream(dream) {
//   const newListItem = document.createElement("li");
//   newListItem.innerText = dream;
//   dreamsList.appendChild(newListItem);
// }

fetch("/meetings")
  .then(response => response.json())
  .then(meetings => {
    document.getElementById("meetings").innerHTML = JSON.stringify(meetings)
  });