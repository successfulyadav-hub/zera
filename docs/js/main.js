/* ===== ZERA WEBSITE — Shared JS ===== */
(function(){
  /* Scroll reveals */
  var revealObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        e.target.classList.add('in-view');
        revealObs.unobserve(e.target);
      }
    });
  },{threshold:.1, rootMargin:'0px 0px -40px 0px'});
  document.querySelectorAll('.reveal,.reveal-left,.reveal-right,.reveal-scale').forEach(function(el){
    revealObs.observe(el);
  });

  /* Nav scroll effect */
  var nav = document.querySelector('.site-nav');
  if(nav){
    var navTick = false;
    window.addEventListener('scroll',function(){
      if(!navTick){
        requestAnimationFrame(function(){
          nav.classList.toggle('scrolled', scrollY > 40);
          navTick = false;
        });
        navTick = true;
      }
    });
  }

  /* Mobile nav toggle */
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  var overlay = document.querySelector('.nav-overlay');
  if(toggle && links){
    toggle.addEventListener('click',function(){
      links.classList.toggle('open');
      if(overlay) overlay.classList.toggle('open');
      var isOpen = links.classList.contains('open');
      toggle.setAttribute('aria-expanded', isOpen);
    });
    if(overlay){
      overlay.addEventListener('click',function(){
        links.classList.remove('open');
        overlay.classList.remove('open');
        toggle.setAttribute('aria-expanded','false');
      });
    }
    links.querySelectorAll('a').forEach(function(a){
      a.addEventListener('click',function(){
        links.classList.remove('open');
        if(overlay) overlay.classList.remove('open');
      });
    });
  }

  /* Smooth scroll for hash links */
  document.querySelectorAll('a[href^="#"]').forEach(function(a){
    a.addEventListener('click',function(e){
      var hash = a.getAttribute('href');
      if(hash === '#') return;
      var t = document.querySelector(hash);
      if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth',block:'start'})}
    });
  });

  /* Counter animation for numbers */
  var counterObs = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){
        animateCounter(e.target);
        counterObs.unobserve(e.target);
      }
    });
  },{threshold:.5});
  document.querySelectorAll('[data-count]').forEach(function(el){counterObs.observe(el)});

  function animateCounter(el){
    var target = parseInt(el.getAttribute('data-count'),10);
    var duration = 1500;
    var start = performance.now();
    function tick(now){
      var t = Math.min((now - start)/duration, 1);
      var ease = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * ease);
      if(t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* Parallax for elements with data-parallax */
  var parallaxEls = document.querySelectorAll('[data-parallax]');
  if(parallaxEls.length){
    var pTick = false;
    window.addEventListener('scroll',function(){
      if(!pTick){
        requestAnimationFrame(function(){
          var scrollY = window.pageYOffset;
          parallaxEls.forEach(function(el){
            var speed = parseFloat(el.getAttribute('data-parallax')) || 0.1;
            var rect = el.getBoundingClientRect();
            var offset = (rect.top + scrollY - window.innerHeight/2) * speed;
            el.style.transform = 'translateY(' + offset + 'px)';
          });
          pTick = false;
        });
        pTick = true;
      }
    });
  }
})();
