
let guilty: boolean | null = null;
let wait: boolean = false;

document.querySelector<HTMLButtonElement>('#coupable')!.onclick = () => {
  guilty = true;
};
document.querySelector<HTMLButtonElement>('#non-coupable')!.onclick = () => {
  guilty = false;
};
document.querySelector<HTMLButtonElement>('#vote')!.onclick = () => {
  console.log(guilty);
  if (wait) {
    document.querySelector<HTMLButtonElement>('#note')!.innerHTML = `
      Attendez svp...
    `
    return;
  } else if (guilty === null) {
    document.querySelector<HTMLButtonElement>('#note')!.innerHTML = `
      Vous avez pas encore fait une décision!
    `
    return;
  } else {
    if (guilty) {
      document.querySelector<HTMLButtonElement>('#note')!.innerHTML = `
      Vous avez votez <span class="text-rose-300">coupable</span>!
      `
    } else {
      document.querySelector<HTMLButtonElement>('#note')!.innerHTML = `
        Vous avez votez <span class="text-emerald-300">non coupable</span>!
      `
    }
    wait = true;
    setTimeout(() => {
      wait = false;
    }, 15000)
  }
  guilty = null;
  setTimeout(() => {
    document.querySelector<HTMLButtonElement>('#note')!.innerHTML = ''
  }, 2000)
};