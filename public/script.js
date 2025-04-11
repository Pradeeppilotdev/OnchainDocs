// Initialize AOS
AOS.init({
    duration: 800,
    offset: 100,
    once: true
});

// Mobile Menu Functionality
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const navLinks = document.querySelector('.nav-links');
const menuIcon = mobileMenuBtn.querySelector('i');

mobileMenuBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    menuIcon.classList.toggle('fa-bars');
    menuIcon.classList.toggle('fa-times');
});

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target) && navLinks.classList.contains('active')) {
        navLinks.classList.remove('active');
        menuIcon.classList.add('fa-bars');
        menuIcon.classList.remove('fa-times');
    }
});

// Close menu when clicking on a link
document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        menuIcon.classList.add('fa-bars');
        menuIcon.classList.remove('fa-times');
    });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Navbar scroll effect
const nav = document.querySelector('nav');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll <= 0) {
        nav.classList.remove('scroll-up');
        nav.classList.remove('scroll-down');
        return;
    }
    
    if (currentScroll > lastScroll && !nav.classList.contains('scroll-down')) {
        nav.classList.remove('scroll-up');
        nav.classList.add('scroll-down');
    } else if (currentScroll < lastScroll && nav.classList.contains('scroll-down')) {
        nav.classList.remove('scroll-down');
        nav.classList.add('scroll-up');
    }
    
    lastScroll = currentScroll;
});

// Handle form submission
const contactForm = document.querySelector('.contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = contactForm.querySelector('input[type="email"]').value;
        const message = contactForm.querySelector('textarea').value;
        
        // Add your form submission logic here
        console.log('Form submitted:', { email, message });
        
        // Clear form
        contactForm.reset();
        
        // Show success message
        alert('Message sent successfully!');
    });
}

// Service card hover effect
const serviceCards = document.querySelectorAll('.service-card');
serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// Get Started button animation
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', () => {
        ctaButton.classList.add('clicked');
        setTimeout(() => {
            ctaButton.classList.remove('clicked');
        }, 200);
    });
}

// Handle window resize
let resizeTimer;
window.addEventListener('resize', () => {
    document.body.classList.add('resize-animation-stopper');
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        document.body.classList.remove('resize-animation-stopper');
    }, 400);
});

// Preload images for better performance
window.addEventListener('load', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        if (img.dataset.src) {
            img.src = img.dataset.src;
        }
    });
});
document.addEventListener('DOMContentLoaded', function() {
    // Create DNA base pairs
    const basePairs = document.querySelector('.base-pairs');
    const numberOfPairs = 20;

    for (let i = 0; i < numberOfPairs; i++) {
        const basePair = document.createElement('div');
        basePair.className = 'base-pair';
        basePair.style.top = `${(i * 100) / numberOfPairs}%`;
        basePair.style.transform = `rotateY(${(i * 360) / numberOfPairs}deg)`;
        basePairs.appendChild(basePair);
    }

    // Add mouse interaction
    const dnaContainer = document.querySelector('.dna-container');
    
    dnaContainer.addEventListener('mousemove', (e) => {
        const { left, top, width, height } = dnaContainer.getBoundingClientRect();
        const x = (e.clientX - left - width/2) / 25;
        const y = (e.clientY - top - height/2) / 25;
        
        gsap.to('.dna-helix', {
            duration: 0.5,
            rotationY: x,
            rotationX: -y,
            ease: 'power2.out'
        });
    });

    dnaContainer.addEventListener('mouseleave', () => {
        gsap.to('.dna-helix', {
            duration: 1,
            rotationY: 0,
            rotationX: 0,
            ease: 'power2.out'
        });
    });
});
// 3D Background Animation with Ruby Crystals and Celestial Objects
class Background3D {
    constructor() {
        this.container = document.getElementById('background-canvas');
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.objects = [];
        this.stars = [];
        this.mouse = { x: 0, y: 0 };

        this.init();
    }

    init() {
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setClearColor(0x000000, 0.9);
        this.container.appendChild(this.renderer.domElement);

        this.camera.position.z = 30;

        // Enhanced lighting for crystal effects
        const ambientLight = new THREE.AmbientLight(0x1a001a);
        const directionalLight = new THREE.DirectionalLight(0xff0066, 1);
        const pointLight1 = new THREE.PointLight(0x8800ff, 2, 50);
        const pointLight2 = new THREE.PointLight(0xff0044, 2, 50);

        pointLight1.position.set(20, 20, 20);
        pointLight2.position.set(-20, -20, 20);
        
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
        this.scene.add(pointLight1);
        this.scene.add(pointLight2);

        this.createCelestialObjects();
        this.createStarfield();

        window.addEventListener('resize', () => this.onWindowResize());
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        this.animate();
    }

    createCrystalGeometry() {
        // Custom crystal geometry
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([
            0, 2, 0,    // top
            -1, 0, 1,   // bottom corners
            1, 0, 1,
            1, 0, -1,
            -1, 0, -1,
            0, -2, 0    // bottom point
        ]);

        const indices = new Uint16Array([
            0, 1, 2,    // faces
            0, 2, 3,
            0, 3, 4,
            0, 4, 1,
            5, 1, 2,
            5, 2, 3,
            5, 3, 4,
            5, 4, 1
        ]);

        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setIndex(new THREE.BufferAttribute(indices, 1));
        geometry.computeVertexNormals();

        return geometry;
    }

    createCelestialObjects() {
        // Crystal material with special effects
        const crystalMaterial = new THREE.MeshPhysicalMaterial({
            color: 0xff0066,
            metalness: 0.9,
            roughness: 0.1,
            transparent: true,
            opacity: 0.8,
            side: THREE.DoubleSide,
            transmission: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.1
        });

        // Planet-like material
        const planetMaterial = new THREE.MeshPhysicalMaterial({
            color: 0x8800ff,
            metalness: 0.5,
            roughness: 0.5,
            transparent: true,
            opacity: 0.9
        });

        const geometries = [
            this.createCrystalGeometry(),
            new THREE.SphereGeometry(1, 32, 32),
            new THREE.OctahedronGeometry(1, 0),
            new THREE.IcosahedronGeometry(1, 0)
        ];

        // Create celestial objects
        for (let i = 0; i < 40; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = Math.random() > 0.5 ? crystalMaterial : planetMaterial;
            const mesh = new THREE.Mesh(geometry, material.clone());

            // Spiral distribution
            const radius = Math.random() * 40 + 10;
            const angle = i * 0.5;
            const height = (Math.random() - 0.5) * 20;

            mesh.position.x = Math.cos(angle) * radius;
            mesh.position.y = height;
            mesh.position.z = Math.sin(angle) * radius;

            // Random rotation
            mesh.rotation.x = Math.random() * Math.PI;
            mesh.rotation.y = Math.random() * Math.PI;
            mesh.rotation.z = Math.random() * Math.PI;

            // Varied scale
            const scale = Math.random() * 1.5 + 0.5;
            mesh.scale.set(scale, scale, scale);

            this.objects.push({
                mesh,
                initialPosition: mesh.position.clone(),
                rotationSpeed: {
                    x: (Math.random() - 0.5) * 0.01,
                    y: (Math.random() - 0.5) * 0.01,
                    z: (Math.random() - 0.5) * 0.01
                },
                orbitRadius: radius,
                orbitSpeed: Math.random() * 0.001,
                orbitOffset: angle,
                pulseSpeed: Math.random() * 0.02 + 0.01
            });

            this.scene.add(mesh);
        }
    }

    createStarfield() {
        const starsGeometry = new THREE.BufferGeometry();
        const starsMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 0.1,
            transparent: true,
            opacity: 0.8
        });

        const starsVertices = [];
        for (let i = 0; i < 2000; i++) {
            const x = (Math.random() - 0.5) * 2000;
            const y = (Math.random() - 0.5) * 2000;
            const z = (Math.random() - 0.5) * 2000;
            starsVertices.push(x, y, z);
        }

        starsGeometry.setAttribute('position', 
            new THREE.Float32BufferAttribute(starsVertices, 3));
        
        const starField = new THREE.Points(starsGeometry, starsMaterial);
        this.scene.add(starField);
        this.stars = starField;
    }

    onMouseMove(event) {
        this.mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        this.mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        const time = Date.now() * 0.001;

        this.objects.forEach(obj => {
            // Rotation
            obj.mesh.rotation.x += obj.rotationSpeed.x;
            obj.mesh.rotation.y += obj.rotationSpeed.y;
            obj.mesh.rotation.z += obj.rotationSpeed.z;

            // Orbital movement
            const orbit = time * obj.orbitSpeed + obj.orbitOffset;
            obj.mesh.position.x = Math.cos(orbit) * obj.orbitRadius;
            obj.mesh.position.z = Math.sin(orbit) * obj.orbitRadius;

            // Floating effect
            obj.mesh.position.y = obj.initialPosition.y + 
                Math.sin(time * obj.pulseSpeed) * 2;

            // Mouse interaction
            obj.mesh.position.x += this.mouse.x * 0.5;
            obj.mesh.position.y += this.mouse.y * 0.5;
        });

        // Rotate starfield
        if (this.stars) {
            this.stars.rotation.y += 0.0001;
        }

        // Camera movement
        this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.05;
        this.camera.position.y += (this.mouse.y * 5 - this.camera.position.y) * 0.05;
        this.camera.lookAt(this.scene.position);

        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    const background = new Background3D();
});

