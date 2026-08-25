// Простая клик-аналитика по офферам.
// Хранит счётчики локально (localStorage) и, если на сайт подключена
// Яндекс.Метрика (window.ym) или GA4 (window.gtag), одновременно
// отправляет туда цель — тогда статистика будет доступна по всем
// посетителям в кабинете счётчика, а не только в этом браузере.

function trackOfferClick(offerId, offerTitle) {
  try {
    var key = 'clicks:' + offerId;
    var current = parseInt(localStorage.getItem(key) || '0', 10);
    localStorage.setItem(key, String(current + 1));
    localStorage.setItem('lastClick:' + offerId, new Date().toISOString());
  } catch (e) { /* localStorage может быть недоступен — не критично */ }

  // Яндекс.Метрика: замените YOUR_COUNTER_ID в index.html и раскомментируйте вызов ym в head.
  if (typeof window.ym === 'function' && window.YM_COUNTER_ID) {
    window.ym(window.YM_COUNTER_ID, 'reachGoal', 'offer_click', { offer: offerId });
  }
  // GA4, если подключён gtag.js
  if (typeof window.gtag === 'function') {
    window.gtag('event', 'offer_click', { offer_id: offerId, offer_title: offerTitle });
  }
  console.log('[analytics] click ->', offerId);
}

document.addEventListener('click', function (e) {
  var el = e.target.closest('[data-offer]');
  if (el) trackOfferClick(el.getAttribute('data-offer'), el.getAttribute('data-offer-title') || '');
});

// Прокрутка карусели банков мышкой (drag-to-scroll) + свайп на телефоне
document.addEventListener('DOMContentLoaded', function () {
  var el = document.querySelector('.carousel');
  if (!el) return;

  // --- Drag-to-scroll мышью (десктоп) ---
  var isDown = false, startX, scrollLeft;
  el.addEventListener('mousedown', function (e) {
    isDown = true; el.classList.add('dragging');
    startX = e.pageX - el.offsetLeft; scrollLeft = el.scrollLeft;
  });
  ['mouseleave', 'mouseup'].forEach(function (evt) {
    el.addEventListener(evt, function () { isDown = false; el.classList.remove('dragging'); });
  });
  el.addEventListener('mousemove', function (e) {
    if (!isDown) return;
    e.preventDefault();
    var x = e.pageX - el.offsetLeft;
    el.scrollLeft = scrollLeft - (x - startX) * 1.4;
  });

  // Колесо мыши тоже листает карусель по горизонтали
  el.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      el.scrollLeft += e.deltaY;
      e.preventDefault();
    }
  }, { passive: false });

  // --- Центрируем карусель по среднему элементу при заходе на сайт ---
  function centerCarouselOnMiddleCard() {
    var cards = el.querySelectorAll('.bank-card');
    if (!cards.length) return;
    var middleCard = cards[Math.floor((cards.length - 1) / 2)];
    var targetLeft = middleCard.offsetLeft - (el.clientWidth - middleCard.offsetWidth) / 2;
    el.scrollLeft = Math.max(0, targetLeft);
  }

  // Ждём, пока картинки логотипов в карточках подгрузятся (иначе offsetWidth
  // карусели ещё может быть неверным на мобильных до полного рендера).
  if (document.readyState === 'complete') {
    centerCarouselOnMiddleCard();
  } else {
    window.addEventListener('load', centerCarouselOnMiddleCard);
  }
  // Пересчитываем при повороте экрана / изменении размера окна
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(centerCarouselOnMiddleCard, 150);
  });
});

// Небольшая анимация счётчика в hero-блоке на главной
document.addEventListener('DOMContentLoaded', function () {
  var el = document.querySelector('[data-count-to]');
  if (!el) return;
  var target = parseInt(el.getAttribute('data-count-to'), 10);
  var duration = 900;
  var start = null;
  function step(ts) {
    if (!start) start = ts;
    var progress = Math.min((ts - start) / duration, 1);
    var eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(eased * target).toLocaleString('ru-RU');
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
});
