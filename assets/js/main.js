/* JAM Roofing — front-end interactions. Vanilla JS, no dependencies. */
(function () {
	'use strict';

	document.addEventListener('DOMContentLoaded', function () {

		/* ---- Mobile nav ---- */
		var toggle = document.querySelector('.nav-toggle');
		var nav = document.querySelector('.main-nav');
		if (toggle && nav) {
			toggle.addEventListener('click', function () {
				var open = nav.classList.toggle('is-open');
				toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			});
			nav.addEventListener('click', function (e) {
				var link = e.target.closest('a');
				if (!link) { return; }
				// Don't close the panel when tapping a dropdown parent — that tap
				// just expands its submenu (handled below).
				if (link.parentElement.classList.contains('menu-item-has-children')) { return; }
				nav.classList.remove('is-open');
				toggle.setAttribute('aria-expanded', 'false');
			});
		}

		/* ---- Mobile dropdown toggles ---- */
		document.querySelectorAll('.menu-item-has-children > a').forEach(function (link) {
			link.addEventListener('click', function (e) {
				if (window.matchMedia('(max-width: 760px)').matches) {
					e.preventDefault();
					link.parentElement.classList.toggle('submenu-open');
				}
			});
		});

		/* ---- Sticky header shadow ---- */
		var header = document.getElementById('site-header');
		if (header) {
			var onScroll = function () {
				header.classList.toggle('is-stuck', window.scrollY > 10);
			};
			window.addEventListener('scroll', onScroll, { passive: true });
			onScroll();
		}

		/* ---- Service tabs ---- */
		var tabs = document.querySelectorAll('.tab');
		var panels = document.querySelectorAll('.tab-panel');
		tabs.forEach(function (tab) {
			tab.addEventListener('click', function () {
				var key = tab.getAttribute('data-tab');
				tabs.forEach(function (t) {
					var active = t === tab;
					t.classList.toggle('is-active', active);
					t.setAttribute('aria-selected', active ? 'true' : 'false');
				});
				panels.forEach(function (p) {
					p.classList.toggle('is-active', p.getAttribute('data-panel') === key);
				});
			});
		});

		/* ---- Reviews slider (auto-cycling) ---- */
		document.querySelectorAll('.review-slider').forEach(function (slider) {
			var track = slider.querySelector('.review-track');
			var cards = slider.querySelectorAll('.review-card');
			var dotsWrap = slider.querySelector('.review-dots');
			if (!track || cards.length < 2) { return; }

			var index = 0;
			var delay = parseInt(slider.getAttribute('data-autoplay'), 10) || 6000;

			cards.forEach(function (_, i) {
				var dot = document.createElement('button');
				dot.type = 'button';
				dot.setAttribute('aria-label', 'Review ' + (i + 1));
				if (i === 0) { dot.classList.add('is-active'); }
				dot.addEventListener('click', function () { go(i); restart(); });
				dotsWrap.appendChild(dot);
			});
			var dots = dotsWrap.querySelectorAll('button');

			function go(i) {
				index = (i + cards.length) % cards.length;
				// % is relative to the track's own width (cards.length × container),
				// so divide by cards.length to advance exactly one card.
				track.style.transform = 'translateX(-' + (index * (100 / cards.length)) + '%)';
				dots.forEach(function (d, di) { d.classList.toggle('is-active', di === index); });
			}

			var timer = setInterval(function () { go(index + 1); }, delay);
			function restart() { clearInterval(timer); timer = setInterval(function () { go(index + 1); }, delay); }
			slider.addEventListener('mouseenter', function () { clearInterval(timer); });
			slider.addEventListener('mouseleave', restart);
		});

		/* ---- Featured video: load only on click (protects page speed) ----
		   Supports a YouTube/Vimeo embed OR a self-hosted MP4. Either way the
		   poster image loads first and the video bytes are only fetched on click. */
		document.querySelectorAll('.video-frame[data-embed], .video-frame[data-video]').forEach(function (frame) {
			var btn = frame.querySelector('.video-play');
			if (!btn) { return; }
			btn.addEventListener('click', function () {
				var embed = frame.getAttribute('data-embed');
				var src = frame.getAttribute('data-video');
				var el;
				if (embed) {
					el = document.createElement('iframe');
					el.src = embed;
					el.allow = 'autoplay; encrypted-media; picture-in-picture';
					el.setAttribute('allowfullscreen', '');
					el.title = 'JAM Roofing video';
				} else {
					el = document.createElement('video');
					el.src = src;
					el.controls = true;
					el.autoplay = true;
					el.playsInline = true;
					el.setAttribute('poster', frame.querySelector('.video-poster').getAttribute('src'));
				}
				frame.innerHTML = '';
				frame.appendChild(el);
			});
		});

		/* ---- Animated stat counters ---- */
		var stats = document.querySelectorAll('.stat-num[data-count]');
		if (stats.length && 'IntersectionObserver' in window) {
			var io = new IntersectionObserver(function (entries, obs) {
				entries.forEach(function (entry) {
					if (!entry.isIntersecting) { return; }
					var el = entry.target;
					var target = parseInt(el.getAttribute('data-count'), 10) || 0;
					var suffix = el.getAttribute('data-suffix') || '';
					var start = null;
					var dur = 1400;
					function step(ts) {
						if (!start) { start = ts; }
						var p = Math.min((ts - start) / dur, 1);
						var eased = 1 - Math.pow(1 - p, 3);
						el.textContent = Math.floor(eased * target).toLocaleString() + suffix;
						if (p < 1) { requestAnimationFrame(step); }
					}
					requestAnimationFrame(step);
					obs.unobserve(el);
				});
			}, { threshold: 0.4 });
			stats.forEach(function (s) { io.observe(s); });
		}
	});
})();
