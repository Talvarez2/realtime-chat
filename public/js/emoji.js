(() => {
  const btn = document.getElementById('emoji-btn');
  const picker = document.getElementById('emoji-picker');
  const input = document.getElementById('input');
  const emojis = ['😊','😃','😂','😢','😛','😮','🤔','❤️','🔥','👍','👎','👋','👏','💯','🚀','⭐','✅','❌','👀','🎉','😎','🙏','💪','🤝','🫡'];

  picker.innerHTML = emojis.map(e => `<span class="emoji-item">${e}</span>`).join('');

  btn.onclick = () => { picker.hidden = !picker.hidden; };

  picker.onclick = (e) => {
    if (e.target.classList.contains('emoji-item')) {
      input.value += e.target.textContent;
      input.focus();
      picker.hidden = true;
    }
  };

  document.addEventListener('click', (e) => {
    if (!btn.contains(e.target) && !picker.contains(e.target)) picker.hidden = true;
  });
})();
