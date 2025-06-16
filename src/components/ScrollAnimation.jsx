import { useEffect } from 'react';

const ScrollAnimation = ({ 
    selectors = {
        about: '.about-card',
        features: '.features-section, .additional-features',
        testimonials: '.testimonials',
        pricing: '.pricing',
        faq: '.faq',
        newsletter: '.newsletter'
    },
    thresholds = {
        about: 0.2,
        features: 0.1,
        testimonials: 0.1,
        pricing: 0.1,
        faq: 0.1,
        newsletter: 0.2
    },
    cardSelectors = '.feature-card, .testimonial-card, .pricing-card, .faq-item',
    delay = 100
}) => {
    useEffect(() => {
        // Reset scroll position on page load
        window.history.scrollRestoration = "manual";
        window.scrollTo(0, 0);

        // Remove focus from form elements
        const formElements = document.querySelectorAll('input, button, textarea');
        formElements.forEach(element => element.blur());

        // Check if an element is visible in the viewport
        const checkVisibility = (element, threshold = 0.2) => {
            const windowHeight = window.innerHeight;
            const scrollTop = window.scrollY;
            const elementTop = element.getBoundingClientRect().top + scrollTop;
            const elementHeight = element.offsetHeight;

            return (
                elementTop + elementHeight * threshold < scrollTop + windowHeight &&
                elementTop + elementHeight * (1 - threshold) > scrollTop
            );
        };

        // Animate elements when they come into view
        const animateElements = (selector, threshold, delay = 100) => {
            const elements = document.querySelectorAll(selector);
            elements.forEach((element, index) => {
                if (checkVisibility(element, threshold)) {
                    element.classList.add('visible');

                    // Animate child elements if they exist
                    const childElements = element.querySelectorAll(cardSelectors);
                    childElements.forEach((child, i) => {
                        setTimeout(() => {
                            child.classList.add('visible');
                        }, i * delay);
                    });
                }
            });
        };

        // Initial animation check for all sections
        const animateAllSections = () => {
            Object.entries(selectors).forEach(([key, selector]) => {
                animateElements(selector, thresholds[key], delay);
            });
        };

        // Run animations on page load
        animateAllSections();

        // Run animations on scroll
        const handleScroll = () => {
            animateAllSections();
        };

        window.addEventListener('scroll', handleScroll);

        // Set animation order index for cards
        const cards = document.querySelectorAll(cardSelectors);
        cards.forEach((card, index) => {
            card.style.setProperty('--card-index', index);
        });

        // FAQ toggle functionality
        const faqQuestions = document.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.addEventListener('click', () => {
                const faqItem = question.parentElement;
                
                if (faqItem.classList.contains('active')) {
                    faqItem.classList.remove('active');
                } else {
                    faqItem.classList.add('active');
                }
            });
        });

        // Cleanup function
        return () => {
            window.removeEventListener('scroll', handleScroll);
            faqQuestions.forEach(question => {
                question.removeEventListener('click', () => {});
            });
        };
    }, [selectors, thresholds, cardSelectors, delay]); // Add dependencies

    return null;
};

export default ScrollAnimation; 