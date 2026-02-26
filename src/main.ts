const ERROR_COOLDOWN = 3000;
const VOTE_COOLDOWN = 5000;
const UPDATE_INTERVAL = 10000;

const API = "https://lkoch-verdict.ch/api";

let config_open = false;

const vote = (guilty: boolean) => {
  let coup = document.querySelector<HTMLParagraphElement>('#coupable')!;
  let noncoup = document.querySelector<HTMLParagraphElement>('#non-coupable')!;
  coup.setAttribute("disabled", "true");
  noncoup.setAttribute("disabled", "true");
  const enable = () => {
    coup.removeAttribute("disabled");
    noncoup.removeAttribute("disabled");
  };

  let round_id = document.querySelector<HTMLSelectElement>('#round-select')!.value;

  fetch(`${API}/vote`, {
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
    // VOTED SUCCESSFULLY

    let loader_span = document.querySelector<HTMLParagraphElement>('#loader_span')!;
    if (guilty) {
      loader_span.innerText = "coupable";
      loader_span.classList.remove("text-blue-300");
      loader_span.classList.add("text-red-300");
    } else {
      loader_span.innerText = "non-coupable";
      loader_span.classList.remove("text-red-300");
      loader_span.classList.add("text-blue-300");
    }
    let loader = document.querySelector<HTMLDivElement>('#loader')!;
    loader.classList.remove("hidden");

    setTimeout(() => {
      loader.classList.add("hidden");
      enable();
    }, VOTE_COOLDOWN)
  })
  .catch((e) => {
    // ERROR ON VOTE

    let errortag = document.querySelector<HTMLParagraphElement>('#error')!;
    errortag.classList.remove("hidden");
    console.log(e);
    setTimeout(() => {
      errortag.classList.add("hidden");
      enable();
    }, ERROR_COOLDOWN);
  })
}

document.querySelector<HTMLButtonElement>('#coupable')!.onclick = () => {
  vote(true);
};
document.querySelector<HTMLButtonElement>('#non-coupable')!.onclick = () => {
  vote(false);
};

document.addEventListener("touchstart", function(){}, true)

const fill_select = () => fetch(`${API}/rounds`)
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

  fetch(`${API}/create-round`, {
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


// document.querySelector<HTMLButtonElement>('#judge')!.onclick = () => {
//   let note = document.querySelector<HTMLParagraphElement>('#note')!;
//   console.log(guilty);
// };

const clear_results = () => {

  document.querySelector<HTMLHeadingElement>('#judgement')!.innerText = '';
  document.querySelector<HTMLHeadingElement>('#result_status')!.innerText = '';
  document.querySelector<HTMLSpanElement>('#nr-coupable')!.innerText = '-';
  document.querySelector<HTMLSpanElement>('#nr-noncoupable')!.innerText = '-';
}

document.querySelector<HTMLButtonElement>('#round-select')!.onchange = () => {
  clear_results();
  update_results();
};

const update_results = () => {
  let round_id = document.querySelector<HTMLButtonElement>('#round-select')!.value;
  fetch(`${API}/results/${round_id}`)
  .then((data) => data.json())
  .then(({guilty, innocent}: {guilty: number, innocent: number}) => {
    document.querySelector<HTMLSpanElement>('#nr-coupable')!.innerText = guilty.toString();
    document.querySelector<HTMLSpanElement>('#nr-noncoupable')!.innerText = innocent.toString();
    if (guilty == innocent)
      document.querySelector<HTMLHeadingElement>('#judgement')!.innerText = 'draw';
    else if (guilty > innocent)
      document.querySelector<HTMLHeadingElement>('#judgement')!.innerText = 'laura koch est coupable!';
    else
      document.querySelector<HTMLHeadingElement>('#judgement')!.innerText = 'laura koch est non-coupable!';
    
    document.querySelector<HTMLHeadingElement>('#result_status')!.innerText = `from ${(new Date()).toLocaleTimeString()}`;
  })
  .catch((e) => {
    // ERROR ON FETCH

    document.querySelector<HTMLHeadingElement>('#judgement')!.innerText = 'error: couldn\'t fetch';
    console.log(e);
  })

}

// wait for rounds to load
setTimeout(() => {
  update_results();
  setInterval(update_results, UPDATE_INTERVAL);

}, 3000);