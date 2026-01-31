
let guilty: boolean | null = null;

document.querySelector<HTMLButtonElement>('#coupable')!.onclick = () => {
  guilty = true;
};
document.querySelector<HTMLButtonElement>('#non-coupable')!.onclick = () => {
  guilty = false;
};
document.querySelector<HTMLButtonElement>('#vote')!.onclick = () => {
  console.log(guilty);
  if (guilty === null) {
    document.querySelector<HTMLButtonElement>('#note')!.innerHTML = `
      Vous avez pas encore fait une décision!
    `
  } else if (guilty) {
    document.querySelector<HTMLButtonElement>('#note')!.innerHTML = `
    Vous avez votez <span class="text-rose-300">coupable</span>!
    `
  } else {
    document.querySelector<HTMLButtonElement>('#note')!.innerHTML = `
      Vous avez votez <span class="text-emerald-300">non coupable</span>!
    `
  }
  setTimeout(() => {
    document.querySelector<HTMLButtonElement>('#note')!.innerHTML = ''
  }, 2000)
  guilty = null;
};