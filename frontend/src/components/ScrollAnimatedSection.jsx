import { useScrollAnimation } from '../hooks/useScrollAnimation';

const ScrollAnimatedSection = ({ children, className = '', ...props }) => {
  const ref = useScrollAnimation();

  return (
    <section ref={ref} className={className} {...props}>
      {children}
    </section>
  );
};

export default ScrollAnimatedSection;







