const form = document.querySelector("form");

function appendNewDream(dream) {
  const newListItem = document.createElement("li");
  newListItem.innerText = dream;
  dreamsList.appendChild(newListItem);
}

// fetch("/dreams")
//   .then(response => response.json())
//   .then(dreams => {
//     dreamsList.firstElementChild.remove();
//     dreams.forEach(appendNewDream);
//     dreamsForm.addEventListener("submit", event => {
//       event.preventDefault();
//       let newDream = dreamsForm.elements.dream.value;
//       dreams.push(newDream);
//       appendNewDream(newDream);
//       dreamsForm.reset();
//       dreamsForm.elements.dream.focus();
//     });
//   });

const loginHandler = () => {
  const email = document.getElementById("email").value;
  fetch('/login?email=' + email.split('.')[0]).then(async(response) => {
    if(response) document.getElementById("resPreview").innerHTML = await response.text()
    else {
      form.submit()
    }
  })
}