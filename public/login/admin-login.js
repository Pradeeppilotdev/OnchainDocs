// Admin Login Verification
document.addEventListener('DOMContentLoaded', function() {
    // Initialize 3D Background
    class Background3D {
        constructor() {
            this.container = document.body;
            this.scene = new THREE.Scene();
            this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
            this.objects = [];
            this.particles = [];
            this.mouse = { x: 0, y: 0 };

            this.init();
        }

        init() {
            this.renderer.setSize(window.innerWidth, window.innerHeight);
            this.renderer.setPixelRatio(window.devicePixelRatio);
            this.renderer.setClearColor(0x000000, 0);
            this.container.insertBefore(this.renderer.domElement, this.container.firstChild);

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

            this.createCrystals();
            this.createParticles();

            window.addEventListener('resize', () => this.onWindowResize());
            document.addEventListener('mousemove', (e) => this.onMouseMove(e));

            this.animate();
        }

        createCrystalGeometry() {
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

        createCrystals() {
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

            for (let i = 0; i < 20; i++) {
                const geometry = this.createCrystalGeometry();
                const mesh = new THREE.Mesh(geometry, crystalMaterial.clone());

                const radius = Math.random() * 40 + 10;
                const angle = i * 0.5;
                const height = (Math.random() - 0.5) * 20;

                mesh.position.x = Math.cos(angle) * radius;
                mesh.position.y = height;
                mesh.position.z = Math.sin(angle) * radius;

                mesh.rotation.x = Math.random() * Math.PI;
                mesh.rotation.y = Math.random() * Math.PI;
                mesh.rotation.z = Math.random() * Math.PI;

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

        createParticles() {
            const particlesGeometry = new THREE.BufferGeometry();
            const particlesCount = 2000;
            const posArray = new Float32Array(particlesCount * 3);

            for (let i = 0; i < particlesCount * 3; i++) {
                posArray[i] = (Math.random() - 0.5) * 100;
            }

            particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

            const particlesMaterial = new THREE.PointsMaterial({
                size: 0.1,
                color: 0x8a2be2,
                transparent: true,
                opacity: 0.8,
                blending: THREE.AdditiveBlending
            });

            const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
            this.scene.add(particlesMesh);
            this.particles.push(particlesMesh);
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
                obj.mesh.rotation.x += obj.rotationSpeed.x;
                obj.mesh.rotation.y += obj.rotationSpeed.y;
                obj.mesh.rotation.z += obj.rotationSpeed.z;

                const orbit = time * obj.orbitSpeed + obj.orbitOffset;
                obj.mesh.position.x = Math.cos(orbit) * obj.orbitRadius;
                obj.mesh.position.z = Math.sin(orbit) * obj.orbitRadius;

                obj.mesh.position.y = obj.initialPosition.y + 
                    Math.sin(time * obj.pulseSpeed) * 2;

                obj.mesh.position.x += this.mouse.x * 0.5;
                obj.mesh.position.y += this.mouse.y * 0.5;
            });

            this.particles.forEach(particle => {
                particle.rotation.y += 0.0001;
            });

            this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.05;
            this.camera.position.y += (this.mouse.y * 5 - this.camera.position.y) * 0.05;
            this.camera.lookAt(this.scene.position);

            this.renderer.render(this.scene, this.camera);
        }
    }

    // Initialize 3D background
    const background = new Background3D();

    // Get form elements
    const loginForm = document.querySelector('form');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const loginButton = document.querySelector('.btn');

    // Admin credentials (in a real application, these would be verified against a database)
    const ADMIN_EMAIL = "admin@blocksmiths.com";
    const ADMIN_PASSWORD = "Admin@123";

    // Form submission handler
    loginForm.addEventListener('submit', function(event) {
        event.preventDefault();
        
        // Get input values
        const email = emailInput.value.trim();
        const password = passwordInput.value;
        
        // Validate inputs
        if (!email || !password) {
            showMessage('Please enter both email and password', 'error');
            return;
        }
        
        // Show loading state
        loginButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifying...';
        loginButton.disabled = true;
        
        // Simulate server verification delay (remove in production)
        setTimeout(() => {
            // Check if credentials match
            if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Credentials are correct
                showMessage('Login successful! Redirecting to dashboard...', 'success');
                
                // Store admin session in localStorage
                localStorage.setItem('adminLoggedIn', 'true');
                localStorage.setItem('adminEmail', email);
                localStorage.setItem('adminLoginTime', new Date().toISOString());
                
                // Redirect to admin dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '../admin/superuser.html';
                }, 1500);
            } else {
                // Credentials are incorrect
                showMessage('Invalid email or password', 'error');
                
                // Reset button state
                loginButton.textContent = 'LOGIN';
                loginButton.disabled = false;
                
                // Clear password field
                passwordInput.value = '';
                passwordInput.focus();
            }
        }, 1000);
    });
    
    // Function to show message (success or error)
    function showMessage(message, type) {
        // Remove any existing messages
        const existingMessage = document.querySelector('.message');
        if (existingMessage) {
            existingMessage.remove();
        }
        
        // Create message element
        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.textContent = message;
        
        // Style based on message type
        if (type === 'error') {
            messageElement.style.color = '#ff6b6b';
        } else {
            messageElement.style.color = '#10b981';
        }
        
        messageElement.style.marginTop = '15px';
        messageElement.style.textAlign = 'center';
        messageElement.style.width = '90%';
        
        // Insert message before the button container
        const buttonContainer = loginButton.parentNode;
        loginForm.insertBefore(messageElement, buttonContainer);
    }
    
    // Check if admin is already logged in
    
}); 