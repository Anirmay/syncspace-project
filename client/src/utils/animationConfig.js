import AOS from 'aos';
import 'aos/dist/aos.css';

export const initAOS = () => {
  AOS.init({
    duration: 1000,
    once: true,
    easing: 'ease-out',
    offset: 100,
  });
};