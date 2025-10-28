// uiscript.js - Fixed Login Script

const API_URL = 'http://localhost/keuangangenz/api';

// Handle Login Form Submit
async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const submitBtn = document.getElementById('loginBtn') || 
                      event.target.querySelector('button[type="submit"]') ||
                      event.target.querySelector('.login-button');
    
    const successMsg = document.getElementById('successMessage');
    
    if (!username || !password) {
        alert('Username dan Password harus diisi!');
        return;
    }
    
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Loading...';
    }
    
    try {
        const response = await fetch(`${API_URL}/login.php`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({
                username: username,
                password: password
            })
        });
        
        const responseText = await response.text();
        console.log('Response:', responseText);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}. Periksa file login.php untuk error.`);
        }
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch (parseError) {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                result = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('Response tidak valid dari server. Periksa error di file login.php');
            }
        }
        
        if (result.status === 'success') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', result.user.id_user);
            localStorage.setItem('username', result.user.username);
            localStorage.setItem('namaLengkap', result.user.nama_lengkap);
            
            if (successMsg) {
                successMsg.classList.add('show');
            }
            
            setTimeout(() => {
                window.location.replace('home.html');
            }, 800);
            
        } else {
            alert(result.message || 'Login gagal. Silakan coba lagi.');
            
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Log in';
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
        alert('Terjadi kesalahan: ' + error.message);
        
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Log in';
        }
    }
}

function closeLogin() {
    const container = document.querySelector('.login-container');
    if (!container) return;
    
    container.style.transform = 'scale(0.8)';
    container.style.opacity = '0';
    
    setTimeout(() => {
        if (confirm('Yakin ingin menutup halaman login?')) {
            window.close();
        } else {
            container.style.transform = 'scale(1)';
            container.style.opacity = '1';
        }
    }, 300);
}

document.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            event.preventDefault();
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});

console.log('✅ Login script loaded');