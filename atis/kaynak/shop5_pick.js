function shopPick(id) {
  const T = TABS[shopTab], it = T.list.find((x) => x.id === id), key = ownKey(shopTab, id);
  const own = it.price === 0 || SAVE.own[key];
  T.apply(id);
  if (own) { SAVE[T.key] = id; tryOn = null; save(); tick(); }
  else if (tryOn === id) { // second tap on a previewed item buys it
    if (SAVE.fe >= it.price) { addFe(-it.price); SAVE.own[key] = 1; SAVE[T.key] = id; tryOn = null; save(); SFX.win(); buzz([20, 30, 20]); toastShop(it.name, 'senin oldu!'); }
    else { toastShop('Yetersiz tüy', 'bölüm bitir ya da tüy al'); shopTab = 'fe'; tryOn = null; equipAll(); shopPreview(); }
  } else { tryOn = id; toastShop(it.name, 'denemedesin · almak için tekrar dokun'); }
  renderShop();
}
