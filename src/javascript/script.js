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
 
  $('.abrir-modal-transparencia').on('click', function (e) {
    e.preventDefault(); // Impede que a tela role para a <section id="transparencia">
    openModal();        // Abre o modal diretamente
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

/* MODAL DE CONTATO */
  function openModalContato() {
    $('#modal-contato-overlay').addClass('active');
    $('body').css('overflow', 'hidden'); // Impede a rolagem da página de fundo
  }
 
  function closeModalContato() {
    var $box = $('#modal-contato-box');
    $box.css({
      animation: 'none',
      transition: 'transform 0.25s ease, opacity 0.25s ease',
      transform: 'translateY(30px) scale(0.97)',
      opacity: '0'
    });
    setTimeout(function () {
      $('#modal-contato-overlay').removeClass('active');
      $('body').css('overflow', '');
      $box.css({ transform: '', opacity: '', transition: '' });
    }, 250);
  }

  // Aciona a abertura ao clicar no link do menu
  $('.abrir-modal-contato').on('click', function (e) {
    e.preventDefault(); // Impede a navegação padrão do link #
    openModalContato();
  });
 
  // Aciona o fechamento nos botões e overlay
  $('#modal-contato-close').on('click', closeModalContato);
 
  $('#modal-contato-overlay').on('click', function (e) {
    if ($(e.target).is('#modal-contato-overlay')) closeModalContato();
  });

  /* =========================================
     MODAL DE DOAÇÃO - FLUXO COMPLETO
     ========================================= */
     
  function openModalDoacao() {
    // Reseta o modal para o passo 1 sempre que abrir
    $('#step-2-pagamento').hide();
    $('#step-1-valor').show();
    $('#input-valor-doacao').val('');
    $('.btn-valor-preset').removeClass('active');
    $('input[name="pagamento"]').prop('checked', false); // Tira seleção do PIX/Cartão
    $('#area-pix').hide();
    $('#area-cartao').hide();
    
    $('#modal-doacao-overlay').addClass('active');
    $('body').css('overflow', 'hidden'); // Trava o scroll
  }
 
  function closeModalDoacao() {
    var $box = $('#modal-doacao-box');
    $box.css({
      animation: 'none',
      transition: 'transform 0.25s ease, opacity 0.25s ease',
      transform: 'translateY(30px) scale(0.97)',
      opacity: '0'
    });
    setTimeout(function () {
      $('#modal-doacao-overlay').removeClass('active');
      $('body').css('overflow', '');
      $box.css({ transform: '', opacity: '', transition: '' });
    }, 250);
  }

  // 1. Abrir Modal (Botões do Menu)
  $('#btn-doar-nav, #btn-doar-mobile').on('click', function (e) {
    e.preventDefault();
    openModalDoacao();
  });
 
  // 2. Fechar Modal (Botão X e Overlay)
  $('#modal-doacao-close').on('click', closeModalDoacao);
  $('#modal-doacao-overlay').on('click', function (e) {
    if ($(e.target).is('#modal-doacao-overlay')) closeModalDoacao();
  });

  // 3. Lógica do Passo 1: Clicar nos botões de valor predefinidos
  $('.btn-valor-preset').on('click', function() {
    // Remove a classe active de todos e coloca só no clicado
    $('.btn-valor-preset').removeClass('active');
    $(this).addClass('active');
    
    // Pega o valor do botão e joga no input
    var valor = $(this).data('valor');
    $('#input-valor-doacao').val(valor);
  });

  // Se o usuário digitar manualmente, desmarca os botões
  $('#input-valor-doacao').on('input', function() {
    $('.btn-valor-preset').removeClass('active');
  });

  // 4. Lógica de "Continuar" para o Passo 2
  $('#btn-continuar-doacao').on('click', function() {
    var valorDigitado = $('#input-valor-doacao').val();
    
    // Validação simples
    if(!valorDigitado || valorDigitado <= 0) {
      alert("Por favor, informe ou escolha um valor válido para doar.");
      return;
    }

    // Formata o valor na tela do passo 2
    $('#display-total-doacao').text(parseFloat(valorDigitado).toFixed(2).replace('.', ','));
    
    // Esconde passo 1, Mostra passo 2
    $('#step-1-valor').hide();
    $('#step-2-pagamento').fadeIn();
  });

  // 5. Botão Voltar (do Passo 2 para o Passo 1)
  $('.btn-voltar-doacao').on('click', function(e) {
    e.preventDefault();
    $('#step-2-pagamento').hide();
    $('#step-1-valor').fadeIn();
  });

  // 6. Lógica de Mostrar PIX ou Cartão
  $('input[name="pagamento"]').on('change', function() {
    var metodoSelecionado = $(this).val();

    if (metodoSelecionado === 'pix') {
      $('#area-cartao').hide();
      $('#area-pix').fadeIn();
      $('#btn-confirmar-final').text('Concluir Doação');
    } else if (metodoSelecionado === 'cartao') {
      $('#area-pix').hide();
      $('#area-cartao').fadeIn();
      $('#btn-confirmar-final').text('Confirmar Pagamento');
    }
  });