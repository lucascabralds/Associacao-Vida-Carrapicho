$(document).ready(function () {
    $('#mobile_btn').on('click', function () {
        $('#mobile_menu').toggleClass('active');

        let icone = $('#mobile_btn').find('img');

        if ($('#mobile_menu').hasClass('active')) {

            icone.attr('src', './img/x-solid-full.svg');
        } else {

            icone.attr('src', './img/bars-solid-full.svg');
        }

    });
});

$(document).ready(function () {
 
  /* MENU MOBILE */
  $('#mobile_btn').on('click', function () {
    $('#mobile_menu').toggleClass('active');
    var icone = $('#mobile_btn').find('img');
    if ($('#mobile_menu').hasClass('active')) {
      icone.attr('src', './img/x-solid-full.svg');
    } else {
      icone.attr('src', './img/bars-solid-full.svg');
    }
  });
 
  /* GRÁFICO */
 /* GRÁFICO */
  var chartInstance = null;
 
  function buildChart() {
    if (typeof Chart === 'undefined') {
      console.error('Chart.js nao carregado');
      return;
    }

    // Registra o plugin das etiquetas (DataLabels)
    Chart.register(ChartDataLabels);
 
    if (chartInstance) {
      chartInstance.destroy();
      chartInstance = null;
    }
 
    var oldCanvas = document.getElementById('transparenciaChart');
    if (!oldCanvas) return;
    var parent = oldCanvas.parentNode;
    var newCanvas = document.createElement('canvas');
    newCanvas.id = 'transparenciaChart';
    parent.replaceChild(newCanvas, oldCanvas);
 
    var ctx = newCanvas.getContext('2d');
 
    chartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ['Alimentação', 'Educação', 'Saúde', 'Admin'],
        datasets: [{
          // Usando as porcentagens exatas da imagem para a altura
          data: [43.75, 31.25, 18.75, 6.25], 
          backgroundColor: ['#3b82f6', '#a855f7', '#ec4899', '#eab308'], // Cores do mockup
          borderRadius: { topLeft: 6, topRight: 6, bottomLeft: 0, bottomRight: 0 },
          borderSkipped: false,
          barPercentage: 0.9,      // Deixa as barras mais largas
          categoryPercentage: 0.9  // Reduz o espaço entre elas
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 900, easing: 'easeOutQuart' },
        layout: {
          padding: {
            top: 30 // Dá espaço no topo para a etiqueta não cortar
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }, // Desativa o hover padrão para ficar igual à imagem
          datalabels: {
            anchor: 'end',
            align: 'top',
            offset: 4,
            color: '#ffffff',
            // Puxa a mesma cor da barra para o fundo da etiqueta
            backgroundColor: function(context) {
              return context.dataset.backgroundColor[context.dataIndex];
            },
            borderRadius: 4,
            font: {
              weight: 'bold',
              size: 11
            },
            padding: {
              top: 4,
              bottom: 4,
              left: 8,
              right: 8
            },
            formatter: function(value) {
              return value + '%';
            }
          }
        },
        scales: {
          y: {
            display: false, // Esconde completamente o eixo Y (linhas e números)
            beginAtZero: true,
            max: 55 // Um valor máximo um pouco acima dos 43.75 para dar respiro visual
          },
          x: {
            grid: { display: false, drawBorder: false },
            border: { display: false }, // Remove a linha da base
            ticks: { 
              color: '#6b7280', 
              font: { weight: '500', size: 12 },
              padding: 10
            }
          }
        }
      }
    });
  }
 
  /* MODAL */
  function openModal() {
    $('#modal-overlay').addClass('active');
    $('body').css('overflow', 'hidden');
    setTimeout(buildChart, 200);
  }
 
  function closeModal() {
    var $box = $('#modal-box');
    $box.css({
      animation: 'none',
      transition: 'transform 0.25s ease, opacity 0.25s ease',
      transform: 'translateY(30px) scale(0.97)',
      opacity: '0'
    });
    setTimeout(function () {
      $('#modal-overlay').removeClass('active');
      $('body').css('overflow', '');
      $box.css({ transform: '', opacity: '', transition: '' });
    }, 250);
  }
 
  $('#btn-doar-nav, #btn-doar-mobile').on('click', function () {
    triggerDoarAnimation($(this));
    setTimeout(openModal, 300);
  });
 
  $('#modal-close').on('click', closeModal);
 
  $('#modal-overlay').on('click', function (e) {
    if ($(e.target).is('#modal-overlay')) closeModal();
  });
 
  $(document).on('keydown', function (e) {
    if (e.key === 'Escape') closeModal();
  });
 
  /* ANIMAÇÃO BOTÃO DOAR */
  function triggerDoarAnimation($btn) {
    $btn.removeClass('clicked');
    var $shimmer = $('<span class="shimmer"></span>');
    $btn.append($shimmer);
    void $btn[0].offsetWidth;
    $btn.addClass('clicked');
    setTimeout(function () {
      $shimmer.remove();
      $btn.removeClass('clicked');
    }, 750);
  }
});