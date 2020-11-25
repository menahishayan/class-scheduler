// const form = document.querySelector("form");

// function appendNewDream(dream) {
//   const newListItem = document.createElement("li");
//   newListItem.innerText = dream;
//   dreamsList.appendChild(newListItem);
// }

fetch("/meetings").then(async(meetings) => {
    document.getElementById("meetings").innerHTML += await meetings.text()
  });