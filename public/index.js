const form = document.querySelector("form");

// form.addEventListener("submit", event => {
//   event.preventDefault();
//   const email = document.getElementById("email").value;
//   fetch('/login?email=' + email.split('.')[0]).then((response) => {
//     if (response) {
//       let msg = response.text()
//       console.log("Response MSG");
//       console.log(msg);
//       if (msg == "signup") form.submit()
//     } else console.log("no response");
//   })
// });