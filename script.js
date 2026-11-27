(function () {
  var items = Array.prototype.slice.call(document.querySelectorAll('.acc-item'));

  function setState(item, open) {
    var trigger = item.querySelector('.acc-trigger');
    var panel = item.querySelector('.acc-panel');
    item.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', String(open));
    panel.inert = !open;
  }

  items.forEach(function (item) { setState(item, false); });
  document.body.classList.add('acc-ready');

  items.forEach(function (item) {
    var trigger = item.querySelector('.acc-trigger');
    if (!trigger) return;
    trigger.addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      items.forEach(function (other) {
        setState(other, other === item && willOpen);
        other.classList.remove('reveal');
      });
      if (willOpen) item.classList.add('reveal');
    });
  });

  var toast = document.getElementById('toast');
  var toastTimer;
  function showToast(message) {
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toast.classList.remove('show'); }, 1600);
  }

  document.querySelectorAll('[data-copy]').forEach(function (button) {
    button.addEventListener('click', function () {
      var text = button.getAttribute('data-copy');
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text)
          .then(function () { showToast('Tersalin'); })
          .catch(function () { showToast('Gagal menyalin'); });
      } else {
        showToast('Gagal menyalin');
      }
    });
  });

  function fetchJson(url) {
    return fetch(url, { cache: 'default' }).then(function (response) {
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    });
  }

  function loadRepoStats() {
    if (!window.fetch) return;

    fetchJson('https://api.github.com/repos/realidkroo/Mochy-Music')
      .then(function (data) {
        var stars = document.getElementById('repo-stars');
        var forks = document.getElementById('repo-forks');
        if (stars && typeof data.stargazers_count === 'number') {
          stars.textContent = Number(data.stargazers_count).toLocaleString('id-ID');
        }
        if (forks && typeof data.forks_count === 'number') {
          forks.textContent = Number(data.forks_count).toLocaleString('id-ID');
        }
      })
      .catch(function () {});

    fetchJson('https://api.github.com/repos/realidkroo/Mochy-Music/releases?per_page=100')
      .then(function (list) {
        if (!Array.isArray(list)) return;
        var total = 0;
        for (var i = 0; i < list.length; i++) {
          var assets = list[i].assets || [];
          for (var j = 0; j < assets.length; j++) {
            total += Number(assets[j].download_count) || 0;
          }
        }
        var downloads = document.getElementById('repo-downloads');
        if (downloads && total) downloads.textContent = total.toLocaleString('en-US');
      })
      .catch(function () {});
  }

  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadRepoStats, { timeout: 1500 });
  } else {
    setTimeout(loadRepoStats, 300);
  }
})();
