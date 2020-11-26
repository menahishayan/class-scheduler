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
  fetch("/meetings").then((res) => {
    let data = res.text()
    if(data.meetings.total_records == 0) document.getElementById("meetings").innerHTML += "No zoom meetings.\n"
    if(data.courses.length == 0) document.getElementById("courses").innerHTML += "No courses enrolled.\n"
    else {
    data.courses.forEach(c => {
      document.getElementById("courses").innerHTML += `<div class="course">
          <div class="course-id">${c.id}</div>
          <div class="course-name"><b>${c.descriptionHeading}</b></div>
          <div class="course-cal">${c.calendarId}</div>
        </div><br/>`
      });
    }
  });
} else {
  vars.u = window.localStorage.getItem('u')
  if(!vars.u) window.location.href = '/'
  else fetch(`/login?email=${vars.u}`)
}

// Vulnerability. Passwordless access