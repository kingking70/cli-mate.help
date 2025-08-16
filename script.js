// Simple JavaScript for cli-mate.help
document.addEventListener('DOMContentLoaded', function() {
    console.log('cli-mate.help loaded');
    
    // Add a simple welcome message
    const content = document.querySelector('.content');
    if (content) {
        const welcomeMsg = document.createElement('p');
        welcomeMsg.textContent = 'Welcome to cli-mate.help - your tech assistant!';
        welcomeMsg.style.marginTop = '20px';
        welcomeMsg.style.fontStyle = 'italic';
        content.appendChild(welcomeMsg);
    }
});
