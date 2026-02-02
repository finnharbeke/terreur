const NOTE_TIME = 2000;
const SUCCESS_TIME = 1000;
const COOLDOWN = 5000;

let guilty: boolean | null = null;

document.querySelector<HTMLButtonElement>('#coupable')!.onclick = () => {
  guilty = true;
};
document.querySelector<HTMLButtonElement>('#non-coupable')!.onclick = () => {
  guilty = false;
};

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
  if (guilty) {
    note.innerHTML = `
    Vous avez votez <span class="text-rose-300">coupable</span>!
    `;
  } else {
    note.innerHTML = `
      Vous avez votez <span class="text-emerald-300">non coupable</span>!
    `;
  }
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
    // wait = true;
    // setTimeout(() => {
    //   wait = false;
    // }, 15000)
};