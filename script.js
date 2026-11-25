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
        item.querySelector('.acc-trigger').addEventListener('click', function () {
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
          if (!navigator.clipboard) {
            showToast('Gagal menyalin');
            return;
          }
          navigator.clipboard.writeText(button.getAttribute('data-copy'))
            .then(function () { showToast('Tersalin'); })
            .catch(function () { showToast('Gagal menyalin'); });
        });
      });

      function fetchJson(url) {
        return fetch(url, { cache: 'no-store' }).then(function (response) {
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
            if (stars) stars.textContent = Number(data.stargazers_count).toLocaleString('id-ID');
            if (forks) forks.textContent = Number(data.forks_count).toLocaleString('id-ID');
          })
          .catch(function () { /* fallback stars dan forks tetap tampil */ });

        fetchJson('https://api.github.com/repos/realidkroo/Mochy-Music/releases?per_page=100')
          .then(function (list) {
            var total = 0;
            list.forEach(function (release) {
              (release.assets || []).forEach(function (asset) {
                total += Number(asset.download_count) || 0;
              });
            });
            var downloads = document.getElementById('repo-downloads');
            if (downloads && total) downloads.textContent = total.toLocaleString('en-US');
          })
          .catch(function () { /* fallback downloads tetap tampil */ });
      }
      loadRepoStats();
      setInterval(loadRepoStats, 300000);
    })();
