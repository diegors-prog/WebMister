//Slide automático, não utilizado neste projeto
if(window.SimpleSlide) {
    new SimpleSlide({
        slide: "quote",
        time: 30000
    });

    new SimpleSlide({
        slide: "portfolio",
        time: 30000,
        nav: true
    });
}

//Animação das introduções
if(window.SimpleAnime) {
    new SimpleAnime({

    });
}

//mensagem de retorno de envio de formulario ok ou erro de envio
if(window.SimpleForm) {
    new SimpleForm({
        form: ".formphp", // seletor do formulário
        button: "#enviar", // seletor do botão
        erro: "<div id='form-erro'><h2>Erro no envio!</h2><p>Um erro ocorreu, tente para o email contato@webmister.com</p></div>", // mensagem de erro
        sucesso: "<div id='form-sucesso'><h2>Formulário enviado com sucesso</h2><p>Em breve eu entro em contato com você.</p></div>", // mensagem de sucesso
    });
}

//FAQ acordião

function initAccordion() {
    const accordionList = document.querySelectorAll('.js-accordion dt');
    const activeClass = 'ativo';
    if (accordionList.length) {
        accordionList[0].classList.add(activeClass);
        accordionList[0].nextElementSibling.classList.add(activeClass);

        function activeAccordion() {
            this.classList.toggle(activeClass);
            this.nextElementSibling.classList.toggle(activeClass);
        };

        accordionList.forEach((item) => {
            item.addEventListener('click', activeAccordion);
        });
    };
};
initAccordion();

//Slides

function debounce(callback, delay) {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        callback(...args);
        timer = null;
      }, delay);
    };
}

class Slide {
    constructor(slide, wrap) {
        this.slide = document.querySelector(slide);
        this.wrap = document.querySelector(wrap);
        this.dist = {finalPosition: 0, startX: 0, movement: 0};
        this.activeClass = 'active';
        this.changeEvent = new Event('changeEvent');
    }

    transition(active) {
        this.slide.style.transition = active ? 'transform .3s' : '';
    }

    moveSlide(distX) {
        this.dist.movePosition = distX;
        this.slide.style.transform = `translate3d(${distX}px, 0, 0)`;
    }

    updatePosition(clientX) {
        this.dist.movement = (this.dist.startX - clientX) * 1.6;
        return this.dist.finalPosition - this.dist.movement;
    }

    onStart(event) {
        let movetype;
        if (event.type === 'mousedown') {
            event.preventDefault();
            this.dist.startX = event.clientX;
            movetype = "mousemove";
        } else {
            this.dist.startX = event.changedTouches[0].clientX;
            movetype = 'touchmove';
        }
        this.wrap.addEventListener(movetype, this.onMove);
        this.transition(false);
    }

    onMove(event) {
        const pointerPosition = (event.type === 'mousemove') ? event.clientX : event.changedTouches[0].clientX;
        const finalPosition = this.updatePosition(pointerPosition);
        this.moveSlide(finalPosition);
    }

    onEnd(event) {
        const movetype = (event.type === 'mouseup') ? 'mousemove' : 'touchmove';
        this.wrap.removeEventListener(movetype, this.onMove);
        this.dist.finalPosition = this.dist.movePosition;
        this.transition(true);
        this.changeSlideOnEnd();
    }

    changeSlideOnEnd() {
        if (this.dist.movement > 120 && this.index.next !== undefined) {
            this.activeNextSlide();
        } else if (this.dist.movement < -120 && this.index.prev !== undefined) {
            this.activePrevSlide();
        } else {
            this.changeSlide(this.index.active);
        }
    }

    addSlideEvents() {
        this.wrap.addEventListener('mousedown', this.onStart);
        this.wrap.addEventListener('touchstart', this.onStart);
        this.wrap.addEventListener('mouseup', this.onEnd);
        this.wrap.addEventListener('touchend', this.onEnd);
    }

    //Slide config

    slidePosition(slide) {
        const margin = (this.wrap.offsetWidth - slide.offsetWidth) / 2;
        return -(slide.offsetLeft - margin);
    }

    slidesConfig() {
        this.slideArray = [...this.slide.children].map((element) => {
            const position = this.slidePosition(element);
            return { position, element };
        });
    }

    slidesIndexNav(index) {
        const last = this.slideArray.length -1;
        this.index = {
            prev: index ? index - 1 : undefined,
            active: index,
            next: index === last ? undefined : index + 1
        }
    }

    changeSlide(index) {
        const activeSlide = this.slideArray[index];
        this.moveSlide(activeSlide.position);
        this.slidesIndexNav(index);
        this.dist.finalPosition = activeSlide.position;
        this.changeActiveClass();
        this.wrap.dispatchEvent(this.changeEvent);
    }

    changeActiveClass() {
        this.slideArray.forEach(item => item.element.classList.remove(this.activeClass));
        this.slideArray[this.index.active].element.classList.add(this.activeClass);
    }

    activePrevSlide() {
        if (this.index.prev !== undefined) this.changeSlide(this.index.prev);
    }

    activeNextSlide() {
        if (this.index.next !== undefined) this.changeSlide(this.index.next);
    }

    onResize() {
        setTimeout(() => {
            this.slidesConfig();
            this.changeSlide(this.index.active);
        }, 1000);
    }

    addResizeEvent() {
        window.addEventListener('resize', this.onResize);
    }

    bindEvents() {
        this.onStart = this.onStart.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onEnd = this.onEnd.bind(this);

        this.activePrevSlide = this.activePrevSlide.bind(this);
        this.activeNextSlide = this.activeNextSlide.bind(this);

        this.onResize = debounce(this.onResize.bind(this), 200)
    }

    init() {
        this.bindEvents();
        this.transition(true);
        this.addSlideEvents();
        this.slidesConfig();
        this.addResizeEvent();
        this.changeSlide(1);
        return this;
    }
}

class SlideNav extends Slide {
    constructor(slide, wrap) {
        super(slide, wrap);
        this.bindControlEvents();
    }

    addArrow(prev, next) {
        this.prevElement = document.querySelector(prev);
        this.nextElement = document.querySelector(next);
        this.addArrowEvent();
    }

    addArrowEvent() {
        this.prevElement.addEventListener('click', this.activePrevSlide);
        this.nextElement.addEventListener('click', this.activeNextSlide);
    }

    createControl() {
        const control = document.createElement('ul');
        control.dataset.control = 'slide';

        this.slideArray.forEach((item, index) => {
            control.innerHTML += `<li><a href+"#slide${index + 1}">${index + 1}</a></li>`;
        });
        this.wrap.appendChild(control);
        return control;
    }

    eventControl(item, index) {
        item.addEventListener('click', (event) => {
            event.preventDefault();
            this.changeSlide(index);
        });
        this.wrap.addEventListener('changeEvent', this.activeControlItem);
    }

    activeControlItem() {
        this.controlArray.forEach(item => item.classList.remove(this.activeClass));
        this.controlArray[this.index.active].classList.add(this.activeClass);
    }

    addControl(customControl) {
        this.control = document.querySelector(customControl) || this.createControl();
        this.controlArray = [...this.control.children];

        this.activeControlItem();
        this.controlArray.forEach(this.eventControl);
    }

    bindControlEvents() {
        this.eventControl = this.eventControl.bind(this);
        this.activeControlItem = this.activeControlItem.bind(this);
    }
}

const slide = new SlideNav('.slide-lista', '.slide-wrap');
slide.init();
slide.addArrow('.prev', '.next');

slide.addControl('.custom-controls');

//Horário de funcionamento

function initFuncionamento() {
    const funcionamento = document.querySelector('[data-semana]');
    const diasSemana = funcionamento.dataset.semana.split(',').map(Number);
    const horarioSemana = funcionamento.dataset.horario.split(',').map(Number);

    const dataAgora = new Date();
    const diaAgora = dataAgora.getDay();
    const horarioAgora = dataAgora.getHours();

    const semanaAberto = diasSemana.indexOf(diaAgora) !== -1;

    const horarioAberto = (horarioAgora >= horarioSemana[0] && horarioAgora < horarioSemana[1]);

    if (semanaAberto && horarioAberto) {
        funcionamento.classList.add('aberto');
    }
}
initFuncionamento();

function changeGridNav() {
    let menuMobile = document.querySelector('nav');
    
}


