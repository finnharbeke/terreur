const NOTE_TIME = 2000;
const SUCCESS_TIME = 1000;
const COOLDOWN = 5000;

let guilty: boolean | null = null;
let config_open = false;

document.querySelector<HTMLButtonElement>('#coupable')!.onclick = () => {
  guilty = true;
};
document.querySelector<HTMLButtonElement>('#non-coupable')!.onclick = () => {
  guilty = false;
};

const fill_select = () => fetch("http://127.0.0.1:5000/rounds")
  .then((data) => data.json())
  .then((rounds: {id: number, desc: string}[]) => {
    let select = document.querySelector<HTMLSelectElement>('#round-select')!;
    select.innerHTML = '';
    for (let i in rounds) {
      let opt = document.createElement('option');
      opt.value = rounds[i].id.toString();
      opt.innerHTML = rounds[i].desc;
      if (i == (rounds.length - 1).toString())
        opt.setAttribute("selected", "true");
      select.appendChild(opt);
    }
  })
fill_select();

// CONFIG WINDOW
document.addEventListener("keydown", (e) => {
  if (e.key != 'k' || !e.metaKey)
    return;
  if (config_open)
    document.querySelector<HTMLDivElement>('#config')?.classList.add("hidden");
  else
    document.querySelector<HTMLDivElement>('#config')?.classList.remove("hidden");
  config_open = !config_open;
})

document.querySelector<HTMLButtonElement>('#newround_button')!.onclick = () => {
  let input = document.querySelector<HTMLInputElement>('#newround_input')!;
  let description = input.value;
  let note = document.querySelector<HTMLParagraphElement>('#newround_note')!;
  const clear_note = () => setTimeout(() => {note.innerText = ''}, 2000);
  if (description == "") {
    note.classList.remove("text-green-400");
    note.classList.add("text-red-400");
    note.innerText = 'cannot use an empty round name'
    clear_note();
    return;
  }

  fetch("http://127.0.0.1:5000/create-round", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        description,
    })
  }).then(() => {
      note.classList.remove("text-red-400");
      note.classList.add("text-green-400");
      note.innerText = 'created round '+ description + '!';
      input.value = '';
      fill_select();
  })
  .catch(() => {
    note.classList.remove("text-green-400");
    note.classList.add("text-red-400");
    note.innerText = "error: couldn't create round";
  })
  .finally(clear_note)

}


document.querySelector<HTMLButtonElement>('#judge')!.onclick = () => {
  let note = document.querySelector<HTMLParagraphElement>('#note')!;
  console.log(guilty);
  if (guilty === null) {
    note.innerHTML = `
      Vous avez pas encore fait une décision!
    `;
    setTimeout(() => {
      note.innerHTML = ''
    }, NOTE_TIME);
    return;
  }
  let button = document.querySelector<HTMLParagraphElement>('#judge')!;
  button.setAttribute("disabled", "true");
  let round_id = document.querySelector<HTMLSelectElement>('#round-select')!.value;

  fetch("http://127.0.0.1:5000/vote", {
    method: "post",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
        round_id,
        guilty
    })
  }).then(() => {
      if (guilty) {
        note.innerHTML = `
        Vous avez votez <span class="text-rose-300">coupable</span>!
        `;
      } else {
        note.innerHTML = `
          Vous avez votez <span class="text-emerald-300">non coupable</span>!
        `;
      }
  })
  .catch(() => {
    note.innerText = '<span class="text-red-300">error:</span> couldn\'t create round';
  })
  .finally(() => {
    guilty = null;
    setTimeout(() => {
      button.removeAttribute("disabled");
      note.innerHTML = '';
      let loader = document.querySelector<HTMLDivElement>('#loader')!;
      loader.classList.remove("hidden");
      setTimeout(() => {
        loader.classList.add("hidden");
      }, COOLDOWN)
    }, SUCCESS_TIME);
  })
};